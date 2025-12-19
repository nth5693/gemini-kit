/**
 * Team State Management
 * Manages shared context and state between agents in a team session
 */
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
export declare function initTeamState(customConfig?: Partial<TeamStateConfig>): void;
/**
 * Start a new team session
 */
export declare function startSession(goal: string, name?: string): TeamSession;
/**
 * Get current active session
 */
export declare function getCurrentSession(): TeamSession | null;
export declare function addAgentResult(result: AgentResult): void;
/**
 * Update session context (shared data between agents)
 */
export declare function updateContext(key: string, value: unknown): void;
/**
 * Get context value
 */
export declare function getContext(key: string): unknown;
/**
 * Increment retry count
 */
export declare function incrementRetry(): number;
/**
 * Check if can retry
 */
export declare function canRetry(): boolean;
/**
 * End session
 */
export declare function endSession(status?: 'completed' | 'failed'): TeamSession | null;
/**
 * Flush any pending session changes immediately
 * Call this before risky operations to ensure data is saved
 */
export declare function flushSession(): void;
/**
 * Load session from file
 * Phase 1 FIX: Validates sessionId format to prevent path traversal
 */
export declare function loadSession(sessionId: string): TeamSession | null;
export declare function listSessions(limit?: number): TeamSession[];
/**
 * Get session summary
 */
export declare function getSessionSummary(): string;
