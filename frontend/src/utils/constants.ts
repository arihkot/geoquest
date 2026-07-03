export const SOROBAN_RPC_URL = import.meta.env.VITE_SOROBAN_RPC_URL || 'https://soroban-testnet.stellar.org';
export const NETWORK_PASSPHRASE = import.meta.env.VITE_NETWORK_PASSPHRASE || 'Test SDF Network ; September 2015';
export const NETWORK_NAME = import.meta.env.VITE_NETWORK_NAME || 'testnet';

export const CONTRACTS = {
  questRegistry: import.meta.env.VITE_QUEST_REGISTRY_CONTRACT || 'CDAXVUCN7A2PAOD6R6CXXRXZ5VVMEVMNLJUE6FWCD2ASZO7NDTMO5NOL',
  rewardToken: import.meta.env.VITE_REWARD_TOKEN_CONTRACT || 'CAFY4YVXRHJN67ZTK25WYKPCBXOYW5O5NRCRQ2IAEK2VPNLH3Q5H53KS',
  claimManager: import.meta.env.VITE_CLAIM_MANAGER_CONTRACT || 'CBDKLAQTC7RO7S5S4752GQK5DEJT4FDXBAW7VFSVEGOCJI45WDY5WCUE',
  impactVault: import.meta.env.VITE_IMPACT_VAULT_CONTRACT || 'CAZ67A6KY5MTSZCQ3P543VQXROJCGG5ZPOJ3GWYE5EXDNYYLYP34X46T',
  bountyEscrow: import.meta.env.VITE_BOUNTY_ESCROW_CONTRACT || 'CCO7DLICTIKE3MP7IBQ6TP5DFWGVDIWMS37B562SZLA6SGUGZ4NTYV7M',
};

export const VERIFICATION_API_URL = import.meta.env.VITE_VERIFICATION_API_URL || 'http://localhost:8787';

export const ADMIN_WALLETS = (import.meta.env.VITE_ADMIN_WALLETS || '').split(',').filter(Boolean);

export const STELLAR_EXPERT_TX_URL = (hash: string) =>
  `https://stellar.expert/explorer/${NETWORK_NAME === 'testnet' ? 'testnet/' : ''}tx/${hash}`;

export const DEFAULT_MAP_CENTER: [number, number] = [40.7128, -74.006];
export const DEFAULT_MAP_ZOOM = 13;
