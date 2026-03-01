import { globalShortcut, BrowserWindow } from 'electron'

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
}

export function registerStopHotkey(
  overlayWindow: BrowserWindow,
  hotkey: string
): boolean {
  unregisterStopHotkey()

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
}

function registerToggleHotkey(
  overlayWindow: BrowserWindow,
  hotkey: string
): boolean {
  unregisterToggleHotkey()

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
}

export function registerHotkeys(
  overlayWindow: BrowserWindow,
  startHotkey: string,
  stopHotkey: string
): void {
  // Unregister everything first
  unregisterAll()
  isRecording = false

  if (startHotkey === stopHotkey) {
    // Same key for start and stop — use toggle mode
    isToggleMode = true
    registerToggleHotkey(overlayWindow, startHotkey)
  } else {
    // Different keys — register separately
    isToggleMode = false
    registerStartHotkey(overlayWindow, startHotkey)
    registerStopHotkey(overlayWindow, stopHotkey)
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
