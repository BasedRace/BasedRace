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
    /* FLOATING CONTAINER: 
       - fixed bottom-6: Melayang 24px dari bawah
       - left-4 right-4: Memberi jarak dari sisi kiri & kanan
    */
    <div className="fixed bottom-6 left-4 right-4 z-[9999] flex justify-center">
      <nav 
        className="grid grid-cols-5 gap-px bg-[#233e63] p-1 shadow-[8px_8px_0_0_rgba(0,0,0,0.4)] border-4 border-[#233e63] w-full max-w-md"
        style={{ imageRendering: 'pixelated' }}
      >
        {navItems.map(({ view, icon, label }) => {
          const isActive = activeView === view;
          
          // Style tombol saat aktif vs tidak aktif
          const activeClasses = isActive 
            ? 'bg-[#99b1c5] text-white translate-y-0.5' 
            : 'bg-[#e7f2eb] text-[#0f10f4] hover:bg-white';
          
          return (
            <button
              key={view}
              onClick={() => onNavigate(view)}
              className={`flex flex-col items-center justify-center py-2 px-1 transition-all duration-150 focus:outline-none ${activeClasses} h-[60px] pixel-font overflow-hidden`}
              style={{
                // Efek border pixel manual
                boxShadow: isActive ? 'inset 0 0 0 2px #233e63' : 'none'
              }}
            >
              <span className="text-xl leading-none">{icon}</span>
              <span className="text-[8px] uppercase font-black tracking-tighter leading-tight mt-1">
                {label}
              </span>
            </button>
          );
        })}
      </nav>
    </div>
  );
};
