import { useState, useRef, useCallback } from 'react'

interface UseAudioRecorderReturn {
  isRecording: boolean
  startRecording: () => Promise<void>
  stopRecording: (cancel?: boolean) => void
  analyserNode: AnalyserNode | null
}

export function useAudioRecorder(
  onRecordingComplete: (audioBase64: string) => void
): UseAudioRecorderReturn {
  const [isRecording, setIsRecording] = useState(false)
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const chunksRef = useRef<Blob[]>([])
  const streamRef = useRef<MediaStream | null>(null)
  const [analyserNode, setAnalyserNode] = useState<AnalyserNode | null>(null)
  const audioContextRef = useRef<AudioContext | null>(null)
  const cancelledRef = useRef(false)

  const startRecording = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          sampleRate: 16000
        }
      })
      streamRef.current = stream

      // Set up audio analyser for waveform visualization
      const audioContext = new AudioContext()
      audioContextRef.current = audioContext
      const source = audioContext.createMediaStreamSource(stream)
      const analyser = audioContext.createAnalyser()
      analyser.fftSize = 256
      source.connect(analyser)
      setAnalyserNode(analyser)

      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: 'audio/webm;codecs=opus'
      })
      mediaRecorderRef.current = mediaRecorder
      chunksRef.current = []

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunksRef.current.push(event.data)
        }
      }

      mediaRecorder.onstop = async () => {
        // If cancelled, just clean up without transcribing
        if (cancelledRef.current) {
          cancelledRef.current = false
          chunksRef.current = []
          return
        }

        const blob = new Blob(chunksRef.current, { type: 'audio/webm' })

        // Convert blob to base64
        const arrayBuffer = await blob.arrayBuffer()
        const uint8Array = new Uint8Array(arrayBuffer)
        let binary = ''
        uint8Array.forEach((byte) => {
          binary += String.fromCharCode(byte)
        })
        const base64 = btoa(binary)

        onRecordingComplete(base64)

        // Cleanup
        chunksRef.current = []
      }

      mediaRecorder.start(100) // Collect data every 100ms
      setIsRecording(true)
    } catch (error) {
      console.error('Failed to start recording:', error)
    }
  }, [onRecordingComplete])

  const stopRecording = useCallback((cancel?: boolean) => {
    if (cancel) {
      cancelledRef.current = true
    }
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      mediaRecorderRef.current.stop()
    }

    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop())
      streamRef.current = null
    }

    if (audioContextRef.current) {
      audioContextRef.current.close()
      audioContextRef.current = null
    }

    setAnalyserNode(null)
    setIsRecording(false)
  }, [])

  return { isRecording, startRecording, stopRecording, analyserNode }
}
