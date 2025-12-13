import { describe, it, expect, vi, beforeEach } from 'vitest';
import { coderAgent } from '../../src/agents/development/coder';
import * as fs from 'fs';

// Mock fs
vi.mock('fs', () => ({
    writeFileSync: vi.fn(),
    mkdirSync: vi.fn(),
    existsSync: vi.fn(() => true),
}));

// Access private method
const agent = coderAgent as any;

// Safe backticks construction to avoid escaping issues
const tick = '`';
const fence = tick + tick + tick; // Three backticks

describe('CoderAgent', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    describe('extractCodeBlocks', () => {
        it('should extract standard markdown code blocks with "## File:" header', () => {
            const response = `
Here is the code:

## File: src/utils/helper.ts
${fence}typescript
export const add = (a: number, b: number) => a + b;
${fence}
            `;
            const blocks = agent.extractCodeBlocks(response);
            
            expect(blocks).toHaveLength(1);
            expect(blocks[0].filePath).toBe('src/utils/helper.ts');
            expect(blocks[0].language.trim()).toBe('typescript');
            expect(blocks[0].content.trim()).toBe('export const add = (a: number, b: number) => a + b;');
        });

        it('should extract multiple files in one response', () => {
            const response = `
First file:
## File: file1.ts
${fence}ts
console.log('1');
${fence}

Second file:
## File: file2.css
${fence}css
body { color: red; }
${fence}
            `;
            const blocks = agent.extractCodeBlocks(response);
            
            expect(blocks).toHaveLength(2);
            expect(blocks[0].filePath).toBe('file1.ts');
            expect(blocks[1].filePath).toBe('file2.css');
        });

        it('should handle bold filename pattern (**filename.ext**)', () => {
            const response = `
**src/main.py**
${fence}python
print("hello")
${fence}
            `;
            const blocks = agent.extractCodeBlocks(response);
            
            expect(blocks).toHaveLength(1);
            expect(blocks[0].filePath).toBe('src/main.py');
            expect(blocks[0].content.trim()).toBe('print("hello")');
        });

        it('should handle backtick filename pattern', () => {
            // Note: avoiding nested backticks in template literal
            const filename = tick + 'config.json' + tick;
            const response = `
Here is ${filename}:
${fence}json
{"key": "value"}
${fence}
            `;
            const blocks = agent.extractCodeBlocks(response);
            
            expect(blocks).toHaveLength(1);
            expect(blocks[0].filePath).toBe('config.json');
        });

        it('should fallback to extracting filename from comment inside code block', () => {
            const response = `
${fence}javascript
// File: script.js
const x = 10;
${fence}
            `;
            const blocks = agent.extractCodeBlocks(response);
            
            expect(blocks).toHaveLength(1);
            expect(blocks[0].filePath).toBe('script.js');
        });
    });
});
