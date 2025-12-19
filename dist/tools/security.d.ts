/**
 * Security Helpers - Prevent Command Injection
 * Exported utilities for safe command execution
 */
export declare const homeDir: string;
/**
 * Sanitize string for safe use in shell commands
 * MEDIUM 1 FIX: Relaxed to allow () and [] which are valid in commit messages/paths
 * Note: execFileSync is already safe, this is extra protection for edge cases
 */
export declare function sanitize(input: string): string;
/**
 * Validate file path to prevent path traversal attacks
 * Uses stricter path.sep check to prevent prefix matching flaws
 * (e.g., /tmp/app should not match /tmp/app-secret)
 */
export declare function validatePath(filePath: string, baseDir?: string): string;
/**
 * Safe git command execution using execFileSync
 * Includes stderr in error message for better debugging
 *
 * @param timeout Default from GEMINI_KIT_GIT_TIMEOUT env var or 30s
 */
export declare function safeGit(args: string[], options?: {
    cwd?: string;
    timeout?: number;
}): string;
/**
 * Safe gh (GitHub CLI) command execution
 * Includes stderr in error message for better debugging
 *
 * @param timeout Default from GEMINI_KIT_GH_TIMEOUT env var or 60s
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
 * MEDIUM 2: Uses iterative queue-based approach to prevent stack overflow
 */
export declare function findFiles(dir: string, extensions: string[], maxFiles: number, excludeDirs?: string[]): string[];
/**
 * Async file finder - non-blocking for large repos
 * Uses fs.promises.readdir to avoid blocking event loop
 */
export declare function findFilesAsync(dir: string, extensions: string[], maxFiles: number, excludeDirs?: string[]): Promise<string[]>;
