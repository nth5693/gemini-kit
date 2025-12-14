/**
 * Team State Management
 * Manages shared context and state between agents in a team session
 */

import * as fs from 'fs';
import * as path from 'path';
import { debounce } from '../utils.js';

export interface AgentResult {
    agent: string;
    status: 'success' | 'failure' | 'pending';
    output: string;
    timestamp: string;
    duration?: number;
}

export interface TeamSession {
    id: string;
    name: string;
    startTime: string;
    endTime?: string;
    status: 'active' | 'completed' | 'failed';
    goal: string;
    agents: AgentResult[];
    context: Record<string, unknown>;
    workflowType?: string;
    retryCount: number;
    maxRetries: number;
}

export interface TeamStateConfig {
    sessionDir: string;
    maxRetries: number;
    autoSave: boolean;
}

const DEFAULT_CONFIG: TeamStateConfig = {
    sessionDir: '.gemini-kit/sessions',
    maxRetries: 3,
    autoSave: true,
};

let currentSession: TeamSession | null = null;
let config: TeamStateConfig = DEFAULT_CONFIG;

/**
 * Initialize team state with optional config
 * Also attempts to recover any active session from previous run
 */
export function initTeamState(customConfig?: Partial<TeamStateConfig>): void {
    config = { ...DEFAULT_CONFIG, ...customConfig };

    // Ensure session directory exists
    if (!fs.existsSync(config.sessionDir)) {
        fs.mkdirSync(config.sessionDir, { recursive: true });
    }

    // Try to recover last active session
    if (!currentSession) {
        const recoveredSession = recoverActiveSession();
        if (recoveredSession) {
            currentSession = recoveredSession;
            console.log(`✅ Recovered active session: ${recoveredSession.id}`);
        }
    }
}

/**
 * Attempt to recover an active session from disk
 * Scans sessions folder for most recent active session
 */
function recoverActiveSession(): TeamSession | null {
    if (!fs.existsSync(config.sessionDir)) {
        return null;
    }

    try {
        const files = fs.readdirSync(config.sessionDir)
            .filter(f => f.endsWith('.json'))
            .sort()
            .reverse(); // Most recent first (by filename which includes timestamp)

        for (const file of files) {
            try {
                const filePath = path.join(config.sessionDir, file);
                const data = fs.readFileSync(filePath, 'utf-8');
                const session = JSON.parse(data) as TeamSession;

                if (session.status === 'active') {
                    return session;
                }
            } catch (e) {
                // Skip corrupted files
                continue;
            }
        }
    } catch (e) {
        // Session directory read error, ignore
    }

    return null;
}

/**
 * Start a new team session
 */
export function startSession(goal: string, name?: string): TeamSession {
    const id = `session-${Date.now()}`;

    currentSession = {
        id,
        name: name || `Team Session ${new Date().toISOString().slice(0, 10)}`,
        startTime: new Date().toISOString(),
        status: 'active',
        goal,
        agents: [],
        context: {},
        retryCount: 0,
        maxRetries: config.maxRetries,
    };

    if (config.autoSave) {
        saveSession();
    }

    return currentSession;
}

/**
 * Get current active session
 */
export function getCurrentSession(): TeamSession | null {
    return currentSession;
}

/**
 * Add agent result to session
 */
export function addAgentResult(result: AgentResult): void {
    if (!currentSession) {
        throw new Error('No active session. Call startSession first.');
    }

    currentSession.agents.push(result);

    if (config.autoSave) {
        saveSession();
    }
}

/**
 * Update session context (shared data between agents)
 */
export function updateContext(key: string, value: unknown): void {
    if (!currentSession) {
        throw new Error('No active session. Call startSession first.');
    }

    currentSession.context[key] = value;

    if (config.autoSave) {
        saveSession();
    }
}

/**
 * Get context value
 */
export function getContext(key: string): unknown {
    if (!currentSession) {
        return undefined;
    }
    return currentSession.context[key];
}

/**
 * Increment retry count
 */
export function incrementRetry(): number {
    if (!currentSession) {
        throw new Error('No active session.');
    }

    currentSession.retryCount++;

    if (config.autoSave) {
        saveSession();
    }

    return currentSession.retryCount;
}

/**
 * Check if can retry
 */
export function canRetry(): boolean {
    if (!currentSession) {
        return false;
    }
    return currentSession.retryCount < currentSession.maxRetries;
}

/**
 * End session
 */
export function endSession(status: 'completed' | 'failed' = 'completed'): TeamSession | null {
    if (!currentSession) {
        return null;
    }

    currentSession.status = status;
    currentSession.endTime = new Date().toISOString();

    saveSession(true); // Immediate save for critical operation

    const session = currentSession;
    currentSession = null;

    return session;
}

/**
 * Save session to file (internal sync version)
 */
function saveSessionSync(): void {
    if (!currentSession) return;

    const filePath = path.join(config.sessionDir, `${currentSession.id}.json`);
    fs.writeFileSync(filePath, JSON.stringify(currentSession, null, 2));
}

/**
 * Debounced save - reduces file I/O when called rapidly
 * Waits 500ms after last call before actually writing
 */
const debouncedSave = debounce(() => {
    saveSessionSync();
}, 500);

/**
 * Save session - uses debounce for frequent calls, sync for critical operations
 */
function saveSession(immediate = false): void {
    if (!currentSession) return;

    if (immediate) {
        // Critical operations (end session) - save immediately
        saveSessionSync();
    } else {
        // Regular operations - debounce
        debouncedSave();
    }
}

/**
 * Load session from file
 */
export function loadSession(sessionId: string): TeamSession | null {
    const filePath = path.join(config.sessionDir, `${sessionId}.json`);

    if (!fs.existsSync(filePath)) {
        return null;
    }

    const data = fs.readFileSync(filePath, 'utf-8');
    currentSession = JSON.parse(data) as TeamSession;
    return currentSession;
}

/**
 * List all sessions
 */
export function listSessions(): TeamSession[] {
    if (!fs.existsSync(config.sessionDir)) {
        return [];
    }

    const files = fs.readdirSync(config.sessionDir).filter(f => f.endsWith('.json'));

    return files.map(file => {
        const data = fs.readFileSync(path.join(config.sessionDir, file), 'utf-8');
        return JSON.parse(data) as TeamSession;
    }).sort((a, b) => new Date(b.startTime).getTime() - new Date(a.startTime).getTime());
}

/**
 * Get session summary
 */
export function getSessionSummary(): string {
    if (!currentSession) {
        return 'No active session';
    }

    const duration = currentSession.endTime
        ? Math.round((new Date(currentSession.endTime).getTime() - new Date(currentSession.startTime).getTime()) / 1000)
        : Math.round((Date.now() - new Date(currentSession.startTime).getTime()) / 1000);

    const agentStats = currentSession.agents.reduce((acc, a) => {
        acc[a.status] = (acc[a.status] || 0) + 1;
        return acc;
    }, {} as Record<string, number>);

    return `
## Team Session: ${currentSession.name}
**Goal:** ${currentSession.goal}
**Status:** ${currentSession.status}
**Duration:** ${duration}s
**Agents:** ${currentSession.agents.length} total (${agentStats.success || 0} success, ${agentStats.failure || 0} failed)
**Retries:** ${currentSession.retryCount}/${currentSession.maxRetries}

### Agent Results:
${currentSession.agents.map(a => `- **${a.agent}**: ${a.status} (${a.duration || 0}ms)`).join('\n')}
`.trim();
}
