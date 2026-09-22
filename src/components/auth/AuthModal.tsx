/**
 * Auth Modal
 */

import React, { useState } from 'react';
import { Shield, Sparkles, LogIn, UserPlus, KeyRound } from 'lucide-react';
import { useAuth } from '../../lib/auth-context';

export const AuthModal: React.FC = () => {
  const { user, signInWithGoogle, signInWithEmail, signUpWithEmail, signInAsTestEngineer } = useAuth();
  const [isRegister, setIsRegister] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('Lead Systems Engineer');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  if (user) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      if (isRegister) {
        await signUpWithEmail(email, password, displayName);
      } else {
        await signInWithEmail(email, password);
      }
    } catch (err: any) {
      setError(err?.message || 'Authentication failed. Check credentials.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleTestEngineer = async () => {
    setError(null);
    setIsLoading(true);
    try {
      await signInAsTestEngineer('Kosay Hatem (Lead Architect)');
    } catch (err: any) {
      setError(err?.message || 'Failed to authenticate in developer mode.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/90 backdrop-blur-md p-4">
      <div
        id="auth-card"
        className="w-full max-w-md bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl overflow-hidden p-8 space-y-6"
      >
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-cyan-950/80 border border-cyan-500/40 text-cyan-400 mb-1 shadow-[0_0_15px_rgba(6,182,212,0.25)]">
            <Shield className="w-6 h-6" />
          </div>
          <h1 className="text-xl font-bold text-slate-100 tracking-tight">
            KMH AI Engineering Room
          </h1>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            Distinguishing hypotheses from verified engineering facts using Claims, Evidence, and Reproducible Experiments.
          </p>
        </div>

        {/* Instant Lead Engineer Access button for seamless evaluation */}
        <div className="space-y-3">
          <button
            type="button"
            id="btn-auth-test-engineer"
            onClick={handleTestEngineer}
            disabled={isLoading}
            className="w-full py-3 px-4 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white text-xs font-semibold rounded-xl shadow-lg shadow-cyan-900/40 transition-all flex items-center justify-center gap-2"
          >
            <Sparkles className="w-4 h-4 text-cyan-200" />
            Enter as Lead Systems Engineer (Instant Demo)
          </button>
          <div className="relative flex py-1 items-center">
            <div className="flex-grow border-t border-slate-800"></div>
            <span className="flex-shrink mx-3 text-[11px] text-slate-500 uppercase tracking-widest font-mono">
              or email sign in
            </span>
            <div className="flex-grow border-t border-slate-800"></div>
          </div>
        </div>

        {error && (
          <div className="p-3 bg-rose-950/50 border border-rose-500/40 rounded-lg text-xs text-rose-300 font-mono">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-3.5">
          {isRegister && (
            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1">
                Full Name / Engineering Title
              </label>
              <input
                id="input-auth-name"
                type="text"
                required
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                placeholder="Lead Systems Engineer"
                className="w-full px-3.5 py-2 bg-slate-950 border border-slate-700 rounded-lg text-slate-100 text-xs focus:outline-none focus:border-cyan-500"
              />
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-slate-400 mb-1">
              Work Email
            </label>
            <input
              id="input-auth-email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="engineer@kmh.corp"
              className="w-full px-3.5 py-2 bg-slate-950 border border-slate-700 rounded-lg text-slate-100 text-xs focus:outline-none focus:border-cyan-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-400 mb-1">
              Password
            </label>
            <input
              id="input-auth-password"
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full px-3.5 py-2 bg-slate-950 border border-slate-700 rounded-lg text-slate-100 text-xs focus:outline-none focus:border-cyan-500"
            />
          </div>

          <button
            type="submit"
            id="btn-auth-submit"
            disabled={isLoading}
            className="w-full py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-100 text-xs font-semibold rounded-lg border border-slate-600 transition-colors flex items-center justify-center gap-2"
          >
            {isRegister ? <UserPlus size={14} /> : <LogIn size={14} />}
            {isRegister ? 'Register Engineering Account' : 'Sign In with Email'}
          </button>
        </form>

        <div className="flex items-center justify-between text-xs text-slate-400 pt-2 border-t border-slate-800">
          <button
            type="button"
            id="btn-toggle-auth-mode"
            onClick={() => setIsRegister(!isRegister)}
            className="hover:text-cyan-400 transition-colors"
          >
            {isRegister ? 'Already have credentials? Sign In' : 'New to KMH? Create an Account'}
          </button>
          <button
            type="button"
            id="btn-auth-google"
            onClick={() => signInWithGoogle().catch((e) => setError(e.message))}
            className="text-slate-400 hover:text-slate-200 text-[11px]"
          >
            Google Sign-in
          </button>
        </div>
      </div>
    </div>
  );
};
