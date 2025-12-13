/**
 * Context Manager
 * Manages shared context between agents
 */

export interface SharedContext {
    projectRoot: string;
    currentTask: string;
    plans: Map<string, string>;
    artifacts: string[];
    codebaseInfo: {
        files: string[];
        directories: string[];
        languages: string[];
    };
    agentHistory: Array<{
        agent: string;
        timestamp: Date;
        success: boolean;
        summary: string;
    }>;
}

export class ContextManager {
    private context: SharedContext;

    constructor(projectRoot: string) {
        this.context = {
            projectRoot,
            currentTask: '',
            plans: new Map(),
            artifacts: [],
            codebaseInfo: {
                files: [],
                directories: [],
                languages: [],
            },
            agentHistory: [],
        };
    }

    /**
     * Set current task
     */
    setTask(task: string): void {
        this.context.currentTask = task;
    }

    /**
     * Get current task
     */
    getTask(): string {
        return this.context.currentTask;
    }

    /**
     * Add a plan
     */
    addPlan(name: string, content: string): void {
        this.context.plans.set(name, content);
    }

    /**
     * Get a plan
     */
    getPlan(name: string): string | undefined {
        return this.context.plans.get(name);
    }

    /**
     * Add artifact
     */
    addArtifact(path: string): void {
        if (!this.context.artifacts.includes(path)) {
            this.context.artifacts.push(path);
        }
    }

    /**
     * Get all artifacts
     */
    getArtifacts(): string[] {
        return [...this.context.artifacts];
    }

    /**
     * Record agent execution
     */
    recordAgentExecution(
        agent: string,
        success: boolean,
        summary: string
    ): void {
        this.context.agentHistory.push({
            agent,
            timestamp: new Date(),
            success,
            summary,
        });
    }

    /**
     * Get agent history
     */
    getAgentHistory(): SharedContext['agentHistory'] {
        return [...this.context.agentHistory];
    }

    /**
     * Update codebase info
     */
    updateCodebaseInfo(info: Partial<SharedContext['codebaseInfo']>): void {
        Object.assign(this.context.codebaseInfo, info);
    }

    /**
     * Get full context
     */
    getFullContext(): SharedContext {
        return { ...this.context };
    }
}
