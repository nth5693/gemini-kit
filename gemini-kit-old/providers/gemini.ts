/**
 * Gemini Provider
 * Google Gemini AI integration
 */

import { GoogleGenerativeAI, Content } from '@google/generative-ai';
import {
    BaseProvider,
    Message,
    GenerateOptions,
    GenerateResult,
    StreamChunk,
} from './base-provider.js';

export class GeminiProvider extends BaseProvider {
    private client: GoogleGenerativeAI;

    constructor(apiKey: string, model: string = 'gemini-1.5-pro') {
        super(apiKey, model);
        this.client = new GoogleGenerativeAI(apiKey);
    }

    get providerName(): string {
        return 'gemini';
    }

    async generate(
        messages: Message[],
        options?: GenerateOptions
    ): Promise<GenerateResult> {
        const modelConfig: { model: string; systemInstruction?: string } = {
            model: this.model,
        };
        if (options?.systemPrompt) {
            modelConfig.systemInstruction = options.systemPrompt;
        }

        const model = this.client.getGenerativeModel(modelConfig);

        // Convert messages to Gemini format
        const history: Content[] = messages.slice(0, -1).map((m) => ({
            role: m.role === 'assistant' ? 'model' : 'user',
            parts: [{ text: m.content }],
        }));

        const lastMessage = messages[messages.length - 1];
        if (!lastMessage) {
            throw new Error('No messages provided');
        }

        const chat = model.startChat({ history });

        const result = await chat.sendMessage(lastMessage.content);
        const response = result.response;
        const text = response.text();

        return {
            content: text,
            model: this.model,
            provider: this.providerName,
            usage: {
                inputTokens: response.usageMetadata?.promptTokenCount ?? 0,
                outputTokens: response.usageMetadata?.candidatesTokenCount ?? 0,
            },
        };
    }

    async *generateStream(
        messages: Message[],
        options?: GenerateOptions
    ): AsyncGenerator<StreamChunk> {
        const modelConfig: { model: string; systemInstruction?: string } = {
            model: this.model,
        };
        if (options?.systemPrompt) {
            modelConfig.systemInstruction = options.systemPrompt;
        }

        const model = this.client.getGenerativeModel(modelConfig);

        const history: Content[] = messages.slice(0, -1).map((m) => ({
            role: m.role === 'assistant' ? 'model' : 'user',
            parts: [{ text: m.content }],
        }));

        const lastMessage = messages[messages.length - 1];
        if (!lastMessage) {
            throw new Error('No messages provided');
        }

        const chat = model.startChat({ history });
        const result = await chat.sendMessageStream(lastMessage.content);

        for await (const chunk of result.stream) {
            const text = chunk.text();
            yield { content: text, done: false };
        }

        yield { content: '', done: true };
    }
}
