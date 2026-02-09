import React from 'react';
import type { NavigateFn } from '../types';

interface NotFoundProps {
  onNavigate: NavigateFn;
}

const NotFound: React.FC<NotFoundProps> = ({ onNavigate }) => {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] px-4 text-center">
      <span className="material-symbols-outlined text-6xl md:text-7xl text-slate-500 mb-4">search_off</span>
      <h1 className="text-2xl md:text-3xl font-bold text-white">404</h1>
      <p className="mt-2 text-slate-400 max-w-md">This page doesn&apos;t exist or has been moved.</p>
      <button
        onClick={() => onNavigate('home')}
        className="mt-6 px-5 py-2.5 bg-primary text-background-dark font-bold rounded-lg hover:opacity-90 transition-opacity"
      >
        Back to Home
      </button>
    </div>
  );
};

export default NotFound;
