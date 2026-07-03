import { CONTRACTS } from './constants';

export function shortenAddress(address: string): string {
  if (!address || address.length < 10) return address;
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

export function isValidStellarAddress(address: string): boolean {
  return /^G[A-Z2-7]{55}$/.test(address);
}

export function getContractAbi(contractName: keyof typeof CONTRACTS) {
  return CONTRACTS[contractName];
}

export function formatTokenAmount(amount: number, decimals: number = 7): string {
  return (amount / Math.pow(10, decimals)).toFixed(2);
}
