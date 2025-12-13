/**
 * Content Commands
 * Invokes copywriter agent for content creation
 */

import chalk from 'chalk';
import ora from 'ora';
import { copywriterAgent } from '../agents/creative/copywriter.js';
import { providerManager } from '../providers/index.js';

export async function contentFastCommand(description: string): Promise<void> {
    console.log(chalk.cyan.bold('\n⚡ Quick Content...\n'));
    const spinner = ora('Generating...').start();
    try {
        const prompt = `Create quick, effective content for: ${description}. Be concise but impactful.`;
        const result = await providerManager.generate([{ role: 'user', content: prompt }]);
        spinner.succeed('Content created');
        console.log(result.content);
    } catch (error) { spinner.fail(`Failed: ${error}`); }
}

export async function contentGoodCommand(description: string): Promise<void> {
    console.log(chalk.cyan.bold('\n📝 Quality Content...\n'));
    const ctx = { projectRoot: process.cwd(), currentTask: `high-quality content: ${description}`, sharedData: {} };
    const spinner = ora('Generating...').start();
    try {
        copywriterAgent.initialize(ctx);
        const result = await copywriterAgent.execute();
        copywriterAgent.cleanup();
        if (result.success) { spinner.succeed('Content created'); console.log(result.data.copy); }
        else { spinner.fail(result.message); }
    } catch (error) { spinner.fail(`Failed: ${error}`); }
}

export async function contentCroCommand(description: string): Promise<void> {
    console.log(chalk.cyan.bold('\n🎯 Creating CRO-Optimized Content...\n'));
    console.log(chalk.gray(`Description: ${description}\n`));

    const spinner = ora('Generating conversion-optimized content...').start();

    try {
        const prompt = `You are a CRO (Conversion Rate Optimization) expert copywriter.
Create high-converting content for:

${description}

Focus on:
1. **Compelling Headlines** (3 variations with A/B test recommendations)
2. **Persuasive Subheadlines** (3 variations)
3. **Value Propositions** (bullet points)
4. **Social Proof Elements** (testimonial templates)
5. **Urgency/Scarcity Triggers**
6. **Strong CTAs** (5 variations with color/placement recommendations)
7. **Above-the-fold Content** (what to show first)
8. **Objection Handlers** (FAQ-style)

Use power words, emotional triggers, and proven persuasion techniques.`;

        const result = await providerManager.generate([
            { role: 'user', content: prompt },
        ]);

        spinner.succeed('CRO content created');
        console.log(chalk.white('\n🎯 CRO-Optimized Content:\n'));
        console.log(result.content);
    } catch (error) {
        spinner.fail(`Content creation failed: ${error}`);
    }
}

export async function contentEnhanceCommand(content: string): Promise<void> {
    console.log(chalk.cyan.bold('\n✨ Enhancing Content...\n'));

    const spinner = ora('Analyzing and enhancing...').start();

    try {
        const prompt = `Enhance the following content for better engagement and clarity:

${content}

Provide:
1. Improved version with better flow
2. Key changes made
3. Readability score improvement
4. SEO suggestions`;

        const result = await providerManager.generate([
            { role: 'user', content: prompt },
        ]);

        spinner.succeed('Content enhanced');
        console.log(chalk.white('\n✨ Enhanced Content:\n'));
        console.log(result.content);
    } catch (error) {
        spinner.fail(`Enhancement failed: ${error}`);
    }
}
