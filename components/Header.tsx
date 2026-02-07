
import React from 'react';
import { View } from '../types';

interface HeaderProps {
  onNavigate: (view: View) => void;
}

const Header: React.FC<HeaderProps> = ({ onNavigate }) => {
  return (
    <header className="h-16 border-b border-white/10 flex items-center justify-between px-8 bg-background-dark/80 backdrop-blur-md sticky top-0 z-50">
      <div className="flex items-center flex-1 max-w-xl">
        <div className="relative w-full group">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 text-[20px] group-focus-within:text-primary transition-colors">
            search
          </span>
          <input 
            className="w-full bg-white/5 border-none rounded-full pl-10 pr-4 py-2 focus:ring-1 focus:ring-primary text-sm placeholder:text-slate-600" 
            placeholder="Search albums, artists, or friends..." 
            type="text"
          />
        </div>
      </div>

      <div className="flex items-center gap-4">
        <button className="size-10 rounded-full hover:bg-white/10 flex items-center justify-center relative transition-colors text-slate-400 hover:text-white">
          <span className="material-symbols-outlined">notifications</span>
          <span className="absolute top-2.5 right-2.5 size-2 bg-primary rounded-full border-2 border-background-dark"></span>
        </button>
        <button 
          onClick={() => onNavigate('profile')}
          className="size-9 rounded-full bg-white/10 bg-cover bg-center border-2 border-transparent hover:border-primary transition-all overflow-hidden"
          style={{ backgroundImage: "url('https://lh3.googleusercontent.com/aida-public/AB6AXuBKlD60L06GtWbUd1ljOXhCTasqCPsIMeJlGUOTrCH__zaqRY6snCru5-RJWF0q_tkCAtToIQ7ECfvTyo3xIky-KKO89a3AvOlZYQTXHkVjO-s8zhSEJ0zSkYbpC_mbA9jCK7ISh-rzYCc377nU92OHnzTrmL22Pmw6jppFRLIqKvQS1_U4oc-HWpa-fkCBEVdu3_GYyMBfH2eU6XRbgcYeQDyXW_18NcosLn9gxFFYxzIPmlwUqmCgOEKVdVinTq9mVQY-9qjYz0M')" }}
        />
      </div>
    </header>
  );
};

export default Header;
