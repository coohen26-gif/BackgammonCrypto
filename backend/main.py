import os
import random
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from typing import List, Dict, Optional
from fastapi.middleware.cors import CORSMiddleware
import socketio
import uvicorn

# Configuration Socket.IO
sio = socketio.AsyncServer(async_mode='asgi', cors_allowed_origins='*')
app = FastAPI(title="Backgammon Crypto API")
socket_app = socketio.ASGIApp(sio, app)

# Configuration CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class MoveRequest(BaseModel):
    from_pos: int
    to_pos: int

class GameSession:
    def __init__(self):
        self.board = [0] * 24
        # Standard Setup
        self.board[0] = 2; self.board[11] = 5; self.board[16] = 3; self.board[18] = 5  # White
        self.board[5] = -5; self.board[7] = -3; self.board[12] = -5; self.board[23] = -2 # Black
        self.turn = "W"
        self.dice = []
        self.bar = {"W": 0, "B": 0}
        self.players = {} # socket_id -> color

active_games: Dict[str, GameSession] = {"demo-game-1": GameSession()}

@sio.event
async def connect(sid, environ):
    print(f"Client connected: {sid}")

@sio.event
async def join_game(sid, data):
    game_id = data.get("game_id", "demo-game-1")
    if game_id not in active_games:
        active_games[game_id] = GameSession()
    
    game = active_games[game_id]
    sio.enter_room(sid, game_id)
    
    # Assigner une couleur si vide
    if not any(p == "W" for p in game.players.values()):
        game.players[sid] = "W"
    elif not any(p == "B" for p in game.players.values()):
        game.players[sid] = "B"
    else:
        game.players[sid] = "Spectator"
        
    await sio.emit("game_state", get_game_data(game_id), room=game_id)

def get_game_data(game_id: str):
    game = active_games[game_id]
    return {
        "board": game.board,
        "turn": game.turn,
        "dice": game.dice,
        "bar": game.bar
    }

@app.post("/game/{game_id}/roll")
async def roll_dice(game_id: str):
    if game_id not in active_games:
        raise HTTPException(status_code=404, detail="Game not found")
    game = active_games[game_id]
    d1, d2 = random.randint(1, 6), random.randint(1, 6)
    game.dice = [d1, d2]
    if d1 == d2:
        game.dice = [d1, d1, d1, d1]
    
    await sio.emit("game_state", get_game_data(game_id), room=game_id)
    return {"dice": game.dice}

@app.post("/game/{game_id}/move")
async def make_move(game_id: str, request: MoveRequest):
    if game_id not in active_games:
        raise HTTPException(status_code=404, detail="Game not found")
    game = active_games[game_id]
    
    # Logique simplifiée
    dist = abs(request.to_pos - request.from_pos) if request.from_pos != -1 else (request.to_pos + 1 if game.turn == "W" else 24 - request.to_pos)
    
    if dist in game.dice:
        game.dice.remove(dist)
        if request.from_pos == -1:
            game.bar[game.turn] -= 1
        else:
            game.board[request.from_pos] += (-1 if game.turn == "W" else 1)
        
        if request.to_pos not in [24, -1]:
            target = game.board[request.to_pos]
            if game.turn == "W" and target == -1:
                game.board[request.to_pos] = 0
                game.bar["B"] += 1
            elif game.turn == "B" and target == 1:
                game.board[request.to_pos] = 0
                game.bar["W"] += 1
            game.board[request.to_pos] += (1 if game.turn == "W" else -1)
            
        if not game.dice:
            game.turn = "B" if game.turn == "W" else "W"
            
        await sio.emit("game_state", get_game_data(game_id), room=game_id)
        return {"status": "success"}
    
    return {"status": "invalid_move"}

@app.post("/game/{game_id}/reset")
async def reset_game(game_id: str):
    active_games[game_id] = GameSession()
    await sio.emit("game_state", get_game_data(game_id), room=game_id)
    return {"message": "Reset done"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(socket_app, host="0.0.0.0", port=8000)
