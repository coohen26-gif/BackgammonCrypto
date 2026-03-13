// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

/**
 * @title BackgammonBetting
 * @dev Gère les paris USDT/USDC pour les parties de Backgammon.
 */
contract BackgammonBetting {
    address public owner;
    
    struct Game {
        address player1;
        address player2;
        uint256 betAmount;
        address tokenAddress; // USDT or USDC
        bool isActive;
        address winner;
    }

    mapping(bytes32 => Game) public games;

    constructor() {
        owner = msg.sender;
    }

    // TODO: Implémenter le dépôt (stake), le retrait (claim) et l'arbitrage
}
