/**
 * Workflows Tests
 * Tests for workflow definitions and auto-selection
 */
import { describe, it, expect, beforeEach } from 'vitest';
describe('WORKFLOWS', () => {
    let WORKFLOWS;
    let getWorkflow;
    let listWorkflows;
    let autoSelectWorkflow;
    let getStepPrompt;
    beforeEach(async () => {
        const workflows = await import('../workflows.js');
        WORKFLOWS = workflows.WORKFLOWS;
        getWorkflow = workflows.getWorkflow;
        listWorkflows = workflows.listWorkflows;
        autoSelectWorkflow = workflows.autoSelectWorkflow;
        getStepPrompt = workflows.getStepPrompt;
    });
    describe('Workflow definitions', () => {
        it('should have cook workflow', () => {
            expect(WORKFLOWS.cook).toBeDefined();
            expect(WORKFLOWS.cook.name).toBe('cook');
            expect(WORKFLOWS.cook.steps.length).toBeGreaterThan(0);
        });
        it('should have quickfix workflow', () => {
            expect(WORKFLOWS.quickfix).toBeDefined();
            expect(WORKFLOWS.quickfix.steps.length).toBe(3); // debug, code, test
        });
        it('should have required steps marked correctly', () => {
            const cookSteps = WORKFLOWS.cook.steps;
            const requiredSteps = cookSteps.filter((s) => s.required);
            expect(requiredSteps.length).toBeGreaterThan(0);
        });
        it('all workflows should have valid structure', () => {
            for (const [, workflow] of Object.entries(WORKFLOWS)) {
                expect(workflow).toHaveProperty('name');
                expect(workflow).toHaveProperty('description');
                expect(workflow).toHaveProperty('steps');
                expect(Array.isArray(workflow.steps)).toBe(true);
            }
        });
    });
    describe('getWorkflow', () => {
        it('should return workflow by name', () => {
            const workflow = getWorkflow('cook');
            expect(workflow).toBeDefined();
            expect(workflow?.name).toBe('cook');
        });
        it('should be case-insensitive', () => {
            expect(getWorkflow('COOK')).toBeDefined();
            expect(getWorkflow('Cook')).toBeDefined();
        });
        it('should return undefined for non-existent workflow', () => {
            expect(getWorkflow('non-existent')).toBeUndefined();
        });
    });
    describe('listWorkflows', () => {
        it('should return all workflows', () => {
            const workflows = listWorkflows();
            expect(workflows.length).toBeGreaterThan(0);
        });
        it('should return name and description for each workflow', () => {
            const workflows = listWorkflows();
            for (const workflow of workflows) {
                expect(workflow).toHaveProperty('name');
                expect(workflow).toHaveProperty('description');
                expect(typeof workflow.name).toBe('string');
                expect(typeof workflow.description).toBe('string');
            }
        });
    });
    describe('autoSelectWorkflow', () => {
        it('should select quickfix for bug-related tasks', () => {
            expect(autoSelectWorkflow('fix the bug').name).toBe('quickfix');
            expect(autoSelectWorkflow('there is an error').name).toBe('quickfix');
            expect(autoSelectWorkflow('app is broken').name).toBe('quickfix');
        });
        it('should select feature for new feature tasks', () => {
            expect(autoSelectWorkflow('add new button').name).toBe('feature');
            expect(autoSelectWorkflow('implement login').name).toBe('feature');
            expect(autoSelectWorkflow('create user profile').name).toBe('feature');
        });
        it('should select refactor for refactoring tasks', () => {
            expect(autoSelectWorkflow('refactor the code').name).toBe('refactor');
            expect(autoSelectWorkflow('clean up utils').name).toBe('refactor');
            expect(autoSelectWorkflow('optimize performance').name).toBe('refactor');
        });
        it('should select review for review tasks', () => {
            expect(autoSelectWorkflow('review this code').name).toBe('review');
            expect(autoSelectWorkflow('audit the changes').name).toBe('review');
        });
        it('should select tdd for test-related tasks', () => {
            // Pattern: /\b(test|tdd|coverage|spec)\b/
            // Avoid words that match earlier: check->review, improve->refactor
            expect(autoSelectWorkflow('run test suite').name).toBe('tdd');
            expect(autoSelectWorkflow('measure coverage').name).toBe('tdd');
            expect(autoSelectWorkflow('tdd workflow').name).toBe('tdd');
        });
        it('should select docs for documentation tasks', () => {
            // Pattern: /\b(doc|document|readme|comment)\b/
            expect(autoSelectWorkflow('update readme file').name).toBe('docs');
            expect(autoSelectWorkflow('write doc for api').name).toBe('docs');
        });
        it('should default to cook for general tasks', () => {
            expect(autoSelectWorkflow('do something').name).toBe('cook');
            expect(autoSelectWorkflow('make it work').name).toBe('cook');
        });
    });
    describe('getStepPrompt', () => {
        it('should generate prompt for planner agent', () => {
            const step = { agent: 'planner', description: 'Create plan', required: true };
            const prompt = getStepPrompt(step, 'build feature', {});
            expect(prompt).toContain('Planner');
            expect(prompt).toContain('build feature');
        });
        it('should include context in prompt', () => {
            const step = { agent: 'coder', description: 'Write code', required: true };
            const context = { previousPlan: 'step 1, step 2' };
            const prompt = getStepPrompt(step, 'implement', context);
            expect(prompt).toContain('previousPlan');
        });
        it('should handle unknown agents', () => {
            const step = { agent: 'unknown-agent', description: 'Do something', required: false };
            const prompt = getStepPrompt(step, 'task', {});
            expect(prompt).toContain('unknown-agent');
        });
    });
});
describe('WorkflowStep validation', () => {
    let WORKFLOWS;
    beforeEach(async () => {
        const workflows = await import('../workflows.js');
        WORKFLOWS = workflows.WORKFLOWS;
    });
    it('steps with fallback onFailure should have fallbackAgent', () => {
        for (const [, workflow] of Object.entries(WORKFLOWS)) {
            for (const step of workflow.steps) {
                if (step.onFailure === 'fallback') {
                    expect(step.fallbackAgent).toBeDefined();
                }
            }
        }
    });
    it('all agents should be from known list', () => {
        const knownAgents = [
            'planner', 'scout', 'coder', 'tester', 'reviewer',
            'debugger', 'architect', 'docs', 'security', 'analyst',
            'scout-frontend', 'scout-backend', 'scout-tests'
        ];
        for (const [, workflow] of Object.entries(WORKFLOWS)) {
            for (const step of workflow.steps) {
                expect(knownAgents).toContain(step.agent);
            }
        }
    });
});
