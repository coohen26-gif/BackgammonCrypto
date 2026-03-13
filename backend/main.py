from fastapi import FastAPI
from pydantic import BaseModel
from typing import List, Optional

app = FastAPI(title="Backgammon Crypto API")

class GameState(BaseModel):
    board: List[int]
    turn: str
    dice: List[int]

@app.get("/")
def read_root():
    return {"status": "Backgammon Crypto API is running"}

@app.post("/game/roll")
def roll_dice():
    import random
    dice = [random.randint(1, 6), random.randint(1, 6)]
    return {"dice": dice}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
