/**
 * Integration Tools - GitHub, Jira
 * Tools 14, 15, 16, 17
 */

import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';
import { execSync } from 'child_process';
import { sanitize, safeGh, commandExists } from './security.js';

export function registerIntegrationTools(server: McpServer): void {
    // TOOL 14: GITHUB CREATE PR
    server.tool(
        'kit_github_create_pr',
        'Create a Pull Request on GitHub using gh CLI',
        {
            title: z.string().max(256).describe('PR title'),
            body: z.string().max(65536).describe('PR description/body'),
            base: z.string().regex(/^[a-zA-Z0-9_\-./]+$/).optional().default('main').describe('Base branch'),
            draft: z.boolean().optional().default(false).describe('Create as draft PR'),
            labels: z.array(z.string().regex(/^[a-zA-Z0-9_\-]+$/)).optional().describe('Labels to add'),
        },
        async ({ title, body, base = 'main', draft = false, labels }) => {
            try {
                if (!commandExists('gh')) {
                    return {
                        content: [{
                            type: 'text' as const,
                            text: `❌ GitHub CLI (gh) not installed.

Install it with:
- macOS: brew install gh
- Linux: https://github.com/cli/cli/blob/trunk/docs/install_linux.md

Then authenticate:
gh auth login`
                        }]
                    };
                }

                try {
                    safeGh(['auth', 'status']);
                } catch {
                    return {
                        content: [{
                            type: 'text' as const,
                            text: `❌ Not authenticated with GitHub.

Run: gh auth login`
                        }]
                    };
                }

                const args: string[] = ['pr', 'create', '--title', sanitize(title), '--body', body, '--base', base];

                if (draft) args.push('--draft');
                if (labels && labels.length > 0) {
                    args.push('--label', labels.map(l => sanitize(l)).join(','));
                }

                const result = safeGh(args);

                return {
                    content: [{
                        type: 'text' as const,
                        text: `✅ Pull Request created!\n\n${result}`
                    }]
                };
            } catch (error) {
                const errorMsg = error instanceof Error ? error.message : String(error);
                return { content: [{ type: 'text' as const, text: `❌ Error creating PR: ${errorMsg}` }] };
            }
        }
    );

    // TOOL 15: GITHUB GET PR
    server.tool(
        'kit_github_get_pr',
        'Get Pull Request details from GitHub',
        {
            prNumber: z.number().int().positive().optional().describe('PR number'),
            includeDiff: z.boolean().optional().default(false).describe('Include diff in output'),
        },
        async ({ prNumber, includeDiff = false }) => {
            try {
                if (!commandExists('gh')) {
                    return {
                        content: [{
                            type: 'text' as const,
                            text: '❌ GitHub CLI (gh) not installed. Install with: brew install gh'
                        }]
                    };
                }

                if (prNumber) {
                    const prInfo = safeGh(['pr', 'view', String(prNumber), '--json', 'title,body,state,author,labels,changedFiles,additions,deletions']);

                    const pr = JSON.parse(prInfo);
                    let output = `## PR #${prNumber}: ${pr.title}

**State:** ${pr.state}
**Author:** ${pr.author.login}
**Labels:** ${pr.labels.map((l: { name: string }) => l.name).join(', ') || 'none'}
**Changes:** +${pr.additions} / -${pr.deletions} (${pr.changedFiles} files)

### Description
${pr.body || 'No description'}`;

                    if (includeDiff) {
                        try {
                            const diff = safeGh(['pr', 'diff', String(prNumber)]);
                            output += `\n\n### Diff\n\`\`\`diff\n${diff.slice(0, 3000)}${diff.length > 3000 ? '\n... (truncated)' : ''}\n\`\`\``;
                        } catch { }
                    }

                    return { content: [{ type: 'text' as const, text: output }] };
                } else {
                    const list = safeGh(['pr', 'list', '--limit', '10', '--json', 'number,title,state,author']);

                    const prs = JSON.parse(list);
                    const output = `## Recent Pull Requests\n\n${prs.map((pr: { number: number, title: string, state: string, author: { login: string } }) =>
                        `- **#${pr.number}** ${pr.title} (${pr.state}) by @${pr.author.login}`
                    ).join('\n')}`;

                    return { content: [{ type: 'text' as const, text: output }] };
                }
            } catch (error) {
                const errorMsg = error instanceof Error ? error.message : String(error);
                return { content: [{ type: 'text' as const, text: `Error: ${errorMsg}` }] };
            }
        }
    );

    // TOOL 16: JIRA GET TICKET
    server.tool(
        'kit_jira_get_ticket',
        'Get ticket details from Jira (requires JIRA_BASE_URL and JIRA_API_TOKEN env vars)',
        {
            ticketId: z.string().describe('Jira ticket ID (e.g., PROJ-123)'),
        },
        async ({ ticketId }) => {
            try {
                const baseUrl = process.env.JIRA_BASE_URL;
                const apiToken = process.env.JIRA_API_TOKEN;
                const email = process.env.JIRA_EMAIL;

                if (!baseUrl || !apiToken || !email) {
                    return {
                        content: [{
                            type: 'text' as const,
                            text: `❌ Jira not configured.

Set these environment variables:
- JIRA_BASE_URL=https://your-domain.atlassian.net
- JIRA_EMAIL=your-email@example.com
- JIRA_API_TOKEN=your-api-token

Get API token from: https://id.atlassian.com/manage-profile/security/api-tokens`
                        }]
                    };
                }

                // FIX: Validate ticketId format to prevent command injection
                const safeTicketId = ticketId.match(/^[A-Z]+-\d+$/)?.[0];
                if (!safeTicketId) {
                    return {
                        content: [{
                            type: 'text' as const,
                            text: `❌ Invalid ticket ID format: ${ticketId}\n\nExpected format: PROJ-123`
                        }]
                    };
                }

                const auth = Buffer.from(`${email}:${apiToken}`).toString('base64');

                // FIX: Use Node.js native fetch instead of curl for cross-platform compatibility
                const response = await fetch(`${baseUrl}/rest/api/3/issue/${safeTicketId}`, {
                    method: 'GET',
                    headers: {
                        'Authorization': `Basic ${auth}`,
                        'Content-Type': 'application/json',
                    },
                });

                if (!response.ok) {
                    return {
                        content: [{
                            type: 'text' as const,
                            text: `❌ Failed to fetch ticket: ${response.status} ${response.statusText}`
                        }]
                    };
                }

                const ticket = await response.json() as {
                    errorMessages?: string[];
                    fields: {
                        summary: string;
                        status?: { name: string };
                        priority?: { name: string };
                        assignee?: { displayName: string };
                        reporter?: { displayName: string };
                        issuetype?: { name: string };
                        description?: { content?: Array<{ content?: Array<{ text?: string }> }> } | string;
                        labels?: string[];
                    };
                };

                if (ticket.errorMessages) {
                    return {
                        content: [{
                            type: 'text' as const,
                            text: `❌ Ticket not found: ${ticketId}\n\n${ticket.errorMessages.join('\n')}`
                        }]
                    };
                }

                const output = `## 🎫 ${ticketId}: ${ticket.fields.summary}

**Status:** ${ticket.fields.status?.name || 'Unknown'}
**Priority:** ${ticket.fields.priority?.name || 'None'}
**Assignee:** ${ticket.fields.assignee?.displayName || 'Unassigned'}
**Reporter:** ${ticket.fields.reporter?.displayName || 'Unknown'}
**Type:** ${ticket.fields.issuetype?.name || 'Unknown'}

### Description
${typeof ticket.fields.description === 'string'
                        ? ticket.fields.description
                        : (ticket.fields.description?.content?.[0]?.content?.[0]?.text || 'No description')}

### Labels
${ticket.fields.labels?.join(', ') || 'None'}`;

                return { content: [{ type: 'text' as const, text: output }] };
            } catch (error) {
                const errorMsg = error instanceof Error ? error.message : String(error);
                return { content: [{ type: 'text' as const, text: `Error: ${errorMsg}` }] };
            }
        }
    );

    // TOOL 17: GITHUB GET ISSUE
    server.tool(
        'kit_github_get_issue',
        'Get GitHub issue details using gh CLI',
        {
            issueNumber: z.number().describe('Issue number'),
        },
        async ({ issueNumber }) => {
            try {
                if (!commandExists('gh')) {
                    return {
                        content: [{
                            type: 'text' as const,
                            text: '❌ GitHub CLI (gh) not installed. Install with: brew install gh'
                        }]
                    };
                }

                // FIX: Use safeGh instead of execSync string
                const issueInfo = safeGh([
                    'issue', 'view', String(issueNumber),
                    '--json', 'title,body,state,author,labels,assignees'
                ]);

                const issue = JSON.parse(issueInfo);

                const output = `## 🐛 Issue #${issueNumber}: ${issue.title}

**State:** ${issue.state}
**Author:** ${issue.author.login}
**Assignees:** ${issue.assignees.map((a: { login: string }) => a.login).join(', ') || 'None'}
**Labels:** ${issue.labels.map((l: { name: string }) => l.name).join(', ') || 'None'}

### Description
${issue.body || 'No description'}`;

                return { content: [{ type: 'text' as const, text: output }] };
            } catch (error) {
                const errorMsg = error instanceof Error ? error.message : String(error);
                return { content: [{ type: 'text' as const, text: `Error: ${errorMsg}` }] };
            }
        }
    );
}
