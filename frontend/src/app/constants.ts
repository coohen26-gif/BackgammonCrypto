const ESCROW_ABI = [
  "function createGame(bytes32 gameId, address player2, uint256 amount, address token) external",
  "function games(bytes32) view returns (address, address, uint256, address, bool active, bool exists)",
  "event GameCreated(bytes32 indexed gameId, address player1, address player2, uint256 amount, address token)"
];

const USDT_ABI = [
  "function approve(address spender, uint256 amount) external returns (bool)",
  "function allowance(address owner, address spender) view returns (uint256)",
  "function balanceOf(address account) view returns (uint256)"
];

export { ESCROW_ABI, USDT_ABI };
