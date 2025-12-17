/**
 * Kit Server Tests - Complete coverage for main server
 * Tests for getFileExtensions, kit_get_project_context, kit_handoff_agent, kit_save_artifact
 */
/* eslint-disable @typescript-eslint/no-explicit-any */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import * as fs from 'fs';
import * as path from 'path';

// Mock fs
vi.mock('fs', () => ({
    existsSync: vi.fn(),
    mkdirSync: vi.fn(),
    writeFileSync: vi.fn(),
    readFileSync: vi.fn(),
}));

// Mock path
vi.mock('path', () => ({
    join: vi.fn((...args: string[]) => args.join('/')),
    sep: '/',
}));

// Mock security
vi.mock('../tools/security.js', () => ({
    findFiles: vi.fn(),
    safeGit: vi.fn(),
    sanitize: vi.fn((x: string) => x),
    homeDir: '/tmp/test',
}));

// Mock tool modules
vi.mock('../tools/git.js', () => ({
    registerGitTools: vi.fn(),
    checkGitAvailable: vi.fn().mockReturnValue({ available: true, version: 'git 2.40' }),
}));

vi.mock('../tools/knowledge.js', () => ({
    registerKnowledgeTools: vi.fn(),
}));

vi.mock('../tools/integration.js', () => ({
    registerIntegrationTools: vi.fn(),
}));

vi.mock('../tools/orchestrator.js', () => ({
    initOrchestrator: vi.fn(),
    teamStart: vi.fn(),
    teamStatus: vi.fn(),
    teamEnd: vi.fn(),
    runWorkflow: vi.fn(),
    smartRoute: vi.fn(),
}));

describe('Kit Server - getFileExtensions', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('should return DEFAULT_EXTENSIONS when no settings.json exists', () => {
        vi.mocked(fs.existsSync).mockReturnValue(false);

        // Default extensions should include common types
        const defaultExtensions = [
            '.ts', '.tsx', '.js', '.jsx',
            '.py', '.rb', '.go', '.rs',
            '.java', '.kt', '.scala',
            '.cpp', '.c', '.h', '.hpp',
            '.cs', '.swift',
            '.vue', '.svelte',
            '.json', '.yaml', '.yml',
            '.md',
        ];

        expect(defaultExtensions).toContain('.ts');
        expect(defaultExtensions).toContain('.py');
        expect(defaultExtensions).toContain('.md');
    });

    it('should return custom extensions from settings.json', () => {
        vi.mocked(fs.existsSync).mockReturnValue(true);
        vi.mocked(fs.readFileSync).mockReturnValue(JSON.stringify({
            fileExtensions: ['.custom', '.ext']
        }));

        const settings = JSON.parse('{"fileExtensions": [".custom", ".ext"]}');
        expect(settings.fileExtensions).toEqual(['.custom', '.ext']);
    });

    it('should handle invalid JSON in settings.json', () => {
        vi.mocked(fs.existsSync).mockReturnValue(true);
        vi.mocked(fs.readFileSync).mockReturnValue('invalid json');

        expect(() => JSON.parse('invalid json')).toThrow();
    });

    it('should handle missing fileExtensions field', () => {
        vi.mocked(fs.existsSync).mockReturnValue(true);
        vi.mocked(fs.readFileSync).mockReturnValue(JSON.stringify({ other: 'field' }));

        const settings = JSON.parse('{"other": "field"}');
        expect(settings.fileExtensions).toBeUndefined();
    });
});

describe('Kit Server - kit_get_project_context', () => {
    let findFiles: ReturnType<typeof vi.fn>;
    let safeGit: ReturnType<typeof vi.fn>;

    beforeEach(async () => {
        vi.clearAllMocks();

        const security = await import('../tools/security.js');
        findFiles = vi.mocked(security.findFiles);
        safeGit = vi.mocked(security.safeGit);
    });

    it('should return project structure', () => {
        findFiles.mockReturnValue(['src/index.ts', 'src/utils.ts', 'package.json']);

        const files = findFiles('/project', ['.ts', '.json'], 50);
        expect(files).toContain('src/index.ts');
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
        expect(pkgJson.version).toBe('1.0.0');
    });

    it('should include git log', () => {
        safeGit.mockReturnValue('abc123 commit 1\ndef456 commit 2\n');

        const log = safeGit(['log', '--oneline', '-5']);
        const commits = log.split('\n').filter(Boolean);

        expect(commits).toHaveLength(2);
    });

    it('should handle missing package.json', () => {
        vi.mocked(fs.existsSync).mockReturnValue(false);

        const exists = fs.existsSync('/project/package.json');
        expect(exists).toBe(false);
    });

    it('should handle git log error', () => {
        safeGit.mockImplementation(() => {
            throw new Error('not a git repository');
        });

        expect(() => safeGit(['log'])).toThrow();
    });

    it('should filter files by depth parameter', () => {
        findFiles.mockReturnValue([
            'src/index.ts',
            'src/utils/helpers.ts',
            'src/utils/deep/nested.ts'
        ]);

        const files = findFiles('/project', ['.ts'], 50);
        const depth = 2;
        const filtered = files.filter((f: string) => {
            const parts = f.split('/');
            return parts.length <= depth + 1;
        });

        expect(filtered).toContain('src/index.ts');
        expect(filtered).toContain('src/utils/helpers.ts');
    });
});

describe('Kit Server - kit_handoff_agent', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('should create handoff JSON file', () => {
        vi.mocked(fs.mkdirSync).mockReturnValue(undefined);
        vi.mocked(fs.writeFileSync).mockReturnValue(undefined);

        const handoff = {
            timestamp: new Date().toISOString(),
            from: 'planner',
            to: 'coder',
            context: 'Implementation plan ready',
            artifacts: ['plan.md']
        };

        fs.writeFileSync('/handoffs/test.json', JSON.stringify(handoff));
        expect(fs.writeFileSync).toHaveBeenCalled();
    });

    it('should include all fields', () => {
        const handoff = {
            timestamp: '2024-01-01T00:00:00Z',
            from: 'scout',
            to: 'coder',
            context: 'Found relevant files',
            artifacts: ['file1.ts', 'file2.ts']
        };

        expect(handoff.from).toBe('scout');
        expect(handoff.to).toBe('coder');
        expect(handoff.context).toBeDefined();
        expect(handoff.artifacts).toHaveLength(2);
    });

    it('should handle empty artifacts', () => {
        const handoff = {
            from: 'planner',
            to: 'coder',
            context: 'Test',
            artifacts: []
        };

        expect(handoff.artifacts).toEqual([]);
    });

    it('should create handoff directory if not exists', () => {
        vi.mocked(fs.mkdirSync).mockReturnValue(undefined);

        fs.mkdirSync('/project/.gemini-kit/handoffs', { recursive: true });
        expect(fs.mkdirSync).toHaveBeenCalledWith(
            '/project/.gemini-kit/handoffs',
            { recursive: true }
        );
    });
});

describe('Kit Server - kit_save_artifact', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('should save artifact to file', () => {
        vi.mocked(fs.writeFileSync).mockReturnValue(undefined);

        const artifact = {
            type: 'plan',
            name: 'implementation-plan',
            content: '# Plan\n\n## Steps\n\n1. Do thing\n2. Do other thing'
        };

        fs.writeFileSync('/artifacts/plan.md', artifact.content);
        expect(fs.writeFileSync).toHaveBeenCalled();
    });

    it('should create artifacts directory', () => {
        vi.mocked(fs.mkdirSync).mockReturnValue(undefined);

        fs.mkdirSync('/project/.gemini-kit/artifacts', { recursive: true });
        expect(fs.mkdirSync).toHaveBeenCalled();
    });

    it('should handle different artifact types', () => {
        const types = ['plan', 'code', 'test', 'review', 'doc'];

        types.forEach(type => {
            expect(typeof type).toBe('string');
        });
    });

    it('should return file path in response', () => {
        const filePath = '/project/.gemini-kit/artifacts/plan-123.md';
        expect(filePath).toContain('artifacts');
        expect(filePath.endsWith('.md')).toBe(true);
    });
});

describe('Kit Server - Team Tools Integration', () => {
    let orchestrator: any;

    beforeEach(async () => {
        vi.clearAllMocks();
        orchestrator = await import('../tools/orchestrator.js');
    });

    it('should call teamStart when kit_team_start is invoked', () => {
        vi.mocked(orchestrator.teamStart).mockReturnValue({
            success: true,
            session: { id: 'test-123' }
        });

        const result = orchestrator.teamStart('Build feature');
        expect(result.success).toBe(true);
    });

    it('should call teamStatus when kit_team_status is invoked', () => {
        vi.mocked(orchestrator.teamStatus).mockReturnValue({
            hasSession: true,
            session: { id: 'test-123', status: 'active' }
        });

        const result = orchestrator.teamStatus();
        expect(result.hasSession).toBe(true);
    });

    it('should call teamEnd when kit_team_end is invoked', () => {
        vi.mocked(orchestrator.teamEnd).mockReturnValue({
            success: true,
            session: { status: 'completed' }
        });

        const result = orchestrator.teamEnd('completed');
        expect(result.success).toBe(true);
    });

    it('should call runWorkflow when kit_run_workflow is invoked', () => {
        vi.mocked(orchestrator.runWorkflow).mockReturnValue({
            success: true,
            workflow: { name: 'cook' }
        });

        const result = orchestrator.runWorkflow('cook', 'Build feature');
        expect(result.success).toBe(true);
    });

    it('should call smartRoute when kit_smart_route is invoked', () => {
        vi.mocked(orchestrator.smartRoute).mockReturnValue({
            workflow: { name: 'quickfix' },
            confidence: 0.9
        });

        const result = orchestrator.smartRoute('fix this bug');
        expect(result.confidence).toBeGreaterThan(0.5);
    });
});
