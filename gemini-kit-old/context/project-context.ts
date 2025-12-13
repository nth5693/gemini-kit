/**
 * Project Context Manager
 * Scans project and provides context to all agents - like ClaudeKit
 */

import { readFileSync, writeFileSync, existsSync, readdirSync, statSync, mkdirSync } from 'fs';
import { join, extname, relative } from 'path';
import { providerManager } from '../providers/index.js';
import { logger } from '../utils/logger.js';

export interface ProjectFile {
    path: string;
    relativePath: string;
    type: 'file' | 'directory';
    extension?: string;
    symbols?: string[];
    linesOfCode?: number;
}

export interface ProjectContext {
    name: string;
    description?: string;
    version?: string;
    framework?: string;
    files: ProjectFile[];
    dependencies: Record<string, string>;
    devDependencies: Record<string, string>;
    summary?: string;
    structure: string;
}

class ProjectContextManager {
    private context: ProjectContext | null = null;
    private projectRoot: string = process.cwd();
    private ignoreDirs = ['node_modules', '.git', 'dist', 'build', '.next', 'coverage', '.gemini-kit'];
    private codeExtensions = ['.ts', '.tsx', '.js', '.jsx', '.py', '.go', '.rs', '.java', '.vue', '.svelte'];

    /**
     * Initialize project context
     */
    async init(projectRoot: string): Promise<ProjectContext> {
        this.projectRoot = projectRoot;
        logger.info('📂 Scanning project...');

        // Read package.json
        const packageJsonPath = join(projectRoot, 'package.json');
        let packageJson: Record<string, unknown> = {};
        if (existsSync(packageJsonPath)) {
            packageJson = JSON.parse(readFileSync(packageJsonPath, 'utf-8'));
        }

        // Scan files
        const files = await this.scanDirectory(projectRoot);
        logger.info(`📁 Found ${files.length} code files`);

        // Generate structure
        const structure = this.generateStructure(files);

        // Create context
        this.context = {
            name: (packageJson.name as string) || 'Unknown',
            description: packageJson.description as string | undefined,
            version: packageJson.version as string | undefined,
            framework: this.detectFramework(packageJson),
            files,
            dependencies: (packageJson.dependencies as Record<string, string>) || {},
            devDependencies: (packageJson.devDependencies as Record<string, string>) || {},
            structure,
        };

        return this.context;
    }

    /**
     * Scan directory for code files
     */
    private async scanDirectory(dir: string, depth = 0): Promise<ProjectFile[]> {
        const files: ProjectFile[] = [];
        if (depth > 6) return files;

        try {
            const entries = readdirSync(dir);

            for (const entry of entries) {
                if (this.ignoreDirs.includes(entry) || entry.startsWith('.')) continue;

                const fullPath = join(dir, entry);
                const stat = statSync(fullPath);

                if (stat.isDirectory()) {
                    const subFiles = await this.scanDirectory(fullPath, depth + 1);
                    files.push(...subFiles);
                } else if (stat.isFile()) {
                    const ext = extname(entry);
                    if (!this.codeExtensions.includes(ext)) continue;

                    const content = readFileSync(fullPath, 'utf-8');
                    const symbols = this.extractSymbols(content);

                    files.push({
                        path: fullPath,
                        relativePath: relative(this.projectRoot, fullPath),
                        type: 'file',
                        extension: ext,
                        symbols,
                        linesOfCode: content.split('\n').length,
                    });
                }
            }
        } catch {
            // Skip unreadable directories
        }

        return files;
    }

    /**
     * Extract symbols from file content
     */
    private extractSymbols(content: string): string[] {
        const symbols: string[] = [];
        const patterns = [
            /(?:export\s+)?(?:async\s+)?function\s+(\w+)/g,
            /(?:export\s+)?class\s+(\w+)/g,
            /(?:export\s+)?interface\s+(\w+)/g,
            /(?:export\s+)?type\s+(\w+)\s*=/g,
            /(?:export\s+)?const\s+(\w+)\s*=/g,
        ];

        for (const pattern of patterns) {
            let match;
            while ((match = pattern.exec(content)) !== null) {
                if (match[1] && !symbols.includes(match[1])) {
                    symbols.push(match[1]);
                }
            }
        }

        return symbols.slice(0, 20); // Limit symbols per file
    }

    /**
     * Generate project structure string
     */
    private generateStructure(files: ProjectFile[]): string {
        const dirs = new Set<string>();
        for (const file of files) {
            const parts = file.relativePath.split('/');
            let current = '';
            for (let i = 0; i < parts.length - 1; i++) {
                current += (current ? '/' : '') + parts[i];
                dirs.add(current);
            }
        }

        const sortedDirs = Array.from(dirs).sort();
        const tree: string[] = [];

        for (const dir of sortedDirs.slice(0, 30)) {
            const depth = dir.split('/').length - 1;
            const indent = '  '.repeat(depth);
            const name = dir.split('/').pop();
            tree.push(`${indent}├── ${name}/`);
        }

        return tree.join('\n');
    }

    /**
     * Detect framework from package.json
     */
    private detectFramework(pkg: Record<string, unknown>): string {
        const deps = { ...(pkg.dependencies as Record<string, string> || {}), ...(pkg.devDependencies as Record<string, string> || {}) };

        if (deps['next']) return 'Next.js';
        if (deps['react']) return 'React';
        if (deps['vue']) return 'Vue';
        if (deps['svelte']) return 'Svelte';
        if (deps['express']) return 'Express';
        if (deps['fastify']) return 'Fastify';
        if (deps['@nestjs/core']) return 'NestJS';
        return 'Node.js';
    }

    /**
     * Generate codebase summary using AI
     */
    async generateSummary(): Promise<string> {
        if (!this.context) {
            throw new Error('Project not initialized. Call init() first.');
        }

        const prompt = `Analyze this project and create a concise codebase summary (max 500 words):

## Project: ${this.context.name}
- Version: ${this.context.version || 'N/A'}
- Framework: ${this.context.framework}
- Total Files: ${this.context.files.length}

## Dependencies
${Object.keys(this.context.dependencies).slice(0, 15).join(', ')}

## Project Structure
${this.context.structure}

## Key Files (with symbols)
${this.context.files.slice(0, 20).map(f => `- ${f.relativePath}: ${f.symbols?.slice(0, 5).join(', ') || 'N/A'}`).join('\n')}

Create a markdown summary with:
1. **Project Overview** (2-3 sentences)
2. **Architecture** (brief description)
3. **Key Components** (list main parts)
4. **Tech Stack** (frameworks, libs)`;

        const result = await providerManager.generate([{ role: 'user', content: prompt }]);
        this.context.summary = result.content;
        return result.content;
    }

    /**
     * Save codebase summary to docs folder
     */
    async saveDocsInit(): Promise<string> {
        if (!this.context) {
            throw new Error('Project not initialized');
        }

        const docsDir = join(this.projectRoot, 'docs');
        if (!existsSync(docsDir)) {
            mkdirSync(docsDir, { recursive: true });
        }

        // Generate summary if not exists
        if (!this.context.summary) {
            await this.generateSummary();
        }

        // Create codebase-summary.md
        const summaryPath = join(docsDir, 'codebase-summary.md');
        const summaryContent = `# Codebase Summary

> Auto-generated by Gemini-Kit on ${new Date().toISOString().split('T')[0]}

${this.context.summary}

---

## Project Info

| Property | Value |
|----------|-------|
| Name | ${this.context.name} |
| Version | ${this.context.version || 'N/A'} |
| Framework | ${this.context.framework} |
| Total Files | ${this.context.files.length} |
| Total LOC | ${this.context.files.reduce((sum, f) => sum + (f.linesOfCode || 0), 0)} |

## File Structure

\`\`\`
${this.context.structure}
\`\`\`

## Key Dependencies

${Object.entries(this.context.dependencies).slice(0, 20).map(([k, v]) => `- \`${k}\`: ${v}`).join('\n')}
`;

        writeFileSync(summaryPath, summaryContent);
        logger.success(`📝 Created: ${summaryPath}`);

        return summaryPath;
    }

    /**
     * Get context for agent prompts
     */
    getContextForPrompt(): string {
        if (!this.context) {
            return '';
        }

        return `## Project Context
- **Name**: ${this.context.name}
- **Framework**: ${this.context.framework}
- **Files**: ${this.context.files.length} code files

${this.context.summary ? `## Codebase Summary\n${this.context.summary.slice(0, 1500)}` : ''}

## Key Files
${this.context.files.slice(0, 10).map(f => `- ${f.relativePath}`).join('\n')}
`;
    }

    /**
     * Get current context
     */
    getContext(): ProjectContext | null {
        return this.context;
    }

    /**
     * Load existing summary from docs
     */
    loadFromDocs(projectRoot: string): boolean {
        const summaryPath = join(projectRoot, 'docs', 'codebase-summary.md');
        if (existsSync(summaryPath)) {
            const content = readFileSync(summaryPath, 'utf-8');
            this.projectRoot = projectRoot;
            this.context = {
                name: 'Loaded from docs',
                files: [],
                dependencies: {},
                devDependencies: {},
                structure: '',
                summary: content,
            };
            return true;
        }
        return false;
    }
}

export const projectContext = new ProjectContextManager();
