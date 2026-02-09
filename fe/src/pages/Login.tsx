import React, { useState } from 'react';
import { View } from '../types';
import { useAuth } from '../context/AuthContext';

interface LoginProps {
  onNavigate: (view: View) => void;
}

const Login: React.FC<LoginProps> = ({ onNavigate }) => {
  const { login, register } = useAuth();
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      if (mode === 'login') {
        await login(email, password);
      } else {
        await register(username, email, password);
      }
      onNavigate('home');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6 bg-background-dark">
      <div className="w-full max-w-[420px]">
        <div className="text-center mb-10">
          <div className="size-14 bg-primary/15 border border-primary/30 rounded-xl flex items-center justify-center text-primary mx-auto mb-5">
            <span className="material-symbols-outlined text-3xl font-bold">album</span>
          </div>
          <h1 className="text-3xl font-black tracking-tight text-white">Listenr</h1>
          <p className="text-slate-400 mt-1.5 text-sm">Your personal music diary</p>
        </div>

        <div className="bg-surface-dark/80 border border-white/[0.06] rounded-2xl shadow-2xl shadow-black/30 overflow-hidden">
          <div className="flex border-b border-white/[0.06]">
            <button
              type="button"
              onClick={() => { setMode('login'); setError(''); }}
              className={`flex-1 py-3.5 text-sm font-semibold transition-colors ${
                mode === 'login'
                  ? 'text-primary border-b-2 border-primary bg-primary/5'
                  : 'text-slate-400 hover:text-slate-300'
              }`}
            >
              Sign in
            </button>
            <button
              type="button"
              onClick={() => { setMode('register'); setError(''); }}
              className={`flex-1 py-3.5 text-sm font-semibold transition-colors ${
                mode === 'register'
                  ? 'text-primary border-b-2 border-primary bg-primary/5'
                  : 'text-slate-400 hover:text-slate-300'
              }`}
            >
              Create account
            </button>
          </div>

          <form onSubmit={handleSubmit} className="p-6 sm:p-8 space-y-5">
            {error && (
              <div className="flex items-center gap-2 p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
                <span className="material-symbols-outlined text-lg">error</span>
                {error}
              </div>
            )}

            {mode === 'register' && (
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1.5">Username</label>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required={mode === 'register'}
                  className="w-full h-11 bg-white/[0.04] rounded-lg px-4 text-white placeholder:text-slate-500 border border-white/[0.08] focus:border-primary/50 focus:ring-1 focus:ring-primary/30 transition-colors text-base touch-manipulation"
                  placeholder="music_connoisseur"
                />
              </div>
            )}

            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1.5">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full h-11 bg-white/[0.04] rounded-lg px-4 text-white placeholder:text-slate-500 border border-white/[0.08] focus:border-primary/50 focus:ring-1 focus:ring-primary/30 transition-colors text-base touch-manipulation"
                placeholder="you@example.com"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1.5">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full h-11 bg-white/[0.04] rounded-lg px-4 text-white placeholder:text-slate-500 border border-white/[0.08] focus:border-primary/50 focus:ring-1 focus:ring-primary/30 transition-colors text-base touch-manipulation"
                placeholder="••••••••"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-primary text-background-dark font-bold text-sm rounded-lg disabled:opacity-50 touch-manipulation hover:opacity-90 transition-opacity mt-2"
            >
              {loading ? '...' : mode === 'login' ? 'Sign in' : 'Create account'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Login;
