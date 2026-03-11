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
   <nav 
  className="grid grid-cols-5 gap-px bg-[#233e63] w-full" 
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
            // Kita gunakan h-[55px] di sini agar tombol memiliki ukuran tetap
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
