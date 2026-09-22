/**
 * Agent Discussion Panel
 * Multi-role AI analysis using Gemini with epistemic guardrails
 */

import React, { useState } from 'react';
import {
  Bot,
  Send,
  Sparkles,
  ShieldAlert,
  Plus,
  RefreshCw,
  Cpu,
  Layers,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { AgentMessage, AgentRole, Claim } from '../../types';

interface AgentDiscussionPanelProps {
  messages: AgentMessage[];
  investigationQuestion: string;
  environment: string;
  claims: Claim[];
  onSendMessage: (role: AgentRole, content: string) => Promise<void>;
  onRunGeminiAnalysis: (role: AgentRole) => Promise<void>;
  onPromoteStatementToClaim: (statement: string, rationale: string) => void;
  isOpen: boolean;
  onToggle: () => void;
}

const AGENT_ROLES: Record<string, { id: AgentRole; title: string; desc: string; icon: string }> = {
  Architect: {
    id: 'Architect',
    title: 'Lead Systems Architect',
    desc: 'Analyzes macro architecture, COM plumbing, and framework incompatibilities.',
    icon: '🏛️',
  },
  'Adversarial Reviewer': {
    id: 'Adversarial Reviewer',
    title: 'Adversarial Reviewer',
    desc: 'Challenges assumptions, identifies edge cases (e.g. MS 365 co-installed, x64 vs x86).',
    icon: '⚡',
  },
  'Independent Analyst': {
    id: 'Independent Analyst',
    title: 'Independent Analyst',
    desc: 'Provides neutral second opinion without cognitive bias from existing solutions.',
    icon: '🔬',
  },
  'Evidence Researcher': {
    id: 'Evidence Researcher',
    title: 'Evidence Researcher',
    desc: 'Formulates queries against official Microsoft Learn and WPS documentation.',
    icon: '📚',
  },
  'Experiment Agent': {
    id: 'Experiment Agent',
    title: 'Experiment Designer',
    desc: 'Designs executable test procedures and minimal reproducible reproduction code.',
    icon: '🧪',
  },
  'Implementation Agent': {
    id: 'Implementation Agent',
    title: 'Implementation Specialist',
    desc: 'Drafts C# .NET 8 code adhering strictly to verified architectural decisions.',
    icon: '💻',
  },
  'Human Engineer': {
    id: 'Human Engineer',
    title: 'Human Systems Engineer',
    desc: 'Engineering team member directing the investigation.',
    icon: '👤',
  },
};

export const AgentDiscussionPanel: React.FC<AgentDiscussionPanelProps> = ({
  messages,
  investigationQuestion,
  environment,
  claims,
  onSendMessage,
  onRunGeminiAnalysis,
  onPromoteStatementToClaim,
  isOpen,
  onToggle,
}) => {
  const [selectedRole, setSelectedRole] = useState<AgentRole>('Architect');
  const [customInput, setCustomInput] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [activeProvider, setActiveProvider] = useState<'gemini' | 'openai' | 'anthropic' | 'deepseek'>('gemini');

  const handleRunAnalysis = async () => {
    setIsAnalyzing(true);
    try {
      await onRunGeminiAnalysis(selectedRole);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleSendCustom = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customInput.trim()) return;

    setIsAnalyzing(true);
    try {
      await onSendMessage(selectedRole, customInput.trim());
      setCustomInput('');
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div
      id="panel-agent-discussion"
      className="bg-slate-900 border border-slate-800 rounded-xl shadow-xl overflow-hidden transition-all"
    >
      {/* Header bar toggle */}
      <div
        onClick={onToggle}
        className="px-6 py-4 bg-slate-950/80 border-b border-slate-800/80 flex items-center justify-between cursor-pointer hover:bg-slate-950 transition-colors"
      >
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-cyan-950 border border-cyan-500/40 text-cyan-400">
            <Bot size={18} />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
              Multi-Role Engineering Deliberation (Gemini Agent)
              <span className="text-[11px] font-mono px-2 py-0.5 rounded-full bg-cyan-950 text-cyan-300 border border-cyan-500/30">
                {messages.length} Messages
              </span>
            </h3>
            <p className="text-xs text-slate-400">
              Epistemic guardrail active: AI analysis is NOT automatically elevated to claims or facts.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <span className="text-xs font-mono text-emerald-400 flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            Gemini 3.8 Flash Online
          </span>
          {isOpen ? <ChevronUp size={18} className="text-slate-400" /> : <ChevronDown size={18} className="text-slate-400" />}
        </div>
      </div>

      {isOpen && (
        <div className="p-6 space-y-5">
          {/* Multi-Provider Architecture Bar */}
          <div className="p-3 bg-slate-950 border border-slate-800 rounded-lg flex flex-wrap items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2">
              <span className="text-slate-400 font-mono">Engine Providers:</span>
              <button
                type="button"
                onClick={() => setActiveProvider('gemini')}
                className={`px-2.5 py-1 rounded font-mono font-semibold transition-colors flex items-center gap-1.5 ${
                  activeProvider === 'gemini'
                    ? 'bg-cyan-950 text-cyan-300 border border-cyan-500/50 shadow-sm'
                    : 'bg-slate-900 text-slate-400 border border-slate-800'
                }`}
              >
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                Google Gemini (Active)
              </button>

              <button
                type="button"
                onClick={() => setActiveProvider('openai')}
                title="Ready for API credentials in Settings"
                className="px-2.5 py-1 rounded font-mono text-slate-500 bg-slate-900/60 border border-slate-800 flex items-center gap-1.5 hover:text-slate-300"
              >
                <span className="w-1.5 h-1.5 rounded-full bg-slate-600" />
                OpenAI GPT-4o (Pluggable)
              </button>

              <button
                type="button"
                onClick={() => setActiveProvider('anthropic')}
                title="Ready for API credentials in Settings"
                className="px-2.5 py-1 rounded font-mono text-slate-500 bg-slate-900/60 border border-slate-800 flex items-center gap-1.5 hover:text-slate-300"
              >
                <span className="w-1.5 h-1.5 rounded-full bg-slate-600" />
                Claude 3.7 Sonnet (Pluggable)
              </button>

              <button
                type="button"
                onClick={() => setActiveProvider('deepseek')}
                title="Ready for API credentials in Settings"
                className="px-2.5 py-1 rounded font-mono text-slate-500 bg-slate-900/60 border border-slate-800 flex items-center gap-1.5 hover:text-slate-300"
              >
                <span className="w-1.5 h-1.5 rounded-full bg-slate-600" />
                DeepSeek R1 (Pluggable)
              </button>
            </div>

            <span className="text-[11px] font-mono text-slate-500">
              Isolated Provider Architecture
            </span>
          </div>

          {/* Role Selector & Quick Actions */}
          <div className="space-y-2">
            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Select Agent Persona / Role
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
              {(
                [
                  'Architect',
                  'Adversarial Reviewer',
                  'Independent Analyst',
                  'Evidence Researcher',
                  'Experiment Agent',
                  'Implementation Agent',
                ] as AgentRole[]
              ).map((role) => {
                const info = AGENT_ROLES[role];
                const isSelected = selectedRole === role;
                return (
                  <button
                    key={role}
                    type="button"
                    onClick={() => setSelectedRole(role)}
                    className={`p-2.5 rounded-lg border text-left transition-all flex flex-col justify-between ${
                      isSelected
                        ? 'bg-cyan-950/60 border-cyan-500/60 text-cyan-200 ring-1 ring-cyan-500'
                        : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center gap-1.5 font-bold text-xs">
                      <span>{info.icon}</span>
                      <span className="truncate">{role}</span>
                    </div>
                    <span className="text-[10px] opacity-70 mt-1 line-clamp-2">
                      {info.desc}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Trigger Agent Analysis Button */}
          <div className="flex items-center justify-between p-3 bg-slate-950/60 border border-slate-800 rounded-lg">
            <div className="text-xs text-slate-400">
              Prompt Gemini under role <strong className="text-cyan-300 font-mono">[{selectedRole}]</strong> to evaluate the current question, claims, and environment constraints.
            </div>
            <button
              id="btn-run-role-analysis"
              onClick={handleRunAnalysis}
              disabled={isAnalyzing}
              className="px-4 py-2 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 disabled:opacity-50 text-white text-xs font-semibold rounded-lg shadow-md transition-all flex items-center gap-1.5 whitespace-nowrap"
            >
              <Sparkles size={14} className={isAnalyzing ? 'animate-spin' : ''} />
              {isAnalyzing ? 'Agent Deliberating...' : `Request ${selectedRole} Perspective`}
            </button>
          </div>

          {/* Message Stream */}
          <div className="space-y-3 max-h-96 overflow-y-auto pr-1">
            {messages.length === 0 ? (
              <div className="text-center py-8 text-xs text-slate-500 font-mono border border-dashed border-slate-800 rounded-lg">
                No discussion recorded yet. Click above to trigger the first architectural critique.
              </div>
            ) : (
              messages.map((msg) => (
                <div
                  key={msg.id}
                  id={`msg-${msg.id}`}
                  className="p-4 bg-slate-950/80 border border-slate-800 rounded-xl space-y-2.5 transition-all"
                >
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="text-base">
                        {AGENT_ROLES[msg.role]?.icon || '🤖'}
                      </span>
                      <span className="font-mono text-xs font-bold text-slate-200">
                        {msg.authorName}
                      </span>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-900 border border-slate-800 text-cyan-300">
                        {msg.role}
                      </span>
                    </div>
                    <span className="text-[10px] font-mono text-slate-500">
                      {new Date(msg.createdAt).toLocaleTimeString()}
                    </span>
                  </div>

                  <div className="font-mono text-xs text-slate-300 whitespace-pre-wrap leading-relaxed bg-slate-900/40 p-3 rounded-lg border border-slate-800/60">
                    {msg.content}
                  </div>

                  {/* Extract Statement as Claim capability:
                      Allows promoting any specific deduction into a formal UNVERIFIED claim */}
                  <div className="flex items-center justify-between pt-1">
                    <div className="flex items-center gap-1.5 text-[11px] text-amber-400/80 font-mono">
                      <ShieldAlert size={12} />
                      AI reasoning remains hypothesis until experimentally verified.
                    </div>

                    <button
                      type="button"
                      onClick={() =>
                        onPromoteStatementToClaim(
                          msg.content.slice(0, 180),
                          `Derived from ${msg.role} analysis.`
                        )
                      }
                      className="text-[11px] font-mono text-cyan-400 hover:text-cyan-300 hover:underline flex items-center gap-1"
                    >
                      <Plus size={12} />
                      Promote to [🟡 UNVERIFIED] Claim
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Custom Engineer Input */}
          <form onSubmit={handleSendCustom} className="flex gap-2">
            <input
              id="input-agent-custom-query"
              type="text"
              value={customInput}
              onChange={(e) => setCustomInput(e.target.value)}
              placeholder={`Submit engineering challenge or query as ${selectedRole}...`}
              className="flex-1 px-3.5 py-2 bg-slate-950 border border-slate-700 rounded-lg text-slate-100 text-xs focus:outline-none focus:border-cyan-500 font-mono"
            />
            <button
              type="submit"
              disabled={isAnalyzing || !customInput.trim()}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 disabled:opacity-50 text-slate-100 text-xs font-semibold rounded-lg border border-slate-700 transition-colors flex items-center gap-1.5"
            >
              <Send size={13} />
              Submit
            </button>
          </form>
        </div>
      )}
    </div>
  );
};
