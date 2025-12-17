/**
 * Git Registration Tests - Test registerGitTools with mocked MCP server
 * This tests the actual registration code to achieve full coverage
 */
/* eslint-disable @typescript-eslint/no-explicit-any */

import { describe, it, expect, beforeEach, vi } from 'vitest';

// Mock all dependencies BEFORE importing the module
vi.mock('fs', () => ({
    existsSync: vi.fn().mockReturnValue(true),
    mkdirSync: vi.fn(),
    writeFileSync: vi.fn(),
    readFileSync: vi.fn(),
}));

vi.mock('child_process', () => ({
    execFileSync: vi.fn().mockReturnValue('git version 2.40.0'),
}));

vi.mock('../security.js', () => ({
    sanitize: vi.fn((x: string) => x.replace(/[;&|`$]/g, '')),
    safeGit: vi.fn().mockReturnValue(''),
    homeDir: '/tmp/test-home',
}));

describe('registerGitTools - Full Coverage', () => {
    let mockServer: any;
    let registeredTools: Map<string, any>;
    let safeGit: ReturnType<typeof vi.fn>;

    beforeEach(async () => {
        vi.clearAllMocks();
        registeredTools = new Map();

        // Create mock MCP server
        mockServer = {
            tool: vi.fn((name: string, description: string, schema: any, handler: any) => {
                registeredTools.set(name, { description, schema, handler });
            }),
        };

        const security = await import('../security.js');
        safeGit = vi.mocked(security.safeGit);
    });

    it('should register all git tools', async () => {
        const { registerGitTools } = await import('../git.js');
        registerGitTools(mockServer);

        expect(registeredTools.has('kit_create_checkpoint')).toBe(true);
        expect(registeredTools.has('kit_restore_checkpoint')).toBe(true);
        expect(registeredTools.has('kit_list_checkpoints')).toBe(true);
        expect(registeredTools.has('kit_auto_rollback')).toBe(true);
    });

    describe('kit_create_checkpoint handler', () => {
        it('should create checkpoint successfully', async () => {
            const { registerGitTools } = await import('../git.js');
            registerGitTools(mockServer);

            safeGit.mockReturnValue('');
            const tool = registeredTools.get('kit_create_checkpoint');
            const result = await tool.handler({ name: 'test-checkpoint' });

            expect(result.content[0].text).toContain('Checkpoint created');
            expect(safeGit).toHaveBeenCalledWith(['add', '-A']);
        });

        it('should handle git errors', async () => {
            const { registerGitTools } = await import('../git.js');
            registerGitTools(mockServer);

            safeGit.mockImplementation(() => {
                throw new Error('git failed');
            });

            const tool = registeredTools.get('kit_create_checkpoint');
            const result = await tool.handler({ name: 'test' });

            expect(result.content[0].text).toContain('Error');
        });
    });

    describe('kit_restore_checkpoint handler', () => {
        it('should restore with branch creation', async () => {
            vi.resetModules();
            const { registerGitTools } = await import('../git.js');
            registerGitTools(mockServer);

            const security = await import('../security.js');
            vi.mocked(security.safeGit).mockReturnValue('');

            const tool = registeredTools.get('kit_restore_checkpoint');
            const result = await tool.handler({
                checkpointId: 'kit-2024-01-01T00-00-00-test',
                createBranch: true
            });

            expect(result.content[0].text).toContain('branch');
        });

        it('should restore without branch (detached HEAD)', async () => {
            vi.resetModules();
            const { registerGitTools } = await import('../git.js');
            registerGitTools(mockServer);

            const security = await import('../security.js');
            vi.mocked(security.safeGit).mockReturnValue('');

            const tool = registeredTools.get('kit_restore_checkpoint');
            const result = await tool.handler({
                checkpointId: 'kit-2024-01-01T00-00-00-test',
                createBranch: false
            });

            expect(result.content[0].text).toContain('DETACHED HEAD');
        });

        it('should handle restore errors', async () => {
            vi.resetModules();
            const { registerGitTools } = await import('../git.js');
            registerGitTools(mockServer);

            const security = await import('../security.js');
            vi.mocked(security.safeGit).mockImplementation(() => {
                throw new Error('checkout failed');
            });

            const tool = registeredTools.get('kit_restore_checkpoint');
            const result = await tool.handler({
                checkpointId: 'kit-2024-01-01T00-00-00-test'
            });

            expect(result.content[0].text).toContain('Error');
        });
    });

    describe('kit_list_checkpoints handler', () => {
        it('should list checkpoints', async () => {
            vi.resetModules();
            const { registerGitTools } = await import('../git.js');
            registerGitTools(mockServer);

            const security = await import('../security.js');
            vi.mocked(security.safeGit).mockReturnValue('kit-tag-1\nkit-tag-2\n');

            const tool = registeredTools.get('kit_list_checkpoints');
            const result = await tool.handler({});

            expect(result.content[0].text).toContain('kit-tag-1');
        });

        it('should handle no checkpoints', async () => {
            vi.resetModules();
            const { registerGitTools } = await import('../git.js');
            registerGitTools(mockServer);

            const security = await import('../security.js');
            vi.mocked(security.safeGit).mockReturnValue('');

            const tool = registeredTools.get('kit_list_checkpoints');
            const result = await tool.handler({});

            expect(result.content[0].text).toContain('No checkpoints');
        });

        it('should handle git errors', async () => {
            vi.resetModules();
            const { registerGitTools } = await import('../git.js');
            registerGitTools(mockServer);

            const security = await import('../security.js');
            vi.mocked(security.safeGit).mockImplementation(() => {
                throw new Error('not a git repo');
            });

            const tool = registeredTools.get('kit_list_checkpoints');
            const result = await tool.handler({});

            expect(result.content[0].text).toContain('Error');
        });
    });

    describe('kit_auto_rollback handler', () => {
        it('should rollback with specific checkpoint', async () => {
            vi.resetModules();
            const { registerGitTools } = await import('../git.js');
            registerGitTools(mockServer);

            const security = await import('../security.js');
            vi.mocked(security.safeGit).mockReturnValue('');

            const tool = registeredTools.get('kit_auto_rollback');
            const result = await tool.handler({
                reason: 'test failed',
                checkpointId: 'kit-2024-01-01T00-00-00-test'
            });

            expect(result.content[0].text).toContain('ROLLBACK');
        });

        it('should find latest checkpoint when none specified', async () => {
            vi.resetModules();
            const { registerGitTools } = await import('../git.js');
            registerGitTools(mockServer);

            const security = await import('../security.js');
            vi.mocked(security.safeGit)
                .mockReturnValueOnce('kit-latest-tag\nkit-older-tag\n')
                .mockReturnValue('');

            const tool = registeredTools.get('kit_auto_rollback');
            const result = await tool.handler({ reason: 'auto rollback' });

            expect(result.content[0].text).toContain('kit-latest-tag');
        });

        it('should handle no checkpoints found', async () => {
            vi.resetModules();
            const { registerGitTools } = await import('../git.js');
            registerGitTools(mockServer);

            const security = await import('../security.js');
            vi.mocked(security.safeGit).mockReturnValue('');

            const tool = registeredTools.get('kit_auto_rollback');
            const result = await tool.handler({ reason: 'test' });

            expect(result.content[0].text).toContain('No checkpoint');
        });

        it('should handle rollback failure', async () => {
            vi.resetModules();
            const { registerGitTools } = await import('../git.js');
            registerGitTools(mockServer);

            const security = await import('../security.js');
            vi.mocked(security.safeGit)
                .mockReturnValueOnce('kit-tag\n')
                .mockImplementation(() => {
                    throw new Error('checkout failed');
                });

            const tool = registeredTools.get('kit_auto_rollback');
            const result = await tool.handler({ reason: 'test' });

            expect(result.content[0].text).toContain('failed');
        });
    });
});
