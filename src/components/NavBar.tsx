'use client';

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
    /* FIXED POSITION: Memaksa menempel ke bawah layar tanpa celah */
    <nav 
      className="fixed bottom-0 left-0 right-0 grid grid-cols-5 gap-px bg-[#233e63] z-[9999]" 
      style={{ 
        borderTop: '2px solid #233e63',
        paddingBottom: 'env(safe-area-inset-bottom)',
        backgroundColor: '#233e63',
      }}
    >
      {navItems.map(({ view, icon, label }) => {
        const isActive = activeView === view;
        const activeClasses = isActive 
          ? 'bg-[#99b1c5] text-white' 
          : 'bg-[#e7f2eb] text-[#0f10f4]';
        
        return (
          <button
            key={view}
            onClick={() => onNavigate(view)}
            className={`flex flex-col items-center justify-center transition-all duration-150 focus:outline-none ${activeClasses} h-[55px] pixel-font overflow-hidden`}
          >
            <span className="text-xl leading-none">{icon}</span>
            <span className="text-[8px] uppercase font-black tracking-tighter leading-tight mt-1">
              {label}
            </span>
          </button>
        );
      })}
    </nav>
  );
};
