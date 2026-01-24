---
tags: [patterns, compound-learning, workflows, architecture]
last_referenced: "2026-01-24"
---

# Antigravity Critical Patterns

> **Required Reading for All Agents**
> 
> This document contains critical patterns learned from repeated mistakes.
> Every agent MUST consult this before generating code.

---

## How Patterns Are Added

A pattern is promoted to this document when:
1. The same mistake has occurred **3+ times**
2. The solution is **non-obvious** but must be followed every time
3. It represents a **foundational requirement**

---

## Patterns

### Pattern #1: Search Before Solving
**Problem**: Reinventing the wheel or missing existing context.
**Solution**: Always run `./scripts/compound-search.sh` or check `docs/solutions/` before starting a new task.
**Trigger**: Starting a new `/plan` or `/work` session.

---



### Pattern #2: Actionable Items → Todo Files
**Problem:** When deferred work is documented only in artifacts (implementation plans, walkthroughs), it becomes invisible to workflows.

**❌ WRONG:**
```markdown
# implementation_plan.md
## Future Work
- [ ] Investigate async driver
```

**✅ CORRECT:**
```markdown
# Agent creates corresponding todo file:
# todos/001-ready-p2-investigate-async-driver.md
```

**Rule:** Every unchecked `- [ ]` in an artifact that represents actionable future work MUST have a corresponding todo file in `todos/`.

---

### Pattern #3: Housekeeping Before Push
**Problem:** Accumulating completed items in active directories creates noise and slows down context restoration.

**❌ WRONG:**
```bash
git push # Deleaves completed files in active dirs
```

**✅ CORRECT:**
```bash
/housekeeping # Archives completed items
git push
```

**Why:** A clean repository is a predictable repository. Regular archiving ensuring that active workspaces only contain work-in-progress.

---

### Pattern #4: Structure > Documentation
**Problem:** Critical behaviors are often ignored because they are only documented in passive files.

**❌ WRONG:**
Relying on a static setup guide to remind agents to run a specific script.

**✅ CORRECT:**
Embed the behavioral trigger directly into the **Execution Workflow** files (`.agent/workflows/*.md`) as a mandatory "Step 0".

---

### Pattern #5: Persistence Over Conversation
**Problem:** Workflows generate actionable outputs that are only printed in the conversation. When the session ends, the context is lost.

**❌ WRONG:**
Printing bug reproduction results but creating no todo file.

**✅ CORRECT:**
Any workflow that generates actionable output MUST persist that output as a todo file.

---

### Pattern #6: Extract, Don't Just Link
**Problem:** Auto-generated artifacts often just link to source material, forcing the user/agent to manually traverse links.

**❌ WRONG:**
```markdown
See these solutions: [Solution A](link)
```

**✅ CORRECT:**
```markdown
## Context
Extracted from reference solutions:
- "Symptom 1 observed in Solution A"
```

---

### Pattern #7: Explicit Workflow Skill Integration
**Problem:** Agents fail to use available skills because workflows rely on implicit "agent memory".

**✅ CORRECT:**
Workflows must contain **Explicit Blocking Steps** (Step 0) that trigger relevant agent skills commands.

---

### Pattern #8: Rigorous Planning (Multi-Order Thinking)
**Problem:** Plans focus on structural completion rather than deep architectural rigor and foresight.

**Multi-Order Thinking Checklist:**
- [ ] **1st order:** What does this change directly affect?
- [ ] **2nd order:** What depends on those affected things?
- [ ] **3rd order:** What cascading effects could occur?
- [ ] **4th order:** Long-term implications?

---

### Pattern #9: Atomic State Transitions
**Problem:** Lifecycle documents (todos, plans) can drift from their completion checkboxes when state transitions require manual steps.

**✅ CORRECT:**
Use atomic scripts (like `complete-todo.sh` or `complete-plan.sh`) that update metadata and rename files in a single operation.

---

### Pattern #10: Explore Before Plan
**Problem:** Plans for complex features are often built on assumptions.

**✅ CORRECT:**
Use the `/explore` workflow before `/plan` to conduct research, analyze multi-order consequences, and assess long-term implications.

---

### Pattern #11: Single Source of Truth for Project State
**Problem:** Project state becomes inconsistent when multiple files attempt to track the same status.

**✅ CORRECT:**
Define once, track in one place (e.g., `03-tasks.md`), and link elsewhere.

---

### Pattern #12: Observability by Default
**Problem:** Scripts and skills that do not self-report usage create blind spots.

**✅ CORRECT:**
Every tool/script must call `./scripts/log-skill.sh` or `./scripts/log-workflow.sh`.

---

### Pattern #13: Implicit Workflow Triggers
**Problem:** When users approve a plan or solve a problem, agents often default to ad-hoc actions instead of formal workflows.

**Trigger Protocol Table:**
| Phrase Category | Example Phrases | Triggered Workflow |
|-----------------|-----------------|--------------------|
| Investigation | "I need to understand...", "Why is X doing Y?" | `/explore` |
| Plan Approval | "Proceed", "Go ahead", "LGTM" | `/work` |
| Work Completion | "Ship it", "Ready to merge" | `/review` |
| Problem Solved | "That worked", "It's fixed" | `/compound` |

---

### Pattern #14: Task Completion Visibility
**Problem:** When agents finish a task but don't update the `task_boundary`, the UI shows the task as "active".

**✅ CORRECT:**
Update `task_boundary` to a terminal state (e.g., `[COMPLETED]`) before calling `notify_user`.

---

### Pattern #15: Centralized Fallbacks over Magic Numbers
**Problem:** When fallback values are hardcoded in components, they inevitably drift.

**✅ CORRECT:**
Centralize fallback values in a constants file (e.g., `lib/constants/defaults.ts`). One change updates everywhere.

---

### Pattern #16: Sibling Parity (System Extension)
**Problem:** When adding a new system component, developers fail to update shared tooling that references existing components.

**✅ CORRECT:**
"When you add a sibling, check the parent's references." Use grep to find all references to existing siblings and add the new one.

---



### Pattern #17: Active Documentation (Validation Scripts)
**Problem:** Documentation naturally drifts from the actual state of the codebase.

**✅ CORRECT:**
Enforce documentation accuracy with **Active Validation Scripts** that fail the build/push if drift is detected.

---

### Pattern #18: Visual Redirect Cues
**Problem:** System-initiated redirects that happen without a visual cue disorient the user.

**✅ CORRECT:**
Provide feedback (e.g., a Toast message) and a short delay before redirecting.

---

### Pattern #19: Strict Lifecycle Enums
**Problem:** Metadata status fields develop "enum drift" when non-standard values are used.

**✅ CORRECT:**
Define canonical enum values in READMEs and enforce them via atomic scripts and validation.

---

### Pattern #20: Human Gate for State Creation
**Problem:** Fully automated systems that create actionable state without validation lead to backlog pollution.

**✅ CORRECT:**
Automated systems should **suggest**, but only human-approved or explicitly triggered processes should **create** actionable state.

---

### Pattern #21: Mandatory Instrumentation
**Problem:** When instrumentation is optional, the dashboard becomes inaccurate.

**✅ CORRECT:**
Institutionalize instrumentation across Skill, Workflow, and Policy layers.

---



### Pattern #22: Tiered Component Documentation
**Problem:** Folder-level READMEs often lack architectural context.

**✅ CORRECT:**
Use tiered classification (Critical / Supporting / Generated) to document high-value components deeply.

---

### Pattern #23: Continuous Documentation Enforcement
**Problem:** Mandatory documentation steps are often ignored during high-velocity work.

**✅ CORRECT:**
Gate workflows with automated checks (e.g., `./scripts/validate-folder-docs.sh`) that block progress if documentation is stale.

---

---



*Last updated: 2025-12-23*
