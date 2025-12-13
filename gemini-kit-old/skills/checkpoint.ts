/**
 * Checkpoint System - Track and rollback file changes
 */

import { existsSync, readFileSync, writeFileSync, mkdirSync, readdirSync, statSync, copyFileSync, rmSync } from 'fs';
import { join, relative } from 'path';
import { logger } from '../utils/logger.js';

export interface Checkpoint {
    id: string;
    name: string;
    timestamp: number;
    files: string[];
}

interface CheckpointIndex {
    current: string | null;
    checkpoints: Checkpoint[];
}

const CHECKPOINT_DIR = '.gemini-kit/checkpoints';

/**
 * Initialize checkpoint system for project
 */
function ensureCheckpointDir(projectRoot: string): string {
    const dir = join(projectRoot, CHECKPOINT_DIR);
    if (!existsSync(dir)) {
        mkdirSync(dir, { recursive: true });
    }
    return dir;
}

/**
 * Get checkpoint index
 */
function getIndex(projectRoot: string): CheckpointIndex {
    const indexPath = join(projectRoot, CHECKPOINT_DIR, 'index.json');
    if (existsSync(indexPath)) {
        try {
            return JSON.parse(readFileSync(indexPath, 'utf-8'));
        } catch {
            return { current: null, checkpoints: [] };
        }
    }
    return { current: null, checkpoints: [] };
}

/**
 * Save checkpoint index
 */
function saveIndex(projectRoot: string, index: CheckpointIndex): void {
    const indexPath = join(projectRoot, CHECKPOINT_DIR, 'index.json');
    writeFileSync(indexPath, JSON.stringify(index, null, 2));
}

/**
 * Get all files in project (excluding common ignores)
 */
function getProjectFiles(projectRoot: string): string[] {
    const ignore = ['node_modules', '.git', 'dist', '.gemini-kit', '.next', 'coverage'];
    const files: string[] = [];

    function scan(dir: string): void {
        try {
            const items = readdirSync(dir);
            for (const item of items) {
                if (ignore.includes(item)) continue;
                const fullPath = join(dir, item);
                const stat = statSync(fullPath);
                if (stat.isDirectory()) {
                    scan(fullPath);
                } else if (stat.isFile()) {
                    files.push(relative(projectRoot, fullPath));
                }
            }
        } catch { /* skip */ }
    }

    scan(projectRoot);
    return files;
}

/**
 * Create a new checkpoint
 */
export function createCheckpoint(projectRoot: string, name?: string): Checkpoint {
    logger.info('📸 Creating checkpoint...');

    const checkpointDir = ensureCheckpointDir(projectRoot);
    const id = Date.now().toString(36);
    const checkpointPath = join(checkpointDir, id);
    mkdirSync(checkpointPath, { recursive: true });

    const files = getProjectFiles(projectRoot);

    // Copy all files
    for (const file of files) {
        const src = join(projectRoot, file);
        const dest = join(checkpointPath, file);
        const destDir = join(checkpointPath, file, '..');
        mkdirSync(destDir, { recursive: true });
        try {
            copyFileSync(src, dest);
        } catch { /* skip */ }
    }

    const checkpoint: Checkpoint = {
        id,
        name: name || `Checkpoint ${id}`,
        timestamp: Date.now(),
        files
    };

    // Update index
    const index = getIndex(projectRoot);
    index.checkpoints.push(checkpoint);
    index.current = id;
    saveIndex(projectRoot, index);

    logger.success(`✅ Checkpoint created: ${checkpoint.name} (${files.length} files)`);
    return checkpoint;
}

/**
 * List all checkpoints
 */
export function listCheckpoints(projectRoot: string): Checkpoint[] {
    const index = getIndex(projectRoot);
    return index.checkpoints;
}

/**
 * Rollback to a checkpoint
 */
export function rollbackToCheckpoint(projectRoot: string, checkpointId: string): boolean {
    logger.info(`⏪ Rolling back to checkpoint: ${checkpointId}`);

    const checkpointDir = ensureCheckpointDir(projectRoot);
    const checkpointPath = join(checkpointDir, checkpointId);

    if (!existsSync(checkpointPath)) {
        logger.error('Checkpoint not found');
        return false;
    }

    const index = getIndex(projectRoot);
    const checkpoint = index.checkpoints.find(c => c.id === checkpointId);
    if (!checkpoint) {
        logger.error('Checkpoint not in index');
        return false;
    }

    // Restore files
    for (const file of checkpoint.files) {
        const src = join(checkpointPath, file);
        const dest = join(projectRoot, file);
        const destDir = join(projectRoot, file, '..');

        if (existsSync(src)) {
            mkdirSync(destDir, { recursive: true });
            try {
                copyFileSync(src, dest);
            } catch { /* skip */ }
        }
    }

    index.current = checkpointId;
    saveIndex(projectRoot, index);

    logger.success(`✅ Rolled back to: ${checkpoint.name}`);
    return true;
}

/**
 * Delete a checkpoint
 */
export function deleteCheckpoint(projectRoot: string, checkpointId: string): boolean {
    const checkpointDir = ensureCheckpointDir(projectRoot);
    const checkpointPath = join(checkpointDir, checkpointId);

    if (!existsSync(checkpointPath)) {
        return false;
    }

    rmSync(checkpointPath, { recursive: true, force: true });

    const index = getIndex(projectRoot);
    index.checkpoints = index.checkpoints.filter(c => c.id !== checkpointId);
    if (index.current === checkpointId) {
        index.current = index.checkpoints[index.checkpoints.length - 1]?.id || null;
    }
    saveIndex(projectRoot, index);

    return true;
}
