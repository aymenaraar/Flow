import { useState, useEffect, useCallback, useRef } from 'react'
import { EyeSolid, EyeOffSolid, XSolid, KeyboardSolid, MinusSolid, ChevronDownSolid } from '@mynaui/icons-react'

type RecordingTarget = 'startHotkey' | 'stopHotkey' | null

function electronKeyFromEvent(e: KeyboardEvent): string | null {
  const modifiers: string[] = []
  if (e.ctrlKey) modifiers.push('Ctrl')
  if (e.altKey) modifiers.push('Alt')
  if (e.shiftKey) modifiers.push('Shift')
  if (e.metaKey) modifiers.push('Super')

  // Ignore if only modifier keys are pressed
  const modifierKeys = ['Control', 'Alt', 'Shift', 'Meta']
  if (modifierKeys.includes(e.key)) return null

  // Need at least one modifier
  if (modifiers.length === 0) return null

  // Map special keys to Electron accelerator format
  const keyMap: Record<string, string> = {
    ' ': 'Space',
    ArrowUp: 'Up',
    ArrowDown: 'Down',
    ArrowLeft: 'Left',
    ArrowRight: 'Right',
    Escape: 'Escape',
    Enter: 'Return',
    Backspace: 'Backspace',
    Delete: 'Delete',
    Tab: 'Tab',
    Home: 'Home',
    End: 'End',
    PageUp: 'PageUp',
    PageDown: 'PageDown',
    Insert: 'Insert',
    F1: 'F1', F2: 'F2', F3: 'F3', F4: 'F4',
    F5: 'F5', F6: 'F6', F7: 'F7', F8: 'F8',
    F9: 'F9', F10: 'F10', F11: 'F11', F12: 'F12'
  }

  const key = keyMap[e.key] || e.key.toUpperCase()
  return [...modifiers, key].join('+')
}

function HotkeyDisplay({ hotkey, label }: { hotkey: string; label: string }): JSX.Element {
  return (
    <div className="flex items-center gap-3">
      <div className="inline-flex items-center gap-1">
        {hotkey.split('+').map((key, i) => (
          <span key={i}>
            <kbd className="px-2.5 py-1.5 rounded-md bg-white/[0.06] border border-white/[0.1] text-xs font-mono text-white/70 shadow-sm">
              {key}
            </kbd>
            {i < hotkey.split('+').length - 1 && (
              <span className="text-white/20 mx-0.5">+</span>
            )}
          </span>
        ))}
      </div>
      <span className="text-[11px] text-white/30">{label}</span>
    </div>
  )
}

function LanguageDropdown({
  value,
  languages,
  onChange
}: {
  value: string
  languages: { code: string; name: string }[]
  onChange: (code: string) => void
}): JSX.Element {
  const [open, setOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  const selectedName = languages.find((l) => l.code === value)?.name || 'English'

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent): void => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    if (open) {
      document.addEventListener('mousedown', handleClickOutside)
      return () => document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [open])

  return (
    <div className="space-y-2.5">
      <label className="text-xs font-medium uppercase tracking-wider text-white/50">
        Language
      </label>
      <div ref={dropdownRef} className="relative">
        <button
          type="button"
          onClick={() => setOpen(!open)}
          className={`w-full h-10 rounded-lg bg-white/[0.06] border px-3.5 text-sm text-white/90 flex items-center justify-between transition-all cursor-pointer ${
            open
              ? 'border-purple-400/50 ring-1 ring-purple-400/20'
              : 'border-white/[0.08] hover:bg-white/[0.08]'
          }`}
        >
          <span>{selectedName}</span>
          <ChevronDownSolid
            className={`w-4 h-4 text-white/30 transition-transform duration-200 ${
              open ? 'rotate-180' : ''
            }`}
          />
        </button>

        {open && (
          <div className="absolute z-50 mt-1.5 w-full rounded-xl bg-black/80 backdrop-blur-xl border border-white/[0.1] shadow-2xl shadow-black/50 overflow-hidden">
            <div className="max-h-52 overflow-y-auto custom-scrollbar py-1">
              {languages.map((lang) => (
                <button
                  key={lang.code}
                  onClick={() => {
                    onChange(lang.code)
                    setOpen(false)
                  }}
                  className={`w-full px-3.5 py-2.5 text-left text-sm transition-all ${
                    lang.code === value
                      ? 'text-purple-300 bg-purple-500/15'
                      : 'text-white/75 hover:text-white/95 hover:bg-white/[0.06]'
                  }`}
                >
                  {lang.name}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
      <p className="text-[11px] text-white/35">Language for speech recognition</p>
    </div>
  )
}

export function SettingsPanel(): JSX.Element {
  const [settings, setSettings] = useState<AppSettings>({
    groqApiKey: '',
    startHotkey: 'Ctrl+Space',
    stopHotkey: 'Ctrl+Space',
    language: 'en',
    hidePillWhenIdle: false,
    soundEffects: true
  })
  const [showApiKey, setShowApiKey] = useState(false)
  const [loading, setLoading] = useState(true)
  const [recordingTarget, setRecordingTarget] = useState<RecordingTarget>(null)
  const initialLoadRef = useRef(true)

  useEffect(() => {
    window.api.getSettings().then((s) => {
      setSettings(s)
      setLoading(false)
      // Allow autosave after initial load completes
      setTimeout(() => { initialLoadRef.current = false }, 100)
    })
  }, [])

  // Autosave whenever settings change (skip the initial load)
  useEffect(() => {
    if (initialLoadRef.current || loading) return
    const timeout = setTimeout(() => {
      window.api.updateSettings(settings)
    }, 300)
    return () => clearTimeout(timeout)
  }, [settings, loading])

  // Hotkey recording listener
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (!recordingTarget) return
      e.preventDefault()
      e.stopPropagation()

      // Escape cancels recording
      if (e.key === 'Escape') {
        setRecordingTarget(null)
        return
      }

      const combo = electronKeyFromEvent(e)
      if (combo) {
        setSettings((prev) => ({ ...prev, [recordingTarget]: combo }))
        setRecordingTarget(null)
      }
    },
    [recordingTarget]
  )

  useEffect(() => {
    if (recordingTarget) {
      window.addEventListener('keydown', handleKeyDown, true)
      return () => window.removeEventListener('keydown', handleKeyDown, true)
    }
  }, [recordingTarget, handleKeyDown])

  const languages = [
    { code: 'en', name: 'English' },
    { code: 'es', name: 'Spanish' },
    { code: 'fr', name: 'French' },
    { code: 'de', name: 'German' },
    { code: 'it', name: 'Italian' },
    { code: 'pt', name: 'Portuguese' },
    { code: 'ja', name: 'Japanese' },
    { code: 'ko', name: 'Korean' },
    { code: 'zh', name: 'Chinese' },
    { code: 'ru', name: 'Russian' },
    { code: 'ar', name: 'Arabic' },
    { code: 'hi', name: 'Hindi' }
  ]

  if (loading) {
    return (
      <div
        className="h-screen flex items-center justify-center"
      >
        <div className="text-white/40 text-sm">Loading...</div>
      </div>
    )
  }

  return (
    <div
      className="h-screen flex flex-col overflow-hidden border border-white/[0.08] rounded-lg"
    >
      {/* Custom title bar */}
      <div
        className="flex items-center justify-between pl-5 pr-3.5 py-3"
        style={{ WebkitAppRegion: 'drag' } as React.CSSProperties}
      >
        <div className="flex items-center gap-2.5">
          <div className="w-2 h-2 rounded-full bg-purple-400/80" />
          <span className="text-white/90 text-sm font-semibold tracking-tight">
            Flow Settings
          </span>
        </div>
        <div className="flex items-center gap-1" style={{ WebkitAppRegion: 'no-drag' } as React.CSSProperties}>
          <button
            onClick={() => window.api.minimizeSettings()}
            className="w-7 h-7 flex items-center justify-center rounded-md text-white/40 hover:text-white/90 hover:bg-white/10 transition-all"
          >
            <MinusSolid className="w-4 h-4" />
          </button>
          <button
            onClick={() => window.api.closeSettings()}
            className="w-7 h-7 flex items-center justify-center rounded-md text-white/40 hover:text-white/90 hover:bg-red-500/30 transition-all"
          >
            <XSolid className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto px-6 pt-5 pb-6 custom-scrollbar">
        <div className="space-y-6">
          {/* API Key */}
          <div className="space-y-2.5">
            <label className="text-xs font-medium uppercase tracking-wider text-white/50">
              Groq API Key
            </label>
            <div className="relative">
              <input
                type={showApiKey ? 'text' : 'password'}
                value={settings.groqApiKey}
                onChange={(e) => setSettings({ ...settings, groqApiKey: e.target.value })}
                placeholder="gsk_..."
                className="w-full h-10 rounded-lg bg-white/[0.06] border border-white/[0.08] px-3.5 pr-10 text-sm text-white/90 placeholder:text-white/25 focus:outline-none focus:border-purple-400/50 focus:ring-1 focus:ring-purple-400/20 transition-all"
              />
              <button
                type="button"
                onClick={() => setShowApiKey(!showApiKey)}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/70 transition-colors"
              >
                {showApiKey ? <EyeOffSolid className="w-4 h-4" /> : <EyeSolid className="w-4 h-4" />}
              </button>
            </div>
            <p className="text-[11px] text-white/35 leading-relaxed">
              Get your free API key from{' '}
              <a
                href="https://console.groq.com/keys"
                className="text-purple-400/80 hover:text-purple-300 underline underline-offset-2 transition-colors"
                target="_blank"
                rel="noreferrer"
              >
                console.groq.com
              </a>
            </p>
          </div>

          {/* Start Hotkey */}
          <div className="space-y-2.5">
            <label className="text-xs font-medium uppercase tracking-wider text-white/50">
              Start Recording Hotkey
            </label>
            {recordingTarget === 'startHotkey' ? (
              <div className="flex items-center gap-3 h-10 px-3.5 rounded-lg bg-purple-500/15 border border-purple-400/30 animate-pulse">
                <KeyboardSolid className="w-4 h-4 text-purple-300" />
                <span className="text-xs text-purple-200 font-medium">
                  Press your desired key combination...
                </span>
                <button
                  onClick={() => setRecordingTarget(null)}
                  className="ml-auto text-white/40 hover:text-white/70 transition-colors"
                >
                  <XSolid className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : (
              <div className="flex items-center justify-between">
                <HotkeyDisplay hotkey={settings.startHotkey} label="Starts listening" />
                <button
                  onClick={() => setRecordingTarget('startHotkey')}
                  className="px-3 py-1.5 rounded-md bg-white/[0.06] border border-white/[0.08] text-[11px] text-white/50 hover:text-white/80 hover:bg-white/[0.1] transition-all"
                >
                  Change
                </button>
              </div>
            )}
          </div>

          {/* Stop Hotkey */}
          <div className="space-y-2.5">
            <label className="text-xs font-medium uppercase tracking-wider text-white/50">
              Stop Recording Hotkey
            </label>
            {recordingTarget === 'stopHotkey' ? (
              <div className="flex items-center gap-3 h-10 px-3.5 rounded-lg bg-purple-500/15 border border-purple-400/30 animate-pulse">
                <KeyboardSolid className="w-4 h-4 text-purple-300" />
                <span className="text-xs text-purple-200 font-medium">
                  Press your desired key combination...
                </span>
                <button
                  onClick={() => setRecordingTarget(null)}
                  className="ml-auto text-white/40 hover:text-white/70 transition-colors"
                >
                  <XSolid className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : (
              <div className="flex items-center justify-between">
                <HotkeyDisplay hotkey={settings.stopHotkey} label="Stops & transcribes" />
                <button
                  onClick={() => setRecordingTarget('stopHotkey')}
                  className="px-3 py-1.5 rounded-md bg-white/[0.06] border border-white/[0.08] text-[11px] text-white/50 hover:text-white/80 hover:bg-white/[0.1] transition-all"
                >
                  Change
                </button>
              </div>
            )}
            <p className="text-[11px] text-white/35">
              Press Escape while recording a hotkey to cancel
            </p>
          </div>

          {/* Language */}
          <LanguageDropdown
            value={settings.language}
            languages={languages}
            onChange={(code) => setSettings({ ...settings, language: code })}
          />

          {/* Behavior */}
          <div className="space-y-2.5">
            <label className="text-xs font-medium uppercase tracking-wider text-white/50">
              Behavior
            </label>
            <div
              className="flex items-center justify-between h-10 px-3.5 rounded-lg bg-white/[0.06] border border-white/[0.08] cursor-pointer hover:bg-white/[0.08] transition-all"
              onClick={() => setSettings({ ...settings, hidePillWhenIdle: !settings.hidePillWhenIdle })}
            >
              <span className="text-sm text-white/80">Hide pill when idle</span>
              <div
                className={`relative w-9 h-5 rounded-full transition-colors duration-200 ${
                  settings.hidePillWhenIdle ? 'bg-purple-500/60' : 'bg-white/[0.12]'
                }`}
              >
                <div
                  className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow-sm transition-transform duration-200 ${
                    settings.hidePillWhenIdle ? 'translate-x-4' : 'translate-x-0.5'
                  }`}
                />
              </div>
            </div>
            <p className="text-[11px] text-white/35 leading-relaxed">
              Hide the floating pill when not recording. It will appear automatically when you start recording.
            </p>
            <div
              className="flex items-center justify-between h-10 px-3.5 rounded-lg bg-white/[0.06] border border-white/[0.08] cursor-pointer hover:bg-white/[0.08] transition-all"
              onClick={() => setSettings({ ...settings, soundEffects: !settings.soundEffects })}
            >
              <span className="text-sm text-white/80">Sound effects</span>
              <div
                className={`relative w-9 h-5 rounded-full transition-colors duration-200 ${
                  settings.soundEffects ? 'bg-purple-500/60' : 'bg-white/[0.12]'
                }`}
              >
                <div
                  className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow-sm transition-transform duration-200 ${
                    settings.soundEffects ? 'translate-x-4' : 'translate-x-0.5'
                  }`}
                />
              </div>
            </div>
            <p className="text-[11px] text-white/35 leading-relaxed">
              Play subtle sound cues when starting, stopping, and completing transcription.
            </p>
          </div>

        </div>
      </div>

    </div>
  )
}
