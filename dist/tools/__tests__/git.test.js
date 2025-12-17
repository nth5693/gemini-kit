/**
 * Git Tools Tests
 * Tests for checkpoint and rollback functionality
 */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, it, expect } from 'vitest';
describe('Git Tools', () => {
    describe('checkGitAvailable', () => {
        it('should return available status', async () => {
            const { checkGitAvailable } = await import('../git.js');
            const result = checkGitAvailable();
            // Git should be available in test environment
            expect(result).toHaveProperty('available');
            expect(typeof result.available).toBe('boolean');
        });
        it('should return version when available', async () => {
            const { checkGitAvailable } = await import('../git.js');
            const result = checkGitAvailable();
            if (result.available) {
                expect(result.version).toBeDefined();
                expect(result.version).toContain('git version');
            }
        });
    });
    describe('safeGit helper', () => {
        it('should execute valid git commands', async () => {
            const { safeGit } = await import('../security.js');
            // This should work in any git repo
            const result = safeGit(['rev-parse', '--is-inside-work-tree']);
            expect(result.trim()).toBe('true');
        });
        it('should throw on invalid git commands', async () => {
            const { safeGit } = await import('../security.js');
            expect(() => safeGit(['invalid-command-12345'])).toThrow();
        });
        it('should handle git log command', async () => {
            const { safeGit } = await import('../security.js');
            const result = safeGit(['log', '--oneline', '-1']);
            expect(result).toBeDefined();
            expect(typeof result).toBe('string');
        });
    });
});
