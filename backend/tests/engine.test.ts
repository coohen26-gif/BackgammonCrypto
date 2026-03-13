import { BackgammonEngine } from '../src/engine';

describe('Logic Moteur Backgammon', () => {
    let engine: BackgammonEngine;

    beforeEach(() => {
        engine = new BackgammonEngine();
    });

    test('Validation mouvement simple Blanc', () => {
        engine.rollDice();
        // On force les dés pour le test
        (engine as any).state.dice = [1, 2];
        // Position 0 a 2 pions blancs, on bouge vers 1
        expect(engine.isValidMove(0, 1)).toBe(true);
        expect(engine.isValidMove(0, 5)).toBe(false); // Trop loin
    });

    test('Gestion du Hit (manger un pion)', () => {
        (engine as any).state.dice = [1];
        (engine as any).state.board[1] = -1; // Un pion noir seul
        engine.move(0, 1);
        expect((engine as any).state.board[1]).toBe(1); // Blanc a pris la place
        expect((engine as any).state.bar.B).toBe(1); // Noir est au bar
    });
});
