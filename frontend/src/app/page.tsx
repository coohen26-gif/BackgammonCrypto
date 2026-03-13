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
            ? "bg-gradient-to-br from-[#ffffff] to-[#f0f0f0] border-gray-200" 
            : "bg-gradient-to-br from-[#1a1a1a] to-[#000000] border-[#333333]"
        }`}
      >
        {/* Marqueterie minimaliste sur le pion */}
        <div className="absolute inset-1 rounded-full border border-white/5 bg-gradient-to-tr from-white/10 to-transparent"></div>
      </div>
    ));
  };

  const renderPoint = (index: number, isBottom: boolean) => {
    const pointIndex = isBottom ? (index < 6 ? 11 - index : 5 - (index - 6)) : (index < 6 ? 12 + index : 18 + index);
    const checkers = board[pointIndex];
    // Hector Saxe : Contraste de textures. Cuir Alcantara / Cuir Lisse.
    const isDarkPoint = index % 2 === (isBottom ? 0 : 1);
    
    return (
      <div key={index} className={`relative w-full flex flex-col items-center justify-${isBottom ? 'end' : 'start'} px-1 py-8 group cursor-pointer`}>
         {/* Triangle Couture Hector Saxe (Pointe très fine, base large) */}
         <div 
            className={`w-0 h-0 border-l-[18px] border-l-transparent border-r-[18px] border-r-transparent transition-all duration-700 group-hover:opacity-80 ${
                isBottom ? 'border-t-[240px] origin-top' : 'border-b-[240px] rotate-180 origin-bottom'
            } ${
                isDarkPoint ? 'border-t-[#c8102e]/90 shadow-[0_0_15px_rgba(200,16,46,0.2)]' : 'border-t-[#ffffff]/10'
            }`}
         ></div>
         
         <div className="z-10 flex flex-col items-center">
            {renderCheckers(checkers)}
         </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-[#0d0d0d] text-[#ffffff] p-4 lg:p-12 font-sans tracking-tight">
      
      {/* Header Hector Saxe - Luxe Contemporain */}
      <header className="max-w-7xl mx-auto mb-16 flex justify-between items-end border-b-2 border-white/5 pb-10">
        <div>
          <div className="flex items-center gap-4 mb-2">
            <div className="w-1.5 h-12 bg-[#c8102e]"></div>
            <h1 className="text-5xl font-black tracking-tighter uppercase">
              SAXE <span className="font-light text-white/40 italic">LAB</span>
            </h1>
          </div>
          <p className="text-[10px] text-white/30 uppercase tracking-[0.5em] ml-6">
            L'Atelier Digital • Hector Saxe Edition
          </p>
        </div>

        <button 
          onClick={() => setAccount("0x611...F32")}
          className="px-10 py-4 bg-white text-black text-[10px] font-black uppercase tracking-[0.3em] hover:bg-[#c8102e] hover:text-white transition-all duration-500 shadow-2xl"
        >
          {account ? "WALLET CONNECTED" : "UNLOCK TABLE"}
        </button>
      </header>

      <main className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12">
        
        {/* Panel Gauche - Minimalisme */}
        <div className="lg:col-span-3 space-y-10">
          <div className="bg-[#141414] p-10 shadow-[20px_20px_60px_rgba(0,0,0,0.5)] border-l-4 border-[#c8102e]">
            <h3 className="text-white/20 text-[9px] font-bold uppercase tracking-[0.4em] mb-10">Stake Info</h3>
            <div className="space-y-8">
              <div>
                <span className="text-white/40 text-[9px] uppercase block mb-2 font-black">Pot Total</span>
                <span className="text-4xl font-black text-white">100.00 <span className="text-[10px] text-[#c8102e] align-top mt-2">USDT</span></span>
              </div>
              <div className="flex justify-between items-center text-[10px] pt-4 border-t border-white/5">
                <span className="text-white/20 uppercase tracking-widest font-black">Fee</span>
                <span className="text-white font-mono">5.00 USDT</span>
              </div>
            </div>
          </div>

          <div className="bg-[#141414] p-10">
            <h3 className="text-white/20 text-[9px] font-bold uppercase tracking-[0.4em] mb-8">The Bar</h3>
            <div className="flex justify-between items-center p-6 bg-black/40 border border-white/5">
              <div className="text-center">
                <div className="text-[8px] text-white/20 mb-4 font-black uppercase">Blanc</div>
                <div className="flex justify-center h-10">{renderCheckers(bar.W)}</div>
              </div>
              <div className="text-center">
                <div className="text-[8px] text-white/20 mb-4 font-black uppercase">Noir</div>
                <div className="flex justify-center h-10">{renderCheckers(-bar.B)}</div>
              </div>
            </div>
          </div>
        </div>

        {/* Board Hector Saxe Edition - L'Objet */}
        <div className="lg:col-span-9">
          <div className="bg-[#1a1a1a] p-2 shadow-[0_60px_100px_rgba(0,0,0,0.7)] border-[1px] border-white/10 relative">
            
            {/* Cadre en Cuir Grainé */}
            <div className="bg-[#0f0f0f] p-6 border-[12px] border-[#141414] shadow-inner">
                
                {/* Le tapis de jeu */}
                <div className="grid grid-rows-2 h-[680px] bg-[#0a0a0a] relative overflow-hidden border border-white/5">
                
                    {/* Moitié Supérieure */}
                    <div className="grid grid-cols-12 border-b border-white/10 relative px-6">
                        <div className="absolute left-1/2 top-0 bottom-0 w-14 bg-[#141414] -translate-x-1/2 z-20 shadow-[0_0_40px_rgba(0,0,0,0.9)] border-x border-white/5"></div>
                        {Array.from({ length: 12 }).map((_, i) => renderPoint(i, false))}
                    </div>

                    {/* Moitié Inférieure */}
                    <div className="grid grid-cols-12 relative px-6">
                        <div className="absolute left-1/2 top-0 bottom-0 w-14 bg-[#141414] -translate-x-1/2 z-20 shadow-[0_0_40px_rgba(0,0,0,0.9)] border-x border-white/5"></div>
                        {Array.from({ length: 12 }).map((_, i) => renderPoint(i, true))}
                    </div>

                    {/* Dés Saxe - Minimalisme Pur */}
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-30 flex flex-col items-center gap-10">
                        <div className="flex gap-6">
                            {dice.map((d, i) => (
                                <div key={i} className="w-16 h-16 bg-white flex items-center justify-center text-black text-4xl font-black shadow-[0_20px_40px_rgba(0,0,0,0.5)] transform hover:rotate-6 transition-transform">
                                    {d}
                                </div>
                            ))}
                        </div>
                        <button 
                            onClick={() => setDice([Math.floor(Math.random() * 6) + 1, Math.floor(Math.random() * 6) + 1])}
                            className="bg-transparent border-2 border-white/20 px-12 py-4 text-[10px] font-black uppercase tracking-[0.5em] text-white hover:bg-white hover:text-black transition-all duration-500"
                        >
                            Roll
                        </button>
                    </div>
                </div>
            </div>

            {/* Signature Hector Saxe (Plaque métal) */}
            <div className="absolute left-[-15px] top-1/2 -translate-y-1/2 w-4 h-32 bg-[#c8102e] shadow-xl"></div>
          </div>

          {/* Player Control Saxe Edition */}
          <div className="mt-12 flex justify-between items-center bg-[#141414] p-10 border-t-2 border-[#c8102e]">
             <div className="flex items-center gap-8">
                <div className={`w-14 h-14 rounded-full border-4 transition-all duration-700 ${turn === "White" ? "bg-white border-[#c8102e] shadow-[0_0_30px_rgba(200,16,46,0.3)]" : "bg-[#222] border-white/10"}`}></div>
                <div>
                    <span className="text-[9px] text-white/20 uppercase tracking-[0.5em] block mb-2 font-black">On Board</span>
                    <span className="text-xl font-black tracking-[0.1em] uppercase">{turn} PLAYER</span>
                </div>
             </div>
             <div className="flex gap-6">
                <button className="px-8 py-3 bg-white/5 text-[9px] font-black uppercase tracking-[0.3em] hover:text-[#c8102e] transition-colors">Double</button>
                <button className="px-8 py-3 bg-white/5 text-[9px] font-black uppercase tracking-[0.3em] hover:text-[#c8102e] transition-colors">Fold</button>
             </div>
          </div>
        </div>
      </main>

      <footer className="max-w-7xl mx-auto mt-24 pt-10 border-t border-white/5 flex justify-between items-center text-[8px] text-white/20 tracking-[0.6em] uppercase font-black">
        <div>Handcrafted for Cohen • Saxe Digital Edition • 2026</div>
        <div className="flex gap-16">
          <span>Provably Fair</span>
          <span>Crypto Secure</span>
        </div>
      </footer>
    </div>
  );
}
