/**
 * Utility functions for gemini-kit
 */
/**
 * Debounce function - delays execution until after wait ms have passed
 * since the last call. Useful for reducing file I/O operations.
 *
 * @param fn Function to debounce
 * @param wait Milliseconds to wait before executing
 * @returns Debounced function
 */
export declare function debounce<T extends (...args: unknown[]) => void>(fn: T, wait: number): T;
/**
 * Throttle function - ensures function is called at most once per wait ms
 *
 * @param fn Function to throttle
 * @param wait Minimum ms between calls
 * @returns Throttled function
 */
export declare function throttle<T extends (...args: unknown[]) => void>(fn: T, wait: number): T;
