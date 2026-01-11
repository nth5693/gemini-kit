# Add Conductor Features to Gemini-Kit

> Created: 2024-12-24
> Status: Implemented ✓
> Prior Exploration: [conductor-comparison-20241224.md](../docs/explorations/conductor-comparison-20241224.md)

## Summary

Add the best features from Conductor extension to Gemini-Kit: Project Setup Wizard (`/kit:setup`), Status Dashboard (`/status`), and Smart Revert (`/revert`).


## Problem Statement

Gemini-Kit already has a powerful compound system but lacks:
1. **Setup Wizard** - Must manually configure GEMINI.md
2. **Unified Status** - No dashboard for specs/plans/todos
3. **Smart Revert** - Only has checkpoints, no logical revert

## Prior Solutions

| Solution | Relevance |
|----------|-----------|
| [conductor-comparison-20241224.md](../docs/explorations/conductor-comparison-20241224.md) | Feature comparison |

---

## Proposed Solution

### Phase 1: `/kit:setup` - Project Setup Wizard (2-3h)

**Goal:** Interactive wizard to setup project context

**Files created:**
```
.gemini-kit/
├── product.md           # Product context
├── tech-stack.md        # Tech choices
└── guidelines.md        # Team guidelines
```

**Implementation:**
1. Create command `commands/kit-setup.toml`
2. Create workflow `.agent/workflows/kit-setup.md`
3. Create templates `.gemini-kit/templates/`

**Code Example:**
```toml
# commands/kit-setup.toml
description = "Interactive project setup wizard"

prompt = """
# 🚀 Kit Setup Wizard

This is the wizard to setup project context.

## Steps:
1. Product Context - Product description, users, goals
2. Tech Stack - Language, framework, database
3. Guidelines - Code style, commit conventions

Start with: What are you building? For whom?
"""
```

---

### Phase 2: `/status` - Unified Status Dashboard (1h)

**Goal:** View progress of specs/plans/todos in one place

**Implementation:**
1. Create script `scripts/status-dashboard.sh`
2. Create command `commands/status.toml`

**Sample output:**
```
📊 PROJECT STATUS
================

📋 Active Specs: 0
📝 Active Plans: 0
✅ Active Todos: 0

🏥 Compound Health: D (New)
   Solutions: 3
   Patterns: 23 ✅

🔧 Recent Workflows:
   /explore (2x)
   /plan-compound (1x)
   /housekeeping (2x)
```

---

### Phase 3: `/revert` - Smart Revert (2-3h) [DEFERRED]

> ⚠️ More complex, defer for future iteration

**Goal:** Revert by plan/task instead of commit

**Dependencies:**
- Need to track plan → commit mapping
- Need git notes integration

---

## Acceptance Criteria

### Phase 1: `/kit:setup` ✅
- [x] Command `/kit:setup` working
- [x] Created 3 context files
- [x] Interactive prompts for each section

### Phase 2: `/status` ✅
- [x] Command `/status` working
- [x] Display specs/plans/todos count
- [x] Display compound health
- [x] Display recent workflows

---

## Technical Considerations

### Dependencies
- No additional dependencies needed
- Use existing scripts infrastructure

### Risks
- Low risk - Additive changes only
- Do not modify existing functionality

### Alternatives Considered
| Alternative | Decision |
|-------------|----------|
| Clone entire Conductor | ❌ Rejected - Too different architecture |
| Only copy templates | ❌ Rejected - Not enough value |
| Cherry-pick best features | ✅ Selected |

---

## Implementation Steps

### Phase 1: `/kit:setup` (Est: 2-3h) ✅ DONE
- [x] Task 1.1: Create `commands/kit-setup.toml`
- [x] Task 1.2: Create `.agent/workflows/kit-setup.md`
- [x] Task 1.3: Create templates in `.gemini-kit/templates/`
- [x] Task 1.4: Test wizard flow
- [x] Task 1.5: Document in README

### Phase 2: `/status` (Est: 1h) ✅ DONE
- [x] Task 2.1: Create `scripts/status-dashboard.sh`
- [x] Task 2.2: Create `commands/status.toml`
- [x] Task 2.3: Test output
- [x] Task 2.4: Document

### Phase 3: `/revert` - DEFERRED
> See "Out of Scope" section. Tracked in future backlog.


---

## Out of Scope (Future)

1. **Smart Revert** - Defer to future iteration
2. **Git Notes Integration** - Not critical
3. **TDD Enforcement** - Optional enhancement
4. **Track System** - Requires schema changes

---

## References

- [Conductor GitHub](https://github.com/gemini-cli-extensions/conductor)
- [Exploration Document](../docs/explorations/conductor-comparison-20241224.md)
- Pattern #8: Rigorous Planning
- Pattern #10: Explore Before Plan