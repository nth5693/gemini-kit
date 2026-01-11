# 🎯 Best Practices

Guide to using Gemini-Kit effectively.

---

## Core Principles

### 1. Search Before Solving

**ALWAYS** search before solving a problem:

```bash
./scripts/compound-search.sh "your problem keywords"
```

**Why?**
- Avoid reinventing the wheel
- Learn from past solutions
- Save time

---

### 2. Plan Before Code

**NEVER** code without a plan:

```
❌ Incorrect: "Write feature X immediately"
✅ Correct: "/plan feature X" → approve → "/work"
```

---

### 3. Compound Every Solution

After solving an interesting problem:

```bash
/compound "How we solved X"
```

**Why?**
- Future sessions have context
- Knowledge compounds over time
- Team learns from solutions

---

### 4. Housekeeping Before Push

**MANDATORY** before every git push:

```bash
/housekeeping
```

---

## Critical Patterns (Top 5)

| # | Pattern | Summary |
|---|---------|---------|
| 1 | Search Before Solving | Always search first |
| 2 | Actionable Items → Todo | Convert to todo files |
| 3 | Housekeeping Before Push | Cleanup before push |
| 8 | Rigorous Planning | Multi-order thinking |
| 10 | Explore Before Plan | Research before plan |

[View full 23 patterns](docs/solutions/patterns/critical-patterns.md)

---

## Session Resume Protocol

**Start of each session:**

```bash
# 1. Check pending work
cat skills/session-resume/SKILL.md

# 2. Check active specs
ls docs/specs/*/README.md

# 3. Check status
/status
```

---

## Team Workflow

### Setup for Team

1. Clone gemini-kit
2. Run `/kit:setup` to create context
3. Share `.gemini-kit/` folder with team

### Daily Flow

| Time | Action |
|------|--------|
| Morning | `/status`, check pending |
| Working | `/plan` → `/work` → `/review` |
| Before push | `/housekeeping` |
| End of day | `/compound` if something interesting solved |

---

## Troubleshooting

### "Don't know where to start"

```bash
/status          # Check current state
/explore "topic" # Research first
```

### "Code doesn't work"

```bash
# Use Debugger agent
"Help me debug error X in file Y"
```

### "Validation failed"

```bash
./scripts/validate-compound.sh  # Check what's wrong
./scripts/pre-push-housekeeping.sh --fix  # Auto-fix
```

### "New session, don't remember context"

```bash
cat skills/session-resume/SKILL.md
cat docs/specs/*/00-START-HERE.md  # If has active spec
```

---

## Anti-Patterns

| ❌ Don't | ✅ Should |
|---------|--------|
| Code before plan | `/plan` → `/work` |
| Skip housekeeping | `/housekeeping` before push |
| Don't search | Search before everything |
| Let solution evaporate | `/compound` document it |
| Ignore patterns | Read critical-patterns.md |

---

## Resources

- [Quick Start](../QUICKSTART.md)
- [Features Reference](FEATURES.md)
- [Workflows Guide](WORKFLOWS.md)
- [Critical Patterns](solutions/patterns/critical-patterns.md)
- [API Reference](API.md)