"use client";

import { useState, useEffect } from "react";
import { ethers } from "ethers";
import { Wallet, Trophy, Play, Dice5, ShieldCheck, Activity, History, ChevronRight } from "lucide-react";
import { io } from "socket.io-client";

export default function BackgammonDashboard() {
  const [dice, setDice] = useState<number[]>([]);
  const [turn, setTurn] = useState("White");
  const [loading, setLoading] = useState(false);
  const [account, setAccount] = useState<string | null>(null);
  const [board, setBoard] = useState<number[]>(new Array(24).fill(0));
  const [bar, setBar] = useState({ W: 0, B: 0 });
  const [possibleMoves, setPossibleMoves] = useState<{from: number, to: number}[]>([]);
  const [selectedPoint, setSelectedPoint] = useState<number | null>(null);
  const [socket, setSocket] = useState<any>(null);
  
  const gameId = "demo-game-1";

  // Initialisation Socket.IO
  useEffect(() => {
    const newSocket = io("https://mydavid.io", {
      path: "/backgammon/api/socket.io",
      transports: ["websocket"]
    });

    newSocket.on("connect", () => {
      console.log("Connected to WebSocket");
      newSocket.emit("join_game", { game_id: gameId });
    });

    newSocket.on("game_state", (data: any) => {
      setBoard(data.board);
      setTurn(data.turn === "W" ? "White" : "Black");
      setDice(data.dice || []);
      setBar(data.bar || { W: 0, B: 0 });
      fetchPossibleMoves();
    });

    setSocket(newSocket);
    return () => { newSocket.close(); };
  }, []);

  const fetchPossibleMoves = async () => {
    try {
      const movesRes = await fetch(`https://mydavid.io/backgammon/api/game/${gameId}/possible-moves`);
      if (movesRes.ok) {
        const movesData = await movesRes.json();
        setPossibleMoves(movesData.moves);
      }
    } catch (e) {}
  };

  const rollDice = async () => {
    setLoading(true);
    try {
      await fetch(`https://mydavid.io/backgammon/api/game/${gameId}/roll`, { method: "POST" });
    } catch (e) {}
    setLoading(false);
  };

  const handlePointClick = async (pointIndex: number) => {
    if (selectedPoint === null) {
      const hasMoves = possibleMoves.some(m => m.from === pointIndex);
      if (hasMoves) setSelectedPoint(pointIndex);
    } else {
      if (selectedPoint === pointIndex) {
        setSelectedPoint(null);
        return;
      }
      
      const move = possibleMoves.find(m => m.from === selectedPoint && m.to === pointIndex);
      if (move) {
        setLoading(true);
        try {
          await fetch(`https://mydavid.io/backgammon/api/game/${gameId}/move`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ from: selectedPoint, to: pointIndex })
          });
          setSelectedPoint(null);
        } catch (e) {}
        setLoading(false);
      } else {
        setSelectedPoint(null);
      }
    }
  };

  const resetGame = async () => {
    if (!confirm("Reset Table?")) return;
    try {
      await fetch(`https://mydavid.io/backgammon/api/game/${gameId}/reset`, { method: "POST" });
      setSelectedPoint(null);
    } catch (e) {}
  };

  const renderCheckers = (count: number, pointIndex: number) => {
    const isWhite = count > 0;
    const absCount = Math.abs(count);
    const isSelected = selectedPoint === pointIndex;
    const canMove = possibleMoves.some(m => m.from === pointIndex);

    return Array.from({ length: absCount }).map((_, i) => (
      <div 
        key={i} 
        className={`w-8 h-8 rounded-full border-2 -mt-4 first:mt-0 relative transition-all duration-300 shadow-lg checker-animate ${
          isWhite 
            ? "bg-gradient-to-br from-[#fefefe] to-[#e0e0e0] border-white/40" 
            : "bg-gradient-to-br from-[#333333] to-[#111111] border-black/40 shadow-black/40"
        } ${isSelected ? "ring-4 ring-[#c8102e] scale-110 z-30" : ""} ${canMove && !selectedPoint ? "cursor-pointer hover:shadow-[0_0_15px_rgba(200,16,46,0.4)]" : ""}`}
        style={{ animationDelay: `${i * 0.05}s` }}
      >
        <div className="absolute inset-1.5 rounded-full border border-white/5 bg-gradient-to-tr from-white/5 to-transparent"></div>
      </div>
    ));
  };

  const renderPoint = (pointIndex: number, isBottom: boolean) => {
    const checkers = board[pointIndex];
    const isDarkPoint = pointIndex % 2 !== 0;
    const isTarget = selectedPoint !== null && possibleMoves.some(m => m.from === selectedPoint && m.to === pointIndex);
    
    return (
      <div 
        key={pointIndex} 
        onClick={() => handlePointClick(pointIndex)}
        className={`relative w-full h-full flex flex-col items-center justify-${isBottom ? 'end' : 'start'} px-1 py-4 group cursor-pointer ${isTarget ? "bg-[#c8102e]/10" : ""}`}
      >
         <div 
            className={`w-0 h-0 border-l-[18px] border-l-transparent border-r-[18px] border-r-transparent transition-all duration-500 group-hover:brightness-125 ${
                isBottom ? 'border-t-[220px] origin-top' : 'border-b-[220px] rotate-180 origin-bottom'
            } ${
                isTarget ? 'border-t-[#c8102e]' : isDarkPoint ? 'border-t-[#c8102e]/70' : 'border-t-[#333]/70'
            }`}
         ></div>
         
         <div className={`z-10 flex flex-col items-center ${isBottom ? 'mb-2' : 'mt-2'}`}>
            {renderCheckers(checkers, pointIndex)}
         </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-[#0d0d0d] text-[#fafafa] p-4 lg:p-8 font-sans selection:bg-red-500/30">
      
      <header className="max-w-7xl mx-auto mb-10 flex justify-between items-center border-b border-white/10 pb-8">
        <div className="flex items-center gap-6">
          <div className="w-14 h-14 bg-[#c8102e] rounded-sm flex items-center justify-center shadow-2xl rotate-45 border-2 border-white/20">
            <Trophy size={28} className="text-white -rotate-45" />
          </div>
          <div>
            <h1 className="text-4xl font-black tracking-tighter text-white uppercase italic">
              SAXE <span className="text-[#c8102e]">EDITION</span>
            </h1>
            <div className="flex items-center gap-2 text-[9px] text-white/40 font-sans uppercase tracking-[0.4em] mt-1">
              <span className="w-1.5 h-1.5 bg-[#c8102e] rounded-full animate-pulse"></span> Multi-player Online
            </div>
          </div>
        </div>

        <button 
          onClick={() => setAccount("0x611...F32")}
          className="px-8 py-3 bg-[#c8102e] border border-white/10 rounded-sm text-[10px] font-black text-white hover:bg-white hover:text-[#c62828] transition-all duration-300 flex items-center gap-3 tracking-[0.2em] shadow-xl"
        >
          <Wallet size={16} /> {account ? "WALLET CONNECTED" : "OPEN WALLET"}
        </button>
      </header>

      <main className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-10">
        
        <div className="lg:col-span-3 space-y-6">
          <div className="bg-[#1e1e1e] border border-white/5 rounded-sm p-8 shadow-2xl">
            <h3 className="text-[#c8102e] text-[9px] font-bold uppercase tracking-[0.3em] mb-8">Betting Stakes</h3>
            <div className="space-y-6">
              <div>
                <span className="text-white/20 text-[9px] uppercase block mb-1">Total Pool</span>
                <span className="text-3xl font-black text-white tracking-tighter">100.00 <span className="text-xs text-[#c8102e]">USDT</span></span>
              </div>
            </div>
          </div>

          <div className="bg-[#1e1e1e] border border-white/5 rounded-sm p-8">
            <h3 className="text-[#c8102e] text-[9px] font-bold uppercase tracking-[0.3em] mb-6">The Bar</h3>
            <div className="flex justify-around items-center p-4 bg-black/40 rounded-sm border border-white/5">
              <div className="text-center cursor-pointer" onClick={() => handlePointClick(-1)}>
                <div className={`text-[9px] mb-3 uppercase ${selectedPoint === -1 ? "text-[#c8102e] font-bold" : "text-white/20"}`}>Ivory</div>
                <div className="flex justify-center h-10">{renderCheckers(bar.W, -1)}</div>
              </div>
              <div className="w-px h-10 bg-white/5"></div>
              <div className="text-center cursor-pointer" onClick={() => handlePointClick(-1)}>
                <div className={`text-[9px] mb-3 uppercase ${selectedPoint === -1 ? "text-[#c8102e] font-bold" : "text-white/20"}`}>Carbon</div>
                <div className="flex justify-center h-10">{renderCheckers(-bar.B, -1)}</div>
              </div>
            </div>
          </div>
        </div>

        <div className="lg:col-span-9">
          <div className="bg-[#2c2c2c] p-4 rounded-sm shadow-[0_40px_80px_rgba(0,0,0,0.6)] border-[12px] border-[#1a1a1a] relative">
            <div className="grid grid-rows-2 h-[600px] bg-[#121212] shadow-inner relative border border-white/5">
              
              <div className="grid grid-cols-12 border-b border-white/10 relative px-2">
                 <div className="absolute left-1/2 top-0 bottom-0 w-12 bg-[#1a1a1a] -translate-x-1/2 z-20 shadow-2xl border-x border-white/5"></div>
                 {Array.from({ length: 12 }).map((_, i) => renderPoint(12 + i, false))}
              </div>

              <div className="grid grid-cols-12 relative px-2">
                <div className="absolute left-1/2 top-0 bottom-0 w-12 bg-[#1a1a1a] -translate-x-1/2 z-20 shadow-2xl border-x border-white/5"></div>
                {Array.from({ length: 12 }).map((_, i) => renderPoint(11 - i, true))}
              </div>

              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-30 flex flex-col items-center gap-6">
                <div className="flex gap-4">
                  {dice.map((d, i) => (
                    <div key={i} className="w-14 h-14 bg-white rounded-sm flex items-center justify-center text-black text-3xl font-black shadow-2xl">
                      {d}
                    </div>
                  ))}
                </div>
                <button 
                  onClick={rollDice}
                  disabled={loading || dice.length > 0}
                  className={`px-10 py-3 text-[9px] font-black uppercase tracking-[0.3em] transition-all ${dice.length > 0 ? "bg-gray-800 text-gray-500 cursor-not-allowed" : "bg-[#c8102e] text-white hover:bg-white hover:text-black"}`}
                >
                  {loading ? "..." : "Roll Dice"}
                </button>
              </div>
            </div>
          </div>

          <div className="mt-8 flex justify-between items-center bg-[#1e1e1e] p-6 rounded-sm border border-white/5 shadow-xl">
             <div className="flex items-center gap-6">
                <div className={`w-10 h-10 rounded-full border-2 transition-all ${turn === "White" ? "bg-white border-[#c8102e]" : "bg-[#333] border-white/10"}`}></div>
                <div>
                    <span className="text-[9px] text-white/20 uppercase tracking-[0.3em] block mb-1">Turn</span>
                    <span className="text-white font-black tracking-widest uppercase">{turn}</span>
                </div>
             </div>
             <div className="flex gap-4">
                <button 
                  onClick={resetGame}
                  className="px-6 py-2 bg-white/5 rounded-sm text-[9px] font-bold text-white/40 hover:text-white transition-colors border border-white/5 uppercase tracking-widest"
                >
                    Reset Table
                </button>
             </div>
          </div>
        </div>
      </main>
    </div>
  );
}
