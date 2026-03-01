import { useEffect, useRef, useMemo } from 'react'
import { randomPalette, samplePalette } from '../lib/gradient-palettes'

interface WaveformVisualizerProps {
  analyserNode: AnalyserNode | null
  isActive: boolean
}

export function WaveformVisualizer({
  analyserNode,
  isActive
}: WaveformVisualizerProps): JSX.Element {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const animationRef = useRef<number>(0)
  const startTimeRef = useRef<number>(0)
  const smoothedRef = useRef<Float32Array | null>(null)

  // Pick a fresh random palette each recording session
  const palette = useMemo(() => randomPalette(), [])

  useEffect(() => {
    if (!analyserNode || !isActive || !canvasRef.current) return

    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    startTimeRef.current = performance.now()

    const bufferLength = analyserNode.frequencyBinCount
    const dataArray = new Uint8Array(bufferLength)
    const barCount = 24

    if (!smoothedRef.current || smoothedRef.current.length !== barCount) {
      smoothedRef.current = new Float32Array(barCount)
    }

    const W = canvas.width
    const H = canvas.height
    const CENTER_Y = H / 2
    const barTotalWidth = W / barCount
    const barWidth = barTotalWidth - 1.5

    const draw = (now: number): void => {
      animationRef.current = requestAnimationFrame(draw)

      const elapsed = (now - startTimeRef.current) / 1000
      analyserNode.getByteFrequencyData(dataArray)

      ctx.clearRect(0, 0, W, H)

      const smoothed = smoothedRef.current!
      let avgLevel = 0

      for (let i = 0; i < barCount; i++) {
        const dataIndex = Math.floor((i / barCount) * bufferLength * 0.7)
        const rawValue = dataArray[dataIndex] / 255

        // Smooth: fast attack, slow decay
        if (rawValue > smoothed[i]) {
          smoothed[i] += (rawValue - smoothed[i]) * 0.35
        } else {
          smoothed[i] += (rawValue - smoothed[i]) * 0.12
        }

        avgLevel += smoothed[i]
      }
      avgLevel /= barCount

      // Moving gradient drift speed — slightly faster when louder
      const drift = elapsed * (0.08 + avgLevel * 0.04)

      // Draw bars, each colored by sampling the looping palette
      for (let i = 0; i < barCount; i++) {
        const value = smoothed[i]
        const minH = 3
        const barHeight = Math.max(minH, value * H * 0.85)

        const x = i * barTotalWidth + 0.75
        const y = CENTER_Y - barHeight / 2

        // Position in palette: spread across bars + drift over time
        // This wraps seamlessly because palette first color = last color
        const pos = (i / barCount) + drift
        const alpha = 0.65 + avgLevel * 0.35
        ctx.fillStyle = samplePalette(palette, pos, alpha)

        ctx.beginPath()
        ctx.roundRect(x, y, barWidth, barHeight, 3)
        ctx.fill()
      }
    }

    animationRef.current = requestAnimationFrame(draw)

    return () => {
      cancelAnimationFrame(animationRef.current)
    }
  }, [analyserNode, isActive, palette])

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
