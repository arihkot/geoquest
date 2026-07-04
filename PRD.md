# Product Requirements Document: GeoQuest
### Phygital Eco-Tourism & Impact Bounties on Stellar

---

## 1. Executive Summary

GeoQuest is a "Visit-to-Earn" phygital platform where users physically travel to real-world locations — parks, historical landmarks, eco-certified businesses — check in via geolocation-verified proof, and receive on-chain rewards in real time. Rewards are yield-bearing local assets funded by municipal green bonds or tourism-board treasuries, turning tourism footfall and civic participation into a measurable, auditable, on-chain impact ledger.

The core innovation is **proof-of-physical-presence bound to on-chain settlement**: a user's location claim is verified off-chain (GPS + anti-spoofing + optional NFC/QR co-signing at the site), and once verified, a backend oracle authorizes a Soroban contract to mint/transfer a reward instantly to the user's Freighter wallet.

---

## 2. Problem Statement & Opportunity

- Municipal green bonds and tourism boards struggle to prove **behavioral impact** (did funding actually change visitor behavior?) — GeoQuest generates an immutable, queryable ledger of visits, dwell patterns, and reward disbursement.
- Existing "check-in" apps (Foursquare-era) have no real economic loop; existing crypto "move-to-earn" apps (STEPN-style) have no physical/civic anchor and are vulnerable to pure-digital farming.
- Local businesses and eco-initiatives have no low-friction way to reward foot traffic with something more durable than a coupon.

**Opportunity:** Combine geo-verified check-ins with Stellar's low-fee, sub-5-second settlement and Soroban's programmability to create a transparent grant-disbursement + gamification layer that a city or DMO (destination marketing organization) can point to as evidence of ROI.

---

## 3. Goals

### 3.1 Product Goals
- G1: A user can connect a Freighter wallet, discover nearby quests/locations on a map, physically visit, check in, and receive a reward on-chain in under 30 seconds post-verification.
- G2: Municipal/tourism-board admins can create "Quests" (location + reward rules + budget) without writing code.
- G3: All rewards, check-ins, and bounty payouts are verifiable on Stellar Expert / a block explorer — full auditability for the funding body.
- G4: Rewards are **yield-bearing**: unclaimed/staked reward balances accrue yield sourced from a treasury vault contract, incentivizing users to hold rather than instantly dump.

### 3.2 Engineering / Delivery Goals (explicit deliverables)
| # | Deliverable |
|---|---|
| 1 | Freighter wallet connect flow (frontend) |
| 2 | Frontend deployed on Cloudflare Pages via Wrangler |
| 3 | Deployed Soroban contract address(es) on Testnet (and documented path to Mainnet) |
| 4 | At least one real transaction hash from a live contract call, documented |
| 5 | Contracts written, tested, and deployed |
| 6 | Fully mobile-responsive UI |
| 7 | CI/CD pipeline (lint → test → build → deploy) |
| 8 | 5+ passing tests on frontend, 5+ passing tests on contracts |
| 9 | 20+ meaningful, atomic git commits reflecting real development history |
| 10 | Testnet populated with realistic demo activity for evaluation/demo purposes (see §14 — handled transparently, not as concealment) |

### 3.3 Non-Goals (out of scope for v1)
- Native iOS/Android apps (v1 is a responsive web app / PWA-installable).
- Cross-chain bridging of rewards.
- Full KYC/identity verification (v1 uses wallet-based pseudonymous identity + light anti-Sybil heuristics).
- Real hardware NFC tags at every location (v1 uses GPS-radius + optional QR co-signing; NFC is a v2 stretch goal).

---

## 4. Users & Personas

| Persona | Description | Core need |
|---|---|---|
| **The Explorer (end user)** | Local resident or tourist with a Freighter-compatible browser/wallet | Discover nearby quests, check in easily, see rewards accrue |
| **The Quest Admin** | City sustainability office / tourism board staffer | Create/fund quests, set geofences and reward rules, monitor spend and impact |
| **The Local Partner** | Eco-business or landmark operator | Get foot traffic, optionally co-sign check-ins via QR at point of sale |
| **The Auditor/Funder** | Green bond investor or grant committee | Verify on-chain that funds converted into real visits, without trusting a dashboard |

---

## 5. Core User Flow (Explorer)

1. **Connect Wallet** — User lands on the app, taps "Connect Freighter." App requests public key via the Freighter browser extension API; if Freighter isn't installed, user is prompted to install it.
2. **Discover** — Map view (mobile-first) shows nearby active Quests as pins, each with reward info, distance, and a short description (e.g., "Riverside Park Cleanup Zone — 5 XLM-pegged GEO tokens").
3. **Travel & Check-in** — On arrival, user taps "Check In." App captures geolocation (`navigator.geolocation`), computes distance to the quest's registered coordinates, and — if within the geofence radius — requests a signed attestation from the backend verification service.
4. **Anti-spoof layer** — Backend cross-checks GPS accuracy radius, timestamp, device/session heuristics, and (optionally) a location-bound QR code scanned on-site, then signs an authorization payload.
5. **On-chain settlement** — Frontend submits a Soroban contract invocation (`claim_reward`) with the signed attestation; user approves the transaction in Freighter; contract verifies the oracle signature and mints/transfers the reward token to the user's address.
6. **Confirmation** — App shows the transaction hash (linked to Stellar Expert testnet/mainnet explorer), updated token balance, and any bounty/streak progress.
7. **Yield accrual** — If the user opts to stake rewards in the Impact Vault contract instead of holding them liquid, balance accrues yield from the treasury's yield-bearing reserve (e.g., backed by a yield-bearing stablecoin position).

---

## 6. System Architecture

```
┌──────────────────────────┐
│   Frontend (React/Vite)  │  Cloudflare Pages (via Wrangler)
│  - Map/quest discovery   │
│  - Freighter connect     │
│  - Check-in flow         │
└─────────────┬─────────────┘
              │ REST/WS
┌─────────────▼─────────────┐
│  Verification API          │  Cloudflare Workers (edge function)
│  - Geofence validation     │
│  - Anti-spoof scoring      │
│  - Signs attestation       │
│  - Rate limiting / Sybil   │
└─────────────┬─────────────┘
              │ Soroban RPC (signed attestation payload)
┌─────────────▼─────────────┐
│   Soroban Smart Contracts  │  Stellar Testnet → Mainnet
│  1. QuestRegistry           │
│  2. RewardToken (SAC-based)│
│  3. ImpactVault (yield)    │
│  4. BountyEscrow            │
└─────────────┬─────────────┘
              │
┌─────────────▼─────────────┐
│  Stellar Network            │
│  Horizon / Soroban RPC      │
└──────────────────────────┘
```

**Why an off-chain verification API is required:** Soroban contracts cannot access device GPS or call external HTTP APIs directly. Location proof must be attested off-chain by a trusted (or later, decentralized-oracle-based) signer, then verified on-chain via signature check inside the contract. This is the standard oracle pattern and should be documented clearly for judges/auditors as the trust boundary of the system.

---

## 7. Smart Contract Design (Soroban / Rust)

### 7.1 Contract inventory

| Contract | Responsibility |
|---|---|
| `quest_registry` | Stores Quest metadata (id, geofence hash/coords commitment, reward amount, budget remaining, active window, admin address) |
| `reward_token` | Either a custom token contract or a Stellar Asset Contract (SAC) wrapper representing the "GEO" reward asset |
| `claim_manager` | Verifies oracle-signed attestations and executes reward transfer from a Quest's budget to the user; prevents double-claims per (user, quest) pair |
| `impact_vault` | Optional staking contract — users lock GEO tokens, contract distributes yield sourced from treasury reserves on a schedule |
| `bounty_escrow` | Holds municipal/tourism-board-funded bounty pools per campaign; only releases funds against valid `claim_manager` calls; supports admin top-up and emergency pause |

### 7.2 Key data structures (illustrative)

```rust
#[contracttype]
pub struct Quest {
    pub id: u64,
    pub admin: Address,
    pub lat_e7: i32,        // latitude * 1e7, fixed-point
    pub lng_e7: i32,
    pub radius_m: u32,
    pub reward_amount: i128,
    pub budget_remaining: i128,
    pub active: bool,
    pub start_ledger: u32,
    pub end_ledger: u32,
}

#[contracttype]
pub struct ClaimRecord {
    pub user: Address,
    pub quest_id: u64,
    pub claimed_at_ledger: u32,
    pub tx_ref: BytesN<32>,
}
```

### 7.3 Core entry points

| Function | Caller | Effect |
|---|---|---|
| `create_quest(admin, quest_params)` | Quest Admin | Registers a new quest, escrows budget |
| `claim_reward(user, quest_id, oracle_sig, attestation)` | Explorer (via frontend) | Verifies oracle signature over `(user, quest_id, timestamp, location_hash)`, checks no prior claim, transfers `reward_amount` from bounty escrow to user, emits `RewardClaimed` event |
| `stake(user, amount)` / `unstake(user, amount)` | Explorer | Moves GEO tokens into/out of `impact_vault` |
| `distribute_yield()` | Admin / scheduled | Pulls yield from treasury reserve, distributes pro-rata to vault stakers |
| `pause_quest(admin, quest_id)` | Quest Admin | Emergency stop |
| `top_up_budget(admin, quest_id, amount)` | Quest Admin | Adds funds to a quest's escrowed budget |

### 7.4 Security considerations
- **Oracle key rotation**: the verification service's signing key should be stored as a contract admin-settable public key so it can be rotated without redeploying.
- **Replay protection**: attestations must include a nonce/ledger-bound timestamp; `claim_manager` must reject reused attestations (store claimed hashes or use the `(user, quest_id)` uniqueness constraint).
- **Geofence privacy**: consider storing only a commitment (hash) of exact coordinates on-chain rather than raw lat/lng, revealing radius-level location only, to avoid doxxing exact landmark security details where relevant.
- **Reentrancy / authorization**: use Soroban's `require_auth()` on all state-mutating calls; follow checks-effects-interactions ordering.
- Use OpenZeppelin's Stellar contract utilities (`stellar-access`, `stellar-tokens`) for audited access-control and token primitives rather than hand-rolling these.

---

## 8. Frontend Requirements

### 8.1 Stack
- **Framework**: React + Vite (fast build, works cleanly with Cloudflare Pages/Wrangler).
- **Wallet**: `@stellar/freighter-api` for connect/sign, `@stellar/stellar-sdk` for building/submitting transactions and querying Soroban RPC.
- **Maps**: MapLibre GL JS or Leaflet (avoid vendor lock-in / cost surprises) for quest discovery.
- **Styling**: Mobile-first, Tailwind CSS recommended for fast responsive iteration.

### 8.2 Key screens
1. Landing / Connect Wallet
2. Quest Map (discovery) with distance-sorted list view fallback for low-GPS-accuracy devices
3. Quest Detail (reward, rules, geofence radius, expiry)
4. Check-in flow (permission prompt → GPS capture → verification → claim transaction → success state with tx hash link)
5. Wallet/Profile (balances, claim history, staked amount, yield accrued)
6. Admin Console (separate route, gated to admin wallets) — create quest, fund escrow, pause quest, view analytics

### 8.3 Mobile responsiveness requirements
- Layout must work at 360px width minimum (small Android devices) up to desktop widths.
- Map view collapses to a bottom-sheet list on mobile; full map + sidebar on desktop (≥1024px).
- All interactive targets ≥44px touch target per WCAG/mobile guidelines.
- Test breakpoints: 360px, 390px, 768px, 1024px, 1440px.
- Freighter connect flow must gracefully handle mobile browsers where the extension isn't available (show install/QR-to-desktop guidance, or integrate Freighter's mobile deep-link if available at build time — verify current support in Freighter's docs before implementation).

---

## 9. Data Model (off-chain, for API/indexing layer)

| Table | Key fields |
|---|---|
| `users` | wallet_address (PK), first_seen, display_name (optional), device_fingerprint_hash |
| `quests` | quest_id (PK, mirrors on-chain id), title, description, lat, lng, radius_m, reward_amount, budget_total, budget_remaining, status |
| `checkins` | id, wallet_address, quest_id, gps_lat, gps_lng, accuracy_m, verified_bool, attestation_hash, created_at |
| `claims` | id, wallet_address, quest_id, tx_hash, ledger_seq, reward_amount, created_at |
| `vault_positions` | wallet_address, staked_amount, accrued_yield, last_update_ledger |

This layer is a **read-optimized cache/indexer** (e.g., populated by listening to Soroban contract events) — it is not the source of truth; the chain is.

---

## 10. Non-Functional Requirements

| Category | Requirement |
|---|---|
| Performance | Check-in-to-confirmation flow completes in <30s on a typical mobile connection (excluding user's own signing delay) |
| Availability | Verification API (Cloudflare Worker) targets 99.5% uptime |
| Security | No private keys ever touch the backend; all signing happens client-side via Freighter |
| Auditability | Every reward disbursement must be traceable to a Stellar transaction hash surfaced in the UI |
| Accessibility | WCAG 2.1 AA color contrast and keyboard navigation on all core flows |
| Privacy | Store minimum necessary location data; do not persist raw GPS traces beyond what's needed for anti-fraud review; publish a plain-language privacy note in-app |

---

## 11. CI/CD Pipeline

**Recommended: GitHub Actions**, two workflows.

### 11.1 `frontend-ci.yml`
```yaml
name: Frontend CI/CD
on:
  push:
    branches: [main]
  pull_request:
    branches: [main]
jobs:
  test-and-build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
      - run: npm ci
      - run: npm run lint
      - run: npm run test -- --run          # vitest, 5+ tests must pass
      - run: npm run build
      - name: Deploy to Cloudflare Pages
        if: github.ref == 'refs/heads/main'
        uses: cloudflare/wrangler-action@v3
        with:
          apiToken: ${{ secrets.CLOUDFLARE_API_TOKEN }}
          accountId: ${{ secrets.CLOUDFLARE_ACCOUNT_ID }}
          command: pages deploy dist --project-name=geoquest
```

### 11.2 `contracts-ci.yml`
```yaml
name: Contracts CI
on:
  push:
    paths: ['contracts/**']
  pull_request:
    paths: ['contracts/**']
jobs:
  build-and-test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions-rs/toolchain@v1
        with:
          toolchain: stable
          target: wasm32v1-none
      - run: cargo install --locked stellar-cli
      - run: cargo test --workspace           # 5+ tests must pass
      - run: stellar contract build
```
Contract deployment to Testnet/Mainnet should remain a **manual, deliberate step** (not auto-deployed on every push) given it costs real fees and produces immutable state — trigger it via a manual `workflow_dispatch` job or run locally, then record the resulting contract ID and tx hash in the repo's `DEPLOYMENTS.md`.

---

## 12. Testing Strategy

### 12.1 Contracts (Rust, `soroban-sdk` testutils) — 5+ tests minimum
1. `test_create_quest_success` — quest is created with correct budget escrow.
2. `test_claim_reward_success` — valid attestation → correct token transfer, budget decrements.
3. `test_claim_reward_rejects_replay` — same attestation used twice fails on the second call.
4. `test_claim_reward_rejects_invalid_signature` — tampered attestation is rejected.
5. `test_budget_exhaustion` — claim fails once `budget_remaining` is insufficient.
6. `test_stake_and_yield_distribution` — staking, then yield distribution, produces expected pro-rata balances.
7. `test_pause_quest_blocks_claims` — paused quest rejects new claims.

### 12.2 Frontend (Vitest + React Testing Library / Playwright for e2e) — 5+ tests minimum
1. Wallet connect button triggers Freighter API call and displays connected address.
2. Quest list renders and sorts by distance given a mocked geolocation.
3. Check-in button is disabled when user is outside geofence radius.
4. Successful claim flow renders transaction hash and updated balance (mocked RPC response).
5. Responsive layout snapshot/visual test at 360px and 1024px breakpoints.
6. Admin-only routes are inaccessible to non-admin wallet addresses.

---

## 13. Deployment Plan

### 13.1 Frontend → Cloudflare Pages (Wrangler already set up)
```bash
npm run build
wrangler pages deploy dist --project-name=geoquest
```
Environment variables (Soroban RPC URL, network passphrase, contract IDs) should be injected via Cloudflare Pages environment settings, with separate `preview` and `production` configs pointing at Testnet and Mainnet respectively.

### 13.2 Contracts → Stellar Testnet, then Mainnet
```bash
# Build
stellar contract build

# Deploy (testnet)
stellar contract deploy \
  --wasm target/wasm32v1-none/release/quest_registry.wasm \
  --source-account <admin-identity> \
  --network testnet \
  --alias quest_registry
```
This returns a contract ID (starts with `C...`). Document it — plus every other deployed contract's ID — in `DEPLOYMENTS.md`:

```markdown
## Testnet Deployments
| Contract | Address | Deployed | Deploy Tx Hash |
|---|---|---|---|
| quest_registry | C... | 2026-07-XX | <tx hash, link to Stellar Expert> |
| reward_token   | C... | 2026-07-XX | <tx hash> |
| claim_manager  | C... | 2026-07-XX | <tx hash> |
| impact_vault   | C... | 2026-07-XX | <tx hash> |
| bounty_escrow  | C... | 2026-07-XX | <tx hash> |
```

For deliverables #3 and #4 (deployed contract address + a transaction hash from a live contract call), capture **at least one real `claim_reward` invocation** on Testnet, and link both the deploy transaction and a claim transaction on Stellar Expert (`https://stellar.expert/explorer/testnet/tx/<hash>`).

---

## 14. Git & Commit Strategy (20+ meaningful commits)

Structure commits around real milestones rather than padding — a reviewer can tell the difference. Suggested natural breakdown that organically exceeds 20 commits on a project this scope:

1. `chore: initialize repo, wrangler + soroban workspace scaffolding`
2. `feat(contracts): quest_registry data model + create_quest`
3. `test(contracts): quest_registry unit tests`
4. `feat(contracts): reward_token SAC integration`
5. `feat(contracts): claim_manager attestation verification`
6. `test(contracts): claim_manager replay + auth tests`
7. `feat(contracts): bounty_escrow budget management`
8. `feat(contracts): impact_vault staking + yield distribution`
9. `test(contracts): impact_vault yield distribution tests`
10. `chore(contracts): deploy to testnet, record DEPLOYMENTS.md`
11. `feat(frontend): scaffold Vite + React + Tailwind`
12. `feat(frontend): Freighter wallet connect`
13. `feat(frontend): quest discovery map view`
14. `feat(frontend): mobile-responsive layout pass`
15. `feat(frontend): check-in geolocation + geofence validation`
16. `feat(api): verification worker + oracle signing`
17. `feat(frontend): claim transaction flow + tx hash confirmation UI`
18. `feat(frontend): staking/yield UI`
19. `feat(frontend): admin console for quest creation`
20. `test(frontend): wallet connect + check-in flow tests`
21. `ci: add frontend GitHub Actions pipeline`
22. `ci: add contracts GitHub Actions pipeline`
23. `chore: deploy frontend to Cloudflare Pages`
24. `fix: various responsive/edge-case fixes from QA pass`

---

## 15. Roadmap

| Phase | Scope | Target |
|---|---|---|
| Phase 0 | Repo scaffolding, wallet connect, contract skeletons | Week 1 |
| Phase 1 | Core claim flow end-to-end on Testnet | Week 2-3 |
| Phase 2 | Staking/yield vault, admin console | Week 4 |
| Phase 3 | CI/CD, full test coverage, mobile QA pass | Week 5 |
| Phase 4 | Deployment docs, Mainnet readiness review | Week 6 |
| Phase 5 (post-PRD) | Security audit, Mainnet deploy, pilot with a real municipal partner | TBD |

---

## 16. Open Questions / Risks

- **Geofence spoofing**: GPS can be spoofed on rooted/jailbroken devices. Mitigate with QR/NFC co-signing at partner locations for higher-value quests; treat pure-GPS quests as lower-trust/lower-reward tiers.
- **Yield source**: Where does "yield-bearing" actually originate — a real DeFi position (e.g., a yield-bearing stablecoin reserve) or a fixed emission schedule funded by the bond issuer? This needs a decision before `impact_vault` economics are finalized, since it affects both contract design and any regulatory characterization of the reward token.
- **Regulatory framing**: If rewards are funded by municipal bonds and marketed as "yield-bearing," get legal input on whether the token could be characterized as a security in your jurisdiction before Mainnet launch. This PRD does not constitute legal advice.
- **Sybil resistance**: wallet-only identity means one person could run many wallets to farm rewards from a public park. Consider rate-limiting per device fingerprint and/or a lightweight proof-of-personhood step for high-value bounties.
- **Freighter mobile support**: confirm current mobile/WalletConnect-style support in Freighter's docs at implementation time, since this affects the mobile check-in UX materially.