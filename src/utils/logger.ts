/**
 * Beautiful Logger - ClaudeKit-style CLI output
 * Features: Spinners, Gradients, Boxes, Progress bars
 */

import chalk from 'chalk';
import ora, { Ora } from 'ora';
import gradient from 'gradient-string';
import boxen from 'boxen';
import cliProgress from 'cli-progress';

export type LogLevel = 'debug' | 'info' | 'warn' | 'error';

// Beautiful gradients
const GRADIENTS = {
    primary: gradient(['#00d4ff', '#7c3aed', '#f43f5e']),
    success: gradient(['#10b981', '#34d399', '#6ee7b7']),
    warning: gradient(['#f59e0b', '#fbbf24', '#fcd34d']),
    error: gradient(['#ef4444', '#f87171', '#fca5a5']),
    agent: gradient(['#8b5cf6', '#a78bfa', '#c4b5fd']),
};

const LOG_COLORS = {
    debug: chalk.gray,
    info: chalk.cyan,
    warn: chalk.yellow,
    error: chalk.red,
};

const LOG_PREFIXES = {
    debug: '🔍',
    info: 'ℹ️ ',
    warn: '⚠️ ',
    error: '❌',
};

class Logger {
    private level: LogLevel = 'info';
    private spinner: Ora | null = null;
    private progressBar: cliProgress.SingleBar | null = null;

    setLevel(level: LogLevel): void {
        this.level = level;
    }

    private shouldLog(level: LogLevel): boolean {
        const levels: LogLevel[] = ['debug', 'info', 'warn', 'error'];
        return levels.indexOf(level) >= levels.indexOf(this.level);
    }

    // === Beautiful Header ===
    header(title: string, subtitle?: string): void {
        const content = subtitle
            ? `${GRADIENTS.primary(title)}\n${chalk.gray(subtitle)}`
            : GRADIENTS.primary(title);

        console.log(boxen(content, {
            padding: 1,
            margin: { top: 1, bottom: 1, left: 0, right: 0 },
            borderStyle: 'double',
            borderColor: 'cyan',
            textAlignment: 'center',
        }));
    }

    // === Basic Logging ===
    debug(message: string, ...args: unknown[]): void {
        if (this.shouldLog('debug')) {
            console.log(LOG_COLORS.debug(`${LOG_PREFIXES.debug} ${message}`), ...args);
        }
    }

    info(message: string, ...args: unknown[]): void {
        if (this.shouldLog('info')) {
            console.log(LOG_COLORS.info(`${LOG_PREFIXES.info} ${message}`), ...args);
        }
    }

    warn(message: string, ...args: unknown[]): void {
        if (this.shouldLog('warn')) {
            console.warn(LOG_COLORS.warn(`${LOG_PREFIXES.warn} ${message}`), ...args);
        }
    }

    error(message: string, ...args: unknown[]): void {
        if (this.shouldLog('error')) {
            console.error(LOG_COLORS.error(`${LOG_PREFIXES.error} ${message}`), ...args);
        }
    }

    // === Agent Logging with Gradient ===
    agent(agentName: string, message: string): void {
        const prefix = GRADIENTS.agent(`🤖 [${agentName}]`);
        console.log(prefix, chalk.white(message));
    }

    // === Step Logging ===
    step(stepNumber: number, message: string): void {
        console.log(chalk.blue.bold(`\n📌 Step ${stepNumber}:`), chalk.cyan(message));
    }

    // === Success with Gradient ===
    success(message: string): void {
        console.log(GRADIENTS.success(`✅ ${message}`));
    }

    // === Box Messages ===
    box(message: string, title?: string): void {
        console.log(boxen(message, {
            padding: 1,
            borderStyle: 'round',
            borderColor: 'green',
            title: title,
            titleAlignment: 'center',
        }));
    }

    // === Spinner Methods ===
    startSpinner(message: string): void {
        this.spinner = ora({
            text: message,
            spinner: 'dots12',
            color: 'cyan',
        }).start();
    }

    updateSpinner(message: string): void {
        if (this.spinner) {
            this.spinner.text = message;
        }
    }

    succeedSpinner(message: string): void {
        if (this.spinner) {
            this.spinner.succeed(GRADIENTS.success(message));
            this.spinner = null;
        }
    }

    failSpinner(message: string): void {
        if (this.spinner) {
            this.spinner.fail(chalk.red(message));
            this.spinner = null;
        }
    }

    stopSpinner(): void {
        if (this.spinner) {
            this.spinner.stop();
            this.spinner = null;
        }
    }

    // === Progress Bar ===
    startProgress(total: number, label = 'Progress'): void {
        this.progressBar = new cliProgress.SingleBar({
            format: `${chalk.cyan(label)} |${chalk.cyan('{bar}')}| {percentage}% | {value}/{total}`,
            barCompleteChar: '█',
            barIncompleteChar: '░',
            hideCursor: true,
        });
        this.progressBar.start(total, 0);
    }

    updateProgress(value: number): void {
        if (this.progressBar) {
            this.progressBar.update(value);
        }
    }

    stopProgress(): void {
        if (this.progressBar) {
            this.progressBar.stop();
            this.progressBar = null;
        }
    }

    // === Divider ===
    divider(): void {
        console.log(chalk.gray('─'.repeat(50)));
    }

    // === Task Complete Box ===
    complete(title: string, details: string[]): void {
        const content = [
            GRADIENTS.success(`✨ ${title}`),
            '',
            ...details.map(d => chalk.white(`  • ${d}`)),
        ].join('\n');

        console.log(boxen(content, {
            padding: 1,
            margin: { top: 1, bottom: 0, left: 0, right: 0 },
            borderStyle: 'round',
            borderColor: 'green',
        }));
    }

    // === Error Box ===
    errorBox(title: string, message: string): void {
        console.log(boxen(`${chalk.red.bold(title)}\n\n${chalk.white(message)}`, {
            padding: 1,
            borderStyle: 'round',
            borderColor: 'red',
        }));
    }

    // === Workflow Step ===
    workflow(step: number, total: number, agent: string, status: 'running' | 'done' | 'error'): void {
        const statusIcon = status === 'running' ? '⏳' : status === 'done' ? '✅' : '❌';
        const statusColor = status === 'running' ? chalk.yellow : status === 'done' ? chalk.green : chalk.red;
        console.log(
            chalk.gray(`[${step}/${total}]`),
            GRADIENTS.agent(agent.padEnd(15)),
            statusColor(statusIcon)
        );
    }
}

export const logger = new Logger();
