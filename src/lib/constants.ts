import { parseEther } from 'viem';

export const CONTRACT_ADDRESS: `0x${string}` = '0x18B2Ae4A7eDB05ECf19b5a9f07a814e150b8c6a0';
export const MINT_FEE = parseEther('0.001');

// RACE Betting Addresses
export const RACE_TOKEN_ADDRESS: `0x${string}` = '0x74e65556222A0C2c0adFc5C2dceFD15c98D67B07';
export const BETTING_CONTRACT_ADDRESS: `0x${string}` = '0x4c7bB4Ad690703FA9B51ae524C19066394a8fA52';

// Minimal ABIs
export const ERC20_ABI = [
  {"inputs": [{"internalType": "address","name": "spender","type": "address"},{"internalType": "uint256","name": "amount","type": "uint256"}],"name": "approve","outputs": [{"internalType": "bool","name": "","type": "bool"}],"stateMutability": "nonpayable","type": "function"},
  {"inputs": [{"internalType": "address","name": "account","type": "address"}],"name": "balanceOf","outputs": [{"internalType": "uint256","name": "","type": "uint256"}],"stateMutability": "view","type": "function"}
] as const;

export const BETTING_ABI = [
  {"inputs": [{"internalType": "uint256","name": "_raceId","type": "uint256"},{"internalType": "string","name": "_racerName","type": "string"},{"internalType": "uint256","name": "_amount","type": "uint256"}],"name": "placeBet","outputs": [],"stateMutability": "nonpayable","type": "function"}
] as const;
