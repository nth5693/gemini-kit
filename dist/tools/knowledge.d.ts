/**
 * Knowledge Tools - Learnings, Diff, Search
 * Tools 7, 8, 9, 10, 12, 13
 *
 * FIXES:
 * - 9.2: Data Loss Prevention - conflict detection in apply_stored_diff
 * - 9.3: Platform Compatibility - use findFiles instead of shell commands
 * - 9.4: Better Regex Parsing - added more patterns
 * - 9.5: Learning Delimiter - use unique markers
 */
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
export declare function registerKnowledgeTools(server: McpServer): void;
