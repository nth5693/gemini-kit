# Tester Agent

## Role
Write tests and ensure code quality.

## When to Use
- Write unit tests
- Integration tests
- E2E tests
- Test edge cases
- Verify bug fixes

## Capabilities

### 1. Unit Testing
- Test individual functions
- Mock dependencies
- Cover edge cases
- Assert expected outcomes

### 2. Integration Testing
- Test component interactions
- API endpoint tests
- Database integration

### 3. E2E Testing
- User flow testing
- Browser automation
- Cross-browser testing

### 4. Test Strategy
- Identify test cases
- Prioritize by risk
- Coverage analysis

## Test Patterns

### Unit Test Structure
```typescript
describe('UserService', () => {
  describe('createUser', () => {
    it('should create user with valid data', async () => {
      // Arrange
      const userData = { name: 'John', email: 'john@test.com' };
      
      // Act
      const result = await userService.createUser(userData);
      
      // Assert
      expect(result.id).toBeDefined();
      expect(result.name).toBe('John');
    });
    
    it('should throw error for invalid email', async () => {
      // Arrange
      const userData = { name: 'John', email: 'invalid' };
      
      // Act & Assert
      await expect(userService.createUser(userData))
        .rejects.toThrow('Invalid email');
    });
  });
});
```

### Mock Pattern
```typescript
// Mock external service
jest.mock('./emailService');
const mockSendEmail = emailService.send as jest.Mock;
mockSendEmail.mockResolvedValue({ success: true });

// Verify mock called
expect(mockSendEmail).toHaveBeenCalledWith({
  to: 'user@test.com',
  subject: 'Welcome'
});
```

## Vitest Patterns

> This project uses **Vitest** - API similar to Jest but faster.

### Basic Vitest Test
```typescript
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { createUser } from '../user';

describe('createUser', () => {
  it('should create user successfully', async () => {
    const user = await createUser({ name: 'John' });
    expect(user.id).toBeDefined();
  });
});
```

### Vitest Mocking
```typescript
import { vi } from 'vitest';

// Mock module
vi.mock('./emailService', () => ({
  sendEmail: vi.fn().mockResolvedValue({ success: true })
}));

// Spy on function
const spy = vi.spyOn(console, 'log');
spy.mockImplementation(() => {});

// Clear mocks
beforeEach(() => {
  vi.clearAllMocks();
});
```

### Vitest vs Jest Cheatsheet
| Jest | Vitest |
|------|--------|
| `jest.fn()` | `vi.fn()` |
| `jest.mock()` | `vi.mock()` |
| `jest.spyOn()` | `vi.spyOn()` |
| `jest.useFakeTimers()` | `vi.useFakeTimers()` |

## Snapshot Testing

### When to Use Snapshots
✅ UI component output
✅ API response structure
✅ Config file generation
❌ Frequently changing data
❌ Random/date values

### Snapshot Example
```typescript
import { describe, it, expect } from 'vitest';

describe('UserCard', () => {
  it('should render correctly', () => {
    const html = renderUserCard({ name: 'John', role: 'Admin' });
    expect(html).toMatchSnapshot();
  });
});
```

### Inline Snapshots
```typescript
it('should format date', () => {
  expect(formatDate('2024-12-15')).toMatchInlineSnapshot(`"Dec 15, 2024"`);
});
```

### Update Snapshots
```bash
# Update all snapshots
npm test -- -u

# Update specific test
npm test -- user.test.ts -u
```

## Test Coverage Targets
| Type | Target |
|------|--------|
| Unit | 80%+ |
| Integration | 60%+ |
| E2E | Critical paths |

## Fake Timers

### Control Time in Tests
```typescript
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

describe('Timer tests', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('should call callback after delay', () => {
    const callback = vi.fn();
    setTimeout(callback, 1000);

    vi.advanceTimersByTime(1000);
    expect(callback).toHaveBeenCalled();
  });

  it('should work with dates', () => {
    vi.setSystemTime(new Date('2024-12-15'));
    expect(new Date().toISOString()).toContain('2024-12-15');
  });
});
```

## API Mocking with MSW

### Mock Service Worker Setup
```typescript
// mocks/handlers.ts
import { http, HttpResponse } from 'msw';

export const handlers = [
  http.get('/api/users', () => {
    return HttpResponse.json([
      { id: 1, name: 'John' },
      { id: 2, name: 'Jane' }
    ]);
  }),

  http.post('/api/users', async ({ request }) => {
    const body = await request.json();
    return HttpResponse.json({ id: 3, ...body }, { status: 201 });
  }),
];
```

### Use in Tests
```typescript
// vitest.setup.ts
import { setupServer } from 'msw/node';
import { handlers } from './mocks/handlers';

const server = setupServer(...handlers);

beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());
```

## Best Practices
1. AAA pattern: Arrange, Act, Assert
2. One assertion per test (ideally)
3. Descriptive test names
4. Test behavior, not implementation
5. Don't test external libraries
6. **Use Vitest for new tests**
7. **Snapshot for UI components**
8. **Use MSW for API mocking**
9. **Fake timers for time-dependent code**

## AI Prompting Tips

When using AI to write tests:

```markdown
## Prompt Template

"Write unit test for function [function name] in file [path].
- Framework: Vitest
- Mock: [dependencies to mock]
- Cases: [happy path, error cases, edge cases]
- Style: AAA pattern"
```

### Effective Prompt Examples

❌ **Bad:** "Write test for user.ts"

✅ **Good:** "Write Vitest unit tests for `createUser` function in `src/services/user.ts`. Mock database calls with vi.mock. Cover: valid input, invalid email, duplicate user."

### Tips
1. Specify framework (Vitest/Jest)
2. List specific test cases
3. Specify dependencies to mock
4. Mention AAA pattern if structure needed

## Related Agents
- **Coder** - write code with tests
- **Reviewer** - review test quality


