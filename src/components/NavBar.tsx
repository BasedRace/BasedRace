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
      className="grid grid-cols-5 gap-px bg-[#233e63] p-px pixel-font" 
      style={{ 
        borderTop: '2px solid #233e63', 
        // 1. Tambahkan background biru yang sama agar area bawah tidak terlihat terpisah
        backgroundColor: '#233e63',
        // 2. Gunakan padding-bottom untuk memberi ruang bagi safe area
        paddingBottom: 'env(safe-area-inset-bottom)',
        // 3. Gunakan minHeight, bukan height statis
        minHeight: '55px' 
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
            // 4. Pastikan tombol memiliki tinggi minimal 55px
            className={`flex flex-col items-center justify-center transition-all duration-150 focus:outline-none ${activeClasses} min-h-[55px] pixel-font overflow-hidden`}
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
