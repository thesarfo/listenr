import React from 'react';
import { View } from '../types';

interface SidebarProps {
  currentView: View;
  onNavigate: (view: View) => void;
  onLog: () => void;
  isOpen?: boolean;
  onClose?: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ currentView, onNavigate, onLog, isOpen = false, onClose }) => {
  const navItems: { id: View; label: string; icon: string }[] = [
    { id: 'home', label: 'Home', icon: 'home' },
    { id: 'diary', label: 'Diary', icon: 'menu_book' },
    { id: 'lists', label: 'Lists', icon: 'list_alt' },
    { id: 'profile', label: 'Profile', icon: 'person' },
    { id: 'admin', label: 'Admin', icon: 'analytics' },
  ];

  return (
    <aside
      className={`
        w-64 md:w-52 border-r border-white/10 flex flex-col bg-background-dark shrink-0
        fixed md:static inset-y-0 left-0 z-50 transform transition-transform duration-200 ease-out
        ${isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
      `}
    >
      <div className="flex items-center justify-end p-4 md:hidden border-b border-white/10">
        <button onClick={onClose} className="p-2.5 rounded-lg hover:bg-white/5 touch-manipulation">
          <span className="material-symbols-outlined text-2xl md:text-lg">close</span>
        </button>
      </div>
      <div className="p-4 flex items-center gap-3 cursor-pointer md:pt-5 pt-2" onClick={() => onNavigate('home')}>
        <div className="size-8 md:size-7 bg-primary rounded-md flex items-center justify-center text-background-dark shadow-lg shadow-primary/20">
          <span className="material-symbols-outlined text-lg md:text-sm font-bold">album</span>
        </div>
        <h1 className="text-lg md:text-lg font-bold tracking-tight uppercase">Listenr</h1>
      </div>

      <nav className="flex-1 px-3 space-y-1 mt-3">
        {navItems.map((item) => (
          <button
            key={item.id}
            onClick={() => onNavigate(item.id)}
            className={`w-full flex items-center gap-3 px-4 py-3 md:py-2 rounded-xl md:rounded-lg text-base md:text-sm transition-all touch-manipulation ${
              currentView === item.id || (item.id === 'lists' && currentView === 'list-detail') || (item.id === 'admin' && currentView === 'admin')
                ? 'bg-primary/10 text-primary font-bold' 
                : 'text-slate-400 hover:bg-white/5 hover:text-white'
            }`}
          >
            <span className={`material-symbols-outlined text-lg ${currentView === item.id ? 'fill-1' : ''}`}>
              {item.icon}
            </span>
            <span>{item.label}</span>
          </button>
        ))}
      </nav>

      <div className="p-4 md:p-3">
        <button 
          onClick={onLog}
          className="w-full bg-primary text-background-dark font-bold py-2 rounded text-sm transition-opacity flex items-center justify-center gap-2 hover:opacity-90 touch-manipulation"
        >
          <span className="material-symbols-outlined text-xl md:text-base">add_circle</span>
          Log Album
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
