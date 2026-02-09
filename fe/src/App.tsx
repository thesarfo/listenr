import React, { useState, useEffect } from 'react';
import { useAuth } from './context/AuthContext';
import Onboarding from './pages/Onboarding';
import Login from './pages/Login';
import Landing from './pages/Landing';
import Home from './pages/Home';
import AlbumDetail from './pages/AlbumDetail';
import Diary from './pages/Diary';
import Profile from './pages/Profile';
import Lists from './pages/Lists';
import ListDetail from './pages/ListDetail';
import LogAlbum from './pages/LogAlbum';
import WriteReview from './pages/WriteReview';
import Admin from './pages/Admin';
import NotFound from './pages/NotFound';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import LoadingSpinner from './components/LoadingSpinner';
import type { View } from './types';

function parsePath(): { view: View; albumId: string | null; username: string | null; listId: string | null } {
  const p = window.location.pathname;
  const pNorm = p.replace(/\/$/, '') || '/';
  const uMatch = p.match(/^\/u\/([^/]+)\/?$/);
  const lMatch = p.match(/^\/l\/([^/]+)\/?$/);
  const albumMatch = p.match(/^\/album\/([^/]+)\/?$/);
  if (uMatch) return { view: 'profile', albumId: null, username: uMatch[1], listId: null };
  if (lMatch) return { view: 'list-detail', albumId: null, username: null, listId: lMatch[1] };
  if (albumMatch) return { view: 'album-detail', albumId: albumMatch[1], username: null, listId: null };
  if (pNorm === '/lists') return { view: 'lists', albumId: null, username: null, listId: null };
  if (pNorm === '/diary') return { view: 'diary', albumId: null, username: null, listId: null };
  if (pNorm === '/log') return { view: 'log-album', albumId: null, username: null, listId: null };
  if (pNorm === '/login') return { view: 'login', albumId: null, username: null, listId: null };
  if (pNorm === '/admin') return { view: 'admin', albumId: null, username: null, listId: null };
  if (pNorm === '/' || pNorm === '') return { view: 'home', albumId: null, username: null, listId: null };
  return { view: 'not-found', albumId: null, username: null, listId: null };
}

function pathFor(view: View, albumId?: string, username?: string, listId?: string): string {
  if (view === 'profile' && username) return `/u/${username}`;
  if (view === 'list-detail' && listId) return `/l/${listId}`;
  if (view === 'album-detail' && albumId) return `/album/${albumId}`;
  if (view === 'lists') return '/lists';
  if (view === 'diary') return '/diary';
  if (view === 'log-album') return '/log';
  if (view === 'login') return '/login';
  if (view === 'admin') return '/admin';
  if (view === 'landing') return '/';
  return '/';
}

const App: React.FC = () => {
  const { user, isLoading, logout } = useAuth();
  const initial = parsePath();
  const [currentView, setCurrentView] = useState<View>(initial.view === 'home' && !initial.albumId && !initial.username && !initial.listId ? 'landing' : initial.view);
  const [previousView, setPreviousView] = useState<View>('home');
  const [selectedAlbumId, setSelectedAlbumId] = useState<string | null>(initial.albumId);
  const [selectedProfileUsername, setSelectedProfileUsername] = useState<string | null>(initial.username);
  const [selectedListId, setSelectedListId] = useState<string | null>(initial.listId);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  useEffect(() => {
    const onPopState = () => {
      const { view, albumId, username, listId } = parsePath();
      setCurrentView(view);
      setSelectedAlbumId(albumId);
      setSelectedProfileUsername(username);
      setSelectedListId(listId);
    };
    window.addEventListener('popstate', onPopState);
    return () => window.removeEventListener('popstate', onPopState);
  }, []);

  const navigate = (view: View, albumId?: string, username?: string, listId?: string) => {
    setPreviousView(currentView);
    if (albumId !== undefined) setSelectedAlbumId(albumId || null);
    if (username !== undefined) setSelectedProfileUsername(username || null);
    if (listId !== undefined) setSelectedListId(listId || null);
    setCurrentView(view);
    const path = pathFor(view, albumId, username, listId);
    if (path !== window.location.pathname) {
      window.history.pushState({}, '', path);
    }
  };

  const renderView = () => {
    switch (currentView) {
      case 'login':
        return <Login onNavigate={(view) => { setCurrentView(view); window.history.pushState({}, '', pathFor(view)); }} />;
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
            onBack={() => navigate('home')}
            onReview={() => navigate('write-review')}
            onNavigate={navigate}
          />
        );
      case 'admin':
        return <Admin onNavigate={navigate} />;
      case 'not-found':
        return <NotFound onNavigate={navigate} />;
      case 'landing':
        return <Home onNavigate={navigate} />;
      default:
        return <Home onNavigate={navigate} />;
    }
  };

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-background-dark">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

    if (!user) {
    // Root path always shows Landing (must be first)
    const path = window.location.pathname;
    const rootPath = path.replace(/\/$/, '') || '/';
    if (rootPath === '/' || path === '/landing' || path === '/landing/') {
      return <Landing onSignIn={() => { setCurrentView('login'); window.history.pushState({}, '', '/login'); }} />;
    }
    // Allow viewing shared profiles or lists without login
    if (currentView === 'profile' && selectedProfileUsername) {
      const guestNavigate = (view: View, albumId?: string, username?: string, listId?: string) => {
        setCurrentView(view);
        if (albumId) setSelectedAlbumId(albumId);
        if (username !== undefined) setSelectedProfileUsername(username);
        else if (view !== 'profile') setSelectedProfileUsername(null);
        if (listId !== undefined) setSelectedListId(listId);
        const path = pathFor(view, albumId, username, listId);
        if (path !== window.location.pathname) window.history.pushState({}, '', path);
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
    if (path === '/login' || path === '/login/' || currentView === 'login') {
      return <Login onNavigate={setCurrentView} />;
    }
    if (currentView === 'list-detail' && selectedListId) {
      const guestNavigate = (view: View, albumId?: string, _username?: string, listId?: string) => {
        setCurrentView(view);
        if (albumId) setSelectedAlbumId(albumId);
        if (listId !== undefined) setSelectedListId(listId);
        const path = pathFor(view, albumId, undefined, listId);
        if (path !== window.location.pathname) window.history.pushState({}, '', path);
      };
      return (
        <div className="flex h-screen flex-col overflow-hidden bg-background-dark text-white font-display">
          <main className="flex-1 overflow-y-auto custom-scrollbar bg-charcoal/50">
            <ListDetail
              listId={selectedListId}
              onBack={() => guestNavigate('home', undefined, undefined, undefined)}
              onNavigate={guestNavigate}
            />
          </main>
          <div className="border-t border-white/10 p-4 flex justify-center">
            <button onClick={() => setCurrentView('login')} className="text-primary hover:underline text-sm font-bold">
              Sign in to edit lists and collaborate
            </button>
          </div>
        </div>
      );
    }
    if (currentView === 'not-found') {
      const guestNavigate = (view: View) => {
        setCurrentView(view);
        const path = view === 'login' ? '/login' : '/';
        window.history.pushState({}, '', path);
      };
      return (
        <div className="flex h-screen flex-col overflow-hidden bg-background-dark text-white font-display">
          <main className="flex-1 overflow-y-auto flex items-center justify-center custom-scrollbar">
            <NotFound onNavigate={guestNavigate} />
          </main>
          <div className="border-t border-white/10 p-4 flex justify-center gap-4">
            <button onClick={() => guestNavigate('home')} className="text-primary hover:underline text-sm font-bold">
              Go home
            </button>
            <button onClick={() => guestNavigate('login')} className="text-primary hover:underline text-sm font-bold">
              Sign in
            </button>
          </div>
        </div>
      );
    }
    return <Login onNavigate={setCurrentView} />;
  }

  const showNavigation = currentView !== 'onboarding' && currentView !== 'write-review' && currentView !== 'log-album' && currentView !== 'login';

  const handleNavigate = (view: View) => {
    const username = view === 'profile' && user ? user.username : undefined;
    if (view === 'profile') setSelectedProfileUsername(username ?? null);
    setCurrentView(view);
    const path = pathFor(view, undefined, username, undefined);
    if (path !== window.location.pathname) {
      window.history.pushState({}, '', path);
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
            isAdmin={user?.is_admin ?? false}
          />
        </>
      )}

      <div className="flex-1 flex flex-col overflow-hidden min-w-0">
        {showNavigation && (
          <Header onNavigate={handleNavigate} navigate={navigate} onLogout={logout} onMenuClick={() => setIsSidebarOpen(true)} />
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
