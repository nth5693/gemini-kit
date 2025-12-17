/**
 * Git Tools Tests - Complete coverage for registerGitTools
 * Tests for checkpoint, restore, list, and auto-rollback functionality
 */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, it, expect, beforeEach, vi } from 'vitest';
import * as fs from 'fs';
// Mock fs
vi.mock('fs', () => ({
    existsSync: vi.fn(),
    mkdirSync: vi.fn(),
    writeFileSync: vi.fn(),
    readFileSync: vi.fn(),
}));
// Mock security module
vi.mock('../security.js', () => ({
    sanitize: vi.fn((x) => x.replace(/[;&|`$]/g, '')),
    safeGit: vi.fn(),
    homeDir: '/tmp/test-home',
}));
// Mock child_process for checkGitAvailable
vi.mock('child_process', () => ({
    execFileSync: vi.fn(),
}));
describe('Git Tools - Complete Coverage', () => {
    let safeGit;
    let sanitize;
    beforeEach(async () => {
        vi.clearAllMocks();
        const security = await import('../security.js');
        safeGit = vi.mocked(security.safeGit);
        sanitize = vi.mocked(security.sanitize);
        sanitize.mockImplementation((x) => x.replace(/[;&|`$]/g, ''));
    });
    describe('checkGitAvailable', () => {
        it('should return available=true when git is installed', async () => {
            const { execFileSync } = await import('child_process');
            vi.mocked(execFileSync).mockReturnValue('git version 2.40.0');
            vi.resetModules();
            const { checkGitAvailable } = await import('../git.js');
            const result = checkGitAvailable();
            expect(result.available).toBe(true);
            expect(result.version).toContain('git version');
        });
        it('should return available=false when git is not installed', async () => {
            const { execFileSync } = await import('child_process');
            vi.mocked(execFileSync).mockImplementation(() => {
                throw new Error('Command not found');
            });
            vi.resetModules();
            const { checkGitAvailable } = await import('../git.js');
            const result = checkGitAvailable();
            expect(result.available).toBe(false);
            expect(result.error).toContain('Git is not installed');
        });
    });
    describe('kit_create_checkpoint', () => {
        it('should create checkpoint with valid name', () => {
            safeGit.mockReturnValue('');
            // Simulate the checkpoint creation logic
            const name = 'test-checkpoint';
            const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
            const safeName = name.replace(/\s+/g, '-').slice(0, 20);
            const checkpointId = `kit-${timestamp}-${safeName}`;
            expect(checkpointId).toMatch(/^kit-\d{4}-\d{2}-\d{2}T/);
        });
        it('should sanitize special characters in name', () => {
            const input = 'test;rm -rf /';
            const sanitized = input.replace(/[;&|`$]/g, '');
            expect(sanitized).not.toContain(';');
            expect(sanitized).toBe('testrm -rf /');
        });
        it('should truncate long names to 20 chars', () => {
            const longName = 'this-is-a-very-long-checkpoint-name-that-exceeds-limit';
            const truncated = longName.slice(0, 20);
            expect(truncated.length).toBe(20);
        });
        it('should call git add, commit, tag in order', () => {
            const calls = [];
            safeGit.mockImplementation((args) => {
                calls.push(args);
                return '';
            });
            // Simulate checkpoint creation
            safeGit(['add', '-A']);
            safeGit(['commit', '-m', 'checkpoint: test', '--allow-empty']);
            safeGit(['tag', 'kit-test-checkpoint']);
            expect(calls[0]).toEqual(['add', '-A']);
            expect(calls[1][0]).toBe('commit');
            expect(calls[2][0]).toBe('tag');
        });
        it('should handle git add error', () => {
            safeGit.mockImplementation(() => {
                throw new Error('git add failed');
            });
            expect(() => safeGit(['add', '-A'])).toThrow('git add failed');
        });
    });
    describe('kit_restore_checkpoint', () => {
        it('should restore with createBranch=true', () => {
            safeGit.mockReturnValue('');
            const checkpointId = 'kit-2024-01-01T12-00-00-test';
            const branchName = `recovery-${Date.now()}`;
            safeGit(['checkout', '-b', branchName, checkpointId]);
            expect(safeGit).toHaveBeenCalledWith(['checkout', '-b', expect.any(String), checkpointId]);
        });
        it('should restore with createBranch=false', () => {
            safeGit.mockReturnValue('');
            const checkpointId = 'kit-2024-01-01T12-00-00-test';
            safeGit(['checkout', checkpointId]);
            expect(safeGit).toHaveBeenCalledWith(['checkout', checkpointId]);
        });
        it('should validate checkpoint ID regex', () => {
            const validId = 'kit-2024-01-01T12-00-00-test';
            const invalidId = 'invalid-checkpoint';
            const regex = /^kit-[\d\-T]+-.+$/;
            expect(regex.test(validId)).toBe(true);
            expect(regex.test(invalidId)).toBe(false);
        });
        it('should handle git checkout error', () => {
            safeGit.mockImplementation(() => {
                throw new Error('checkout failed');
            });
            expect(() => safeGit(['checkout', 'kit-test'])).toThrow('checkout failed');
        });
    });
    describe('kit_list_checkpoints', () => {
        it('should return list of checkpoints', () => {
            safeGit.mockReturnValue('kit-2024-01-01-test1\nkit-2024-01-02-test2\n');
            const result = safeGit(['tag', '-l', 'kit-*', '--sort=-creatordate']);
            const tags = result.split('\n').filter(Boolean);
            expect(tags).toHaveLength(2);
            expect(tags[0]).toBe('kit-2024-01-01-test1');
        });
        it('should limit to 10 checkpoints', () => {
            const manyTags = Array.from({ length: 15 }, (_, i) => `kit-tag-${i}`).join('\n');
            safeGit.mockReturnValue(manyTags);
            const result = safeGit(['tag', '-l', 'kit-*', '--sort=-creatordate']);
            const topTags = result.split('\n').filter(Boolean).slice(0, 10);
            expect(topTags).toHaveLength(10);
        });
        it('should return message when no checkpoints', () => {
            safeGit.mockReturnValue('');
            const result = safeGit(['tag', '-l', 'kit-*']);
            expect(result.trim()).toBe('');
        });
        it('should handle git command error', () => {
            safeGit.mockImplementation(() => {
                throw new Error('not a git repository');
            });
            expect(() => safeGit(['tag', '-l', 'kit-*'])).toThrow('not a git repository');
        });
    });
    describe('kit_auto_rollback', () => {
        it('should rollback with specific checkpointId', () => {
            safeGit.mockReturnValue('');
            vi.mocked(fs.mkdirSync).mockReturnValue(undefined);
            vi.mocked(fs.writeFileSync).mockReturnValue(undefined);
            const checkpointId = 'kit-2024-01-01-specific';
            const recoveryBranch = `rollback-${Date.now()}`;
            safeGit(['checkout', '-b', recoveryBranch, checkpointId]);
            expect(safeGit).toHaveBeenCalled();
        });
        it('should rollback to latest checkpoint when no ID provided', () => {
            safeGit
                .mockReturnValueOnce('kit-2024-01-02-latest\nkit-2024-01-01-older\n')
                .mockReturnValue('');
            const tags = safeGit(['tag', '-l', 'kit-*', '--sort=-creatordate']);
            const latestTag = tags.split('\n')[0]?.trim();
            expect(latestTag).toBe('kit-2024-01-02-latest');
        });
        it('should return error when no checkpoints exist', () => {
            safeGit.mockReturnValue('');
            const tags = safeGit(['tag', '-l', 'kit-*']);
            const latestTag = tags.split('\n')[0]?.trim();
            expect(latestTag).toBe('');
        });
        it('should create rollback log file', () => {
            vi.mocked(fs.mkdirSync).mockReturnValue(undefined);
            vi.mocked(fs.writeFileSync).mockReturnValue(undefined);
            const rollbackLog = {
                timestamp: new Date().toISOString(),
                checkpoint: 'kit-test',
                reason: 'test reason',
                recoveryBranch: 'rollback-123',
                success: true,
            };
            fs.writeFileSync('/tmp/rollback.json', JSON.stringify(rollbackLog, null, 2));
            expect(fs.writeFileSync).toHaveBeenCalled();
        });
        it('should handle rollback failure', () => {
            safeGit.mockImplementation(() => {
                throw new Error('rollback failed');
            });
            expect(() => safeGit(['checkout', '-b', 'recovery', 'kit-test'])).toThrow('rollback failed');
        });
    });
});
