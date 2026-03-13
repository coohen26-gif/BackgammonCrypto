import os
import random
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from typing import List, Dict, Optional
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI(title="Backgammon Crypto API")

# Configuration CORS pour permettre au frontend Next.js de communiquer avec l'API
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # À restreindre en prod
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class MoveRequest(BaseModel):
    game_id: str
    player: str
    from_pos: int
    to_pos: int

class GameSession:
    def __init__(self):
        self.board = [0] * 24
        # Setup initial
        self.board[0] = 2; self.board[11] = 5; self.board[16] = 3; self.board[18] = 5  # White
        self.board[5] = -5; self.board[7] = -3; self.board[12] = -5; self.board[23] = -2 # Black
        self.turn = "W"
        self.dice = []
        self.bar = {"W": 0, "B": 0}

# Simulation en mémoire pour le MVP
active_games: Dict[str, GameSession] = {}

@app.get("/status")
def get_status():
    return {"status": "online", "project": "Backgammon Crypto", "version": "0.1.0"}

@app.post("/game/start/{game_id}")
def start_game(game_id: str):
    active_games[game_id] = GameSession()
    return {"message": "Game started", "game_id": game_id}

@app.get("/game/{game_id}/state")
def get_state(game_id: str):
    if game_id not in active_games:
        raise HTTPException(status_code=404, detail="Game not found")
    game = active_games[game_id]
    return {
        "board": game.board,
        "turn": game.turn,
        "dice": game.dice,
        "bar": game.bar
    }

@app.post("/game/{game_id}/roll")
def roll_dice(game_id: str):
    if game_id not in active_games:
        raise HTTPException(status_code=404, detail="Game not found")
    game = active_games[game_id]
    d1, d2 = random.randint(1, 6), random.randint(1, 6)
    game.dice = [d1, d2]
    if d1 == d2:
        game.dice = [d1, d1, d1, d1]
    return {"dice": game.dice}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
