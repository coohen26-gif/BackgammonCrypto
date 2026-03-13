// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title BackgammonSaxeEscrow
 * @dev Escrow contract for high-stakes Backgammon.
 * Features: Multi-token support, 5% fee, automated resolution.
 */
contract BackgammonSaxeEscrow is ReentrancyGuard, Ownable {
    uint256 public constant COMMISSION_RATE = 5; // 5%
    address public treasury;

    struct Game {
        address playerW;
        address playerB;
        uint256 stake;
        address token;
        bool active;
    }

    mapping(bytes32 => Game) public games;

    event GameStarted(bytes32 indexed gameId, address playerW, address playerB, uint256 stake, address token);
    event GameWon(bytes32 indexed gameId, address winner, uint256 amount);

    constructor(address _treasury) {
        treasury = _treasury;
    }

    function startGame(bytes32 gameId, address opponent, uint256 amount, address token) external nonReentrant {
        require(!games[gameId].active, "Game already active");
        IERC20(token).transferFrom(msg.sender, address(this), amount);
        games[gameId] = Game(msg.sender, opponent, amount, token, true);
        emit GameStarted(gameId, msg.sender, opponent, amount, token);
    }

    function finalizeGame(bytes32 gameId, address winner) external onlyOwner nonReentrant {
        Game storage game = games[gameId];
        require(game.active, "Game not found");
        
        uint256 total = game.stake * 2;
        uint256 fee = (total * COMMISSION_RATE) / 100;
        uint256 payout = total - fee;

        game.active = false;
        IERC20(game.token).transfer(treasury, fee);
        IERC20(game.token).transfer(winner, payout);

        emit GameWon(gameId, winner, payout);
    }

    function setTreasury(address _treasury) external onlyOwner {
        treasury = _treasury;
    }
}
