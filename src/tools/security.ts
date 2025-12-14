/**
 * Security Helpers - Prevent Command Injection
 * Exported utilities for safe command execution
 */

import { execFileSync } from 'child_process';

export const homeDir = process.env.HOME || process.env.USERPROFILE || '/tmp';

/**
 * Sanitize string for safe use in shell commands
 * Removes dangerous characters
 */
export function sanitize(input: string): string {
    return String(input)
        .replace(/[;&|`$(){}[\]<>\\!#*?'"]/g, '')
        .trim()
        .slice(0, 500); // Limit length
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

/**
 * Safe git command execution using execFileSync
 * Includes stderr in error message for better debugging
 */
export function safeGit(args: string[], options?: { cwd?: string; timeout?: number }): string {
    try {
        return execFileSync('git', args, {
            encoding: 'utf8',
            timeout: options?.timeout || 10000,
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
 */
export function safeGh(args: string[], options?: { timeout?: number }): string {
    try {
        return execFileSync('gh', args, {
            encoding: 'utf8',
            timeout: options?.timeout || 30000,
            maxBuffer: 10 * 1024 * 1024,
        });
    } catch (error) {
        const stderr = extractStderr(error);
        const baseMsg = error instanceof Error ? error.message : String(error);
        throw new Error(`GitHub CLI failed: ${baseMsg}${stderr ? `\nDetails: ${stderr}` : ''}`);
    }
}

/**
 * Check if a command exists
 */
export function commandExists(cmd: string): boolean {
    try {
        execFileSync('which', [cmd], { encoding: 'utf8', timeout: 5000 });
        return true;
    } catch {
        return false;
    }
}

/**
 * Cross-platform file finder (replaces Unix-only find/grep/head)
 * Works on Windows, macOS, Linux
 */
export function findFiles(
    dir: string,
    extensions: string[],
    maxFiles: number,
    excludeDirs: string[] = ['node_modules', '.git', 'dist', 'build', 'coverage']
): string[] {
    const results: string[] = [];
    const fs = require('fs');
    const path = require('path');

    function walk(currentDir: string, relativePath: string = '') {
        if (results.length >= maxFiles) return;

        let entries;
        try {
            entries = fs.readdirSync(currentDir, { withFileTypes: true });
        } catch {
            return; // Skip directories we can't read
        }

        for (const entry of entries) {
            if (results.length >= maxFiles) return;

            const fullPath = path.join(currentDir, entry.name);
            const relPath = relativePath ? path.join(relativePath, entry.name) : entry.name;

            if (entry.isDirectory()) {
                // Skip excluded directories
                if (!excludeDirs.includes(entry.name)) {
                    walk(fullPath, relPath);
                }
            } else if (entry.isFile()) {
                // Check extension
                if (extensions.some(ext => entry.name.endsWith(ext))) {
                    results.push(relPath);
                }
            }
        }
    }

    walk(dir);
    return results;
}
