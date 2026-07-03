import { describe, it, expect, beforeAll } from 'vitest'

interface Env {
  VERIFICATION_DATA: KVNamespace
}

import worker from '../src/index'

describe('Verification Worker', () => {
  it('returns health check', async () => {
    const request = new Request('https://geoquest-worker.workers.dev/api/health')
    const env = { VERIFICATION_DATA: {} as KVNamespace }
    const response = await worker.fetch(request, env as any)
    expect(response.status).toBe(200)
    const body = await response.json()
    expect(body.status).toBe('ok')
    expect(body.service).toBe('geoquest-verification-api')
  })

  it('returns quests list', async () => {
    const request = new Request('https://geoquest-worker.workers.dev/api/quests')
    const env = { VERIFICATION_DATA: {} as KVNamespace }
    const response = await worker.fetch(request, env as any)
    expect(response.status).toBe(200)
    const body = await response.json()
    expect(body.quests).toBeDefined()
    expect(body.quests.length).toBe(5)
  })

  it('rejects attestation with missing fields', async () => {
    const request = new Request('https://geoquest-worker.workers.dev/api/attest', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({}),
    })
    const env = { VERIFICATION_DATA: {} as KVNamespace }
    const response = await worker.fetch(request, env as any)
    expect(response.status).toBe(400)
    const body = await response.json()
    expect(body.attested).toBe(false)
  })

  it('rejects attestation for non-existent quest', async () => {
    const request = new Request('https://geoquest-worker.workers.dev/api/attest', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        userAddress: 'GBRPYHIL2CI3FNQ4BXLFMNDLFJUNPU2HY3YMFSHON76K2FA3MZKL567R',
        questId: 999,
        latitude: 40.7483,
        longitude: -73.985,
        accuracy: 10,
        timestamp: Date.now(),
      }),
    })
    const env = { VERIFICATION_DATA: {} as KVNamespace }
    const response = await worker.fetch(request, env as any)
    expect(response.status).toBe(404)
    const body = await response.json()
    expect(body.error).toContain('not found')
  })

  it('rejects attestation with low GPS accuracy', async () => {
    const request = new Request('https://geoquest-worker.workers.dev/api/attest', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        userAddress: 'GBRPYHIL2CI3FNQ4BXLFMNDLFJUNPU2HY3YMFSHON76K2FA3MZKL567R',
        questId: 0,
        latitude: 40.7483,
        longitude: -73.985,
        accuracy: 500,
        timestamp: Date.now(),
      }),
    })
    const env = { VERIFICATION_DATA: {} as KVNamespace }
    const response = await worker.fetch(request, env as any)
    expect(response.status).toBe(400)
    const body = await response.json()
    expect(body.error).toContain('accuracy')
  })
})
