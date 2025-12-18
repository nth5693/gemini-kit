/**
 * Core Tools - Project context, handoff, and artifact management
 * Extracted from kit-server.ts for better modularity
 */
import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { DEFAULT_EXTENSIONS } from './config.js';
/**
 * Register core tools with MCP server
 */
export declare function registerCoreTools(server: McpServer): void;
export { DEFAULT_EXTENSIONS };
