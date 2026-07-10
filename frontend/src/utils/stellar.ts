import * as StellarSdk from '@stellar/stellar-sdk'
import { CONTRACTS, NETWORK_PASSPHRASE, SOROBAN_RPC_URL } from './constants'

const rpc: any = (StellarSdk as any).rpc
const contract: any = (StellarSdk as any).contract
const nativeToScVal: any = (StellarSdk as any).nativeToScVal

export interface ClaimArgs {
  publicKey: string
  questId: number
  attestation: {
    user: string
    quest_id: number
    timestamp: number
    location_hash: string
  }
  signature: string
}

/**
 * Builds and signs (via Freighter's signTransaction) a Soroban
 * transaction that invokes claim_manager::record_claim.
 * Returns the signed transaction XDR. Network/simulation errors are
 * surfaced to the caller so the UI can fall back to demo mode.
 */
export async function buildAndSignClaim(
  args: ClaimArgs,
  signXdr: (xdr: string) => Promise<string>
): Promise<string> {
  const server: any = new rpc.Server(SOROBAN_RPC_URL)
  const account: any = await server.getAccount(args.publicKey)
  const claimContract: any = new contract.Contract(CONTRACTS.claimManager)

  const user = nativeToScVal(args.publicKey, { type: 'address' })
  const questId = nativeToScVal(args.questId, { type: 'u64' })
  const attestation = nativeToScVal(args.attestation, { type: 'object' })
  const signature = nativeToScVal(args.signature, { type: 'bytes' })

  const op: any = claimContract.call(
    'record_claim',
    user,
    questId,
    attestation,
    signature
  )

  const tx: any = new (StellarSdk as any).TransactionBuilder(account, {
    fee: '100',
    networkPassphrase: NETWORK_PASSPHRASE,
  })
    .addOperation(op)
    .setTimeout(30)
    .build()

  const sim: any = await server.simulateTransaction(tx)
  const prepared = rpc.assembleTransaction(tx, sim).build()
  const signedXdr = await signXdr(prepared.toXDR())
  return signedXdr
}
