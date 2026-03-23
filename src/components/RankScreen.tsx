'use client';
import { useEffect, useState } from 'react';

interface LeaderboardEntry {
  fid: number;
  username: string;
  image_url: string;
  pfp_url?: string;
  is_minted: boolean;
  exp: number;
  wins: number;
}

export const RankScreen = () => {
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  useEffect(() => {
    setLoading(true);
    fetch(`/api/racer/leaderboard?page=${currentPage}&limit=20`)
      .then(res => res.json())
      .then(data => {
        if (data.leaderboard) {
          setLeaderboard(data.leaderboard);
        }
        setHasMore(data.hasMore ?? false);
        setLoading(false);
      })
      .catch(err => {
        console.error("Failed to fetch leaderboard:", err);
        setLoading(false);
      });
  }, [currentPage]);

  if (loading && leaderboard.length === 0) {
    return (
      <div className="w-full h-full flex flex-col items-center justify-center p-4">
        <div className="pixel-font text-xl text-white mb-4 animate-pulse">LOADING RANKINGS...</div>
      </div>
    );
  }

  return (
    <div className="w-full h-full flex flex-col items-center px-4 pt-[140px] pb-[100px] overflow-y-auto space-y-4">
      <h2 className="pixel-font text-2xl md:text-3xl text-yellow-400 text-center border-4 border-[#233e63] bg-[#233e63] px-2" style={{ marginBottom: '10px' }}>
        LEADERBOARD
      </h2>
      
      <div className="w-full max-w-2xl flex flex-col gap-3">
        {leaderboard.map((racer, index) => {
          const globalRank = ((currentPage - 1) * 20) + index;
          // Standard retro button look
          let bgClass = "bg-[#e7f2eb] border-[#233e63] text-black shadow-lg shadow-[#8a6d00]";
          
          // Special styles for Top 3 (using explicit hex for Tailwind JIT safety)
          if (globalRank === 0) bgClass = "bg-[#fde047] border-[#ca8a04] text-black shadow-[4px_4px_0_0_#b45309]";
          else if (globalRank === 1) bgClass = "bg-[#99b1c5] border-[#4b5563] text-black shadow-[4px_4px_0_0_#4b5563]";
          else if (globalRank === 2) bgClass = "bg-[#fed7aa] border-[#c2410c] text-black shadow-[4px_4px_0_0_#c2410c]";
          
          return (
            <div key={racer.fid} className={`w-full pixel-border p-3 flex flex-row items-center justify-between border-4 ${bgClass}`}>
              
              {/* Left side: Avatar & Info */}
              <div className="flex flex-row items-center gap-3 md:gap-4">
                {/* Profile Image */}
                <div 
                  className="bg-gray-300 border-2 border-black flex-shrink-0 relative overflow-hidden flex items-center justify-center"
                  style={{ width: '45px', height: '45px' }}
                >
                  {(racer.pfp_url || racer.image_url) ? (
                    <img 
                      src={racer.pfp_url || racer.image_url} 
                      alt={racer.username || `Racer ${racer.fid}`} 
                      className="object-cover" 
                      crossOrigin="anonymous" 
                      style={{ width: '100%', height: '100%' }}
                    />
                  ) : (
                    <span className="pixel-font text-xs text-gray-500">?</span>
                  )}
                </div>
                
                {/* Name & Title */}
                <div className="flex flex-col max-w-[200px] sm:max-w-[150px] md:max-w-[250px]">
                  <span className="pixel-font text-[10px] sm:text-xs md:text-sm text-black whitespace-normal break-words leading-tight">
                    {racer.username || `Player #${racer.fid}`}
                  </span>
                  <span className={`pixel-font text-[10px] mt-2 ${racer.is_minted ? 'text-purple-600' : 'text-current opacity-70'}`}>
                    {racer.is_minted ? 'OG Racer' : 'Racer'}
                  </span>
                </div>
              </div>

              {/* Right side: EXP, Wins, Rank */}
              <div className="flex flex-row items-center gap-3 md:gap-6">
                {/* Stats */}
                <div className="flex flex-col w-[80px] md:w-[100px]" style={{ marginRight: '30px' }}>
                  <div className="flex justify-between w-full">
                    <span className="pixel-font text-[10px] md:text-xs">Wins:</span>
                    <span className="pixel-font text-[10px] md:text-xs">{racer.wins || 0}</span>
                  </div>
                  <div className="flex justify-between w-full mt-2">
                    <span className="pixel-font text-[10px] md:text-sm">EXP:</span>
                    <span className="pixel-font text-[10px] md:text-sm">{racer.exp || 0}</span>
                  </div>
                </div>
                
                {/* Rank */}
                <div className={`pixel-font text-xl md:text-3xl ml-1 md:ml-2 w-10 md:w-16 text-right ${globalRank === 0 ? 'text-yellow-800' : ''}`}>
                  #{globalRank + 1}
                </div>
              </div>

            </div>
          );
        })}
        {leaderboard.length === 0 && !loading && (
          <div className="w-full p-8 text-center pixel-font text-white bg-black/50 border-2 border-white mt-8">
            NO RANKING DATA YET
          </div>
        )}

        {/* Pagination Controls */}
        <div className="flex flex-row items-center justify-between w-full h-[60px] mt-4 shadow-lg">
          <button 
            onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
            disabled={currentPage === 1 || loading}
            className="w-10 h-10 bg-yellow-500 text-[#0f10f4] flex items-center justify-center border-2 border-black active:translate-y-1 hover:bg-yellow-400 pixel-font transition-all disabled:opacity-50 disabled:active:translate-y-0"
            style={{ width: '44px', height: '44px' }}
          >
            {"<"}
          </button>
          
          <div className="pixel-font text-black text-xs text-center leading-tight">
            <br/>
            <span className="text-lg">{currentPage}</span>
          </div>
          
          <button 
            onClick={() => setCurrentPage(prev => prev + 1)}
            disabled={!hasMore || loading}
            className="w-10 h-10 bg-yellow-500 text-[#0f10f4] flex items-center justify-center border-2 border-black active:translate-y-1 hover:bg-yellow-400 pixel-font transition-all disabled:opacity-50 disabled:active:translate-y-0"
            style={{ width: '44px', height: '44px' }}
          >
            {">"}
          </button>
        </div>

      </div>
    </div>
  );
};
