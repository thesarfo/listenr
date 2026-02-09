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
  const navItems = [
    { id: 'home' as View, label: 'Home', icon: 'home' },
    { id: 'diary' as View, label: 'Diary', icon: 'menu_book' },
    { id: 'lists' as View, label: 'Lists', icon: 'list_alt' },
    { id: 'profile' as View, label: 'Profile', icon: 'person' },
  ];

  return (
    <aside
      className={`
        w-56 md:w-52 border-r border-white/10 flex flex-col bg-background-dark shrink-0
        fixed md:static inset-y-0 left-0 z-50 transform transition-transform duration-200 ease-out
        ${isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
      `}
    >
      <div className="flex items-center justify-between p-3 md:hidden border-b border-white/10">
        <span className="text-sm font-bold">Menu</span>
        <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-white/5">
          <span className="material-symbols-outlined text-lg">close</span>
        </button>
      </div>
      <div className="p-4 flex items-center gap-2 cursor-pointer md:pt-5 pt-2" onClick={() => onNavigate('home')}>
        <div className="size-6 md:size-7 bg-primary rounded-md flex items-center justify-center text-background-dark shadow-lg shadow-primary/20">
          <span className="material-symbols-outlined text-sm font-bold">album</span>
        </div>
        <h1 className="text-base md:text-lg font-bold tracking-tight uppercase">Listenr</h1>
      </div>

      <nav className="flex-1 px-3 space-y-1 mt-3">
        {navItems.map((item) => (
          <button
            key={item.id}
            onClick={() => onNavigate(item.id)}
            className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-all ${
              currentView === item.id || (item.id === 'lists' && currentView === 'list-detail')
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

      <div className="p-3">
        <button 
          onClick={onLog}
          className="w-full bg-primary hover:bg-primary/90 text-background-dark font-bold py-2.5 md:py-3 rounded-lg text-sm transition-all flex items-center justify-center gap-1.5 shadow-lg shadow-primary/10 active:scale-95"
        >
          <span className="material-symbols-outlined text-base">add_circle</span>
          Log Album
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
