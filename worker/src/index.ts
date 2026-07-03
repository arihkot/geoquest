export interface Env {
  VERIFICATION_DATA: KVNamespace
  ORACLE_PRIVATE_KEY?: string
}

const MAX_CHECKIN_RADIUS_M = 500
const MIN_ACCURACY_M = 200
const RATE_LIMIT_WINDOW_MS = 60000
const MAX_CHECKS_PER_WINDOW = 5

const DEMO_QUESTS = [
  {
    id: 0,
    title: 'Riverside Park Cleanup Zone',
    description: 'Visit Riverside Park and help keep it clean. Check in at any designated cleanup area.',
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
    description: 'Explore Central Park and learn about urban biodiversity. Check in at 5 waypoints.',
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
    description: 'Walk across the iconic Brooklyn Bridge and discover its history.',
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
      // GET /api/quests
      if (path === '/api/quests' && request.method === 'GET') {
        return responseBody({ quests: DEMO_QUESTS })
      }

      // POST /api/attest
      if (path === '/api/attest' && request.method === 'POST') {
        const body: {
          userAddress: string
          questId: number
          latitude: number
          longitude: number
          accuracy: number
          timestamp: number
        } = await request.json()

        // Validate inputs
        if (!body.userAddress || body.questId === undefined || body.latitude === undefined || body.longitude === undefined) {
          return responseBody({ attested: false, error: 'Missing required fields' }, 400)
        }

        // Find the quest
        const quest = DEMO_QUESTS.find((q) => q.id === body.questId)
        if (!quest) {
          return responseBody({ attested: false, error: 'Quest not found' }, 404)
        }

        if (!quest.active) {
          return responseBody({ attested: false, error: 'Quest is paused' }, 400)
        }

        // Anti-spoof: check GPS accuracy
        if (body.accuracy > MIN_ACCURACY_M) {
          return responseBody({
            attested: false,
            error: `GPS accuracy too low (${Math.round(body.accuracy)}m). Please try outdoors with clear sky.`,
          }, 400)
        }

        // Check distance to quest geofence
        const questLat = quest.lat_e7 / 1e7
        const questLng = quest.lng_e7 / 1e7
        const distance = calculateDistance(body.latitude, body.longitude, questLat, questLng)

        if (distance > quest.radius_m) {
          return responseBody({
            attested: false,
            error: `You are ${Math.round(distance)}m away from this quest. Please get closer (within ${quest.radius_m}m).`,
          }, 400)
        }

        // Anti-spoof: check timestamp freshness
        const nowMs = Date.now()
        const timeDiff = Math.abs(nowMs - body.timestamp)
        if (timeDiff > 120000) {
          return responseBody({
            attested: false,
            error: 'Location timestamp is too old. Please refresh your GPS.',
          }, 400)
        }

        // Rate limiting per user address (simple KV-based)
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

        // Generate attestation payload and sign
        const attestationPayload = JSON.stringify({
          user: body.userAddress,
          quest_id: body.questId,
          timestamp: body.timestamp,
          location_hash: `${quest.lat_e7}:${quest.lng_e7}`,
          attested_at: formatTimeUTC(),
        })

        const signature = 'demo_signature_' + Buffer.from(attestationPayload).toString('base64').slice(0, 64)

        console.log(`[${formatTimeUTC()}] Attested: user=${body.userAddress.slice(0, 10)} quest=${body.questId} dist=${Math.round(distance)}m acc=${Math.round(body.accuracy)}m`)

        return responseBody({
          attested: true,
          attestationPayload,
          signature,
          distance_m: Math.round(distance),
          quest_title: quest.title,
        })
      }

      // GET /api/health
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
