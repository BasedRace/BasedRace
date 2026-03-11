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
    /**
     * PEMBUNGKUS LUAR (Wrapper):
     * - fixed bottom-6: Melayang 24px dari dasar layar (menghindari area biru).
     * - left-0 right-0: Membentang penuh agar bisa melakukan centering.
     * - pointer-events-none: Agar area transparan di sekitar nav tidak menghalangi klik ke game.
     */
    <div className="fixed bottom-6 left-0 right-0 z-[9999] flex justify-center px-4 pointer-events-none">
      
      {/* KOTAK NAVIGASI (The Floating Bar) */}
      <nav 
        className="grid grid-cols-5 gap-px bg-[#233e63] p-0.5 shadow-[0_6px_0_0_rgba(0,0,0,0.3)] w-full max-w-md pointer-events-auto border-2 border-[#233e63]"
        style={{ 
          height: '55px',
          imageRendering: 'pixelated'
        }}
      >
        {navItems.map(({ view, icon, label }) => {
          const isActive = activeView === view;
          
          // Warna tombol Aktif vs Tidak Aktif
          const activeClasses = isActive 
            ? 'bg-[#99b1c5] text-white shadow-[inset_0_0_8px_rgba(0,0,0,0.2)]' 
            : 'bg-[#e7f2eb] text-[#0f10f4] hover:bg-white';
          
          return (
            <button
              key={view}
              onClick={() => onNavigate(view)}
              className={`flex flex-col items-center justify-center transition-all duration-150 focus:outline-none ${activeClasses} h-full pixel-font overflow-hidden active:translate-y-0.5`}
            >
              {/* Icon Container */}
              <span className="text-xl leading-none">{icon}</span>
              
              {/* Text Label */}
              <span className="text-[8px] sm:text-[10px] uppercase font-black tracking-tighter leading-tight mt-0.5">
                {label}
              </span>
            </button>
          );
        })}
      </nav>
    </div>
  );
};
