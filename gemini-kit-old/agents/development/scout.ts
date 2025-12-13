/**
 * Scout Agent - Level 2
 * SEMANTIC SEARCH + SYMBOL EXTRACTION + DEPENDENCY GRAPH
 */

import { BaseAgent, AgentOutput } from '../base-agent.js';
import { getTeamContext } from '../../context/team-context.js';
import { readdirSync, statSync, readFileSync, existsSync, writeFileSync, mkdirSync } from 'fs';
import { join, extname, relative } from 'path';
import { logger } from '../../utils/logger.js';

export interface ScoutResult {
    path: string;
    type: 'file' | 'directory';
    relevance: 'high' | 'medium' | 'low';
    reason: string;
    symbols?: string[];
    matchedLines?: string[];
    imports?: string[];
}

export interface DependencyNode {
    file: string;
    imports: string[];
    exports: string[];
    importedBy: string[];
}

export class ScoutAgent extends BaseAgent {
    private ignoreDirs = ['node_modules', '.git', 'dist', 'build', '.next', 'coverage', '.gemini-kit'];
    private codeExtensions = ['.ts', '.tsx', '.js', '.jsx', '.py', '.go', '.rs', '.java', '.vue', '.svelte'];

    constructor() {
        super({
            name: 'scout',
            description: 'Semantic search + dependency graph + symbol extraction',
            category: 'development',
        });
    }

    async execute(): Promise<AgentOutput> {
        const ctx = this.getContext();
        const teamCtx = getTeamContext();

        logger.agent(this.name, `Scouting for: ${ctx.currentTask}`);

        try {
            let additionalKeywords: string[] = [];
            if (teamCtx) {
                const handoff = teamCtx.getLastHandoff();
                if (handoff && handoff.to === this.name) {
                    logger.info(`📨 Received handoff from ${handoff.from}`);
                    const planData = handoff.data as { planSummary?: string } | undefined;
                    if (planData?.planSummary) {
                        additionalKeywords = this.extractKeywords(planData.planSummary);
                    }
                }
            }

            const results: ScoutResult[] = [];
            const taskKeywords = this.extractKeywords(ctx.currentTask);
            const keywords = [...new Set([...taskKeywords, ...additionalKeywords])];

            // Search codebase
            await this.searchDirectory(ctx.projectRoot, keywords, results);

            // Build dependency graph
            const dependencyGraph = this.buildDependencyGraph(ctx.projectRoot, results);

            // Sort by relevance
            results.sort((a, b) => {
                const order = { high: 0, medium: 1, low: 2 };
                return order[a.relevance] - order[b.relevance];
            });

            logger.success(`Found ${results.length} files, ${Object.keys(dependencyGraph).length} in dep graph`);

            // Save dependency graph
            const graphPath = await this.saveDependencyGraph(ctx.projectRoot, dependencyGraph);

            // Share with team
            if (teamCtx) {
                const relevantFiles = results.filter(r => r.type === 'file').map(r => r.path);
                teamCtx.addRelevantFiles(relevantFiles);

                const allSymbols = results.flatMap(r => r.symbols || []);
                teamCtx.addArtifact('codebase-analysis', {
                    name: 'scout-results',
                    type: 'analysis',
                    createdBy: this.name,
                    path: graphPath,
                    content: JSON.stringify({
                        files: results.slice(0, 20),
                        symbols: allSymbols.slice(0, 50),
                        dependencyGraph: Object.keys(dependencyGraph).slice(0, 20)
                    }, null, 2),
                });

                teamCtx.sendMessage(this.name, 'all', 'info',
                    `Found ${results.length} files, ${allSymbols.length} symbols, ${Object.keys(dependencyGraph).length} deps`);

                teamCtx.sendMessage(this.name, 'coder', 'handoff',
                    `Found relevant files with dependency graph.`,
                    { relevantFiles: relevantFiles.slice(0, 10), symbols: allSymbols.slice(0, 30), graphPath }
                );
            }

            return this.createOutput(true, `Found ${results.length} files with dependency graph`,
                { results, keywords, dependencyGraph: Object.keys(dependencyGraph).length, graphPath },
                results.filter(r => r.type === 'file').map(r => r.path), 'coder'
            );
        } catch (error) {
            const message = error instanceof Error ? error.message : 'Unknown error';
            logger.error(`Scouting failed: ${message}`);
            if (teamCtx) teamCtx.sendMessage(this.name, 'all', 'info', `⚠️ Scouting failed: ${message}`);
            return this.createOutput(false, `Scouting failed: ${message}`, { error: message });
        }
    }

    /**
     * Build dependency graph from files
     */
    private buildDependencyGraph(projectRoot: string, results: ScoutResult[]): Record<string, DependencyNode> {
        const graph: Record<string, DependencyNode> = {};
        const files = results.filter(r => r.type === 'file' && (r.path.endsWith('.ts') || r.path.endsWith('.js')));

        for (const file of files) {
            try {
                const content = readFileSync(file.path, 'utf-8');
                const relativePath = relative(projectRoot, file.path);

                // Extract imports
                const imports: string[] = [];
                const importPatterns = [
                    /import\s+.*?\s+from\s+['"](.+?)['"]/g,
                    /import\s+['"](.+?)['"]/g,
                    /require\(['"](.+?)['"]\)/g,
                ];

                for (const pattern of importPatterns) {
                    let match;
                    while ((match = pattern.exec(content)) !== null) {
                        if (match[1] && !match[1].startsWith('.')) continue; // Only local imports
                        if (match[1]) imports.push(match[1]);
                    }
                }

                // Extract exports  
                const exports: string[] = [];
                const exportMatch = content.match(/export\s+(?:const|function|class|interface|type)\s+(\w+)/g);
                if (exportMatch) {
                    for (const exp of exportMatch) {
                        const name = exp.split(/\s+/).pop();
                        if (name) exports.push(name);
                    }
                }

                graph[relativePath] = { file: relativePath, imports, exports, importedBy: [] };
            } catch { /* skip */ }
        }

        // Build reverse dependencies (importedBy)
        for (const [file, node] of Object.entries(graph)) {
            for (const imp of node.imports) {
                // Find matching file
                for (const [otherFile, otherNode] of Object.entries(graph)) {
                    if (imp.includes(otherFile.replace('.ts', '').replace('.js', ''))) {
                        otherNode.importedBy.push(file);
                    }
                }
            }
        }

        return graph;
    }

    /**
     * Save dependency graph to docs/
     */
    private async saveDependencyGraph(projectRoot: string, graph: Record<string, DependencyNode>): Promise<string> {
        const dir = join(projectRoot, 'docs', 'analysis');
        if (!existsSync(dir)) mkdirSync(dir, { recursive: true });

        const path = join(dir, 'dependency-graph.json');
        writeFileSync(path, JSON.stringify(graph, null, 2));
        return path;
    }

    private extractKeywords(task: string): string[] {
        return task.toLowerCase().replace(/[^a-z0-9\s]/g, '').split(/\s+/).filter(w => w.length > 2);
    }

    private async searchDirectory(dir: string, keywords: string[], results: ScoutResult[], depth = 0): Promise<void> {
        if (depth > 5) return;
        try {
            const entries = readdirSync(dir);
            for (const entry of entries) {
                if (this.ignoreDirs.includes(entry)) continue;
                const fullPath = join(dir, entry);
                const stat = statSync(fullPath);

                if (stat.isDirectory()) {
                    const relevance = this.checkRelevance(entry, keywords);
                    if (relevance !== 'low') {
                        results.push({ path: fullPath, type: 'directory', relevance, reason: 'Dir name matches' });
                    }
                    await this.searchDirectory(fullPath, keywords, results, depth + 1);
                } else if (stat.isFile()) {
                    const ext = extname(entry);
                    if (!this.codeExtensions.includes(ext)) continue;
                    const fileRelevance = this.checkRelevance(entry, keywords);
                    const contentResult = this.searchFileContent(fullPath, keywords);
                    const finalRelevance = contentResult.relevance === 'high' ? 'high'
                        : (fileRelevance === 'high' || contentResult.relevance === 'medium') ? 'medium' : fileRelevance;

                    if (finalRelevance !== 'low' || contentResult.symbols.length > 0) {
                        results.push({
                            path: fullPath, type: 'file', relevance: finalRelevance,
                            reason: contentResult.matchedLines.length > 0 ? `${contentResult.matchedLines.length} matches` : 'Name match',
                            symbols: contentResult.symbols, matchedLines: contentResult.matchedLines.slice(0, 5),
                            imports: contentResult.imports,
                        });
                    }
                }
            }
        } catch { /* skip */ }
    }

    private searchFileContent(filePath: string, keywords: string[]): {
        relevance: 'high' | 'medium' | 'low'; symbols: string[]; matchedLines: string[]; imports: string[];
    } {
        try {
            const content = readFileSync(filePath, 'utf-8');
            const lines = content.split('\n');
            const matchedLines: string[] = [];
            const symbols: string[] = [];
            const imports: string[] = [];

            // Extract symbols
            const symbolPatterns = [
                /(?:export\s+)?(?:async\s+)?function\s+(\w+)/g,
                /(?:export\s+)?class\s+(\w+)/g,
                /(?:export\s+)?interface\s+(\w+)/g,
                /(?:export\s+)?type\s+(\w+)\s*=/g,
                /(?:export\s+)?const\s+(\w+)\s*=/g,
            ];
            for (const pattern of symbolPatterns) {
                let match;
                while ((match = pattern.exec(content)) !== null) {
                    if (match[1] && !symbols.includes(match[1])) symbols.push(match[1]);
                }
            }

            // Extract imports
            const importMatch = content.match(/from\s+['"](.+?)['"]/g);
            if (importMatch) {
                for (const imp of importMatch) {
                    imports.push(imp.replace(/from\s+['"]/, '').replace(/['"]/, ''));
                }
            }

            // Search keywords
            const lowerContent = content.toLowerCase();
            let matchCount = 0;
            for (const keyword of keywords) {
                if (lowerContent.includes(keyword)) {
                    matchCount++;
                    for (let i = 0; i < lines.length && matchedLines.length < 10; i++) {
                        const line = lines[i];
                        if (line && line.toLowerCase().includes(keyword)) {
                            matchedLines.push(`L${i + 1}: ${line.trim().slice(0, 100)}`);
                        }
                    }
                }
            }

            const relevance: 'high' | 'medium' | 'low' = matchCount >= 3 ? 'high' : matchCount >= 1 ? 'medium' : 'low';
            return { relevance, symbols, matchedLines, imports };
        } catch {
            return { relevance: 'low', symbols: [], matchedLines: [], imports: [] };
        }
    }

    private checkRelevance(name: string, keywords: string[]): 'high' | 'medium' | 'low' {
        const lowerName = name.toLowerCase();
        let matches = 0;
        for (const keyword of keywords) if (lowerName.includes(keyword)) matches++;
        return matches >= 2 ? 'high' : matches === 1 ? 'medium' : 'low';
    }
}

export const scoutAgent = new ScoutAgent();

