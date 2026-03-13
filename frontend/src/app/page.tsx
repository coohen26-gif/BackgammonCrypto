"use client";

import { useState, useEffect } from "react";
import { ethers } from "ethers";
import { Wallet, Trophy, Play, Dice5, ShieldCheck, Activity, History, ChevronRight, AlertCircle, Loader2 } from "lucide-react";
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
  const [possibleMoves, setPossibleMoves] = useState<{from: number, to: number}[]>([]);
  const [selectedPoint, setSelectedPoint] = useState<number | null>(null);
  const [socket, setSocket] = useState<any>(null);
  const [bettingStatus, setBettingStatus] = useState<"idle" | "approving" | "staking" | "secured">("idle");
  const [error, setError] = useState<string | null>(null);
  
  const gameId = "demo-game-1";

  useEffect(() => {
    const newSocket = io("https://mydavid.io", {
      path: "/backgammon/api/socket.io",
      transports: ["websocket"]
    });
    newSocket.on("connect", () => { newSocket.emit("join_game", { game_id: gameId }); });
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

  const resetGame = async () => {
    if (!confirm("Voulez-vous vraiment réinitialiser la partie ?")) return;
    setLoading(true);
    try {
      await fetch(`https://mydavid.io/backgammon/api/game/${gameId}/reset`, { method: "POST" });
      setSelectedPoint(null);
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

  const handleStake = async () => {
    if (!account || typeof window === "undefined" || !(window as any).ethereum) return;
    setError(null);
    try {
      const provider = new ethers.BrowserProvider((window as any).ethereum);
      const signer = await provider.getSigner();
      const usdtContract = new ethers.Contract(USDT_ADDRESS, USDT_ABI, signer);
      const escrowContract = new ethers.Contract(ESCROW_ADDRESS, ESCROW_ABI, signer);
      const amount = ethers.parseUnits("50.0", 6);
      setBettingStatus("approving");
      const approveTx = await usdtContract.approve(ESCROW_ADDRESS, amount);
      await approveTx.wait();
      setBettingStatus("staking");
      const gameHash = ethers.id(gameId);
      const stakeTx = await escrowContract.createGame(gameHash, ethers.ZeroAddress, amount, USDT_ADDRESS);
      await stakeTx.wait();
      setBettingStatus("secured");
    } catch (err: any) {
      setError(err.reason || err.message || "Transaction failed");
      setBettingStatus("idle");
    }
  };

  const renderCheckers = (count: number, pointIndex: number) => {
    const isWhite = count > 0;
    const absCount = Math.abs(count);
    const isSelected = selectedPoint === pointIndex;
    const canMove = possibleMoves.some(m => m.from === pointIndex);
    return Array.from({ length: absCount }).map((_, i) => (
      <div 
        key={i} 
        className={`w-6 h-6 md:w-10 md:h-10 rounded-full border-2 -mt-4 md:-mt-6 first:mt-0 relative transition-all duration-300 shadow-lg checker-animate ${
          isWhite ? "bg-gradient-to-br from-[#fefefe] to-[#e0e0e0] border-white/40 shadow-white/10" : "bg-gradient-to-br from-[#333333] to-[#111111] border-black/40 shadow-black/40"
        } ${isSelected ? "ring-4 ring-[#c8102e] scale-110 z-30" : ""} ${canMove && !selectedPoint ? "cursor-pointer hover:shadow-[0_0_15px_rgba(200,16,46,0.4)]" : ""}`}
        style={{ animationDelay: `${i * 0.05}s` }}
      >
        <div className="absolute inset-1.5 rounded-full border border-white/5 bg-gradient-to-tr from-white/10 to-transparent"></div>
      </div>
    ));
  };

  const renderPoint = (pointIndex: number, isBottom: boolean) => {
    const checkers = board[pointIndex];
    const isDarkPoint = pointIndex % 2 !== 0;
    const isTarget = selectedPoint !== null && possibleMoves.some(m => m.from === selectedPoint && m.to === pointIndex);
    return (
      <div key={pointIndex} onClick={() => handlePointClick(pointIndex)} className={`relative w-full h-full flex flex-col items-center justify-${isBottom ? 'end' : 'start'} group cursor-pointer ${isTarget ? "bg-[#c8102e]/10" : ""}`}>
         <div className={`w-0 h-0 border-l-[12px] md:border-l-[24px] border-l-transparent border-r-[12px] md:border-r-[24px] border-r-transparent transition-all duration-500 group-hover:brightness-125 ${isBottom ? 'border-t-[140px] md:border-t-[280px] origin-top' : 'border-b-[140px] md:border-b-[280px] rotate-180 origin-bottom'} ${isTarget ? 'border-t-[#c8102e]' : isDarkPoint ? 'border-t-[#c8102e]/80' : 'border-t-[#333]/80'}`}></div>
         <div className={`z-10 flex flex-col items-center absolute ${isBottom ? 'bottom-2' : 'top-2'}`}>{renderCheckers(checkers, pointIndex)}</div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-[#0d0d0d] text-[#fafafa] p-2 md:p-8 font-sans selection:bg-red-500/30 overflow-x-hidden">
      <header className="max-w-7xl mx-auto mb-4 md:mb-10 flex justify-between items-center border-b border-white/10 pb-4 md:pb-8">
        <div className="flex items-center gap-3 md:gap-6">
          <div className="w-10 h-10 md:w-14 md:h-14 bg-[#c8102e] rounded-sm flex items-center justify-center shadow-2xl rotate-45 border-2 border-white/20">
            <Trophy size={20} className="text-white -rotate-45" />
          </div>
          <h1 className="text-xl md:text-4xl font-black tracking-tighter text-white uppercase italic tracking-widest">SAXE <span className="text-[#c8102e]">EDITION</span></h1>
        </div>
        <button onClick={() => !account && setAccount("0x611...F32")} className="px-4 py-2 md:px-8 md:py-3 bg-[#c8102e] border border-white/10 rounded-sm text-[8px] md:text-[10px] font-black text-white uppercase tracking-[0.2em] shadow-xl">
          {account ? "CONNECTED" : "WALLET"}
        </button>
      </header>

      <main className="max-w-7xl mx-auto flex flex-col gap-4 md:gap-10">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-[#1e1e1e] p-4 md:p-6 border border-white/5 text-center">
                <p className="text-[8px] md:text-[10px] text-white/20 uppercase font-black tracking-widest mb-1">Pot Total</p>
                <p className="text-lg md:text-2xl font-black">100.00 <span className="text-[8px] text-[#c8102e]">USDT</span></p>
            </div>
            <div className="bg-[#1e1e1e] p-4 md:p-6 border border-white/5 text-center">
                <p className="text-[8px] md:text-[10px] text-white/20 uppercase font-black tracking-widest mb-1">Your Turn</p>
                <p className={`text-lg md:text-2xl font-black uppercase ${turn === "White" ? "text-white" : "text-[#c8102e]"}`}>{turn}</p>
            </div>
            <div className="hidden lg:block bg-[#1e1e1e] p-6 border border-white/5 text-center cursor-pointer" onClick={() => handlePointClick(-1)}>
                <p className="text-[10px] text-white/20 uppercase font-black tracking-widest mb-2 text-[#c8102e]">The Bar</p>
                <div className="flex justify-center gap-4">{renderCheckers(bar.W, -1)}{renderCheckers(-bar.B, -1)}</div>
            </div>
            <div className="hidden lg:flex items-center justify-center bg-[#1e1e1e] p-6 border border-white/5">
                {bettingStatus !== "secured" ? (
                    <button onClick={handleStake} disabled={bettingStatus !== "idle"} className="w-full py-2 bg-white text-black text-[10px] font-black uppercase tracking-widest hover:bg-[#c8102e] hover:text-white transition-all">STAKE 50 USDT</button>
                ) : (
                    <div className="text-green-500 text-[10px] font-black uppercase flex items-center gap-2"><ShieldCheck size={14} /> SECURED</div>
                )}
            </div>
        </div>

        <div className="bg-[#2c2c2c] p-2 md:p-6 rounded-sm shadow-[0_40px_80px_rgba(0,0,0,0.8)] border-[8px] md:border-[20px] border-[#1a1a1a] relative">
            <div className="grid grid-rows-2 h-[500px] md:h-[800px] bg-[#121212] shadow-inner relative border border-white/5">
              <div className="grid grid-cols-13 border-b border-white/10 relative px-1 md:px-4 h-full">
                 <div className="col-start-7 w-full bg-[#1a1a1a] shadow-[0_0_50px_rgba(0,0,0,1)] border-x border-white/5 z-20"></div>
                 <div className="col-span-6 grid grid-cols-6 h-full">{[12, 13, 14, 15, 16, 17].map((idx) => renderPoint(idx, false))}</div>
                 <div className="col-span-6 grid grid-cols-6 h-full">{[18, 19, 20, 21, 22, 23].map((idx) => renderPoint(idx, false))}</div>
              </div>
              <div className="grid grid-cols-13 relative px-1 md:px-4 h-full">
                <div className="col-start-7 w-full bg-[#1a1a1a] shadow-[0_0_50px_rgba(0,0,0,1)] border-x border-white/5 z-20"></div>
                 <div className="col-span-6 grid grid-cols-6 h-full">{[11, 10, 9, 8, 7, 6].map((idx) => renderPoint(idx, true))}</div>
                 <div className="col-span-6 grid grid-cols-6 h-full">{[5, 4, 3, 2, 1, 0].map((idx) => renderPoint(idx, true))}</div>
              </div>
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-30 flex flex-col items-center gap-6 md:gap-10">
                <div className="flex gap-4 md:gap-8">
                  {dice.map((d, i) => (
                    <div key={i} className="w-12 h-12 md:w-20 md:h-20 bg-white flex items-center justify-center text-black text-2xl md:text-5xl font-black shadow-[0_20px_60px_rgba(0,0,0,1)] border-b-4 border-gray-300">
                      {d}
                    </div>
                  ))}
                </div>
                <button 
                  onClick={rollDice}
                  disabled={loading || (dice.length > 0 && possibleMoves.length > 0)}
                  className={`px-8 py-3 md:px-14 md:py-5 text-[10px] md:text-[14px] font-black uppercase tracking-[0.4em] transition-all shadow-2xl ${(dice.length > 0 && possibleMoves.length > 0) ? "bg-gray-800 text-gray-500 cursor-not-allowed" : "bg-[#c8102e] text-white hover:bg-white hover:text-black border-2 border-white/20"}`}
                >
                  {loading ? "..." : "Roll Dice"}
                </button>
              </div>
            </div>
        </div>

        <div className="flex justify-between items-center bg-[#1e1e1e] p-6 rounded-sm border border-white/5">
             <div className="flex items-center gap-6">
                <div className={`w-10 h-10 rounded-full border-4 transition-all ${turn === "White" ? "bg-white border-[#c8102e]" : "bg-[#333] border-white/10"}`}></div>
                <span className="text-white font-black tracking-widest uppercase text-sm md:text-xl">{turn} PLAYER</span>
             </div>
             <div className="flex gap-4">
                <button onClick={() => handlePointClick(-1)} className="lg:hidden px-4 py-2 bg-[#c8102e]/20 text-[#c8102e] text-[10px] font-black border border-[#c8102e]/30 uppercase">Bar Access</button>
                <button onClick={resetGame} className="px-6 py-2 bg-white/5 text-white/40 text-[10px] font-black border border-white/5 uppercase tracking-widest hover:text-white">Reset Table</button>
             </div>
        </div>
      </main>

      <footer className="max-w-7xl mx-auto mt-20 pb-10 text-center text-[8px] text-white/10 tracking-[0.6em] font-black uppercase">
        Handcrafted for Cohen • Hector Saxe Digital 2026
      </footer>
    </div>
  );
}
