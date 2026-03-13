"use client";

import { useState } from "react";

export default function BackgammonDashboard() {
  const [dice, setDice] = useState<number[]>([]);
  const [turn, setTurn] = useState("White");

  const rollDice = async () => {
    // Simulation API
    const d1 = Math.floor(Math.random() * 6) + 1;
    const d2 = Math.floor(Math.random() * 6) + 1;
    setDice([d1, d2]);
  };

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white p-8 font-sans">
      <header className="mb-12 border-b border-purple-500/30 pb-6 flex justify-between items-center">
        <div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-400 to-cyan-400 bg-clip-text text-transparent">
            Backgammon Crypto
          </h1>
          <p className="text-gray-400 mt-2">MVP Phase 1 - Interface de Contrôle</p>
        </div>
        <div className="bg-purple-900/20 px-4 py-2 rounded-lg border border-purple-500/50">
          Statut : <span className="text-green-400 font-mono">Connecté (Web3)</span>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Game Stats */}
        <div className="bg-[#12121a] p-6 rounded-xl border border-gray-800">
          <h2 className="text-xl font-semibold mb-4 text-purple-300">Infos Partie</h2>
          <div className="space-y-4">
            <div className="flex justify-between border-b border-gray-800 pb-2">
              <span className="text-gray-400">Tour actuel :</span>
              <span className={turn === "White" ? "text-white" : "text-red-400"}>{turn}</span>
            </div>
            <div className="flex justify-between border-b border-gray-800 pb-2">
              <span className="text-gray-400">Pari :</span>
              <span className="text-cyan-400 font-mono">50.00 USDT</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Commission (5%) :</span>
              <span className="text-purple-400">2.50 USDT</span>
            </div>
          </div>
        </div>

        {/* Dice & Controls */}
        <div className="bg-[#12121a] p-6 rounded-xl border border-gray-800 flex flex-col items-center justify-center">
          <h2 className="text-xl font-semibold mb-6 text-purple-300">Dés & Actions</h2>
          <div className="flex gap-4 mb-8">
            {dice.length > 0 ? (
              dice.map((d, i) => (
                <div key={i} className="w-16 h-16 bg-white rounded-lg flex items-center justify-center text-[#0a0a0f] text-3xl font-bold shadow-[0_0_15px_rgba(255,255,255,0.3)]">
                  {d}
                </div>
              ))
            ) : (
              <div className="text-gray-500 italic">Lancez les dés...</div>
            )}
          </div>
          <button 
            onClick={rollDice}
            className="w-full py-4 bg-purple-600 hover:bg-purple-500 rounded-lg font-bold transition-all shadow-[0_0_20px_rgba(108,92,231,0.4)]"
          >
            LANCER LES DÉS 🎲
          </button>
        </div>

        {/* Smart Contract Interaction */}
        <div className="bg-[#12121a] p-6 rounded-xl border border-gray-800">
          <h2 className="text-xl font-semibold mb-4 text-purple-300">Blockchain Status</h2>
          <div className="space-y-3 font-mono text-sm">
            <div className="p-3 bg-black/40 rounded border border-purple-500/20">
              <p className="text-gray-500">Escrow Contract:</p>
              <p className="text-cyan-400 overflow-hidden text-ellipsis">0x71C765...d8976</p>
            </div>
            <div className="p-3 bg-black/40 rounded border border-purple-500/20">
              <p className="text-gray-500">Status Escrow:</p>
              <p className="text-green-400">Funds Secured (100 USDT)</p>
            </div>
          </div>
        </div>
      </div>

      <footer className="mt-12 text-center text-gray-600 text-sm">
        Backgammon Crypto MVP v0.1.0 - Développé par David 🌞
      </footer>
    </div>
  );
}
