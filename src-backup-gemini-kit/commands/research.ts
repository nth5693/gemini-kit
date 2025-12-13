/**
 * Research Commands
 * Invokes researcher agent for deep research
 */

import chalk from 'chalk';
import ora from 'ora';
import { researcherAgent } from '../agents/research/researcher.js';
import { providerManager } from '../providers/index.js';
import { writeFileSync, existsSync, mkdirSync } from 'fs';
import { join } from 'path';

export async function researchDeepCommand(topic: string): Promise<void> {
    console.log(chalk.cyan.bold('\n🔬 Deep Research...\n'));
    console.log(chalk.gray(`Topic: ${topic}\n`));

    const ctx = {
        projectRoot: process.cwd(),
        currentTask: `deep research: ${topic}`,
        sharedData: {},
    };

    const spinner = ora('Conducting deep research...').start();

    try {
        // Phase 1: Initial research
        spinner.text = 'Phase 1/3: Initial research...';
        researcherAgent.initialize(ctx);
        const initialResult = await researcherAgent.execute();
        researcherAgent.cleanup();

        // Phase 2: Deep dive
        spinner.text = 'Phase 2/3: Deep dive analysis...';
        const deepPrompt = `Based on this initial research, provide a deep dive analysis:

Initial Research:
${(initialResult.data.research as string).slice(0, 3000)}

Now provide:
1. **Technical Deep Dive** - Implementation details
2. **Case Studies** - Real-world examples
3. **Performance Considerations**
4. **Security Implications**
5. **Scalability Analysis**
6. **Alternative Approaches Comparison**
7. **Recommended Tech Stack**
8. **Step-by-step Implementation Guide**`;

        const deepResult = await providerManager.generate([
            { role: 'user', content: deepPrompt },
        ]);

        // Phase 3: Save research
        spinner.text = 'Phase 3/3: Saving research...';
        const docsDir = join(process.cwd(), 'docs', 'research');
        if (!existsSync(docsDir)) {
            mkdirSync(docsDir, { recursive: true });
        }

        const filename = topic
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, '-')
            .slice(0, 50);
        const filepath = join(docsDir, `${filename}.md`);

        const content = `# Research: ${topic}

Generated: ${new Date().toISOString()}

## Initial Research

${initialResult.data.research}

---

## Deep Dive Analysis

${deepResult.content}
`;

        writeFileSync(filepath, content);
        spinner.succeed('Deep research complete');
        console.log(chalk.green(`\n📁 Research saved to: ${filepath}`));
    } catch (error) {
        spinner.fail(`Research failed: ${error}`);
    }
}

export async function researchQuickCommand(topic: string): Promise<void> {
    console.log(chalk.cyan.bold('\n🔍 Quick Research...\n'));
    console.log(chalk.gray(`Topic: ${topic}\n`));

    const ctx = {
        projectRoot: process.cwd(),
        currentTask: topic,
        sharedData: {},
    };

    const spinner = ora('Researching...').start();

    try {
        researcherAgent.initialize(ctx);
        const result = await researcherAgent.execute();
        researcherAgent.cleanup();

        if (result.success) {
            spinner.succeed('Research complete');
            console.log(chalk.white('\n📋 Research Results:\n'));
            console.log(result.data.research);
        } else {
            spinner.fail(result.message);
        }
    } catch (error) {
        spinner.fail(`Research failed: ${error}`);
    }
}
