import { useEffect, useRef, useMemo } from 'react'
import { randomPalette, samplePalette } from '../lib/gradient-palettes'

export function TranscribingAnimation(): JSX.Element {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const animationRef = useRef<number>(0)
  const startTimeRef = useRef<number>(Date.now())

  // Pick a fresh random palette each time this component mounts (each transcription)
  const palette = useMemo(() => randomPalette(), [])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    startTimeRef.current = Date.now()

    const W = canvas.width
    const H = canvas.height
    const CENTER_Y = H / 2

    const draw = (): void => {
      animationRef.current = requestAnimationFrame(draw)
      const t = (Date.now() - startTimeRef.current) / 1000

      ctx.clearRect(0, 0, W, H)

      // Draw 3 layered sine waves with different phases/amplitudes
      const waves = [
        { amplitude: 6, frequency: 0.04, speed: 2.0, opacity: 0.55, width: 3 },
        { amplitude: 8, frequency: 0.03, speed: 1.4, opacity: 0.4, width: 2.5 },
        { amplitude: 4.5, frequency: 0.055, speed: 2.6, opacity: 0.3, width: 2 }
      ]

      for (const wave of waves) {
        // Gentle breathing on amplitude
        const breathe = 1 + Math.sin(t * 1.2) * 0.3
        const amp = wave.amplitude * breathe

        // Build the wave path points first
        const points: { x: number; y: number }[] = []
        for (let x = 0; x <= W; x++) {
          const envelope = Math.sin((x / W) * Math.PI)
          const y =
            CENTER_Y +
            Math.sin(x * wave.frequency + t * wave.speed) * amp * envelope +
            Math.sin(x * wave.frequency * 1.8 + t * wave.speed * 0.7) * (amp * 0.3) * envelope
          points.push({ x, y })
        }

        // Draw the wave in small segments, colored by the looping palette
        const segmentSize = 3
        for (let i = 0; i < points.length - 1; i += segmentSize) {
          const end = Math.min(i + segmentSize + 1, points.length)

          // Position in palette: spread across x + slow drift over time
          // Wraps seamlessly because palette loops (first = last color)
          const pos = (i / W) + t * 0.08

          ctx.beginPath()
          ctx.moveTo(points[i].x, points[i].y)
          for (let j = i + 1; j < end; j++) {
            ctx.lineTo(points[j].x, points[j].y)
          }
          // Fade edges using envelope
          const envelope = Math.sin((points[i].x / W) * Math.PI)
          ctx.strokeStyle = samplePalette(palette, pos, wave.opacity * envelope)
          ctx.lineWidth = wave.width
          ctx.lineCap = 'round'
          ctx.lineJoin = 'round'
          ctx.stroke()
        }
      }

      // Subtle center line (barely visible, anchors the visual)
      ctx.beginPath()
      ctx.moveTo(20, CENTER_Y)
      ctx.lineTo(W - 20, CENTER_Y)
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.06)'
      ctx.lineWidth = 1
      ctx.stroke()
    }

    draw()

    return () => {
      cancelAnimationFrame(animationRef.current)
    }
  }, [palette])

  return (
    <canvas
      ref={canvasRef}
      width={150}
      height={34}
      className="opacity-90"
      style={{ width: '150px', height: '34px' }}
    />
  )
}
