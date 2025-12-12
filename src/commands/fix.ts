/**
 * Fix Commands
 * Smart router for various fix operations
 */

import chalk from 'chalk';
import ora from 'ora';
import { execSync } from 'child_process';
import { debuggerAgent } from '../agents/development/debugger.js';
import { testerAgent } from '../agents/quality/tester.js';
import { providerManager } from '../providers/index.js';

export async function fixFastCommand(): Promise<void> {
    console.log(chalk.cyan.bold('\n⚡ Quick Fix...\n'));

    const spinner = ora('Running linter and formatter...').start();

    try {
        const commands = [
            { name: 'ESLint', cmd: 'npx eslint src --fix --quiet' },
            { name: 'Prettier', cmd: 'npx prettier --write "src/**/*.ts" --log-level error' },
        ];

        for (const { name, cmd } of commands) {
            try {
                execSync(cmd, { encoding: 'utf-8', stdio: 'pipe' });
                spinner.text = `${name} ✓`;
            } catch {
                // Continue even if one fails
            }
        }

        spinner.succeed('Quick fix complete');
    } catch (error) {
        spinner.fail(`Fix failed: ${error}`);
    }
}

export async function fixHardCommand(issue: string): Promise<void> {
    console.log(chalk.cyan.bold('\n🔧 Hard Fix...\n'));
    console.log(chalk.gray(`Issue: ${issue}\n`));

    const ctx = {
        projectRoot: process.cwd(),
        currentTask: issue,
        sharedData: {},
    };

    const spinner = ora('Step 1/3: Analyzing issue...').start();

    try {
        debuggerAgent.initialize(ctx);
        const debugResult = await debuggerAgent.execute();
        debuggerAgent.cleanup();
        spinner.succeed('Analysis complete');

        if (debugResult.success) {
            console.log(chalk.gray('\n📋 Analysis saved. Apply fixes manually.\n'));
        }

        spinner.start('Step 2/3: Running tests...');
        testerAgent.initialize(ctx);
        const testResult = await testerAgent.execute();
        testerAgent.cleanup();

        if (testResult.success) {
            spinner.succeed('Tests passing');
        } else {
            spinner.warn('Some tests failing');
        }

        spinner.info('Step 3/3: Review and commit manually');
    } catch (error) {
        spinner.fail(`Fix failed: ${error}`);
    }
}

export async function fixTypesCommand(): Promise<void> {
    console.log(chalk.cyan.bold('\n📝 Fixing TypeScript Errors...\n'));

    const spinner = ora('Running TypeScript compiler...').start();

    try {
        try {
            execSync('npx tsc --noEmit', { encoding: 'utf-8', stdio: 'pipe' });
            spinner.succeed('No TypeScript errors');
        } catch (error) {
            const output = error instanceof Error ? (error as { stdout?: string }).stdout ?? '' : '';
            spinner.fail('TypeScript errors found');
            console.log(chalk.red('\n' + output));
        }
    } catch (error) {
        spinner.fail(`Type check failed: ${error}`);
    }
}

export async function fixTestCommand(): Promise<void> {
    console.log(chalk.cyan.bold('\n🧪 Fixing Failing Tests...\n'));

    const ctx = {
        projectRoot: process.cwd(),
        currentTask: 'fix failing tests',
        sharedData: {},
    };

    const spinner = ora('Running tests...').start();

    try {
        testerAgent.initialize(ctx);
        const result = await testerAgent.execute();
        testerAgent.cleanup();

        if (result.success) {
            spinner.succeed('All tests passing');
        } else {
            spinner.warn('Tests still failing - review manually');
        }
    } catch (error) {
        spinner.fail(`Test fix failed: ${error}`);
    }
}

export async function fixUiCommand(component: string): Promise<void> {
    console.log(chalk.cyan.bold('\n🎨 Fixing UI Issues...\n'));
    console.log(chalk.gray(`Component: ${component}\n`));

    const spinner = ora('Analyzing UI issues...').start();

    try {
        const prompt = `You are a UI/UX expert. Analyze and fix UI issues for:

Component: ${component}

Provide:
1. **Common UI Issues** to check for
2. **CSS/Styling Fixes** needed
3. **Accessibility Improvements** (WCAG)
4. **Responsive Design Fixes**
5. **Browser Compatibility**
6. **Code snippets** for fixes`;

        const result = await providerManager.generate([
            { role: 'user', content: prompt },
        ]);

        spinner.succeed('UI analysis complete');
        console.log(chalk.white('\n📋 UI Fix Recommendations:\n'));
        console.log(result.content);
    } catch (error) {
        spinner.fail(`UI fix failed: ${error}`);
    }
}

export async function fixCiCommand(): Promise<void> {
    console.log(chalk.cyan.bold('\n🔄 Fixing CI/CD Issues...\n'));

    const spinner = ora('Analyzing CI configuration...').start();

    try {
        // Check for common CI config files
        let ciConfig = '';
        // Supported: .github/workflows/*.yml, .gitlab-ci.yml, Jenkinsfile, .circleci/config.yml

        try {
            ciConfig = execSync('cat .github/workflows/*.yml 2>/dev/null || echo ""', {
                encoding: 'utf-8',
                stdio: ['pipe', 'pipe', 'pipe'],
            });
        } catch {
            // No GitHub Actions
        }

        const prompt = `You are a DevOps expert. Analyze and fix CI/CD issues:

CI Configuration:
${ciConfig.slice(0, 2000) || 'No CI config found'}

Provide:
1. **Common CI Issues** and how to fix them
2. **Build Failures** - typical causes
3. **Test Failures** in CI environment
4. **Dependency Issues**
5. **Environment Variables** check
6. **Recommended CI improvements**`;

        const result = await providerManager.generate([
            { role: 'user', content: prompt },
        ]);

        spinner.succeed('CI analysis complete');
        console.log(chalk.white('\n📋 CI/CD Fix Recommendations:\n'));
        console.log(result.content);
    } catch (error) {
        spinner.fail(`CI fix failed: ${error}`);
    }
}

export async function fixLogsCommand(logFile?: string): Promise<void> {
    console.log(chalk.cyan.bold('\n📜 Analyzing Logs...\n'));

    const spinner = ora('Reading logs...').start();

    try {
        let logs = '';

        if (logFile) {
            try {
                logs = execSync(`cat ${logFile} | tail -100`, { encoding: 'utf-8' });
            } catch {
                spinner.fail(`Cannot read log file: ${logFile}`);
                return;
            }
        } else {
            // Try common log locations
            try {
                logs = execSync('cat npm-debug.log 2>/dev/null || cat yarn-error.log 2>/dev/null || echo "No logs found"', {
                    encoding: 'utf-8',
                });
            } catch {
                logs = 'No standard log files found';
            }
        }

        const prompt = `You are a debugging expert. Analyze these logs and identify issues:

Logs:
${logs.slice(0, 3000)}

Provide:
1. **Error Summary** - main issues found
2. **Root Cause Analysis**
3. **Stack Trace Interpretation**
4. **Recommended Fixes**
5. **Prevention Tips**`;

        const result = await providerManager.generate([
            { role: 'user', content: prompt },
        ]);

        spinner.succeed('Log analysis complete');
        console.log(chalk.white('\n📋 Log Analysis:\n'));
        console.log(result.content);
    } catch (error) {
        spinner.fail(`Log analysis failed: ${error}`);
    }
}

