// Programmatic sound effects using Web Audio API
// No external files needed — all sounds are synthesized

let audioCtx: AudioContext | null = null

function getAudioContext(): AudioContext {
  if (!audioCtx) {
    audioCtx = new AudioContext()
  }
  // Resume if suspended (browsers require user interaction)
  if (audioCtx.state === 'suspended') {
    audioCtx.resume()
  }
  return audioCtx
}

function playTone(
  frequency: number,
  duration: number,
  type: OscillatorType = 'sine',
  volume: number = 0.15,
  fadeOut: number = 0.05
): OscillatorNode {
  const ctx = getAudioContext()
  const osc = ctx.createOscillator()
  const gain = ctx.createGain()

  osc.type = type
  osc.frequency.setValueAtTime(frequency, ctx.currentTime)
  gain.gain.setValueAtTime(volume, ctx.currentTime)
  gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration + fadeOut)

  osc.connect(gain)
  gain.connect(ctx.destination)

  osc.start(ctx.currentTime)
  osc.stop(ctx.currentTime + duration + fadeOut)

  return osc
}

/**
 * Start recording — bright rising two-tone
 * A quick ascending chirp: C5 → E5
 */
export function playStartSound(): void {
  const ctx = getAudioContext()
  const now = ctx.currentTime

  // First tone: C5 (523 Hz)
  const osc1 = ctx.createOscillator()
  const gain1 = ctx.createGain()
  osc1.type = 'sine'
  osc1.frequency.setValueAtTime(523, now)
  gain1.gain.setValueAtTime(0.12, now)
  gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.1)
  osc1.connect(gain1)
  gain1.connect(ctx.destination)
  osc1.start(now)
  osc1.stop(now + 0.1)

  // Second tone: E5 (659 Hz), slightly delayed
  const osc2 = ctx.createOscillator()
  const gain2 = ctx.createGain()
  osc2.type = 'sine'
  osc2.frequency.setValueAtTime(659, now + 0.07)
  gain2.gain.setValueAtTime(0, now)
  gain2.gain.setValueAtTime(0.14, now + 0.07)
  gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.2)
  osc2.connect(gain2)
  gain2.connect(ctx.destination)
  osc2.start(now + 0.07)
  osc2.stop(now + 0.2)
}

/**
 * Stop recording / begin processing — soft acknowledgment tone
 * A single gentle G5 with a triangle wave
 */
export function playStopSound(): void {
  playTone(784, 0.12, 'triangle', 0.1)
}

/**
 * Transcription complete — satisfying descending two-tone
 * E5 → C5 (mirror of start sound)
 */
export function playSuccessSound(): void {
  const ctx = getAudioContext()
  const now = ctx.currentTime

  // First tone: E5 (659 Hz)
  const osc1 = ctx.createOscillator()
  const gain1 = ctx.createGain()
  osc1.type = 'sine'
  osc1.frequency.setValueAtTime(659, now)
  gain1.gain.setValueAtTime(0.12, now)
  gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.1)
  osc1.connect(gain1)
  gain1.connect(ctx.destination)
  osc1.start(now)
  osc1.stop(now + 0.1)

  // Second tone: C5 (523 Hz), slightly delayed
  const osc2 = ctx.createOscillator()
  const gain2 = ctx.createGain()
  osc2.type = 'sine'
  osc2.frequency.setValueAtTime(523, now + 0.07)
  gain2.gain.setValueAtTime(0, now)
  gain2.gain.setValueAtTime(0.14, now + 0.07)
  gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.22)
  osc2.connect(gain2)
  gain2.connect(ctx.destination)
  osc2.start(now + 0.07)
  osc2.stop(now + 0.22)
}

/**
 * Cancel / Error — gentle low dismissal tone
 * A single A4 with a soft sine wave
 */
export function playCancelSound(): void {
  playTone(440, 0.15, 'sine', 0.08)
}
