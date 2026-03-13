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
        className={`w-8 h-8 rounded-full border-2 -mt-4 first:mt-0 relative transition-all duration-300 hover:scale-110 shadow-lg ${
          isWhite 
            ? "bg-gradient-to-br from-[#fefefe] to-[#e0e0e0] border-white/40 shadow-white/10" 
            : "bg-gradient-to-br from-[#333333] to-[#111111] border-black/40 shadow-black/40"
        }`}
      >
        <div className="absolute inset-1.5 rounded-full border border-white/5 bg-gradient-to-tr from-white/5 to-transparent"></div>
      </div>
    ));
  };

  const renderPoint = (index: number, isBottom: boolean) => {
    const pointIndex = isBottom ? (index < 6 ? 11 - index : 5 - (index - 6)) : (index < 6 ? 12 + index : 18 + index);
    const checkers = board[pointIndex];
    // Couleurs Hector Saxe : Contraste fort, souvent noir/blanc ou rouge/gris
    const isDarkPoint = index % 2 === (isBottom ? 0 : 1);
    
    return (
      <div key={index} className={`relative w-full flex flex-col items-center justify-${isBottom ? 'end' : 'start'} px-1 py-6 group cursor-pointer`}>
         {/* Triangle Incrusté - Style Hector Saxe (Pointe effilée) */}
         <div 
            className={`w-0 h-0 border-l-[16px] border-l-transparent border-r-[16px] border-r-transparent transition-all duration-500 group-hover:brightness-125 ${
                isBottom ? 'border-t-[220px] origin-top' : 'border-b-[220px] rotate-180 origin-bottom'
            } ${
                isDarkPoint ? 'border-t-[#c62828]/80' : 'border-t-[#424242]/90'
            }`}
         ></div>
         
         <div className="z-10 flex flex-col items-center">
            {renderCheckers(checkers)}
         </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-[#121212] text-[#fafafa] p-4 lg:p-8 font-sans selection:bg-red-500/30">
      
      {/* Header Hector Saxe Style */}
      <header className="max-w-7xl mx-auto mb-10 flex justify-between items-center border-b border-white/10 pb-8">
        <div className="flex items-center gap-6">
          <div className="w-14 h-14 bg-[#c62828] rounded-sm flex items-center justify-center shadow-2xl rotate-45 border-2 border-white/20">
            <Trophy size={28} className="text-white -rotate-45" />
          </div>
          <div>
            <h1 className="text-4xl font-black tracking-tighter text-white uppercase italic">
              SAXE <span className="text-[#c62828]">EDITION</span>
            </h1>
            <div className="flex items-center gap-2 text-[9px] text-white/40 font-sans uppercase tracking-[0.4em] mt-1">
              <span className="w-1.5 h-1.5 bg-[#c62828] rounded-full animate-pulse"></span> Parisian Luxury Gaming
            </div>
          </div>
        </div>

        <button 
          onClick={() => setAccount("0x611...F32")}
          className="px-8 py-3 bg-[#c62828] border border-white/10 rounded-sm text-[10px] font-black text-white hover:bg-white hover:text-[#c62828] transition-all duration-300 flex items-center gap-3 tracking-[0.2em] shadow-xl"
        >
          <Wallet size={16} /> {account ? account : "OPEN WALLET"}
        </button>
      </header>

      <main className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-10">
        
        {/* Stats Hector Saxe */}
        <div className="lg:col-span-3 space-y-6">
          <div className="bg-[#1e1e1e] border border-white/5 rounded-sm p-8 shadow-2xl">
            <h3 className="text-[#c62828] text-[9px] font-bold uppercase tracking-[0.3em] mb-8">Betting Stakes</h3>
            <div className="space-y-6">
              <div>
                <span className="text-white/20 text-[9px] uppercase block mb-1">Total Pool</span>
                <span className="text-3xl font-black text-white tracking-tighter">100.00 <span className="text-xs text-[#c62828]">USDT</span></span>
              </div>
              <div className="pt-4 border-t border-white/5 flex justify-between items-center text-[10px]">
                <span className="text-white/20 uppercase tracking-widest">Rake (5%)</span>
                <span className="text-white font-mono">5.00</span>
              </div>
            </div>
          </div>

          <div className="bg-[#1e1e1e] border border-white/5 rounded-sm p-8">
            <h3 className="text-[#c62828] text-[9px] font-bold uppercase tracking-[0.3em] mb-6">The Bar</h3>
            <div className="flex justify-around items-center p-4 bg-black/40 rounded-sm border border-white/5">
              <div className="text-center">
                <div className="text-[9px] text-white/20 mb-3 uppercase">Ivory</div>
                <div className="flex justify-center h-10">{renderCheckers(bar.W)}</div>
              </div>
              <div className="w-px h-10 bg-white/5"></div>
              <div className="text-center">
                <div className="text-[9px] text-white/20 mb-3 uppercase">Carbon</div>
                <div className="flex justify-center h-10">{renderCheckers(-bar.B)}</div>
              </div>
            </div>
          </div>
        </div>

        {/* Board Hector Saxe Edition */}
        <div className="lg:col-span-9">
          <div className="bg-[#2c2c2c] p-4 rounded-sm shadow-[0_40px_80px_rgba(0,0,0,0.6)] border-[12px] border-[#1a1a1a] relative">
            
            {/* Plateau Cuir Texture */}
            <div className="grid grid-rows-2 h-[600px] bg-[#121212] shadow-inner relative border border-white/5">
              
              {/* Moitié Supérieure */}
              <div className="grid grid-cols-12 border-b border-white/10 relative px-2">
                 <div className="absolute left-1/2 top-0 bottom-0 w-10 bg-[#1a1a1a] -translate-x-1/2 z-20 shadow-2xl border-x border-white/5"></div>
                 {Array.from({ length: 12 }).map((_, i) => renderPoint(i, false))}
              </div>

              {/* Moitié Inférieure */}
              <div className="grid grid-cols-12 relative px-2">
                <div className="absolute left-1/2 top-0 bottom-0 w-10 bg-[#1a1a1a] -translate-x-1/2 z-20 shadow-2xl border-x border-white/5"></div>
                {Array.from({ length: 12 }).map((_, i) => renderPoint(i, true))}
              </div>

              {/* Dice - Style Minimaliste */}
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-30 flex flex-col items-center gap-6">
                <div className="flex gap-4">
                  {dice.map((d, i) => (
                    <div key={i} className="w-14 h-14 bg-white rounded-sm flex items-center justify-center text-black text-3xl font-black shadow-2xl">
                      {d}
                    </div>
                  ))}
                </div>
                <button 
                  onClick={() => setDice([Math.floor(Math.random() * 6) + 1, Math.floor(Math.random() * 6) + 1])}
                  className="px-10 py-3 bg-[#c62828] text-white text-[9px] font-black uppercase tracking-[0.3em] hover:bg-white hover:text-black transition-all"
                >
                  Roll Dice
                </button>
              </div>
            </div>

            {/* Side pockets for checkers */}
            <div className="absolute right-[-20px] top-1/2 -translate-y-1/2 w-4 h-full bg-[#1a1a1a] rounded-r-sm"></div>
          </div>

          {/* Footer Controls */}
          <div className="mt-8 flex justify-between items-center bg-[#1e1e1e] p-6 rounded-sm border border-white/5 shadow-xl">
             <div className="flex items-center gap-6">
                <div className={`w-10 h-10 rounded-full border-2 transition-all ${turn === "White" ? "bg-white border-[#c62828] shadow-[0_0_15px_rgba(198,40,40,0.5)]" : "bg-[#333] border-white/10"}`}></div>
                <div>
                    <span className="text-[9px] text-white/20 uppercase tracking-[0.3em] block mb-1">Turn</span>
                    <span className="text-white font-black tracking-widest uppercase">{turn}</span>
                </div>
             </div>
             <div className="flex gap-4">
                <button className="px-6 py-2 bg-white/5 rounded-sm text-[9px] font-bold text-white/40 hover:text-[#c62828] transition-colors border border-white/5 uppercase tracking-widest">
                    Double
                </button>
                <button className="px-6 py-2 bg-white/5 rounded-sm text-[9px] font-bold text-white/40 hover:text-[#c62828] transition-colors border border-white/5 uppercase tracking-widest">
                    Fold
                </button>
             </div>
          </div>
        </div>
      </main>

      <footer className="max-w-7xl mx-auto mt-20 pt-10 border-t border-white/5 flex justify-between items-center text-[9px] text-white/10 tracking-[0.4em] uppercase">
        <div>Hector Saxe Style Adaptation • David 2026</div>
        <div className="flex gap-10 font-black">
          <span>Provably Fair</span>
          <span>Crypto Secure</span>
        </div>
      </footer>
    </div>
  );
}
