/**
 * Chat Command - Full Agentic Chat Mode (như ClaudeKit)
 * Features: Conversation, File Reading, Agent Invocation, Skills
 */

import { createInterface } from 'readline';
import { providerManager } from '../providers/index.js';
import { logger } from '../utils/logger.js';
import { existsSync, readFileSync, readdirSync, statSync } from 'fs';
import { join, relative } from 'path';
import { cookCommand } from './cook.js';
import { plannerAgent } from '../agents/development/planner.js';
import { scoutAgent } from '../agents/development/scout.js';
import { handleScreenshotCommand } from '../skills/screenshot.js';
import { createCheckpoint, listCheckpoints, rollbackToCheckpoint } from '../skills/checkpoint.js';
import { listAssistants, chatWithAssistant } from '../skills/assistants.js';

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

            // @do command - run full cook workflow
            if (trimmed.startsWith('@do ') || trimmed.startsWith('@cook ')) {
                const task = trimmed.replace(/^@(do|cook)\s+/, '');
                console.log(`\n🍳 Starting Cook workflow: "${task}"\n`);
                rl.close();
                await cookCommand(task);
                return;
            }

            // @plan command - create plan only
            if (trimmed.startsWith('@plan ')) {
                const task = trimmed.replace(/^@plan\s+/, '');
                console.log(`\n📋 Creating plan: "${task}"\n`);
                try {
                    plannerAgent.initialize({ currentTask: task, projectRoot: cwd, sharedData: {} });
                    const result = await plannerAgent.execute();
                    console.log('\n📋 Plan Result:');
                    console.log(result.message);
                    if (result.artifacts && result.artifacts.length > 0) {
                        console.log(`\n📄 Saved to: ${result.artifacts[0]}`);
                    }
                    history.push({ role: 'assistant', content: `Created plan: ${result.message}` });
                } catch (error) {
                    const msg = error instanceof Error ? error.message : 'Unknown error';
                    logger.error(`Plan failed: ${msg}`);
                }
                prompt();
                return;
            }

            // @scout command - search codebase
            if (trimmed.startsWith('@scout ')) {
                const query = trimmed.replace(/^@scout\s+/, '');
                console.log(`\n🔍 Scouting: "${query}"\n`);
                try {
                    scoutAgent.initialize({ currentTask: query, projectRoot: cwd, sharedData: {} });
                    const result = await scoutAgent.execute();
                    console.log('\n🔍 Scout Result:');
                    console.log(result.message);
                    history.push({ role: 'assistant', content: `Scout found: ${result.message}` });
                } catch (error) {
                    const msg = error instanceof Error ? error.message : 'Unknown error';
                    logger.error(`Scout failed: ${msg}`);
                }
                prompt();
                return;
            }

            // @screenshot command - convert image to code
            if (trimmed.startsWith('@screenshot ') || trimmed.startsWith('@ss ')) {
                const imagePath = trimmed.replace(/^@(screenshot|ss)\s+/, '');
                const result = await handleScreenshotCommand(imagePath, cwd);
                console.log(result);
                history.push({ role: 'assistant', content: result });
                prompt();
                return;
            }

            // @checkpoint commands
            if (trimmed === '@save' || trimmed.startsWith('@save ')) {
                const name = trimmed.replace(/^@save\s*/, '') || undefined;
                const cp = createCheckpoint(cwd, name);
                console.log(`\n📸 Checkpoint saved: ${cp.name} (${cp.files.length} files)`);
                prompt();
                return;
            }

            if (trimmed === '@checkpoints' || trimmed === '@cps') {
                const cps = listCheckpoints(cwd);
                console.log('\n📸 Checkpoints:');
                if (cps.length === 0) {
                    console.log('  No checkpoints yet. Use @save to create one.');
                } else {
                    cps.forEach(cp => {
                        console.log(`  • ${cp.id}: ${cp.name} (${new Date(cp.timestamp).toLocaleString()})`);
                    });
                }
                prompt();
                return;
            }

            if (trimmed.startsWith('@rollback ')) {
                const id = trimmed.replace(/^@rollback\s+/, '');
                const success = rollbackToCheckpoint(cwd, id);
                console.log(success ? `\n⏪ Rolled back to checkpoint: ${id}` : '\n❌ Rollback failed');
                prompt();
                return;
            }

            // @use command - use specific assistant
            if (trimmed.startsWith('@use ')) {
                const parts = trimmed.replace(/^@use\s+/, '').split(/\s+(.+)/);
                const assistantName = parts[0];
                const message = parts[1] || '';

                if (!message) {
                    console.log(`\n❓ Usage: @use <assistant> <message>`);
                    console.log(listAssistants(cwd));
                } else {
                    const response = await chatWithAssistant(cwd, assistantName || 'coder', message,
                        history.filter(m => m.role !== 'system').map(m => ({ role: m.role, content: m.content }))
                    );
                    console.log(`\n🤖 ${assistantName}:`);
                    console.log(response);
                    history.push({ role: 'assistant', content: response });
                }
                prompt();
                return;
            }

            // @assistants - list available assistants
            if (trimmed === '@assistants' || trimmed === '@ast') {
                console.log(listAssistants(cwd));
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
                // Use simple text instead of spinner (ora conflicts with readline)
                process.stdout.write('\n⏳ Thinking...');

                const response = await providerManager.generate(
                    history.map(m => ({ role: m.role, content: m.content }))
                );

                // Clear thinking message
                process.stdout.write('\r                    \r');

                // Add assistant response
                history.push({ role: 'assistant', content: response.content });

                // Display response
                console.log('🤖 Assistant:');
                console.log(response.content);

            } catch (error) {
                process.stdout.write('\r                    \r');
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
    console.log('  @do <task>       - Run full workflow (plan → code → test)');
    console.log('  @plan <task>     - Create plan only');
    console.log('  @scout <query>   - Search codebase with AI');
    console.log('  @screenshot <img>- Convert image to code');
    console.log('  @save [name]     - Create checkpoint');
    console.log('  @checkpoints     - List all checkpoints');
    console.log('  @rollback <id>   - Rollback to checkpoint');
    console.log('  @use <ast> <msg> - Use specific assistant');
    console.log('  @assistants      - List available assistants');
    console.log('  @file <path>     - Read a file');
    console.log('  @search <term>   - Search files');
    console.log('  exit             - Exit chat\n');
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
