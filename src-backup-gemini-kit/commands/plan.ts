/**
 * Plan Commands
 * Invokes planner + researcher agents
 */

import chalk from 'chalk';
import ora from 'ora';
import { plannerAgent } from '../agents/development/planner.js';
import { researcherAgent } from '../agents/research/researcher.js';
import { providerManager } from '../providers/index.js';

export async function planCommand(feature: string): Promise<void> {
    console.log(chalk.cyan.bold('\n📋 Planning...\n'));
    const ctx = { projectRoot: process.cwd(), currentTask: feature, sharedData: {} as Record<string, unknown> };
    const spinner = ora('Researching...').start();
    try {
        researcherAgent.initialize(ctx);
        const research = await researcherAgent.execute();
        researcherAgent.cleanup();
        if (research.success) { spinner.succeed('Research complete'); ctx.sharedData = { research: research.data }; }
    } catch (e) { spinner.warn(`Research skipped: ${e}`); }
    spinner.start('Creating plan...');
    try {
        plannerAgent.initialize(ctx);
        const plan = await plannerAgent.execute();
        plannerAgent.cleanup();
        if (plan.success) { spinner.succeed('Plan created'); console.log(chalk.green(`\n📁 Saved: ${plan.data.planPath}`)); }
        else { spinner.fail(plan.message); }
    } catch (e) { spinner.fail(`Failed: ${e}`); }
}

export async function planCiCommand(ciUrl: string): Promise<void> {
    console.log(chalk.cyan.bold('\n🔄 Analyzing CI Failure...\n'));
    const spinner = ora('Analyzing...').start();
    try {
        const prompt = `Analyze this CI failure and create a fix plan:
CI URL/Error: ${ciUrl}

Provide:
1. **Error Analysis** - What failed and why
2. **Root Cause** - Underlying issue
3. **Fix Steps** - Ordered list
4. **Prevention** - How to avoid in future
5. **Commands** - Exact commands to run`;
        const result = await providerManager.generate([{ role: 'user', content: prompt }]);
        spinner.succeed('CI fix plan created');
        console.log(result.content);
    } catch (e) { spinner.fail(`Failed: ${e}`); }
}

export async function planTwoCommand(feature: string): Promise<void> {
    console.log(chalk.cyan.bold('\n📋 Planning with 2 Approaches...\n'));
    const spinner = ora('Creating approaches...').start();
    try {
        const prompt = `Create 2 different implementation approaches for: ${feature}

## Approach A: [Name]
- **Architecture**
- **Pros**
- **Cons**
- **Time Estimate**
- **Risk Level**

## Approach B: [Name]
- **Architecture**
- **Pros**
- **Cons**
- **Time Estimate**
- **Risk Level**

## Recommendation
Which approach to use and why.`;
        const result = await providerManager.generate([{ role: 'user', content: prompt }]);
        spinner.succeed('2 approaches created');
        console.log(result.content);
    } catch (e) { spinner.fail(`Failed: ${e}`); }
}

export async function planCroCommand(page: string): Promise<void> {
    console.log(chalk.cyan.bold('\n🎯 CRO Optimization Plan...\n'));
    const spinner = ora('Analyzing...').start();
    try {
        const prompt = `Create a CRO (Conversion Rate Optimization) plan for: ${page}

1. **Current State Analysis**
2. **Conversion Funnel** - Where users drop off
3. **A/B Test Ideas** - 5 specific tests
4. **Copy Improvements** - Headlines, CTAs
5. **UX Improvements** - Layout, flow
6. **Technical Improvements** - Speed, mobile
7. **Prioritized Action Items** - Impact vs effort`;
        const result = await providerManager.generate([{ role: 'user', content: prompt }]);
        spinner.succeed('CRO plan created');
        console.log(result.content);
    } catch (e) { spinner.fail(`Failed: ${e}`); }
}

