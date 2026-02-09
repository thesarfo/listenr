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
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <div className="size-16 bg-primary rounded-2xl flex items-center justify-center text-background-dark mx-auto mb-4">
            <span className="material-symbols-outlined text-4xl font-bold">album</span>
          </div>
          <h1 className="text-4xl font-black tracking-tighter uppercase">Listenr</h1>
          <p className="text-slate-500 mt-2">Your personal music diary</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6 bg-card-dark p-8 rounded-2xl border border-white/5">
          {error && (
            <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-sm">
              {error}
            </div>
          )}

          {mode === 'register' && (
            <div>
              <label className="block text-xs font-bold uppercase tracking-widest text-slate-500 mb-2">Username</label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required={mode === 'register'}
                className="w-full h-14 md:h-12 bg-white/5 rounded-xl px-4 text-white placeholder:text-slate-600 border border-white/10 focus:ring-2 focus:ring-primary/50 text-base touch-manipulation"
                placeholder="music_connoisseur"
              />
            </div>
          )}

          <div>
            <label className="block text-xs font-bold uppercase tracking-widest text-slate-500 mb-2">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full h-12 bg-white/5 rounded-xl px-4 text-white placeholder:text-slate-600 border border-white/10 focus:ring-2 focus:ring-primary/50"
              placeholder="you@example.com"
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-widest text-slate-500 mb-2">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full h-12 bg-white/5 rounded-xl px-4 text-white placeholder:text-slate-600 border border-white/10 focus:ring-2 focus:ring-primary/50"
              placeholder="••••••••"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 bg-primary text-background-dark font-bold text-sm rounded disabled:opacity-50 touch-manipulation hover:opacity-90 transition-opacity"
          >
            {loading ? '...' : mode === 'login' ? 'Sign In' : 'Create Account'}
          </button>

          <p className="text-center text-slate-500 text-sm">
            {mode === 'login' ? "Don't have an account? " : 'Already have an account? '}
            <button
              type="button"
              onClick={() => { setMode(mode === 'login' ? 'register' : 'login'); setError(''); }}
              className="text-primary font-bold hover:underline"
            >
              {mode === 'login' ? 'Sign up' : 'Sign in'}
            </button>
          </p>
        </form>

        <p className="text-center text-slate-600 text-xs">
          Demo: demo@listenr.com / demo123
        </p>
      </div>
    </div>
  );
};

export default Login;
