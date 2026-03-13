export type Player = 'W' | 'B';

export interface GameState {
    board: number[];
    bar: { W: number; B: number };
    off: { W: number; B: number };
    turn: Player;
    dice: number[];
}

export class BackgammonEngine {
    private state: GameState;

    constructor() {
        this.state = this.initializeBoard();
    }

    private initializeBoard(): GameState {
        const board = new Array(24).fill(0);
        board[0] = 2; board[11] = 5; board[16] = 3; board[18] = 5; // White
        board[5] = -5; board[7] = -3; board[12] = -5; board[23] = -2; // Black
        return { board, bar: { W: 0, B: 0 }, off: { W: 0, B: 0 }, turn: 'W', dice: [] };
    }

    public rollDice(): number[] {
        this.state.dice = [Math.floor(Math.random() * 6) + 1, Math.floor(Math.random() * 6) + 1];
        if (this.state.dice[0] === this.state.dice[1]) this.state.dice = [...this.state.dice, ...this.state.dice];
        return this.state.dice;
    }

    public isValidMove(from: number, to: number): boolean {
        const player = this.state.turn;
        const count = this.state.board[from];

        // 1. Vérifier si le joueur a un pion à cet endroit
        if (player === 'W' && count <= 0) return false;
        if (player === 'B' && count >= 0) return false;

        // 2. Vérifier la direction (W: forward, B: backward)
        if (player === 'W' && to <= from) return false;
        if (player === 'B' && to >= from) return false;

        // 3. Vérifier la distance (doit correspondre à un dé)
        const distance = Math.abs(to - from);
        if (!this.state.dice.includes(distance)) return false;

        // 4. Vérifier la destination (Blot ou point ouvert)
        const targetCount = this.state.board[to];
        if (player === 'W' && targetCount < -1) return false; // Bloqué par Black
        if (player === 'B' && targetCount > 1) return false;  // Bloqué par White

        return true;
    }

    public move(from: number, to: number): boolean {
        if (!this.isValidMove(from, to)) return false;

        const player = this.state.turn;
        const distance = Math.abs(to - from);

        // Retirer le dé utilisé
        const diceIndex = this.state.dice.indexOf(distance);
        this.state.dice.splice(diceIndex, 1);

        // Gérer le "Hit"
        const targetCount = this.state.board[to];
        if (player === 'W' && targetCount === -1) {
            this.state.board[to] = 0;
            this.state.bar.B++;
        } else if (player === 'B' && targetCount === 1) {
            this.state.board[to] = 0;
            this.state.bar.W++;
        }

        // Effectuer le mouvement
        this.state.board[from] += (player === 'W' ? -1 : 1);
        this.state.board[to] += (player === 'W' ? 1 : -1);

        // Fin de tour si plus de dés
        if (this.state.dice.length === 0) {
            this.state.turn = this.state.turn === 'W' ? 'B' : 'W';
        }

        return true;
    }

    public getState(): GameState { return this.state; }
}