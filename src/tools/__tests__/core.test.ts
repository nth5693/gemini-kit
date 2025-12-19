/**
 * Core Tools Tests - Test registerCoreTools
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';

// Types
interface ToolHandler {
    (args: Record<string, unknown>): Promise<{ content: Array<{ type: 'text'; text: string }> }>;
}

interface RegisteredTool {
    description: string;
    schema: unknown;
    handler: ToolHandler;
}

interface MockMcpServer {
    tool: ReturnType<typeof vi.fn>;
}

// Mock fs
vi.mock('fs', () => ({
    existsSync: vi.fn(),
    mkdirSync: vi.fn(),
    writeFileSync: vi.fn(),
    readFileSync: vi.fn(),
}));

// Mock security
vi.mock('../security.js', () => ({
    safeGit: vi.fn().mockReturnValue('abc123 commit\ndef456 commit'),
    findFiles: vi.fn().mockReturnValue(['index.ts', 'src/utils.ts']),
    findFilesAsync: vi.fn().mockResolvedValue(['index.ts', 'src/utils.ts']),
}));

// Mock config
vi.mock('../config.js', () => ({
    DEFAULT_EXTENSIONS: ['.ts', '.js'],
    getFileExtensions: vi.fn().mockReturnValue(['.ts', '.js']),
}));

import * as fs from 'fs';

describe('registerCoreTools', () => {
    let mockServer: MockMcpServer;
    let registeredTools: Map<string, RegisteredTool>;

    beforeEach(() => {
        vi.clearAllMocks();
        registeredTools = new Map<string, RegisteredTool>();

        mockServer = {
            tool: vi.fn((name: string, description: string, schema: unknown, handler: ToolHandler) => {
                registeredTools.set(name, { description, schema, handler });
            }),
        };
    });

    it('should register all core tools', async () => {
        const { registerCoreTools } = await import('../core.js');
        registerCoreTools(mockServer as unknown as Parameters<typeof registerCoreTools>[0]);

        expect(registeredTools.has('kit_get_project_context')).toBe(true);
        expect(registeredTools.has('kit_handoff_agent')).toBe(true);
        expect(registeredTools.has('kit_save_artifact')).toBe(true);
    });

    describe('kit_get_project_context', () => {
        it('should return project context', async () => {
            vi.mocked(fs.existsSync).mockReturnValue(true);
            vi.mocked(fs.readFileSync).mockReturnValue(JSON.stringify({
                name: 'test-project',
                version: '1.0.0',
                dependencies: { lodash: '^4.0.0' }
            }));

            const { registerCoreTools } = await import('../core.js');
            registerCoreTools(mockServer as unknown as Parameters<typeof registerCoreTools>[0]);

            const tool = registeredTools.get('kit_get_project_context');
            const result = await tool!.handler({ depth: 2 });

            expect(result.content[0].text).toContain('structure');
        });

        it('should handle errors', async () => {
            vi.mocked(fs.existsSync).mockImplementation(() => {
                throw new Error('Read error');
            });

            const { registerCoreTools } = await import('../core.js');
            registerCoreTools(mockServer as unknown as Parameters<typeof registerCoreTools>[0]);

            const tool = registeredTools.get('kit_get_project_context');
            const result = await tool!.handler({});

            expect(result.content[0].text).toContain('Error');
        });
    });

    describe('kit_handoff_agent', () => {
        it('should create handoff', async () => {
            vi.mocked(fs.mkdirSync).mockReturnValue(undefined);
            vi.mocked(fs.writeFileSync).mockReturnValue(undefined);

            const { registerCoreTools } = await import('../core.js');
            registerCoreTools(mockServer as unknown as Parameters<typeof registerCoreTools>[0]);

            const tool = registeredTools.get('kit_handoff_agent');
            const result = await tool!.handler({
                fromAgent: 'planner',
                toAgent: 'coder',
                context: 'Plan ready',
                artifacts: ['plan.md']
            });

            expect(result.content[0].text).toContain('Handoff');
            expect(fs.writeFileSync).toHaveBeenCalled();
        });

        it('should handle errors', async () => {
            vi.mocked(fs.mkdirSync).mockImplementation(() => {
                throw new Error('Permission denied');
            });

            const { registerCoreTools } = await import('../core.js');
            registerCoreTools(mockServer as unknown as Parameters<typeof registerCoreTools>[0]);

            const tool = registeredTools.get('kit_handoff_agent');
            const result = await tool!.handler({
                fromAgent: 'a',
                toAgent: 'b',
                context: 'test'
            });

            expect(result.content[0].text).toContain('Error');
        });
    });

    describe('kit_save_artifact', () => {
        it('should save artifact', async () => {
            vi.mocked(fs.mkdirSync).mockReturnValue(undefined);
            vi.mocked(fs.writeFileSync).mockReturnValue(undefined);

            const { registerCoreTools } = await import('../core.js');
            registerCoreTools(mockServer as unknown as Parameters<typeof registerCoreTools>[0]);

            const tool = registeredTools.get('kit_save_artifact');
            const result = await tool!.handler({
                name: 'my-plan',
                type: 'plan',
                content: '# Plan content'
            });

            expect(result.content[0].text).toContain('Artifact saved');
            expect(fs.writeFileSync).toHaveBeenCalled();
        });

        it('should sanitize artifact name', async () => {
            vi.mocked(fs.mkdirSync).mockReturnValue(undefined);
            vi.mocked(fs.writeFileSync).mockReturnValue(undefined);

            const { registerCoreTools } = await import('../core.js');
            registerCoreTools(mockServer as unknown as Parameters<typeof registerCoreTools>[0]);

            const tool = registeredTools.get('kit_save_artifact');
            await tool!.handler({
                name: '../../../evil-name.txt',
                type: 'log',
                content: 'test'
            });

            // Should have sanitized the name
            const call = vi.mocked(fs.writeFileSync).mock.calls[0];
            expect(call[0]).not.toContain('..');
        });

        it('should handle errors', async () => {
            vi.mocked(fs.mkdirSync).mockImplementation(() => {
                throw new Error('Permission denied');
            });

            const { registerCoreTools } = await import('../core.js');
            registerCoreTools(mockServer as unknown as Parameters<typeof registerCoreTools>[0]);

            const tool = registeredTools.get('kit_save_artifact');
            const result = await tool!.handler({
                name: 'test',
                type: 'report',
                content: 'test'
            });

            expect(result.content[0].text).toContain('Error');
        });
    });
});
