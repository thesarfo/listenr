import React, { useState, useEffect } from 'react';
import { View } from './types';
import { useAuth } from './context/AuthContext';
import Onboarding from './pages/Onboarding';
import Login from './pages/Login';
import Home from './pages/Home';
import AlbumDetail from './pages/AlbumDetail';
import Diary from './pages/Diary';
import Profile from './pages/Profile';
import Lists from './pages/Lists';
import ListDetail from './pages/ListDetail';
import LogAlbum from './pages/LogAlbum';
import WriteReview from './pages/WriteReview';
import Sidebar from './components/Sidebar';
import Header from './components/Header';

const App: React.FC = () => {
  const { user, isLoading, logout } = useAuth();
  const [currentView, setCurrentView] = useState<View>('home');
  const [previousView, setPreviousView] = useState<View>('home');
  const [selectedAlbumId, setSelectedAlbumId] = useState<string | null>(null);
  const [selectedProfileUsername, setSelectedProfileUsername] = useState<string | null>(null);
  const [selectedListId, setSelectedListId] = useState<string | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Handle shareable profile URLs on load (e.g. /u/username)
  useEffect(() => {
    const m = window.location.pathname.match(/^\/u\/([^/]+)\/?$/);
    if (m) {
      setCurrentView('profile');
      setSelectedProfileUsername(m[1]);
    }
  }, []);

  const navigate = (view: View, albumId?: string, username?: string, listId?: string) => {
    setPreviousView(currentView);
    if (albumId) setSelectedAlbumId(albumId);
    if (username !== undefined) setSelectedProfileUsername(username);
    if (listId !== undefined) setSelectedListId(listId);
    setCurrentView(view);
    if (view === 'profile' && username) {
      window.history.pushState({}, '', `/u/${username}`);
    }
  };

  const renderView = () => {
    switch (currentView) {
      case 'login':
        return <Login onNavigate={setCurrentView} />;
      case 'onboarding':
        return <Onboarding onComplete={() => setCurrentView('home')} />;
      case 'home':
        return <Home onNavigate={navigate} />;
      case 'diary':
        return <Diary onNavigate={navigate} />;
      case 'profile':
        return <Profile onNavigate={navigate} viewUsername={selectedProfileUsername} />;
      case 'lists':
        return <Lists onNavigate={navigate} />;
      case 'list-detail':
        return (
          <ListDetail
            listId={selectedListId}
            onBack={() => setCurrentView('lists')}
            onNavigate={navigate}
          />
        );
      case 'log-album':
        return <LogAlbum onNavigate={navigate} />;
      case 'write-review':
        return (
          <WriteReview
            albumId={selectedAlbumId}
            onCancel={() => setCurrentView(previousView)}
            onPost={() => setCurrentView('diary')}
          />
        );
      case 'album-detail':
        return (
          <AlbumDetail
            albumId={selectedAlbumId}
            onBack={() => setCurrentView('home')}
            onReview={() => navigate('write-review')}
            onNavigate={navigate}
          />
        );
      default:
        return <Home onNavigate={navigate} />;
    }
  };

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-background-dark">
        <span className="material-symbols-outlined animate-spin text-2xl text-primary">progress_activity</span>
      </div>
    );
  }

  if (!user) {
    // Allow viewing shared profiles without login
    if (currentView === 'profile' && selectedProfileUsername) {
      const guestNavigate = (view: View, albumId?: string) => {
        setCurrentView(view);
        if (albumId) setSelectedAlbumId(albumId);
        setSelectedProfileUsername(null);
      };
      return (
        <div className="flex h-screen flex-col overflow-hidden bg-background-dark text-white font-display">
          <main className="flex-1 overflow-y-auto custom-scrollbar bg-charcoal/50">
            <Profile onNavigate={guestNavigate} viewUsername={selectedProfileUsername} />
          </main>
          <div className="border-t border-white/10 p-4 flex justify-center">
            <button onClick={() => setCurrentView('login')} className="text-primary hover:underline text-sm font-bold">
              Sign in to view your own profile
            </button>
          </div>
        </div>
      );
    }
    return <Login onNavigate={setCurrentView} />;
  }

  const showNavigation = currentView !== 'onboarding' && currentView !== 'write-review' && currentView !== 'log-album' && currentView !== 'login';

  const handleNavigate = (view: View) => {
    setCurrentView(view);
    if (view === 'profile' && user) {
      setSelectedProfileUsername(user.username);
      window.history.pushState({}, '', `/u/${user.username}`);
    }
    setIsSidebarOpen(false);
  };

  return (
    <div className={`flex h-screen overflow-hidden bg-background-dark text-white font-display`}>
      {showNavigation && (
        <>
          {/* Mobile overlay */}
          {isSidebarOpen && (
            <div
              className="fixed inset-0 bg-black/60 z-40 md:hidden"
              onClick={() => setIsSidebarOpen(false)}
              aria-hidden="true"
            />
          )}
          <Sidebar
            isOpen={isSidebarOpen}
            onClose={() => setIsSidebarOpen(false)}
            currentView={currentView}
            onNavigate={handleNavigate}
            onLog={() => { setCurrentView('log-album'); setIsSidebarOpen(false); }}
          />
        </>
      )}

      <div className="flex-1 flex flex-col overflow-hidden min-w-0">
        {showNavigation && (
          <Header onNavigate={handleNavigate} onLogout={logout} onMenuClick={() => setIsSidebarOpen(true)} />
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
