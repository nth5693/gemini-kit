# Development Rules

## Code Quality Standards

### TypeScript
- Strict mode enabled
- No implicit `any`
- Proper null checks

### Testing
- Unit tests for new features
- Integration tests for workflows
- Coverage target: 80%

### Code Style
- ESLint + Prettier
- Max line length: 100
- Use arrow functions

## Pre-commit Procedures

1. Run tests: `npm test`
2. Type check: `npm run build`
3. Lint: `npm run lint`
4. Update docs if API changed

## Subagent Orchestration

### Sequential (Default)
```
Planner → Scout → Coder → Tester → Reviewer → Git
```

### Parallel (Independent tasks)
- Multiple file reviews
- Concurrent doc updates
- Parallel tests
