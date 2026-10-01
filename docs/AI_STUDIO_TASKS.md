# AI Studio Task Guide

## Audit first
Inspect the existing repository before editing. Report frontend, backend, Firebase, auth, Firestore paths, security rules, provider registry, orchestrator, UI, and build/test status.

## Verify Firebase
Confirm the existing Firebase project/database is being used. Confirm the canonical hierarchy in docs/FIRESTORE_SCHEMA.md.

## Improve UI
Use real Firestore data. Improve the command-center UI without changing database paths, domain models, security boundaries, epistemic rules, or API contracts.

## Continue orchestration
Preserve: QUESTION -> REQUIREMENTS -> ASSUMPTIONS -> INDEPENDENT SOLUTIONS -> ADVERSARIAL REVIEW -> EVIDENCE -> EXPERIMENTS -> RECONCILIATION -> ARCHITECTURE DECISION -> HUMAN APPROVAL -> IMPLEMENTATION -> TESTING -> REVIEW.

## Validate
Run npm run typecheck, npm test, npm run build.

## Commit discipline
Make small, focused commits. Do not combine a database migration with unrelated UI work. Ask for explicit approval before schema migrations.