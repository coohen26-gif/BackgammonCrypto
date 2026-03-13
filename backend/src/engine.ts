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
        // Indices 0-23
        // Blanc (W) : se déplace de 0 vers 23
        // Noir (B) : se déplace de 23 vers 0
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
        // Un joueur peut sortir ses pions si tous ses pions sont dans son dernier quadrant (Home Board)
        // Blanc (0->23) : Home Board = 18-23
        // Noir (23->0) : Home Board = 0-5
        if (player === 'W') {
            if (this.state.bar.W > 0) return false;
            for (let i = 0; i < 18; i++) if (this.state.board[i] > 0) return false;
        } else {
            if (this.state.bar.B > 0) return false;
            for (let i = 6; i < 24; i++) if (this.state.board[i] < 0) return false;
        }
        return true;
    }

    public isValidMove(from: number, to: number): boolean {
        const player = this.state.turn;
        const count = this.state.board[from];

        // 1. Gestion du Bar (pions mangés doivent sortir en premier)
        if (player === 'W' && this.state.bar.W > 0 && from !== -1) return false;
        if (player === 'B' && this.state.bar.B > 0 && from !== -1) return false;

        // 2. Vérifier la possession
        if (from !== -1) {
            if (player === 'W' && count <= 0) return false;
            if (player === 'B' && count >= 0) return false;
        }

        // 3. Sortie de plateau (Bearing Off)
        if (to === 24 || to === -1) {
            return this.canPlayerBearOff(player);
        }

        // 4. Destination bloquée
        const targetCount = this.state.board[to];
        if (player === 'W' && targetCount < -1) return false; // Bloqué par Black (>=2 pions)
        if (player === 'B' && targetCount > 1) return false;  // Bloqué par White (>=2 pions)

        return true;
    }

    public move(from: number, to: number): boolean {
        if (!this.isValidMove(from, to)) return false;

        const player = this.state.turn;
        const distance = from === -1 ? (player === 'W' ? to + 1 : 24 - to) : Math.abs(to - from);

        // Retirer le dé utilisé
        const diceIndex = this.state.dice.indexOf(distance);
        if (diceIndex === -1) return false; // Ne devrait pas arriver si isValidMove est strict
        this.state.dice.splice(diceIndex, 1);

        // Exécution du mouvement
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
            // Gestion du Hit
            const targetCount = this.state.board[to];
            if (player === 'W' && targetCount === -1) {
                this.state.board[to] = 0;
                this.state.bar.B++;
            } else if (player === 'B' && targetCount === 1) {
                this.state.board[to] = 0;
                this.state.bar.W++;
            }
            this.state.board[to] += (player === 'W' ? 1 : -1);
        }

        // Changement de tour
        if (this.state.dice.length === 0) {
            this.state.turn = this.state.turn === 'W' ? 'B' : 'W';
        }

        return true;
    }

    public getPossibleMoves(): { from: number; to: number }[] {
        const moves: { from: number; to: number }[] = [];
        const player = this.state.turn;
        
        // Gérer le bar d'abord
        if (player === 'W' && this.state.bar.W > 0) {
            for (const die of this.state.dice) {
                if (this.isValidMove(-1, die - 1)) moves.push({ from: -1, to: die - 1 });
            }
            return moves;
        }
        if (player === 'B' && this.state.bar.B > 0) {
            for (const die of this.state.dice) {
                if (this.isValidMove(-1, 24 - die)) moves.push({ from: -1, to: 24 - die });
            }
            return moves;
        }

        // Parcourir le board
        for (let i = 0; i < 24; i++) {
            if ((player === 'W' && this.state.board[i] > 0) || (player === 'B' && this.state.board[i] < 0)) {
                for (const die of this.state.dice) {
                    const to = player === 'W' ? i + die : i - die;
                    if (this.isValidMove(i, to)) moves.push({ from: i, to });
                }
            }
        }
        return moves;
    }
