/**
 * Agent Runner
 * Dispatches targeted agent roles to appropriate providers
 */

import { AgentRole, AIProviderId } from '../types';
import { providerRegistry } from '../providers/provider-registry';
import {
  InvestigationContext,
  ProviderAnalysisResult,
} from '../providers/ai-provider.interface';

export class AgentRunner {
  public static async runAgent(
    providerId: AIProviderId,
    role: AgentRole,
    context: InvestigationContext
  ): Promise<ProviderAnalysisResult> {
    const provider = providerRegistry.getProvider(providerId);

    if (!provider.isConnected) {
      throw new Error(
        `Provider "${provider.name}" is not currently connected. Please configure its credentials or use Gemini.`
      );
    }

    return await provider.analyzeInvestigation(context, role);
  }
}
