
import React, { useState, useEffect } from 'react';
import { View } from './types';
import Onboarding from './pages/Onboarding';
import Home from './pages/Home';
import Explore from './pages/Explore';
import AlbumDetail from './pages/AlbumDetail';
import Diary from './pages/Diary';
import Profile from './pages/Profile';
import Lists from './pages/Lists';
import WriteReview from './pages/WriteReview';
import Sidebar from './components/Sidebar';
import Header from './components/Header';

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<View>('onboarding');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Simple Router
  const renderView = () => {
    switch (currentView) {
      case 'onboarding':
        return <Onboarding onComplete={() => setCurrentView('home')} />;
      case 'home':
        return <Home onNavigate={setCurrentView} />;
      case 'explore':
        return <Explore onNavigate={setCurrentView} />;
      case 'diary':
        return <Diary onNavigate={setCurrentView} />;
      case 'profile':
        return <Profile onNavigate={setCurrentView} />;
      case 'lists':
        return <Lists onNavigate={setCurrentView} />;
      case 'write-review':
        return <WriteReview onCancel={() => setCurrentView('home')} onPost={() => setCurrentView('diary')} />;
      case 'album-detail':
        return <AlbumDetail onBack={() => setCurrentView('home')} onReview={() => setCurrentView('write-review')} />;
      default:
        return <Home onNavigate={setCurrentView} />;
    }
  };

  const showNavigation = currentView !== 'onboarding' && currentView !== 'write-review';

  return (
    <div className={`flex h-screen overflow-hidden bg-background-dark text-white font-display`}>
      {showNavigation && (
        <Sidebar 
          currentView={currentView} 
          onNavigate={setCurrentView} 
          onLog={() => setCurrentView('write-review')}
        />
      )}
      
      <div className="flex-1 flex flex-col overflow-hidden">
        {showNavigation && (
          <Header onNavigate={setCurrentView} />
        )}
        
        <main className={`flex-1 overflow-y-auto custom-scrollbar ${!showNavigation ? '' : 'bg-charcoal/50'}`}>
          {renderView()}
        </main>
      </div>

      {/* Decorative background elements */}
      <div className="fixed top-0 left-0 w-full h-full pointer-events-none -z-10 overflow-hidden">
        <div className="absolute -top-[10%] -left-[10%] w-[40%] h-[40%] bg-primary/5 rounded-full blur-[120px]"></div>
        <div className="absolute top-[40%] -right-[10%] w-[30%] h-[30%] bg-blue-500/5 rounded-full blur-[100px]"></div>
      </div>
    </div>
  );
};

export default App;
