import { ethers } from 'ethers';

const ESCROW_ABI = [
    "function createGame(bytes32 gameId, address player2, uint256 amount, address token) external",
    "function games(bytes32) view returns (address, address, uint256, address, bool)"
];

export class Web3Service {
    private provider: ethers.JsonRpcProvider;
    private contract: ethers.Contract;

    constructor(rpcUrl: string, contractAddress: string) {
        this.provider = new ethers.JsonRpcProvider(rpcUrl);
        this.contract = new ethers.Contract(contractAddress, ESCROW_ABI, this.provider);
    }

    async getGameDetails(gameId: string) {
        const game = await this.contract.games(ethers.id(gameId));
        return {
            player1: game[0],
            player2: game[1],
            betAmount: game[2],
            token: game[3],
            isActive: game[4]
        };
    }
}