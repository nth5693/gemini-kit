/**
 * Session Manager
 * Save and restore team context between sessions
 */

import { TeamContext, TeamContextManager, initTeamContext } from './team-context.js';
import { writeFileSync, readFileSync, existsSync, mkdirSync, readdirSync, unlinkSync } from 'fs';
import { join } from 'path';
import { logger } from '../utils/logger.js';

export interface SerializedSession {
    id: string;
    name: string;
    projectRoot: string;
    currentTask: string;
    createdAt: string;
    updatedAt: string;
    context: {
        activeMembers: TeamContext['activeMembers'];
        messageLog: TeamContext['messageLog'];
        artifacts: Array<[string, unknown]>;
        knowledge: TeamContext['knowledge'];
    };
}

export class SessionManager {
    private sessionDir: string;
    private currentSession: SerializedSession | null = null;

    constructor(projectRoot: string) {
        this.sessionDir = join(projectRoot, '.gemini-kit', 'sessions');
        this.ensureDir();
    }

    private ensureDir(): void {
        if (!existsSync(this.sessionDir)) {
            mkdirSync(this.sessionDir, { recursive: true });
        }
    }

    /**
     * Generate session ID
     */
    private generateId(): string {
        return `session_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
    }

    /**
     * Save current team context to file
     */
    save(teamCtx: TeamContextManager, name?: string): string {
        const fullContext = teamCtx.getFullContext();
        const sessionId = this.currentSession?.id || this.generateId();

        const session: SerializedSession = {
            id: sessionId,
            name: name || fullContext.currentTask.slice(0, 50),
            projectRoot: fullContext.projectRoot,
            currentTask: fullContext.currentTask,
            createdAt: this.currentSession?.createdAt || new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            context: {
                activeMembers: fullContext.activeMembers,
                messageLog: fullContext.messageLog,
                artifacts: Array.from(fullContext.artifacts.entries()),
                knowledge: fullContext.knowledge,
            },
        };

        const filePath = join(this.sessionDir, `${sessionId}.json`);
        writeFileSync(filePath, JSON.stringify(session, null, 2));

        this.currentSession = session;
        logger.success(`💾 Session saved: ${sessionId}`);

        return sessionId;
    }

    /**
     * Load a session and restore team context
     */
    load(sessionId: string): TeamContextManager | null {
        const filePath = join(this.sessionDir, `${sessionId}.json`);

        if (!existsSync(filePath)) {
            logger.error(`Session not found: ${sessionId}`);
            return null;
        }

        try {
            const data = readFileSync(filePath, 'utf-8');
            const session: SerializedSession = JSON.parse(data);

            // Restore team context
            const teamCtx = initTeamContext(session.projectRoot, session.currentTask);

            // Restore members
            session.context.activeMembers.forEach(member => {
                teamCtx.memberJoins(member.name, member.role);
            });

            // Restore messages
            session.context.messageLog.forEach(msg => {
                teamCtx.sendMessage(msg.from, msg.to, msg.type, msg.content, msg.data);
            });

            // Restore knowledge
            if (session.context.knowledge.codebaseInfo.relevantFiles) {
                teamCtx.addRelevantFiles(session.context.knowledge.codebaseInfo.relevantFiles);
            }

            Object.entries(session.context.knowledge.findings).forEach(([key, value]) => {
                teamCtx.addFinding(key, value);
            });

            // Restore progress
            Object.entries(session.context.knowledge.taskProgress).forEach(([step, done]) => {
                if (done) {
                    teamCtx.updateProgress(step as keyof TeamContext['knowledge']['taskProgress'], true);
                }
            });

            this.currentSession = session;
            logger.success(`📂 Session loaded: ${session.name}`);
            logger.info(`   Task: ${session.currentTask}`);
            logger.info(`   Last updated: ${session.updatedAt}`);

            return teamCtx;
        } catch (error) {
            logger.error(`Failed to load session: ${error}`);
            return null;
        }
    }

    /**
     * List all saved sessions
     */
    list(): SerializedSession[] {
        const files = readdirSync(this.sessionDir).filter(f => f.endsWith('.json'));
        const sessions: SerializedSession[] = [];

        for (const file of files) {
            try {
                const data = readFileSync(join(this.sessionDir, file), 'utf-8');
                const session: SerializedSession = JSON.parse(data);
                sessions.push(session);
            } catch {
                // Skip invalid files
            }
        }

        return sessions.sort((a, b) =>
            new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
        );
    }

    /**
     * Get current session
     */
    getCurrentSession(): SerializedSession | null {
        return this.currentSession;
    }

    /**
     * Delete a session
     */
    delete(sessionId: string): boolean {
        const filePath = join(this.sessionDir, `${sessionId}.json`);

        if (!existsSync(filePath)) {
            return false;
        }

        try {
            unlinkSync(filePath);
            logger.info(`🗑️ Session deleted: ${sessionId}`);
            return true;
        } catch {
            return false;
        }
    }

    /**
     * Load most recent session
     */
    loadLatest(): TeamContextManager | null {
        const sessions = this.list();
        const firstSession = sessions[0];
        if (!firstSession) {
            logger.info('No saved sessions found');
            return null;
        }

        return this.load(firstSession.id);
    }

    /**
     * Generate and save summary of current session
     */
    generateSummary(teamCtx: TeamContextManager): SessionSummary {
        const fullContext = teamCtx.getFullContext();
        const { taskProgress, findings } = fullContext.knowledge;

        const summary: SessionSummary = {
            lastTask: fullContext.currentTask,
            completedSteps: Object.entries(taskProgress)
                .filter(([, done]) => done)
                .map(([step]) => step),
            pendingSteps: Object.entries(taskProgress)
                .filter(([, done]) => !done)
                .map(([step]) => step),
            keyFiles: fullContext.knowledge.codebaseInfo.relevantFiles.slice(0, 10),
            artifactCount: fullContext.artifacts.size,
            messageCount: fullContext.messageLog.length,
            findings: Object.keys(findings),
            timestamp: new Date().toISOString(),
        };

        // Save summary to file
        const summaryPath = join(this.sessionDir, 'latest-summary.json');
        writeFileSync(summaryPath, JSON.stringify(summary, null, 2));
        logger.info('📋 Session summary saved');

        return summary;
    }

    /**
     * Get latest session summary
     */
    getLatestSummary(): SessionSummary | null {
        const summaryPath = join(this.sessionDir, 'latest-summary.json');
        if (!existsSync(summaryPath)) {
            return null;
        }

        try {
            return JSON.parse(readFileSync(summaryPath, 'utf-8'));
        } catch {
            return null;
        }
    }
}

export interface SessionSummary {
    lastTask: string;
    completedSteps: string[];
    pendingSteps: string[];
    keyFiles: string[];
    artifactCount: number;
    messageCount: number;
    findings: string[];
    timestamp: string;
}

// Singleton for current project
let currentSessionManager: SessionManager | null = null;

export function getSessionManager(projectRoot?: string): SessionManager {
    if (!currentSessionManager && projectRoot) {
        currentSessionManager = new SessionManager(projectRoot);
    }
    return currentSessionManager!;
}

export function initSessionManager(projectRoot: string): SessionManager {
    currentSessionManager = new SessionManager(projectRoot);
    return currentSessionManager;
}

