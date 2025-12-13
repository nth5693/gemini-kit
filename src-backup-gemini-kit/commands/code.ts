/**
 * Code Command
 * Generate code from implementation plan
 * Usage: gk code @plans/feature.md
 */

import chalk from 'chalk';
import ora from 'ora';
import { readFileSync, existsSync } from 'fs';
import { join } from 'path';
import { providerManager } from '../providers/index.js';

export async function codeCommand(planPath: string): Promise<void> {
    console.log(chalk.cyan.bold('\n💻 Generating Code from Plan...\n'));

    // Handle @plans/... syntax
    let actualPath = planPath;
    if (planPath.startsWith('@')) {
        actualPath = join(process.cwd(), planPath.slice(1));
    }

    console.log(chalk.gray(`Plan: ${actualPath}\n`));

    const spinner = ora('Reading plan...').start();

    try {
        // Check if file exists
        if (!existsSync(actualPath)) {
            spinner.fail(`Plan file not found: ${actualPath}`);
            console.log(chalk.yellow('\nTip: Use "gk plan <feature>" to create a plan first'));
            return;
        }

        // Read plan
        const planContent = readFileSync(actualPath, 'utf-8');

        spinner.text = 'Analyzing plan...';

        // Generate code based on plan
        const prompt = `You are a senior software engineer. Based on this implementation plan, generate the code:

<plan>
${planContent}
</plan>

For each file mentioned in the plan:
1. Show the full file path
2. Provide complete, working code
3. Include all imports
4. Add helpful comments
5. Follow best practices

Format your response as:
## File: path/to/file.ts
\`\`\`typescript
// code here
\`\`\`

Generate all files needed to implement this plan.`;

        spinner.text = 'Generating code...';

        const result = await providerManager.generate([
            { role: 'user', content: prompt },
        ]);

        spinner.succeed('Code generated');

        console.log(chalk.white('\n📝 Generated Code:\n'));
        console.log(result.content);

        console.log(chalk.yellow('\n⚠️  Review the generated code and create files manually.'));
        console.log(chalk.gray('Tip: Copy each code block to its respective file path.\n'));
    } catch (error) {
        spinner.fail(`Code generation failed: ${error}`);
    }
}
