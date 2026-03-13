// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title BackgammonSaxeEscrow
 * @dev Escrow contract for high-stakes Backgammon.
 * Features: Multi-token support, 5% fee, automated resolution.
 * V2: Added safe emergency withdrawals and game refund logic.
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
        bool playerWStaked;
        bool playerBStaked;
    }

    mapping(bytes32 => Game) public games;
    mapping(address => bool) public allowedTokens;

    event GameStarted(bytes32 indexed gameId, address playerW, address playerB, uint256 stake, address token);
    event PlayerStaked(bytes32 indexed gameId, address player, uint256 amount);
    event GameWon(bytes32 indexed gameId, address winner, uint256 amount);
    event GameRefunded(bytes32 indexed gameId, address playerW, address playerB, uint256 amount);

    constructor(address _treasury) {
        treasury = _treasury;
    }

    function setTokenStatus(address token, bool status) external onlyOwner {
        allowedTokens[token] = status;
    }

    function createGame(bytes32 gameId, address playerB, uint256 stake, address token) external onlyOwner {
        require(!games[gameId].active, "Game already active");
        require(allowedTokens[token], "Token not allowed");
        games[gameId] = Game(address(0), playerB, stake, token, true, false, false);
    }

    function stake(bytes32 gameId) external nonReentrant {
        Game storage game = games[gameId];
        require(game.active, "Game not active");
        require(msg.sender == game.playerW || msg.sender == game.playerB || game.playerW == address(0), "Not authorized");
        
        if (game.playerW == address(0) && msg.sender != game.playerB) {
            game.playerW = msg.sender;
        }

        if (msg.sender == game.playerW) {
            require(!game.playerWStaked, "Already staked");
            game.playerWStaked = true;
        } else {
            require(!game.playerBStaked, "Already staked");
            game.playerBStaked = true;
        }

        IERC20(game.token).transferFrom(msg.sender, address(this), game.stake);
        emit PlayerStaked(gameId, msg.sender, game.stake);

        if (game.playerWStaked && game.playerBStaked) {
            emit GameStarted(gameId, game.playerW, game.playerB, game.stake, game.token);
        }
    }

    function finalizeGame(bytes32 gameId, address winner) external onlyOwner nonReentrant {
        Game storage game = games[gameId];
        require(game.active, "Game not active");
        require(game.playerWStaked && game.playerBStaked, "Not fully staked");
        require(winner == game.playerW || winner == game.playerB, "Invalid winner");
        
        uint256 total = game.stake * 2;
        uint256 fee = (total * COMMISSION_RATE) / 100;
        uint256 payout = total - fee;

        game.active = false;
        IERC20(game.token).transfer(treasury, fee);
        IERC20(game.token).transfer(winner, payout);

        emit GameWon(gameId, winner, payout);
    }

    function refundGame(bytes32 gameId) external onlyOwner nonReentrant {
        Game storage game = games[gameId];
        require(game.active, "Game not active");
        game.active = false;
        
        if (game.playerWStaked) {
            IERC20(game.token).transfer(game.playerW, game.stake);
        }
        if (game.playerBStaked) {
            IERC20(game.token).transfer(game.playerB, game.stake);
        }
        emit GameRefunded(gameId, game.playerW, game.playerB, game.stake);
    }

    function setTreasury(address _treasury) external onlyOwner {
        treasury = _treasury;
    }
}
