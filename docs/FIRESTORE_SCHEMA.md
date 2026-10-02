# Firestore Schema — KMH AI Engineering Room

This is the authoritative Firestore schema. Preserve existing names and paths.

## Canonical hierarchy
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

## Canonical paths
- /organizations/{organizationId}
- /organizations/{organizationId}/rooms/{roomId}
- /organizations/{organizationId}/rooms/{roomId}/investigations/{investigationId}
- /organizations/{organizationId}/rooms/{roomId}/investigations/{investigationId}/messages/{messageId}
- /organizations/{organizationId}/rooms/{roomId}/investigations/{investigationId}/claims/{claimId}
- /organizations/{organizationId}/rooms/{roomId}/investigations/{investigationId}/evidence/{evidenceId}
- /organizations/{organizationId}/rooms/{roomId}/investigations/{investigationId}/experiments/{experimentId}
- /organizations/{organizationId}/rooms/{roomId}/investigations/{investigationId}/decisions/{decisionId}

## Collections and documents

### organizations/{organizationId}
```ts
Organization {
  id: string
  name: string
  createdAt: string
  ownerId: string
}
```

### rooms/{roomId}
```ts
EngineeringRoom {
  id: string
  organizationId: string
  name: string
  description: string
  projectTarget: string
  createdAt: string
  updatedAt: string
  activeInvestigationId?: string
}
```

### investigations/{investigationId}
```ts
Investigation {
  id: string
  organizationId: string
  roomId: string
  title: string
  question: string
  status: 'active' | 'archived' | 'concluded'
  phase: InvestigationPhase
  priority: InvestigationPriority
  environment: string
  participatingAgents: string[]
  createdAt: string
  updatedAt: string
}
```

### messages/{messageId}
```ts
InvestigationMessage {
  id: string
  organizationId: string
  roomId: string
  investigationId: string
  sender: { id: string; name: string; role: AgentRole; type: 'human' | 'agent'; provider?: AIProviderId }
  content: string
  associatedClaimIds?: string[]
  associatedEvidenceIds?: string[]
  timestamp: string
}
```

### claims/{claimId}
```ts
Claim {
  id: string
  organizationId: string
  roomId: string
  investigationId: string
  statement: string
  status: 'unverified' | 'supported' | 'disputed' | 'disproved' | 'verified' | 'unknown'
  importance: 'critical' | 'high' | 'medium' | 'low'
  createdBy: { id: string; name: string; type: 'human' | 'agent'; provider?: AIProviderId; role?: AgentRole }
  arguments: ClaimArgument[]
  challenges: ClaimChallenge[]
  relatedEvidenceIds: string[]
  relatedExperimentIds: string[]
  createdAt: string
  updatedAt: string
}
```

### evidence/{evidenceId}
```ts
Evidence {
  id: string
  organizationId: string
  roomId: string
  investigationId: string
  type: EvidenceType
  title: string
  sourceUrl?: string
  sourceType: string
  excerpt: string
  reliability: EvidenceReliability
  relatedClaimIds: string[]
  collectedBy: { id: string; name: string; type: 'human' | 'agent'; role?: AgentRole }
  timestamp: string
}
```

### experiments/{experimentId}
```ts
Experiment {
  id: string
  organizationId: string
  roomId: string
  investigationId: string
  title: string
  objective: string
  status: ExperimentStatus
  environment: string
  commandOrProcedure: string
  expectedResult: string
  actualResult?: string
  outcome: ExperimentOutcome
  relatedClaimIds: string[]
  artifacts: ExperimentArtifact[]
  executionTimestamp?: string
  executedBy?: string
  createdAt: string
  updatedAt: string
}
```

### decisions/{decisionId}
```ts
Decision {
  id: string
  organizationId: string
  roomId: string
  investigationId: string
  title: string
  decision: string
  status: DecisionStatus
  rationale: string
  relatedClaimIds: string[]
  relatedEvidenceIds: string[]
  relatedExperimentIds: string[]
  approvedBy?: string
  approvedAt?: string
  createdAt: string
  updatedAt: string
}
```

## Important rules
- There is no top-level agents collection in the current architecture.
- Do not invent, rename, flatten, or relocate collections.
- Use src/types/index.ts as the field-level source of truth.
- Use src/lib/firestore-service.ts and existing server routers for access patterns.
- Terminal claim states verified/disproved are derived by trusted reconciliation, not ordinary browser writes.
- Decision approval is a trusted operation and requires human approval.
- Preserve organization/tenant isolation from firestore.rules.
- If a schema change is required, stop and request explicit approval before migrating data.

## Relationship model
- Claim.relatedEvidenceIds references evidence documents in the same investigation.
- Claim.relatedExperimentIds references experiment documents in the same investigation.
- Evidence.relatedClaimIds and Experiment.relatedClaimIds point back to claims.
- Messages may reference claims and evidence.
## AI orchestration persistence

The independent panel and adversarial review do **not** create an `agents` collection.

Completed agent output is persisted using the canonical investigation collections:
- `messages/{messageId}` stores the agent's analysis text and identifies `sender.provider` and `sender.role`.
- `claims/{claimId}` stores AI-proposed falsifiable claims. Claims begin as `unverified` even when an AI labels its reasoning as supported; epistemic promotion remains evidence/experiment-driven.
- `claims/{claimId}.challenges[]` stores adversarial challenges. A substantive persisted challenge moves the claim to `disputed` until reconciliation.
- `experiments/{experimentId}` stores recommended experiments as `draft` with `outcome: not_run`.

The persistence endpoint is `/api/ai/independent-panel` and the adversarial endpoint is `/api/ai/adversarial-review`. Both require Firebase authentication and verify organization ownership server-side.

Panel/review IDs are used to make generated document IDs deterministic for retries within the same run. No provider API key is persisted in Firestore.
