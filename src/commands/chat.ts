/**
 * Chat Command - Interactive Chat Mode (như ClaudeKit)
 * Features: Conversation History, File Reading, Codebase Search
 */

import { createInterface } from 'readline';
import { providerManager } from '../providers/index.js';
import { logger } from '../utils/logger.js';
import { existsSync, readFileSync, readdirSync, statSync } from 'fs';
import { join, relative } from 'path';

interface ChatMessage {
    role: 'user' | 'assistant' | 'system';
    content: string;
}

export async function chatCommand(): Promise<void> {
    logger.header('Gemini-Kit Chat', 'Interactive AI • Commands: @file, @search, exit');

    const history: ChatMessage[] = [];
    const cwd = process.cwd();

    // Load project context
    const projectContext = loadProjectContext();
    if (projectContext) {
        history.push({
            role: 'system',
            content: `You are a helpful AI coding assistant for project: ${projectContext.name}.
            
Project Info:
${projectContext.info}

You can read files and search code. Be concise and helpful. Use code examples when appropriate.
Respond in the same language the user uses.`
        });
        logger.info(`Project: ${projectContext.name}`);
    }

    const rl = createInterface({
        input: process.stdin,
        output: process.stdout,
    });

    const prompt = () => {
        rl.question('\n💬 You: ', async (input) => {
            const trimmed = input.trim();

            if (!trimmed) {
                prompt();
                return;
            }

            // Exit commands
            if (['exit', 'quit', 'q'].includes(trimmed.toLowerCase())) {
                logger.success('Goodbye! 👋');
                rl.close();
                return;
            }

            // Clear history
            if (trimmed.toLowerCase() === 'clear') {
                history.length = projectContext ? 1 : 0;
                logger.info('Chat history cleared');
                prompt();
                return;
            }

            // Show history
            if (trimmed.toLowerCase() === 'history') {
                console.log('\n📜 Chat History:');
                history.forEach((msg) => {
                    if (msg.role !== 'system') {
                        console.log(`  ${msg.role === 'user' ? '💬' : '🤖'} ${msg.content.slice(0, 80)}...`);
                    }
                });
                prompt();
                return;
            }

            // @file command - read a file
            if (trimmed.startsWith('@file ') || trimmed.startsWith('@f ')) {
                const filePath = trimmed.replace(/^@(file|f)\s+/, '');
                const fullPath = filePath.startsWith('/') ? filePath : join(cwd, filePath);

                if (existsSync(fullPath)) {
                    try {
                        const content = readFileSync(fullPath, 'utf-8');
                        console.log(`\n📄 ${filePath}:`);
                        console.log('─'.repeat(50));
                        console.log(content.slice(0, 2000));
                        if (content.length > 2000) console.log('\n... (truncated)');
                        console.log('─'.repeat(50));

                        // Add to context
                        history.push({
                            role: 'user',
                            content: `I'm looking at file ${filePath}:\n\`\`\`\n${content.slice(0, 3000)}\n\`\`\``
                        });
                    } catch {
                        logger.error(`Cannot read: ${filePath}`);
                    }
                } else {
                    logger.error(`File not found: ${filePath}`);
                }
                prompt();
                return;
            }

            // @search command - search files
            if (trimmed.startsWith('@search ') || trimmed.startsWith('@s ')) {
                const query = trimmed.replace(/^@(search|s)\s+/, '').toLowerCase();
                const results = searchFiles(cwd, query);

                console.log(`\n🔍 Search "${query}":`);
                if (results.length === 0) {
                    console.log('  No files found');
                } else {
                    results.slice(0, 15).forEach(f => console.log(`  📄 ${f}`));
                    if (results.length > 15) console.log(`  ... and ${results.length - 15} more`);
                }
                prompt();
                return;
            }

            // @ls command - list directory
            if (trimmed.startsWith('@ls') || trimmed === 'ls') {
                const dir = trimmed.replace(/^@?ls\s*/, '') || '.';
                const fullPath = dir.startsWith('/') ? dir : join(cwd, dir);

                try {
                    const items = readdirSync(fullPath);
                    console.log(`\n📁 ${dir}:`);
                    items.slice(0, 30).forEach(item => {
                        const itemPath = join(fullPath, item);
                        const isDir = statSync(itemPath).isDirectory();
                        console.log(`  ${isDir ? '📁' : '📄'} ${item}`);
                    });
                } catch {
                    logger.error(`Cannot list: ${dir}`);
                }
                prompt();
                return;
            }

            // Help
            if (trimmed.toLowerCase() === 'help' || trimmed === '?') {
                showHelp();
                prompt();
                return;
            }

            // Regular chat message
            history.push({ role: 'user', content: trimmed });

            try {
                logger.startSpinner('Thinking...');

                const response = await providerManager.generate(
                    history.map(m => ({ role: m.role, content: m.content }))
                );

                logger.stopSpinner();

                // Add assistant response
                history.push({ role: 'assistant', content: response.content });

                // Display response
                console.log('\n🤖 Assistant:');
                console.log(response.content);

            } catch (error) {
                logger.stopSpinner();
                const message = error instanceof Error ? error.message : 'Unknown error';
                logger.error(`Error: ${message}`);
            }

            prompt();
        });
    };

    showHelp();
    prompt();
}

function showHelp(): void {
    console.log('\n📖 Commands:');
    console.log('  @file <path>   - Read a file');
    console.log('  @search <term> - Search files');
    console.log('  @ls [dir]      - List directory');
    console.log('  history        - Show chat history');
    console.log('  clear          - Clear history');
    console.log('  exit           - Exit chat\n');
}

function searchFiles(dir: string, query: string, results: string[] = [], depth = 0): string[] {
    if (depth > 5 || results.length > 50) return results;

    const ignore = ['node_modules', '.git', 'dist', 'build', '.next', 'coverage'];

    try {
        const items = readdirSync(dir);
        for (const item of items) {
            if (ignore.includes(item)) continue;

            const fullPath = join(dir, item);
            const relativePath = relative(process.cwd(), fullPath);

            try {
                const stat = statSync(fullPath);
                if (stat.isDirectory()) {
                    searchFiles(fullPath, query, results, depth + 1);
                } else if (item.toLowerCase().includes(query) || relativePath.toLowerCase().includes(query)) {
                    results.push(relativePath);
                }
            } catch { /* skip */ }
        }
    } catch { /* skip */ }

    return results;
}

interface ProjectContext {
    name: string;
    info: string;
}

function loadProjectContext(): ProjectContext | null {
    const cwd = process.cwd();
    let name = 'Unknown';
    let info = '';

    // Read package.json
    const pkgPath = join(cwd, 'package.json');
    if (existsSync(pkgPath)) {
        try {
            const pkg = JSON.parse(readFileSync(pkgPath, 'utf-8'));
            name = pkg.name || 'Unknown';
            info += `Name: ${pkg.name}\n`;
            info += `Version: ${pkg.version}\n`;
            if (pkg.description) info += `Description: ${pkg.description}\n`;
        } catch { /* ignore */ }
    }

    // Read README first 30 lines
    const readmePath = join(cwd, 'README.md');
    if (existsSync(readmePath)) {
        try {
            const readme = readFileSync(readmePath, 'utf-8');
            info += `\nREADME:\n${readme.split('\n').slice(0, 30).join('\n')}`;
        } catch { /* ignore */ }
    }

    return info ? { name, info } : null;
}
