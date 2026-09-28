/**
 * Settings Modal
 * Allows managing AI API keys (Gemini, OpenAI, Anthropic, DeepSeek)
 * and provides clear guidance on asking questions and initializing investigations.
 */

import React, { useState, useEffect } from 'react';
import {
  X,
  Settings,
  Key,
  HelpCircle,
  Sparkles,
  ShieldCheck,
  Check,
  Bot,
  ExternalLink,
  Cpu,
  Layers,
  Save,
  Info,
} from 'lucide-react';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenCreateInvestigation: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  onOpenCreateInvestigation,
}) => {
  const [activeTab, setActiveTab] = useState<'api-keys' | 'how-to-ask' | 'engine'>('api-keys');

  // API Key States saved in localStorage
  const [geminiKey, setGeminiKey] = useState('');
  const [openaiKey, setOpenaiKey] = useState('');
  const [anthropicKey, setAnthropicKey] = useState('');
  const [deepseekKey, setDeepseekKey] = useState('');
  const [selectedProvider, setSelectedProvider] = useState<'gemini' | 'openai' | 'anthropic' | 'deepseek'>('gemini');

  const [savedSuccess, setSavedSuccess] = useState(false);

  // Load keys on mount / open
  useEffect(() => {
    if (isOpen) {
      setGeminiKey(localStorage.getItem('KMH_GEMINI_API_KEY') || '');
      setOpenaiKey(localStorage.getItem('KMH_OPENAI_API_KEY') || '');
      setAnthropicKey(localStorage.getItem('KMH_ANTHROPIC_API_KEY') || '');
      setDeepseekKey(localStorage.getItem('KMH_DEEPSEEK_API_KEY') || '');
      setSelectedProvider((localStorage.getItem('KMH_ACTIVE_AI_PROVIDER') as any) || 'gemini');
      setSavedSuccess(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSaveKeys = (e: React.FormEvent) => {
    e.preventDefault();
    localStorage.setItem('KMH_GEMINI_API_KEY', geminiKey.trim());
    localStorage.setItem('KMH_OPENAI_API_KEY', openaiKey.trim());
    localStorage.setItem('KMH_ANTHROPIC_API_KEY', anthropicKey.trim());
    localStorage.setItem('KMH_DEEPSEEK_API_KEY', deepseekKey.trim());
    localStorage.setItem('KMH_ACTIVE_AI_PROVIDER', selectedProvider);

    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-fade-in">
      <div
        id="modal-settings"
        className="w-full max-w-2xl bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] border-cyan-500/30"
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950/80">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-cyan-950 border border-cyan-500/40 text-cyan-400">
              <Settings size={20} />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-100 flex items-center gap-2">
                Engineering Room Settings
              </h2>
              <p className="text-xs text-slate-400">
                Configure AI engine API credentials and review investigation workspace usage.
              </p>
            </div>
          </div>
          <button
            id="btn-close-settings"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Tab Selector */}
        <div className="flex border-b border-slate-800 bg-slate-950/40 px-6 pt-2 gap-2">
          <button
            type="button"
            id="tab-settings-api-keys"
            onClick={() => setActiveTab('api-keys')}
            className={`px-4 py-2 text-xs font-mono font-semibold rounded-t-lg border-t border-x transition-all flex items-center gap-2 ${
              activeTab === 'api-keys'
                ? 'bg-slate-900 border-slate-700 text-cyan-300 border-b-slate-900'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Key size={14} />
            AI API Keys
          </button>
          <button
            type="button"
            id="tab-settings-how-to-ask"
            onClick={() => setActiveTab('how-to-ask')}
            className={`px-4 py-2 text-xs font-mono font-semibold rounded-t-lg border-t border-x transition-all flex items-center gap-2 ${
              activeTab === 'how-to-ask'
                ? 'bg-slate-900 border-slate-700 text-cyan-300 border-b-slate-900'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <HelpCircle size={14} />
            How to Ask Questions
          </button>
          <button
            type="button"
            id="tab-settings-engine"
            onClick={() => setActiveTab('engine')}
            className={`px-4 py-2 text-xs font-mono font-semibold rounded-t-lg border-t border-x transition-all flex items-center gap-2 ${
              activeTab === 'engine'
                ? 'bg-slate-900 border-slate-700 text-cyan-300 border-b-slate-900'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Cpu size={14} />
            Epistemic Engine Info
          </button>
        </div>

        {/* Modal Content */}
        <div className="p-6 overflow-y-auto space-y-6">
          {/* TAB 1: API KEYS */}
          {activeTab === 'api-keys' && (
            <form onSubmit={handleSaveKeys} className="space-y-5">
              <div className="p-3.5 bg-cyan-950/40 border border-cyan-500/30 rounded-xl text-xs text-cyan-200 space-y-1">
                <div className="flex items-center gap-2 font-semibold">
                  <Info size={16} className="text-cyan-400 shrink-0" />
                  <span>Secure API Key Management</span>
                </div>
                <p className="text-slate-300">
                  Your keys are saved locally in your browser storage and passed directly to the AI Studio backend proxy.
                </p>
              </div>

              {/* Active Provider Selection */}
              <div>
                <label className="block text-xs font-mono font-semibold text-slate-300 uppercase tracking-wider mb-2">
                  Default AI Provider Engine
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {[
                    { id: 'gemini', name: 'Google Gemini 3.8', icon: '✨' },
                    { id: 'openai', name: 'OpenAI GPT-4o', icon: '🧠' },
                    { id: 'anthropic', name: 'Claude 3.7', icon: '📜' },
                    { id: 'deepseek', name: 'DeepSeek R1', icon: '🔍' },
                  ].map((prov) => (
                    <button
                      key={prov.id}
                      type="button"
                      onClick={() => setSelectedProvider(prov.id as any)}
                      className={`p-2.5 rounded-xl border text-left font-mono text-xs transition-all flex flex-col justify-between ${
                        selectedProvider === prov.id
                          ? 'bg-cyan-950/80 border-cyan-500 text-cyan-200 ring-1 ring-cyan-500'
                          : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                      }`}
                    >
                      <span className="text-base">{prov.icon}</span>
                      <span className="font-bold mt-1">{prov.name}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Input: Google Gemini API Key */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-mono font-semibold text-slate-200 flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-400" />
                    Google Gemini API Key (Default Engine)
                  </label>
                  <a
                    href="https://aistudio.google.com/app/apikey"
                    target="_blank"
                    rel="noreferrer"
                    className="text-[11px] font-mono text-cyan-400 hover:underline flex items-center gap-1"
                  >
                    Get Key from AI Studio <ExternalLink size={10} />
                  </a>
                </div>
                <input
                  id="input-key-gemini"
                  type="password"
                  value={geminiKey}
                  onChange={(e) => setGeminiKey(e.target.value)}
                  placeholder="AIzaSy..."
                  className="w-full px-3.5 py-2 bg-slate-950 border border-slate-700 rounded-lg text-slate-100 text-xs font-mono focus:outline-none focus:border-cyan-500"
                />
              </div>

              {/* Input: OpenAI API Key */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-mono font-semibold text-slate-200">
                    OpenAI API Key (Optional)
                  </label>
                  <a
                    href="https://platform.openai.com/api-keys"
                    target="_blank"
                    rel="noreferrer"
                    className="text-[11px] font-mono text-cyan-400 hover:underline flex items-center gap-1"
                  >
                    Get Key <ExternalLink size={10} />
                  </a>
                </div>
                <input
                  id="input-key-openai"
                  type="password"
                  value={openaiKey}
                  onChange={(e) => setOpenaiKey(e.target.value)}
                  placeholder="sk-..."
                  className="w-full px-3.5 py-2 bg-slate-950 border border-slate-700 rounded-lg text-slate-100 text-xs font-mono focus:outline-none focus:border-cyan-500"
                />
              </div>

              {/* Input: Anthropic API Key */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-mono font-semibold text-slate-200">
                    Anthropic Claude API Key (Optional)
                  </label>
                  <a
                    href="https://console.anthropic.com/"
                    target="_blank"
                    rel="noreferrer"
                    className="text-[11px] font-mono text-cyan-400 hover:underline flex items-center gap-1"
                  >
                    Get Key <ExternalLink size={10} />
                  </a>
                </div>
                <input
                  id="input-key-anthropic"
                  type="password"
                  value={anthropicKey}
                  onChange={(e) => setAnthropicKey(e.target.value)}
                  placeholder="sk-ant-..."
                  className="w-full px-3.5 py-2 bg-slate-950 border border-slate-700 rounded-lg text-slate-100 text-xs font-mono focus:outline-none focus:border-cyan-500"
                />
              </div>

              {/* Input: DeepSeek API Key */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-mono font-semibold text-slate-200">
                    DeepSeek API Key (Optional)
                  </label>
                  <a
                    href="https://platform.deepseek.com/"
                    target="_blank"
                    rel="noreferrer"
                    className="text-[11px] font-mono text-cyan-400 hover:underline flex items-center gap-1"
                  >
                    Get Key <ExternalLink size={10} />
                  </a>
                </div>
                <input
                  id="input-key-deepseek"
                  type="password"
                  value={deepseekKey}
                  onChange={(e) => setDeepseekKey(e.target.value)}
                  placeholder="sk-..."
                  className="w-full px-3.5 py-2 bg-slate-950 border border-slate-700 rounded-lg text-slate-100 text-xs font-mono focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div className="pt-3 flex items-center justify-between border-t border-slate-800">
                {savedSuccess ? (
                  <span className="text-xs font-mono text-emerald-400 flex items-center gap-1.5">
                    <Check size={16} /> API Keys Saved Successfully!
                  </span>
                ) : (
                  <span className="text-[11px] font-mono text-slate-500">
                    Stored in local browser cache.
                  </span>
                )}

                <button
                  type="submit"
                  id="btn-save-api-keys"
                  className="px-4 py-2 bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-semibold rounded-lg shadow-md transition-colors flex items-center gap-1.5"
                >
                  <Save size={14} />
                  Save Settings
                </button>
              </div>
            </form>
          )}

          {/* TAB 2: HOW TO ASK QUESTIONS */}
          {activeTab === 'how-to-ask' && (
            <div className="space-y-5 text-slate-300 text-xs leading-relaxed">
              <div className="p-4 bg-slate-950 border border-slate-800 rounded-xl space-y-2">
                <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
                  <HelpCircle className="w-4 h-4 text-cyan-400" />
                  How to Ask an Engineering Question
                </h3>
                <p className="text-slate-400">
                  In the KMH AI Engineering Room, questions drive structured investigations that separate unverified theories from empirically verified facts.
                </p>
              </div>

              <div className="space-y-4">
                <div className="p-3.5 bg-slate-950/60 border border-slate-800 rounded-xl space-y-2">
                  <div className="flex items-center gap-2 font-bold text-cyan-300">
                    <span className="w-5 h-5 rounded-full bg-cyan-950 text-cyan-400 text-[11px] flex items-center justify-center border border-cyan-500/40">1</span>
                    Method 1: Initialize a New Investigation
                  </div>
                  <p className="text-slate-300 pl-7">
                    Click the <strong>"+ New Investigation"</strong> button in the left sidebar or room header. Enter your central question (e.g. <em>"Does Kingsoft WPSWriter implement standard Word COM automation ProgIDs in .NET 8?"</em>), choose your target operating environment, and click <strong>Initialize Investigation</strong>.
                  </p>
                  <div className="pl-7 pt-1">
                    <button
                      type="button"
                      id="btn-settings-start-investigation"
                      onClick={() => {
                        onClose();
                        onOpenCreateInvestigation();
                      }}
                      className="px-3.5 py-1.5 bg-cyan-600 hover:bg-cyan-500 text-white font-semibold rounded-lg text-xs transition-colors inline-flex items-center gap-1.5"
                    >
                      <Sparkles size={13} />
                      Open "+ New Investigation" Form
                    </button>
                  </div>
                </div>

                <div className="p-3.5 bg-slate-950/60 border border-slate-800 rounded-xl space-y-2">
                  <div className="flex items-center gap-2 font-bold text-cyan-300">
                    <span className="w-5 h-5 rounded-full bg-cyan-950 text-cyan-400 text-[11px] flex items-center justify-center border border-cyan-500/40">2</span>
                    Method 2: Ask the Multi-Role AI Agent
                  </div>
                  <p className="text-slate-300 pl-7">
                    Inside any active investigation, open the <strong>Multi-Role AI Deliberation Panel</strong>. Select an AI Persona (e.g., <em>Lead Systems Architect</em> or <em>Adversarial Reviewer</em>), type your specific technical question or scenario, and click <strong>Submit</strong>.
                  </p>
                </div>

                <div className="p-3.5 bg-slate-950/60 border border-slate-800 rounded-xl space-y-2">
                  <div className="flex items-center gap-2 font-bold text-cyan-300">
                    <span className="w-5 h-5 rounded-full bg-cyan-950 text-cyan-400 text-[11px] flex items-center justify-center border border-cyan-500/40">3</span>
                    Method 3: Falsifiable Claims & Empirical Experiments
                  </div>
                  <p className="text-slate-300 pl-7">
                    Transform any AI deduction into a formal <strong>Claim</strong>. Run experiments against your C# or Win32 test suites and record test outcomes to transition claims into <strong>VERIFIED</strong> or <strong>DISPROVED</strong> status.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: EPISTEMIC ENGINE INFO */}
          {activeTab === 'engine' && (
            <div className="space-y-4 text-xs">
              <div className="p-4 bg-slate-950 border border-slate-800 rounded-xl space-y-2">
                <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
                  <Layers className="w-4 h-4 text-cyan-400" />
                  KMH Epistemic State Engine Architecture
                </h3>
                <p className="text-slate-400 leading-relaxed">
                  The KMH AI Engineering Room operates on a strict Claims & Epistemic State Machine design pattern.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 font-mono">
                <div className="p-3 bg-slate-950/80 border border-slate-800 rounded-xl space-y-1">
                  <span className="text-amber-400 font-bold">🟡 Unverified / Supported</span>
                  <p className="text-slate-400 text-[11px] font-sans">
                    Initial state for all AI reasoning, theories, and documentation references.
                  </p>
                </div>

                <div className="p-3 bg-slate-950/80 border border-slate-800 rounded-xl space-y-1">
                  <span className="text-emerald-400 font-bold">🟢 Verified Fact</span>
                  <p className="text-slate-400 text-[11px] font-sans">
                    Requires reproducible passing experiment runs or authoritative high-reliability evidence.
                  </p>
                </div>

                <div className="p-3 bg-slate-950/80 border border-slate-800 rounded-xl space-y-1">
                  <span className="text-rose-400 font-bold">🔴 Disproved / Falsified</span>
                  <p className="text-slate-400 text-[11px] font-sans">
                    Derived automatically when conclusive test runs fail or counter-evidence disproves assertion.
                  </p>
                </div>

                <div className="p-3 bg-slate-950/80 border border-slate-800 rounded-xl space-y-1">
                  <span className="text-blue-400 font-bold">🔵 Approved Decision</span>
                  <p className="text-slate-400 text-[11px] font-sans">
                    Architectural decision blocked until supporting claims reach verified status.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
