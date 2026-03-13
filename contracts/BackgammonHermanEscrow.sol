// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title BackgammonHermanEscrow
 * @dev Escrow de luxe pour Backgammon Crypto avec commission de 5%.
 */
contract BackgammonHermanEscrow is ReentrancyGuard, Ownable {
    uint256 public constant COMMISSION_RATE = 5; // 5%
    address public treasury;

    struct Game {
        address player1;
        address player2;
        uint256 betAmount;
        address token;
        bool active;
        bool exists;
    }

    mapping(bytes32 => Game) public games;

    event GameCreated(bytes32 indexed gameId, address player1, address player2, uint256 amount, address token);
    event GameResolved(bytes32 indexed gameId, address winner, uint256 amount);
    event GameCancelled(bytes32 indexed gameId);

    constructor(address _treasury) {
        treasury = _treasury;
    }

    function createGame(bytes32 gameId, address player2, uint256 amount, address token) external nonReentrant {
        require(!games[gameId].exists, "Game ID already exists");
        require(amount > 0, "Bet must be > 0");
        
        IERC20(token).transferFrom(msg.sender, address(this), amount);
        
        games[gameId] = Game({
            player1: msg.sender,
            player2: player2,
            betAmount: amount,
            token: token,
            active: true,
            exists: true
        });

        emit GameCreated(gameId, msg.sender, player2, amount, token);
    }

    function resolveGame(bytes32 gameId, address winner) external onlyOwner nonReentrant {
        Game storage game = games[gameId];
        require(game.active, "Game not active");
        require(winner == game.player1 || winner == game.player2, "Invalid winner");

        uint256 totalPot = game.betAmount * 2;
        uint256 commission = (totalPot * COMMISSION_RATE) / 100;
        uint256 winnerAmount = totalPot - commission;

        game.active = false;

        IERC20(game.token).transfer(treasury, commission);
        IERC20(game.token).transfer(winner, winnerAmount);

        emit GameResolved(gameId, winner, winnerAmount);
    }

    function setTreasury(address _treasury) external onlyOwner {
        treasury = _treasury;
    }
}
