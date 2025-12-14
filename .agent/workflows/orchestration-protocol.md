# Orchestration Protocol

## Agent Coordination Patterns

### 1. Sequential Orchestration
```
/plan → /scout → /code → /test → /review → /git
```

### 2. Parallel Orchestration
```
Parallel: /scout scan multiple dirs
Aggregate results
Proceed with plan
```

### 3. Hybrid
```
1. Parallel: Scout
2. Sequential: Plan
3. Parallel: Code
4. Sequential: Test + Commit
```

## MCP Tools

| Tool | Purpose |
|------|---------|
| `kit_team_start` | Start session |
| `kit_handoff_agent` | Transfer context |
| `kit_smart_route` | Auto-select workflow |

## Best Practices

1. Always start with `/plan`
2. Use `/scout` before coding
3. Test before review
4. Review before commit
