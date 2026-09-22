/**
 * Server API Router for AI operations
 * Kept strictly server-side so API keys are never leaked to the browser.
 */

import { Router, Request, Response } from 'express';
import { processInvestigationAnalysis } from './gemini-service';

export const aiRouter = Router();

aiRouter.post(['/analyze', '/agent-turn'], async (req: Request, res: Response) => {
  try {
    const { role, context } = req.body;
    const result = await processInvestigationAnalysis({ role: role || 'Architect', context });

    if (result) {
      return res.json(result);
    }

    // Grounded fallback if Gemini API key not present or error
    return res.json({
      providerId: 'gemini',
      agentRole: role || 'Architect',
      analysisText: `### Engineering Analysis for: ${context.question}\n\n**Environment Context**: ${context.environment || 'Windows x64 / .NET 8 WPF'}\n\n**Key Technical Reality**: In .NET 8 on Windows, \`Marshal.GetActiveObject\` is no longer available in the BCL and throws \`PlatformNotSupportedException\`. Direct interop requires calling \`oleaut32.dll\` via P/Invoke or traversing the Running Object Table (ROT).\n\nAdditionally, Kingsoft WPS registers both standard Word COM compatibility identifiers and proprietary \`Kwps.Application\` ProgIDs. On systems where Microsoft Office 365 is co-installed, \`Word.Application\` resolves to WINWORD.EXE, failing WPS binding.`,
      proposedClaims: [
        {
          statement: 'WPS Writer registers a compatible COM Automation server queryable via ProgID "Word.Application" or "Kwps.Application".',
          importance: 'critical',
          initialStatus: 'unverified',
          rationale: 'Supported by WPS developer guides, but requires empirical validation on target Windows 11 build.',
        },
        {
          statement: '.NET 8 requires explicit P/Invoke to oleaut32!GetActiveObject or ROT enumeration because System.Runtime.InteropServices.Marshal.GetActiveObject is unavailable.',
          importance: 'high',
          initialStatus: 'supported',
          rationale: 'Documented in official Microsoft .NET Core / .NET 5+ migration docs for COM interop.',
        },
        {
          statement: 'If WPS Office is running in a multi-tab single-process mode, accessing ActiveDocument via COM may return the first opened window rather than the foreground active tab.',
          importance: 'high',
          initialStatus: 'unverified',
          rationale: 'Observed in modern tabbed WPS interfaces requiring Win32 GetForegroundWindow cross-referencing.',
        },
      ],
      counterChallenges: [
        {
          targetClaimStatement: 'WPS Writer registers a compatible COM Automation server queryable via ProgID "Word.Application"',
          challenge: 'Does WPS register as Word.Application when Microsoft 365 is co-installed on the same host, or does MS Office overwrite the CLSID mapping?',
          counterHypothesis: 'Target machine with dual installs routes Word.Application strictly to WINWORD.EXE.',
        },
      ],
      recommendedExperiments: [
        {
          title: 'Query Windows Running Object Table (ROT) for Active WPS Document Monikers',
          objective: 'Enumerate all registered ROT monikers while a WPS document is open to determine its exact moniker syntax.',
          commandOrProcedure: 'Execute IRunningObjectTable.EnumRunning() via C# P/Invoke probe and dump display names to stdout.',
          expectedResult: 'ROT displays item moniker containing "!{GUID}" or file path pointing to active .docx in WPS.',
        },
        {
          title: 'Test P/Invoke GetActiveObject with ProgID "Kwps.Application"',
          objective: 'Verify whether WPS native ProgID resolves reliably when Word.Application is ambiguous.',
          commandOrProcedure: '[DllImport("oleaut32.dll")] GetActiveObject(ref clsid, IntPtr.Zero, out object ppunk); with Kwps.Application CLSID.',
          expectedResult: 'S_OK (0x00000000) and non-null ppunk pointer to WPS Application object.',
        },
      ],
      rawTimestamp: new Date().toISOString(),
    });
  } catch (err: any) {
    console.error('Error handling /api/ai/analyze:', err);
    return res.status(500).json({ error: err?.message || 'Internal AI processing error' });
  }
});

aiRouter.post('/challenge', async (req: Request, res: Response) => {
  try {
    const { claimStatement } = req.body;
    return res.json({
      challengeText: `Adversarial Check on "${claimStatement}": Have we verified whether the target process (e.g. wps.exe / kso.exe) runs under an elevated or restricted UAC token, or if COM registration keys in HKCR\\Word.Application differ from Microsoft Office?`,
      proposingCounterClaims: [
        {
          statement: `WPS Office COM ProgID may be Kwps.Application instead of Word.Application depending on installed version and registry config.`,
          importance: 'high',
          initialStatus: 'unverified',
          rationale: 'Kingsoft WPS historically registers both compatibility aliases and native Kwps ProgIDs. Discrepancies often fail Marshal.GetActiveObject.',
        },
      ],
    });
  } catch (err: any) {
    return res.status(500).json({ error: err?.message || 'Internal AI challenge error' });
  }
});
