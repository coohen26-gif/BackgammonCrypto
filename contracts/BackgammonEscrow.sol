// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

/**
 * @title BackgammonEscrow
 * @dev Gère les paris et la distribution des gains (commission 5%).
 */
contract BackgammonEscrow {
    address public owner;
    uint256 public commissionRate = 5; // 5%

    struct Game {
        address player1;
        address player2;
        uint256 betAmount;
        address token;
        bool active;
    }

    mapping(bytes32 => Game) public games;

    constructor() {
        owner = msg.sender;
    }

    function createGame(bytes32 gameId, address player2, uint256 amount, address token) external {
        IERC20(token).transferFrom(msg.sender, address(this), amount);
        games[gameId] = Game(msg.sender, player2, amount, token, true);
    }

    // TODO: Implémenter la validation du gagnant par un oracle ou multisig
}
