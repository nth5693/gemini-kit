/**
 * Team Context - Shared Context Between Agents
 * Like a team's shared workspace/communication hub
 */

import { readFileSync, existsSync } from 'fs';

export interface TeamMember {
    name: string;
    role: string;
    lastAction: string;
    timestamp: Date;
}

export interface TeamMessage {
    from: string;
    to: string | 'all';
    type: 'info' | 'request' | 'result' | 'handoff';
    content: string;
    data?: Record<string, unknown>;
    timestamp: Date;
}

export interface TeamArtifact {
    name: string;
    type: 'plan' | 'code' | 'test' | 'doc' | 'analysis';
    createdBy: string;
    path?: string;
    content?: string;
    timestamp: Date;
}

export interface TeamContext {
    // Project info
    projectRoot: string;
    currentTask: string;

    // Team members who have worked
    activeMembers: TeamMember[];

    // Communication log
    messageLog: TeamMessage[];

    // Shared artifacts (plans, code, etc.)
    artifacts: Map<string, TeamArtifact>;

    // Shared knowledge base
    knowledge: {
        codebaseInfo: {
            relevantFiles: string[];
            techStack: string[];
            structure: string[];
        };
        taskProgress: {
            planned: boolean;
            implemented: boolean;
            tested: boolean;
            reviewed: boolean;
            documented: boolean;
        };
        findings: Record<string, unknown>;
    };
}

export class TeamContextManager {
    private context: TeamContext;

    constructor(projectRoot: string, task: string) {
        this.context = {
            projectRoot,
            currentTask: task,
            activeMembers: [],
            messageLog: [],
            artifacts: new Map(),
            knowledge: {
                codebaseInfo: {
                    relevantFiles: [],
                    techStack: [],
                    structure: [],
                },
                taskProgress: {
                    planned: false,
                    implemented: false,
                    tested: false,
                    reviewed: false,
                    documented: false,
                },
                findings: {},
            },
        };
    }

    // ===== TEAM MEMBER MANAGEMENT =====

    /**
     * Register when an agent starts working
     */
    memberJoins(name: string, role: string): void {
        const existing = this.context.activeMembers.find(m => m.name === name);
        if (existing) {
            existing.lastAction = 'rejoined';
            existing.timestamp = new Date();
        } else {
            this.context.activeMembers.push({
                name,
                role,
                lastAction: 'joined',
                timestamp: new Date(),
            });
        }
    }

    /**
     * Update member's last action
     */
    memberUpdate(name: string, action: string): void {
        const member = this.context.activeMembers.find(m => m.name === name);
        if (member) {
            member.lastAction = action;
            member.timestamp = new Date();
        }
    }

    // ===== COMMUNICATION =====

    /**
     * Send message to team (like Slack)
     */
    sendMessage(from: string, to: string | 'all', type: TeamMessage['type'], content: string, data?: Record<string, unknown>): void {
        this.context.messageLog.push({
            from,
            to,
            type,
            content,
            data,
            timestamp: new Date(),
        });
    }

    /**
     * Get messages for a specific agent
     */
    getMessages(agentName: string): TeamMessage[] {
        return this.context.messageLog.filter(
            m => m.to === 'all' || m.to === agentName
        );
    }

    /**
     * Get messages FROM a specific agent
     */
    getMessagesFrom(agentName: string): TeamMessage[] {
        return this.context.messageLog.filter(m => m.from === agentName);
    }

    /**
     * Get latest handoff message (who should I pick up from?)
     */
    getLastHandoff(): TeamMessage | undefined {
        return [...this.context.messageLog]
            .reverse()
            .find(m => m.type === 'handoff');
    }

    // ===== ARTIFACTS (Shared Work Products) =====

    /**
     * Add a shared artifact (plan, code, etc.)
     */
    addArtifact(name: string, artifact: Omit<TeamArtifact, 'timestamp'>): void {
        this.context.artifacts.set(name, {
            ...artifact,
            timestamp: new Date(),
        });
    }

    /**
     * Get an artifact
     */
    getArtifact(name: string): TeamArtifact | undefined {
        return this.context.artifacts.get(name);
    }

    /**
     * Get all artifacts of a type
     */
    getArtifactsByType(type: TeamArtifact['type']): TeamArtifact[] {
        return Array.from(this.context.artifacts.values())
            .filter(a => a.type === type);
    }

    // ===== SHARED KNOWLEDGE =====

    /**
     * Add relevant files discovered by scout
     */
    addRelevantFiles(files: string[]): void {
        const existing = new Set(this.context.knowledge.codebaseInfo.relevantFiles);
        files.forEach(f => existing.add(f));
        this.context.knowledge.codebaseInfo.relevantFiles = Array.from(existing);
    }

    /**
     * Update task progress
     */
    updateProgress(step: keyof TeamContext['knowledge']['taskProgress'], done: boolean): void {
        this.context.knowledge.taskProgress[step] = done;
    }

    /**
     * Add a finding (discovery during work)
     */
    addFinding(key: string, value: unknown): void {
        this.context.knowledge.findings[key] = value;
    }

    // ===== CONTEXT ACCESS =====

    /**
     * Get full context (for agent initialization)
     */
    getFullContext(): TeamContext {
        return { ...this.context };
    }

    /**
     * Get summary for AI prompt
     */
    getSummaryForAgent(agentName: string): string {
        const recentMessages = this.getMessages(agentName).slice(-5);
        const handoff = this.getLastHandoff();
        const plans = this.getArtifactsByType('plan');
        const { taskProgress, codebaseInfo, findings } = this.context.knowledge;

        // Include project memory if available
        const projectMemory = findings['projectMemory'] as { name?: string; description?: string } | undefined;
        const lastSession = findings['lastSession'] as { task?: string; completed?: string[] } | undefined;

        return `
## Team Context Summary

### Project
${projectMemory ? `${projectMemory.name}: ${projectMemory.description}` : this.context.projectRoot}

${lastSession ? `### Last Session
- Task: ${lastSession.task}
- Completed: ${lastSession.completed?.join(', ') || 'None'}
` : ''}

### Current Task
${this.context.currentTask}

### Team Progress
- Planned: ${taskProgress.planned ? '✅' : '❌'}
- Implemented: ${taskProgress.implemented ? '✅' : '❌'}
- Tested: ${taskProgress.tested ? '✅' : '❌'}
- Reviewed: ${taskProgress.reviewed ? '✅' : '❌'}
- Documented: ${taskProgress.documented ? '✅' : '❌'}

### Relevant Files (${codebaseInfo.relevantFiles.length})
${codebaseInfo.relevantFiles.slice(0, 10).join('\n')}

### Available Plans
${plans.map(p => `- ${p.name} (by ${p.createdBy})`).join('\n') || 'None yet'}

### Recent Team Messages
${recentMessages.map(m => `[${m.from}→${m.to}] ${m.content}`).join('\n') || 'None'}

${handoff ? `### Handoff from ${handoff.from}
${handoff.content}` : ''}
`.trim();
    }

    /**
     * Load project context from files (README, package.json)
     */
    loadProjectContext(): void {
        const { projectRoot } = this.context;

        try {
            // Read package.json
            const pkgPath = `${projectRoot}/package.json`;
            if (existsSync(pkgPath)) {
                const pkg = JSON.parse(readFileSync(pkgPath, 'utf-8'));
                this.addFinding('projectMemory', {
                    name: pkg.name || 'Unknown',
                    version: pkg.version || '0.0.0',
                    description: pkg.description || '',
                    dependencies: Object.keys(pkg.dependencies || {}).slice(0, 10),
                    devDependencies: Object.keys(pkg.devDependencies || {}).slice(0, 10),
                });
            }

            // Read README if exists
            const readmePath = `${projectRoot}/README.md`;
            if (existsSync(readmePath)) {
                const readme = readFileSync(readmePath, 'utf-8');
                // Extract first 500 chars as summary
                this.addFinding('readmeSummary', readme.slice(0, 500));
            }
        } catch {
            // Ignore errors - project context is optional
        }
    }

    /**
     * Restore context from a previous session
     */
    restoreFromSession(sessionData: {
        activeMembers: TeamContext['activeMembers'];
        messageLog: TeamContext['messageLog'];
        artifacts: Array<[string, unknown]>;
        knowledge: TeamContext['knowledge'];
    }): void {
        this.context.activeMembers = sessionData.activeMembers;
        this.context.messageLog = sessionData.messageLog;
        this.context.artifacts = new Map(sessionData.artifacts as Array<[string, TeamArtifact]>);
        this.context.knowledge = sessionData.knowledge;

        // Add last session info
        this.addFinding('lastSession', {
            task: this.context.currentTask,
            completed: Object.entries(this.context.knowledge.taskProgress)
                .filter(([, done]) => done)
                .map(([step]) => step),
        });
    }
}

// Singleton for current session
let currentTeamContext: TeamContextManager | null = null;

export function initTeamContext(projectRoot: string, task: string): TeamContextManager {
    currentTeamContext = new TeamContextManager(projectRoot, task);
    currentTeamContext.loadProjectContext();
    return currentTeamContext;
}

export function getTeamContext(): TeamContextManager | null {
    return currentTeamContext;
}

export function setTeamContext(ctx: TeamContextManager): void {
    currentTeamContext = ctx;
}
