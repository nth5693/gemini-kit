/**
 * Tests for BaseAgent
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { BaseAgent, AgentContext, AgentOutput } from '../../src/agents/base-agent';

// Create a test implementation of BaseAgent
class TestAgent extends BaseAgent {
    constructor() {
        super({
            name: 'test-agent',
            description: 'A test agent',
            category: 'development',
        });
    }

    async execute(): Promise<AgentOutput> {
        const ctx = this.getContext();
        return this.createOutput(
            true,
            `Executed with task: ${ctx.currentTask}`,
            { test: 'data' },
            [],
            'next-agent'
        );
    }
}

describe('BaseAgent', () => {
    let agent: TestAgent;

    beforeEach(() => {
        agent = new TestAgent();
    });

    it('should have correct name and description', () => {
        expect(agent.name).toBe('test-agent');
        expect(agent.description).toBe('A test agent');
        expect(agent.category).toBe('development');
    });

    it('should initialize with context', () => {
        const ctx: AgentContext = {
            projectRoot: '/test/path',
            currentTask: 'test task',
            sharedData: {},
        };

        agent.initialize(ctx);
        // After initialization, execute should work
        expect(async () => await agent.execute()).not.toThrow();
    });

    it('should execute and return output', async () => {
        const ctx: AgentContext = {
            projectRoot: '/test/path',
            currentTask: 'my test task',
            sharedData: {},
        };

        agent.initialize(ctx);
        const result = await agent.execute();

        expect(result.success).toBe(true);
        expect(result.message).toBe('Executed with task: my test task');
        expect(result.data.test).toBe('data');
        expect(result.nextAgent).toBe('next-agent');
    });

    it('should cleanup after execution', async () => {
        const ctx: AgentContext = {
            projectRoot: '/test/path',
            currentTask: 'test',
            sharedData: {},
        };

        agent.initialize(ctx);
        agent.cleanup();

        // After cleanup, calling execute should throw because context is cleared
        await expect(async () => await agent.execute()).rejects.toThrow();
    });
});
