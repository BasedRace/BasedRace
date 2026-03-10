'use client';

// Note: Haptic feedback functionality has been removed as it was causing a build error.
// The sdk.actions.vibrate() function does not exist in the current SDK version.

export type NavView = 'start' | 'profile' | 'mint' | 'garage' | 'leaderboard';

const navItems: { view: NavView, icon: string, label: string }[] = [
  { view: 'start', icon: '🏁', label: 'START' },
  { view: 'profile', icon: '👤', label: 'PROFILE' },
  { view: 'mint', icon: '💎', label: 'MINT' },
  { view: 'garage', icon: '🔧', label: 'GARAGE' },
  { view: 'leaderboard', icon: '🏆', label: 'LEADERBOARD' },
];

export const NavBar = ({ activeView, onNavigate }: { activeView: NavView, onNavigate: (view: NavView) => void }) => {
  return (
    <nav className="fixed bottom-0 left-0 right-0 grid grid-cols-5 gap-px bg-[#233e63] p-px pixel-font z-50" style={{ borderTop: '4px solid #233e63' }}>
      {navItems.map(({ view, icon, label }) => {
        const isActive = activeView === view;
        const activeClasses = isActive 
          ? 'border-2 border-[#99b1c5] shadow-[0_0_15px_rgba(153,177,197,0.6)]' 
          : 'border-2 border-transparent';
        
        return (
          <button
            key={view}
            onClick={() => onNavigate(view)} // Simplified direct call
            className={`flex flex-col items-center justify-center bg-[#e7f2eb] p-2 text-center text-[#0f10f4] transition-all duration-150 focus:outline-none ${activeClasses} h-20`}
          >
            <span className="text-2xl">{icon}</span>
            <span className="text-[10px] mt-1 uppercase">{label}</span>
          </button>
        );
      })}
    </nav>
  );
};
