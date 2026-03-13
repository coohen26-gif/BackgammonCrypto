"use client";

import { useState, useEffect } from "react";
import { ethers } from "ethers";
import { Wallet, Trophy, Play, Dice5, ShieldCheck, Activity, History, ChevronRight } from "lucide-react";

export default function BackgammonDashboard() {
  const [dice, setDice] = useState<number[]>([]);
  const [turn, setTurn] = useState("White");
  const [loading, setLoading] = useState(false);
  const [account, setAccount] = useState<string | null>(null);
  const [board, setBoard] = useState<number[]>(new Array(24).fill(0));
  const [bar, setBar] = useState({ W: 0, B: 0 });
  const gameId = "demo-game-1";

  const fetchState = async () => {
    try {
      const res = await fetch(`https://mydavid.io/backgammon/api/game/${gameId}/state`);
      if (res.ok) {
        const data = await res.json();
        setBoard(data.board);
        setTurn(data.turn === "W" ? "White" : "Black");
        setDice(data.dice || []);
        setBar(data.bar || { W: 0, B: 0 });
      }
    } catch (e) {}
  };

  useEffect(() => {
    fetchState();
    const interval = setInterval(fetchState, 5000);
    return () => clearInterval(interval);
  }, []);

  const renderCheckers = (count: number) => {
    const isWhite = count > 0;
    const absCount = Math.abs(count);
    return Array.from({ length: absCount }).map((_, i) => (
      <div 
        key={i} 
        className={`w-7 h-7 rounded-full border-2 -mt-3 first:mt-0 relative transition-transform hover:scale-110 shadow-lg ${
          isWhite 
            ? "bg-gradient-to-br from-[#f8f5f2] to-[#dcd0c0] border-[#c0b0a0] shadow-white/20" 
            : "bg-gradient-to-br from-[#2a2a2a] to-[#0a0a0a] border-[#4a4a4a] shadow-black/60"
        }`}
      >
        {/* Effet nacré/marbré */}
        <div className="absolute inset-1 rounded-full bg-gradient-to-tr from-white/10 to-transparent opacity-50"></div>
      </div>
    ));
  };

  const renderPoint = (index: number, isBottom: boolean) => {
    // Ordre des points : de droite à gauche, puis de gauche à droite
    // En bas : de droite (0) à gauche (11)
    // En haut : de gauche (12) à droite (23)
    const pointIndex = isBottom ? (index < 6 ? 11 - index : 5 - (index - 6)) : (index < 6 ? 12 + index : 18 + index);
    const checkers = board[pointIndex];
    const isDarkPoint = index % 2 === (isBottom ? 0 : 1);
    
    return (
      <div key={index} className={`relative w-full flex flex-col items-center justify-${isBottom ? 'end' : 'start'} px-1 py-4 group cursor-pointer`}>
         {/* Triangle Cuir Incrusté */}
         <div 
            className={`w-0 h-0 border-l-[18px] border-l-transparent border-r-[18px] border-r-transparent transition-all duration-300 group-hover:opacity-80 ${
                isBottom ? 'border-t-[180px] origin-top' : 'border-b-[180px] rotate-180 origin-bottom'
            } ${
                isDarkPoint ? 'border-t-[#5d4037]/60' : 'border-t-[#8d6e63]/30'
            }`}
         ></div>
         
         <div className="z-10 flex flex-col items-center">
            {renderCheckers(checkers)}
         </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-[#050505] text-[#d4af37] p-4 lg:p-8 font-serif selection:bg-amber-500/30">
      
      {/* Navbar Haute Couture */}
      <header className="max-w-7xl mx-auto mb-12 flex justify-between items-center border-b border-[#d4af37]/20 pb-8">
        <div className="flex items-center gap-6">
          <div className="relative">
            <div className="w-16 h-16 bg-gradient-to-br from-[#d4af37] to-[#aa8a2e] rounded-xl flex items-center justify-center shadow-[0_0_30px_rgba(212,175,55,0.3)] rotate-3">
              <Trophy size={32} className="text-[#050505]" />
            </div>
          </div>
          <div>
            <h1 className="text-4xl font-black tracking-tighter text-white uppercase italic">
              HERMAN <span className="text-[#d4af37]">LEGACY</span>
            </h1>
            <div className="flex items-center gap-2 text-[10px] text-[#d4af37]/60 font-sans uppercase tracking-[0.3em] mt-1">
              <span className="w-1.5 h-1.5 bg-[#d4af37] rounded-full animate-pulse"></span> Private Gaming Lounge
            </div>
          </div>
        </div>

        <button 
          onClick={() => setAccount("0x611...F32")}
          className="px-8 py-3 bg-transparent border-2 border-[#d4af37]/50 rounded-full text-xs font-black text-[#d4af37] hover:bg-[#d4af37] hover:text-[#050505] transition-all duration-500 flex items-center gap-3 tracking-[0.2em]"
        >
          <Wallet size={16} /> {account ? account : "CONNECT WALLET"}
        </button>
      </header>

      <main className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12">
        
        {/* Sidebar Left - Precieuse */}
        <div className="lg:col-span-3 space-y-8">
          <div className="bg-[#0c0c0c] border border-[#d4af37]/10 rounded-3xl p-8 shadow-2xl relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-[#d4af37]/5 rounded-full -mr-16 -mt-16 blur-3xl group-hover:bg-[#d4af37]/10 transition-all"></div>
            <h3 className="text-[#d4af37]/40 text-[10px] font-bold uppercase tracking-[0.3em] mb-8">Table Stakes</h3>
            <div className="space-y-6">
              <div>
                <span className="text-white/40 text-[10px] uppercase block mb-1">Current Pot</span>
                <span className="text-3xl font-light text-white tracking-tight">100.00 <span className="text-xs text-[#d4af37]">USDT</span></span>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="text-white/30 uppercase tracking-widest">Commission</span>
                <span className="text-[#d4af37] font-mono">5.00</span>
              </div>
            </div>
          </div>

          <div className="bg-[#0c0c0c] border border-[#d4af37]/10 rounded-3xl p-8">
            <h3 className="text-[#d4af37]/40 text-[10px] font-bold uppercase tracking-[0.3em] mb-6">Prison (Bar)</h3>
            <div className="flex justify-around items-center p-6 bg-white/[0.02] rounded-2xl border border-white/[0.05]">
              <div className="text-center">
                <div className="text-[10px] text-white/20 mb-4 uppercase tracking-tighter">Ivory</div>
                <div className="flex justify-center h-10">{renderCheckers(bar.W)}</div>
              </div>
              <div className="w-px h-12 bg-[#d4af37]/10"></div>
              <div className="text-center">
                <div className="text-[10px] text-white/20 mb-4 uppercase tracking-tighter">Ebony</div>
                <div className="flex justify-center h-10">{renderCheckers(-bar.B)}</div>
              </div>
            </div>
          </div>
        </div>

        {/* Board de Collection */}
        <div className="lg:col-span-9">
          <div className="bg-[#1a1410] p-6 rounded-[40px] shadow-[0_50px_100px_rgba(0,0,0,0.8)] border-[16px] border-[#2c1e14] relative">
            
            {/* Texture Cuir/Bois Précieux */}
            <div className="grid grid-rows-2 h-[650px] border-[2px] border-[#d4af37]/10 bg-[#0c0c0c] shadow-inner relative">
              
              {/* Moitié Supérieure */}
              <div className="grid grid-cols-12 border-b border-[#d4af37]/10 relative px-4">
                 <div className="absolute left-1/2 top-0 bottom-0 w-12 bg-gradient-to-b from-[#2c1e14] to-[#1a1410] -translate-x-1/2 z-20 shadow-2xl border-x border-[#d4af37]/10 flex items-center justify-center">
                    <div className="w-1 h-32 bg-[#d4af37]/5 rounded-full"></div>
                 </div>
                 {Array.from({ length: 12 }).map((_, i) => renderPoint(i, false))}
              </div>

              {/* Moitié Inférieure */}
              <div className="grid grid-cols-12 relative px-4">
                <div className="absolute left-1/2 top-0 bottom-0 w-12 bg-gradient-to-t from-[#2c1e14] to-[#1a1410] -translate-x-1/2 z-20 shadow-2xl border-x border-[#d4af37]/10"></div>
                {Array.from({ length: 12 }).map((_, i) => renderPoint(i, true))}
              </div>

              {/* Dice & Controls - Flottant & Minimaliste */}
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-30 flex flex-col items-center gap-8">
                <div className="flex gap-8">
                  {dice.map((d, i) => (
                    <div key={i} className="w-16 h-16 bg-[#f8f5f2] rounded-2xl flex items-center justify-center text-[#0a0a0a] text-3xl font-black shadow-[0_15px_40px_rgba(0,0,0,0.5)] border-b-4 border-[#dcd0c0]">
                      {d}
                    </div>
                  ))}
                </div>
                <button 
                  onClick={() => setDice([Math.floor(Math.random() * 6) + 1, Math.floor(Math.random() * 6) + 1])}
                  className="group relative px-12 py-4 overflow-hidden rounded-full border border-[#d4af37]/50"
                >
                  <div className="absolute inset-0 bg-[#d4af37] translate-y-full group-hover:translate-y-0 transition-transform duration-500"></div>
                  <span className="relative z-10 text-[10px] font-black tracking-[0.4em] uppercase text-[#d4af37] group-hover:text-[#050505] transition-colors">
                    Roll Precious Dice
                  </span>
                </button>
              </div>
            </div>

            {/* Marqueurs de sortie (Bearing Off Slots) */}
            <div className="absolute right-[-40px] top-1/2 -translate-y-1/2 w-8 h-[500px] flex flex-col justify-between py-10 pointer-events-none">
                <div className="w-full h-32 bg-white/5 rounded-full border border-white/10 flex items-center justify-center text-[8px] rotate-90 text-white/20 font-sans tracking-widest uppercase">Ivory Exit</div>
                <div className="w-full h-32 bg-white/5 rounded-full border border-white/10 flex items-center justify-center text-[8px] rotate-90 text-white/20 font-sans tracking-widest uppercase">Ebony Exit</div>
            </div>
          </div>

          {/* Footer Table Control */}
          <div className="mt-10 flex justify-between items-center bg-[#0c0c0c] p-6 rounded-3xl border border-[#d4af37]/10">
             <div className="flex items-center gap-6">
                <div className={`w-12 h-12 rounded-full border-2 transition-all duration-500 ${turn === "White" ? "bg-[#f8f5f2] border-[#d4af37] shadow-[0_0_20px_rgba(212,175,55,0.4)]" : "bg-[#2a2a2a] border-white/10"}`}></div>
                <div>
                    <span className="text-[10px] text-white/20 uppercase tracking-[0.3em] block mb-1">Current Move</span>
                    <span className="text-white font-bold tracking-widest uppercase italic">{turn} Player</span>
                </div>
             </div>
             <div className="flex gap-4">
                <button className="flex items-center gap-2 px-6 py-2 bg-white/5 rounded-full text-[10px] font-bold text-white/60 hover:text-[#d4af37] transition-colors border border-transparent hover:border-[#d4af37]/20 uppercase tracking-widest">
                    Double <ChevronRight size={12} />
                </button>
                <button className="flex items-center gap-2 px-6 py-2 bg-white/5 rounded-full text-[10px] font-bold text-white/60 hover:text-[#d4af37] transition-colors border border-transparent hover:border-[#d4af37]/20 uppercase tracking-widest">
                    Pass <ChevronRight size={12} />
                </button>
             </div>
          </div>
        </div>
      </main>

      <footer className="max-w-7xl mx-auto mt-24 pt-12 border-t border-white/5 flex justify-between items-center text-[10px] text-white/10 tracking-[0.5em] uppercase font-sans">
        <div>Handcrafted by David • 2026</div>
        <div className="flex gap-12">
          <span className="hover:text-[#d4af37] cursor-pointer transition-colors">Certificate</span>
          <span className="hover:text-[#d4af37] cursor-pointer transition-colors">Provably Fair</span>
          <span className="hover:text-[#d4af37] cursor-pointer transition-colors">Exclusivity</span>
        </div>
      </footer>
    </div>
  );
}
