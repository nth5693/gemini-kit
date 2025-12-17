/**
 * Utils Tests
 * Tests for debounce and throttle functions
 */
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { debounce, throttle } from '../utils.js';
describe('Utils', () => {
    beforeEach(() => {
        vi.useFakeTimers();
    });
    afterEach(() => {
        vi.useRealTimers();
    });
    describe('debounce', () => {
        it('should delay function execution', () => {
            const fn = vi.fn();
            const debouncedFn = debounce(fn, 100);
            debouncedFn();
            expect(fn).not.toHaveBeenCalled();
            vi.advanceTimersByTime(100);
            expect(fn).toHaveBeenCalledTimes(1);
        });
        it('should reset delay on subsequent calls', () => {
            const fn = vi.fn();
            const debouncedFn = debounce(fn, 100);
            debouncedFn();
            vi.advanceTimersByTime(50);
            debouncedFn(); // Reset timer
            vi.advanceTimersByTime(50);
            expect(fn).not.toHaveBeenCalled();
            vi.advanceTimersByTime(50);
            expect(fn).toHaveBeenCalledTimes(1);
        });
        it('should pass arguments to the function', () => {
            const fn = vi.fn();
            const debouncedFn = debounce(fn, 100);
            debouncedFn('arg1', 'arg2');
            vi.advanceTimersByTime(100);
            expect(fn).toHaveBeenCalledWith('arg1', 'arg2');
        });
        it('should only call function once for rapid calls', () => {
            const fn = vi.fn();
            const debouncedFn = debounce(fn, 100);
            debouncedFn();
            debouncedFn();
            debouncedFn();
            debouncedFn();
            vi.advanceTimersByTime(100);
            expect(fn).toHaveBeenCalledTimes(1);
        });
    });
    describe('throttle', () => {
        it('should execute function immediately on first call', () => {
            const fn = vi.fn();
            const throttledFn = throttle(fn, 100);
            throttledFn();
            expect(fn).toHaveBeenCalledTimes(1);
        });
        it('should ignore calls within wait period', () => {
            const fn = vi.fn();
            const throttledFn = throttle(fn, 100);
            throttledFn();
            throttledFn();
            throttledFn();
            expect(fn).toHaveBeenCalledTimes(1);
        });
        it('should allow calls after wait period', () => {
            const fn = vi.fn();
            const throttledFn = throttle(fn, 100);
            throttledFn();
            expect(fn).toHaveBeenCalledTimes(1);
            vi.advanceTimersByTime(100);
            throttledFn();
            expect(fn).toHaveBeenCalledTimes(2);
        });
        it('should pass arguments to the function', () => {
            const fn = vi.fn();
            const throttledFn = throttle(fn, 100);
            throttledFn('test', 123);
            expect(fn).toHaveBeenCalledWith('test', 123);
        });
    });
});
