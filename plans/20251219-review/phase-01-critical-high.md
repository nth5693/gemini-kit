# Phase 1: Critical & High Priority Fixes

## 1. Fix Global Event Listener Leak (CRITICAL)
**File:** `src/tools/team-state.ts`

**Problem:** `process.on(...)` handlers are attached at the top level. Multiple imports/initializations cause listener accumulation (MaxListenersExceededWarning).

**Fix Plan:**
- Wrap listener registration in `initTeamState`.
- Use a static flag `listenersRegistered` to ensure singleton behavior.

```typescript
let listenersRegistered = false;

export function initTeamState(...) {
    // ...
    if (!listenersRegistered) {
        process.on('beforeExit', gracefulShutdown);
        // ...
        listenersRegistered = true;
    }
}
```

## 2. Optimize Session Recovery (HIGH)
**File:** `src/tools/team-state.ts`

**Problem:** `recoverActiveSession` reads ALL json files in `sessions/`. This is O(N) IO blocking on startup.

**Fix Plan:**
- Rely primarily on `active-session.json` pointer (already implemented but needs robust fallback).
- Limit fallback scan to the 5 most recently modified files using `fs.stat` (metadata only) before reading content.

```typescript
// Pseudo-code for optimized fallback
const files = fs.readdirSync(dir)
    .map(f => ({ name: f, time: fs.statSync(path.join(dir, f)).mtime.getTime() }))
    .sort((a, b) => b.time - a.time)
    .slice(0, 5); // Top 5 only

for (const file of files) {
    // read and check content
}
```

## 3. Harden Type Safety (HIGH)
**File:** `src/tools/team-state.ts`

**Problem:** Context is `Record<string, unknown>`.

**Fix Plan:**
- Define `CoreContextSchema` with known keys (`workflowType`, `currentStep`, `task`).
- Update `TeamSessionSchema` to use intersection: `CoreContextSchema.and(z.record(z.unknown()))`.
