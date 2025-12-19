# Phase 2: Medium & Low Priority Improvements

## 1. Refactor Smart Route (MEDIUM)
**File:** `src/tools/orchestrator.ts`

**Problem:** Redundant regex logic. `smartRoute` re-implements logic found in `autoSelectWorkflow`.

**Fix Plan:**
- Update `autoSelectWorkflow` in `src/tools/workflows.ts` to return an object `{ workflow: Workflow, confidence: number }`.
- Update `smartRoute` to use this result directly.

## 2. Configurable Output Limit (MEDIUM)
**File:** `src/tools/team-state.ts`

**Problem:** 10KB limit is too small for diffs/code.

**Fix Plan:**
- Use `process.env.GEMINI_KIT_MAX_OUTPUT_SIZE` or default to 50KB.

## 3. Dynamic Prompt Generation (MEDIUM)
**File:** `src/tools/workflows.ts`

**Problem:** Hardcoded prompts in `getStepPrompt` duplicate `workflow.description`.

**Fix Plan:**
- Fallback to `step.description` if specific role prompt isn't defined.

## 4. Housekeeping (LOW)
- Remove unused variables identified by ESLint.
- Standardize error logging.
