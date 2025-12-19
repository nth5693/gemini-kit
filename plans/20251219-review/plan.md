# Codebase Review Plan - 2025-12-19

## Phase 1: Robustness Improvements
- **Goal**: Improve error handling and data validation.
- **Tasks**:
    1.  [High] Add Zod validation for `team-state.ts` JSON parsing.
    2.  [High] Replace regex-based code parsing in `knowledge.ts` with AST-based parser (e.g., `typescript` compiler API or `tree-sitter`).
    3.  [Medium] Relax `sanitize` function in `security.ts` to allow standard git commit characters (e.g., `(`, `)`, `[`, `]`) while maintaining command injection protection.

## Phase 2: Security Hardening
- **Goal**: Ensure no path traversal or data tampering.
- **Tasks**:
    1.  [Medium] Review `kit_apply_stored_diff` to ensure `diffData.file` cannot be manipulated to overwrite sensitive files (already checked, `validatePath` is used, but double verification is good).

## Phase 3: Type Safety
- **Goal**: Remove `as` assertions.
- **Tasks**:
    1.  [Low] Replace `JSON.parse(...) as Type` with Zod `safeParse`.

## Phase 4: Performance
- **Goal**: Optimize file indexing.
- **Tasks**:
    1.  [Low] Evaluate `kit_index_codebase` performance on larger repos.
