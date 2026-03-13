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
        board[23] = -2; board[12] = -5; board[7] = -3; board[5] = -5; // Black
        return { board, bar: { W: 0, B: 0 }, off: { W: 0, B: 0 }, turn: 'W', dice: [] };
    }

    public rollDice(): number[] {
        this.state.dice = [Math.floor(Math.random() * 6) + 1, Math.floor(Math.random() * 6) + 1];
        if (this.state.dice[0] === this.state.dice[1]) {
            this.state.dice = [this.state.dice[0], this.state.dice[0], this.state.dice[0], this.state.dice[0]];
        }
        return this.state.dice;
    }

    public canPlayerBearOff(player: Player): boolean {
        if (player === 'W') {
            if (this.state.bar.W > 0) return false;
            for (let i = 0; i < 18; i++) if (this.state.board[i] > 0) return false;
        } else {
            if (this.state.bar.B > 0) return false;
            for (let i = 6; i < 24; i++) if (this.state.board[i] < 0) return false;
        }
        return true;
    }

    public getPossibleMoves(): { from: number; to: number }[] {
        const moves: { from: number; to: number }[] = [];
        const player = this.state.turn;
        const dice = [...new Set(this.state.dice)]; // Uniques dés

        if (dice.length === 0) return [];

        // 1. Sortie du Bar (Priorité absolue)
        if (player === 'W' && this.state.bar.W > 0) {
            for (const die of dice) {
                const to = die - 1;
                if (this.state.board[to] >= -1) moves.push({ from: -1, to });
            }
            return moves;
        }
        if (player === 'B' && this.state.bar.B > 0) {
            for (const die of dice) {
                const to = 24 - die;
                if (this.state.board[to] <= 1) moves.push({ from: -1, to });
            }
            return moves;
        }

        // 2. Mouvements sur le plateau
        for (let i = 0; i < 24; i++) {
            if ((player === 'W' && this.state.board[i] > 0) || (player === 'B' && this.state.board[i] < 0)) {
                for (const die of dice) {
                    const to = player === 'W' ? i + die : i - die;
                    
                    // Bearing off
                    if ((player === 'W' && to >= 24) || (player === 'B' && to <= -1)) {
                        if (this.canPlayerBearOff(player)) {
                            // Règle simplifiée : sortie exacte ou supérieure si aucun pion derrière
                            moves.push({ from: i, to: player === 'W' ? 24 : -1 });
                        }
                        continue;
                    }

                    // Move standard
                    const target = this.state.board[to];
                    if (player === 'W' && target >= -1) moves.push({ from: i, to });
                    if (player === 'B' && target <= 1) moves.push({ from: i, to });
                }
            }
        }
        return moves;
    }

    public move(from: number, to: number): boolean {
        const player = this.state.turn;
        const distance = from === -1 
            ? (player === 'W' ? to + 1 : 24 - to) 
            : Math.abs(to - from);

        const diceIndex = this.state.dice.indexOf(distance);
        if (diceIndex === -1) return false;

        // Exécution
        if (from === -1) {
            if (player === 'W') this.state.bar.W--;
            else this.state.bar.B--;
        } else {
            this.state.board[from] += (player === 'W' ? -1 : 1);
        }

        if (to === 24 || to === -1) {
            if (player === 'W') this.state.off.W++;
            else this.state.off.B++;
        } else {
            const target = this.state.board[to];
            if (player === 'W' && target === -1) {
                this.state.board[to] = 0;
                this.state.bar.B++;
            } else if (player === 'B' && target === 1) {
                this.state.board[to] = 0;
                this.state.bar.W++;
            }
            this.state.board[to] += (player === 'W' ? 1 : -1);
        }

        this.state.dice.splice(diceIndex, 1);
        if (this.state.dice.length === 0) this.state.turn = this.state.turn === 'W' ? 'B' : 'W';
        return true;
    }

    public getState(): GameState { return this.state; }
}