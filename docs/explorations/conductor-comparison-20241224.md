# Exploration: Conductor Extension vs Gemini-Kit

**Date:** 2024-12-24
**Question:** What features from Conductor extension can be added to Gemini-Kit?

## Overview

[Conductor](https://github.com/gemini-cli-extensions/conductor) is a Gemini CLI extension that allows specifying, planning, and implementing software features with a structured workflow.

## Feature Comparison

### Conductor Features

| Feature | Command | Description |
|---------|---------|-------------|
| **Project Setup** | `/conductor:setup` | Create context files (product, tech-stack, guidelines) |
| **Track System** | `/conductor:newTrack` | Create feature/bug track with spec + plan |
| **Implementation** | `/conductor:implement` | Auto-implement according to plan with TDD |
| **Status** | `/conductor:status` | View track progress |
| **Smart Revert** | `/conductor:revert` | Git-aware revert by logical units |

### Gemini-Kit Features (current)

| Feature | Has? | Equivalent |
|---------|-----|-------------|
| Project Setup | ⚠️ Partial | Has `GEMINI.md` but no wizard |
| Track System | ⚠️ Partial | Has `/specs` and `/plan` but separate |
| Implementation | ✅ Yes | `/work` workflow |
| Status | ⚠️ Partial | `/compound-dashboard.sh` for compound, no track status |
| Smart Revert | ❌ No | Has checkpoints but not git-aware |

## Key Features that can be added to Gemini-Kit

### 1️⃣ **Project Setup Wizard** (HIGH VALUE)

**Conductor has:**
```
/conductor:setup
├── conductor/product.md           # Product context
├── conductor/product-guidelines.md # Style guides
├── conductor/tech-stack.md        # Tech choices
├── conductor/workflow.md          # Team workflow
└── conductor/code_styleguides/    # Code style
```

**Gemini-Kit currently has:**
- `GEMINI.md` - All-in-one config

**Benefit:** Break down config → easier to maintain, team-friendly

---

### 2️⃣ **Track-Based Feature Management** (HIGH VALUE)

**Conductor has:**
```
conductor/tracks/
├── tracks.md                      # Master list
└── <track_id>/
    ├── spec.md                    # Requirements
    ├── plan.md                    # Tasks
    └── metadata.json              # Status tracking
```

**Gemini-Kit currently has:**
- `docs/specs/` - For multi-session specs
- `plans/` - Standalone plans
- `todos/` - Task tracking

**Gap:** No unified "track" linking spec → plan → implementation

---

### 3️⃣ **TDD-First Workflow** (MEDIUM VALUE)

**Conductor enforces:**
1. Write failing tests (Red)
2. Implement to pass (Green)
3. Refactor
4. Verify coverage

**Gemini-Kit has:**
- `skills/testing/` skill
- But does not enforce TDD flow

---

### 4️⃣ **Git Notes for Task Commits** (MEDIUM VALUE)

**Conductor has:**
```bash
git notes add -m "<task summary>" <commit_hash>
```
- Attach task context to commits
- Queryable history

**Gemini-Kit does not have** git notes integration.

---

### 5️⃣ **Smart Revert by Track/Phase/Task** (HIGH VALUE)

**Conductor has:**
```
/conductor:revert
```
- Understands logical units (tracks, phases, tasks)
- Not just commit hashes

**Gemini-Kit has:**
- `kit_create_checkpoint` - Git-based snapshots
- But not track-aware

---

### 6️⃣ **Status Dashboard** (MEDIUM VALUE)

**Conductor has:**
```
/conductor:status
```
- Track progress
- Phase completion
- Task status

**Gemini-Kit has:**
- `compound-dashboard.sh` - Compound health
- No feature/track status

---

## Recommendations

### MUST HAVE (High Value, Easy to Add)

1. **Project Setup Wizard** (`/kit:setup`)
   - Interactive setup for new projects
   - Generate structured context files
   - Effort: ~2-3 hours

2. **Track Status Command** (`/status`)
   - Show active specs, plans, todos
   - Effort: ~1 hour

### SHOULD HAVE (High Value, More Complex)

3. **Unified Track System**
   - Link spec → plan → todos → commits
   - May require schema changes
   - Effort: ~4-6 hours

4. **Smart Revert** (`/revert`)
   - Revert by plan/task, not just checkpoint
   - Effort: ~2-3 hours

### NICE TO HAVE (Medium Value)

5. **TDD Enforcement** in `/work` workflow
   - Add TDD steps to work.md
   - Effort: ~1 hour

6. **Git Notes Integration**
   - Attach task context to commits
   - Effort: ~1-2 hours

---

## Decision

**Proceed to /plan** to implement:
1. `/kit:setup` - Project Setup Wizard
2. `/status` - Unified Status Dashboard

Defer other items for future iterations.

---

## References

- [Conductor GitHub](https://github.com/gemini-cli-extensions/conductor)
- [Conductor Workflow Template](https://github.com/gemini-cli-extensions/conductor/blob/main/templates/workflow.md)