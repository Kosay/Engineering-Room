/**
 * Gemini Provider Implementation
 * Interacts via server API proxy to ensure zero key exposure in client code.
 */

import { AgentRole, AIProviderId } from '../types';
import {
  AIProvider,
  ClaimDraft,
  ExperimentSuggestion,
  InvestigationContext,
  ProviderAnalysisResult,
} from './ai-provider.interface';

export class GeminiProvider implements AIProvider {
  readonly id: AIProviderId = 'gemini';
  readonly name = 'Google Gemini 2.5';
  readonly supportedRoles: AgentRole[] = [
    'Architect',
    'Adversarial Reviewer',
    'Independent Analyst',
    'Evidence Researcher',
  ];
  readonly isConnected = true;

  async analyzeInvestigation(
    context: InvestigationContext,
    role: AgentRole = 'Architect'
  ): Promise<ProviderAnalysisResult> {
    try {
      const response = await fetch('/api/ai/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          providerId: this.id,
          role,
          context,
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Gemini Provider request failed: ${response.status} ${errorText}`);
      }

      const data = await response.json();
      return data;
    } catch (err) {
      throw err;

    }
  }

  async challengeClaim(
    claimStatement: string,
    context: InvestigationContext,
    role: AgentRole = 'Adversarial Reviewer'
  ): Promise<{
    challengeText: string;
    proposingCounterClaims: ClaimDraft[];
  }> {
    try {
      const response = await fetch('/api/ai/challenge', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          providerId: this.id,
          role,
          claimStatement,
          context,
        }),
      });

      if (response.ok) {
        return await response.json();
      }
    } catch (err) {
      console.warn('Server challenge endpoint unavailable, generating adversarial challenge locally', err);
    }

    throw new Error('Gemini challenge endpoint is unavailable.');

  }

  async suggestExperiments(
    claimStatement: string,
    _context: InvestigationContext
  ): Promise<ExperimentSuggestion[]> {
    return [
      {
        title: `Verify COM Registration ProgIDs for WPS in Windows Registry`,
        objective: `Inspect HKCR to confirm if WPS registers Word.Application or Kwps.Application CLSIDs on the test environment.`,
        commandOrProcedure: `powershell -Command "Get-ItemProperty -Path 'Registry::HKEY_CLASSES_ROOT\\Word.Application\\CLSID' -ErrorAction SilentlyContinue"`,
        expectedResult: `Returns a valid GUID corresponding to the Kingsoft Writer COM server binary.`,
        targetClaimStatement: claimStatement,
      },
      {
        title: `Execute Marshal.GetActiveObject in .NET 8 WPF Process`,
        objective: `Test if runtime can bind to an open WPS Writer instance without running into RPC_E_CALL_REJECTED or MK_E_UNAVAILABLE.`,
        commandOrProcedure: `dotnet run --project WpsActiveDocProber.csproj (testing Marshal.GetActiveObject("Word.Application") vs Marshal2.GetActiveObject)`,
        expectedResult: `Returns a non-null COM RCW pointer to active document object model.`,
        targetClaimStatement: claimStatement,
      },
    ];
  }

}
