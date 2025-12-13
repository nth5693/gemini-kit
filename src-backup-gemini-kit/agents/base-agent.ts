/**
 * Base Agent Class
 * All 15 specialized agents extend this class
 * NOW includes Project Context injection like ClaudeKit
 */

import { projectContext } from '../context/project-context.js';

export interface AgentContext {
    projectRoot: string;
    currentTask: string;
    sharedData: Record<string, unknown>;
    previousAgentOutput?: AgentOutput | undefined;
}

export interface AgentOutput {
    success: boolean;
    agentName: string;
    data: Record<string, unknown>;
    artifacts: string[];
    message: string;
    nextAgent?: string | undefined;
}

export interface AgentConfig {
    name: string;
    description: string;
    category: 'development' | 'quality' | 'documentation' | 'creative' | 'research' | 'devops';
}

export abstract class BaseAgent {
    protected config: AgentConfig;
    protected context: AgentContext | null = null;

    constructor(config: AgentConfig) {
        this.config = config;
    }

    get name(): string {
        return this.config.name;
    }

    get description(): string {
        return this.config.description;
    }

    get category(): string {
        return this.config.category;
    }

    /**
     * Initialize agent with context
     */
    initialize(context: AgentContext): void {
        this.context = context;
        this.onInitialize();
    }

    /**
     * Hook for subclasses to implement initialization logic
     */
    protected onInitialize(): void {
        // Override in subclasses
    }

    /**
     * Execute the agent's main task
     */
    abstract execute(): Promise<AgentOutput>;

    /**
     * Clean up after execution
     */
    cleanup(): void {
        this.context = null;
    }

    /**
     * Get current context (throws if not initialized)
     */
    protected getContext(): AgentContext {
        if (!this.context) {
            throw new Error(`Agent ${this.name} not initialized`);
        }
        return this.context;
    }

    /**
     * Get project context for prompts (like ClaudeKit)
     * Returns summary of project structure, files, and dependencies
     */
    protected getProjectContext(): string {
        try {
            const ctx = projectContext.getContext();
            if (ctx) {
                return projectContext.getContextForPrompt();
            }
            // Try to load from docs if available
            if (this.context && projectContext.loadFromDocs(this.context.projectRoot)) {
                return projectContext.getContextForPrompt();
            }
            return '';
        } catch {
            return '';
        }
    }

    /**
     * Create output object
     */
    protected createOutput(
        success: boolean,
        message: string,
        data: Record<string, unknown> = {},
        artifacts: string[] = [],
        nextAgent?: string
    ): AgentOutput {
        return {
            success,
            agentName: this.name,
            message,
            data,
            artifacts,
            nextAgent,
        };
    }
}
