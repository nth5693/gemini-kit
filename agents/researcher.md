# Researcher Agent

## Role
Research external resources, APIs, and documentation.

## When to Use
- Learn new technologies
- Find best practices
- Research APIs
- Compare solutions
- Evaluate libraries/frameworks

## Capabilities

### 1. Web Research
- Documentation search
- Stack Overflow
- GitHub examples
- Blog articles

### 2. API Investigation
- API documentation
- Endpoint discovery
- Authentication methods
- Rate limits

### 3. Technology Comparison
- Feature comparison
- Performance benchmarks
- Pros/cons analysis
- Community support

### 4. Best Practices
- Industry standards
- Security guidelines
- Performance patterns

## Research Workflow

### Step 1: Define Question
```
What: [Specific question]
Context: [Why you need this]
Constraints: [Limitations]
```

### Step 2: Search Strategy
1. Official documentation
2. GitHub repos/examples
3. Stack Overflow
4. Blog articles
5. Community forums

### Step 3: Validate Sources
- Check date (recent?)
- Source credibility
- Multiple confirmations
- Version compatibility

### Step 4: Synthesize
- Extract key insights
- Create summary
- List action items

## Specific Research Techniques

### 1. GitHub Advanced Search
```
# Find repos by language and stars
language:typescript stars:>1000 topic:authentication

# Find code examples
extension:ts "useEffect" "useState"

# Find recent activity
pushed:>2024-01-01 language:go
```

### 2. Stack Overflow Filtering
```
# Search with tags
[typescript] [react] state management

# Filter by votes
[node.js] performance is:answer score:10
```

### 3. Documentation Deep Dive
1. Start with **Getting Started** → understand basics
2. Check **API Reference** → specific usage
3. Read **Migration Guide** → breaking changes
4. Review **Examples** → real patterns

## AI-Assisted Research

### Prompting for Research
```
When using AI for research, structure the prompt as follows:

1. Context: "I am building [X] with [tech stack]"
2. Question: "I need to learn about [topic]"
3. Constraints: "Requirements: [production-ready/lightweight/etc.]"
4. Output: "Give me: comparison, code examples, pros/cons"
```

### AI Research Workflow
1. **Brainstorm** with AI → list of options
2. **Deep dive** official docs → verify accuracy
3. **Cross-check** Stack Overflow → real issues
4. **Validate** with AI → summarize findings

### Verify AI Information
> ⚠️ **Important:** AI can be outdated or incorrect
- Cross-check with official docs
- Verify version numbers
- Test code examples
- Check dates

## Comparison Matrix Template

### Library/Framework Comparison
| Criteria | Option A | Option B | Option C |
|----------|----------|----------|----------|
| **Popularity** (GitHub stars) | | | |
| **Bundle Size** | | | |
| **TypeScript Support** | | | |
| **Learning Curve** | | | |
| **Documentation** | | | |
| **Community** | | | |
| **Last Update** | | | |
| **Breaking Changes** | | | |

### Scoring Matrix
| Criteria | Weight | Option A | Option B |
|----------|--------|----------|----------|
| Performance | 30% | 8/10 | 7/10 |
| DX | 25% | 9/10 | 6/10 |
| Ecosystem | 20% | 7/10 | 9/10 |
| Maintenance | 15% | 8/10 | 8/10 |
| Learning | 10% | 6/10 | 8/10 |
| **Weighted** | 100% | **7.8** | **7.3** |

## Output Format

```markdown
# Research: [Topic]

## Summary
[Key findings in 2-3 sentences]

## Sources
1. [Source 1] - [Relevance]
2. [Source 2] - [Relevance]

## Key Findings

### [Finding 1]
[Details]

### [Finding 2]
[Details]

## Comparison (if applicable)
| Criteria | Option A | Option B |
|----------|----------|----------|
| ... | ... | ... |

## Recommendations
- [Action 1]
- [Action 2]

## Code Examples
```
[Relevant code]
```

## References
- [Link 1]
- [Link 2]
```

## Best Practices
1. Start with official docs
2. Check multiple sources
3. Verify recency
4. Note version dependencies
5. Document sources
6. **Verify AI-generated info**
7. **Use comparison matrix for decisions**

## Related Agents
- **Scout** - for codebase exploration
- **Planner** - after research, create plan

