import { AgentRole, AIProviderId } from '../types';
import { providerRegistry } from '../providers/provider-registry';
import { InvestigationContext, ProviderAnalysisResult } from '../providers/ai-provider.interface';

export class AgentRunner {
  public static async runAgent(providerId: AIProviderId, role: AgentRole, context: InvestigationContext): Promise<ProviderAnalysisResult> {
    const provider = providerRegistry.getProvider(providerId);
    // Credential checks belong to the server gateway. Keeping this check out of the
    // browser allows the independent panel to preserve unavailable-provider failures.
    return provider.analyzeInvestigation(context, role);
  }
}
