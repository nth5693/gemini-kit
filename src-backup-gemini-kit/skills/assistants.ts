/**
 * Custom Assistants - User-defined AI assistants
 * Like ClaudeKit's custom assistant feature
 */

import { existsSync, readFileSync, writeFileSync, mkdirSync } from 'fs';
import { join } from 'path';
import { providerManager } from '../providers/index.js';
import { logger } from '../utils/logger.js';

export interface CustomAssistant {
    name: string;
    description: string;
    systemPrompt: string;
    temperature?: number;
    model?: string;
}

interface AssistantsConfig {
    assistants: CustomAssistant[];
}

const CONFIG_PATH = '.gemini-kit/assistants.json';

/**
 * Load custom assistants from config
 */
export function loadAssistants(projectRoot: string): CustomAssistant[] {
    const configPath = join(projectRoot, CONFIG_PATH);

    if (!existsSync(configPath)) {
        return getDefaultAssistants();
    }

    try {
        const config: AssistantsConfig = JSON.parse(readFileSync(configPath, 'utf-8'));
        return [...getDefaultAssistants(), ...config.assistants];
    } catch {
        return getDefaultAssistants();
    }
}

/**
 * Default built-in assistants
 */
function getDefaultAssistants(): CustomAssistant[] {
    return [
        {
            name: 'coder',
            description: 'Expert programmer for any language',
            systemPrompt: `You are an expert programmer. Write clean, efficient, well-documented code.
Follow best practices and design patterns. Explain complex logic briefly.
Always provide complete, working code solutions.`
        },
        {
            name: 'reviewer',
            description: 'Code review specialist',
            systemPrompt: `You are a senior code reviewer. Analyze code for:
- Bugs and security issues
- Performance optimizations
- Code style and best practices
- Suggest improvements with examples
Be constructive and specific.`
        },
        {
            name: 'architect',
            description: 'System design and architecture',
            systemPrompt: `You are a software architect. Help with:
- System design and architecture decisions
- Database schema design
- API design and patterns
- Scalability and performance
Provide diagrams in mermaid when helpful.`
        },
        {
            name: 'debugger',
            description: 'Expert bug hunter',
            systemPrompt: `You are an expert debugger. When given an error or bug:
- Analyze the root cause
- Explain why it happens
- Provide the exact fix
- Suggest how to prevent similar bugs
Be systematic and thorough.`
        },
        {
            name: 'docs',
            description: 'Documentation writer',
            systemPrompt: `You are a technical writer. Create clear, comprehensive documentation:
- README files
- API documentation
- User guides
- Code comments
Use clear language and helpful examples.`
        }
    ];
}

/**
 * Save new custom assistant
 */
export function saveAssistant(projectRoot: string, assistant: CustomAssistant): void {
    const configPath = join(projectRoot, CONFIG_PATH);
    const configDir = join(projectRoot, '.gemini-kit');

    if (!existsSync(configDir)) {
        mkdirSync(configDir, { recursive: true });
    }

    let config: AssistantsConfig = { assistants: [] };

    if (existsSync(configPath)) {
        try {
            config = JSON.parse(readFileSync(configPath, 'utf-8'));
        } catch { /* use default */ }
    }

    // Check if exists, update or add
    const idx = config.assistants.findIndex(a => a.name === assistant.name);
    if (idx >= 0) {
        config.assistants[idx] = assistant;
    } else {
        config.assistants.push(assistant);
    }

    writeFileSync(configPath, JSON.stringify(config, null, 2));
    logger.success(`✅ Assistant saved: ${assistant.name}`);
}

/**
 * Chat with specific assistant
 */
export async function chatWithAssistant(
    projectRoot: string,
    assistantName: string,
    message: string,
    history: Array<{ role: string; content: string }> = []
): Promise<string> {
    const assistants = loadAssistants(projectRoot);
    const assistant = assistants.find(a => a.name.toLowerCase() === assistantName.toLowerCase());

    if (!assistant) {
        const available = assistants.map(a => a.name).join(', ');
        return `❌ Assistant "${assistantName}" not found. Available: ${available}`;
    }

    logger.info(`🤖 Using assistant: ${assistant.name}`);

    const messages = [
        { role: 'system' as const, content: assistant.systemPrompt },
        ...history.map(m => ({ role: m.role as 'user' | 'assistant', content: m.content })),
        { role: 'user' as const, content: message }
    ];

    try {
        const response = await providerManager.generate(messages);
        return response.content;
    } catch (error) {
        const msg = error instanceof Error ? error.message : 'Unknown error';
        return `❌ Error: ${msg}`;
    }
}

/**
 * List available assistants
 */
export function listAssistants(projectRoot: string): string {
    const assistants = loadAssistants(projectRoot);

    let output = '\n🤖 Available Assistants:\n';
    for (const a of assistants) {
        output += `  • ${a.name} - ${a.description}\n`;
    }
    output += `\nUsage: @use <assistant> <message>`;

    return output;
}
