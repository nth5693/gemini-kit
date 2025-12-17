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
export function debounce(fn, wait) {
    let timeoutId = null;
    return ((...args) => {
        if (timeoutId) {
            clearTimeout(timeoutId);
        }
        timeoutId = setTimeout(() => {
            fn(...args);
            timeoutId = null;
        }, wait);
    });
}
/**
 * Throttle function - ensures function is called at most once per wait ms
 *
 * @param fn Function to throttle
 * @param wait Minimum ms between calls
 * @returns Throttled function
 */
export function throttle(fn, wait) {
    let lastCall = 0;
    return ((...args) => {
        const now = Date.now();
        if (now - lastCall >= wait) {
            lastCall = now;
            fn(...args);
        }
    });
}
