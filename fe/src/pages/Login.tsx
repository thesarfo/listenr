import React, { useState, useEffect } from 'react';
import { View } from '../types';
import { useAuth } from '../context/AuthContext';
import { auth as apiAuth } from '../api/client';

interface LoginProps {
  onNavigate: (view: View) => void;
}

const Login: React.FC<LoginProps> = ({ onNavigate }) => {
  const { login, register, loginWithToken } = useAuth();
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get('token');
    const err = params.get('error');
    if (token) {
      loginWithToken(token).then(() => {
        window.history.replaceState({}, '', '/login');
        onNavigate('home');
      }).catch(() => setError('Failed to complete sign-in'));
    } else if (err) {
      const msg = err === 'token_exchange_failed' ? 'Sign-in was interrupted. Please try again.'
        : err === 'userinfo_failed' ? 'Could not load your profile.'
        : err === 'missing_profile' ? 'Google did not provide email.'
        : decodeURIComponent(err);
      setError(msg);
      window.history.replaceState({}, '', '/login');
    }
  }, [loginWithToken, onNavigate]);

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

            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-white/[0.08]" />
              </div>
              <div className="relative flex justify-center text-xs">
                <span className="bg-surface-dark/80 px-3 text-slate-500">or</span>
              </div>
            </div>

            <a
              href={apiAuth.googleAuthUrl()}
              className="flex items-center justify-center gap-2 w-full py-3 bg-white/5 hover:bg-white/10 border border-white/[0.12] rounded-lg text-sm font-medium text-white transition-colors"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              Continue with Google
            </a>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Login;
