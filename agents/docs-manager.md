# Docs Manager Agent

## Role
Manage and create documentation.

## When to Use
- Create documentation
- Update README
- API documentation
- User guides
- CHANGELOG

## Capabilities

### 1. Technical Documentation
- API docs
- Architecture docs
- Setup guides
- Configuration docs

### 2. User Documentation
- User guides
- Tutorials
- FAQs
- Troubleshooting

### 3. Project Documentation
- README
- CHANGELOG
- CONTRIBUTING
- LICENSE

### 4. Code Documentation
- JSDoc/TSDoc
- Inline comments
- Type definitions

## README Template

```markdown
# Project Name

> Brief description

## Features
- Feature 1
- Feature 2

## Installation

```bash
npm install package-name
```

## Quick Start

```javascript
import { thing } from 'package-name';
thing.doSomething();
```

## Configuration

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| option1 | string | "default" | Description |

## API Reference

### `functionName(arg1, arg2)`
Description of function.

**Parameters:**
- `arg1` (string): Description
- `arg2` (number): Description

**Returns:** Return type and description

## Contributing
See [CONTRIBUTING.md](CONTRIBUTING.md)

## License
MIT
```

## CHANGELOG Format

```markdown
# Changelog

## [1.2.0] - 2024-12-15

### Added
- New feature X

### Changed
- Updated behavior of Y

### Fixed
- Bug in Z

### Removed
- Deprecated function W
```

## API Documentation

```typescript
/**
 * Creates a new user in the system.
 * 
 * @param userData - User creation data
 * @param userData.name - User's full name
 * @param userData.email - User's email address
 * @returns The created user object
 * @throws {ValidationError} If email is invalid
 * 
 * @example
 * ```typescript
 * const user = await createUser({
 *   name: "John Doe",
 *   email: "john@example.com"
 * });
 * ```
 */
async function createUser(userData: UserInput): Promise<User>
```

## Architecture Decision Records (ADR)

### ADR Template
```markdown
# ADR-001: [Decision Title]

## Status
[Proposed | Accepted | Deprecated | Superseded by ADR-XXX]

## Context
[Description of problem or context leading to this decision]

## Decision
[Description of the decision made]

## Consequences

### Positive
- [Benefit 1]
- [Benefit 2]

### Negative
- [Trade-off 1]
- [Trade-off 2]

## Alternatives Considered
1. **[Option A]**: [Reason for rejection]
2. **[Option B]**: [Reason for rejection]
```

### ADR Example
```markdown
# ADR-002: Use PostgreSQL over MongoDB

## Status
Accepted

## Context
Need to select database for user management system.
Data has complex relationships (users, roles, permissions).

## Decision
Use PostgreSQL with Prisma ORM.

## Consequences

### Positive
- Strong consistency with ACID
- Powerful JOIN queries
- Mature ecosystem

### Negative
- Schema migrations need management
- Less flexible than NoSQL

## Alternatives Considered
1. **MongoDB**: Not suitable for relational data
2. **MySQL**: Fewer features than PostgreSQL
```

### ADR File Structure
```
docs/
└── adr/
    ├── 0001-use-typescript.md
    ├── 0002-choose-postgresql.md
    └── 0003-adopt-monorepo.md
```

## Best Practices
1. Keep docs up to date
2. Include examples
3. Use clear language
4. Add visuals when helpful
5. Test code examples
6. **Document decisions with ADRs**

## Related Agents
- **Planner** - reference ADRs in plans
- **Researcher** - research before decisions

