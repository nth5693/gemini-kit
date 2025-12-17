/**
 * Integration Registration Tests - Test registerIntegrationTools with mocked MCP server
 */
/* eslint-disable @typescript-eslint/no-explicit-any */

import { describe, it, expect, beforeEach, vi } from 'vitest';

// Mock child_process
vi.mock('child_process', () => ({
    execSync: vi.fn(),
    execFileSync: vi.fn(),
}));

// Mock security
vi.mock('../security.js', () => ({
    safeGh: vi.fn().mockReturnValue('https://github.com/user/repo/pull/1'),
    commandExists: vi.fn().mockReturnValue(true),
    sanitize: vi.fn((x: string) => x),
}));

describe('registerIntegrationTools - Full Coverage', () => {
    let mockServer: any;
    let registeredTools: Map<string, any>;

    beforeEach(() => {
        vi.clearAllMocks();
        registeredTools = new Map();

        mockServer = {
            tool: vi.fn((name: string, description: string, schema: any, handler: any) => {
                registeredTools.set(name, { description, schema, handler });
            }),
        };
    });

    it('should register all integration tools', async () => {
        const { registerIntegrationTools } = await import('../integration.js');
        registerIntegrationTools(mockServer);

        expect(registeredTools.has('kit_github_create_pr')).toBe(true);
        expect(registeredTools.has('kit_github_get_pr')).toBe(true);
        expect(registeredTools.has('kit_jira_get_ticket')).toBe(true);
        expect(registeredTools.has('kit_github_get_issue')).toBe(true);
    });

    describe('kit_github_create_pr', () => {
        it('should create PR successfully', async () => {
            const security = await import('../security.js');
            vi.mocked(security.commandExists).mockReturnValue(true);
            vi.mocked(security.safeGh).mockReturnValue('https://github.com/user/repo/pull/123');

            const { registerIntegrationTools } = await import('../integration.js');
            registerIntegrationTools(mockServer);

            const tool = registeredTools.get('kit_github_create_pr');
            const result = await tool.handler({
                title: 'Test PR',
                body: 'Test body',
                draft: false
            });

            expect(result.content[0].text).toBeDefined();
        });

        it('should handle gh not installed', async () => {
            const security = await import('../security.js');
            vi.mocked(security.commandExists).mockReturnValue(false);

            const { registerIntegrationTools } = await import('../integration.js');
            registerIntegrationTools(mockServer);

            const tool = registeredTools.get('kit_github_create_pr');
            const result = await tool.handler({
                title: 'Test',
                body: 'Test'
            });

            expect(result.content[0].text).toBeDefined();
        });

        it('should handle errors', async () => {
            const security = await import('../security.js');
            vi.mocked(security.commandExists).mockReturnValue(true);
            vi.mocked(security.safeGh).mockImplementation(() => {
                throw new Error('PR creation failed');
            });

            const { registerIntegrationTools } = await import('../integration.js');
            registerIntegrationTools(mockServer);

            const tool = registeredTools.get('kit_github_create_pr');
            const result = await tool.handler({
                title: 'Test',
                body: 'Test'
            });

            expect(result.content[0].text).toBeDefined();
        });
    });

    describe('kit_github_get_pr', () => {
        it('should get PR successfully', async () => {
            const security = await import('../security.js');
            vi.mocked(security.commandExists).mockReturnValue(true);
            vi.mocked(security.safeGh).mockReturnValue('{"number": 123, "title": "Test PR"}');

            const { registerIntegrationTools } = await import('../integration.js');
            registerIntegrationTools(mockServer);

            const tool = registeredTools.get('kit_github_get_pr');
            const result = await tool.handler({ prNumber: 123 });

            expect(result.content[0].text).toBeDefined();
        });

        it('should handle gh not installed', async () => {
            const security = await import('../security.js');
            vi.mocked(security.commandExists).mockReturnValue(false);

            const { registerIntegrationTools } = await import('../integration.js');
            registerIntegrationTools(mockServer);

            const tool = registeredTools.get('kit_github_get_pr');
            const result = await tool.handler({ prNumber: 123 });

            expect(result.content[0].text).toBeDefined();
        });
    });

    describe('kit_github_get_issue', () => {
        it('should get issue successfully', async () => {
            const security = await import('../security.js');
            vi.mocked(security.commandExists).mockReturnValue(true);
            vi.mocked(security.safeGh).mockReturnValue('{"number": 42, "title": "Bug report"}');

            const { registerIntegrationTools } = await import('../integration.js');
            registerIntegrationTools(mockServer);

            const tool = registeredTools.get('kit_github_get_issue');
            const result = await tool.handler({ issueNumber: 42 });

            expect(result.content[0].text).toBeDefined();
        });

        it('should handle gh not installed', async () => {
            const security = await import('../security.js');
            vi.mocked(security.commandExists).mockReturnValue(false);

            const { registerIntegrationTools } = await import('../integration.js');
            registerIntegrationTools(mockServer);

            const tool = registeredTools.get('kit_github_get_issue');
            const result = await tool.handler({ issueNumber: 42 });

            expect(result.content[0].text).toBeDefined();
        });
    });

    describe('kit_jira_get_ticket', () => {
        it('should get ticket structure', async () => {
            const { registerIntegrationTools } = await import('../integration.js');
            registerIntegrationTools(mockServer);

            const tool = registeredTools.get('kit_jira_get_ticket');
            const result = await tool.handler({ ticketId: 'PROJ-123' });

            expect(result.content[0].text).toBeDefined();
        });
    });
});
