import React from 'react';
import { View } from '../types';
import { useAuth } from '../context/AuthContext';
import { getAvatarUrl } from '../utils/avatar';

interface HeaderProps {
  onNavigate: (view: View) => void;
  onLogout: () => void;
  onMenuClick?: () => void;
}

const Header: React.FC<HeaderProps> = ({ onNavigate, onLogout, onMenuClick }) => {
  const { user } = useAuth();
  return (
    <header className="h-12 md:h-14 border-b border-white/10 flex items-center justify-between px-3 md:px-6 bg-background-dark/80 backdrop-blur-md sticky top-0 z-30">
      <div className="flex items-center gap-2 flex-1 min-w-0">
        <button
          onClick={onMenuClick}
          className="md:hidden p-1.5 -ml-1 rounded-lg hover:bg-white/5 shrink-0"
          aria-label="Open menu"
        >
          <span className="material-symbols-outlined text-lg">menu</span>
        </button>
        <div className="relative w-full max-w-xl hidden md:block">
          <div className="relative w-full group">
            <span className="material-symbols-outlined absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-500 text-base group-focus-within:text-primary transition-colors">
              search
            </span>
            <input 
              className="w-full bg-white/5 border-none rounded-full pl-8 pr-3 py-1.5 focus:ring-1 focus:ring-primary text-sm placeholder:text-slate-600" 
              placeholder="Search albums, artists, or friends..." 
              type="text"
            />
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <button className="size-8 rounded-full hover:bg-white/10 flex items-center justify-center relative transition-colors text-slate-400 hover:text-white">
          <span className="material-symbols-outlined text-lg">notifications</span>
          <span className="absolute top-1.5 right-1.5 size-1.5 bg-primary rounded-full border-2 border-background-dark"></span>
        </button>
        <div className="relative group">
          <button 
            onClick={() => onNavigate('profile')}
            className="size-8 rounded-full bg-white/10 bg-cover bg-center border border-transparent hover:border-primary transition-all overflow-hidden"
            style={{ backgroundImage: `url(${getAvatarUrl(user?.avatar_url, user?.username || '')})` }}
          />
          <div className="absolute right-0 top-full mt-1 py-1 bg-card-dark rounded-lg border border-white/10 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50 min-w-[100px]">
            <button onClick={onLogout} className="w-full px-3 py-1.5 text-left text-xs hover:bg-white/5 rounded">
              Sign out
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
