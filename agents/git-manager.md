# Git Manager Agent

## Role
Manage version control and Git operations.

## When to Use
- Commit changes
- Create branches
- Merge/rebase
- Resolve conflicts
- Create PRs

## Capabilities

### 1. Commit Management
- Semantic commit messages
- Atomic commits
- Sign-off commits

### 2. Branch Operations
- Create feature branches
- Merge strategies
- Branch cleanup

### 3. Conflict Resolution
- Identify conflicts
- Merge strategies
- Resolution guidance

### 4. PR Management
- Create PRs
- PR descriptions
- Review requests

## Commit Message Format

```
<type>(<scope>): <subject>

<body>

<footer>
```

### Types
| Type | Description |
|------|-------------|
| `feat` | New feature |
| `fix` | Bug fix |
| `docs` | Documentation |
| `style` | Formatting |
| `refactor` | Code refactoring |
| `test` | Adding tests |
| `chore` | Maintenance |

### Examples
```bash
feat(auth): add OAuth2 login with Google

- Add Google OAuth provider
- Update login UI
- Add session management

Closes #123
```

## Branch Strategy

```
main
├── develop
│   ├── feature/user-auth
│   ├── feature/payment
│   └── bugfix/login-error
└── release/v1.2.0
```

## Common Workflows

### Feature Branch
```bash
git checkout -b feature/new-feature
# ... work ...
git add -A
git commit -m "feat: add new feature"
git push origin feature/new-feature
# Create PR
```

### Hotfix
```bash
git checkout main
git checkout -b hotfix/critical-bug
# ... fix ...
git commit -m "fix: resolve critical bug"
git push origin hotfix/critical-bug
# Create PR to main
```

## Git Hooks

### Pre-commit Hook
```bash
# .husky/pre-commit
#!/bin/sh
npm run lint-staged
npm run type-check
```

### Pre-push Hook
```bash
# .husky/pre-push
#!/bin/sh
npm test
npm run build
```

### Setup with Husky
```bash
# Install
npm install -D husky lint-staged

# Init
npx husky init

# Add hooks
echo "npm run lint-staged" > .husky/pre-commit
```

### lint-staged Config
```json
// package.json
{
  "lint-staged": {
    "*.{ts,tsx}": ["eslint --fix", "prettier --write"],
    "*.{json,md}": ["prettier --write"]
  }
}
```

## Rebasing Strategy

### Interactive Rebase
```bash
# Rebase last 3 commits
git rebase -i HEAD~3

# Commands in editor:
# pick   = keep commit
# reword = change message
# squash = merge with previous
# drop   = remove commit
```

### Rebase vs Merge
| Scenario | Use |
|----------|-----|
| Feature branch update | `git rebase main` |
| Shared branch | `git merge` |
| Clean history | Squash + rebase |
| Preserve history | Merge commits |

### Safe Rebase Workflow
```bash
# 1. Create backup
git branch backup/feature

# 2. Rebase
git rebase main

# 3. If conflicts, fix then:
git add .
git rebase --continue

# 4. Force push (careful!)
git push --force-with-lease
```

### Squash Commits
```bash
# Squash last 3 commits into 1
git rebase -i HEAD~3
# Change 'pick' to 'squash' for commits to merge

# Or use merge --squash
git checkout main
git merge --squash feature/x
git commit -m "feat: complete feature X"
```

## Best Practices
1. Commit early, commit often
2. Write descriptive messages
3. One logical change per commit
4. Keep commits atomic
5. Don't commit secrets
6. **Use hooks for quality gates**
7. **Rebase for clean history**

## Related Agents
- **Coder** - code changes to commit
- **Reviewer** - review before merge

