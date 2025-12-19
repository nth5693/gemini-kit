# Codebase Review Plan - 2025-12-19

## Overview
This review focuses on the `gemini-kit` core architecture, specifically the state management, orchestration, and workflow definitions.

**Objective:** Harden the system against memory leaks, performance bottlenecks in session recovery, and type safety issues.

## Phases

### Phase 1: Critical & High Priority Fixes
- **Goal:** Fix memory leaks and performance blockers.
- **Tasks:**
  1. Fix Global Event Listener Leak in `src/tools/team-state.ts`.
  2. Optimize `recoverActiveSession` to use O(1) pointer or O(1) limited scan.
  3. Improve Type Safety for `TeamSessionSchema`.

### Phase 2: Medium & Low Priority Improvements
- **Goal:** Improve maintainability and code quality.
- **Tasks:**
  1. Refactor `smartRoute` to remove redundant logic.
  2. Increase or make configurable `MAX_OUTPUT_SIZE`.
  3. Dynamic prompt generation in `workflows.ts`.
  4. Cleanup unused variables and lint warnings.

## Implementation Strategy
- Tests will be run before and after each critical change.
- Changes will be kept backward compatible where possible.
