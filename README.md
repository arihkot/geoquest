# GeoQuest

**Visit-to-Earn Eco-Tourism & Impact Bounties on Stellar**

GeoQuest is a phygital platform where users physically travel to real-world locations — parks, landmarks, eco-certified businesses — check in via geolocation-verified proof, and receive on-chain rewards. Rewards are yield-bearing local assets funded by municipal green bonds or tourism-board treasuries.

## Architecture

```
Frontend (React/Vite) ──→ Verification API (Cloudflare Worker) ──→ Soroban Contracts (Stellar Testnet)
       │                              │                                      │
  Cloudflare Pages              Edge computing                        On-chain settlement
```

### Deployed Contracts (Testnet)

| Contract | Address | Purpose |
|---|---|---|
| `quest_registry` | TBD | Quest CRUD, metadata storage |
| `reward_token` | TBD | GEO reward token (SAC-based) |
| `claim_manager` | TBD | Oracle attestation verification, double-claim prevention |
| `impact_vault` | TBD | Staking, yield distribution from treasury |
| `bounty_escrow` | TBD | Holds quest budgets, releases on valid claims |

See [DEPLOYMENTS.md](./DEPLOYMENTS.md) for addresses and deployment instructions.

## Quick Start

### Prerequisites

- Node.js 20+
- Rust with `wasm32v1-none` target
- [stellar-cli](https://github.com/stellar/stellar-cli)
- [Freighter Wallet](https://www.freighter.app/) browser extension
- Cloudflare account (for deployment)

### Frontend

```bash
cd frontend
npm install
npm run dev          # Start dev server
npm run test         # Run tests
npm run build        # Production build
```

### Contracts

```bash
cd contracts
cargo test --workspace        # Run all contract tests
stellar contract build         # Build WASM
```

### Worker

```bash
cd worker
npm install
wrangler dev                   # Start local dev server
wrangler deploy                # Deploy to Cloudflare
```

## Features

- **Freighter Wallet Connect** — Connect your Stellar wallet via browser extension
- **Quest Discovery** — Browse eco-friendly locations on an interactive map
- **GPS-Verified Check-In** — Prove physical presence at a location
- **On-Chain Rewards** — Receive GEO tokens instantly via Soroban smart contracts
- **Yield-Bearing Staking** — Stake GEO in the Impact Vault for yield from municipal treasuries
- **Admin Console** — Create quests, manage budgets, view on-chain analytics
- **Full Auditability** — Every reward traceable on Stellar Expert

## Testnet Demo Mode

This deployment targets **Stellar Testnet**. The project includes:

- **5 demo quests** (Riverside Park, Central Park, Brooklyn Bridge, Community Garden, Historic Landmark) with realistic reward budgets
- **UI-level demo transaction simulation** when contracts aren't connected
- A transparent **"Testnet Demo" banner** in the footer

## Testing

### Contracts (7 tests)
- `test_create_quest_success` — Quest creation with budget escrow
- `test_create_quest_unauthorized` — Authorization check
- `test_pause_quest` — Pause/resume lifecycle
- `test_top_up_budget` — Budget management
- `test_deduct_budget` — Budget deduction
- `test_record_claim_rejects_replay` — Double-claim prevention
- `test_record_claim_rejects_mismatched_attestation` — Attestation validation
- `test_stake_and_get_position` — Staking mechanics
- `test_stake_and_unstake` — Unstake flow
- `test_yield_distribution` — Yield distribution math
- `test_create_and_release` — Escrow release
- `test_pause_blocks_release` — Pause enforcement

### Frontend (6 tests)
- Wallet connect button renders correctly
- Quest list renders and shows rewards
- Geolocation distance calculation
- Geofence detection (within/outside)
- Admin-only routes are protected
- Token amount formatting

## Mobile Responsiveness

- Layout works from 360px to 1440px+ widths
- Collapsible map/bottom-sheet on mobile
- Touch targets ≥44px per WCAG guidelines
- Responsive breakpoints: 360px, 390px, 768px, 1024px, 1440px

## CI/CD

GitHub Actions workflows:
- **Frontend CI/CD**: lint → test → build → deploy to Cloudflare Pages
- **Contracts CI**: test → build (deployment is manual)

## Privacy

GeoQuest stores minimum necessary location data. Raw GPS traces are not persisted beyond what's needed for anti-fraud review. Location coordinates on-chain use geofence-level commitment hashes where possible. See the in-app privacy note.

## License

MIT
