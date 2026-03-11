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
        paddingBottom: 'env(safe-area-inset-bottom)',
        height: '55px' // Tinggi total navbar dikunci di 55px
      }}
    >
      {navItems.map(({ view, icon, label }) => {
        const isActive = activeView === view;
        const activeClasses = isActive 
          ? 'bg-[#99b1c5] text-white shadow-[inset_0_0_8px_rgba(0,0,0,0.2)]' 
          : 'bg-[#e7f2eb] text-[#0f10f4]';
        
        return (
          <button
            key={view}
            onClick={() => onNavigate(view)}
            // h-full agar tombol mengisi ruang 55px dari nav
            className={`flex flex-col items-center justify-center transition-all duration-150 focus:outline-none ${activeClasses} h-full pixel-font overflow-hidden`}
          >
            {/* Ikon dikecilkan agar muat di 55px */}
            <span className="text-xl leading-none">{icon}</span>
            
            {/* Teks dibuat sangat kecil (8px - 10px) */}
            <span className="text-[8px] sm:text-[10px] uppercase font-black tracking-tighter leading-tight mt-0.5">
              {label}
            </span>
          </button>
        );
      })}
    </nav>
  );
};
