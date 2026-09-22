/**
 * Firestore Service Layer
 * Follows the strict organizational hierarchy:
 * organizations/{orgId}/rooms/{roomId}/investigations/{investigationId}/[claims|evidence|experiments|decisions|messages]
 */

import {
  collection,
  doc,
  setDoc,
  getDoc,
  getDocs,
  updateDoc,
  deleteDoc,
  onSnapshot,
  query,
  orderBy,
  where,
  serverTimestamp,
  getDocFromServer,
} from 'firebase/firestore';
import { getFirebaseDb, getFirebaseAuth } from './firebase';
import {
  Claim,
  ClaimArgument,
  ClaimChallenge,
  Decision,
  EngineeringRoom,
  Evidence,
  Experiment,
  Investigation,
  InvestigationMessage,
  Organization,
} from '../types';

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  };
}

export function handleFirestoreError(
  error: unknown,
  operationType: OperationType,
  path: string | null
): never {
  let authInfo = {};
  try {
    const auth = getFirebaseAuth();
    authInfo = {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo:
        auth.currentUser?.providerData?.map((provider) => ({
          providerId: provider.providerId,
          email: provider.email,
        })) || [],
    };
  } catch {
    // Auth client not yet initialized
  }

  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo,
    operationType,
    path,
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

export async function testConnection(): Promise<void> {
  try {
    const db = getFirebaseDb();
    await getDocFromServer(doc(db, 'test', 'connection'));
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.error('Please check your Firebase configuration.');
    }
  }
}

export class FirestoreService {
  // Organizations
  public static async getOrCreateOrganization(
    orgId: string,
    orgName: string,
    ownerId: string
  ): Promise<Organization> {
    const db = getFirebaseDb();
    const orgPath = `organizations/${orgId}`;
    const orgRef = doc(db, 'organizations', orgId);
    try {
      const snap = await getDoc(orgRef);

      if (snap.exists()) {
        return { id: snap.id, ...snap.data() } as Organization;
      }

      const newOrg: Organization = {
        id: orgId,
        name: orgName,
        ownerId,
        createdAt: new Date().toISOString(),
      };
      await setDoc(orgRef, newOrg);
      return newOrg;
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, orgPath);
    }
  }

  // Rooms
  public static async createRoom(
    orgId: string,
    name: string,
    description: string,
    projectTarget: string
  ): Promise<EngineeringRoom> {
    const db = getFirebaseDb();
    const roomId = `room-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
    const roomPath = `organizations/${orgId}/rooms/${roomId}`;
    const roomRef = doc(db, 'organizations', orgId, 'rooms', roomId);

    const room: EngineeringRoom = {
      id: roomId,
      organizationId: orgId,
      name,
      description,
      projectTarget,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    try {
      await setDoc(roomRef, room);
      return room;
    } catch (err) {
      handleFirestoreError(err, OperationType.CREATE, roomPath);
    }
  }

  public static subscribeToRooms(
    orgId: string,
    callback: (rooms: EngineeringRoom[]) => void,
    onError?: (err: unknown) => void
  ) {
    const db = getFirebaseDb();
    const roomsPath = `organizations/${orgId}/rooms`;
    const roomsCol = collection(db, 'organizations', orgId, 'rooms');
    return onSnapshot(
      roomsCol,
      (snapshot) => {
        const rooms: EngineeringRoom[] = snapshot.docs.map((d) => ({
          id: d.id,
          ...d.data(),
        })) as EngineeringRoom[];
        callback(rooms);
      },
      (error) => {
        if (onError) onError(error);
        handleFirestoreError(error, OperationType.LIST, roomsPath);
      }
    );
  }

  // Investigations
  public static async createInvestigation(
    orgId: string,
    roomId: string,
    title: string,
    question: string,
    environment: string,
    priority: Investigation['priority'] = 'high'
  ): Promise<Investigation> {
    const db = getFirebaseDb();
    const invId = `inv-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
    const invPath = `organizations/${orgId}/rooms/${roomId}/investigations/${invId}`;
    const invRef = doc(
      db,
      'organizations',
      orgId,
      'rooms',
      roomId,
      'investigations',
      invId
    );

    const investigation: Investigation = {
      id: invId,
      organizationId: orgId,
      roomId,
      title,
      question,
      status: 'active',
      phase: 'question',
      priority,
      environment,
      participatingAgents: ['Gemini 2.5 Flash', 'Human Architect'],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    try {
      await setDoc(invRef, investigation);

      // Update active investigation on room
      const roomRef = doc(db, 'organizations', orgId, 'rooms', roomId);
      await updateDoc(roomRef, { activeInvestigationId: invId }).catch(() => {});

      return investigation;
    } catch (err) {
      handleFirestoreError(err, OperationType.CREATE, invPath);
    }
  }

  public static subscribeToInvestigations(
    orgId: string,
    roomId: string,
    callback: (investigations: Investigation[]) => void,
    onError?: (err: unknown) => void
  ) {
    const db = getFirebaseDb();
    const invPath = `organizations/${orgId}/rooms/${roomId}/investigations`;
    const invCol = collection(
      db,
      'organizations',
      orgId,
      'rooms',
      roomId,
      'investigations'
    );
    return onSnapshot(
      invCol,
      (snapshot) => {
        const invs: Investigation[] = snapshot.docs.map((d) => ({
          id: d.id,
          ...d.data(),
        })) as Investigation[];
        callback(invs);
      },
      (error) => {
        if (onError) onError(error);
        handleFirestoreError(error, OperationType.LIST, invPath);
      }
    );
  }

  public static async updateInvestigationPhase(
    orgId: string,
    roomId: string,
    invId: string,
    phase: Investigation['phase']
  ): Promise<void> {
    const db = getFirebaseDb();
    const invPath = `organizations/${orgId}/rooms/${roomId}/investigations/${invId}`;
    const invRef = doc(
      db,
      'organizations',
      orgId,
      'rooms',
      roomId,
      'investigations',
      invId
    );
    try {
      await updateDoc(invRef, {
        phase,
        updatedAt: new Date().toISOString(),
      });
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, invPath);
    }
  }

  // Claims
  public static subscribeToClaims(
    orgId: string,
    roomId: string,
    invId: string,
    callback: (claims: Claim[]) => void,
    onError?: (err: unknown) => void
  ) {
    const db = getFirebaseDb();
    const claimsPath = `organizations/${orgId}/rooms/${roomId}/investigations/${invId}/claims`;
    const claimsCol = collection(
      db,
      'organizations',
      orgId,
      'rooms',
      roomId,
      'investigations',
      invId,
      'claims'
    );
    return onSnapshot(
      claimsCol,
      (snapshot) => {
        const claims: Claim[] = snapshot.docs.map((d) => ({
          id: d.id,
          ...d.data(),
        })) as Claim[];
        callback(claims);
      },
      (error) => {
        if (onError) onError(error);
        handleFirestoreError(error, OperationType.LIST, claimsPath);
      }
    );
  }

  public static async createClaim(
    orgId: string,
    roomId: string,
    invId: string,
    claimData: Omit<Claim, 'id' | 'organizationId' | 'roomId' | 'investigationId' | 'createdAt' | 'updatedAt'>
  ): Promise<Claim> {
    const db = getFirebaseDb();
    const claimId = `claim-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
    const claimPath = `organizations/${orgId}/rooms/${roomId}/investigations/${invId}/claims/${claimId}`;
    const claimRef = doc(
      db,
      'organizations',
      orgId,
      'rooms',
      roomId,
      'investigations',
      invId,
      'claims',
      claimId
    );

    const claim: Claim = {
      id: claimId,
      organizationId: orgId,
      roomId,
      investigationId: invId,
      ...claimData,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    try {
      await setDoc(claimRef, claim);
      return claim;
    } catch (err) {
      handleFirestoreError(err, OperationType.CREATE, claimPath);
    }
  }

  public static async updateClaim(
    orgId: string,
    roomId: string,
    invId: string,
    claimId: string,
    updates: Partial<Claim>
  ): Promise<void> {
    const db = getFirebaseDb();
    const claimPath = `organizations/${orgId}/rooms/${roomId}/investigations/${invId}/claims/${claimId}`;
    const claimRef = doc(
      db,
      'organizations',
      orgId,
      'rooms',
      roomId,
      'investigations',
      invId,
      'claims',
      claimId
    );
    try {
      await updateDoc(claimRef, {
        ...updates,
        updatedAt: new Date().toISOString(),
      });
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, claimPath);
    }
  }

  public static async addChallengeToClaim(
    orgId: string,
    roomId: string,
    invId: string,
    claimId: string,
    challenge: Omit<ClaimChallenge, 'id' | 'timestamp'>
  ): Promise<void> {
    const db = getFirebaseDb();
    const claimPath = `organizations/${orgId}/rooms/${roomId}/investigations/${invId}/claims/${claimId}`;
    const claimRef = doc(
      db,
      'organizations',
      orgId,
      'rooms',
      roomId,
      'investigations',
      invId,
      'claims',
      claimId
    );
    try {
      const snap = await getDoc(claimRef);
      if (!snap.exists()) return;
      const current = snap.data() as Claim;
      const challenges = current.challenges || [];
      challenges.push({
        id: `ch-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        ...challenge,
        timestamp: new Date().toISOString(),
      });
      await updateDoc(claimRef, {
        challenges,
        updatedAt: new Date().toISOString(),
      });
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, claimPath);
    }
  }

  public static async addArgumentToClaim(
    orgId: string,
    roomId: string,
    invId: string,
    claimId: string,
    arg: Omit<ClaimArgument, 'id' | 'timestamp'>
  ): Promise<void> {
    const db = getFirebaseDb();
    const claimPath = `organizations/${orgId}/rooms/${roomId}/investigations/${invId}/claims/${claimId}`;
    const claimRef = doc(
      db,
      'organizations',
      orgId,
      'rooms',
      roomId,
      'investigations',
      invId,
      'claims',
      claimId
    );
    try {
      const snap = await getDoc(claimRef);
      if (!snap.exists()) return;
      const current = snap.data() as Claim;
      const args = current.arguments || [];
      args.push({
        id: `arg-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        ...arg,
        timestamp: new Date().toISOString(),
      });
      await updateDoc(claimRef, {
        arguments: args,
        updatedAt: new Date().toISOString(),
      });
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, claimPath);
    }
  }

  // Evidence
  public static subscribeToEvidence(
    orgId: string,
    roomId: string,
    invId: string,
    callback: (evidence: Evidence[]) => void,
    onError?: (err: unknown) => void
  ) {
    const db = getFirebaseDb();
    const evPath = `organizations/${orgId}/rooms/${roomId}/investigations/${invId}/evidence`;
    const evCol = collection(
      db,
      'organizations',
      orgId,
      'rooms',
      roomId,
      'investigations',
      invId,
      'evidence'
    );
    return onSnapshot(
      evCol,
      (snapshot) => {
        const evList: Evidence[] = snapshot.docs.map((d) => ({
          id: d.id,
          ...d.data(),
        })) as Evidence[];
        callback(evList);
      },
      (error) => {
        if (onError) onError(error);
        handleFirestoreError(error, OperationType.LIST, evPath);
      }
    );
  }

  public static async createEvidence(
    orgId: string,
    roomId: string,
    invId: string,
    data: Omit<Evidence, 'id' | 'organizationId' | 'roomId' | 'investigationId' | 'timestamp'>
  ): Promise<Evidence> {
    const db = getFirebaseDb();
    const evId = `ev-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
    const evPath = `organizations/${orgId}/rooms/${roomId}/investigations/${invId}/evidence/${evId}`;
    const evRef = doc(
      db,
      'organizations',
      orgId,
      'rooms',
      roomId,
      'investigations',
      invId,
      'evidence',
      evId
    );

    const evidence: Evidence = {
      id: evId,
      organizationId: orgId,
      roomId,
      investigationId: invId,
      ...data,
      timestamp: new Date().toISOString(),
    };

    try {
      await setDoc(evRef, evidence);

      // Link evidence ID to related claims
      if (data.relatedClaimIds && data.relatedClaimIds.length > 0) {
        for (const cId of data.relatedClaimIds) {
          const claimRef = doc(
            db,
            'organizations',
            orgId,
            'rooms',
            roomId,
            'investigations',
            invId,
            'claims',
            cId
          );
          const claimSnap = await getDoc(claimRef);
          if (claimSnap.exists()) {
            const currentClaim = claimSnap.data() as Claim;
            const updatedEvIds = Array.from(
              new Set([...(currentClaim.relatedEvidenceIds || []), evId])
            );
            await updateDoc(claimRef, { relatedEvidenceIds: updatedEvIds });
          }
        }
      }

      return evidence;
    } catch (err) {
      handleFirestoreError(err, OperationType.CREATE, evPath);
    }
  }

  // Experiments
  public static subscribeToExperiments(
    orgId: string,
    roomId: string,
    invId: string,
    callback: (experiments: Experiment[]) => void,
    onError?: (err: unknown) => void
  ) {
    const db = getFirebaseDb();
    const expPath = `organizations/${orgId}/rooms/${roomId}/investigations/${invId}/experiments`;
    const expCol = collection(
      db,
      'organizations',
      orgId,
      'rooms',
      roomId,
      'investigations',
      invId,
      'experiments'
    );
    return onSnapshot(
      expCol,
      (snapshot) => {
        const exps: Experiment[] = snapshot.docs.map((d) => ({
          id: d.id,
          ...d.data(),
        })) as Experiment[];
        callback(exps);
      },
      (error) => {
        if (onError) onError(error);
        handleFirestoreError(error, OperationType.LIST, expPath);
      }
    );
  }

  public static async createExperiment(
    orgId: string,
    roomId: string,
    invId: string,
    data: Omit<Experiment, 'id' | 'organizationId' | 'roomId' | 'investigationId' | 'createdAt' | 'updatedAt'>
  ): Promise<Experiment> {
    const db = getFirebaseDb();
    const expId = `exp-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
    const expPath = `organizations/${orgId}/rooms/${roomId}/investigations/${invId}/experiments/${expId}`;
    const expRef = doc(
      db,
      'organizations',
      orgId,
      'rooms',
      roomId,
      'investigations',
      invId,
      'experiments',
      expId
    );

    const experiment: Experiment = {
      id: expId,
      organizationId: orgId,
      roomId,
      investigationId: invId,
      ...data,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    try {
      await setDoc(expRef, experiment);

      // Link experiment ID to related claims
      if (data.relatedClaimIds && data.relatedClaimIds.length > 0) {
        for (const cId of data.relatedClaimIds) {
          const claimRef = doc(
            db,
            'organizations',
            orgId,
            'rooms',
            roomId,
            'investigations',
            invId,
            'claims',
            cId
          );
          const claimSnap = await getDoc(claimRef);
          if (claimSnap.exists()) {
            const currentClaim = claimSnap.data() as Claim;
            const updatedExpIds = Array.from(
              new Set([...(currentClaim.relatedExperimentIds || []), expId])
            );
            await updateDoc(claimRef, { relatedExperimentIds: updatedExpIds });
          }
        }
      }

      return experiment;
    } catch (err) {
      handleFirestoreError(err, OperationType.CREATE, expPath);
    }
  }

  public static async updateExperiment(
    orgId: string,
    roomId: string,
    invId: string,
    expId: string,
    updates: Partial<Experiment>
  ): Promise<void> {
    const db = getFirebaseDb();
    const expPath = `organizations/${orgId}/rooms/${roomId}/investigations/${invId}/experiments/${expId}`;
    const expRef = doc(
      db,
      'organizations',
      orgId,
      'rooms',
      roomId,
      'investigations',
      invId,
      'experiments',
      expId
    );
    try {
      await updateDoc(expRef, {
        ...updates,
        updatedAt: new Date().toISOString(),
      });
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, expPath);
    }
  }

  // Decisions
  public static subscribeToDecisions(
    orgId: string,
    roomId: string,
    invId: string,
    callback: (decisions: Decision[]) => void,
    onError?: (err: unknown) => void
  ) {
    const db = getFirebaseDb();
    const decPath = `organizations/${orgId}/rooms/${roomId}/investigations/${invId}/decisions`;
    const decCol = collection(
      db,
      'organizations',
      orgId,
      'rooms',
      roomId,
      'investigations',
      invId,
      'decisions'
    );
    return onSnapshot(
      decCol,
      (snapshot) => {
        const decs: Decision[] = snapshot.docs.map((d) => ({
          id: d.id,
          ...d.data(),
        })) as Decision[];
        callback(decs);
      },
      (error) => {
        if (onError) onError(error);
        handleFirestoreError(error, OperationType.LIST, decPath);
      }
    );
  }

  public static async createDecision(
    orgId: string,
    roomId: string,
    invId: string,
    data: Omit<Decision, 'id' | 'organizationId' | 'roomId' | 'investigationId' | 'createdAt' | 'updatedAt'>
  ): Promise<Decision> {
    const db = getFirebaseDb();
    const decId = `dec-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
    const decPath = `organizations/${orgId}/rooms/${roomId}/investigations/${invId}/decisions/${decId}`;
    const decRef = doc(
      db,
      'organizations',
      orgId,
      'rooms',
      roomId,
      'investigations',
      invId,
      'decisions',
      decId
    );

    const decision: Decision = {
      id: decId,
      organizationId: orgId,
      roomId,
      investigationId: invId,
      ...data,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    try {
      await setDoc(decRef, decision);
      return decision;
    } catch (err) {
      handleFirestoreError(err, OperationType.CREATE, decPath);
    }
  }

  public static async updateDecision(
    orgId: string,
    roomId: string,
    invId: string,
    decId: string,
    updates: Partial<Decision>
  ): Promise<void> {
    const db = getFirebaseDb();
    const decPath = `organizations/${orgId}/rooms/${roomId}/investigations/${invId}/decisions/${decId}`;
    const decRef = doc(
      db,
      'organizations',
      orgId,
      'rooms',
      roomId,
      'investigations',
      invId,
      'decisions',
      decId
    );
    try {
      await updateDoc(decRef, {
        ...updates,
        updatedAt: new Date().toISOString(),
      });
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, decPath);
    }
  }

  // Messages
  public static subscribeToMessages(
    orgId: string,
    roomId: string,
    invId: string,
    callback: (messages: InvestigationMessage[]) => void,
    onError?: (err: unknown) => void
  ) {
    const db = getFirebaseDb();
    const msgPath = `organizations/${orgId}/rooms/${roomId}/investigations/${invId}/messages`;
    const msgCol = collection(
      db,
      'organizations',
      orgId,
      'rooms',
      roomId,
      'investigations',
      invId,
      'messages'
    );
    return onSnapshot(
      msgCol,
      (snapshot) => {
        const msgs: InvestigationMessage[] = snapshot.docs
          .map((d) => ({ id: d.id, ...d.data() }) as InvestigationMessage)
          .sort((a, b) => a.timestamp.localeCompare(b.timestamp));
        callback(msgs);
      },
      (error) => {
        if (onError) onError(error);
        handleFirestoreError(error, OperationType.LIST, msgPath);
      }
    );
  }

  public static async addMessage(
    orgId: string,
    roomId: string,
    invId: string,
    msg: Omit<InvestigationMessage, 'id' | 'organizationId' | 'roomId' | 'investigationId' | 'timestamp'>
  ): Promise<InvestigationMessage> {
    const db = getFirebaseDb();
    const msgId = `msg-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
    const msgPath = `organizations/${orgId}/rooms/${roomId}/investigations/${invId}/messages/${msgId}`;
    const msgRef = doc(
      db,
      'organizations',
      orgId,
      'rooms',
      roomId,
      'investigations',
      invId,
      'messages',
      msgId
    );

    const newMsg: InvestigationMessage = {
      id: msgId,
      organizationId: orgId,
      roomId,
      investigationId: invId,
      ...msg,
      timestamp: new Date().toISOString(),
    };

    try {
      await setDoc(msgRef, newMsg);
      return newMsg;
    } catch (err) {
      handleFirestoreError(err, OperationType.CREATE, msgPath);
    }
  }

  /**
   * Seeds the initial WPS AI project if the room is newly created
   */
  public static async seedWpsAiInvestigation(
    orgId: string,
    roomId: string
  ): Promise<Investigation> {
    const inv = await this.createInvestigation(
      orgId,
      roomId,
      'WPS AI: Access Active WPS Writer Document via .NET 8 WPF',
      'How can our .NET 8 WPF application reliably access the active WPS Writer document on Windows 11?',
      'Windows 11 x64, .NET 8 (CoreCLR), WPS Office 2024 / v12.1.0',
      'critical'
    );

    // Initial Claim 1: Unverified AI hypothesis
    const claim1 = await this.createClaim(orgId, roomId, inv.id, {
      statement: 'WPS Writer supports standard Microsoft Word COM automation via ProgID "Word.Application".',
      status: 'unverified',
      importance: 'critical',
      createdBy: {
        id: 'agent-gemini',
        name: 'Gemini 2.5',
        type: 'agent',
        provider: 'gemini',
        role: 'Architect',
      },
      arguments: [
        {
          id: 'arg-1',
          author: 'Gemini 2.5',
          role: 'Architect',
          text: 'Kingsoft documents historically register standard Office COM compatibility aliases.',
          type: 'pro',
          timestamp: new Date().toISOString(),
        },
      ],
      challenges: [
        {
          id: 'ch-1',
          challenger: 'Human Architect',
          role: 'Human Engineer',
          challenge: 'When MS Office 365 is co-installed, HKCR\\Word.Application points to WINWORD.EXE, breaking WPS detection.',
          timestamp: new Date().toISOString(),
        },
      ],
      relatedEvidenceIds: [],
      relatedExperimentIds: [],
    });

    // Claim 2: Supported claim regarding .NET 8
    const claim2 = await this.createClaim(orgId, roomId, inv.id, {
      statement: '.NET 8 CoreCLR removes Marshal.GetActiveObject; direct P/Invoke to oleaut32!GetActiveObject or Running Object Table (ROT) enumeration is required.',
      status: 'supported',
      importance: 'high',
      createdBy: {
        id: 'human-arch',
        name: 'Lead Systems Engineer',
        type: 'human',
        role: 'Human Engineer',
      },
      arguments: [
        {
          id: 'arg-2',
          author: 'Lead Systems Engineer',
          role: 'Human Engineer',
          text: 'MSDN explicitly states Marshal.GetActiveObject was deprecated and omitted from .NET Core 1.0 through .NET 8.',
          type: 'pro',
          timestamp: new Date().toISOString(),
        },
      ],
      challenges: [],
      relatedEvidenceIds: [],
      relatedExperimentIds: [],
    });

    // Evidence 1: Official documentation
    await this.createEvidence(orgId, roomId, inv.id, {
      type: 'official_documentation',
      title: 'Microsoft .NET COM Interop Breaking Changes (.NET Core 1.0 to .NET 8)',
      sourceUrl: 'https://learn.microsoft.com/en-us/dotnet/core/compatibility/interop',
      sourceType: 'Microsoft Learn',
      excerpt: 'System.Runtime.InteropServices.Marshal.GetActiveObject throws PlatformNotSupportedException on .NET Core. Applications must use P/Invoke or Microsoft.VisualBasic.Interaction.GetObject.',
      reliability: 'high',
      relatedClaimIds: [claim2.id],
      collectedBy: {
        id: 'human-arch',
        name: 'Lead Systems Engineer',
        type: 'human',
      },
    });

    // Experiment 1: P/Invoke Test
    const exp1 = await this.createExperiment(orgId, roomId, inv.id, {
      title: 'Probe WPS ProgID and ROT Binding via C# .NET 8 Console Probe',
      objective: 'Verify if oleaut32!GetActiveObject("Kwps.Application") binds to foreground WPS process.',
      status: 'completed',
      environment: 'Windows 11 Build 22631, .NET 8.0.2, WPS Office 12.1.0.16412',
      commandOrProcedure: 'dotnet run --project tools/WpsComProbe (calls GetActiveObject with Kwps.Application)',
      expectedResult: 'Returns RCW pointer with valid Document.FullName and Paragraphs count.',
      actualResult: 'Kwps.Application returned S_OK. Word.Application failed when MS Word was installed. Kwps is the verified deterministic ProgID.',
      outcome: 'passed',
      relatedClaimIds: [claim1.id, claim2.id],
      artifacts: [
        {
          id: 'art-1',
          name: 'probe_output.log',
          type: 'log',
          contentOrUrl: '[INFO] Probing Kwps.Application... S_OK. ActiveDocument Title: "Project_Proposal.docx". Characters: 4,812.',
        },
      ],
      executedBy: 'Kosay Hatem (Lead Architect)',
      executionTimestamp: new Date().toISOString(),
    });

    // Update claim status based on experiment outcome
    await this.updateClaim(orgId, roomId, inv.id, claim2.id, {
      status: 'verified',
    });
    await this.updateClaim(orgId, roomId, inv.id, claim1.id, {
      status: 'disputed',
    });

    // Add supporting message
    await this.addMessage(orgId, roomId, inv.id, {
      sender: {
        id: 'human-arch',
        name: 'Lead Systems Engineer',
        role: 'Human Engineer',
        type: 'human',
      },
      content: 'I created the baseline investigation for our WPS AI integration. Notice that Claim 1 regarding Word.Application is disputed because on dual-install machines Word.Application routes to MS Word, whereas Claim 2 (.NET 8 P/Invoke) is verified.',
      associatedClaimIds: [claim1.id, claim2.id],
    });

    return inv;
  }
}
