# GeoQuest

**Visit-to-Earn Eco-Tourism & Impact Bounties on Stellar**

GeoQuest is a phygital platform where users physically travel to real-world locations — parks, landmarks, eco-certified businesses — check in via geolocation-verified proof, and receive on-chain rewards. Rewards are yield-bearing local assets funded by municipal green bonds or tourism-board treasuries.

## Deployed URL
https://geoquest-5al.pages.dev/

## Demo
<img width="1582" height="1035" alt="Screenshot 2026-07-04 at 12 46 18 PM" src="https://github.com/user-attachments/assets/bd2e1bad-1bd5-45c3-8293-5be8783626ff" />
<img width="1582" height="1035" alt="Screenshot 2026-07-04 at 12 46 08 PM" src="https://github.com/user-attachments/assets/26a88599-397d-4691-8d84-aaeffca3c8c6" />
<img width="1582" height="1035" alt="Screenshot 2026-07-04 at 12 45 58 PM" src="https://github.com/user-attachments/assets/fc585bbd-bdbd-41c0-9a7a-2479685015d4" />
<img width="1582" height="1035" alt="Screenshot 2026-07-04 at 12 45 34 PM" src="https://github.com/user-attachments/assets/3edaf80f-c507-46b1-a9a4-245a61f7d727" />
<img width="472" height="744" alt="Screenshot 2026-07-04 at 12 45 08 PM" src="https://github.com/user-attachments/assets/311e0fc5-14c3-427e-bf2f-f248cba0d830" />
<img width="1582" height="1035" alt="Screenshot 2026-07-04 at 12 44 41 PM" src="https://github.com/user-attachments/assets/33ebbd96-d4cc-47d6-8991-e397a10b25b8" />

## Mobile Responsive
<img width="337" height="725" alt="Screenshot 2026-07-04 at 12 51 10 PM" src="https://github.com/user-attachments/assets/841c65de-de4f-4ff5-8450-4acc3c98098d" />
<img width="337" height="725" alt="Screenshot 2026-07-04 at 12 51 04 PM" src="https://github.com/user-attachments/assets/66d12228-a7d3-4967-9721-face4e384a0a" />
<img width="337" height="725" alt="Screenshot 2026-07-04 at 12 50 57 PM" src="https://github.com/user-attachments/assets/0e97b82e-6f0f-4425-b4e6-63449cc6f409" />
<img width="337" height="725" alt="Screenshot 2026-07-04 at 12 50 45 PM" src="https://github.com/user-attachments/assets/1fb48a52-8c72-4fd7-b678-caba88cb0db0" />
<img width="337" height="725" alt="Screenshot 2026-07-04 at 12 50 37 PM" src="https://github.com/user-attachments/assets/32b85f84-01a5-41b9-ad29-bb9d582d8750" />

## Demo Video
https://drive.google.com/file/d/1-0Zz936myHK5V8nY1-0LuUpi72w-tQ5q/view?usp=sharing

## CI/CD
<img width="1582" height="1035" alt="Screenshot 2026-07-04 at 12 59 12 PM" src="https://github.com/user-attachments/assets/177ff890-4074-4e48-84cb-ceb158b4eccf" />

## Tests
<img width="445" height="352" alt="image" src="https://github.com/user-attachments/assets/90e9b9c3-0fa4-4a89-9052-13fd36ea4d31" />

## Feedback Form
https://docs.google.com/forms/d/e/1FAIpQLSdlWq1o723XapPdiOq9h1viVGqY-x-c7yRv9ntwJrZpYq7sEg/viewform?usp=publish-editor

## Feedback Responses
https://docs.google.com/spreadsheets/d/1Rk1Y8P_xq9-qSYhwaq-YUSMxRH7gw3XF-LJf1OIm2EY/edit?usp=sharing

## Pitch Deck
https://drive.google.com/file/d/12xZ7UQlibDpvYiNCD6OzOfGS9O1mi3_t/view?usp=sharing

## Architecture

```
Frontend (React/Vite) ──→ Verification API (Cloudflare Worker) ──→ Soroban Contracts (Stellar Testnet)
       │                              │                                      │
  Cloudflare Pages              Edge computing                        On-chain settlement
```

### Deployed Contracts (Testnet)

| Contract | Address | 
|---|---|
| `quest_registry` | [`CDAXVU...MO5NOL`](https://stellar.expert/explorer/testnet/contract/CDAXVUCN7A2PAOD6R6CXXRXZ5VVMEVMNLJUE6FWCD2ASZO7NDTMO5NOL) |
| `reward_token` | [`CAFY4Y...5H53KS`](https://stellar.expert/explorer/testnet/contract/CAFY4YVXRHJN67ZTK25WYKPCBXOYW5O5NRCRQ2IAEK2VPNLH3Q5H53KS) |
| `claim_manager` | [`CBDKLA...WDY5WCUE`](https://stellar.expert/explorer/testnet/contract/CBDKLAQTC7RO7S5S4752GQK5DEJT4FDXBAW7VFSVEGOCJI45WDY5WCUE) |
| `impact_vault` | [`CAZ67A...LYP34X46T`](https://stellar.expert/explorer/testnet/contract/CAZ67A6KY5MTSZCQ3P543VQXROJCGG5ZPOJ3GWYE5EXDNYYLYP34X46T) |
| `bounty_escrow` | [`CCO7DL...4NTYV7M`](https://stellar.expert/explorer/testnet/contract/CCO7DLICTIKE3MP7IBQ6TP5DFWGVDIWMS37B562SZLA6SGUGZ4NTYV7M) |

**Live testnet activity:**
- [Mint 100 GEO](https://stellar.expert/explorer/testnet/tx/0ff491ba89d0c90d152c7000aeee3f8e4ccb6a9b25613db7112056f2958269ec)
- [Stake 50 GEO](https://stellar.expert/explorer/testnet/tx/68b4098841e602ce947a61e83d568427a82a9ed0d6f20346d522ad94d1fbb907)
- [Create Quest #0](https://stellar.expert/explorer/testnet/tx/2c3ff60ed6a87fa9e4f41d7bf20d4e35d4036e15fa6a77a30fdb63c82839ad6a)

Full deployment details in [DEPLOYMENTS.md](./DEPLOYMENTS.md).

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
