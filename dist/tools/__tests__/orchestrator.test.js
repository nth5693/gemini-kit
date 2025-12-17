/**
 * Orchestrator Engine Tests
 * Tests for workflow orchestration, team management, and routing
 */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
// Mock team-state module
vi.mock('../team-state.js', () => ({
    startSession: vi.fn(),
    getCurrentSession: vi.fn(),
    addAgentResult: vi.fn(),
    updateContext: vi.fn(),
    getContext: vi.fn(),
    incrementRetry: vi.fn(),
    canRetry: vi.fn(),
    endSession: vi.fn(),
    getSessionSummary: vi.fn(),
    listSessions: vi.fn(),
    initTeamState: vi.fn(),
}));
// Mock workflows module
vi.mock('../workflows.js', () => ({
    getWorkflow: vi.fn(),
    listWorkflows: vi.fn(),
    autoSelectWorkflow: vi.fn(),
    getStepPrompt: vi.fn(),
}));
describe('Orchestrator', () => {
    let orchestrator;
    let teamState;
    let workflows;
    beforeEach(async () => {
        vi.clearAllMocks();
        // Import modules fresh for each test
        orchestrator = await import('../orchestrator.js');
        teamState = await import('../team-state.js');
        workflows = await import('../workflows.js');
        // Setup default mocks
        vi.mocked(workflows.listWorkflows).mockReturnValue([
            { name: 'cook', description: 'Full workflow' },
            { name: 'quickfix', description: 'Quick bug fix' },
        ]);
        vi.mocked(workflows.autoSelectWorkflow).mockReturnValue({
            name: 'cook',
            description: 'Full development workflow',
            autoRetry: true,
            maxRetries: 3,
            steps: [
                { agent: 'planner', description: 'Create plan', required: true },
                { agent: 'coder', description: 'Write code', required: true },
            ],
        });
        vi.mocked(workflows.getStepPrompt).mockReturnValue('Test prompt');
    });
    afterEach(() => {
        vi.resetModules();
    });
    describe('initOrchestrator', () => {
        it('should initialize with default config', () => {
            orchestrator.initOrchestrator();
            expect(teamState.initTeamState).toHaveBeenCalledWith({ maxRetries: 3 });
        });
        it('should merge custom config with defaults', () => {
            orchestrator.initOrchestrator({ maxRetries: 5, verbose: true });
            expect(teamState.initTeamState).toHaveBeenCalledWith({ maxRetries: 5 });
        });
    });
    describe('teamStart', () => {
        it('should create a new session with goal', () => {
            const mockSession = {
                id: 'session-123',
                name: 'Test Session',
                status: 'active',
                goal: 'Build feature',
                agents: [],
                context: {},
                retryCount: 0,
                maxRetries: 3,
                startTime: new Date().toISOString(),
            };
            vi.mocked(teamState.startSession).mockReturnValue(mockSession);
            const result = orchestrator.teamStart('Build feature');
            expect(result.success).toBe(true);
            expect(result.session).toEqual(mockSession);
            expect(teamState.startSession).toHaveBeenCalledWith('Build feature', undefined);
        });
        it('should suggest correct workflow based on goal', () => {
            const mockSession = {
                id: 'session-123',
                name: 'Test',
                status: 'active',
                goal: 'Fix bug',
                agents: [],
                context: {},
                retryCount: 0,
                maxRetries: 3,
                startTime: new Date().toISOString(),
            };
            vi.mocked(teamState.startSession).mockReturnValue(mockSession);
            vi.mocked(workflows.autoSelectWorkflow).mockReturnValue({
                name: 'quickfix',
                description: 'Quick fix',
                autoRetry: true,
                maxRetries: 3,
                steps: [],
            });
            const result = orchestrator.teamStart('Fix bug');
            expect(result.suggestedWorkflow).toBe('quickfix');
        });
        it('should return all available workflows', () => {
            const mockSession = {
                id: 'session-123',
                name: 'Test',
                status: 'active',
                goal: 'Test',
                agents: [],
                context: {},
                retryCount: 0,
                maxRetries: 3,
                startTime: new Date().toISOString(),
            };
            vi.mocked(teamState.startSession).mockReturnValue(mockSession);
            const result = orchestrator.teamStart('Test goal');
            expect(result.allWorkflows).toHaveLength(2);
            expect(result.allWorkflows[0].name).toBe('cook');
        });
    });
    describe('teamStatus', () => {
        it('should return hasSession=true when session exists', () => {
            vi.mocked(teamState.getCurrentSession).mockReturnValue({
                id: 'session-123',
                name: 'Test',
                status: 'active',
                goal: 'Test',
                agents: [],
                context: {},
                retryCount: 0,
                maxRetries: 3,
                startTime: new Date().toISOString(),
            });
            vi.mocked(teamState.getSessionSummary).mockReturnValue('Session summary');
            const result = orchestrator.teamStatus();
            expect(result.hasSession).toBe(true);
            expect(result.session).not.toBeNull();
        });
        it('should return hasSession=false when no session', () => {
            vi.mocked(teamState.getCurrentSession).mockReturnValue(null);
            vi.mocked(teamState.getSessionSummary).mockReturnValue('No active session');
            const result = orchestrator.teamStatus();
            expect(result.hasSession).toBe(false);
            expect(result.session).toBeNull();
        });
    });
    describe('teamEnd', () => {
        it('should end session with completed status', () => {
            const mockSession = {
                id: 'session-123',
                name: 'Test',
                status: 'completed',
                goal: 'Test',
                agents: [],
                context: {},
                retryCount: 0,
                maxRetries: 3,
                startTime: new Date().toISOString(),
                endTime: new Date().toISOString(),
            };
            vi.mocked(teamState.endSession).mockReturnValue(mockSession);
            vi.mocked(teamState.getSessionSummary).mockReturnValue('Completed');
            const result = orchestrator.teamEnd('completed');
            expect(result.success).toBe(true);
            expect(result.session?.status).toBe('completed');
        });
        it('should return success=false when no active session', () => {
            vi.mocked(teamState.endSession).mockReturnValue(null);
            const result = orchestrator.teamEnd();
            expect(result.success).toBe(false);
            expect(result.summary).toBe('No active session to end');
        });
    });
    describe('executeStep', () => {
        it('should create AgentResult with pending status', () => {
            vi.mocked(teamState.getCurrentSession).mockReturnValue({
                id: 'session-123',
                name: 'Test',
                status: 'active',
                goal: 'Test',
                agents: [],
                context: { foo: 'bar' },
                retryCount: 0,
                maxRetries: 3,
                startTime: new Date().toISOString(),
            });
            const step = { agent: 'coder', description: 'Write code', required: true };
            const result = orchestrator.executeStep(step, 'Build feature');
            expect(result.agent).toBe('coder');
            expect(result.status).toBe('pending');
        });
        it('should add result to session', () => {
            vi.mocked(teamState.getCurrentSession).mockReturnValue({
                id: 'session-123',
                name: 'Test',
                status: 'active',
                goal: 'Test',
                agents: [],
                context: {},
                retryCount: 0,
                maxRetries: 3,
                startTime: new Date().toISOString(),
            });
            const step = { agent: 'tester', description: 'Write tests', required: true };
            orchestrator.executeStep(step, 'Test task');
            expect(teamState.addAgentResult).toHaveBeenCalled();
        });
    });
    describe('runWorkflow', () => {
        it('should return success with workflow steps', () => {
            const mockWorkflow = {
                name: 'cook',
                description: 'Full workflow',
                autoRetry: true,
                maxRetries: 3,
                steps: [
                    { agent: 'planner', description: 'Plan', required: true },
                    { agent: 'coder', description: 'Code', required: true },
                ],
            };
            vi.mocked(workflows.getWorkflow).mockReturnValue(mockWorkflow);
            vi.mocked(teamState.getCurrentSession).mockReturnValue({
                id: 'session-123',
                name: 'Test',
                status: 'active',
                goal: 'Test',
                agents: [],
                context: {},
                retryCount: 0,
                maxRetries: 3,
                startTime: new Date().toISOString(),
            });
            const result = orchestrator.runWorkflow('cook', 'Build feature');
            expect(result.success).toBe(true);
            expect(result.workflow).toEqual(mockWorkflow);
            expect(result.steps).toHaveLength(2);
        });
        it('should return error for non-existent workflow', () => {
            vi.mocked(workflows.getWorkflow).mockReturnValue(undefined);
            const result = orchestrator.runWorkflow('nonexistent', 'Test');
            expect(result.success).toBe(false);
            expect(result.message).toContain('not found');
        });
    });
    describe('smartRoute', () => {
        it('should return high confidence for matching keywords', () => {
            vi.mocked(workflows.autoSelectWorkflow).mockReturnValue({
                name: 'quickfix',
                description: 'Quick fix',
                autoRetry: true,
                maxRetries: 3,
                steps: [],
            });
            const result = orchestrator.smartRoute('fix this bug');
            expect(result.workflow.name).toBe('quickfix');
            expect(result.confidence).toBeGreaterThanOrEqual(0.5);
        });
        it('should return alternative workflows', () => {
            vi.mocked(workflows.autoSelectWorkflow).mockReturnValue({
                name: 'cook',
                description: 'Full workflow',
                autoRetry: true,
                maxRetries: 3,
                steps: [],
            });
            const result = orchestrator.smartRoute('do something');
            expect(result.alternativeWorkflows).toContain('quickfix');
            expect(result.alternativeWorkflows).not.toContain('cook');
        });
    });
    describe('handleStepFailure', () => {
        it('should return abort when no active session', () => {
            vi.mocked(teamState.getCurrentSession).mockReturnValue(null);
            const step = { agent: 'coder', description: 'Code', required: true };
            const result = orchestrator.handleStepFailure(step, 'Error');
            expect(result.action).toBe('abort');
            expect(result.canRetry).toBe(false);
        });
        it('should return retry when can retry and onFailure is retry', () => {
            vi.mocked(teamState.getCurrentSession).mockReturnValue({
                id: 'session-123',
                name: 'Test',
                status: 'active',
                goal: 'Test',
                agents: [],
                context: {},
                retryCount: 0,
                maxRetries: 3,
                startTime: new Date().toISOString(),
            });
            vi.mocked(teamState.canRetry).mockReturnValue(true);
            vi.mocked(teamState.incrementRetry).mockReturnValue(1);
            const step = { agent: 'coder', description: 'Code', required: true, onFailure: 'retry' };
            const result = orchestrator.handleStepFailure(step, 'Error');
            expect(result.action).toBe('retry');
            expect(result.canRetry).toBe(true);
            expect(result.retryCount).toBe(1);
        });
    });
});
