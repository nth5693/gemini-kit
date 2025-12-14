# Primary Workflow

## The `/cook` Workflow

Full-stack development workflow that orchestrates all agents:

```
/cook [task description]
```

### Steps

1. **Planning** - `/plan` creates implementation plan
2. **Scouting** - `/scout` scans relevant files  
3. **Coding** - Implements the plan
4. **Testing** - `/test` validates changes
5. **Reviewing** - `/review` checks quality
6. **Committing** - `/git` commits changes

## Quick Workflows

### Feature Implementation
```
/cook implement [feature]
```

### Bug Fix
```
/cook fix [bug description]
```

### Refactoring
```
/cook refactor [scope]
```

### Full Audit
```
/cook full review and fix bugs
```

## Workflow Selection

| Task | Command |
|------|---------|
| New feature | `/cook implement` |
| Bug fix | `/fix` or `/cook fix` |
| Code review | `/review` |
| Documentation | `/docs` |
| Testing | `/test` |
| Security audit | `/review security` |

## When to Use What

- **Simple change**: Direct `/code` or `/fix`
- **Complex feature**: `/cook` full workflow
- **Code quality**: `/review`
- **Explore codebase**: `/scout`
