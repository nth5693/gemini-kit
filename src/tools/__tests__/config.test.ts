/**
 * Config Tests - Test configuration utilities
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';

// Mock fs
vi.mock('fs', () => ({
    existsSync: vi.fn(),
    readFileSync: vi.fn(),
}));

import * as fs from 'fs';

describe('config.ts', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    describe('DEFAULT_EXTENSIONS', () => {
        it('should export DEFAULT_EXTENSIONS array', async () => {
            const { DEFAULT_EXTENSIONS } = await import('../config.js');

            expect(Array.isArray(DEFAULT_EXTENSIONS)).toBe(true);
            expect(DEFAULT_EXTENSIONS).toContain('.ts');
            expect(DEFAULT_EXTENSIONS).toContain('.js');
            expect(DEFAULT_EXTENSIONS).toContain('.py');
            expect(DEFAULT_EXTENSIONS).toContain('.go');
            expect(DEFAULT_EXTENSIONS).toContain('.md');
            expect(DEFAULT_EXTENSIONS.length).toBeGreaterThan(10);
        });
    });

    describe('getFileExtensions', () => {
        it('should return custom extensions from settings', async () => {
            vi.mocked(fs.existsSync).mockReturnValue(true);
            vi.mocked(fs.readFileSync).mockReturnValue(JSON.stringify({
                fileExtensions: ['.custom', '.ext']
            }));

            const { getFileExtensions } = await import('../config.js');
            const extensions = getFileExtensions('/project');

            expect(extensions).toEqual(['.custom', '.ext']);
        });

        it('should return DEFAULT_EXTENSIONS when no settings', async () => {
            vi.mocked(fs.existsSync).mockReturnValue(false);

            const { getFileExtensions, DEFAULT_EXTENSIONS } = await import('../config.js');
            const extensions = getFileExtensions('/project');

            expect(extensions).toEqual(DEFAULT_EXTENSIONS);
        });

        it('should return DEFAULT_EXTENSIONS on parse error', async () => {
            vi.mocked(fs.existsSync).mockReturnValue(true);
            vi.mocked(fs.readFileSync).mockReturnValue('invalid json');

            const { getFileExtensions, DEFAULT_EXTENSIONS } = await import('../config.js');
            const extensions = getFileExtensions('/project');

            expect(extensions).toEqual(DEFAULT_EXTENSIONS);
        });
    });

    describe('loadProjectSettings', () => {
        it('should load settings from file', async () => {
            vi.mocked(fs.existsSync).mockReturnValue(true);
            vi.mocked(fs.readFileSync).mockReturnValue(JSON.stringify({
                customKey: 'customValue'
            }));

            const { loadProjectSettings } = await import('../config.js');
            const settings = loadProjectSettings('/project');

            expect(settings.customKey).toBe('customValue');
        });

        it('should return empty object when no file', async () => {
            vi.mocked(fs.existsSync).mockReturnValue(false);

            const { loadProjectSettings } = await import('../config.js');
            const settings = loadProjectSettings('/project');

            expect(settings).toEqual({});
        });
    });
});
