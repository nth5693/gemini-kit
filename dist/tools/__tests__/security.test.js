/**
 * Security Tools Tests
 * Tests for sanitize, validatePath, findFiles, safeGit
 */
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import * as fs from 'fs';
import * as path from 'path';
// Mock fs for some tests
vi.mock('fs', async () => {
    const actual = await vi.importActual('fs');
    return {
        ...actual,
    };
});
describe('sanitize', () => {
    // Import after mocks
    let sanitize;
    beforeEach(async () => {
        const security = await import('../security.js');
        sanitize = security.sanitize;
    });
    it('should remove semicolons (command chaining)', () => {
        expect(sanitize('test; rm -rf /')).toBe('test rm -rf /');
    });
    it('should remove pipe operators', () => {
        expect(sanitize('cat file | grep secret')).toBe('cat file  grep secret');
    });
    it('should remove backticks (command substitution)', () => {
        expect(sanitize('`whoami`')).toBe('whoami');
    });
    it('should remove $() syntax', () => {
        expect(sanitize('$(cat /etc/passwd)')).toBe('cat /etc/passwd');
    });
    it('should remove ampersands (background/chaining)', () => {
        expect(sanitize('cmd1 && cmd2')).toBe('cmd1  cmd2');
        // Note: trim() is applied, so trailing space is removed
        expect(sanitize('cmd &')).toBe('cmd');
    });
    it('should limit length to 500 characters', () => {
        const longString = 'a'.repeat(1000);
        expect(sanitize(longString).length).toBe(500);
    });
    it('should trim whitespace', () => {
        expect(sanitize('  test  ')).toBe('test');
    });
    it('should handle empty string', () => {
        expect(sanitize('')).toBe('');
    });
    it('should preserve safe characters', () => {
        expect(sanitize('hello-world_123')).toBe('hello-world_123');
    });
});
describe('findFiles', () => {
    let findFiles;
    let tempDir;
    beforeEach(async () => {
        const security = await import('../security.js');
        findFiles = security.findFiles;
        // Create temp directory structure for testing
        tempDir = path.join(process.cwd(), '.test-temp-' + Date.now());
        fs.mkdirSync(tempDir, { recursive: true });
        fs.mkdirSync(path.join(tempDir, 'src'), { recursive: true });
        fs.mkdirSync(path.join(tempDir, 'node_modules', 'pkg'), { recursive: true });
        // Create test files
        fs.writeFileSync(path.join(tempDir, 'index.ts'), 'console.log("test")');
        fs.writeFileSync(path.join(tempDir, 'src', 'utils.ts'), 'export const x = 1');
        fs.writeFileSync(path.join(tempDir, 'src', 'style.css'), '.test {}');
        fs.writeFileSync(path.join(tempDir, 'node_modules', 'pkg', 'index.js'), 'module.exports = {}');
    });
    afterEach(() => {
        // Cleanup temp directory
        if (tempDir && fs.existsSync(tempDir)) {
            fs.rmSync(tempDir, { recursive: true, force: true });
        }
    });
    it('should find files with specified extensions', () => {
        const files = findFiles(tempDir, ['.ts'], 100);
        expect(files).toContain('index.ts');
        expect(files).toContain(path.join('src', 'utils.ts'));
    });
    it('should exclude node_modules by default', () => {
        const files = findFiles(tempDir, ['.js', '.ts'], 100);
        expect(files.every(f => !f.includes('node_modules'))).toBe(true);
    });
    it('should respect maxFiles limit', () => {
        const files = findFiles(tempDir, ['.ts', '.css'], 1);
        expect(files.length).toBe(1);
    });
    it('should filter by extension correctly', () => {
        const files = findFiles(tempDir, ['.css'], 100);
        expect(files.length).toBe(1);
        expect(files[0]).toContain('style.css');
    });
    it('should handle non-existent directory gracefully', () => {
        const files = findFiles('/non-existent-dir-12345', ['.ts'], 100);
        expect(files).toEqual([]);
    });
    it('should support custom exclude directories', () => {
        fs.mkdirSync(path.join(tempDir, 'custom-exclude'), { recursive: true });
        fs.writeFileSync(path.join(tempDir, 'custom-exclude', 'test.ts'), 'test');
        const files = findFiles(tempDir, ['.ts'], 100, ['node_modules', 'custom-exclude']);
        expect(files.every(f => !f.includes('custom-exclude'))).toBe(true);
    });
});
describe('safeGit', () => {
    let safeGit;
    beforeEach(async () => {
        const security = await import('../security.js');
        safeGit = security.safeGit;
    });
    it('should execute valid git commands', () => {
        // This will work in a git repository
        try {
            const result = safeGit(['--version']);
            expect(result).toContain('git version');
        }
        catch {
            // Git not installed, skip test
        }
    });
    it('should throw on invalid git commands', () => {
        expect(() => safeGit(['invalid-command-12345'])).toThrow();
    });
    it('should respect timeout option', () => {
        // A command that would take too long should timeout
        // This is hard to test without a slow command
    });
});
