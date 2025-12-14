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
export function debounce<T extends (...args: unknown[]) => void>(
    fn: T,
    wait: number
): T {
    let timeoutId: ReturnType<typeof setTimeout> | null = null;

    return ((...args: unknown[]) => {
        if (timeoutId) {
            clearTimeout(timeoutId);
        }
        timeoutId = setTimeout(() => {
            fn(...args);
            timeoutId = null;
        }, wait);
    }) as T;
}

/**
 * Throttle function - ensures function is called at most once per wait ms
 * 
 * @param fn Function to throttle
 * @param wait Minimum ms between calls
 * @returns Throttled function
 */
export function throttle<T extends (...args: unknown[]) => void>(
    fn: T,
    wait: number
): T {
    let lastCall = 0;

    return ((...args: unknown[]) => {
        const now = Date.now();
        if (now - lastCall >= wait) {
            lastCall = now;
            fn(...args);
        }
    }) as T;
}
