'use client';

// Note: Haptic feedback functionality has been removed as it was causing a build error.
// The sdk.actions.vibrate() function does not exist in the current SDK version.

export type NavView = 'start' | 'profile' | 'mint' | 'garage' | 'rank' | 'landing';

const navItems: { view: Exclude<NavView, 'landing'>, icon: string, label: string }[] = [
  { view: 'start', icon: '🏁', label: 'START' },
  { view: 'profile', icon: '👤', label: 'PROFILE' },
  { view: 'mint', icon: '💎', label: 'MINT' },
  { view: 'garage', icon: '🔧', label: 'GARAGE' },
  { view: 'rank', icon: '🏆', label: 'RANK' },
];

export const NavBar = ({ activeView, onNavigate }: { activeView: NavView, onNavigate: (view: any) => void }) => {
  return (
    <nav 
      className="grid grid-cols-5 gap-px bg-[#233e63] p-px pixel-font" 
      style={{ 
        borderTop: '4px solid #233e63', 
        // Perbaikan: mengubah 'px' menjadi nilai numerik '0px' agar valid
        paddingBottom: 'calc(0px + env(safe-area-inset-bottom))'
      }}
    >
      {navItems.map(({ view, icon, label }) => {
        const isActive = activeView === view;
        const activeClasses = isActive 
          ? 'border-2 border-[#99b1c5] shadow-[0_0_15px_rgba(153,177,197,0.6)]' 
          : 'border-2 border-transparent';
        
        const labelSize = view === 'profile' 
          ? 'text-[10px] sm:text-[12px]' 
          : 'text-[11px] sm:text-[14px]';

        return (
          <button
            key={view}
            onClick={() => onNavigate(view)} // Simplified direct call
            className={`flex flex-col items-center justify-around bg-[#e7f2eb] p-0.5 text-center text-[#0f10f4] transition-all duration-150 focus:outline-none ${activeClasses} h-48 pixel-font overflow-hidden`}
          >
            <span className="text-6xl leading-none">{icon}</span>
            <span className={`${labelSize} uppercase font-black tracking-tighter leading-tight w-full break-words px-0.5`}>
              {label}
            </span>
          </button>
        );
      })}
    </nav>
  );
};
