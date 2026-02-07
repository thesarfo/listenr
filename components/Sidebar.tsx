
import React from 'react';
import { View } from '../types';

interface SidebarProps {
  currentView: View;
  onNavigate: (view: View) => void;
  onLog: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ currentView, onNavigate, onLog }) => {
  const navItems = [
    { id: 'home' as View, label: 'Home', icon: 'home' },
    { id: 'explore' as View, label: 'Explore', icon: 'explore' },
    { id: 'diary' as View, label: 'Diary', icon: 'menu_book' },
    { id: 'lists' as View, label: 'Lists', icon: 'list_alt' },
    { id: 'profile' as View, label: 'Profile', icon: 'person' },
  ];

  return (
    <aside className="w-64 border-r border-white/10 flex flex-col bg-background-dark shrink-0 hidden md:flex">
      <div className="p-6 flex items-center gap-3 cursor-pointer" onClick={() => onNavigate('home')}>
        <div className="size-8 bg-primary rounded-lg flex items-center justify-center text-background-dark shadow-lg shadow-primary/20">
          <span className="material-symbols-outlined font-bold">album</span>
        </div>
        <h1 className="text-xl font-black tracking-tight uppercase">MusicBoxd</h1>
      </div>

      <nav className="flex-1 px-4 space-y-2 mt-4">
        {navItems.map((item) => (
          <button
            key={item.id}
            onClick={() => onNavigate(item.id)}
            className={`w-full flex items-center gap-4 px-4 py-3 rounded-xl transition-all ${
              currentView === item.id 
                ? 'bg-primary/10 text-primary font-bold' 
                : 'text-slate-400 hover:bg-white/5 hover:text-white'
            }`}
          >
            <span className={`material-symbols-outlined ${currentView === item.id ? 'fill-1' : ''}`}>
              {item.icon}
            </span>
            <span>{item.label}</span>
          </button>
        ))}
      </nav>

      <div className="p-4">
        <button 
          onClick={onLog}
          className="w-full bg-primary hover:bg-primary/90 text-background-dark font-black py-4 rounded-xl transition-all flex items-center justify-center gap-2 shadow-lg shadow-primary/10 active:scale-95"
        >
          <span className="material-symbols-outlined text-[20px]">add_circle</span>
          Log Album
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
