export interface Env {
  VERIFICATION_DATA: KVNamespace
  ORACLE_PRIVATE_KEY?: string
}

const MAX_CHECKIN_RADIUS_M = 500
const MIN_ACCURACY_M = 200
const RATE_LIMIT_WINDOW_MS = 60000
const MAX_CHECKS_PER_WINDOW = 5
const MAX_FINGERPRINTS_PER_USER_MS = 86400000 // 24h
const MAX_UNIQUE_FINGERPRINTS = 5

const DEMO_QUESTS = [
  {
    id: 0,
    title: 'Riverside Park Cleanup Zone',
    description: 'Visit Riverside Park and help keep it clean.',
    lat_e7: 407483000,
    lng_e7: -739850000,
    radius_m: 50,
    reward_amount: 100_0000000,
    budget_remaining: 800_0000000,
    budget_total: 1000_0000000,
    active: true,
    start_ledger: 0,
    end_ledger: 99999999,
    total_claims: 20,
  },
  {
    id: 1,
    title: 'Central Park Eco Walk',
    description: 'Explore Central Park and learn about urban biodiversity.',
    lat_e7: 407827000,
    lng_e7: -739662000,
    radius_m: 100,
    reward_amount: 50_0000000,
    budget_remaining: 300_0000000,
    budget_total: 500_0000000,
    active: true,
    start_ledger: 0,
    end_ledger: 99999999,
    total_claims: 40,
  },
  {
    id: 2,
    title: 'Brooklyn Bridge Walking Tour',
    description: 'Walk across the Brooklyn Bridge and discover its history.',
    lat_e7: 407061000,
    lng_e7: -739969000,
    radius_m: 200,
    reward_amount: 75_0000000,
    budget_remaining: 250_0000000,
    budget_total: 500_0000000,
    active: true,
    start_ledger: 0,
    end_ledger: 99999999,
    total_claims: 33,
  },
  {
    id: 3,
    title: 'Community Garden Volunteer',
    description: 'Visit the community garden and help with planting or harvesting.',
    lat_e7: 407300000,
    lng_e7: -739500000,
    radius_m: 40,
    reward_amount: 150_0000000,
    budget_remaining: 450_0000000,
    budget_total: 600_0000000,
    active: true,
    start_ledger: 0,
    end_ledger: 99999999,
    total_claims: 10,
  },
  {
    id: 4,
    title: 'Historic Landmark Discovery',
    description: 'Visit the historic landmark and learn about its significance.',
    lat_e7: 407484000,
    lng_e7: -739734000,
    radius_m: 30,
    reward_amount: 200_0000000,
    budget_remaining: 200_0000000,
    budget_total: 400_0000000,
    active: true,
    start_ledger: 0,
    end_ledger: 99999999,
    total_claims: 10,
  },
]

function calculateDistance(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number
): number {
  const R = 6371000
  const dLat = ((lat2 - lat1) * Math.PI) / 180
  const dLng = ((lng2 - lng1) * Math.PI) / 180
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  return R * c
}

function formatTimeUTC(): string {
  return new Date().toISOString()
}

async function checkDeviceFingerprint(env: Env, userAddress: string, fingerprint: string): Promise<{ allowed: boolean; reason?: string }> {
  if (!fingerprint) return { allowed: true }

  const fpKey = `fp:users:${userAddress}`
  const existing = await env.VERIFICATION_DATA.get(fpKey).catch(() => null)
  const now = Date.now()

  if (existing) {
    const data = JSON.parse(existing) as { fingerprints: string[]; firstSeen: number }
    const uniqueFps = new Set(data.fingerprints)
    uniqueFps.add(fingerprint)

    if (uniqueFps.size > MAX_UNIQUE_FINGERPRINTS) {
      return { allowed: false, reason: 'Too many unique device fingerprints for this wallet' }
    }

    await env.VERIFICATION_DATA.put(fpKey, JSON.stringify({
      fingerprints: Array.from(uniqueFps).slice(-10),
      firstSeen: data.firstSeen,
    }), { expirationTtl: 86400 }).catch(() => {})
  } else {
    await env.VERIFICATION_DATA.put(fpKey, JSON.stringify({
      fingerprints: [fingerprint],
      firstSeen: now,
    }), { expirationTtl: 86400 }).catch(() => {})
  }

  // Check emulator/simulator
  const isEmulatorKey = `fp:emu:${fingerprint}`
  const emuCheck = await env.VERIFICATION_DATA.get(isEmulatorKey).catch(() => null)
  if (emuCheck) {
    return { allowed: false, reason: 'Device flagged as emulator/simulator' }
  }

  return { allowed: true }
}

function bytesToHex(bytes: Uint8Array): string {
  return Array.from(bytes, (b) => b.toString(16).padStart(2, '0')).join('')
}

async function signAttestation(payload: string, env: Env): Promise<{ signature: string; publicKey: string }> {
  const privateKeyBase64 = env.ORACLE_PRIVATE_KEY
  
  if (!privateKeyBase64) {
    // Demo fallback: generate deterministic signature for testnet
    const encoder = new TextEncoder()
    const data = encoder.encode(payload)
    const hashBytes = await crypto.subtle.digest('SHA-256', data)
    const hashHex = bytesToHex(new Uint8Array(hashBytes))
    return {
      signature: `demo:${hashHex.slice(0, 64)}`,
      publicKey: 'demo_oracle_pubkey_placeholder',
    }
  }

  try {
    const keyBytes = Uint8Array.from(atob(privateKeyBase64), (c) => c.charCodeAt(0))
    const key = await crypto.subtle.importKey(
      'raw',
      keyBytes.slice(0, 32),
      { name: 'HMAC', hash: 'SHA-256' },
      false,
      ['sign']
    )

    const encoder = new TextEncoder()
    const data = encoder.encode(payload)
    const sigBuffer = await crypto.subtle.sign('HMAC', key, data)
    const sigBytes = new Uint8Array(sigBuffer)

    const pubKeyBytes = keyBytes.slice(32, 64)
    return {
      signature: bytesToHex(sigBytes),
      publicKey: bytesToHex(pubKeyBytes),
    }
  } catch {
    const encoder = new TextEncoder()
    const data = encoder.encode(payload)
    const hashBytes = await crypto.subtle.digest('SHA-256', data)
    return {
      signature: 'demo:' + bytesToHex(new Uint8Array(hashBytes)).slice(0, 64),
      publicKey: 'demo_oracle_pubkey',
    }
  }
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const corsHeaders = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      'Access-Control-Max-Age': '86400',
    }

    if (request.method === 'OPTIONS') {
      return new Response(null, { status: 204, headers: corsHeaders })
    }

    const url = new URL(request.url)
    const path = url.pathname

    const responseBody = (body: unknown, status = 200) =>
      new Response(JSON.stringify(body), {
        status,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })

    try {
      if (path === '/api/quests' && request.method === 'GET') {
        return responseBody({ quests: DEMO_QUESTS })
      }

      if (path === '/api/attest' && request.method === 'POST') {
        const body: {
          userAddress: string
          questId: number
          latitude: number
          longitude: number
          accuracy: number
          timestamp: number
          deviceFingerprint?: string
          sessionHeuristics?: Record<string, unknown>
        } = await request.json()

        if (!body.userAddress || body.questId === undefined || body.latitude === undefined || body.longitude === undefined) {
          return responseBody({ attested: false, error: 'Missing required fields' }, 400)
        }

        // Validate wallet address format
        if (!/^G[A-Z2-7]{55}$/.test(body.userAddress)) {
          return responseBody({ attested: false, error: 'Invalid Stellar wallet address' }, 400)
        }

        const quest = DEMO_QUESTS.find((q) => q.id === body.questId)
        if (!quest) {
          return responseBody({ attested: false, error: 'Quest not found' }, 404)
        }

        if (!quest.active) {
          return responseBody({ attested: false, error: 'Quest is paused' }, 400)
        }

        // Device fingerprint anti-Sybil check
        if (body.deviceFingerprint) {
          const fpCheck = await checkDeviceFingerprint(env, body.userAddress, body.deviceFingerprint)
          if (!fpCheck.allowed) {
            return responseBody({ attested: false, error: fpCheck.reason }, 403)
          }
        }

        // Emulator check from heuristics
        if (body.sessionHeuristics?.isEmulator) {
          await env.VERIFICATION_DATA.put(
            `fp:emu:${body.deviceFingerprint}`,
            '1',
            { expirationTtl: 86400 }
          ).catch(() => {})
          return responseBody({ attested: false, error: 'Emulated devices are not supported' }, 403)
        }

        // GPS accuracy check
        if (body.accuracy > MIN_ACCURACY_M) {
          return responseBody({
            attested: false,
            error: `GPS accuracy too low (${Math.round(body.accuracy)}m). Please try outdoors with clear sky.`,
          }, 400)
        }

        // Geofence distance check
        const questLat = quest.lat_e7 / 1e7
        const questLng = quest.lng_e7 / 1e7
        const distance = calculateDistance(body.latitude, body.longitude, questLat, questLng)

        if (distance > quest.radius_m) {
          return responseBody({
            attested: false,
            error: `You are ${Math.round(distance)}m away. Get within ${quest.radius_m}m.`,
          }, 400)
        }

        // Timestamp freshness
        const nowMs = Date.now()
        const timeDiff = Math.abs(nowMs - body.timestamp)
        if (timeDiff > 120000) {
          return responseBody({
            attested: false,
            error: 'Location timestamp is too old. Please refresh your GPS.',
          }, 400)
        }

        // Rate limiting per user
        const rateKey = `rate:${body.userAddress}`
        const rateData = await env.VERIFICATION_DATA.get(rateKey).catch(() => null)
        const checks: number[] = rateData ? JSON.parse(rateData) : []
        const recentChecks = checks.filter((t) => nowMs - t < RATE_LIMIT_WINDOW_MS)

        if (recentChecks.length >= MAX_CHECKS_PER_WINDOW) {
          return responseBody({
            attested: false,
            error: 'Too many check-in attempts. Please wait a minute.',
          }, 429)
        }

        recentChecks.push(nowMs)
        await env.VERIFICATION_DATA.put(rateKey, JSON.stringify(recentChecks), {
          expirationTtl: 300,
        }).catch(() => {})

        const attestationPayload = JSON.stringify({
          user: body.userAddress,
          quest_id: body.questId,
          timestamp: body.timestamp,
          location_hash: `${quest.lat_e7}:${quest.lng_e7}`,
          attested_at: formatTimeUTC(),
          device_fp: body.deviceFingerprint || 'none',
        })

        const oracleSig = await signAttestation(attestationPayload, env)

        console.log(
          `[${formatTimeUTC()}] ATTESTED: user=${body.userAddress.slice(0, 10)} quest=${body.questId} dist=${Math.round(distance)}m acc=${Math.round(body.accuracy)}m fp=${body.deviceFingerprint?.slice(0, 12) || 'none'}`
        )

        return responseBody({
          attested: true,
          attestationPayload,
          signature: oracleSig.signature,
          oraclePublicKey: oracleSig.publicKey,
          distance_m: Math.round(distance),
          quest_title: quest.title,
        })
      }

      if (path === '/api/health') {
        return responseBody({
          status: 'ok',
          service: 'geoquest-verification-api',
          timestamp: formatTimeUTC(),
        })
      }

      return responseBody({ error: 'Not found' }, 404)
    } catch (e: any) {
      return responseBody({ error: e.message || 'Internal server error' }, 500)
    }
  },
}
