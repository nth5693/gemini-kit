/**
 * Session Commands
 * Save, load, and manage team sessions
 */

import chalk from 'chalk';
import { initSessionManager } from '../context/session-manager.js';
import { getTeamContext } from '../context/team-context.js';

/**
 * List all saved sessions
 */
export async function sessionListCommand(): Promise<void> {
    console.log(chalk.cyan.bold('\n📂 Saved Sessions\n'));

    const sessionManager = initSessionManager(process.cwd());
    const sessions = sessionManager.list();

    if (sessions.length === 0) {
        console.log(chalk.gray('  No saved sessions found.'));
        console.log(chalk.gray('  Use `gk session save` to save a session.\n'));
        return;
    }

    console.log(chalk.white(`  Found ${sessions.length} session(s):\n`));

    sessions.forEach((session, i) => {
        const date = new Date(session.updatedAt).toLocaleString();
        console.log(chalk.yellow(`  ${i + 1}. ${session.name}`));
        console.log(chalk.gray(`     ID: ${session.id}`));
        console.log(chalk.gray(`     Task: ${session.currentTask.slice(0, 50)}...`));
        console.log(chalk.gray(`     Updated: ${date}\n`));
    });
}

/**
 * Save current session
 */
export async function sessionSaveCommand(name?: string): Promise<void> {
    console.log(chalk.cyan.bold('\n💾 Saving Session...\n'));

    const teamCtx = getTeamContext();

    if (!teamCtx) {
        console.log(chalk.red('  No active team session.'));
        console.log(chalk.gray('  Run a command like `gk cook "task"` first.\n'));
        return;
    }

    const sessionManager = initSessionManager(process.cwd());
    const sessionId = sessionManager.save(teamCtx, name);

    console.log(chalk.green(`  ✅ Session saved: ${sessionId}`));
    console.log(chalk.gray(`  Use \`gk session load ${sessionId}\` to resume.\n`));
}

/**
 * Load a session
 */
export async function sessionLoadCommand(sessionId?: string): Promise<void> {
    console.log(chalk.cyan.bold('\n📂 Loading Session...\n'));

    const sessionManager = initSessionManager(process.cwd());

    let teamCtx;
    if (sessionId) {
        teamCtx = sessionManager.load(sessionId);
    } else {
        // Load most recent
        console.log(chalk.gray('  Loading most recent session...\n'));
        teamCtx = sessionManager.loadLatest();
    }

    if (!teamCtx) {
        console.log(chalk.red('  Could not load session.'));
        console.log(chalk.gray('  Use `gk session list` to see available sessions.\n'));
        return;
    }

    const session = sessionManager.getCurrentSession();
    const progress = teamCtx.getFullContext().knowledge.taskProgress;

    console.log(chalk.green(`  ✅ Session loaded!\n`));
    console.log(chalk.white('  Task: ') + chalk.yellow(session?.currentTask));
    console.log(chalk.white('  Progress:'));
    console.log(chalk.gray(`    - Planned: ${progress.planned ? '✅' : '❌'}`));
    console.log(chalk.gray(`    - Tested: ${progress.tested ? '✅' : '❌'}`));
    console.log(chalk.gray(`    - Reviewed: ${progress.reviewed ? '✅' : '❌'}`));
    console.log(chalk.gray(`    - Documented: ${progress.documented ? '✅' : '❌'}`));
    console.log();
}

/**
 * Show session info
 */
export async function sessionInfoCommand(): Promise<void> {
    console.log(chalk.cyan.bold('\n📋 Current Session Info\n'));

    const teamCtx = getTeamContext();

    if (!teamCtx) {
        console.log(chalk.gray('  No active session.'));
        console.log(chalk.gray('  Run `gk session load` or start a new task.\n'));
        return;
    }

    const ctx = teamCtx.getFullContext();
    const artifacts = Array.from(ctx.artifacts.values());

    console.log(chalk.white('  Task: ') + chalk.yellow(ctx.currentTask));
    console.log(chalk.white('  Project: ') + chalk.gray(ctx.projectRoot));
    console.log();

    console.log(chalk.white('  Team Members:'));
    ctx.activeMembers.forEach(m => {
        console.log(chalk.gray(`    - ${m.name} (${m.role}): ${m.lastAction}`));
    });
    console.log();

    console.log(chalk.white('  Progress:'));
    const progress = ctx.knowledge.taskProgress;
    console.log(chalk.gray(`    - Planned: ${progress.planned ? '✅' : '❌'}`));
    console.log(chalk.gray(`    - Implemented: ${progress.implemented ? '✅' : '❌'}`));
    console.log(chalk.gray(`    - Tested: ${progress.tested ? '✅' : '❌'}`));
    console.log(chalk.gray(`    - Reviewed: ${progress.reviewed ? '✅' : '❌'}`));
    console.log(chalk.gray(`    - Documented: ${progress.documented ? '✅' : '❌'}`));
    console.log();

    if (artifacts.length > 0) {
        console.log(chalk.white(`  Artifacts (${artifacts.length}):`));
        artifacts.slice(0, 5).forEach(a => {
            console.log(chalk.gray(`    - ${a.name} (${a.type}) by ${a.createdBy}`));
        });
    }
    console.log();
}

/**
 * Delete a session
 */
export async function sessionDeleteCommand(sessionId: string): Promise<void> {
    console.log(chalk.cyan.bold('\n🗑️ Deleting Session...\n'));

    const sessionManager = initSessionManager(process.cwd());
    const deleted = sessionManager.delete(sessionId);

    if (deleted) {
        console.log(chalk.green(`  ✅ Session deleted: ${sessionId}\n`));
    } else {
        console.log(chalk.red(`  ❌ Session not found: ${sessionId}\n`));
    }
}
