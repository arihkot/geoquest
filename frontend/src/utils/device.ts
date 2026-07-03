export function getDeviceFingerprint(): string {
  const components: string[] = []

  if (typeof navigator !== 'undefined') {
    components.push(navigator.userAgent || '')
    components.push(navigator.language || '')
    components.push(navigator.platform || '')
    components.push(navigator.hardwareConcurrency?.toString() || '')
    components.push(navigator.maxTouchPoints?.toString() || '')

    if ('deviceMemory' in navigator) {
      components.push((navigator as any).deviceMemory?.toString() || '')
    }
  }

  if (typeof screen !== 'undefined') {
    components.push(`${screen.width}x${screen.height}`)
    components.push(screen.colorDepth?.toString() || '')
  }

  const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone
  components.push(timezone)

  const raw = components.join('|')
  let hash = 0
  for (let i = 0; i < raw.length; i++) {
    const chr = raw.charCodeAt(i)
    hash = ((hash << 5) - hash + chr) | 0
  }
  return 'fp_' + Math.abs(hash).toString(16)
}

export function isLikelyEmulator(): boolean {
  return /Emulator|Simulator|HeadlessChrome|PhantomJS/i.test(navigator.userAgent)
}

export function getSessionHeuristics(): Record<string, unknown> {
  return {
    fingerprint: getDeviceFingerprint(),
    screenSize: `${screen.width}x${screen.height}`,
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    language: navigator.language,
    touchPoints: navigator.maxTouchPoints || 0,
    isMobile: /Mobi|Android/i.test(navigator.userAgent),
    isEmulator: isLikelyEmulator(),
  }
}
