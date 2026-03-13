"use client";

import { useState, useEffect } from "react";
import { ethers } from "ethers";
import { Wallet, Trophy, ShieldCheck, AlertCircle, Loader2 } from "lucide-react";
import { io } from "socket.io-client";
import { ESCROW_ABI, USDT_ABI } from "./constants";

const ESCROW_ADDRESS = "0x71C765660998d8976E84976722889244E4aD8976";
const USDT_ADDRESS = "0xdAC17F958D2ee523a2206206994597C13D831ec7";

export default function BackgammonDashboard() {
  const [dice, setDice] = useState<number[]>([]);
  const [turn, setTurn] = useState("White");
  const [loading, setLoading] = useState(false);
  const [account, setAccount] = useState<string | null>(null);
  const [board, setBoard] = useState<number[]>(new Array(24).fill(0));
  const [bar, setBar] = useState({ W: 0, B: 0 });
  const [off, setOff] = useState({ W: 0, B: 0 });
  const [possibleMoves, setPossibleMoves] = useState<{from: number, to: number}[]>([]);
  const [selectedPoint, setSelectedPoint] = useState<number | null>(null);
  const [bettingStatus, setBettingStatus] = useState<"idle" | "approving" | "staking" | "secured">("idle");
  const [error, setError] = useState<string | null>(null);
  const [socket, setSocket] = useState<any>(null);
  
  const gameId = "demo-game-1";

  useEffect(() => {
    const newSocket = io("https://mydavid.io", {
      path: "/backgammon/api/socket.io",
      transports: ["websocket"]
    });
    
    newSocket.on("connect", () => {
      newSocket.emit("join_game", { game_id: gameId });
    });

    newSocket.on("game_state", (data: any) => {
      setBoard(data.board);
      setTurn(data.turn === "W" ? "White" : "Black");
      setDice(data.dice || []);
      setBar(data.bar || { W: 0, B: 0 });
      setOff(data.off || { W: 0, B: 0 });
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
    if (loading || dice.length > 0) return;
    setLoading(true);
    try { await fetch(`https://mydavid.io/backgammon/api/game/${gameId}/roll`, { method: "POST" }); } catch (e) {}
    setLoading(false);
  };

  const handlePointClick = async (pointIndex: number) => {
    if (selectedPoint === null) {
      if (possibleMoves.some(m => m.from === pointIndex)) setSelectedPoint(pointIndex);
    } else {
      const move = possibleMoves.find(m => m.from === selectedPoint && m.to === pointIndex);
      if (move) {
        setLoading(true);
        try {
          await fetch(`https://mydavid.io/backgammon/api/game/${gameId}/move`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ from: selectedPoint, to: pointIndex })
          });
        } catch (e) {}
        setLoading(false);
      }
      setSelectedPoint(null);
    }
  };

  const resetGame = async () => {
    if (!confirm("Voulez-vous réinitialiser ?")) return;
    try { await fetch(`https://mydavid.io/backgammon/api/game/${gameId}/reset`, { method: "POST" }); } catch (e) {}
  };

  const renderCheckers = (count: number, pointIndex: number) => {
    const isWhite = count > 0;
    const absCount = Math.abs(count);
    const isSelected = selectedPoint === pointIndex;
    const canMove = possibleMoves.some(m => m.from === pointIndex);
    
    return Array.from({ length: absCount }).map((_, i) => (
      <div 
        key={i} 
        className={`w-6 h-6 md:w-9 md:h-9 rounded-full border-2 -mt-3 md:-mt-5 first:mt-0 relative transition-all duration-300 shadow-xl checker-animate ${
          isWhite ? "bg-gradient-to-br from-[#f8f8f8] to-[#e0e0e0] border-[#dcdcdc]" : "bg-gradient-to-br from-[#333333] to-[#0a0a0a] border-[#1a1a1a]"
        } ${isSelected ? "ring-4 ring-[#c6934b] scale-110 z-30" : ""} ${canMove && !selectedPoint ? "cursor-pointer hover:shadow-[0_0_15px_rgba(200,16,46,0.4)]" : ""}`}
        style={{ animationDelay: `${i * 0.05}s` }}
      >
        <div className="absolute inset-1 rounded-full border border-white/10 bg-gradient-to-tr from-white/10 to-transparent"></div>
      </div>
    ));
  };

  const renderPoint = (pointIndex: number, isBottom: boolean) => {
    const checkers = board[pointIndex];
    const isCaramel = pointIndex % 2 !== 0;
    const isTarget = selectedPoint !== null && possibleMoves.some(m => m.from === selectedPoint && m.to === pointIndex);
    
    return (
      <div key={pointIndex} onClick={() => handlePointClick(pointIndex)} className={`relative w-full h-full flex flex-col items-center justify-${isBottom ? 'end' : 'start'} cursor-pointer ${isTarget ? "bg-[#c6934b]/20" : ""}`}>
         <div className={`w-0 h-0 border-l-[11px] md:border-l-[22px] border-l-transparent border-r-[11px] md:border-r-[22px] border-r-transparent transition-all duration-500 ${isBottom ? 'border-t-[160px] md:border-t-[340px] origin-top' : 'border-b-[160px] md:border-b-[340px] rotate-180 origin-bottom'} ${isCaramel ? 'border-t-[#c6934b]' : 'border-t-[#f5f5f5]'}`}></div>
         <div className={`z-10 flex flex-col items-center absolute ${isBottom ? 'bottom-2' : 'top-2'}`}>{renderCheckers(checkers, pointIndex)}</div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-[#0a1626] text-[#f5f5f5] p-2 md:p-8 font-sans selection:bg-[#c6934b]/30 overflow-x-hidden">
      
      <header className="max-w-7xl mx-auto mb-4 flex justify-between items-center border-b border-white/10 pb-2">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-[#c6934b] rounded-sm flex items-center justify-center shadow-lg border border-white/20"><Trophy size={16} className="text-white" /></div>
          <h1 className="text-xl font-black tracking-tighter uppercase italic text-white">SAXE <span className="text-[#c6934b]">ATELIER</span></h1>
        </div>
        <button onClick={() => !account && setAccount("0x611...F32")} className="px-4 py-1 bg-[#c6934b] border border-white/10 rounded-sm text-[8px] font-black text-white uppercase tracking-widest">{account ? "CONNECTED" : "WALLET"}</button>
      </header>

      <main className="max-w-7xl mx-auto flex flex-col gap-4">
        <div className="grid grid-cols-4 gap-2">
            <div className="bg-[#0f1d2e] p-2 border border-white/5 text-center"><p className="text-[7px] text-white/20 uppercase font-black">Pot</p><p className="text-sm font-black text-white">100 USDT</p></div>
            <div className="bg-[#0f1d2e] p-2 border border-white/5 text-center"><p className="text-[7px] text-white/20 uppercase font-black">Turn</p><p className={`text-sm font-black uppercase ${turn === "White" ? "text-white" : "text-[#c6934b]"}`}>{turn}</p></div>
            <div className="bg-[#0f1d2e] p-2 border border-white/5 text-center cursor-pointer" onClick={() => handlePointClick(-1)}><p className="text-[7px] text-white/20 uppercase font-black mb-1 text-[#c6934b]">Bar</p><p className="text-sm font-black text-white">{bar.W}/{bar.B}</p></div>
            <div className="bg-[#0f1d2e] p-2 border border-white/5 text-center cursor-pointer" onClick={() => handlePointClick(turn === "White" ? 24 : -1)}><p className="text-[7px] text-white/20 uppercase font-black mb-1 text-green-500">Exit</p><p className="text-sm font-black text-white">{off.W}/{off.B}</p></div>
        </div>

        <div className="bg-[#0a1626] p-2 md:p-6 rounded-sm shadow-[0_50px_100px_rgba(0,0,0,0.8)] border-[10px] md:border-[24px] border-[#07101c] relative">
            <div className="grid grid-rows-2 h-[500px] md:h-[780px] bg-[#0a1626] relative border-2 border-black/40">
              <div className="grid grid-cols-13 border-b-2 border-black/20 relative px-1 md:px-2 h-full">
                 <div className="col-start-7 w-full bg-[#07101c] shadow-[0_0_40px_rgba(0,0,0,0.8)] z-20 border-x border-white/5"></div>
                 <div className="col-span-6 grid grid-cols-6 h-full">{[12, 13, 14, 15, 16, 17].map((idx) => renderPoint(idx, false))}</div>
                 <div className="col-span-6 grid grid-cols-6 h-full">{[18, 19, 20, 21, 22, 23].map((idx) => renderPoint(idx, false))}</div>
              </div>
              <div className="grid grid-cols-13 relative px-1 md:px-2 h-full">
                 <div className="col-start-7 w-full bg-[#07101c] shadow-[0_0_40px_rgba(0,0,0,0.8)] z-20 border-x border-white/5"></div>
                 <div className="col-span-6 grid grid-cols-6 h-full">{[11, 10, 9, 8, 7, 6].map((idx) => renderPoint(idx, true))}</div>
                 <div className="col-span-6 grid grid-cols-6 h-full">{[5, 4, 3, 2, 1, 0].map((idx) => renderPoint(idx, true))}</div>
              </div>

              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-30 flex flex-col items-center gap-6 md:gap-12">
                <div className="flex gap-3 md:gap-6">
                  {dice.map((d, i) => (<div key={i} className="w-10 h-10 md:w-16 md:h-16 bg-[#f5f5f5] flex items-center justify-center text-black text-xl md:text-4xl font-black shadow-2xl border-b-4 border-gray-300 rounded-sm">{d}</div>))}
                </div>
                <button onClick={rollDice} disabled={loading || (dice.length > 0 && possibleMoves.length > 0)} className={`px-8 py-3 md:px-14 md:py-5 text-[9px] md:text-[12px] font-black uppercase tracking-[0.4em] transition-all shadow-2xl ${(dice.length > 0 && possibleMoves.length > 0) ? "bg-black/40 text-white/20" : "bg-white text-black hover:bg-[#c6934b] hover:text-white border-2 border-white/10"}`}>ROLL</button>
              </div>
            </div>
            <div className="absolute left-[-15px] top-1/2 -translate-y-1/2 w-3 h-24 bg-[#c6934b] shadow-xl border border-white/20"></div>
        </div>

        <div className="flex justify-between items-center bg-[#0f1d2e] p-4 md:p-6 rounded-sm border border-white/5">
             <div className="flex items-center gap-4">
                <div className={`w-8 h-8 rounded-full border-4 transition-all ${turn === "White" ? "bg-white border-[#c6934b]" : "bg-[#222] border-white/10"}`}></div>
                <span className="text-white font-black tracking-widest uppercase text-xs md:text-lg">{turn} PLAYER</span>
             </div>
             <div className="flex gap-2">
                <button onClick={resetGame} className="px-4 py-2 bg-white/5 text-white/40 text-[8px] font-black border border-white/5 uppercase tracking-widest hover:text-white">Reset</button>
                <button onClick={() => window.location.reload()} className="px-4 py-2 bg-white/5 text-white/40 text-[8px] font-black border border-white/5 uppercase tracking-widest">Reload</button>
             </div>
        </div>
      </main>
      <footer className="max-w-7xl mx-auto mt-10 pb-6 text-center text-[7px] text-white/10 tracking-[0.6em] font-black uppercase">Hector Saxe Paris • Atelier Cohen 2026</footer>
    </div>
  );
}
