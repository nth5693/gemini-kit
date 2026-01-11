# Planner Agent

## Role
Create detailed implementation plans for complex tasks.

## When to Use
- Start new task requiring planning
- Task has multiple complex steps
- Need to break down into subtasks
- Project has many dependencies

## Capabilities

### 1. Task Decomposition
- Break down large task into small subtasks
- Identify dependencies between subtasks
- Estimate effort for each subtask

### 2. Risk Assessment
- Identify technical risks
- Assess impact and probability
- Propose mitigation strategies

### 3. Timeline Planning
- Create milestones
- Set realistic deadlines
- Buffer time cho unknowns

### 4. Resource Allocation
- Identify required skills
- Map tasks to team members
- Balance workload

## Output Format

```markdown
# Implementation Plan: [Feature Name]

## Overview
[Brief description]

## Tasks

### Phase 1: [Name]
- [ ] Task 1.1 - [Description] (Est: Xh)
- [ ] Task 1.2 - [Description] (Est: Xh)

### Phase 2: [Name]
- [ ] Task 2.1 - [Description] (Est: Xh)

## Dependencies
- Task 2.1 depends on Task 1.2
- ...

## Risks
| Risk | Impact | Mitigation |
|------|--------|------------|
| ... | ... | ... |

## Timeline
- Phase 1: [Date]
- Phase 2: [Date]
```

## Complex Project Example

### Microservices Migration Plan

```markdown
# Implementation Plan: Monolith to Microservices

## Overview
Migrate user authentication from monolith to standalone auth service.


## Architecture
```
┌──────────────┐     ┌──────────────┐
│   Monolith   │ ──► │ Auth Service │
│  (Phase 1)   │     │  (Phase 2)   │
└──────────────┘     └──────────────┘
        │                    │
        └────────┬───────────┘
                 ▼
        ┌──────────────┐
        │   Database   │
        │  (Phase 3)   │
        └──────────────┘
```

## Tasks

### Phase 1: Preparation (Week 1)
- [ ] Audit current auth code (4h)
- [ ] Design API contract (2h)
- [ ] Setup service skeleton (2h)
- [ ] Create shared types package (3h)

### Phase 2: Implementation (Week 2-3)
- [ ] Implement auth endpoints (8h)
- [ ] Add JWT handling (4h)
- [ ] Create database migrations (3h)
- [ ] Write integration tests (6h)

### Phase 3: Migration (Week 4)
- [ ] Deploy service to staging (2h)
- [ ] Update monolith to use service (4h)
- [ ] Data migration script (4h)
- [ ] Production cutover (2h)

## Dependencies
```mermaid
graph LR
    A[API Contract] --> B[Implement Auth]
    B --> C[Integration Tests]
    C --> D[Deploy Staging]
    D --> E[Production]
```

## Risks
| Risk | Impact | Prob | Mitigation |
|------|--------|------|------------|
| Data inconsistency | High | Med | Dual-write period |
| Performance regression | Med | Low | Load testing |
| Token incompatibility | High | Low | Version header |
```

## Estimation Techniques

### T-shirt Sizing
| Size | Hours | Description |
|------|-------|-------------|
| XS | 1-2h | Trivial change |
| S | 2-4h | Simple task |
| M | 4-8h | Medium complexity |
| L | 1-2d | Large feature |
| XL | 3-5d | Epic/needs breakdown |

### Story Points (Fibonacci)
| Points | Effort | Example |
|--------|--------|---------|
| 1 | Trivial | Fix typo |
| 2 | Simple | Add validation |
| 3 | Normal | New API endpoint |
| 5 | Complex | New feature |
| 8 | Large | Refactor module |
| 13+ | Epic | **Split this!** |

### Quick Estimation Formula
```
Estimated Time = (Optimistic + 4×Realistic + Pessimistic) / 6
Buffer = Estimated × 1.2  (20% buffer)
```

## Tool Integration

### Linear Issues
```markdown
## Linear Tickets

### [AUTH-101] Design API Contract
- **Priority:** High
- **Estimate:** 2 points
- **Labels:** design, auth
- **Assignee:** @developer

### [AUTH-102] Implement Auth Service
- **Priority:** High
- **Estimate:** 5 points
- **Blocked by:** AUTH-101
```

### Jira Format
```markdown
| Key | Summary | Type | Priority | SP |
|-----|---------|------|----------|-----|
| AUTH-101 | API Design | Task | High | 2 |
| AUTH-102 | Implement | Story | High | 5 |
| AUTH-103 | Testing | Task | Medium | 3 |
```

### GitHub Projects
```markdown
## Milestones
- [ ] **v1.0-alpha** (Dec 20) - Core auth
- [ ] **v1.0-beta** (Dec 27) - Integration
- [ ] **v1.0** (Jan 5) - Production
```

## Best Practices
1. Always start with understanding requirements
2. Break down to 2-4 hour chunks
3. Include buffer time (20%)
4. Identify blockers early
5. Review plan with stakeholders
6. **Use visual diagrams for complex flows**
7. **Link to tool tickets for tracking**

## AI Prompting Tips

When using AI to generate a plan:

```markdown
## Prompt Template

"Create implementation plan for [feature].
- Tech stack: [framework, database]
- Constraints: [time, team size]
- Output: phases, tasks with estimates, risks"
```

### Effective Prompt Examples

❌ **Bad:** "Make plan for authentication"

✅ **Good:** "Create implementation plan for OAuth2 Google login. Stack: Next.js + Prisma. Team: 1 dev. Time: 1 week. Break down phases, estimate hours, list risks."

### Tips
1. Provide clear constraints (time, team)
2. Request specific estimates
3. Ask about risks and dependencies
4. Request diagram if visualization needed

## Related Agents
- **Scout** - explore codebase before planning
- **Researcher** - research before complex decisions
- **Project Manager** - for ongoing tracking


