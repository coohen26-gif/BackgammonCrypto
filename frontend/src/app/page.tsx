"use client";

import { useState, useEffect } from "react";
import { ethers } from "ethers";
import { Wallet, Trophy, Play, Dice5, ShieldCheck, Activity, History, ChevronRight, AlertCircle, Loader2 } from "lucide-react";
import { io } from "socket.io-client";
import { ESCROW_ABI, USDT_ABI } from "./constants";

const ESCROW_ADDRESS = "0x71C765660998d8976E84976722889244E4aD8976"; // Placeholder
const USDT_ADDRESS = "0xdAC17F958D2ee523a2206206994597C13D831ec7"; // Mainnet USDT

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
        className={`w-5 h-5 md:w-8 md:h-8 rounded-full border-2 -mt-3 md:-mt-4 first:mt-0 relative transition-all duration-300 shadow-lg checker-animate ${
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
         <div className={`w-0 h-0 border-l-[12px] md:border-l-[18px] border-l-transparent border-r-[12px] md:border-r-[18px] border-r-transparent transition-all duration-500 group-hover:brightness-125 ${isBottom ? 'border-t-[120px] md:border-t-[220px] origin-top' : 'border-b-[120px] md:border-b-[220px] rotate-180 origin-bottom'} ${isTarget ? 'border-t-[#c8102e]' : isDarkPoint ? 'border-t-[#c8102e]/70' : 'border-t-[#333]/70'}`}></div>
         <div className={`z-10 flex flex-col items-center absolute ${isBottom ? 'bottom-2' : 'top-2'}`}>{renderCheckers(checkers, pointIndex)}</div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-[#0d0d0d] text-[#fafafa] p-2 md:p-8 font-sans selection:bg-red-500/30 overflow-x-hidden">
      <header className="max-w-7xl mx-auto mb-4 md:mb-10 flex justify-between items-center border-b border-white/10 pb-4 md:pb-8">
        <div className="flex items-center gap-3 md:gap-6">
          <div className="w-10 h-10 md:w-14 md:h-14 bg-[#c8102e] rounded-sm flex items-center justify-center shadow-2xl rotate-45 border-2 border-white/20">
            <Trophy size={20} className="text-white -rotate-45 md:hidden" /><Trophy size={28} className="text-white -rotate-45 hidden md:block" />
          </div>
          <h1 className="text-xl md:text-4xl font-black tracking-tighter text-white uppercase italic">SAXE <span className="text-[#c8102e]">EDITION</span></h1>
        </div>
        <button onClick={() => !account && setAccount("0x611...F32")} className="px-4 py-2 md:px-8 md:py-3 bg-[#c8102e] border border-white/10 rounded-sm text-[8px] md:text-[10px] font-black text-white uppercase tracking-[0.2em] shadow-xl">
          {account ? "CONNECTED" : "WALLET"}
        </button>
      </header>

      <main className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-4 md:gap-10">
        <div className="lg:hidden grid grid-cols-2 gap-2 mb-2">
            <div className="bg-[#1e1e1e] p-3 border border-white/5 text-center">
                <p className="text-[8px] text-white/20 uppercase font-black">Pot Total</p>
                <p className="text-lg font-black">100.00 <span className="text-[8px] text-[#c8102e]">USDT</span></p>
            </div>
            <div className="bg-[#1e1e1e] p-3 border border-white/5 text-center">
                <p className="text-[8px] text-white/20 uppercase font-black">Your Turn</p>
                <p className={`text-lg font-black uppercase ${turn === "White" ? "text-white" : "text-[#c8102e]"}`}>{turn}</p>
            </div>
        </div>

        <div className="hidden lg:block lg:col-span-3 space-y-6">
          <div className="bg-[#1e1e1e] border border-white/5 rounded-sm p-8 shadow-2xl">
            <h3 className="text-[#c8102e] text-[9px] font-bold uppercase tracking-[0.3em] mb-8">Betting Stakes</h3>
            <div className="space-y-6">
              <div>
                <span className="text-white/20 text-[9px] uppercase block mb-1">Total Pool</span>
                <span className="text-3xl font-black text-white tracking-tighter">100.00 <span className="text-xs text-[#c8102e]">USDT</span></span>
              </div>
              {bettingStatus !== "secured" ? (
                <button onClick={handleStake} disabled={bettingStatus !== "idle"} className="w-full py-3 bg-white text-black text-[9px] font-black uppercase tracking-widest hover:bg-[#c8102e] hover:text-white transition-all flex items-center justify-center gap-2">
                  {bettingStatus === "idle" ? "STAKE 50 USDT" : <><Loader2 size={12} className="animate-spin" /> {bettingStatus.toUpperCase()}...</>}
                </button>
              ) : (
                <div className="py-3 bg-green-500/10 border border-green-500/30 text-green-500 text-[9px] font-black uppercase tracking-widest text-center flex items-center justify-center gap-2">
                  <ShieldCheck size={12} /> FUNDS SECURED
                </div>
              )}
              {error && <div className="p-2 bg-red-500/10 border border-red-500/30 text-red-500 text-[7px] font-bold uppercase flex items-center gap-1"><AlertCircle size={10} /> {error}</div>}
            </div>
          </div>
          
          <div className="bg-[#1e1e1e] border border-white/5 rounded-sm p-8 text-center cursor-pointer" onClick={() => handlePointClick(-1)}>
            <h3 className="text-[#c8102e] text-[9px] font-bold uppercase tracking-[0.3em] mb-6">The Bar</h3>
            <div className="flex justify-around items-center p-4 bg-black/40 rounded-sm border border-white/5">
              <div><div className={`text-[9px] mb-3 uppercase ${selectedPoint === -1 ? "text-[#c8102e] font-bold" : "text-white/20"}`}>Ivory</div><div className="flex justify-center h-10">{renderCheckers(bar.W, -1)}</div></div>
              <div className="w-px h-10 bg-white/5"></div>
              <div><div className={`text-[9px] mb-3 uppercase ${selectedPoint === -1 ? "text-[#c8102e] font-bold" : "text-white/20"}`}>Carbon</div><div className="flex justify-center h-10">{renderCheckers(-bar.B, -1)}</div></div>
            </div>
          </div>
        </div>

        <div className="lg:col-span-9">
          <div className="bg-[#2c2c2c] p-2 md:p-4 rounded-sm shadow-[0_40px_80px_rgba(0,0,0,0.6)] border-[6px] md:border-[12px] border-[#1a1a1a] relative">
            <div className="grid grid-rows-2 h-[450px] md:h-[600px] bg-[#121212] shadow-inner relative border border-white/5">
              <div className="grid grid-cols-13 border-b border-white/10 relative px-1 md:px-2 h-full">
                 <div className="col-start-7 w-full bg-[#1a1a1a] shadow-2xl border-x border-white/5 z-20"></div>
                 <div className="col-span-6 grid grid-cols-6 h-full">{[12, 13, 14, 15, 16, 17].map((idx) => renderPoint(idx, false))}</div>
                 <div className="col-span-6 grid grid-cols-6 h-full">{[18, 19, 20, 21, 22, 23].map((idx) => renderPoint(idx, false))}</div>
              </div>
              <div className="grid grid-cols-13 relative px-1 md:px-2 h-full">
                <div className="col-start-7 w-full bg-[#1a1a1a] shadow-2xl border-x border-white/5 z-20"></div>
                 <div className="col-span-6 grid grid-cols-6 h-full">{[11, 10, 9, 8, 7, 6].map((idx) => renderPoint(idx, true))}</div>
                 <div className="col-span-6 grid grid-cols-6 h-full">{[5, 4, 3, 2, 1, 0].map((idx) => renderPoint(idx, true))}</div>
              </div>
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-30 flex flex-col items-center gap-4 md:gap-6 w-full">
                <div className="flex gap-2 md:gap-4">{dice.map((d, i) => (<div key={i} className="w-10 h-10 md:w-14 md:h-14 bg-white rounded-sm flex items-center justify-center text-black text-xl md:text-3xl font-black shadow-2xl">{d}</div>))}</div>
                <button onClick={rollDice} disabled={loading || (dice.length > 0 && possibleMoves.length > 0)} className={`px-6 py-2 md:px-10 md:py-3 text-[8px] md:text-[9px] font-black uppercase tracking-[0.3em] transition-all ${(dice.length > 0 && possibleMoves.length > 0) ? "bg-gray-800 text-gray-500 cursor-not-allowed" : "bg-[#c8102e] text-white hover:bg-white hover:text-black"}`}>{loading ? "..." : "Roll"}</button>
              </div>
            </div>
          </div>
          <div className="mt-4 md:mt-8 flex justify-between items-center bg-[#1e1e1e] p-4 md:p-6 rounded-sm border border-white/5 shadow-xl">
             <div className="flex items-center gap-4 md:gap-6">
                <div className={`w-8 h-8 md:w-10 md:h-10 rounded-full border-2 transition-all ${turn === "White" ? "bg-white border-[#c8102e]" : "bg-[#333] border-white/10"}`}></div>
                <div><span className="text-[8px] md:text-[9px] text-white/20 uppercase tracking-[0.5em] block mb-1">Turn</span><span className="text-white font-black tracking-widest uppercase text-xs md:text-base">{turn} PLAYER</span></div>
             </div>
             <div className="flex gap-2 md:gap-4"><button onClick={() => window.location.reload()} className="px-4 py-2 bg-white/5 rounded-sm text-[8px] md:text-[9px] font-bold text-white/40 border border-white/5 uppercase tracking-widest">Reload</button></div>
          </div>
        </div>
      </main>
    </div>
  );
}
