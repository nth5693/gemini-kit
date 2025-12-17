/**
 * Git Tools - Checkpoint and Rollback
 * Tools 1, 2, 6, 11
 *
 * FIX 9.1: Added createBranch option to avoid detached HEAD state
 * FIX 1.1.0: Added git availability check
 */
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
/**
 * Check if Git is available in the system
 * Call this during server initialization to provide friendly error
 */
export declare function checkGitAvailable(): {
    available: boolean;
    version?: string;
    error?: string;
};
export declare function registerGitTools(server: McpServer): void;
