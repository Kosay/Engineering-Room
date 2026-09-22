# KMH AI Engineering Room - Architecture Document

## Purpose & Core Philosophy
KMH AI Engineering Room solves a fundamental flaw in AI-assisted software engineering: **different AI models confidently propose technically incorrect solutions**, especially when documentation, examples, and the actual target software differ.

The core doctrine:
```
QUESTION → CLAIMS → EVIDENCE → EXPERIMENTS → RECONCILIATION → DECISION → IMPLEMENTATION
```
The system distinguishes between **hypotheses** and **verified engineering facts**.
- **Supported** does NOT mean **Verified**.
- An AI-generated assertion is never accepted as an established fact.
- Real software (e.g. WPS Office COM automation on Windows 11 with .NET 8) requires reproducible technical experiments and verifiable evidence.

---

## Visual Epistemic Status Scale
- 🟢 **VERIFIED**: Proven by passing reproducible experiments or verified official runtime documentation.
- 🟡 **SUPPORTED / UNVERIFIED**: Backed by AI arguments, unverified web articles, or hypotheses.
- 🟠 **DISPUTED**: Actively challenged by conflicting evidence, adversarial agent review, or inconsistent test runs.
- 🔴 **DISPROVED**: Falsified by failed technical experiments or authoritative counter-evidence.
- ⚪ **UNKNOWN**: Proposed statement with zero empirical or logical validation.

---

## Provider Abstraction Architecture
The system is decoupled from any single AI vendor:
```
AIProvider (Interface)
├── GeminiProvider (Implemented for MVP via @google/genai & server proxy)
├── OpenAIProvider (Architecture ready)
├── AnthropicProvider (Architecture ready)
└── DeepSeekProvider (Architecture ready)
```
Provider API keys are maintained strictly server-side (`/api/*`) and are never exposed to the client.

---

## Orchestrator Service Boundary
```
orchestrator/
├── investigation-orchestrator.ts   # Central coordination pipeline
├── context-builder.ts              # Synthesizes question, claims, evidence, experiments
├── agent-runner.ts                 # Role-based agent invocations (Architect, Adversary, etc.)
├── claim-manager.ts                # Epistemic transitions & challenge processing
├── evidence-manager.ts             # Source reliability weighting & claim linkage
├── experiment-manager.ts           # Test procedure lifecycle & outcome recording
└── decision-manager.ts             # Decision readiness validation based on verified evidence
```

---

## Firestore Hierarchy
All collections follow the explicit hierarchical organizational model:
```
organizations/{organizationId}
└── rooms/{roomId}
    └── investigations/{investigationId}
        ├── messages/{messageId}
        ├── claims/{claimId}
        ├── evidence/{evidenceId}
        ├── experiments/{experimentId}
        └── decisions/{decisionId}
```

Protected by granular Firestore Security Rules ensuring authenticated tenant isolation.
