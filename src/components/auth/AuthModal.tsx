/**
 * Auth Modal
 */

import React, { useState } from 'react';
import { Shield, Sparkles, LogIn, UserPlus, KeyRound } from 'lucide-react';
import { useAuth } from '../../lib/auth-context';

export const AuthModal: React.FC = () => {
  const { user, signInWithGoogle, signInWithEmail, signUpWithEmail, signInAsTestEngineer } = useAuth();
  const [isRegister, setIsRegister] = useState(false);
  const [email, setEmail] = useState('kosay-h@hotmail.com');
  const [password, setPassword] = useState('123456');
  const [displayName, setDisplayName] = useState('Kosay Hatem (Lead Architect)');
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

        {/* Authentication Actions */}
        <div className="space-y-2.5">
          <button
            type="button"
            id="btn-auth-google"
            onClick={async () => {
              setError(null);
              setIsLoading(true);
              try {
                await signInWithGoogle();
              } catch (e: any) {
                setError(e?.message || 'Google sign-in failed.');
              } finally {
                setIsLoading(false);
              }
            }}
            disabled={isLoading}
            className="w-full py-2.5 px-4 bg-slate-800 hover:bg-slate-700 border border-slate-700 hover:border-slate-500 text-slate-100 text-xs font-semibold rounded-xl transition-all flex items-center justify-center gap-2.5 shadow-sm"
          >
            <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
              />
            </svg>
            Sign in with Google
          </button>

          <button
            type="button"
            id="btn-auth-test-engineer"
            onClick={handleTestEngineer}
            disabled={isLoading}
            className="w-full py-2.5 px-4 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white text-xs font-semibold rounded-xl shadow-lg shadow-cyan-900/40 transition-all flex items-center justify-center gap-2"
          >
            <Sparkles className="w-4 h-4 text-cyan-200 shrink-0" />
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

        <div className="text-center text-xs text-slate-400 pt-2 border-t border-slate-800">
          <button
            type="button"
            id="btn-toggle-auth-mode"
            onClick={() => setIsRegister(!isRegister)}
            className="hover:text-cyan-400 transition-colors"
          >
            {isRegister ? 'Already have credentials? Sign In' : 'New to KMH? Create an Account'}
          </button>
        </div>
      </div>
    </div>
  );
};
