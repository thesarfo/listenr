import React from 'react';

interface LandingProps {
  onSignIn: () => void;
}

const Landing: React.FC<LandingProps> = ({ onSignIn }) => {
  return (
    <div className="min-h-screen flex flex-col overflow-x-hidden bg-background-dark">
      <header className="flex items-center justify-between border-b border-white/10 px-4 md:px-8 lg:px-20 py-4 sticky top-0 bg-background-dark/90 backdrop-blur-md z-50">
        <div className="flex items-center gap-3">
          <div className="size-8 md:size-9 bg-primary rounded-lg flex items-center justify-center text-background-dark">
            <span className="material-symbols-outlined font-bold text-lg">album</span>
          </div>
          <h2 className="text-lg md:text-xl font-black tracking-tighter uppercase">Listenr</h2>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={onSignIn}
            className="flex items-center justify-center rounded px-3 py-1.5 border border-white/20 text-xs font-bold hover:bg-white/5 transition-colors text-slate-300"
          >
            Sign in
          </button>
          <button
            onClick={onSignIn}
            className="flex items-center justify-center rounded px-3 py-1.5 bg-primary text-background-dark text-xs font-bold hover:opacity-90 transition-opacity"
          >
            Get started
          </button>
        </div>
      </header>

      <main className="flex-1 flex flex-col">
        {/* Hero */}
        <section className="flex flex-col items-center justify-center pt-16 md:pt-24 pb-20 px-4 md:px-6 text-center">
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-black tracking-tight leading-[1.1] text-white max-w-4xl">
            Your personal music<span className="text-primary"> diary</span>
          </h1>
          <p className="mt-6 text-base md:text-xl text-slate-400 font-medium max-w-2xl mx-auto leading-relaxed">
            Log albums, write reviews, and build collections. Share your taste with friends and discover what others are listening to.
          </p>
          <div className="mt-10 flex flex-col sm:flex-row gap-3 justify-center">
            <button
              onClick={onSignIn}
              className="flex items-center justify-center gap-1.5 bg-primary text-background-dark px-5 py-2.5 rounded text-sm font-bold hover:opacity-90 transition-opacity"
            >
              <span>Get started free</span>
              <span className="material-symbols-outlined text-base font-bold">arrow_forward</span>
            </button>
            <button
              onClick={onSignIn}
              className="flex items-center justify-center px-5 py-2.5 rounded border border-white/20 text-sm font-bold hover:bg-white/5 transition-colors"
            >
              Sign in
            </button>
          </div>
        </section>

        {/* Features */}
        <section className="py-16 md:py-24 px-4 md:px-8 lg:px-20 border-t border-white/5">
          <h2 className="text-2xl md:text-3xl font-black text-center mb-12 md:mb-16">What you can do</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8 max-w-5xl mx-auto">
            <div className="flex flex-col items-center text-center p-6 rounded-2xl bg-white/5 border border-white/5 hover:border-primary/30 transition-colors">
              <div className="size-14 rounded-2xl bg-primary/20 flex items-center justify-center mb-4">
                <span className="material-symbols-outlined text-3xl text-primary">menu_book</span>
              </div>
              <h3 className="font-bold text-lg mb-2">Log & review</h3>
              <p className="text-slate-400 text-sm">Track every album you listen to. Rate it, add notes, and build your listening history.</p>
            </div>
            <div className="flex flex-col items-center text-center p-6 rounded-2xl bg-white/5 border border-white/5 hover:border-primary/30 transition-colors">
              <div className="size-14 rounded-2xl bg-primary/20 flex items-center justify-center mb-4">
                <span className="material-symbols-outlined text-3xl text-primary">library_music</span>
              </div>
              <h3 className="font-bold text-lg mb-2">Curate lists</h3>
              <p className="text-slate-400 text-sm">Create collections, share them with friends, and collaborate on lists together.</p>
            </div>
            <div className="flex flex-col items-center text-center p-6 rounded-2xl bg-white/5 border border-white/5 hover:border-primary/30 transition-colors md:col-span-2 lg:col-span-1">
              <div className="size-14 rounded-2xl bg-primary/20 flex items-center justify-center mb-4">
                <span className="material-symbols-outlined text-3xl text-primary">group</span>
              </div>
              <h3 className="font-bold text-lg mb-2">Share & discover</h3>
              <p className="text-slate-400 text-sm">Follow friends, see what they’re listening to, and share your profile with the world.</p>
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="py-16 md:py-24 px-4 text-center border-t border-white/5">
          <p className="text-slate-500 text-sm md:text-base font-medium mb-6">Build your legacy, one log at a time.</p>
          <button
            onClick={onSignIn}
            className="inline-flex items-center justify-center gap-1.5 bg-primary text-background-dark px-5 py-2.5 rounded text-sm font-bold hover:opacity-90 transition-opacity"
          >
            <span>Start your diary</span>
            <span className="material-symbols-outlined text-base font-bold">arrow_forward</span>
          </button>
        </section>
      </main>
    </div>
  );
};

export default Landing;
