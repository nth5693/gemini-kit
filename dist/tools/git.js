/**
 * Git Tools - Checkpoint and Rollback
 * Tools 1, 2, 6, 11
 *
 * FIX 9.1: Added createBranch option to avoid detached HEAD state
 * FIX 1.1.0: Added git availability check
 */
import { z } from 'zod';
import * as fs from 'fs';
import * as path from 'path';
import { execFileSync } from 'child_process';
import { sanitize, safeGit, homeDir } from './security.js';
/**
 * Check if Git is available in the system
 * Call this during server initialization to provide friendly error
 */
export function checkGitAvailable() {
    try {
        const version = execFileSync('git', ['--version'], {
            encoding: 'utf-8',
            stdio: ['pipe', 'pipe', 'pipe']
        }).trim();
        return { available: true, version };
    }
    catch (_err) {
        return {
            available: false,
            error: 'Git is not installed or not in PATH. Please install Git: https://git-scm.com/downloads'
        };
    }
}
// Check git on module load and warn if not available
const gitStatus = checkGitAvailable();
if (!gitStatus.available) {
    console.warn(`⚠️ ${gitStatus.error}`);
    console.warn('Git-related tools will not work until Git is installed.');
}
export function registerGitTools(server) {
    // TOOL 1: CREATE CHECKPOINT
    server.tool('kit_create_checkpoint', 'Create a git checkpoint before making changes. Returns checkpoint ID.', { name: z.string().describe('Checkpoint name/description') }, async ({ name }) => {
        try {
            const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
            const safeName = sanitize(name).replace(/\s+/g, '-').slice(0, 20);
            const checkpointId = `kit-${timestamp}-${safeName}`;
            safeGit(['add', '-A']);
            safeGit(['commit', '-m', `checkpoint: ${sanitize(name)}`, '--allow-empty']);
            safeGit(['tag', checkpointId]);
            return { content: [{ type: 'text', text: `✅ Checkpoint created: ${checkpointId}` }] };
        }
        catch (error) {
            return { content: [{ type: 'text', text: `❌ Error creating checkpoint: ${error}` }] };
        }
    });
    // TOOL 2: RESTORE CHECKPOINT (FIX 9.1 - Detached HEAD warning + createBranch option)
    server.tool('kit_restore_checkpoint', 'Restore to a previous checkpoint. Use createBranch=true to avoid detached HEAD state.', {
        checkpointId: z.string()
            .regex(/^kit-[\d\-T]+-.+$/, 'Invalid checkpoint ID format')
            .describe('Checkpoint ID to restore'),
        createBranch: z.boolean()
            .optional()
            .default(true)
            .describe('Create a new branch from checkpoint (recommended to avoid detached HEAD)')
    }, async ({ checkpointId, createBranch = true }) => {
        try {
            const safeId = sanitize(checkpointId);
            if (createBranch) {
                // Create a recovery branch to avoid detached HEAD
                const branchName = `recovery-${Date.now()}`;
                safeGit(['checkout', '-b', branchName, safeId]);
                return {
                    content: [{
                            type: 'text',
                            text: `✅ Restored to checkpoint: ${checkpointId}

**Created branch:** \`${branchName}\`

You can now safely continue working on this branch.
To go back to main: \`git checkout main\``
                        }]
                };
            }
            else {
                // Direct checkout (will cause detached HEAD)
                safeGit(['checkout', safeId]);
                return {
                    content: [{
                            type: 'text',
                            text: `⚠️ Restored to checkpoint: ${checkpointId}

**WARNING: You are now in DETACHED HEAD state!**

Any commits you make will be lost if you switch branches.
To keep your changes, create a branch first:
\`git checkout -b my-recovery-branch\`

Or use \`createBranch: true\` next time.`
                        }]
                };
            }
        }
        catch (error) {
            return { content: [{ type: 'text', text: `❌ Error restoring: ${error}` }] };
        }
    });
    // TOOL 6: LIST CHECKPOINTS (FIX - use safeGit instead of execSync)
    server.tool('kit_list_checkpoints', 'List available checkpoints', {}, async () => {
        try {
            const tags = safeGit(['tag', '-l', 'kit-*', '--sort=-creatordate']);
            const topTags = tags.split('\n').filter(Boolean).slice(0, 10).join('\n');
            if (!topTags.trim()) {
                return { content: [{ type: 'text', text: 'No checkpoints found. Use kit_create_checkpoint to create one.' }] };
            }
            return { content: [{ type: 'text', text: `Available checkpoints:\n${topTags}` }] };
        }
        catch {
            return { content: [{ type: 'text', text: 'Error listing checkpoints (not a git repository?)' }] };
        }
    });
    // TOOL 11: AUTO ROLLBACK (FIX 9.1 - Create recovery branch instead of detached HEAD)
    server.tool('kit_auto_rollback', 'Automatically rollback to last checkpoint if workflow fails. Creates a recovery branch.', {
        reason: z.string().max(500).describe('Reason for rollback'),
        checkpointId: z.string().regex(/^kit-[\d\-T]+-.+$/).optional().describe('Checkpoint ID'),
    }, async ({ reason, checkpointId }) => {
        try {
            let targetCheckpoint = checkpointId ? sanitize(checkpointId) : undefined;
            // If no specific checkpoint, find the most recent one
            if (!targetCheckpoint) {
                try {
                    const tags = safeGit(['tag', '-l', 'kit-*', '--sort=-creatordate']);
                    const latestTag = tags.split('\n')[0]?.trim();
                    if (!latestTag) {
                        return { content: [{ type: 'text', text: '❌ No checkpoint found to rollback to!' }] };
                    }
                    targetCheckpoint = latestTag;
                }
                catch {
                    return { content: [{ type: 'text', text: '❌ Error finding checkpoint' }] };
                }
            }
            // Log the rollback
            const rollbackDir = path.join(homeDir, '.gemini-kit', 'rollbacks');
            fs.mkdirSync(rollbackDir, { recursive: true });
            const recoveryBranch = `rollback-${Date.now()}`;
            const rollbackLog = {
                timestamp: new Date().toISOString(),
                checkpoint: targetCheckpoint,
                reason: sanitize(reason),
                recoveryBranch,
                success: false,
            };
            // Perform rollback - create recovery branch instead of detached HEAD
            try {
                safeGit(['checkout', '-b', recoveryBranch, targetCheckpoint]);
                rollbackLog.success = true;
            }
            catch (error) {
                rollbackLog.success = false;
                fs.writeFileSync(path.join(rollbackDir, `rollback-${Date.now()}.json`), JSON.stringify(rollbackLog, null, 2));
                return { content: [{ type: 'text', text: `❌ Rollback failed: ${error}` }] };
            }
            fs.writeFileSync(path.join(rollbackDir, `rollback-${Date.now()}.json`), JSON.stringify(rollbackLog, null, 2));
            return {
                content: [{
                        type: 'text',
                        text: `🔄 AUTO-ROLLBACK COMPLETED

**Checkpoint:** ${targetCheckpoint}
**Recovery Branch:** \`${recoveryBranch}\`
**Reason:** ${sanitize(reason)}

✅ You are now on branch \`${recoveryBranch}\`.
You can safely continue working here.

To see what was changed: \`git log --oneline -5\`
To go back to main: \`git checkout main\``
                    }]
            };
        }
        catch (error) {
            return { content: [{ type: 'text', text: `Error: ${error}` }] };
        }
    });
}
