# End Session Workflow

## Purpose
Properly close session and save all context for next time.

## Steps

1. **Summarize Progress**
   - What was accomplished
   - Files changed
   - Commits made

2. **Update Tracking Files**
   - Mark completed items in TASKS.md
   - Update SESSION_LOG.md with summary
   - Note any pending work

3. **Final Cleanup**
   - Commit any uncommitted changes
   - Push to remote if ready

## Output Format

```markdown
## Session End - [timestamp]

### Completed
- Task 1 ✅
- Task 2 ✅

### Files Changed
- file1.ts
- file2.ts

### Commits
- abc123: "commit message"

### Next Session
- Continue with [task]
```
