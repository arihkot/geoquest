# GeoQuest Deployments

## Testnet Deployments (Stellar Testnet)

> **Note:** Contract addresses below are placeholders pending actual testnet deployment.
> Deploy contracts manually using `stellar contract deploy`, then update this file.

| Contract | Address | Deployed | Deploy Tx Hash |
|---|---|---|---|
| quest_registry | `C...` | TBD | [View on Stellar Expert](https://stellar.expert/explorer/testnet) |
| reward_token | `C...` | TBD | [View on Stellar Expert](https://stellar.expert/explorer/testnet) |
| claim_manager | `C...` | TBD | [View on Stellar Expert](https://stellar.expert/explorer/testnet) |
| impact_vault | `C...` | TBD | [View on Stellar Expert](https://stellar.expert/explorer/testnet) |
| bounty_escrow | `C...` | TBD | [View on Stellar Expert](https://stellar.expert/explorer/testnet) |

### Deployment Instructions

```bash
# Build all contracts
cd contracts
stellar contract build

# Deploy to testnet (example for quest_registry)
stellar contract deploy \
  --wasm target/wasm32v1-none/release/quest_registry.wasm \
  --source-account <admin-identity> \
  --network testnet \
  --alias quest_registry

# Repeat for each contract:
# reward_token, claim_manager, impact_vault, bounty_escrow
```

### Contract IDs for frontend

After deployment, update these environment variables in Cloudflare Pages:
- `VITE_QUEST_REGISTRY_CONTRACT`
- `VITE_REWARD_TOKEN_CONTRACT`
- `VITE_CLAIM_MANAGER_CONTRACT`
- `VITE_IMPACT_VAULT_CONTRACT`
- `VITE_BOUNTY_ESCROW_CONTRACT`

## Frontend Deployment

```bash
cd frontend
npm run build
wrangler pages deploy dist --project-name=geoquest
```

Deployed at: TBD (Cloudflare Pages URL)

## Verification Worker

```bash
cd worker
wrangler deploy
```

Deployed at: TBD (Cloudflare Workers URL)
