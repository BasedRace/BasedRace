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
    <div 
      style={{
        position: 'fixed',
        bottom: '15px', 
        left: '50%',
        transform: 'translateX(-50%)', 
        width: '95%', 
        maxWidth: '500px',
        zIndex: 9999,
        display: 'flex',
        justifyContent: 'center',
        pointerEvents: 'none'
      }}
    >
      <nav 
        className="grid grid-cols-5 gap-px bg-[#233e63] p-0.5 shadow-[0_6px_0_0_rgba(0,0,0,0.3)]"
        style={{ 
          width: '100%',
          height: '65px',
          border: '2px solid #233e63',
          imageRendering: 'pixelated',
          pointerEvents: 'auto'
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
              className={`flex flex-col items-center justify-center transition-all duration-150 focus:outline-none ${activeClasses} h-full pixel-font overflow-hidden active:translate-y-0.5`}
            >
              <span className="text-xl leading-none">{icon}</span>
              <span className="text-[8px] uppercase font-black tracking-tighter leading-tight mt-0.5">
                {label}
              </span>
            </button>
          );
        })}
      </nav>
    </div>
  );
};
