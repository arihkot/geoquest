import { VERIFICATION_API_URL } from './constants';

export interface AttestationRequest {
  userAddress: string;
  questId: number;
  latitude: number;
  longitude: number;
  accuracy: number;
  timestamp: number;
  deviceFingerprint?: string;
  sessionHeuristics?: Record<string, unknown>;
}

export interface AttestationResponse {
  attested: boolean;
  attestationPayload?: string;
  signature?: string;
  error?: string;
}

export async function requestAttestation(data: AttestationRequest): Promise<AttestationResponse> {
  const res = await fetch(`${VERIFICATION_API_URL}/api/attest`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: 'Request failed' }));
    return { attested: false, error: err.error || 'Verification failed' };
  }
  return res.json();
}

export async function getQuests() {
  const res = await fetch(`${VERIFICATION_API_URL}/api/quests`);
  if (!res.ok) throw new Error('Failed to fetch quests');
  return res.json();
}
