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
        self.off = {"W": 0, "B": 0}
        self.players = {}

active_games: Dict[str, GameSession] = {"demo-game-1": GameSession()}

def get_game_data(game_id: str):
    game = active_games[game_id]
    return {"board": game.board, "turn": game.turn, "dice": game.dice, "bar": game.bar, "off": game.off}

def get_possible_moves_internal(game: GameSession):
    moves = []
    p, dice = game.turn, list(set(game.dice))
    if not dice: return []
    
    # 1. Bar
    if p == "W" and game.bar["W"] > 0:
        for d in dice:
            if game.board[d-1] >= -1: moves.append({"from": -1, "to": d-1})
        return moves
    if p == "B" and game.bar["B"] > 0:
        for d in dice:
            if game.board[24-d] <= 1: moves.append({"from": -1, "to": 24-d})
        return moves

    # 2. Board
    can_bear_off = False
    if p == "W":
        can_bear_off = game.bar["W"] == 0 and all(game.board[i] <= 0 for i in range(18))
    else:
        can_bear_off = game.bar["B"] == 0 and all(game.board[i] >= 0 for i in range(6, 24))

    for i in range(24):
        if (p == "W" and game.board[i] > 0) or (p == "B" and game.board[i] < 0):
            for d in dice:
                to = i + d if p == "W" else i - d
                if 0 <= to <= 23:
                    if (p == "W" and game.board[to] >= -1) or (p == "B" and game.board[to] <= 1):
                        moves.append({"from": i, "to": to})
                elif can_bear_off:
                    if (p == "W" and to >= 24) or (p == "B" and to <= -1):
                        # Simple check for bearing off
                        moves.append({"from": i, "to": 24 if p == "W" else -1})
    return moves

@sio.event
async def connect(sid, environ):
    pass

@sio.event
async def join_game(sid, data):
    game_id = data.get("game_id", "demo-game-1")
    if game_id not in active_games: active_games[game_id] = GameSession()
    game = active_games[game_id]
    sio.enter_room(sid, game_id)
    if sid not in game.players:
        if not any(v == "W" for v in game.players.values()): game.players[sid] = "W"
        elif not any(v == "B" for v in game.players.values()): game.players[sid] = "B"
    await sio.emit("game_state", get_game_data(game_id), room=game_id)

@app.get("/game/{game_id}/state")
def get_state(game_id: str):
    if game_id not in active_games: raise HTTPException(status_code=404)
    return get_game_data(game_id)

@app.post("/game/{game_id}/roll")
async def roll_dice(game_id: str):
    game = active_games.get(game_id)
    if not game: raise HTTPException(status_code=404)
    if game.dice: return {"dice": game.dice} # Prevent re-roll
    d1, d2 = random.randint(1, 6), random.randint(1, 6)
    game.dice = [d1, d2] if d1 != d2 else [d1, d1, d1, d1]
    
    # Auto-switch turn if no moves possible after roll
    if not get_possible_moves_internal(game):
        game.dice = []
        game.turn = "B" if game.turn == "W" else "W"

    await sio.emit("game_state", get_game_data(game_id), room=game_id)
    return {"dice": game.dice}

@app.get("/game/{game_id}/possible-moves")
def get_possible_moves(game_id: str):
    game = active_games.get(game_id)
    if not game: return {"moves": []}
    return {"moves": get_possible_moves_internal(game)}

@app.post("/game/{game_id}/move")
async def make_move(game_id: str, request: MoveRequest):
    game = active_games.get(game_id)
    if not game: return {"status": "error"}
    
    dist = abs(request.to_pos - request.from_pos) if request.from_pos != -1 else (request.to_pos + 1 if game.turn == "W" else 24 - request.to_pos)
    
    actual_die = None
    if dist in game.dice: actual_die = dist
    elif request.to_pos in [24, -1]: # Handling non-exact bearing off
        for d in sorted([d for d in game.dice if d > dist]):
            actual_die = d
            break
            
    if actual_die:
        game.dice.remove(actual_die)
        if request.from_pos == -1: game.bar[game.turn] -= 1
        else: game.board[request.from_pos] += (-1 if game.turn == "W" else 1)
        
        if request.to_pos in [24, -1]: game.off[game.turn] += 1
        else:
            target = game.board[request.to_pos]
            if (game.turn == "W" and target == -1) or (game.turn == "B" and target == 1):
                game.board[request.to_pos] = 0
                game.bar["B" if game.turn == "W" else "W"] += 1
            game.board[request.to_pos] += (1 if game.turn == "W" else -1)
        
        if not game.dice or not get_possible_moves_internal(game):
            game.dice = []
            game.turn = "B" if game.turn == "W" else "W"
            
        await sio.emit("game_state", get_game_data(game_id), room=game_id)
        return {"status": "success"}
    return {"status": "invalid"}

@app.post("/game/{game_id}/reset")
async def reset_game(game_id: str):
    active_games[game_id] = GameSession()
    await sio.emit("game_state", get_game_data(game_id), room=game_id)
    return {"message": "done"}

if __name__ == "__main__":
    uvicorn.run(socket_app, host="0.0.0.0", port=8000)
