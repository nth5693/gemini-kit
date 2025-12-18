/**
 * Core Tools - Project context, handoff, and artifact management
 * Extracted from kit-server.ts for better modularity
 */
import { z } from 'zod';
import * as fs from 'fs';
import * as path from 'path';
import { safeGit, findFiles } from './security.js';
import { DEFAULT_EXTENSIONS, getFileExtensions } from './config.js';
/**
 * Register core tools with MCP server
 */
export function registerCoreTools(server) {
    // ═══════════════════════════════════════════════════════════════
    // TOOL: GET PROJECT CONTEXT (Cross-platform)
    // ═══════════════════════════════════════════════════════════════
    server.tool('kit_get_project_context', 'Gather project context including structure, dependencies, and recent changes', { depth: z.number().optional().default(2).describe('Directory depth to scan') }, async ({ depth = 2 }) => {
        try {
            const projectDir = process.cwd();
            const extensions = getFileExtensions(projectDir);
            const files = findFiles(projectDir, extensions, 50);
            // Filter by depth (approximate)
            const structure = files.filter(f => {
                const parts = f.split(path.sep);
                return parts.length <= depth + 1;
            });
            let packageInfo = null;
            const pkgPath = path.join(projectDir, 'package.json');
            if (fs.existsSync(pkgPath)) {
                try {
                    packageInfo = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));
                }
                catch { /* parse error, ignore */ }
            }
            let gitLog = '';
            try {
                gitLog = safeGit(['log', '--oneline', '-5']);
            }
            catch { /* no git log, ignore */ }
            return {
                content: [{
                        type: 'text',
                        text: JSON.stringify({
                            structure: structure,
                            package: packageInfo ? {
                                name: packageInfo.name,
                                version: packageInfo.version,
                                dependencies: Object.keys(packageInfo.dependencies || {})
                            } : null,
                            recentCommits: gitLog.split('\n').filter(Boolean),
                        }, null, 2),
                    }],
            };
        }
        catch (error) {
            return { content: [{ type: 'text', text: `Error getting context: ${error}` }] };
        }
    });
    // ═══════════════════════════════════════════════════════════════
    // TOOL: HANDOFF AGENT
    // ═══════════════════════════════════════════════════════════════
    server.tool('kit_handoff_agent', 'Handoff context to another agent in the workflow', {
        fromAgent: z.string().describe('Current agent name'),
        toAgent: z.string().describe('Target agent name'),
        context: z.string().describe('Context to pass'),
        artifacts: z.array(z.string()).optional().describe('File paths of artifacts'),
    }, async ({ fromAgent, toAgent, context, artifacts }) => {
        try {
            const handoffDir = path.join(process.cwd(), '.gemini-kit', 'handoffs');
            fs.mkdirSync(handoffDir, { recursive: true });
            const handoff = {
                timestamp: new Date().toISOString(),
                from: fromAgent,
                to: toAgent,
                context,
                artifacts: artifacts || []
            };
            const filename = `${Date.now()}-${fromAgent}-${toAgent}.json`;
            fs.writeFileSync(path.join(handoffDir, filename), JSON.stringify(handoff, null, 2));
            return {
                content: [{
                        type: 'text',
                        text: `✅ Handoff from ${fromAgent} → ${toAgent}\n\nContext: ${context.slice(0, 200)}...`
                    }]
            };
        }
        catch (error) {
            return { content: [{ type: 'text', text: `Error in handoff: ${error}` }] };
        }
    });
    // ═══════════════════════════════════════════════════════════════
    // TOOL: SAVE ARTIFACT
    // ═══════════════════════════════════════════════════════════════
    server.tool('kit_save_artifact', 'Save an artifact (plan, report, log) from agent work', {
        name: z.string().describe('Artifact name'),
        type: z.enum(['plan', 'report', 'log', 'other']).describe('Artifact type'),
        content: z.string().describe('Artifact content'),
    }, async ({ name, type, content }) => {
        try {
            const artifactDir = path.join(process.cwd(), '.gemini-kit', 'artifacts', type);
            fs.mkdirSync(artifactDir, { recursive: true });
            // Security: Use path.basename and allow only safe characters
            const safeName = path.basename(String(name))
                .replace(/[^a-zA-Z0-9-_]/g, '-')
                .slice(0, 50);
            const filename = `${safeName}-${Date.now()}.md`;
            const filepath = path.join(artifactDir, filename);
            fs.writeFileSync(filepath, content);
            return { content: [{ type: 'text', text: `✅ Artifact saved: ${filepath}` }] };
        }
        catch (error) {
            return { content: [{ type: 'text', text: `Error saving artifact: ${error}` }] };
        }
    });
}
// Export DEFAULT_EXTENSIONS for backward compatibility
export { DEFAULT_EXTENSIONS };
