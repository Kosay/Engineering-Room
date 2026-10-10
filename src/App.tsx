/**
 * KMH AI Engineering Room - Main Application
 * Epistemic ground truth workspace for AI-assisted software engineering.
 */

import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './lib/auth-context';
import { AuthModal } from './components/auth/AuthModal';
import { Header } from './components/navigation/Header';
import { SidebarNav, MainNavTab } from './components/navigation/SidebarNav';
import { RoomView } from './components/room/RoomView';
import { InvestigationsListView } from './components/views/InvestigationsListView';
import { ClaimsListView } from './components/views/ClaimsListView';
import { EvidenceListView } from './components/views/EvidenceListView';
import { ExperimentsListView } from './components/views/ExperimentsListView';
import { DecisionsListView } from './components/views/DecisionsListView';

// Modals
import { CreateClaimModal } from './components/modals/CreateClaimModal';
import { ChallengeClaimModal } from './components/modals/ChallengeClaimModal';
import { AddArgumentModal } from './components/modals/AddArgumentModal';
import { CreateEvidenceModal } from './components/modals/CreateEvidenceModal';
import { CreateExperimentModal } from './components/modals/CreateExperimentModal';
import { RecordExperimentResultModal } from './components/modals/RecordExperimentResultModal';
import { CreateDecisionModal } from './components/modals/CreateDecisionModal';
import { CreateInvestigationModal } from './components/modals/CreateInvestigationModal';
import { CreateRoomModal } from './components/modals/CreateRoomModal';

import { FirestoreService, testConnection } from './lib/firestore-service';
import { InvestigationOrchestrator } from './orchestrator/investigation-orchestrator';
import {
  EngineeringRoom,
  Investigation,
  Claim,
  Evidence,
  Experiment,
  Decision,
  AgentMessage,
  InvestigationPhase,
  EpistemicStatus,
  AgentRole,
  ExperimentOutcome,
  DecisionStatus,
  EvidenceType,
  EvidenceReliability,
} from './types';
import { Loader2 } from 'lucide-react';

const getUserOrganizationId = (uid: string) => `org-${uid}`;

function EngineeringWorkspace() {
  const { user, loading } = useAuth();

  // Navigation State
  const [currentTab, setCurrentTab] = useState<MainNavTab>('room');

  // Rooms & Active Selection
  const [rooms, setRooms] = useState<EngineeringRoom[]>([]);
  const [activeRoom, setActiveRoom] = useState<EngineeringRoom | null>(null);

  // Investigations & Active Selection
  const [investigations, setInvestigations] = useState<Investigation[]>([]);
  const [activeInvestigation, setActiveInvestigation] = useState<Investigation | null>(null);

  // Domain Objects for Active Investigation
  const [claims, setClaims] = useState<Claim[]>([]);
  const [evidence, setEvidence] = useState<Evidence[]>([]);
  const [experiments, setExperiments] = useState<Experiment[]>([]);
  const [decisions, setDecisions] = useState<Decision[]>([]);
  const [messages, setMessages] = useState<AgentMessage[]>([]);

  const [isLoadingRooms, setIsLoadingRooms] = useState(true);

  // Modals Open State
  const [isCreateClaimOpen, setIsCreateClaimOpen] = useState(false);
  const [claimDefaultStatement, setClaimDefaultStatement] = useState('');
  const [claimDefaultRationale, setClaimDefaultRationale] = useState('');

  const [isChallengeClaimOpen, setIsChallengeClaimOpen] = useState(false);
  const [selectedClaimForChallenge, setSelectedClaimForChallenge] = useState<Claim | null>(null);

  const [isAddArgumentOpen, setIsAddArgumentOpen] = useState(false);
  const [selectedClaimForArgument, setSelectedClaimForArgument] = useState<Claim | null>(null);

  const [isCreateEvidenceOpen, setIsCreateEvidenceOpen] = useState(false);
  const [preselectedClaimIdForEvidence, setPreselectedClaimIdForEvidence] = useState<string | undefined>();

  const [isCreateExperimentOpen, setIsCreateExperimentOpen] = useState(false);
  const [preselectedClaimIdForExperiment, setPreselectedClaimIdForExperiment] = useState<string | undefined>();

  const [isRecordResultOpen, setIsRecordResultOpen] = useState(false);
  const [selectedExperimentForRecord, setSelectedExperimentForRecord] = useState<Experiment | null>(null);

  const [isCreateDecisionOpen, setIsCreateDecisionOpen] = useState(false);
  const [isCreateInvestigationOpen, setIsCreateInvestigationOpen] = useState(false);
  const [isCreateRoomOpen, setIsCreateRoomOpen] = useState(false);

  // Validate Firestore Connection on mount
  useEffect(() => {
    testConnection();
  }, []);

  // 1. Subscribe to Rooms
  useEffect(() => {
    let unsubscribeRooms: (() => void) | undefined;

    const initRooms = async () => {
      if (!user) {
        setIsLoadingRooms(false);
        return;
      }
      try {
        await FirestoreService.getOrCreateOrganization(
          getUserOrganizationId(user!.uid),
          'KMH AI Engineering Room',
          user.uid
        );

        unsubscribeRooms = FirestoreService.subscribeToRooms(
          getUserOrganizationId(user!.uid),
          async (loadedRooms) => {
            if (loadedRooms.length === 0) {
              // Seed initial room and WPS AI benchmark investigation
              const room = await FirestoreService.createRoom(
                getUserOrganizationId(user!.uid),
                'WPS Office Desktop Engineering',
                'Kingsoft WPS Office interop, COM automation, and WPF integration room.',
                'WPS AI (.NET 8 WPF)'
              );
              if (room) {
                await FirestoreService.seedWpsAiInvestigation(getUserOrganizationId(user!.uid), room.id);
              }
            } else {
              setRooms(loadedRooms);
              setActiveRoom((prev) => {
                if (prev && loadedRooms.some((r) => r.id === prev.id)) return prev;
                return loadedRooms[0];
              });
            }
            setIsLoadingRooms(false);
          },
          (err) => {
            console.error('Subscription error in rooms:', err);
            setIsLoadingRooms(false);
          }
        );
      } catch (err) {
        console.error('Failed to subscribe to rooms:', err);
        setIsLoadingRooms(false);
      }
    };

    initRooms();

    return () => {
      if (unsubscribeRooms) unsubscribeRooms();
    };
  }, [user, loading]);

  // 2. Subscribe to Investigations when activeRoom changes
  useEffect(() => {
    if (!activeRoom) return;

    const unsubscribeInv = FirestoreService.subscribeToInvestigations(
      getUserOrganizationId(user!.uid),
      activeRoom.id,
      (loadedInvs) => {
        setInvestigations(loadedInvs);
        setActiveInvestigation((prev) => {
          if (prev && loadedInvs.some((i) => i.id === prev.id)) return prev;
          return loadedInvs[0] || null;
        });
      },
      (err) => {
        console.error('Subscription error in investigations:', err);
      }
    );

    return () => unsubscribeInv();
  }, [activeRoom]);

  // 3. Subscribe to Claims, Evidence, Experiments, Decisions, Messages when activeInvestigation changes
  useEffect(() => {
    if (!activeRoom || !activeInvestigation) {
      setClaims([]);
      setEvidence([]);
      setExperiments([]);
      setDecisions([]);
      setMessages([]);
      return;
    }

    const orgId = getUserOrganizationId(user!.uid);
    const roomId = activeRoom.id;
    const invId = activeInvestigation.id;

    const unsubs = [
      FirestoreService.subscribeToClaims(orgId, roomId, invId, (c) => setClaims(c)),
      FirestoreService.subscribeToEvidence(orgId, roomId, invId, (e) => setEvidence(e)),
      FirestoreService.subscribeToExperiments(orgId, roomId, invId, (exp) => setExperiments(exp)),
      FirestoreService.subscribeToDecisions(orgId, roomId, invId, (d) => setDecisions(d)),
      FirestoreService.subscribeToMessages(orgId, roomId, invId, (m) => {
        // Map InvestigationMessage to AgentMessage
        const mapped: AgentMessage[] = m.map((msg) => ({
          id: msg.id,
          authorName: msg.sender.name,
          role: msg.sender.role,
          content: msg.content,
          createdAt: msg.timestamp,
        }));
        setMessages(mapped);
      }),
    ];

    return () => {
      unsubs.forEach((u) => u());
    };
  }, [activeRoom, activeInvestigation]);

  // Handler: Change Investigation Phase
  const handlePhaseChange = async (phase: InvestigationPhase) => {
    if (!activeRoom || !activeInvestigation) return;
    await FirestoreService.updateInvestigationPhase(
      getUserOrganizationId(user!.uid),
      activeRoom.id,
      activeInvestigation.id,
      phase
    );
  };

  // Handler: Create Claim
  const handleCreateClaim = async (data: {
    statement: string;
    importance: 'critical' | 'high' | 'medium' | 'low';
    initialStatus: EpistemicStatus;
    rationale?: string;
  }) => {
    if (!activeRoom || !activeInvestigation) return;
    await FirestoreService.createClaim(
      getUserOrganizationId(user!.uid),
      activeRoom.id,
      activeInvestigation.id,
      {
        statement: data.statement,
        status: 'unverified',
        importance: data.importance,
        createdBy: {
          id: user?.uid || 'user-engineer',
          name: user?.displayName || 'Lead Engineer',
          type: 'human',
          role: 'Human Engineer',
        },
        arguments: data.rationale
          ? [
              {
                id: `arg-${Date.now()}`,
                author: user?.displayName || 'Lead Engineer',
                role: 'Human Engineer',
                text: data.rationale,
                type: 'pro',
                timestamp: new Date().toISOString(),
              },
            ]
          : [],
        challenges: [],
        relatedEvidenceIds: [],
        relatedExperimentIds: [],
      }
    );
  };

  // Handler: Challenge Claim
  const handleChallengeClaim = async (data: {
    challenger: string;
    role: AgentRole;
    challenge: string;
    markAsDisputed: boolean;
  }) => {
    if (!activeRoom || !activeInvestigation || !selectedClaimForChallenge) return;
    if (data.markAsDisputed) {
      await FirestoreService.addChallengeAndMarkDisputed(
        getUserOrganizationId(user!.uid),
        activeRoom.id,
        activeInvestigation.id,
        selectedClaimForChallenge.id,
        {
          challenger: data.challenger,
          role: data.role,
          challenge: data.challenge,
        }
      );
    } else {
      await FirestoreService.addChallengeToClaim(
        getUserOrganizationId(user!.uid),
        activeRoom.id,
        activeInvestigation.id,
        selectedClaimForChallenge.id,
        {
          challenger: data.challenger,
          role: data.role,
          challenge: data.challenge,
        }
      );
    }
  };

  // Handler: Add Argument
  const handleAddArgument = async (data: {
    author: string;
    role: AgentRole;
    text: string;
    type: 'pro' | 'contra';
  }) => {
    if (!activeRoom || !activeInvestigation || !selectedClaimForArgument) return;
    await FirestoreService.addArgumentToClaim(
      getUserOrganizationId(user!.uid),
      activeRoom.id,
      activeInvestigation.id,
      selectedClaimForArgument.id,
      {
        author: data.author,
        role: data.role,
        text: data.text,
        type: data.type,
      }
    );
  };

  // Handler: Create Evidence
  const handleCreateEvidence = async (data: {
    type: EvidenceType;
    title: string;
    sourceUrl?: string;
    sourceType: string;
    excerpt: string;
    reliability: EvidenceReliability;
    relatedClaimIds: string[];
    collectedBy: { id: string; name: string; type: 'human' | 'agent' };
  }) => {
    if (!activeRoom || !activeInvestigation) return;
    // FirestoreService creates the evidence and atomically links it to claims.
    await FirestoreService.createEvidence(
      getUserOrganizationId(user!.uid),
      activeRoom.id,
      activeInvestigation.id,
      data
    );
  };

  // Handler: Create Experiment
  const handleCreateExperiment = async (data: {
    title: string;
    objective: string;
    environment: string;
    commandOrProcedure: string;
    expectedResult: string;
    relatedClaimIds: string[];
  }) => {
    if (!activeRoom || !activeInvestigation) return;
    // FirestoreService creates the experiment and atomically links it to claims.
    await FirestoreService.createExperiment(
      getUserOrganizationId(user!.uid),
      activeRoom.id,
      activeInvestigation.id,
      {
        ...data,
        status: 'ready',
        outcome: 'not_run',
        artifacts: [],
      }
    );
  };

  // Handler: Record Experiment Result
  const handleRecordExperimentResult = async (data: {
    outcome: ExperimentOutcome;
    actualResult: string;
    executedBy: string;
    artifactName?: string;
    artifactContent?: string;
  }) => {
    if (!activeRoom || !activeInvestigation || !selectedExperimentForRecord) return;

    const orgId = getUserOrganizationId(user!.uid);
    const roomId = activeRoom.id;
    const invId = activeInvestigation.id;
    const expId = selectedExperimentForRecord.id;

    const artifacts = [...(selectedExperimentForRecord.artifacts || [])];
    if (data.artifactName && data.artifactContent) {
      artifacts.push({
        id: `art-${Date.now()}`,
        name: data.artifactName,
        type: 'log',
        contentOrUrl: data.artifactContent,
      });
    }

    await FirestoreService.recordExperimentResult(orgId, roomId, invId, expId, {
      outcome: data.outcome,
      actualResult: data.actualResult,
      executedBy: data.executedBy,
      executionTimestamp: new Date().toISOString(),
      artifacts,
    });

    // Experiment results are inputs to reconciliation, not direct epistemic transitions.
  };

  // Handler: Create Decision
  const handleCreateDecision = async (data: {
    title: string;
    decision: string;
    status: DecisionStatus;
    rationale: string;
    relatedClaimIds: string[];
    relatedEvidenceIds: string[];
    relatedExperimentIds: string[];
    approvedBy?: string;
  }) => {
    if (!activeRoom || !activeInvestigation) return;
    await FirestoreService.createDecision(
      getUserOrganizationId(user!.uid),
      activeRoom.id,
      activeInvestigation.id,
      data
    );
  };

  // Handler: Approve Decision
  const handleApproveDecision = async (decisionId: string) => {
    if (!activeRoom || !activeInvestigation) return;

    try {
      await FirestoreService.approveDecision(
        getUserOrganizationId(user!.uid),
        activeRoom.id,
        activeInvestigation.id,
        decisionId,
      );
    } catch (error) {
      console.error('Decision approval failed:', error);
    }
  };

  // Handler: Reconcile All Claims
  const handleReconcileAll = async () => {
    if (!activeRoom || !activeInvestigation) return;
    try {
      await InvestigationOrchestrator.reconcileInvestigation(
        getUserOrganizationId(user!.uid),
        activeRoom.id,
        activeInvestigation.id
      );
    } catch (error) {
      console.error('Investigation reconciliation failed:', error);
    }
  };

  // Handler: Apply a single reconciled claim status.
  const handleUpdateClaimStatus = async (claimId: string, _newStatus: EpistemicStatus) => {
    if (!activeRoom || !activeInvestigation) return;
    await FirestoreService.reconcileClaimStatus(
      getUserOrganizationId(user!.uid),
      activeRoom.id,
      activeInvestigation.id,
      claimId
    );
  };

  // Handler: Add Message
  const handleSendMessage = async (role: AgentRole, content: string) => {
    if (!activeRoom || !activeInvestigation) return;
    await FirestoreService.addMessage(
      getUserOrganizationId(user!.uid),
      activeRoom.id,
      activeInvestigation.id,
      {
        sender: {
          id: user?.uid || 'user-engineer',
          name: user?.displayName || 'Lead Engineer',
          role,
          type: 'human',
        },
        content,
      }
    );
  };

  // Handler: Trigger Gemini AI Analysis
  const handleRunGeminiAnalysis = async (role: AgentRole) => {
    if (!activeRoom || !activeInvestigation) return;

    try {
      const result = await InvestigationOrchestrator.executeAnalysis(
        activeInvestigation,
        claims,
        evidence,
        experiments,
        'gemini',
        role
      );

      await FirestoreService.addMessage(
        getUserOrganizationId(user!.uid),
        activeRoom.id,
        activeInvestigation.id,
        {
          sender: {
            id: 'agent-gemini',
            name: `Gemini 3.8 Flash (${role})`,
            role,
            type: 'agent',
            provider: 'gemini',
          },
          content: result.analysisText || 'Analysis completed.',
        }
      );
    } catch (err) {
      console.error('Failed to run Gemini analysis:', err);
      await FirestoreService.addMessage(
        getUserOrganizationId(user!.uid),
        activeRoom.id,
        activeInvestigation.id,
        {
          sender: {
            id: 'system',
            name: 'Engineering Room',
            role,
            type: 'agent',
            provider: 'gemini',
          },
          content: 'Gemini analysis is unavailable. No engineering conclusion was generated. Check provider configuration and retry.',
        }
      );
    }
  };

  // Handler: Create New Investigation
  const handleCreateInvestigation = async (data: {
    title: string;
    question: string;
    environment: string;
    priority: any;
  }) => {
    if (!activeRoom) return;
    const inv = await FirestoreService.createInvestigation(
      getUserOrganizationId(user!.uid),
      activeRoom.id,
      data.title,
      data.question,
      data.environment,
      data.priority
    );
    setActiveInvestigation(inv);
    setCurrentTab('room');
  };

  // Handler: Create New Room
  const handleCreateRoom = async (data: {
    name: string;
    description: string;
    projectTarget: string;
  }) => {
    const room = await FirestoreService.createRoom(
      getUserOrganizationId(user!.uid),
      data.name,
      data.description,
      data.projectTarget
    );
    setActiveRoom(room);
  };

  // Handler: Reset / Re-seed Benchmark WPS AI Investigation
  const handleResetSeedData = async () => {
    if (!activeRoom) return;
    const inv = await FirestoreService.seedWpsAiInvestigation(getUserOrganizationId(user!.uid), activeRoom.id);
    setActiveInvestigation(inv);
    setCurrentTab('room');
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col selection:bg-cyan-500/30 selection:text-cyan-200">
      <Header
        rooms={rooms}
        activeRoom={activeRoom}
        onSelectRoom={setActiveRoom}
        onOpenCreateRoom={() => setIsCreateRoomOpen(true)}
        onResetSeedData={handleResetSeedData}
      />

      <div className="flex-1 flex flex-col lg:flex-row">
        <SidebarNav
          currentTab={currentTab}
          onSelectTab={setCurrentTab}
          claims={claims}
          investigationsCount={investigations.length}
          evidenceCount={evidence.length}
          experimentsCount={experiments.length}
          decisionsCount={decisions.length}
          onOpenCreateInvestigation={() => setIsCreateInvestigationOpen(true)}
          activeProjectTarget={activeRoom?.projectTarget || 'WPS AI (.NET 8 WPF)'}
        />

        <main className="flex-1 p-4 md:p-6 lg:p-8 overflow-y-auto">
          {isLoadingRooms ? (
            <div className="flex flex-col items-center justify-center py-20 space-y-3">
              <Loader2 className="w-8 h-8 text-cyan-400 animate-spin" />
              <p className="text-xs font-mono text-slate-400">
                Initializing KMH AI Engineering Room & Epistemic Matrix...
              </p>
            </div>
          ) : activeRoom ? (
            <>
              {currentTab === 'room' && (
                <RoomView
                  room={activeRoom}
                  investigations={investigations}
                  activeInvestigation={activeInvestigation}
                  claims={claims}
                  evidence={evidence}
                  experiments={experiments}
                  decisions={decisions}
                  messages={messages}
                  onSelectInvestigation={setActiveInvestigation}
                  onOpenCreateInvestigation={() => setIsCreateInvestigationOpen(true)}
                  onPhaseChange={handlePhaseChange}
                  onOpenCreateClaim={(stmt, rat) => {
                    setClaimDefaultStatement(stmt || '');
                    setClaimDefaultRationale(rat || '');
                    setIsCreateClaimOpen(true);
                  }}
                  onOpenChallengeClaim={(claim) => {
                    setSelectedClaimForChallenge(claim);
                    setIsChallengeClaimOpen(true);
                  }}
                  onOpenAddArgument={(claim) => {
                    setSelectedClaimForArgument(claim);
                    setIsAddArgumentOpen(true);
                  }}
                  onOpenCreateEvidence={(claimId) => {
                    setPreselectedClaimIdForEvidence(claimId);
                    setIsCreateEvidenceOpen(true);
                  }}
                  onOpenCreateExperiment={(claimId) => {
                    setPreselectedClaimIdForExperiment(claimId);
                    setIsCreateExperimentOpen(true);
                  }}
                  onOpenRecordResult={(exp) => {
                    setSelectedExperimentForRecord(exp);
                    setIsRecordResultOpen(true);
                  }}
                  onOpenCreateDecision={() => setIsCreateDecisionOpen(true)}
                  onApproveDecision={handleApproveDecision}
                  onReconcileAll={handleReconcileAll}
                  onUpdateClaimStatus={handleUpdateClaimStatus}
                  onSendMessage={handleSendMessage}
                  onRunGeminiAnalysis={handleRunGeminiAnalysis}
                />
              )}

              {currentTab === 'investigations' && (
                <InvestigationsListView
                  investigations={investigations}
                  activeInvestigation={activeInvestigation}
                  onSelectInvestigation={(inv) => {
                    setActiveInvestigation(inv);
                    setCurrentTab('room');
                  }}
                  onOpenCreateInvestigation={() => setIsCreateInvestigationOpen(true)}
                />
              )}

              {currentTab === 'claims' && (
                <ClaimsListView
                  claims={claims}
                  onOpenCreateClaim={(stmt, rat) => {
                    setClaimDefaultStatement(stmt || '');
                    setClaimDefaultRationale(rat || '');
                    setIsCreateClaimOpen(true);
                  }}
                  onOpenChallengeClaim={(claim) => {
                    setSelectedClaimForChallenge(claim);
                    setIsChallengeClaimOpen(true);
                  }}
                  onOpenAddArgument={(claim) => {
                    setSelectedClaimForArgument(claim);
                    setIsAddArgumentOpen(true);
                  }}
                  onOpenCreateEvidenceForClaim={(cId) => {
                    setPreselectedClaimIdForEvidence(cId);
                    setIsCreateEvidenceOpen(true);
                  }}
                  onOpenCreateExperimentForClaim={(cId) => {
                    setPreselectedClaimIdForExperiment(cId);
                    setIsCreateExperimentOpen(true);
                  }}
                />
              )}

              {currentTab === 'evidence' && (
                <EvidenceListView
                  evidence={evidence}
                  claims={claims}
                  onOpenCreateEvidence={() => {
                    setPreselectedClaimIdForEvidence(undefined);
                    setIsCreateEvidenceOpen(true);
                  }}
                />
              )}

              {currentTab === 'experiments' && (
                <ExperimentsListView
                  experiments={experiments}
                  claims={claims}
                  onOpenCreateExperiment={() => {
                    setPreselectedClaimIdForExperiment(undefined);
                    setIsCreateExperimentOpen(true);
                  }}
                  onOpenRecordResult={(exp) => {
                    setSelectedExperimentForRecord(exp);
                    setIsRecordResultOpen(true);
                  }}
                />
              )}

              {currentTab === 'decisions' && (
                <DecisionsListView
                  decisions={decisions}
                  claims={claims}
                  evidence={evidence}
                  experiments={experiments}
                  onOpenCreateDecision={() => setIsCreateDecisionOpen(true)}
                  onApproveDecision={handleApproveDecision}
                />
              )}
            </>
          ) : (
            <div className="text-center py-20 text-slate-400">
              No rooms created yet.
            </div>
          )}
        </main>
      </div>

      {/* Modals */}
      <CreateClaimModal
        isOpen={isCreateClaimOpen}
        onClose={() => setIsCreateClaimOpen(false)}
        onSubmit={handleCreateClaim}
        defaultStatement={claimDefaultStatement}
        defaultRationale={claimDefaultRationale}
      />

      <ChallengeClaimModal
        isOpen={isChallengeClaimOpen}
        claim={selectedClaimForChallenge}
        onClose={() => setIsChallengeClaimOpen(false)}
        onSubmit={handleChallengeClaim}
      />

      <AddArgumentModal
        isOpen={isAddArgumentOpen}
        claim={selectedClaimForArgument}
        onClose={() => setIsAddArgumentOpen(false)}
        onSubmit={handleAddArgument}
      />

      <CreateEvidenceModal
        isOpen={isCreateEvidenceOpen}
        onClose={() => setIsCreateEvidenceOpen(false)}
        availableClaims={claims}
        preselectedClaimId={preselectedClaimIdForEvidence}
        onSubmit={handleCreateEvidence}
      />

      <CreateExperimentModal
        isOpen={isCreateExperimentOpen}
        onClose={() => setIsCreateExperimentOpen(false)}
        availableClaims={claims}
        preselectedClaimId={preselectedClaimIdForExperiment}
        defaultEnvironment={activeInvestigation?.environment}
        onSubmit={handleCreateExperiment}
      />

      <RecordExperimentResultModal
        isOpen={isRecordResultOpen}
        experiment={selectedExperimentForRecord}
        onClose={() => setIsRecordResultOpen(false)}
        onSubmit={handleRecordExperimentResult}
      />

      <CreateDecisionModal
        isOpen={isCreateDecisionOpen}
        onClose={() => setIsCreateDecisionOpen(false)}
        availableClaims={claims}
        availableEvidence={evidence}
        availableExperiments={experiments}
        onSubmit={handleCreateDecision}
      />

      <CreateInvestigationModal
        isOpen={isCreateInvestigationOpen}
        onClose={() => setIsCreateInvestigationOpen(false)}
        onSubmit={handleCreateInvestigation}
        defaultTarget={activeRoom?.projectTarget}
      />

      <CreateRoomModal
        isOpen={isCreateRoomOpen}
        onClose={() => setIsCreateRoomOpen(false)}
        onSubmit={handleCreateRoom}
      />
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <EngineeringWorkspace />
      <AuthModal />
    </AuthProvider>
  );
}
