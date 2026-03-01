import { useState, useEffect, useCallback, useRef } from 'react'
import { CogSolid } from '@mynaui/icons-react'
import { useAudioRecorder } from '../hooks/useAudioRecorder'
import { WaveformVisualizer } from './WaveformVisualizer'
import { ApiKeySetup } from './ApiKeySetup'
import { TranscribingAnimation } from './TranscribingAnimation'
import { IdleAnimation } from './IdleAnimation'
import { playStartSound, playStopSound, playSuccessSound, playCancelSound } from '../lib/sounds'

type RecordingState = 'idle' | 'listening' | 'processing' | 'error' | 'no-key'

export function OverlayBar(): JSX.Element {
  const [state, setState] = useState<RecordingState>('idle')
  const [errorMessage, setErrorMessage] = useState('')
  const [hidePillWhenIdle, setHidePillWhenIdle] = useState(false)
  const [soundEffects, setSoundEffects] = useState(true)
  // When true, render nothing so the window hides without flashing idle UI
  const [hidden, setHidden] = useState(false)

  // Generation counter to discard stale transcription results
  const genRef = useRef(0)
  // Track pending timeouts so we can clear them on rapid re-trigger
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  // Load initial setting and listen for changes
  useEffect(() => {
    window.api.getSettings().then((s) => {
      setHidePillWhenIdle(s.hidePillWhenIdle)
      setSoundEffects(s.soundEffects)
      if (s.hidePillWhenIdle) setHidden(true)
    })
    const cleanup = window.api.onSettingsChanged((s) => {
      setHidePillWhenIdle(s.hidePillWhenIdle)
      setSoundEffects(s.soundEffects)
      if (s.hidePillWhenIdle && state === 'idle') {
        setHidden(true)
      } else if (!s.hidePillWhenIdle) {
        setHidden(false)
      }
    })
    return cleanup
  }, [])

  const clearPendingTimeout = useCallback(() => {
    if (timeoutRef.current !== null) {
      clearTimeout(timeoutRef.current)
      timeoutRef.current = null
    }
  }, [])

  const handleRecordingComplete = useCallback(async (audioBase64: string) => {
    const thisGen = ++genRef.current
    setState('processing')
    window.api.resizeOverlay(180, 44)

    try {
      const text = await window.api.sendAudioForTranscription(audioBase64)
      // If a new recording started while we were transcribing, discard this result
      if (genRef.current !== thisGen) return

      // Hide pill instantly if setting is enabled (before going to idle)
      if (hidePillWhenIdleRef.current) {
        setHidden(true)
        window.api.hideOverlay()
      }
      if (soundEffectsRef.current) playSuccessSound()
      setState('idle')
      window.api.resizeOverlay(180, 44)
    } catch (error) {
      // If a new recording started while we were transcribing, discard this error
      if (genRef.current !== thisGen) return

      console.error('Transcription failed:', error)
      setErrorMessage(error instanceof Error ? error.message : 'Transcription failed')
      setState('error')

      clearPendingTimeout()
      timeoutRef.current = setTimeout(() => {
        if (genRef.current === thisGen) {
          if (hidePillWhenIdleRef.current) {
            setHidden(true)
            window.api.hideOverlay()
          }
          setState('idle')
          setErrorMessage('')
          window.api.resizeOverlay(180, 44)
        }
      }, 3000)
    }
  }, [clearPendingTimeout])

  const { isRecording, startRecording, stopRecording, analyserNode } =
    useAudioRecorder(handleRecordingComplete)

  // Use refs so the callback closures always see the latest values
  const hidePillWhenIdleRef = useRef(hidePillWhenIdle)
  useEffect(() => {
    hidePillWhenIdleRef.current = hidePillWhenIdle
  }, [hidePillWhenIdle])

  const soundEffectsRef = useRef(soundEffects)
  useEffect(() => {
    soundEffectsRef.current = soundEffects
  }, [soundEffects])

  const handleStartRecording = useCallback(async () => {
    if (isRecording) return // Already recording

    // Show the overlay in case it's hidden
    setHidden(false)
    window.api.showOverlay()

    // Check for API key first
    const settings = await window.api.getSettings()
    if (!settings.groqApiKey) {
      setState('no-key')
      window.api.resizeOverlay(180, 44)
      setTimeout(() => {
        if (hidePillWhenIdleRef.current) {
          setHidden(true)
          window.api.hideOverlay()
        }
        setState('idle')
      }, 3000)
      return
    }

    // Clear any pending done/error timeouts from previous transcription
    clearPendingTimeout()

    setState('listening')
    window.api.resizeOverlay(180, 44)
    window.api.sendRecordingState(true)
    if (soundEffectsRef.current) playStartSound()
    await startRecording()
  }, [isRecording, startRecording, clearPendingTimeout])

  const handleStopRecording = useCallback(() => {
    if (!isRecording) return // Not recording
    if (soundEffectsRef.current) playStopSound()
    window.api.sendRecordingState(false)
    stopRecording()
  }, [isRecording, stopRecording])

  const handleCancelRecording = useCallback(() => {
    // Only cancel if actually recording or processing
    if (!isRecording && state !== 'processing' && state !== 'error') return

    // Cancel during recording: stop mic without transcribing
    if (isRecording) {
      window.api.sendRecordingState(false)
      stopRecording(true) // pass cancel flag
    }
    if (soundEffectsRef.current) playCancelSound()
    // Cancel during processing: bump generation so result is discarded
    genRef.current++
    // Clear any pending timeouts
    clearPendingTimeout()
    // Hide pill if setting is enabled (instantly, before idle render)
    if (hidePillWhenIdleRef.current) {
      setHidden(true)
      window.api.hideOverlay()
    }
    // Reset to idle
    setState('idle')
    setErrorMessage('')
    window.api.resizeOverlay(180, 44)
  }, [isRecording, state, stopRecording, clearPendingTimeout])

  // Listen for global hotkeys (separate start and stop)
  useEffect(() => {
    const cleanupStart = window.api.onStartRecording(() => {
      handleStartRecording()
    })
    const cleanupStop = window.api.onStopRecording(() => {
      handleStopRecording()
    })
    const cleanupCancel = window.api.onCancelRecording(() => {
      handleCancelRecording()
    })
    return () => {
      cleanupStart()
      cleanupStop()
      cleanupCancel()
    }
  }, [handleStartRecording, handleStopRecording, handleCancelRecording])

  // When hidden, render nothing so the window hides without flashing idle UI
  if (hidden) {
    return <div className="w-full h-full" />
  }

  return (
    <div
      style={{ WebkitAppRegion: 'drag' } as React.CSSProperties}
      className={`
        flex items-center justify-center gap-1 px-2 py-1.5 w-full h-full select-none
        transition-all duration-300 ease-in-out
        border border-white/[0.1]
        ${state === 'listening' ? 'recording-pulse' : ''}
        ${state === 'error' ? 'border-red-400/20' : ''}
        ${state === 'no-key' ? 'border-amber-400/20' : ''}
      `}
    >
        {state === 'idle' && (
          <>
            <IdleAnimation />
            <button
              onClick={() => window.api.openSettings()}
              style={{ WebkitAppRegion: 'no-drag' } as React.CSSProperties}
              className="ml-auto w-6 h-6 flex-shrink-0 flex items-center justify-center rounded-md text-white/30 hover:text-white/70 hover:bg-white/10 transition-all"
            >
              <CogSolid className="w-4 h-4" />
            </button>
          </>
        )}

        {state === 'listening' && (
          <WaveformVisualizer analyserNode={analyserNode} isActive={isRecording} />
        )}

        {state === 'processing' && (
          <TranscribingAnimation />
        )}

        {state === 'error' && (
          <>
            <div className="w-2 h-2 rounded-full bg-red-300" />
            <span className="text-xs text-white/90 font-medium truncate max-w-[130px]">
              {errorMessage || 'Error occurred'}
            </span>
          </>
        )}

        {state === 'no-key' && <ApiKeySetup />}
    </div>
  )
}
