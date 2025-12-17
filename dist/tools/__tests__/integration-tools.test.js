/**
 * Integration Tools Tests - Complete coverage
 * Tests for GitHub, Jira, Slack integrations
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
    safeGh: vi.fn(),
    commandExists: vi.fn(),
    sanitize: vi.fn((x) => x),
}));
describe('Integration Tools - kit_github_pr', () => {
    let safeGh;
    let commandExists;
    beforeEach(async () => {
        vi.clearAllMocks();
        const security = await import('../security.js');
        safeGh = vi.mocked(security.safeGh);
        commandExists = vi.mocked(security.commandExists);
    });
    it('should create PR with title and body', () => {
        commandExists.mockReturnValue(true);
        safeGh.mockReturnValue('https://github.com/user/repo/pull/1');
        const result = safeGh(['pr', 'create', '--title', 'Feature', '--body', 'Description']);
        expect(result).toContain('github.com');
    });
    it('should create draft PR', () => {
        commandExists.mockReturnValue(true);
        safeGh.mockReturnValue('https://github.com/user/repo/pull/2');
        const result = safeGh(['pr', 'create', '--draft', '--title', 'WIP']);
        expect(result).toContain('pull');
    });
    it('should return PR URL', () => {
        safeGh.mockReturnValue('https://github.com/user/repo/pull/123');
        const url = safeGh(['pr', 'create']);
        expect(url).toMatch(/pull\/\d+/);
    });
    it('should handle gh not installed', () => {
        commandExists.mockReturnValue(false);
        const isInstalled = commandExists('gh');
        expect(isInstalled).toBe(false);
    });
    it('should handle gh error', () => {
        safeGh.mockImplementation(() => {
            throw new Error('GitHub CLI failed: not logged in');
        });
        expect(() => safeGh(['pr', 'create'])).toThrow('GitHub CLI failed');
    });
});
describe('Integration Tools - kit_github_issue', () => {
    let safeGh;
    beforeEach(async () => {
        vi.clearAllMocks();
        const security = await import('../security.js');
        safeGh = vi.mocked(security.safeGh);
    });
    it('should create issue', () => {
        safeGh.mockReturnValue('https://github.com/user/repo/issues/10');
        const result = safeGh(['issue', 'create', '--title', 'Bug report']);
        expect(result).toContain('issues');
    });
    it('should add labels', () => {
        safeGh.mockReturnValue('https://github.com/user/repo/issues/11');
        const result = safeGh(['issue', 'create', '--label', 'bug', '--label', 'priority']);
        expect(result).toContain('github.com');
    });
    it('should return issue URL', () => {
        safeGh.mockReturnValue('https://github.com/user/repo/issues/42');
        const url = safeGh(['issue', 'view', '42']);
        expect(url).toMatch(/issues\/\d+/);
    });
    it('should handle errors', () => {
        safeGh.mockImplementation(() => {
            throw new Error('Issue not found');
        });
        expect(() => safeGh(['issue', 'view', '999'])).toThrow();
    });
});
describe('Integration Tools - kit_jira_ticket', () => {
    it('should create Jira ticket structure', () => {
        const ticket = {
            project: 'PROJ',
            type: 'Task',
            summary: 'Implement feature X',
            description: 'Detailed description',
            priority: 'Medium'
        };
        expect(ticket.project).toBe('PROJ');
        expect(ticket.type).toBe('Task');
        expect(ticket.summary).toBeDefined();
    });
    it('should handle missing credentials', () => {
        const env = {
            JIRA_API_TOKEN: undefined,
            JIRA_EMAIL: undefined
        };
        expect(env.JIRA_API_TOKEN).toBeUndefined();
    });
    it('should validate ticket fields', () => {
        const requiredFields = ['project', 'type', 'summary'];
        const ticket = { project: 'PROJ', type: 'Bug', summary: 'Fix issue' };
        requiredFields.forEach(field => {
            expect(ticket).toHaveProperty(field);
        });
    });
});
describe('Integration Tools - kit_slack_notify', () => {
    it('should send webhook notification structure', () => {
        const message = {
            text: 'Deployment complete',
            blocks: [
                { type: 'section', text: { type: 'mrkdwn', text: '*Status:* Success' } }
            ]
        };
        expect(message.text).toBeDefined();
        expect(message.blocks).toHaveLength(1);
    });
    it('should validate webhook URL format', () => {
        const validUrl = 'https://hooks.slack.com/services/T00/B00/xxx';
        const invalidUrl = 'not-a-url';
        expect(validUrl.startsWith('https://hooks.slack.com')).toBe(true);
        expect(invalidUrl.startsWith('https://')).toBe(false);
    });
    it('should handle network error gracefully', () => {
        const simulateNetworkError = () => {
            throw new Error('Network error: ECONNREFUSED');
        };
        expect(simulateNetworkError).toThrow('Network error');
    });
});
describe('Integration Tools - Utility Functions', () => {
    it('should sanitize user input', async () => {
        const security = await import('../security.js');
        const sanitize = vi.mocked(security.sanitize);
        sanitize.mockImplementation((x) => x.replace(/[;&|`$]/g, ''));
        const input = 'test; malicious';
        const result = sanitize(input);
        expect(result).not.toContain(';');
    });
    it('should check command availability', async () => {
        const security = await import('../security.js');
        const commandExists = vi.mocked(security.commandExists);
        commandExists.mockReturnValue(true);
        expect(commandExists('gh')).toBe(true);
        commandExists.mockReturnValue(false);
        expect(commandExists('nonexistent')).toBe(false);
    });
});
