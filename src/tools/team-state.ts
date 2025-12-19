/**
 * Team State Management
 * Manages shared context and state between agents in a team session
 */

import * as fs from 'fs';
import * as path from 'path';
import { z } from 'zod';
import { debounce } from '../utils.js';

// Zod schemas for runtime validation (HIGH 1 fix)
const AgentResultSchema = z.object({
    agent: z.string(),
    status: z.enum(['success', 'failure', 'pending']),
    output: z.string(),
    timestamp: z.string(),
    duration: z.number().optional(),
});

const TeamSessionSchema = z.object({
    id: z.string(),
    name: z.string(),
    startTime: z.string(),
    endTime: z.string().optional(),
    status: z.enum(['active', 'completed', 'failed']),
    goal: z.string(),
    agents: z.array(AgentResultSchema),
    context: z.record(z.unknown()),
    workflowType: z.string().optional(),
    retryCount: z.number(),
    maxRetries: z.number(),
});

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

// Active session pointer file (HIGH 2: O(1) recovery instead of O(N) scan)
const ACTIVE_SESSION_POINTER = '.gemini-kit/active-session.json';

let currentSession: TeamSession | null = null;
let config: TeamStateConfig = DEFAULT_CONFIG;

/**
 * Get active session ID from pointer file (O(1) lookup)
 */
function getActiveSessionPointer(): string | null {
    try {
        if (fs.existsSync(ACTIVE_SESSION_POINTER)) {
            const data = JSON.parse(fs.readFileSync(ACTIVE_SESSION_POINTER, 'utf-8'));
            return data.sessionId || null;
        }
    } catch {
        // Ignore corrupted pointer
    }
    return null;
}

/**
 * Set active session pointer
 */
function setActiveSessionPointer(sessionId: string | null): void {
    try {
        const dir = path.dirname(ACTIVE_SESSION_POINTER);
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
        }
        if (sessionId) {
            fs.writeFileSync(ACTIVE_SESSION_POINTER, JSON.stringify({ sessionId, updatedAt: new Date().toISOString() }));
        } else if (fs.existsSync(ACTIVE_SESSION_POINTER)) {
            fs.unlinkSync(ACTIVE_SESSION_POINTER);
        }
    } catch {
        // Best effort
    }
}

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
            console.error(`[gemini-kit] Recovered active session: ${recoveredSession.id}`);
        }
    }
}

/**
 * Attempt to recover an active session from disk
 * HIGH 2 FIX: First check pointer file for O(1) recovery,
 * fallback to scan only if pointer missing
 */
function recoverActiveSession(): TeamSession | null {
    if (!fs.existsSync(config.sessionDir)) {
        return null;
    }

    // First: Try O(1) lookup via pointer file
    const pointerId = getActiveSessionPointer();
    if (pointerId) {
        const pointerFile = path.join(config.sessionDir, `${pointerId}.json`);
        try {
            if (fs.existsSync(pointerFile)) {
                const data = fs.readFileSync(pointerFile, 'utf-8');
                const parsed = TeamSessionSchema.safeParse(JSON.parse(data));
                if (parsed.success && parsed.data.status === 'active') {
                    return parsed.data;
                }
            }
        } catch {
            // Pointer is stale, clear it and fallback to scan
            setActiveSessionPointer(null);
        }
    }

    // Fallback: Scan for active session (legacy behavior)
    try {
        const files = fs.readdirSync(config.sessionDir)
            .filter(f => f.endsWith('.json'))
            .sort()
            .reverse(); // Most recent first

        for (const file of files) {
            try {
                const filePath = path.join(config.sessionDir, file);
                const data = fs.readFileSync(filePath, 'utf-8');
                const parsed = TeamSessionSchema.safeParse(JSON.parse(data));

                if (parsed.success && parsed.data.status === 'active') {
                    // Update pointer for next time
                    setActiveSessionPointer(parsed.data.id);
                    return parsed.data;
                }
            } catch {
                continue;
            }
        }
    } catch {
        // Session directory read error
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

    // Set pointer for O(1) recovery
    setActiveSessionPointer(currentSession.id);

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

    // Clear pointer since session is no longer active
    setActiveSessionPointer(null);

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
 * Phase 1 FIX: Validates sessionId format to prevent path traversal
 */
export function loadSession(sessionId: string): TeamSession | null {
    // Validate sessionId format: alphanumeric + dashes only
    if (!/^[a-zA-Z0-9-]+$/.test(sessionId)) {
        console.error(`[gemini-kit] Invalid sessionId format: ${sessionId}`);
        return null;
    }

    const filePath = path.join(config.sessionDir, `${sessionId}.json`);

    if (!fs.existsSync(filePath)) {
        return null;
    }

    const data = fs.readFileSync(filePath, 'utf-8');
    const parsed = TeamSessionSchema.safeParse(JSON.parse(data));
    if (!parsed.success) {
        console.error(`[gemini-kit] Invalid session format: ${sessionId}`);
        return null;
    }
    currentSession = parsed.data;
    return currentSession;
}

/**
 * List all sessions
 */
export function listSessions(): TeamSession[] {
    if (!fs.existsSync(config.sessionDir)) {
        return [];
    }

    const files = fs.readdirSync(config.sessionDir).filter((f: string) => f.endsWith('.json'));

    // FIX HIGH 1: Use Zod validation for corrupted JSON files
    return files.map((file: string) => {
        try {
            const data = fs.readFileSync(path.join(config.sessionDir, file), 'utf-8');
            const parsed = TeamSessionSchema.safeParse(JSON.parse(data));
            if (!parsed.success) {
                console.error(`[gemini-kit] Invalid session format: ${file}`);
                return null;
            }
            return parsed.data;
        } catch {
            console.error(`[gemini-kit] Skipping corrupted session file: ${file}`);
            return null;
        }
    })
        .filter((s): s is TeamSession => s !== null)
        .sort((a: TeamSession, b: TeamSession) => new Date(b.startTime).getTime() - new Date(a.startTime).getTime());
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

// ═══════════════════════════════════════════════════════════════
// GRACEFUL SHUTDOWN HANDLERS
// Prevent data loss on unexpected process termination
// ═══════════════════════════════════════════════════════════════

function gracefulShutdown(): void {
    if (currentSession) {
        try {
            saveSessionSync();
            console.error('[gemini-kit] Session saved on exit');
        } catch (_e) {
            // Best effort save on exit
        }
    }
}

// Handle various termination signals
process.on('beforeExit', gracefulShutdown);
process.on('SIGINT', () => {
    gracefulShutdown();
    process.exit(0);
});
process.on('SIGTERM', () => {
    gracefulShutdown();
    process.exit(0);
});
process.on('uncaughtException', (error) => {
    console.error('[gemini-kit] Uncaught exception, saving session...', error);
    gracefulShutdown();
    process.exit(1);
});
