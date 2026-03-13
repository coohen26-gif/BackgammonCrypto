"use client";

import { useState, useEffect } from "react";
import { ethers } from "ethers";
import { Wallet, Trophy, Play, Dice5, ShieldCheck, Activity, History } from "lucide-react";

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
    } catch (e) {
      console.error("API Error");
    }
  };

  const rollDice = async () => {
    setLoading(true);
    try {
      const res = await fetch(`https://mydavid.io/backgammon/api/game/${gameId}/roll`, { method: "POST" });
      if (res.ok) {
        const data = await res.json();
        setDice(data.dice);
      }
    } catch (e) {}
    setLoading(false);
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
        className={`w-6 h-6 rounded-full border shadow-sm -mt-2 first:mt-0 ${
          isWhite 
            ? "bg-amber-50 border-amber-200" 
            : "bg-amber-950 border-amber-800"
        }`}
      />
    ));
  };

  const renderPoint = (index: number, isBottom: boolean) => {
    const isEven = index % 2 === 0;
    const color = isEven ? "border-t-[120px] border-t-amber-900/40" : "border-t-[120px] border-t-amber-800/20";
    const rotate = isBottom ? "" : "rotate-180";
    const pointIndex = isBottom ? (index < 6 ? 5 - index : 11 - index + 6) : (index < 6 ? 12 + index : 18 + index);
    const checkers = board[pointIndex];
    
    return (
      <div key={index} className={`relative w-full flex flex-col items-center justify-${isBottom ? 'end' : 'start'} px-1 py-2 cursor-pointer hover:bg-amber-500/5 transition-colors`}>
         <div className={`w-0 h-0 border-l-[15px] border-l-transparent border-r-[15px] border-r-transparent ${color} ${rotate} absolute top-0 bottom-0`}></div>
         <div className="z-10 flex flex-col items-center">
            {renderCheckers(checkers)}
         </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-[#0f0e0c] text-amber-50 p-4 lg:p-8 font-serif">
      <header className="max-w-7xl mx-auto mb-8 flex justify-between items-center border-b border-amber-900/30 pb-6">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-amber-700 rounded-full flex items-center justify-center shadow-[0_0_20px_rgba(180,83,9,0.3)] border-2 border-amber-500/50">
            <Trophy size={24} className="text-amber-200" />
          </div>
          <div>
            <h1 className="text-3xl font-black tracking-tighter text-amber-100">
              GRAND <span className="text-amber-600">GAMMON</span>
            </h1>
            <div className="flex items-center gap-2 text-xs text-amber-700 font-sans uppercase tracking-widest">
              <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span> Table Haute Limite
            </div>
          </div>
        </div>

        <button 
          onClick={() => setAccount("0x611...F32")}
          className="px-6 py-2 bg-amber-900/40 border border-amber-700/50 rounded-full text-sm font-bold text-amber-200 hover:bg-amber-800/60 transition-all flex items-center gap-2"
        >
          <Wallet size={16} /> {account ? account : "REJOINDRE LA TABLE"}
        </button>
      </header>

      <main className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-3 space-y-6">
          <div className="bg-[#1a1814] border border-amber-900/30 rounded-2xl p-6 shadow-2xl">
            <h3 className="text-amber-600 text-xs font-bold uppercase tracking-widest mb-6">Détails du Pari</h3>
            <div className="space-y-4">
              <div className="flex justify-between items-end border-b border-amber-900/20 pb-2">
                <span className="text-amber-800 text-sm">POT TOTAL</span>
                <span className="text-2xl font-bold text-amber-100">100.00 <span className="text-xs text-amber-600">USDT</span></span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-amber-800">Joueur 1 (W)</span>
                <span className="text-amber-200 font-mono">50.00</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-amber-800">Joueur 2 (B)</span>
                <span className="text-amber-200 font-mono">50.00</span>
              </div>
            </div>
          </div>

          <div className="bg-[#1a1814] border border-amber-900/30 rounded-2xl p-6">
            <h3 className="text-amber-600 text-xs font-bold uppercase tracking-widest mb-4">Bar (Pions mangés)</h3>
            <div className="flex justify-around items-center p-4 bg-black/20 rounded-xl">
              <div className="text-center">
                <div className="text-xs text-amber-800 mb-2">BLANCS</div>
                <div className="flex justify-center h-8">{renderCheckers(bar.W)}</div>
              </div>
              <div className="w-px h-10 bg-amber-900/20"></div>
              <div className="text-center">
                <div className="text-xs text-amber-800 mb-2">NOIRS</div>
                <div className="flex justify-center h-8">{renderCheckers(-bar.B)}</div>
              </div>
            </div>
          </div>
        </div>

        <div className="lg:col-span-9">
          <div className="bg-amber-950/20 border-[12px] border-amber-900 rounded-lg shadow-[0_0_60px_rgba(0,0,0,0.5)] p-4 relative">
            <div className="grid grid-rows-2 h-[600px] border border-amber-800/30 bg-[#1a1814]">
              <div className="grid grid-cols-12 border-b border-amber-800/30 relative">
                 <div className="absolute left-1/2 top-0 bottom-0 w-10 bg-amber-900/40 -translate-x-1/2 z-20 shadow-xl border-x border-amber-800/30"></div>
                 {Array.from({ length: 12 }).map((_, i) => renderPoint(i, false))}
              </div>
              <div className="grid grid-cols-12 relative">
                <div className="absolute left-1/2 top-0 bottom-0 w-10 bg-amber-900/40 -translate-x-1/2 z-20 shadow-xl border-x border-amber-800/30"></div>
                {Array.from({ length: 12 }).map((_, i) => renderPoint(i, true))}
              </div>
            </div>

            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-30 flex flex-col items-center gap-4">
              <div className="flex gap-4">
                {dice.map((d, i) => (
                  <div key={i} className="w-16 h-16 bg-amber-50 rounded-xl flex items-center justify-center text-amber-950 text-3xl font-black shadow-2xl border-2 border-amber-200/50">
                    {d}
                  </div>
                ))}
              </div>
              <button 
                onClick={rollDice}
                disabled={loading}
                className="px-10 py-4 bg-amber-700 hover:bg-amber-600 text-amber-50 rounded-full font-bold shadow-2xl border border-amber-500/50 transition-all uppercase tracking-tighter"
              >
                {loading ? "Lancé..." : "Lancer les dés 🎲"}
              </button>
            </div>
          </div>

          <div className="mt-6 flex justify-between items-center bg-amber-950/10 p-4 rounded-xl border border-amber-900/20">
             <div className="flex items-center gap-4">
                <div className={`w-10 h-10 rounded-full border-2 border-amber-600 ${turn === "White" ? "bg-amber-50" : "bg-amber-950"}`}></div>
                <span className="text-sm font-bold text-amber-100 uppercase tracking-widest">Tour : {turn}</span>
             </div>
             <div className="flex gap-2">
                <div className="px-4 py-2 bg-amber-900/20 rounded-lg text-xs text-amber-500 font-bold uppercase cursor-pointer hover:bg-amber-900/40">Doubler</div>
                <div className="px-4 py-2 bg-amber-900/20 rounded-lg text-xs text-amber-500 font-bold uppercase cursor-pointer hover:bg-amber-900/40">Passer</div>
             </div>
          </div>
        </div>
      </main>
    </div>
  );
}
