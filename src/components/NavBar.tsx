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
        borderTop: '8px solid #233e63', // Border dipertebal agar terlihat kokoh
        paddingBottom: 'env(safe-area-inset-bottom)',
        // Kita kunci tinggi Nav di sini agar konsisten
        height: '450px' 
      }}
    >
      {navItems.map(({ view, icon, label }) => {
        const isActive = activeView === view;
        const activeClasses = isActive 
          ? 'bg-[#99b1c5] text-white' // Warna berubah total saat aktif
          : 'bg-[#e7f2eb] text-[#0f10f4]';
        
        return (
          <button
            key={view}
            onClick={() => onNavigate(view)}
            // Kita gunakan h-full agar tombol mengikuti tinggi nav (450px)
            className={`flex flex-col items-center justify-center gap-6 transition-all duration-150 focus:outline-none ${activeClasses} h-full pixel-font overflow-hidden border-x border-[#233e63]`}
          >
            {/* Ikon dibuat RAKSASA agar seimbang dengan 450px */}
            <span className="text-[120px] leading-none drop-shadow-md">{icon}</span>
            
            {/* Label dibuat jauh lebih besar agar terbaca */}
            <span className="text-[24px] uppercase font-black tracking-tighter leading-tight w-full break-words px-1">
              {label}
            </span>
          </button>
        );
      })}
    </nav>
  );
};
