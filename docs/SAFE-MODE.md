# Safe Mode Guide

This guide explains how to use Gemini-Kit safely with minimal risk.

---

## Quick Start: Safe Configuration

For maximum safety, use these settings:

```json
// .gemini/settings.json
{
  "gemini-kit": {
    "safeMode": true
  }
}
```

---

## Safety Levels

### Level 1: Read-Only Mode (Safest)

Only use commands that don't modify files:

| Safe Commands | Description |
|---------------|-------------|
| `/scout` | Explore codebase (read-only) |
| `/status` | View project status |
| `/research` | Research topics |
| `/brainstorm` | Generate ideas |
| `/help` | View commands |

**Agents to use:**
- Scout, Researcher, Brainstormer, Project Manager

### Level 2: Preview Mode

Preview changes before applying:

| Commands | Description |
|----------|-------------|
| `/code-preview` | Preview code changes |
| `/plan` | Create plan (no execution) |

**Always review diffs before confirming.**

### Level 3: Controlled Execution

Use checkpoints before changes:

```bash
# Before any changes
> Create a checkpoint

# Make changes
> /code Add error handling

# If needed
> Restore checkpoint
```

---

## Best Practices

### 1. Always Use Checkpoints

```bash
> Create a checkpoint before making changes
> [Make changes]
> If something goes wrong, restore checkpoint
```

### 2. Review All Changes

- Use `/code-preview` before `/code`
- Review git diff before committing
- Test changes before pushing

### 3. Limit Scope

Instead of:
```bash
> /cook Refactor entire codebase
```

Use:
```bash
> /code Refactor UserService class only
```

### 4. Use Specific Commands

Instead of:
```bash
> Fix everything
```

Use:
```bash
> /fix ESLint errors in src/utils/helpers.ts
```

---

## Running in Docker (Sandbox)

For maximum isolation:

```dockerfile
# Dockerfile.safe
FROM node:20-alpine
WORKDIR /app
COPY . .
RUN npm install
# Run as non-root
USER node
```

```bash
# Run in container
docker build -f Dockerfile.safe -t gemini-kit-safe .
docker run -it -v $(pwd):/app gemini-kit-safe gemini
```

---

## Command Risk Levels

| Risk | Commands | Notes |
|------|----------|-------|
| 🟢 Low | `/scout`, `/status`, `/help`, `/research` | Read-only |
| 🟡 Medium | `/plan`, `/review`, `/code-preview` | Creates artifacts |
| 🟠 High | `/code`, `/test`, `/fix` | Modifies files |
| 🔴 Very High | `/cook`, `/cycle`, `/fullstack` | Multiple changes |

---

## Rollback Options

### Option 1: Git Checkpoint (Recommended)

```bash
> Restore the last checkpoint
```

### Option 2: Git Reset

```bash
git reset --hard HEAD~1
```

### Option 3: Git Stash

```bash
git stash
git stash drop
```

---

## Security Checklist

Before running Gemini-Kit:

- [ ] Working in a git repository
- [ ] No uncommitted important changes
- [ ] Understand what command will do
- [ ] Have backup of important files

---

## See Also

- [SECURITY.md](../SECURITY.md) - Security policy
- [SECURITY-FEATURES.md](SECURITY-FEATURES.md) - Built-in protections
