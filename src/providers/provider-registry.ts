/**
 * Provider Registry
 * Maps provider IDs to active or available AIProvider instances.
 */

import { AIProviderId } from '../types';
import { AIProvider } from './ai-provider.interface';
import { AnthropicProvider } from './anthropic-provider';
import { DeepSeekProvider } from './deepseek-provider';
import { GeminiProvider } from './gemini-provider';
import { OpenAIProvider } from './openai-provider';

export class ProviderRegistry {
  private static instance: ProviderRegistry;
  private providers: Map<AIProviderId, AIProvider> = new Map();

  private constructor() {
    this.register(new GeminiProvider());
    this.register(new OpenAIProvider());
    this.register(new AnthropicProvider());
    this.register(new DeepSeekProvider());
  }

  public static getInstance(): ProviderRegistry {
    if (!ProviderRegistry.instance) {
      ProviderRegistry.instance = new ProviderRegistry();
    }
    return ProviderRegistry.instance;
  }

  public register(provider: AIProvider): void {
    this.providers.set(provider.id, provider);
  }

  public getProvider(id: AIProviderId): AIProvider {
    const provider = this.providers.get(id);
    if (!provider) {
      throw new Error(`Provider "${id}" is not registered in ProviderRegistry.`);
    }
    return provider;
  }

  public getAllProviders(): AIProvider[] {
    return Array.from(this.providers.values());
  }

  public getConnectedProviders(): AIProvider[] {
    return Array.from(this.providers.values()).filter((p) => p.isConnected);
  }

  public getDefaultProvider(): AIProvider {
    return this.getProvider('gemini');
  }
}

export const providerRegistry = ProviderRegistry.getInstance();
