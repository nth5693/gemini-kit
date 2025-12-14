# Orchestration Protocol

## Agent Coordination Patterns

### 1. Sequential Orchestration
Use when tasks depend on each other:

```
1. /plan    - Planner creates plan
2. /scout   - Scout scans codebase
3. /code    - Coder implements
4. /test    - Tester validates
5. /review  - Reviewer checks quality
6. /git     - Git commits changes
```

### 2. Parallel Orchestration
Use when tasks are independent:

```
Launch simultaneously:
- /scout scan src/
- /scout scan commands/
- /scout scan hooks/

Aggregate results, then proceed.
```

### 3. Hybrid Orchestration
Combine both:

```
1. Parallel: Scout agents scan
2. Sequential: Planner creates plan
3. Parallel: Multiple code implementations
4. Sequential: Tester validates all
5. Sequential: Git commits
```

## MCP Tools for Orchestration

| Tool | Purpose |
|------|---------|
| `kit_team_start` | Start session |
| `kit_handoff_agent` | Transfer context |
| `kit_smart_route` | Auto-select workflow |
| `kit_run_workflow` | Execute workflow |

## Communication Pattern

```
Agent A completes → kit_handoff_agent → Agent B receives context
```

## Best Practices

1. Always start with `/plan`
2. Use `/scout` before coding
3. Test before review
4. Review before commit
