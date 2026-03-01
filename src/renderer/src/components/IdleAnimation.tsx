import { useEffect, useRef } from 'react'

export function IdleAnimation(): JSX.Element {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    // High-DPI support
    const dpr = window.devicePixelRatio || 1
    const W = 130
    const H = 28
    canvas.width = W * dpr
    canvas.height = H * dpr
    canvas.style.width = `${W}px`
    canvas.style.height = `${H}px`
    ctx.scale(dpr, dpr)

    let animId: number
    const startTime = performance.now()

    function draw(now: number): void {
      const t = (now - startTime) / 1000

      ctx!.clearRect(0, 0, W, H)

      const centerY = H / 2

      // Draw a gentle breathing line — a very soft sine wave that slowly drifts
      // with a gradient that shifts hue over time (subtle, desaturated)
      const segments = 80
      const segW = W / segments

      // Breathing: amplitude gently pulses
      const breathe = 2 + Math.sin(t * 0.8) * 1.5

      // Draw the main ambient line
      for (let pass = 0; pass < 2; pass++) {
        ctx!.beginPath()
        const lineAlpha = pass === 0 ? 0.35 : 0.15
        const lineWidth = pass === 0 ? 2 : 4
        const phaseOffset = pass * 0.5
        const ampMult = pass === 0 ? 1 : 0.6

        ctx!.lineWidth = lineWidth
        ctx!.lineCap = 'round'
        ctx!.lineJoin = 'round'

        for (let i = 0; i <= segments; i++) {
          const x = i * segW
          const norm = x / W // 0 → 1

          // Envelope: taper at edges
          const env = Math.sin(norm * Math.PI)

          // Gentle wave: combine two slow sine waves
          const wave1 = Math.sin(norm * Math.PI * 2 + t * 0.6 + phaseOffset) * breathe * ampMult
          const wave2 = Math.sin(norm * Math.PI * 3.5 - t * 0.4 + phaseOffset) * (breathe * 0.4) * ampMult
          const y = centerY + (wave1 + wave2) * env

          // Color: soft shifting hue along the line
          const hue = (norm * 60 + t * 20) % 360
          const color = `hsla(${hue}, 30%, 80%, ${lineAlpha * env})`

          if (i === 0) {
            ctx!.moveTo(x, y)
          } else {
            // Draw segment by segment for gradient effect
            ctx!.strokeStyle = color
            ctx!.beginPath()
            const prevX = (i - 1) * segW
            const prevNorm = prevX / W
            const prevEnv = Math.sin(prevNorm * Math.PI)
            const prevWave1 =
              Math.sin(prevNorm * Math.PI * 2 + t * 0.6 + phaseOffset) * breathe * ampMult
            const prevWave2 =
              Math.sin(prevNorm * Math.PI * 3.5 - t * 0.4 + phaseOffset) *
              (breathe * 0.4) *
              ampMult
            const prevY = centerY + (prevWave1 + prevWave2) * prevEnv
            ctx!.moveTo(prevX, prevY)
            ctx!.lineTo(x, y)
            ctx!.stroke()
          }
        }
      }

      animId = requestAnimationFrame(draw)
    }

    animId = requestAnimationFrame(draw)
    return () => cancelAnimationFrame(animId)
  }, [])

  return <canvas ref={canvasRef} className="opacity-90" />
}
