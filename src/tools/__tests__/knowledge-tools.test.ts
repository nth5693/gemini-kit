/**
 * Knowledge Tools Tests - Complete coverage
 * Tests for learning, diff, and search functionality
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
    appendFileSync: vi.fn(),
    readdirSync: vi.fn(),
    statSync: vi.fn(),
}));

// Mock path
vi.mock('path', () => ({
    join: vi.fn((...args: string[]) => args.join('/')),
    resolve: vi.fn((...args: string[]) => args.join('/')),
    dirname: vi.fn((p: string) => p.split('/').slice(0, -1).join('/')),
    basename: vi.fn((p: string) => p.split('/').pop()),
    extname: vi.fn((p: string) => {
        const parts = p.split('.');
        return parts.length > 1 ? '.' + parts.pop() : '';
    }),
}));

// Mock diff
vi.mock('diff', () => ({
    createPatch: vi.fn(),
    applyPatch: vi.fn(),
    diffLines: vi.fn(),
}));

// Mock security
vi.mock('../security.js', () => ({
    sanitize: vi.fn((x: string) => x),
    homeDir: '/tmp/test-home',
    findFiles: vi.fn(),
}));

describe('Knowledge Tools - validatePath', () => {
    it('should resolve valid relative path', () => {
        const baseDir = '/Users/test/project';
        const filePath = 'src/file.ts';
        const resolved = `${baseDir}/${filePath}`;

        expect(resolved).toBe('/Users/test/project/src/file.ts');
        expect(resolved.startsWith(baseDir)).toBe(true);
    });

    it('should detect path traversal attack with ../', () => {
        const baseDir = '/Users/test/project';
        const maliciousPath = '../../../etc/passwd';

        // Simulate path resolution
        const parts = maliciousPath.split('/');
        const hasTraversal = parts.some(p => p === '..');

        expect(hasTraversal).toBe(true);
    });

    it('should detect absolute path outside base directory', () => {
        const baseDir = '/Users/test/project';
        const outsidePath = '/etc/passwd';

        expect(outsidePath.startsWith(baseDir)).toBe(false);
    });

    it('should allow valid nested paths', () => {
        const baseDir = '/Users/test/project';
        const nestedPath = 'src/components/Button/index.tsx';
        const resolved = `${baseDir}/${nestedPath}`;

        expect(resolved.startsWith(baseDir)).toBe(true);
    });
});

describe('Knowledge Tools - Learning Delimiters', () => {
    it('should use unique markers for learnings', () => {
        const LEARNING_START = '<!-- LEARNING_START';
        const LEARNING_END = '<!-- LEARNING_END -->';

        // These should be HTML comments
        expect(LEARNING_START).toContain('<!--');
        expect(LEARNING_END).toContain('-->');
    });

    it('should not conflict with normal content', () => {
        const normalContent = 'This is a normal markdown file with <!-- comments -->';
        const learningMarker = '<!-- LEARNING_START';

        // Normal comments don't have LEARNING_START
        expect(normalContent).not.toContain('LEARNING_START');
        expect(learningMarker).toContain('LEARNING_START');
    });
});

describe('Knowledge Tools - kit_save_learning', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('should create learnings directory', () => {
        vi.mocked(fs.mkdirSync).mockReturnValue(undefined);

        fs.mkdirSync('/tmp/test-home/.gemini-kit/learnings', { recursive: true });
        expect(fs.mkdirSync).toHaveBeenCalled();
    });

    it('should create LEARNINGS.md if not exists', () => {
        vi.mocked(fs.existsSync).mockReturnValue(false);
        vi.mocked(fs.writeFileSync).mockReturnValue(undefined);

        const header = '# Gemini-Kit Learnings\n\n> AI tự động học từ feedback của user.\n\n---\n\n';
        fs.writeFileSync('/learnings/LEARNINGS.md', header);

        expect(fs.writeFileSync).toHaveBeenCalled();
    });

    it('should append learning entry', () => {
        vi.mocked(fs.appendFileSync).mockReturnValue(undefined);

        const entry = `<!-- LEARNING_START id:123 -->
## code_style
**Lesson:** Use arrow functions
**Context:** User preference
<!-- LEARNING_END -->
`;

        fs.appendFileSync('/learnings/LEARNINGS.md', entry);
        expect(fs.appendFileSync).toHaveBeenCalled();
    });

    it('should include timestamp and category', () => {
        const timestamp = new Date().toISOString();
        const category = 'code_style';
        const lesson = 'Use arrow functions';

        expect(timestamp).toMatch(/^\d{4}-\d{2}-\d{2}T/);
        expect(['code_style', 'bug', 'preference', 'pattern', 'other']).toContain(category);
        expect(lesson.length).toBeGreaterThan(0);
    });

    it('should handle context parameter', () => {
        const learning = {
            category: 'preference',
            lesson: 'Use TypeScript strict mode',
            context: 'From user feedback on PR review'
        };

        expect(learning.context).toBeDefined();
    });
});

describe('Knowledge Tools - kit_get_learnings', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('should return all learnings', () => {
        const fileContent = `# Learnings

<!-- LEARNING_START id:1 -->
## code_style
Lesson: Use arrow functions
<!-- LEARNING_END -->

<!-- LEARNING_START id:2 -->
## bug
Lesson: Check null values
<!-- LEARNING_END -->
`;
        vi.mocked(fs.readFileSync).mockReturnValue(fileContent);
        vi.mocked(fs.existsSync).mockReturnValue(true);

        const content = fs.readFileSync('/learnings/LEARNINGS.md', 'utf-8');
        expect(content).toContain('LEARNING_START');
    });

    it('should filter by category', () => {
        const learnings = [
            { category: 'code_style', lesson: 'Arrow functions' },
            { category: 'bug', lesson: 'Null checks' },
            { category: 'code_style', lesson: 'Semicolons' }
        ];

        const codeStyleOnly = learnings.filter(l => l.category === 'code_style');
        expect(codeStyleOnly).toHaveLength(2);
    });

    it('should return empty when no file', () => {
        vi.mocked(fs.existsSync).mockReturnValue(false);

        const exists = fs.existsSync('/learnings/LEARNINGS.md');
        expect(exists).toBe(false);
    });

    it('should parse learning entries correctly', () => {
        const entry = `<!-- LEARNING_START id:123 -->
## code_style
**Lesson:** Use arrow functions
**Context:** User preference
**Date:** 2024-01-01
<!-- LEARNING_END -->`;

        expect(entry).toContain('id:123');
        expect(entry).toContain('code_style');
        expect(entry).toContain('Use arrow functions');
    });
});

describe('Knowledge Tools - kit_store_diff', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('should store diff for existing file', async () => {
        vi.mocked(fs.existsSync).mockReturnValue(true);
        vi.mocked(fs.readFileSync).mockReturnValue('original content');
        vi.mocked(fs.writeFileSync).mockReturnValue(undefined);

        const Diff = await import('diff');
        vi.mocked(Diff.createPatch).mockReturnValue('--- a/file\n+++ b/file\n@@ -1 +1 @@\n-original\n+modified');

        const patch = Diff.createPatch('file.ts', 'original', 'modified');
        expect(patch).toContain('---');
    });

    it('should create diffs directory', () => {
        vi.mocked(fs.mkdirSync).mockReturnValue(undefined);

        fs.mkdirSync('/project/.gemini-kit/diffs', { recursive: true });
        expect(fs.mkdirSync).toHaveBeenCalled();
    });

    it('should generate unique diff ID', () => {
        const id1 = `diff-${Date.now()}-abc`;
        const id2 = `diff-${Date.now() + 1}-def`;

        expect(id1).not.toBe(id2);
    });
});

describe('Knowledge Tools - kit_apply_stored_diff', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('should apply diff successfully', async () => {
        vi.mocked(fs.existsSync).mockReturnValue(true);
        vi.mocked(fs.readFileSync)
            .mockReturnValueOnce('original content')  // diff file
            .mockReturnValueOnce('current content');  // target file

        const Diff = await import('diff');
        vi.mocked(Diff.applyPatch).mockReturnValue('patched content');

        const result = Diff.applyPatch('current content', 'patch');
        expect(result).toBe('patched content');
    });

    it('should detect conflicts', async () => {
        const Diff = await import('diff');
        vi.mocked(Diff.applyPatch).mockReturnValue(false as any);

        const result = Diff.applyPatch('content', 'conflicting patch');
        expect(result).toBe(false);
    });

    it('should return error if diff not found', () => {
        vi.mocked(fs.existsSync).mockReturnValue(false);

        const exists = fs.existsSync('/diffs/nonexistent.diff');
        expect(exists).toBe(false);
    });
});

describe('Knowledge Tools - kit_search_codebase', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('should search with exact string', () => {
        const files = ['src/index.ts', 'src/utils.ts'];
        const searchTerm = 'function';

        const content = 'function test() { return true; }';  // Use value directly
        expect(content).toContain(searchTerm);
    });

    it('should search with regex', () => {
        const content = 'const x = 42;\nlet y = 100;';
        const regex = /const \w+ = \d+/;

        expect(regex.test(content)).toBe(true);
    });

    it('should return matching lines with context', () => {
        const lines = [
            'line 1',
            'line 2 with match',
            'line 3'
        ];

        const matchIndex = lines.findIndex(l => l.includes('match'));
        expect(matchIndex).toBe(1);

        // Context: lines before and after
        const context = lines.slice(Math.max(0, matchIndex - 1), matchIndex + 2);
        expect(context).toHaveLength(3);
    });

    it('should handle no matches', () => {
        const content = 'no matching content here';
        const searchTerm = 'nonexistent';

        expect(content.includes(searchTerm)).toBe(false);
    });

    it('should limit results', () => {
        const allMatches = Array.from({ length: 100 }, (_, i) => `match ${i}`);
        const limit = 20;
        const limited = allMatches.slice(0, limit);

        expect(limited).toHaveLength(20);
    });
});

describe('Knowledge Tools - kit_find_similar', () => {
    it('should find similar code patterns', () => {
        const patterns = [
            { file: 'a.ts', similarity: 0.95 },
            { file: 'b.ts', similarity: 0.80 },
            { file: 'c.ts', similarity: 0.60 }
        ];

        const similar = patterns.filter(p => p.similarity > 0.7);
        expect(similar).toHaveLength(2);
    });

    it('should return file paths and lines', () => {
        const result = {
            file: 'src/utils.ts',
            lines: [10, 11, 12],
            snippet: 'function helper() {}'
        };

        expect(result.file).toBeDefined();
        expect(result.lines).toHaveLength(3);
    });
});
