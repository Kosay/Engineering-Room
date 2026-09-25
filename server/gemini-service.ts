/**
 * Server-Side Gemini Service
 * Securely uses @google/genai with lazy initialization and aistudio-build User-Agent.
 */

import { GoogleGenAI } from '@google/genai';

let aiClient: GoogleGenAI | null = null;

function getGeminiClient(): GoogleGenAI | null {
  if (!aiClient) {
    const key = process.env.GEMINI_API_KEY;
    if (key && key !== 'MY_GEMINI_API_KEY') {
      aiClient = new GoogleGenAI({
        apiKey: key,
        httpOptions: {
          headers: {
            'User-Agent': 'aistudio-build',
          },
        },
      });
    }
  }
  return aiClient;
}

export async function processInvestigationAnalysis(payload: {
  role: string;
  context: {
    title: string;
    question: string;
    environment: string;
    existingClaims: Array<{ statement: string; status: string }>;
    existingEvidence: Array<{ title: string; excerpt: string }>;
    existingExperiments: Array<{ title: string; outcome: string }>;
  };
}) {
  const { role, context } = payload;
  const client = getGeminiClient();

  if (!client) {
    console.log('No GEMINI_API_KEY configured in environment, utilizing deterministic engineering fallback.');
    return null;
  }

  const systemInstruction = `You are a Principal Systems Engineer and ${role} in the KMH AI Engineering Room.
The purpose of this room is to verify technical claims through empirical evidence and reproducible experiments.
Do NOT give generic conversational pleasantries.
Do NOT assume an assertion is true without empirical proof.
Every claim you propose MUST be marked as 'unverified'.
Focus specifically on target platform realities, binary interop (.NET 8 CoreCLR, COM, Win32 P/Invoke, ROT, UAC, Registry).

You must respond strictly with a valid JSON object matching this schema:
{
  "analysisText": "detailed markdown engineering breakdown explaining the technical mechanics, traps, and discrepancies",
  "proposedClaims": [
    {
      "statement": "exact falsifiable claim statement",
      "importance": "critical" | "high" | "medium" | "low",
      "initialStatus": "unverified",
      "rationale": "why this claim is critical to verify"
    }
  ],
  "counterChallenges": [
    {
      "targetClaimStatement": "statement being challenged",
      "challenge": "specific edge case or contradiction",
      "counterHypothesis": "alternative technical explanation"
    }
  ],
  "recommendedExperiments": [
    {
      "title": "reproducible test title",
      "objective": "what this test proves or falsifies",
      "commandOrProcedure": "exact code, command line, or registry query",
      "expectedResult": "exact expected output"
    }
  ]
}`;

  const prompt = `Engineering Question: "${context.question}"
Environment: ${context.environment || 'Windows 11 x64, .NET 8 WPF, WPS Office 2024'}
Existing Claims: ${JSON.stringify(context.existingClaims)}
Existing Evidence: ${JSON.stringify(context.existingEvidence)}
Existing Experiments: ${JSON.stringify(context.existingExperiments)}

Analyze this engineering problem with zero hand-waving. Identify differences between standard Microsoft Office COM APIs and Kingsoft WPS Office behavior, especially within a .NET 8 application.`;

  try {
    const response = await client.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        systemInstruction,
        responseMimeType: 'application/json',
      },
    });

    const responseText = response.text;
    if (responseText) {
      const parsed = JSON.parse(responseText);
      return {
        providerId: 'gemini',
        agentRole: role,
        analysisText: parsed.analysisText || responseText,
        proposedClaims: parsed.proposedClaims || [],
        counterChallenges: parsed.counterChallenges || [],
        recommendedExperiments: parsed.recommendedExperiments || [],
        rawTimestamp: new Date().toISOString(),
      };
    }
  } catch (err) {
    console.error('Gemini API call failed:', err);
  }

  return null;
}
