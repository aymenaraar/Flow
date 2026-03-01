import { globalShortcut, BrowserWindow } from 'electron'

function isValidHotkey(hotkey: string): boolean {
  if (!hotkey || !hotkey.trim()) return false
  // Electron accelerators must be ASCII-only
  if (!/^[\x00-\x7F]+$/.test(hotkey)) return false
  // A valid accelerator must end with a non-modifier key
  const parts = hotkey.split('+').map((p) => p.trim())
  const modifiers = ['ctrl', 'control', 'alt', 'option', 'shift', 'super', 'meta', 'command', 'cmd', 'commandorcontrol', 'cmdorctrl']
  const lastPart = parts[parts.length - 1]?.toLowerCase()
  // If the last part is empty or is a modifier, the hotkey is invalid
  if (!lastPart || modifiers.includes(lastPart)) return false
  return true
}

let registeredStartHotkey: string | null = null
let registeredStopHotkey: string | null = null
let registeredToggleHotkey: string | null = null
let registeredCancelHotkey: string | null = null
let isToggleMode = false
let isRecording = false

export function setRecordingState(recording: boolean): void {
  isRecording = recording
}

export function registerStartHotkey(
  overlayWindow: BrowserWindow,
  hotkey: string
): boolean {
  unregisterStartHotkey()

  try {
    const success = globalShortcut.register(hotkey, () => {
      overlayWindow.webContents.send('hotkey:start-recording')
    })

    if (success) {
      registeredStartHotkey = hotkey
      console.log(`Start hotkey registered: ${hotkey}`)
    } else {
      console.error(`Failed to register start hotkey: ${hotkey}`)
    }

    return success
  } catch (err) {
    console.error(`Error registering start hotkey "${hotkey}":`, err)
    return false
  }
}

export function registerStopHotkey(
  overlayWindow: BrowserWindow,
  hotkey: string
): boolean {
  unregisterStopHotkey()

  try {
    const success = globalShortcut.register(hotkey, () => {
      overlayWindow.webContents.send('hotkey:stop-recording')
    })

    if (success) {
      registeredStopHotkey = hotkey
      console.log(`Stop hotkey registered: ${hotkey}`)
    } else {
      console.error(`Failed to register stop hotkey: ${hotkey}`)
    }

    return success
  } catch (err) {
    console.error(`Error registering stop hotkey "${hotkey}":`, err)
    return false
  }
}

function registerToggleHotkey(
  overlayWindow: BrowserWindow,
  hotkey: string
): boolean {
  unregisterToggleHotkey()

  try {
    const success = globalShortcut.register(hotkey, () => {
      if (isRecording) {
        overlayWindow.webContents.send('hotkey:stop-recording')
      } else {
        overlayWindow.webContents.send('hotkey:start-recording')
      }
    })

    if (success) {
      registeredToggleHotkey = hotkey
      console.log(`Toggle hotkey registered: ${hotkey} (same key for start/stop)`)
    } else {
      console.error(`Failed to register toggle hotkey: ${hotkey}`)
    }

    return success
  } catch (err) {
    console.error(`Error registering toggle hotkey "${hotkey}":`, err)
    return false
  }
}

export function registerHotkeys(
  overlayWindow: BrowserWindow,
  startHotkey: string,
  stopHotkey: string
): void {
  // Unregister everything first
  unregisterAll()
  isRecording = false

  // Validate hotkeys before registering — fall back to defaults if invalid
  const defaultHotkey = process.platform === 'darwin' ? 'Option+Space' : 'Ctrl+Space'
  const validStart = isValidHotkey(startHotkey) ? startHotkey : defaultHotkey
  const validStop = isValidHotkey(stopHotkey) ? stopHotkey : defaultHotkey

  if (validStart !== startHotkey || validStop !== stopHotkey) {
    console.warn(`Invalid hotkey detected. start: "${startHotkey}" -> "${validStart}", stop: "${stopHotkey}" -> "${validStop}"`)
  }

  if (validStart === validStop) {
    // Same key for start and stop — use toggle mode
    isToggleMode = true
    registerToggleHotkey(overlayWindow, validStart)
  } else {
    // Different keys — register separately
    isToggleMode = false
    registerStartHotkey(overlayWindow, validStart)
    registerStopHotkey(overlayWindow, validStop)
  }
}

export function unregisterStartHotkey(): void {
  if (registeredStartHotkey) {
    globalShortcut.unregister(registeredStartHotkey)
    registeredStartHotkey = null
  }
}

export function unregisterStopHotkey(): void {
  if (registeredStopHotkey) {
    globalShortcut.unregister(registeredStopHotkey)
    registeredStopHotkey = null
  }
}

function unregisterToggleHotkey(): void {
  if (registeredToggleHotkey) {
    globalShortcut.unregister(registeredToggleHotkey)
    registeredToggleHotkey = null
  }
}

export function registerCancelHotkey(
  overlayWindow: BrowserWindow
): boolean {
  unregisterCancelHotkey()

  const success = globalShortcut.register('Escape', () => {
    overlayWindow.webContents.send('hotkey:cancel-recording')
  })

  if (success) {
    registeredCancelHotkey = 'Escape'
    console.log('Cancel hotkey registered: Escape')
  } else {
    console.error('Failed to register cancel hotkey: Escape')
  }

  return success
}

export function unregisterCancelHotkey(): void {
  if (registeredCancelHotkey) {
    globalShortcut.unregister(registeredCancelHotkey)
    registeredCancelHotkey = null
  }
}

export function unregisterAll(): void {
  globalShortcut.unregisterAll()
  registeredStartHotkey = null
  registeredStopHotkey = null
  registeredToggleHotkey = null
  registeredCancelHotkey = null
  isToggleMode = false
}

// Temporarily pause all hotkeys (unregister without clearing state)
let pausedHotkeys: { start: string | null; stop: string | null; toggle: string | null; cancel: string | null } | null = null

export function pauseHotkeys(): void {
  pausedHotkeys = {
    start: registeredStartHotkey,
    stop: registeredStopHotkey,
    toggle: registeredToggleHotkey,
    cancel: registeredCancelHotkey
  }
  globalShortcut.unregisterAll()
  console.log('Hotkeys paused for hotkey capture')
}

export function resumeHotkeys(overlayWindow: BrowserWindow): void {
  if (!pausedHotkeys) return
  const { start, stop, toggle, cancel } = pausedHotkeys
  pausedHotkeys = null

  if (toggle) {
    isToggleMode = true
    registerToggleHotkey(overlayWindow, toggle)
  } else {
    isToggleMode = false
    if (start) registerStartHotkey(overlayWindow, start)
    if (stop) registerStopHotkey(overlayWindow, stop)
  }
  if (cancel) registerCancelHotkey(overlayWindow)
  console.log('Hotkeys resumed after hotkey capture')
}
