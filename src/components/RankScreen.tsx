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
    <div className="w-full h-full flex flex-col items-center p-4 overflow-y-auto pb-24 space-y-4">
      <h2 className="pixel-font text-2xl md:text-3xl text-yellow-400 mb-2 drop-shadow-[0_4px_4px_rgba(0,0,0,0.8)] text-center">
        GLOBAL LEADERBOARD
      </h2>
      
      <div className="w-full max-w-2xl flex flex-col gap-3">
        {leaderboard.map((racer, index) => {
          const globalRank = ((currentPage - 1) * 20) + index;
          // Standard retro button look
          let bgClass = "bg-[#e7f2eb] border-[#233e63] text-[#0f10f4] shadow-lg shadow-[#8a6d00]";
          
          // Special styles for Top 3
          if (globalRank === 0) bgClass = "bg-yellow-300 border-yellow-600 text-black shadow-[4px_4px_0_0_#b45309]";
          else if (globalRank === 1) bgClass = "bg-gray-200 border-gray-500 text-black shadow-[4px_4px_0_0_#4b5563]";
          else if (globalRank === 2) bgClass = "bg-orange-200 border-orange-700 text-black shadow-[4px_4px_0_0_#c2410c]";
          
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
                <div className="flex flex-col">
                  <span className="pixel-font text-xs md:text-sm truncate w-[80px] sm:w-[120px] md:w-[200px]">
                    {racer.username || `Player #${racer.fid}`}
                  </span>
                  <span className={`pixel-font text-[10px] mt-1 ${racer.is_minted ? 'text-purple-600' : 'text-current opacity-70'}`}>
                    {racer.is_minted ? 'OG Racer' : 'Racer'}
                  </span>
                </div>
              </div>

              {/* Right side: EXP, Wins, Rank */}
              <div className="flex flex-row items-center gap-3 md:gap-6">
                {/* Stats */}
                <div className="flex flex-col items-end">
                  <span className="pixel-font text-[10px] md:text-xs">W: {racer.wins || 0}</span>
                  <span className="pixel-font text-[10px] md:text-sm font-bold mt-1">XP: {racer.exp || 0}</span>
                </div>
                
                {/* Rank */}
                <div className={`pixel-font text-xl md:text-3xl font-bold ml-1 md:ml-2 w-10 md:w-16 text-right ${globalRank === 0 ? 'text-yellow-800' : ''}`}>
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
        <div className="flex flex-row items-center justify-between w-full h-[60px] bg-[#e7f2eb] px-4 border-4 border-[#233e63] mt-4 shadow-lg shadow-[#8a6d00]">
          <button 
            onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
            disabled={currentPage === 1 || loading}
            className="w-10 h-10 bg-yellow-500 text-black flex items-center justify-center border-2 border-black active:translate-y-1 hover:bg-yellow-400 pixel-font transition-all disabled:opacity-50 disabled:active:translate-y-0"
          >
            {"<"}
          </button>
          
          <div className="pixel-font text-[#0f10f4] text-xs text-center leading-tight">
            PAGE<br/>
            <span className="text-lg font-bold">{currentPage}</span>
          </div>
          
          <button 
            onClick={() => setCurrentPage(prev => prev + 1)}
            disabled={!hasMore || loading}
            className="w-10 h-10 bg-yellow-500 text-black flex items-center justify-center border-2 border-black active:translate-y-1 hover:bg-yellow-400 pixel-font transition-all disabled:opacity-50 disabled:active:translate-y-0"
          >
            {">"}
          </button>
        </div>

      </div>
    </div>
  );
};
