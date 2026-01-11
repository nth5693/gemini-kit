# 🔄 Workflows Guide

Guide to using workflows in Gemini-Kit.

---

## Compound Loop (Core Workflow)

```
┌─────────────────────────────────────────────────────────────┐
│                    🔄 COMPOUND LOOP                         │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│   /explore  ──▶  /plan  ──▶  /work  ──▶  /review           │
│       │                                      │              │
│       │                                      ▼              │
│       │                               /compound             │
│       │                                      │              │
│       │                                      ▼              │
│       └──────────────────────────  /housekeeping            │
│                                                             │
│   Each loop → Knowledge compounds → Next loop easier       │
└─────────────────────────────────────────────────────────────┘
```

---

## Detailed Workflows

### 1. /explore - Research First

**When:** Before complex features or new technologies

```bash
/explore "authentication best practices"
```

**Output:**
- `docs/explorations/{topic}-{date}.md`

---

### 2. /plan - Quick Planning

**When:** Simple features with clear scope

```bash
/plan "Add user profile page"
```

**Output:**
- `plans/{feature-name}.md`

---

### 3. /plan-compound - Comprehensive Planning

**When:** Complex features, need to search existing solutions

```bash
/plan-compound "Implement OAuth2"
```

**Includes:**
- Search existing solutions
- Check critical patterns
- Multi-order thinking

---

### 4. /work - Execute Plan

**When:** Plan ready, ready to implement

```bash
/work
```

**Flow:**
1. Read plan
2. Create todo list
3. Execute tasks
4. Test continuously
5. Commit & push

---

### 5. /review - Quick Review

**When:** Self-review, small changes

```bash
/review
```

---

### 6. /review-compound - Multi-Pass Review

**When:** Before merge, critical changes

**Passes:**
1. 🔒 Security Review
2. ⚡ Performance Review
3. 🏛️ Architecture Review
4. 💾 Data Integrity Review
5. 🎯 Simplicity Review

---

### 7. /compound - Document Solution

**When:** Solved interesting problem, found pattern

```bash
/compound "How we fixed the caching issue"
```

**Output:**
- `docs/solutions/{category}/{solution}.md`

---

### 8. /housekeeping - Pre-Push Cleanup

**When:** MANDATORY before git push

```bash
/housekeeping
```

**Checks:**
- Archive completed items
- Validate compound system
- Check documentation freshness

---

### 9. /specs - Multi-Session Initiative

**When:** Work spans multiple weeks

```bash
/specs "Major refactor"
```

**Output:**
- `docs/specs/{name}/README.md`
- `docs/specs/{name}/00-START-HERE.md`
- `docs/specs/{name}/03-tasks.md`

---

### 10. /status - Project Status

**When:** Start of session, check progress

```bash
/status
```

---

## Workflow Cheat Sheet

| Situation | Workflow |
|-----------|----------|
| Starting a new feature | `/explore` → `/plan` |
| Simple feature | `/plan` → `/work` |
| Complex feature | `/explore` → `/plan-compound` → `/work` |
| Review changes | `/review` or `/review-compound` |
| Before git push | `/housekeeping` |
| Multi-week project | `/specs` |
| Check status | `/status` |

---

## Tips

1. **Always search first** - `./scripts/compound-search.sh`
2. **Plan before code** - No improvisation
3. **Test continuously** - Don't wait until the end
4. **Document solutions** - `/compound` after fixing bug
5. **Housekeeping before push** - MANDATORY