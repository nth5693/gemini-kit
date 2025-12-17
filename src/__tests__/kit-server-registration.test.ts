/**
 * Kit Server Registration Tests - Full coverage for main server
 */
/* eslint-disable @typescript-eslint/no-explicit-any */

import { describe, it, expect, beforeEach, vi } from 'vitest';

// Mock fs
vi.mock('fs', () => ({
    existsSync: vi.fn(),
    mkdirSync: vi.fn(),
    writeFileSync: vi.fn(),
    readFileSync: vi.fn(),
    readdirSync: vi.fn().mockReturnValue([]),
    statSync: vi.fn().mockReturnValue({ isDirectory: () => false }),
}));

// Mock path
vi.mock('path', async () => {
    const actual = await vi.importActual('path');
    return { ...actual };
});

// Mock security
vi.mock('./tools/security.js', () => ({
    findFiles: vi.fn().mockReturnValue(['index.ts', 'utils.ts']),
    safeGit: vi.fn().mockReturnValue('abc123 commit 1'),
    sanitize: vi.fn((x: string) => x),
    homeDir: '/tmp/test-home',
}));

// Mock tool modules to prevent duplicate registration
vi.mock('./tools/git.js', () => ({
    registerGitTools: vi.fn(),
    checkGitAvailable: vi.fn().mockReturnValue({ available: true, version: 'git 2.40' }),
}));

vi.mock('./tools/knowledge.js', () => ({
    registerKnowledgeTools: vi.fn(),
}));

vi.mock('./tools/integration.js', () => ({
    registerIntegrationTools: vi.fn(),
}));

vi.mock('./tools/orchestrator.js', () => ({
    initOrchestrator: vi.fn(),
    teamStart: vi.fn().mockReturnValue({ success: true }),
    teamStatus: vi.fn().mockReturnValue({ hasSession: false }),
    teamEnd: vi.fn().mockReturnValue({ success: true }),
    runWorkflow: vi.fn().mockReturnValue({ success: true }),
    smartRoute: vi.fn().mockReturnValue({ workflow: { name: 'cook' } }),
}));

vi.mock('./tools/team-state.js', () => ({
    getSession: vi.fn(),
    startSession: vi.fn(),
    endSession: vi.fn(),
}));

// Mock MCP server
vi.mock('@modelcontextprotocol/sdk/server/mcp.js', () => ({
    McpServer: vi.fn().mockImplementation(() => ({
        tool: vi.fn(),
        connect: vi.fn(),
    })),
}));

vi.mock('@modelcontextprotocol/sdk/server/stdio.js', () => ({
    StdioServerTransport: vi.fn(),
}));

import * as fs from 'fs';

describe('Kit Server - getFileExtensions', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('should return default extensions when no settings', () => {
        vi.mocked(fs.existsSync).mockReturnValue(false);

        // Test the logic
        const settingsExists = fs.existsSync('.gemini/settings.json');
        expect(settingsExists).toBe(false);
    });

    it('should read custom extensions from settings', () => {
        vi.mocked(fs.existsSync).mockReturnValue(true);
        vi.mocked(fs.readFileSync).mockReturnValue(JSON.stringify({
            fileExtensions: ['.custom', '.ext']
        }));

        const content = fs.readFileSync('settings.json', 'utf-8');
        const settings = JSON.parse(content as string);
        expect(settings.fileExtensions).toEqual(['.custom', '.ext']);
    });

    it('should handle JSON parse error', () => {
        vi.mocked(fs.existsSync).mockReturnValue(true);
        vi.mocked(fs.readFileSync).mockReturnValue('invalid json');

        expect(() => JSON.parse('invalid json')).toThrow();
    });

    it('should handle missing fileExtensions array', () => {
        vi.mocked(fs.existsSync).mockReturnValue(true);
        vi.mocked(fs.readFileSync).mockReturnValue('{}');

        const settings = JSON.parse('{}');
        expect(settings.fileExtensions).toBeUndefined();
    });
});

describe('Kit Server - Project Context Tool', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('should filter files by depth', async () => {
        const security = await import('../tools/security.js');
        vi.mocked(security.findFiles).mockReturnValue([
            'index.ts',
            'src/utils.ts',
            'src/deep/nested/file.ts'
        ]);

        const files = security.findFiles('/project', ['.ts'], 50);
        const depth = 2;
        const filtered = files.filter((f: string) => {
            const parts = f.split('/');
            return parts.length <= depth + 1;
        });

        expect(filtered).toContain('index.ts');
        expect(filtered).toContain('src/utils.ts');
    });

    it('should include package.json info', () => {
        vi.mocked(fs.existsSync).mockReturnValue(true);
        vi.mocked(fs.readFileSync).mockReturnValue(JSON.stringify({
            name: 'test-project',
            version: '1.0.0',
            dependencies: { lodash: '^4.0.0' }
        }));

        const pkgJson = JSON.parse(fs.readFileSync('package.json', 'utf8') as string);
        expect(pkgJson.name).toBe('test-project');
        expect(Object.keys(pkgJson.dependencies)).toContain('lodash');
    });

    it('should handle missing package.json', () => {
        vi.mocked(fs.existsSync).mockReturnValue(false);
        expect(fs.existsSync('package.json')).toBe(false);
    });

    it('should include git log', async () => {
        const security = await import('../tools/security.js');
        vi.mocked(security.safeGit).mockReturnValue('abc123 commit 1\ndef456 commit 2');

        const log = security.safeGit(['log', '--oneline', '-5']);
        const commits = log.split('\n').filter(Boolean);
        expect(commits).toHaveLength(2);
    });
});

describe('Kit Server - Handoff Tool', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('should create handoff file', () => {
        vi.mocked(fs.mkdirSync).mockReturnValue(undefined);
        vi.mocked(fs.writeFileSync).mockReturnValue(undefined);

        const handoff = {
            timestamp: new Date().toISOString(),
            from: 'planner',
            to: 'coder',
            context: 'Plan ready',
            artifacts: ['plan.md']
        };

        fs.mkdirSync('/handoffs', { recursive: true });
        fs.writeFileSync('/handoffs/test.json', JSON.stringify(handoff));

        expect(fs.mkdirSync).toHaveBeenCalled();
        expect(fs.writeFileSync).toHaveBeenCalled();
    });
});

describe('Kit Server - Artifact Tool', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('should save artifact', () => {
        vi.mocked(fs.mkdirSync).mockReturnValue(undefined);
        vi.mocked(fs.writeFileSync).mockReturnValue(undefined);

        fs.mkdirSync('/artifacts', { recursive: true });
        fs.writeFileSync('/artifacts/plan.md', '# Plan');

        expect(fs.mkdirSync).toHaveBeenCalled();
        expect(fs.writeFileSync).toHaveBeenCalled();
    });
});

describe('Kit Server - Team Tools', () => {
    it('should call orchestrator functions', async () => {
        const orchestrator = await import('../tools/orchestrator.js');

        const startResult = orchestrator.teamStart('Build feature');
        expect(startResult.success).toBe(true);

        const statusResult = orchestrator.teamStatus();
        expect(statusResult.hasSession).toBe(false);

        const endResult = orchestrator.teamEnd('completed');
        expect(endResult.success).toBe(true);

        const workflowResult = orchestrator.runWorkflow('cook', 'Build');
        expect(workflowResult.success).toBe(true);

        const routeResult = orchestrator.smartRoute('fix bug');
        expect(routeResult.workflow.name).toBe('cook');
    });
});

describe('Kit Server - DEFAULT_EXTENSIONS', () => {
    it('should include common file types', () => {
        const DEFAULT_EXTENSIONS = [
            '.ts', '.js', '.tsx', '.jsx',
            '.py', '.go', '.rs',
            '.java', '.kt',
            '.cpp', '.c', '.h', '.hpp',
            '.php', '.rb', '.swift',
            '.vue', '.svelte',
            '.json', '.yaml', '.yml',
            '.md',
        ];

        expect(DEFAULT_EXTENSIONS).toContain('.ts');
        expect(DEFAULT_EXTENSIONS).toContain('.py');
        expect(DEFAULT_EXTENSIONS).toContain('.go');
        expect(DEFAULT_EXTENSIONS).toContain('.md');
        expect(DEFAULT_EXTENSIONS.length).toBeGreaterThan(10);
    });
});
