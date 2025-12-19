# Codebase Review Report
**Date:** 2025-12-19
**Scope:** Full Codebase (`src/`, `hooks/`)
**Version:** 2.3.0

## 📊 Summary

| Category | Count | Status |
|----------|-------|--------|
| 🔴 Critical | 0 | ✅ Pass |
| 🟠 High | 2 | ⚠️ Fix Recommended |
| 🟡 Medium | 3 | ⚠️ Recommended |
| 🟢 Low | 2 | ℹ️ Optional |

**Verdict:** ✅ **Ready** (High quality, issues are mainly optimization/scalability)

---

## 🟠 HIGH (Performance & Reliability)

### Issue 1: Synchronous File I/O in Hot Paths
- **File:** `src/tools/team-state.ts`, `src/tools/core.ts`
- **Problem:** Extensive use of `fs.readFileSync` and `fs.writeFileSync`.
  - `saveSessionSync` and `debouncedSave` eventually use sync writes.
  - `kit_get_project_context` uses `findFiles` (sync) instead of `findFilesAsync`.
- **Risk:** In a high-traffic environment or with large artifacts, this blocks the Node.js event loop, causing the MCP server to become unresponsive to other requests.
- **Fix:** Refactor to use `fs.promises` (`async/await`) for all file operations.

```typescript
// src/tools/team-state.ts
// Before
function saveSessionSync(): void {
    fs.writeFileSync(filePath, JSON.stringify(currentSession, null, 2));
}

// After
async function saveSessionAsync(): Promise<void> {
    await fs.promises.writeFile(filePath, JSON.stringify(currentSession, null, 2));
}
```

### Issue 2: Scalability of Session Recovery
- **File:** `src/tools/team-state.ts` (function `recoverActiveSession`)
- **Problem:** Reads **every** JSON file in `.gemini-kit/sessions` to find the active one.
- **Risk:** As session history grows (e.g., hundreds of sessions), this will degrade startup performance significantly (O(N) file reads).
- **Fix:**
    1.  Store a pointer to the active session in a separate file (e.g., `.gemini-kit/active-session.json`).
    2.  Or stop scanning after finding the most recent active session (the code currently sorts then iterates, which is better, but still reads file content).

---

## 🟡 MEDIUM (Maintainability & Stability)

### Issue 3: Untyped Hooks
- **File:** `hooks/*.js` (e.g., `before-agent.js`, `scout-block.js`)
- **Problem:** Hooks are written in plain JavaScript without type safety or JSDoc types.
- **Risk:** Refactoring core types (like `TeamSession`) won't trigger errors in hooks, leading to runtime failures.
- **Fix:** Rewrite hooks in TypeScript (`hooks/*.ts`) and compile them, or run them with `ts-node`.

### Issue 4: Unsafe JSON Parsing in Hooks
- **File:** `hooks/scout-block.js`, `hooks/before-agent.js`
- **Problem:** `JSON.parse(fs.readFileSync(...))` is used without `try-catch` blocks.
- **Risk:** If a config file or state file is corrupted (e.g., partial write), the hook will crash the entire workflow.
- **Fix:** Wrap all `JSON.parse` calls in `try-catch` blocks.

### Issue 5: Memory Usage in Indexing
- **File:** `src/tools/knowledge.ts`
- **Problem:** `kit_index_codebase` uses `findFilesAsync` which returns an array of *all* file paths.
- **Risk:** On very large repositories (100k+ files), this array could consume significant memory.
- **Fix:** Use a stream-based generator or process directories recursively without collecting all paths first.

---

## 🟢 LOW (Code Style & Minor)

### Issue 6: Logic Duplication
- **File:** `src/tools/knowledge.ts` vs `src/tools/security.ts`
- **Problem:** `validatePath` is defined in `knowledge.ts` but seems like a core security utility that should be in `security.ts` and reused.

### Issue 7: Hardcoded Paths
- **File:** Various
- **Problem:** `.gemini-kit` folder name is hardcoded in multiple places.
- **Fix:** Move to a `CONSTANTS` file (e.g., `src/constants.ts`).

---

## 🛡️ SECURITY AUDIT (OWASP)

| Check | Status | Details |
|-------|--------|---------|
| **Command Injection** | ✅ Pass | Uses `execFileSync` with argument arrays. `sanitize` helper available. |
| **Path Traversal** | ✅ Pass | `validatePath` ensures paths are within project root. |
| **Input Validation** | ✅ Pass | `zod` schemas used for all tool arguments. |
| **Secrets** | ✅ Pass | No secrets logged or exposed in code found. |

---

## 🧪 QUALITY GATES

| Gate | Status | Target |
|------|--------|--------|
| **Tests** | ✅ 18 passed | All tests pass |
| **Strict Types** | ✅ Pass | Strict mode on, no `any` found |
| **Linting** | ✅ Pass | ESLint config present |

---

## 🚀 NEXT STEPS

1.  **Refactor I/O:** Convert `team-state.ts` to use async file operations.
2.  **Harden Hooks:** Add error handling to `hooks/*.js` files.
3.  **Centralize Constants:** Move `.gemini-kit` path to a shared constant.
