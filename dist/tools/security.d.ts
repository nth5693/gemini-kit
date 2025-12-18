/**
 * Security Helpers - Prevent Command Injection
 * Exported utilities for safe command execution
 */
export declare const homeDir: string;
/**
 * Sanitize string for safe use in shell commands
 * Removes dangerous characters but keeps quotes (safe with execFileSync)
 */
export declare function sanitize(input: string): string;
/**
 * Safe git command execution using execFileSync
 * Includes stderr in error message for better debugging
 */
export declare function safeGit(args: string[], options?: {
    cwd?: string;
    timeout?: number;
}): string;
/**
 * Safe gh (GitHub CLI) command execution
 * Includes stderr in error message for better debugging
 */
export declare function safeGh(args: string[], options?: {
    timeout?: number;
}): string;
/**
 * Check if a command exists (cross-platform)
 * Uses 'where' on Windows, 'which' on macOS/Linux
 */
export declare function commandExists(cmd: string): boolean;
/**
 * Cross-platform file finder (replaces Unix-only find/grep/head)
 * Works on Windows, macOS, Linux
 */
export declare function findFiles(dir: string, extensions: string[], maxFiles: number, excludeDirs?: string[]): string[];
/**
 * Async file finder - non-blocking for large repos
 * Uses fs.promises.readdir to avoid blocking event loop
 */
export declare function findFilesAsync(dir: string, extensions: string[], maxFiles: number, excludeDirs?: string[]): Promise<string[]>;
