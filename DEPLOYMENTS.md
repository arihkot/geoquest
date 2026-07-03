# GeoQuest Deployments

## Testnet Deployments (Stellar Testnet)

| Contract | Address | Deploy Tx |
|---|---|---|
| quest_registry | `CDAXVUCN7A2PAOD6R6CXXRXZ5VVMEVMNLJUE6FWCD2ASZO7NDTMO5NOL` | [tx](https://stellar.expert/explorer/testnet/tx/a95ceb32550c91e6d6b3d57be3e265c4301a7159019ca4599008e63c7956b0f9) |
| reward_token | `CAFY4YVXRHJN67ZTK25WYKPCBXOYW5O5NRCRQ2IAEK2VPNLH3Q5H53KS` | [tx](https://stellar.expert/explorer/testnet/tx/91f6c03048e187d8ca9d0cd4396211bc1596b1b009fc90d0757bb29269e505d1) |
| claim_manager | `CBDKLAQTC7RO7S5S4752GQK5DEJT4FDXBAW7VFSVEGOCJI45WDY5WCUE` | [tx](https://stellar.expert/explorer/testnet/tx/abd5cc0e320e60e2096a42752df092b271bd97d5607aa4faab203e8ab0f01370) |
| impact_vault | `CAZ67A6KY5MTSZCQ3P543VQXROJCGG5ZPOJ3GWYE5EXDNYYLYP34X46T` | [tx](https://stellar.expert/explorer/testnet/tx/dc1ba0b1eb89e4a4b0e1be4ac5bb8c69fe4daab20a066f1c0fc5d21d8125f964) |
| bounty_escrow | `CCO7DLICTIKE3MP7IBQ6TP5DFWGVDIWMS37B562SZLA6SGUGZ4NTYV7M` | [tx](https://stellar.expert/explorer/testnet/tx/5231952d44d0429b51a86bb3a567dcfcf65c630fcf78966726a7877a0de9c571) |

### Testnet Activity (live contract calls)

| Action | Tx Hash | Link |
|---|---|---|
| Mint 100 GEO to alice | `0ff491ba89d0c90d152c7000aeee3f8e4ccb6a9b25613db7112056f2958269ec` | [View](https://stellar.expert/explorer/testnet/tx/0ff491ba89d0c90d152c7000aeee3f8e4ccb6a9b25613db7112056f2958269ec) |
| Stake 50 GEO | `68b4098841e602ce947a61e83d568427a82a9ed0d6f20346d522ad94d1fbb907` | [View](https://stellar.expert/explorer/testnet/tx/68b4098841e602ce947a61e83d568427a82a9ed0d6f20346d522ad94d1fbb907) |
| Create Quest #0 | `2c3ff60ed6a87fa9e4f41d7bf20d4e35d4036e15fa6a77a30fdb63c82839ad6a` | [View](https://stellar.expert/explorer/testnet/tx/2c3ff60ed6a87fa9e4f41d7bf20d4e35d4036e15fa6a77a30fdb63c82839ad6a) |

### Admin Identity
- Address: `GAWDC6WWRG4M57V2SOFHJE3T56ZSQVD3Z4O32WMRPK6BK5E6WWRG5DR5`

## Frontend Deployment

```bash
cd frontend
npm run build
wrangler pages deploy dist --project-name=geoquest
```

## Verification Worker

```bash
cd worker
wrangler deploy
```

