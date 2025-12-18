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
import { z } from 'zod';
import * as fs from 'fs';
import * as path from 'path';
import * as Diff from 'diff';
import { homeDir, findFiles } from './security.js';

// Constants
const LEARNING_START = '<!-- LEARNING_START';
const LEARNING_END = '<!-- LEARNING_END -->';
const MAX_FILE_SIZE_BYTES = 1 * 1024 * 1024; // 1MB limit for indexing

// Zod schemas for JSON validation (MEDIUM 3)
const DiffDataSchema = z.object({
    id: z.string(),
    file: z.string(),
    originalContent: z.string(),
    newContent: z.string(),
    description: z.string().optional(),
    createdAt: z.string(),
    applied: z.boolean(),
});

/**
 * FIX: Validate file path to prevent path traversal attacks
 * Ensures the resolved path stays within the project directory
 */
function validatePath(filePath: string, baseDir: string = process.cwd()): string {
    const resolved = path.resolve(baseDir, filePath);
    if (!resolved.startsWith(path.resolve(baseDir))) {
        throw new Error(`Path traversal detected: ${filePath}`);
    }
    return resolved;
}

export function registerKnowledgeTools(server: McpServer): void {
    // TOOL 7: SAVE LEARNING (FIX 9.5 - unique delimiter)
    server.tool(
        'kit_save_learning',
        'Save a learning/lesson from user feedback to improve future responses',
        {
            category: z.enum(['code_style', 'bug', 'preference', 'pattern', 'other']).describe('Category of the learning'),
            lesson: z.string().describe('The lesson learned'),
            context: z.string().optional().describe('Additional context'),
        },
        async ({ category, lesson, context }) => {
            try {
                const learningsDir = path.join(homeDir, '.gemini-kit', 'learnings');
                fs.mkdirSync(learningsDir, { recursive: true });

                const learningsFile = path.join(learningsDir, 'LEARNINGS.md');
                if (!fs.existsSync(learningsFile)) {
                    fs.writeFileSync(learningsFile, `# Gemini-Kit Learnings\n\n> AI tự động học từ feedback của user.\n\n---\n\n`);
                }

                const timestamp = new Date().toISOString();
                const dateStr = timestamp.split('T')[0];
                const id = Date.now();

                // Use unique delimiters that won't conflict with content (FIX 9.5)
                const entry = `
${LEARNING_START}:${category}:${id} -->
**[${category.toUpperCase()}]** - ${dateStr}

**Lesson:** ${lesson}
${context ? `\n**Context:** ${context}` : ''}
${LEARNING_END}

---
`;
                fs.appendFileSync(learningsFile, entry);

                return { content: [{ type: 'text' as const, text: `✅ Learning saved!\n\nCategory: ${category}\nLesson: ${lesson}` }] };
            } catch (error) {
                return { content: [{ type: 'text' as const, text: `❌ Error: ${error}` }] };
            }
        }
    );

    // TOOL 8: GET LEARNINGS (FIX 9.5 - parse unique delimiters)
    server.tool(
        'kit_get_learnings',
        'Get relevant learnings based on semantic search query',
        {
            query: z.string().optional().describe('Search query to find relevant learnings'),
            category: z.string().optional().describe('Filter by category'),
            limit: z.number().optional().default(5).describe('Max learnings to return'),
        },
        async ({ query, category, limit = 5 }) => {
            try {
                const learningsFile = path.join(homeDir, '.gemini-kit', 'learnings', 'LEARNINGS.md');
                if (!fs.existsSync(learningsFile)) {
                    return { content: [{ type: 'text' as const, text: 'No learnings found yet.' }] };
                }

                const content = fs.readFileSync(learningsFile, 'utf8');

                // Parse using unique delimiters (FIX 9.5)
                const learningRegex = /<!-- LEARNING_START:([^:]+):(\d+) -->([\s\S]*?)<!-- LEARNING_END -->/g;
                const sections: Array<{ category: string; id: string; content: string }> = [];

                let match;
                while ((match = learningRegex.exec(content)) !== null) {
                    sections.push({
                        category: match[1],
                        id: match[2],
                        content: match[3].trim()
                    });
                }

                // Fallback: try old format for backward compatibility
                if (sections.length === 0) {
                    const oldSections = content.split(/## \[/).slice(1).map(s => '## [' + s);
                    for (const s of oldSections) {
                        const catMatch = s.match(/\[([A-Z_]+)\]/);
                        sections.push({
                            category: catMatch ? catMatch[1].toLowerCase() : 'other',
                            id: String(Date.now()),
                            content: s
                        });
                    }
                }

                if (sections.length === 0) {
                    return { content: [{ type: 'text' as const, text: 'No learnings found.' }] };
                }

                // Filter by category
                let filtered = sections;
                if (category) {
                    filtered = sections.filter(s =>
                        s.category.toLowerCase() === category.toLowerCase()
                    );
                }

                // Search by query
                if (query) {
                    const queryTerms = query.toLowerCase().match(/\b[a-z][a-z0-9_]{2,}\b/g) || [];
                    const scored = filtered.map(section => {
                        let score = 0;
                        const sectionLower = section.content.toLowerCase();
                        for (const term of queryTerms) {
                            const matches = (sectionLower.match(new RegExp(term, 'g')) || []).length;
                            score += matches * 2;
                            if (sectionLower.includes(`lesson:** ${term}`) ||
                                sectionLower.includes(`lesson:**${term}`)) {
                                score += 5;
                            }
                        }
                        return { ...section, score };
                    });

                    filtered = scored
                        .filter(s => s.score > 0)
                        .sort((a, b) => b.score - a.score)
                        .slice(0, limit);

                    if (filtered.length === 0) {
                        return {
                            content: [{
                                type: 'text' as const,
                                text: `No relevant learnings found for: "${query}"\n\nTotal learnings: ${sections.length}`
                            }]
                        };
                    }
                } else {
                    // Most recent
                    filtered = filtered.slice(-limit);
                }

                const output = filtered.map(s => s.content).join('\n\n---\n\n');
                return {
                    content: [{
                        type: 'text' as const,
                        text: `🧠 Relevant Learnings (${filtered.length} found):\n\n${output}`
                    }]
                };
            } catch (error) {
                return { content: [{ type: 'text' as const, text: `Error: ${error}` }] };
            }
        }
    );

    // TOOL 9: STORE DIFF
    server.tool(
        'kit_store_diff',
        'Store a proposed diff for later application (Dry Run mode)',
        {
            file: z.string().describe('File path'),
            originalContent: z.string().describe('Original file content'),
            newContent: z.string().describe('Proposed new content'),
            description: z.string().optional().describe('Change description'),
        },
        async ({ file, originalContent, newContent, description }) => {
            try {
                const diffDir = path.join(homeDir, '.gemini-kit', 'pending-diffs');
                fs.mkdirSync(diffDir, { recursive: true });

                const diffId = `diff-${Date.now()}`;

                // FIX: Validate path to prevent traversal attacks
                const validatedFile = validatePath(file);

                const diffData = {
                    id: diffId,
                    file: validatedFile,
                    originalContent,
                    newContent,
                    description: description || '',
                    createdAt: new Date().toISOString(),
                    applied: false
                };
                fs.writeFileSync(path.join(diffDir, `${diffId}.json`), JSON.stringify(diffData, null, 2));

                const unifiedDiff = Diff.createPatch(
                    file,
                    originalContent,
                    newContent,
                    'original',
                    'proposed',
                    { context: 3 }
                );

                const addedLines = (unifiedDiff.match(/^\+[^+]/gm) || []).length;
                const removedLines = (unifiedDiff.match(/^-[^-]/gm) || []).length;

                return {
                    content: [{
                        type: 'text' as const,
                        text: `📝 Diff stored: ${diffId}

**File:** ${file}
**Changes:** +${addedLines} / -${removedLines} lines
${description ? `**Description:** ${description}` : ''}

\`\`\`diff
${unifiedDiff.slice(0, 3000)}${unifiedDiff.length > 3000 ? '\n... (truncated)' : ''}
\`\`\`

To apply: \`kit_apply_stored_diff\` with id: \`${diffId}\``
                    }]
                };
            } catch (error) {
                return { content: [{ type: 'text' as const, text: `Error: ${error}` }] };
            }
        }
    );

    // TOOL 10: APPLY STORED DIFF (FIX 9.2 - Conflict Detection)
    server.tool(
        'kit_apply_stored_diff',
        'Apply a previously stored diff (after user confirmation). Checks for conflicts.',
        {
            diffId: z.string().describe('Diff ID to apply'),
            force: z.boolean().optional().default(false).describe('Force apply even if file changed (DANGEROUS)')
        },
        async ({ diffId, force = false }) => {
            try {
                const diffFile = path.join(homeDir, '.gemini-kit', 'pending-diffs', `${diffId}.json`);
                if (!fs.existsSync(diffFile)) {
                    return { content: [{ type: 'text' as const, text: `❌ Diff not found: ${diffId}` }] };
                }

                // FIX HIGH 2: Re-validate path from stored JSON to prevent tampering
                const parseResult = DiffDataSchema.safeParse(JSON.parse(fs.readFileSync(diffFile, 'utf8')));
                if (!parseResult.success) {
                    return { content: [{ type: 'text' as const, text: `❌ Invalid diff data: ${parseResult.error.message}` }] };
                }
                const diffData = parseResult.data;

                // Re-validate path to prevent path traversal from tampered JSON
                try {
                    validatePath(diffData.file);
                } catch {
                    return { content: [{ type: 'text' as const, text: `❌ Invalid file path in diff: ${diffData.file}` }] };
                }

                if (diffData.applied) {
                    return { content: [{ type: 'text' as const, text: `⚠️ Diff already applied: ${diffId}` }] };
                }

                // FIX 9.2: Check for conflicts before applying
                if (fs.existsSync(diffData.file)) {
                    const currentContent = fs.readFileSync(diffData.file, 'utf8');

                    if (currentContent !== diffData.originalContent) {
                        if (!force) {
                            return {
                                content: [{
                                    type: 'text' as const,
                                    text: `❌ CONFLICT DETECTED!

**File:** ${diffData.file}
**Diff created at:** ${diffData.createdAt}

The file has been modified since the diff was created.
Your changes would be lost if applied.

**Options:**
1. Create a new diff with \`kit_store_diff\` using current content
2. Manually review and merge the changes
3. Use \`force: true\` to overwrite (DANGEROUS - will lose changes)`
                                }]
                            };
                        }
                        // Force mode - log warning but proceed
                        console.warn(`[kit_apply_stored_diff] Force applying diff ${diffId} despite conflict`);
                    }
                }

                fs.writeFileSync(diffData.file, diffData.newContent);
                fs.writeFileSync(diffFile, JSON.stringify({ ...diffData, applied: true, appliedAt: new Date().toISOString() }, null, 2));

                return { content: [{ type: 'text' as const, text: `✅ Diff applied!\n\nFile: ${diffData.file}` }] };
            } catch (error) {
                return { content: [{ type: 'text' as const, text: `Error: ${error}` }] };
            }
        }
    );

    // TOOL 12: INDEX CODEBASE (FIX 9.3 - Cross-platform, FIX 9.4 - Better regex)
    server.tool(
        'kit_index_codebase',
        'Index the codebase for keyword-based search. Run this before using kit_keyword_search.',
        {
            extensions: z.array(z.string()).optional().default(['.ts', '.js', '.tsx', '.jsx', '.py', '.go', '.rs'])
                .describe('File extensions to index'),
            maxFiles: z.number().optional().default(100).describe('Maximum files to index'),
        },
        async ({ extensions, maxFiles = 100 }) => {
            try {
                const projectDir = process.cwd();
                const indexDir = path.join(homeDir, '.gemini-kit', 'index');
                fs.mkdirSync(indexDir, { recursive: true });

                // FIX 9.3: Use cross-platform findFiles instead of Unix shell commands
                const files = findFiles(projectDir, extensions, maxFiles);

                const index: Array<{
                    file: string;
                    keywords: string[];
                    functions: string[];
                    classes: string[];
                    imports: string[];
                    lineCount: number;
                }> = [];

                // FIX: Use async file reading with concurrency limit for better performance
                const fsPromises = await import('fs/promises');
                const BATCH_SIZE = 10; // Process files in batches

                for (let i = 0; i < files.length; i += BATCH_SIZE) {
                    const batch = files.slice(i, i + BATCH_SIZE);
                    const results = await Promise.all(batch.map(async (file) => {
                        try {
                            const fullPath = path.join(projectDir, file);

                            // FIX HIGH 1: Check file size before reading (prevent DoS on large files)
                            const stats = await fsPromises.stat(fullPath);
                            if (stats.size > MAX_FILE_SIZE_BYTES) {
                                // Skip large files (minified bundles, generated code, etc.)
                                return null;
                            }

                            const content = await fsPromises.readFile(fullPath, 'utf8');
                            const lines = content.split('\n');

                            const words = content.toLowerCase().match(/\b[a-z][a-z0-9_]{2,}\b/g) || [];
                            const wordFreq: Record<string, number> = {};
                            words.forEach(w => { wordFreq[w] = (wordFreq[w] || 0) + 1; });
                            const keywords = Object.entries(wordFreq)
                                .sort((a, b) => b[1] - a[1])
                                .slice(0, 20)
                                .map(([word]) => word);

                            // FIX 9.4: Enhanced function patterns
                            const functionPatterns = [
                                // Standard functions
                                /(?:async\s+)?function\s+([a-zA-Z_][a-zA-Z0-9_]*)\s*(?:<[^>]*>)?\s*\(/g,
                                // Arrow functions with const/let/var
                                /(?:const|let|var)\s+([a-zA-Z_][a-zA-Z0-9_]*)\s*=\s*(?:async\s*)?\(/g,
                                /(?:const|let|var)\s+([a-zA-Z_][a-zA-Z0-9_]*)\s*=\s*(?:async\s*)?\([^)]*\)\s*=>/g,
                                // TypeScript generics: const foo = <T>() =>
                                /(?:const|let|var)\s+([a-zA-Z_][a-zA-Z0-9_]*)\s*=\s*(?:async\s*)?<[^>]*>\s*\(/g,
                                // Method shorthand in object/class
                                /^\s*(?:async\s+)?([a-zA-Z_][a-zA-Z0-9_]*)\s*(?:<[^>]*>)?\s*\([^)]*\)\s*{/gm,
                                // Class arrow property
                                /^\s*([a-zA-Z_][a-zA-Z0-9_]*)\s*=\s*(?:async\s*)?\([^)]*\)\s*=>/gm,
                                // Export function
                                /export\s+(?:async\s+)?function\s+([a-zA-Z_][a-zA-Z0-9_]*)/g,
                                /export\s+(?:const|let)\s+([a-zA-Z_][a-zA-Z0-9_]*)\s*=/g,
                                // React FC: const MyComponent: FC = 
                                /(?:const|let)\s+([A-Z][a-zA-Z0-9_]*)\s*:\s*(?:React\.)?FC/g,
                                // React forwardRef
                                /(?:const|let)\s+([A-Z][a-zA-Z0-9_]*)\s*=\s*(?:React\.)?forwardRef/g,
                            ];

                            const allFunctions: string[] = [];
                            for (const pattern of functionPatterns) {
                                const matches = content.match(pattern) || [];
                                for (const match of matches) {
                                    const nameMatch = match.match(/([a-zA-Z_][a-zA-Z0-9_]*)/);
                                    if (nameMatch && !['function', 'async', 'const', 'let', 'var', 'export', 'React', 'FC', 'forwardRef'].includes(nameMatch[1])) {
                                        allFunctions.push(nameMatch[1]);
                                    }
                                }
                            }
                            const functions = [...new Set(allFunctions)].slice(0, 15);

                            const classes = (content.match(/class\s+([a-zA-Z_][a-zA-Z0-9_]*)/g) || [])
                                .map(m => m.replace('class ', ''));

                            const imports = (content.match(/(?:import|from|require)\s*[('"]([^'"]+)['"]/g) || [])
                                .slice(0, 10);

                            index.push({
                                file: file.replace(/^\.\//, ''),
                                keywords,
                                functions: [...new Set(functions)].slice(0, 10),
                                classes,
                                imports,
                                lineCount: lines.length,
                            });
                        } catch {
                            return null; // Skip failed files
                        }
                    }));
                    // Filter and add valid results to index
                    results.filter(Boolean).forEach(result => {
                        if (result) index.push(result);
                    });
                }

                const indexFile = path.join(indexDir, 'codebase-index.json');
                fs.writeFileSync(indexFile, JSON.stringify({
                    projectDir,
                    indexedAt: new Date().toISOString(),
                    fileCount: index.length,
                    files: index,
                }, null, 2));

                return {
                    content: [{
                        type: 'text' as const,
                        text: `✅ Indexed ${index.length} files!\n\nIndex saved to: ${indexFile}\n\nTop files by size:\n${index.sort((a, b) => b.lineCount - a.lineCount)
                            .slice(0, 5)
                            .map(f => `- ${f.file} (${f.lineCount} lines)`)
                            .join('\n')
                            }`
                    }]
                };
            } catch (error) {
                return { content: [{ type: 'text' as const, text: `Error: ${error}` }] };
            }
        }
    );

    // TOOL 13: KEYWORD SEARCH
    server.tool(
        'kit_keyword_search',
        'Search codebase by keywords, function names, or file names (weighted keyword matching, not vector-based)',
        {
            query: z.string().describe('Search query (keywords, function name, or concept)'),
            limit: z.number().optional().default(10).describe('Max results'),
        },
        async ({ query, limit = 10 }) => {
            try {
                const indexFile = path.join(homeDir, '.gemini-kit', 'index', 'codebase-index.json');

                if (!fs.existsSync(indexFile)) {
                    return {
                        content: [{
                            type: 'text' as const,
                            text: '⚠️ No index found. Please run kit_index_codebase first!'
                        }]
                    };
                }

                const indexData = JSON.parse(fs.readFileSync(indexFile, 'utf8')) as {
                    projectDir: string;
                    files: Array<{
                        file: string;
                        keywords: string[];
                        functions: string[];
                        classes: string[];
                        lineCount: number;
                    }>;
                };

                const queryTerms = query.toLowerCase().match(/\b[a-z][a-z0-9_]{2,}\b/g) || [];

                const results = indexData.files.map(file => {
                    let score = 0;
                    for (const term of queryTerms) {
                        if (file.keywords.includes(term)) score += 2;
                        if (file.functions.some(f => f.toLowerCase().includes(term))) score += 5;
                        if (file.classes.some(c => c.toLowerCase().includes(term))) score += 5;
                        if (file.file.toLowerCase().includes(term)) score += 3;
                    }
                    return { ...file, score };
                })
                    .filter(f => f.score > 0)
                    .sort((a, b) => b.score - a.score)
                    .slice(0, limit);

                if (results.length === 0) {
                    return {
                        content: [{
                            type: 'text' as const,
                            text: `No matches found for: "${query}"\n\nTry different keywords or run kit_index_codebase to update the index.`
                        }]
                    };
                }

                return {
                    content: [{
                        type: 'text' as const,
                        text: `🔍 Search results for: "${query}"\n\n${results.map((r, i) =>
                            `${i + 1}. **${r.file}** (score: ${r.score})\n` +
                            `   Functions: ${r.functions.slice(0, 3).join(', ') || 'none'}\n` +
                            `   Classes: ${r.classes.join(', ') || 'none'}`
                        ).join('\n\n')
                            }`
                    }]
                };
            } catch (error) {
                return { content: [{ type: 'text' as const, text: `Error: ${error}` }] };
            }
        }
    );
}
