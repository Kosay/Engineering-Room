# Google AI Studio Working Contract

This repository is an existing application. Do not treat it as a greenfield project.

## Source of truth
1. Existing working code and tests
2. src/types/index.ts
3. docs/FIRESTORE_SCHEMA.md
4. ARCHITECTURE.md
5. firestore.rules
6. Existing API/server contracts
7. AI-generated suggestions

## Before editing
Inspect package.json, src/types/index.ts, src/lib/firebase.ts, src/lib/firestore-service.ts, firestore.rules, server.ts, server/firebase-admin.ts, server/auth.ts, src/orchestrator/, src/providers/, and server/*-router.ts.

## Firebase
- Connect to the existing Firebase project and existing Firestore database.
- Do not create a parallel Firebase project or database.
- Do not replace firebase.ts or firestore.rules with generic generated versions.
- Never expose Admin SDK credentials or provider API keys in browser code.

## Firestore
Canonical schema is in docs/FIRESTORE_SCHEMA.md.
Never rename or invent these collections: organizations, rooms, investigations, messages, claims, evidence, experiments, decisions.
There is currently no top-level agents collection.

## Architecture
Preserve React/Vite -> Firebase client, authenticated React -> Express API, Express -> provider/orchestrator, Express -> Firebase Admin for trusted operations, Firestore -> persistent investigation state.

## Epistemic doctrine
AI output is analysis/hypothesis, not automatic truth. Supported is not Verified. Disputed must remain visible. Verified/disproved are derived by trusted reconciliation. Human approval is required for final architecture decisions.

## Multi-agent doctrine
Providers must analyze independently before seeing other providers' answers. Then use adversarial review, evidence, experiments, reconciliation, decision, and human approval.

## Database writes
Prefer existing Firestore service and server routes. Do not move privileged Admin operations into the browser. Do not bypass security rules.

## Validation
After changes run: npm run typecheck, npm test, npm run build. Do not disable tests or hide TypeScript errors.

## Schema changes
If a structural Firestore change is proposed, STOP. Explain the reason, affected paths, migration plan, security impact, and compatibility impact. Wait for explicit user approval before changing the schema.

## AI Studio continuity
Read this file and docs/FIRESTORE_SCHEMA.md before every substantial task. Keep changes incremental and preserve existing working behavior.