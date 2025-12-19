/**
 * Security Helpers - Prevent Command Injection
 * Exported utilities for safe command execution
 */

import { execFileSync } from 'child_process';
import * as os from 'os';
import * as fs from 'fs';
import * as path from 'path';

// Cross-platform home directory
export const homeDir = os.homedir();

/**
 * Sanitize string for safe use in shell commands
 * MEDIUM 1 FIX: Relaxed to allow () and [] which are valid in commit messages/paths
 * Note: execFileSync is already safe, this is extra protection for edge cases
 */
export function sanitize(input: string): string {
    // Only remove dangerous shell operators, keep () and [] for valid workflows
    return String(input)
        .replace(/[;&|`$<>\\!#*?]/g, '')
        .trim()
        .slice(0, 500); // Limit length
}

/**
 * Validate file path to prevent path traversal attacks
 * Uses stricter path.sep check to prevent prefix matching flaws
 * (e.g., /tmp/app should not match /tmp/app-secret)
 */
export function validatePath(filePath: string, baseDir: string = process.cwd()): string {
    const resolved = path.resolve(baseDir, filePath);
    const root = path.resolve(baseDir);

    // Stricter: exact match OR starts with root + separator
    if (resolved !== root && !resolved.startsWith(root + path.sep)) {
        throw new Error(`Path traversal detected: ${filePath}`);
    }
    return resolved;
}

/**
 * Extract stderr from error for better logging
 */
function extractStderr(error: unknown): string {
    if (error && typeof error === 'object' && 'stderr' in error) {
        return String((error as { stderr?: unknown }).stderr);
    }
    return '';
}

// Configurable timeouts via environment variables
const GIT_TIMEOUT = parseInt(process.env.GEMINI_KIT_GIT_TIMEOUT || '30000', 10);
const GH_TIMEOUT = parseInt(process.env.GEMINI_KIT_GH_TIMEOUT || '60000', 10);

/**
 * Safe git command execution using execFileSync
 * Includes stderr in error message for better debugging
 * 
 * @param timeout Default from GEMINI_KIT_GIT_TIMEOUT env var or 30s
 */
export function safeGit(args: string[], options?: { cwd?: string; timeout?: number }): string {
    try {
        return execFileSync('git', args, {
            encoding: 'utf8',
            timeout: options?.timeout || GIT_TIMEOUT,
            cwd: options?.cwd,
            maxBuffer: 10 * 1024 * 1024, // 10MB
        });
    } catch (error) {
        const stderr = extractStderr(error);
        const baseMsg = error instanceof Error ? error.message : String(error);
        throw new Error(`Git command failed: ${baseMsg}${stderr ? `\nDetails: ${stderr}` : ''}`);
    }
}

/**
 * Safe gh (GitHub CLI) command execution
 * Includes stderr in error message for better debugging
 * 
 * @param timeout Default from GEMINI_KIT_GH_TIMEOUT env var or 60s
 */
export function safeGh(args: string[], options?: { timeout?: number }): string {
    try {
        return execFileSync('gh', args, {
            encoding: 'utf8',
            timeout: options?.timeout || GH_TIMEOUT,
            maxBuffer: 10 * 1024 * 1024,
        });
    } catch (error) {
        const stderr = extractStderr(error);
        const baseMsg = error instanceof Error ? error.message : String(error);
        throw new Error(`GitHub CLI failed: ${baseMsg}${stderr ? `\nDetails: ${stderr}` : ''}`);
    }
}

/**
 * Check if a command exists (cross-platform)
 * Uses 'where' on Windows, 'which' on macOS/Linux
 */
export function commandExists(cmd: string): boolean {
    try {
        const checkCmd = process.platform === 'win32' ? 'where' : 'which';
        execFileSync(checkCmd, [cmd], { encoding: 'utf8', timeout: 5000, stdio: 'ignore' });
        return true;
    } catch {
        return false;
    }
}

/**
 * Cross-platform file finder (replaces Unix-only find/grep/head)
 * MEDIUM 2: Uses iterative queue-based approach to prevent stack overflow
 */
export function findFiles(
    dir: string,
    extensions: string[],
    maxFiles: number,
    excludeDirs: string[] = ['node_modules', '.git', 'dist', 'build', 'coverage']
): string[] {
    const results: string[] = [];
    // Use queue instead of recursion to prevent stack overflow on deep dirs
    const queue: Array<{ fullPath: string; relativePath: string }> = [
        { fullPath: dir, relativePath: '' }
    ];

    while (queue.length > 0 && results.length < maxFiles) {
        const current = queue.shift()!;

        let entries;
        try {
            entries = fs.readdirSync(current.fullPath, { withFileTypes: true });
        } catch {
            continue; // Skip directories we can't read
        }

        for (const entry of entries) {
            if (results.length >= maxFiles) break;

            const entryFullPath = path.join(current.fullPath, entry.name);
            const entryRelPath = current.relativePath
                ? path.join(current.relativePath, entry.name)
                : entry.name;

            if (entry.isDirectory()) {
                if (!excludeDirs.includes(entry.name)) {
                    queue.push({ fullPath: entryFullPath, relativePath: entryRelPath });
                }
            } else if (entry.isFile()) {
                if (extensions.some(ext => entry.name.endsWith(ext))) {
                    results.push(entryRelPath);
                }
            }
        }
    }

    return results;
}

/**
 * Async file finder - non-blocking for large repos
 * Uses fs.promises.readdir to avoid blocking event loop
 */
export async function findFilesAsync(
    dir: string,
    extensions: string[],
    maxFiles: number,
    excludeDirs: string[] = ['node_modules', '.git', 'dist', 'build', 'coverage']
): Promise<string[]> {
    const results: string[] = [];

    async function walk(currentDir: string, relativePath: string = ''): Promise<void> {
        if (results.length >= maxFiles) return;

        let entries;
        try {
            entries = await fs.promises.readdir(currentDir, { withFileTypes: true });
        } catch {
            return; // Skip directories we can't read
        }

        for (const entry of entries) {
            if (results.length >= maxFiles) return;

            const fullPath = path.join(currentDir, entry.name);
            const relPath = relativePath ? path.join(relativePath, entry.name) : entry.name;

            if (entry.isDirectory()) {
                if (!excludeDirs.includes(entry.name)) {
                    await walk(fullPath, relPath);
                }
            } else if (entry.isFile()) {
                if (extensions.some(ext => entry.name.endsWith(ext))) {
                    results.push(relPath);
                }
            }
        }
    }

    await walk(dir);
    return results;
}
