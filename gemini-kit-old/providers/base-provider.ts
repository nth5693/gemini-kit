/**
 * Base Provider Interface
 * All AI providers (Gemini, Claude, OpenAI) implement this
 */

export interface Message {
    role: 'user' | 'assistant' | 'system';
    content: string;
}

export interface GenerateOptions {
    temperature?: number;
    maxTokens?: number;
    stopSequences?: string[];
    systemPrompt?: string;
}

export interface GenerateResult {
    content: string;
    usage?: {
        inputTokens: number;
        outputTokens: number;
    };
    model: string;
    provider: string;
}

export interface StreamChunk {
    content: string;
    done: boolean;
}

export abstract class BaseProvider {
    protected apiKey: string;
    protected model: string;

    constructor(apiKey: string, model: string) {
        this.apiKey = apiKey;
        this.model = model;
    }

    abstract get providerName(): string;

    /**
     * Generate a response
     */
    abstract generate(
        messages: Message[],
        options?: GenerateOptions
    ): Promise<GenerateResult>;

    /**
     * Generate a streaming response
     */
    abstract generateStream(
        messages: Message[],
        options?: GenerateOptions
    ): AsyncGenerator<StreamChunk>;

    /**
     * Check if the provider is configured
     */
    isConfigured(): boolean {
        return !!this.apiKey;
    }
}
