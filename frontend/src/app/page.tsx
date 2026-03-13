"use client";

import { useState, useEffect } from "react";
import { ethers } from "ethers";
import { Wallet, Coins, Play, Dice5, ShieldCheck, Activity } from "lucide-react";

export default function BackgammonDashboard() {
  const [dice, setDice] = useState<number[]>([]);
  const [turn, setTurn] = useState("White");
  const [loading, setLoading] = useState(false);
  const [account, setAccount] = useState<string | null>(null);
  const [balance, setBalance] = useState<string>("0.00");
  const gameId = "demo-game-1";

  // Connexion Wallet
  const connectWallet = async () => {
    if (typeof window !== "undefined" && (window as any).ethereum) {
      try {
        const provider = new ethers.BrowserProvider((window as any).ethereum);
        const accounts = await provider.send("eth_requestAccounts", []);
        setAccount(accounts[0]);
        const balanceWei = await provider.getBalance(accounts[0]);
        setBalance(ethers.formatEther(balanceWei).slice(0, 6));
      } catch (err) {
        console.error("Erreur connexion wallet", err);
      }
    } else {
      alert("Metamask non détecté !");
    }
  };

  const rollDice = async () => {
    setLoading(true);
    try {
      const res = await fetch(`http://localhost:8000/game/${gameId}/roll`, { method: "POST" });
      if (res.ok) {
        const data = await res.json();
        setDice(data.dice);
      }
    } catch (e) {
      const d1 = Math.floor(Math.random() * 6) + 1;
      const d2 = Math.floor(Math.random() * 6) + 1;
      setDice([d1, d2]);
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white p-6 font-sans selection:bg-purple-500/30">
      {/* Navbar / Header */}
      <header className="max-w-7xl mx-auto mb-10 flex flex-col md:flex-row justify-between items-center gap-6 border-b border-purple-500/20 pb-8">
        <div>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-tr from-purple-600 to-cyan-400 rounded-lg flex items-center justify-center shadow-lg shadow-purple-500/20">
              <Dice5 size={24} className="text-white" />
            </div>
            <h1 className="text-3xl font-black tracking-tight bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">
              BACKGAMMON <span className="text-purple-500">CRYPTO</span>
            </h1>
          </div>
          <p className="text-gray-500 mt-1 flex items-center gap-2">
            <Activity size={14} className="text-green-500" /> MVP Phase 1 • Real-time Betting
          </p>
        </div>

        <div className="flex items-center gap-4">
          {!account ? (
            <button 
              onClick={connectWallet}
              className="flex items-center gap-2 px-6 py-3 bg-purple-600 hover:bg-purple-500 rounded-xl font-bold transition-all hover:scale-105 active:scale-95 shadow-lg shadow-purple-500/20"
            >
              <Wallet size={18} /> CONNECT WALLET
            </button>
          ) : (
            <div className="flex items-center gap-3 bg-gray-900/50 p-1 pr-4 rounded-xl border border-gray-800">
              <div className="bg-purple-600/20 p-2 rounded-lg text-purple-400 font-mono text-sm">
                {balance} ETH
              </div>
              <span className="text-xs font-mono text-gray-400">
                {account.slice(0, 6)}...{account.slice(-4)}
              </span>
            </div>
          )}
        </div>
      </header>

      <main className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Game State */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-[#12121a] p-6 rounded-2xl border border-gray-800/50 shadow-xl">
            <h2 className="text-sm font-bold text-gray-500 uppercase tracking-widest mb-6 flex items-center gap-2">
              <Play size={14} className="text-purple-500" /> Session active
            </h2>
            <div className="space-y-4">
              <div className="flex justify-between items-center p-3 bg-black/30 rounded-xl border border-white/5">
                <span className="text-gray-400">Tour</span>
                <span className={`px-3 py-1 rounded-md text-sm font-bold ${turn === "White" ? "bg-white text-black" : "bg-red-500 text-white"}`}>
                  {turn.toUpperCase()}
                </span>
              </div>
              <div className="flex justify-between items-center p-3 bg-black/30 rounded-xl border border-white/5">
                <span className="text-gray-400">Enjeu (Bet)</span>
                <span className="text-cyan-400 font-mono font-bold">50.00 USDT</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-black/30 rounded-xl border border-white/5">
                <span className="text-gray-400">Plateforme (5%)</span>
                <span className="text-purple-400 font-mono">2.50 USDT</span>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-purple-900/10 to-transparent p-6 rounded-2xl border border-purple-500/20">
            <h3 className="text-purple-300 font-bold mb-2 flex items-center gap-2">
              <ShieldCheck size={18} /> Sécurité Blockchain
            </h3>
            <p className="text-sm text-gray-400 leading-relaxed">
              Les fonds sont bloqués dans le Smart Contract <span className="text-purple-400 font-mono">BackgammonEscrow</span>.
              Gains libérés automatiquement après validation.
            </p>
          </div>
        </div>

        {/* Center Column: Gameplay */}
        <div className="lg:col-span-8 flex flex-col gap-6">
          <div className="bg-[#12121a] min-h-[400px] rounded-3xl border border-gray-800 flex flex-col items-center justify-center relative overflow-hidden">
            {/* Visual background element */}
            <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-purple-900/10 via-transparent to-transparent opacity-50 pointer-events-none"></div>
            
            <h2 className="text-2xl font-bold mb-10 text-white z-10">Lancer les dés</h2>
            
            <div className="flex gap-6 mb-12 z-10">
              {dice.length > 0 ? (
                dice.map((d, i) => (
                  <div key={i} className="w-20 h-20 bg-white rounded-2xl flex items-center justify-center text-[#0a0a0f] text-4xl font-black shadow-[0_10px_30px_rgba(255,255,255,0.2)] transform hover:rotate-12 transition-transform">
                    {d}
                  </div>
                ))
              ) : (
                <div className="flex gap-6">
                  {[1, 2].map((i) => (
                    <div key={i} className="w-20 h-20 bg-gray-800/50 rounded-2xl border-2 border-dashed border-gray-700 flex items-center justify-center text-gray-700">
                      ?
                    </div>
                  ))}
                </div>
              )}
            </div>

            <button 
              onClick={rollDice}
              disabled={loading || !account}
              className={`z-10 px-12 py-5 rounded-2xl font-black text-lg transition-all shadow-2xl ${
                loading || !account 
                  ? 'bg-gray-800 text-gray-500 cursor-not-allowed border border-gray-700' 
                  : 'bg-gradient-to-r from-purple-600 to-purple-500 hover:from-purple-500 hover:to-purple-400 text-white shadow-purple-500/20 scale-105 active:scale-95'
              }`}
            >
              {!account ? "CONNECTEZ VOTRE WALLET" : loading ? "ROLLING..." : "LANCER LES DÉS 🎲"}
            </button>

            {!account && (
              <p className="mt-4 text-gray-500 text-sm italic z-10 animate-pulse">
                Action requise : Connexion Web3 nécessaire pour jouer.
              </p>
            )}
          </div>
        </div>
      </main>

      <footer className="max-w-7xl mx-auto mt-20 pt-8 border-t border-gray-800/50 flex justify-between items-center text-gray-600 text-xs">
        <div>© 2026 BACKGAMMON CRYPTO LABS</div>
        <div className="flex gap-4">
          <span className="hover:text-purple-400 cursor-pointer">TERMS</span>
          <span className="hover:text-purple-400 cursor-pointer">DOCS</span>
          <span className="hover:text-purple-400 cursor-pointer">GITHUB</span>
        </div>
      </footer>
    </div>
  );
}
