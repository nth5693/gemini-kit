# Documentation Management

## When to Update Docs

- New features added
- API changes
- Breaking changes
- Configuration updates

## Documentation Locations

| File | Purpose |
|------|---------|
| `README.md` | Project overview, install |
| `CHANGELOG.md` | Version history |
| `doc.md` | Gemini CLI reference |
| `GEMINI.md` | AI context |

## Standards

### Code Comments
- JSDoc for public functions
- Inline comments for complex logic
- TODO/FIXME with issue links

### API Documentation
- Input/output types
- Error cases
- Examples

## Triggers

1. After implementing features → Update README
2. After API changes → Update doc.md
3. Before release → Update CHANGELOG
4. After config changes → Update GEMINI.md
