# Codebase Review Plan - 2025-12-19

## Overview
Comprehensive review of the `gemini-kit` codebase, focusing on security, reliability, and maintainability.

## Scope
- **Directory:** `src/`
- **Key Modules:** Security, Knowledge, Orchestrator
- **Tests:** `src/**/*.test.ts`

## 1. Findings

### 🟠 High (Reliability & Performance)
1.  **Fragile Regex Parsing (`src/tools/knowledge.ts`)**
    -   The `kit_index_codebase` tool uses regex for parsing functions and classes. This is error-prone and misses complex cases.
    -   *Recommendation:* Switch to an AST-based parser (e.g., `typescript` compiler API or `tree-sitter`) for robust symbol extraction.

2.  **Synchronous File I/O (`src/tools/knowledge.ts`)**
    -   `kit_get_learnings` uses `fs.readFileSync`. Large learning files could block the event loop.
    -   *Recommendation:* Switch to `fs.promises.readFile`.

### 🟡 Medium (Error Handling)
1.  **Unsafe JSON Parsing (`src/tools/knowledge.ts`)**
    -   `kit_apply_stored_diff` calls `JSON.parse(fs.readFileSync(...))` without a try-catch block for the parsing itself (only the outer block catches generic errors). Malformed JSON will crash the tool execution abruptly.
    -   *Recommendation:* Wrap `JSON.parse` in a specific try-catch or use `zod`'s `safeParse` on the raw string if possible (though `JSON.parse` must happen first).

### 🟢 Low (Style & Best Practices)
1.  **Aggressive Sanitization (`src/tools/security.ts`)**
    -   `sanitize` removes characters like `;`, `&`, `|` which might be valid in git commit messages or other inputs, even though `execFileSync` is used.
    -   *Recommendation:* Review if this level of sanitization is strictly necessary when not using `shell: true`.

## 2. Testing Status
-   Tests exist in `src/__tests__` and `src/tools/__tests__`.
-   Need to verify coverage for `knowledge.ts` edge cases (e.g., malformed files).

## 3. Action Plan
1.  [ ] **Fix JSON Parsing:** Add error handling for `JSON.parse` in `kit_apply_stored_diff`.
2.  [ ] **Refactor Sync I/O:** Convert `kit_get_learnings` to use async file reading.
3.  [ ] **Test Coverage:** Add a test case for malformed JSON in `knowledge.ts`.
