/**
 * Team State Tests
 * Tests for session management, context, and persistence
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import * as fs from 'fs';

// Mock fs module
vi.mock('fs', () => ({
    existsSync: vi.fn(),
    mkdirSync: vi.fn(),
    readFileSync: vi.fn(),
    writeFileSync: vi.fn(),
    readdirSync: vi.fn(),
}));

// Mock path module  
vi.mock('path', () => ({
    join: vi.fn((...args: string[]) => args.join('/')),
}));

// Mock utils
vi.mock('../../utils.js', () => ({
    debounce: vi.fn((fn: () => void) => fn),
}));

describe('Team State', () => {
    let teamState: typeof import('../team-state.js');

    beforeEach(async () => {
        vi.clearAllMocks();
        vi.resetModules();

        // Default mocks
        vi.mocked(fs.existsSync).mockReturnValue(true);
        vi.mocked(fs.readdirSync).mockReturnValue([]);

        // Import fresh module
        teamState = await import('../team-state.js');
    });

    afterEach(() => {
        vi.resetModules();
    });

    describe('initTeamState', () => {
        it('should create session directory if not exists', () => {
            vi.mocked(fs.existsSync).mockReturnValue(false);

            teamState.initTeamState();

            expect(fs.mkdirSync).toHaveBeenCalledWith(
                expect.stringContaining('sessions'),
                { recursive: true }
            );
        });

        it('should use custom config when provided', () => {
            teamState.initTeamState({ maxRetries: 5 });

            const session = teamState.startSession('Test goal');
            expect(session.maxRetries).toBe(5);
        });
    });

    describe('startSession', () => {
        it('should create session with unique id', () => {
            const session1 = teamState.startSession('Goal 1');

            // Reset and create another
            vi.resetModules();

            // Session ID format: session-{timestamp}-{uuid-prefix}
            expect(session1.id).toMatch(/^session-\d+-[a-f0-9]{8}$/);
        });

        it('should set status to active', () => {
            const session = teamState.startSession('Test goal');

            expect(session.status).toBe('active');
            expect(session.goal).toBe('Test goal');
        });

        it('should initialize empty agents and context', () => {
            const session = teamState.startSession('Test goal');

            expect(session.agents).toEqual([]);
            expect(session.context).toEqual({});
            expect(session.retryCount).toBe(0);
        });
    });

    describe('getCurrentSession', () => {
        it('should return current session after start', () => {
            teamState.startSession('Test goal');
            const session = teamState.getCurrentSession();

            expect(session).not.toBeNull();
            expect(session?.goal).toBe('Test goal');
        });

        it('should return null when no session', async () => {
            // Fresh import with no session started
            vi.resetModules();
            const freshState = await import('../team-state.js');

            const session = freshState.getCurrentSession();
            expect(session).toBeNull();
        });
    });

    describe('addAgentResult', () => {
        it('should add result to session agents array', () => {
            teamState.startSession('Test goal');

            teamState.addAgentResult({
                agent: 'coder',
                status: 'success',
                output: 'Code written',
                timestamp: new Date().toISOString(),
            });

            const session = teamState.getCurrentSession();
            expect(session?.agents).toHaveLength(1);
            expect(session?.agents[0].agent).toBe('coder');
        });

        it('should throw error when no session', async () => {
            vi.resetModules();
            const freshState = await import('../team-state.js');

            expect(() => {
                freshState.addAgentResult({
                    agent: 'coder',
                    status: 'success',
                    output: 'Test',
                    timestamp: new Date().toISOString(),
                });
            }).toThrow('No active session');
        });
    });

    describe('updateContext / getContext', () => {
        it('should update and retrieve context values', () => {
            teamState.startSession('Test goal');

            teamState.updateContext('plan', 'Step 1, Step 2');
            const value = teamState.getContext('plan');

            expect(value).toBe('Step 1, Step 2');
        });

        it('should return undefined for non-existent key', () => {
            teamState.startSession('Test goal');

            const value = teamState.getContext('nonexistent');
            expect(value).toBeUndefined();
        });

        it('should throw error when updating without session', async () => {
            vi.resetModules();
            const freshState = await import('../team-state.js');

            expect(() => {
                freshState.updateContext('key', 'value');
            }).toThrow('No active session');
        });
    });

    describe('incrementRetry / canRetry', () => {
        it('should increment retry count', () => {
            teamState.startSession('Test goal');

            const count = teamState.incrementRetry();
            expect(count).toBe(1);

            const count2 = teamState.incrementRetry();
            expect(count2).toBe(2);
        });

        it('should return true when can retry', () => {
            teamState.startSession('Test goal');

            expect(teamState.canRetry()).toBe(true);
        });

        it('should return false when max retries reached', () => {
            teamState.initTeamState({ maxRetries: 2 });
            teamState.startSession('Test goal');

            teamState.incrementRetry(); // 1
            teamState.incrementRetry(); // 2

            expect(teamState.canRetry()).toBe(false);
        });
    });

    describe('endSession', () => {
        it('should end session with completed status', () => {
            teamState.startSession('Test goal');
            const session = teamState.endSession('completed');

            expect(session?.status).toBe('completed');
            expect(session?.endTime).toBeDefined();
        });

        it('should end session with failed status', () => {
            teamState.startSession('Test goal');
            const session = teamState.endSession('failed');

            expect(session?.status).toBe('failed');
        });

        it('should return null when no session', async () => {
            vi.resetModules();
            const freshState = await import('../team-state.js');

            const session = freshState.endSession();
            expect(session).toBeNull();
        });

        it('should clear current session after end', () => {
            teamState.startSession('Test goal');
            teamState.endSession();

            const session = teamState.getCurrentSession();
            expect(session).toBeNull();
        });
    });

    describe('getSessionSummary', () => {
        it('should return summary for active session', () => {
            teamState.startSession('Test goal', 'My Session');
            teamState.addAgentResult({
                agent: 'planner',
                status: 'success',
                output: 'Plan created',
                timestamp: new Date().toISOString(),
                duration: 100,
            });

            const summary = teamState.getSessionSummary();

            expect(summary).toContain('My Session');
            expect(summary).toContain('Test goal');
            expect(summary).toContain('planner');
        });

        it('should return message when no session', async () => {
            vi.resetModules();
            const freshState = await import('../team-state.js');

            const summary = freshState.getSessionSummary();
            expect(summary).toBe('No active session');
        });
    });
});
