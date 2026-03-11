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
     * CONTAINER LUAR: 
     * - fixed bottom-6: Melayang di atas 'safe area' biru.
     * - px-4: Memberi jarak dari pinggir layar kiri-kanan.
     */
    <div className="fixed bottom-6 left-0 right-0 z-[9999] px-4 flex justify-center pointer-events-none">
      <nav 
        className="grid grid-cols-5 gap-px bg-[#233e63] p-1 border-2 border-[#233e63] w-full max-w-md shadow-[0_8px_0_0_rgba(0,0,0,0.3)] pointer-events-auto"
        style={{ imageRendering: 'pixelated' }}
      >
        {navItems.map(({ view, icon, label }) => {
          const isActive = activeView === view;
          
          // Style warna tombol
          const activeClasses = isActive 
            ? 'bg-[#99b1c5] text-white' 
            : 'bg-[#e7f2eb] text-[#0f10f4] hover:bg-white';
          
          return (
            <button
              key={view}
              onClick={() => onNavigate(view)}
              className={`flex flex-col items-center justify-center transition-all duration-150 focus:outline-none ${activeClasses} h-[55px] pixel-font overflow-hidden relative group`}
            >
              {/* Efek Click Pixelated: Sedikit turun saat ditekan */}
              <div className="active:translate-y-0.5 flex flex-col items-center">
                <span className="text-xl leading-none">{icon}</span>
                <span className="text-[8px] uppercase font-black tracking-tighter leading-tight mt-0.5">
                  {label}
                </span>
              </div>
              
              {/* Indikator Aktif Pixelated di bawah teks */}
              {isActive && (
                <div className="absolute bottom-0 left-0 right-0 h-1 bg-[#233e63]" />
              )}
            </button>
          );
        })}
      </nav>
    </div>
  );
};
