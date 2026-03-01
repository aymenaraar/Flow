import { app, shell, BrowserWindow, ipcMain, screen, Tray, Menu, nativeImage } from 'electron'
import { join } from 'path'
import { is } from '@electron-toolkit/utils'
import dotenv from 'dotenv'
import { transcribeAudio, resetClient } from './groq-service'
import { pasteText } from './paste-service'
import { registerHotkeys, registerCancelHotkey, unregisterAll, setRecordingState, pauseHotkeys, resumeHotkeys } from './hotkey-manager'
import { getSettings, updateSettings } from './settings-store'
import { readFileSync, writeFileSync, existsSync } from 'fs'

// Load .env from project root
dotenv.config()

let overlayWindow: BrowserWindow | null = null
let settingsWindow: BrowserWindow | null = null
let tray: Tray | null = null
let isQuitting = false

function getIconPath(filename: string): string {
  // In dev: resources/ is at project root
  // In production: resources/ is in app.asar or next to executable
  if (is.dev) {
    return join(__dirname, '../../resources', filename)
  }
  return join(process.resourcesPath, filename)
}

function getAppIcon(): nativeImage {
  try {
    return nativeImage.createFromPath(getIconPath('icon.ico'))
  } catch {
    return nativeImage.createEmpty()
  }
}

function getTrayIcon(): nativeImage {
  try {
    // Try ICO first (contains all sizes, Windows picks the right one)
    const icoIcon = nativeImage.createFromPath(getIconPath('icon.ico'))
    if (!icoIcon.isEmpty()) {
      return icoIcon.resize({ width: 16, height: 16 })
    }
    // Fallback to 32x32 PNG resized down (sharper than 16x16)
    const png32 = nativeImage.createFromPath(getIconPath('icon-32.png'))
    if (!png32.isEmpty()) {
      return png32.resize({ width: 16, height: 16 })
    }
    // Last fallback: 256px icon resized
    const pngFull = nativeImage.createFromPath(getIconPath('icon.png'))
    if (!pngFull.isEmpty()) {
      return pngFull.resize({ width: 16, height: 16 })
    }
    return nativeImage.createEmpty()
  } catch {
    return nativeImage.createEmpty()
  }
}

function buildTrayMenu(): void {
  if (!tray) return
  const settings = getSettings()
  const contextMenu = Menu.buildFromTemplate([
    {
      label: settings.hidePillWhenIdle ? 'Show Pill' : 'Hide Pill When Idle',
      type: 'checkbox',
      checked: settings.hidePillWhenIdle,
      click: (): void => {
        const updated = updateSettings({ hidePillWhenIdle: !settings.hidePillWhenIdle })
        // Broadcast to overlay
        if (overlayWindow) {
          overlayWindow.webContents.send('settings:changed', updated)
          if (updated.hidePillWhenIdle) {
            overlayWindow.hide()
          } else {
            overlayWindow.showInactive()
          }
        }
        buildTrayMenu()
      }
    },
    { type: 'separator' },
    {
      label: 'Settings',
      click: (): void => {
        if (settingsWindow) {
          settingsWindow.show()
          settingsWindow.focus()
        }
      }
    },
    { type: 'separator' },
    {
      label: 'Quit',
      click: (): void => {
        app.exit(0)
      }
    }
  ])
  tray.setContextMenu(contextMenu)
}


function getOverlayPositionPath(): string {
  return join(app.getPath('userData'), 'overlay-position.json')
}

function saveOverlayPosition(x: number, y: number): void {
  try {
    writeFileSync(getOverlayPositionPath(), JSON.stringify({ x, y }))
  } catch { /* ignore */ }
}

function loadOverlayPosition(): { x: number; y: number } | null {
  try {
    const path = getOverlayPositionPath()
    if (existsSync(path)) {
      return JSON.parse(readFileSync(path, 'utf-8'))
    }
  } catch { /* ignore */ }
  return null
}

function createOverlayWindow(): BrowserWindow {
  const primaryDisplay = screen.getPrimaryDisplay()
  const { width: screenWidth, height: screenHeight } = primaryDisplay.workAreaSize

  const windowWidth = 180
  const windowHeight = 44

  const savedPos = loadOverlayPosition()
  const initialX = savedPos ? savedPos.x : Math.round((screenWidth - windowWidth) / 2)
  const initialY = savedPos ? savedPos.y : screenHeight - windowHeight - 40

  const isMac = process.platform === 'darwin'

  const win = new BrowserWindow({
    width: windowWidth,
    height: windowHeight,
    x: initialX,
    y: initialY,
    icon: getAppIcon(),
    show: false,
    transparent: isMac,
    frame: false,
    alwaysOnTop: true,
    skipTaskbar: true,
    resizable: false,
    hasShadow: true,
    focusable: false,
    ...(isMac
      ? { vibrancy: 'under-window' as const, visualEffectState: 'active' as const }
      : { backgroundMaterial: 'acrylic' as const }),
    roundedCorners: true,
    titleBarStyle: 'customButtonsOnHover',
    trafficLightPosition: { x: -20, y: -20 },
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      sandbox: false,
      contextIsolation: true,
      nodeIntegration: false
    }
  })

  // Hide traffic lights completely on macOS overlay — must re-hide on every show
  if (isMac) {
    win.setWindowButtonVisibility(false)
    win.on('show', () => {
      win.setWindowButtonVisibility(false)
    })
  }

  // Save position when the window is moved (via -webkit-app-region: drag)
  win.on('moved', () => {
    const [x, y] = win.getPosition()
    saveOverlayPosition(x, y)
  })

  // Prevent the window from being closed, just hide it (unless app is quitting)
  win.on('close', (e) => {
    if (!isQuitting) {
      e.preventDefault()
      win.hide()
    }
  })

  if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
    win.loadURL(`${process.env['ELECTRON_RENDERER_URL']}?window=overlay`)
  } else {
    win.loadFile(join(__dirname, '../renderer/index.html'), {
      search: 'window=overlay'
    })
  }

  return win
}

function createSettingsWindow(): BrowserWindow {
  const isMac = process.platform === 'darwin'

  const win = new BrowserWindow({
    width: 500,
    height: 640,
    icon: getAppIcon(),
    show: false,
    title: 'Flow Settings',
    resizable: true,
    minimizable: true,
    maximizable: false,
    frame: false,
    transparent: isMac,
    ...(isMac
      ? { vibrancy: 'under-window' as const, visualEffectState: 'active' as const }
      : { backgroundMaterial: 'acrylic' as const }),
    hasShadow: true,
    roundedCorners: true,
    titleBarStyle: 'customButtonsOnHover',
    trafficLightPosition: { x: -20, y: -20 },
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      sandbox: false,
      contextIsolation: true,
      nodeIntegration: false
    }
  })

  // Hide traffic lights completely on macOS settings — must re-hide on every show
  if (isMac) {
    win.setWindowButtonVisibility(false)
    win.on('show', () => {
      win.setWindowButtonVisibility(false)
    })
  }

  win.setMenuBarVisibility(false)

  win.on('close', (e) => {
    if (!isQuitting) {
      e.preventDefault()
      win.hide()
    }
  })

  win.webContents.setWindowOpenHandler((details) => {
    shell.openExternal(details.url)
    return { action: 'deny' }
  })

  if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
    win.loadURL(`${process.env['ELECTRON_RENDERER_URL']}?window=settings`)
  } else {
    win.loadFile(join(__dirname, '../renderer/index.html'), {
      search: 'window=settings'
    })
  }

  return win
}

function setupIPC(): void {
  // Resize overlay dynamically (keep current x position, only adjust size)
  ipcMain.on('overlay:resize', (_event, width: number, height: number) => {
    if (overlayWindow) {
      const bounds = overlayWindow.getBounds()
      overlayWindow.setBounds({
        x: bounds.x,
        y: bounds.y,
        width,
        height
      })
    }
  })

  // Track recording state for toggle hotkey
  ipcMain.on('recording:state', (_event, recording: boolean) => {
    setRecordingState(recording)
  })

  // Transcribe audio
  ipcMain.handle(
    'recording:transcribe',
    async (_event, audioBase64: string): Promise<string> => {
      try {
        const audioBuffer = Buffer.from(audioBase64, 'base64')
        const text = await transcribeAudio(audioBuffer)

        if (text && text.length > 0) {
          await pasteText(text)
        }

        return text
      } catch (error) {
        console.error('Transcription error:', error)
        throw error
      }
    }
  )

  // Settings
  ipcMain.handle('settings:get', () => {
    return getSettings()
  })

  ipcMain.handle('settings:update', (_event, newSettings) => {
    const updated = updateSettings(newSettings)
    // Reset Groq client so it picks up new API key
    resetClient()
    // Re-register hotkeys if they changed
    if ((newSettings.startHotkey || newSettings.stopHotkey) && overlayWindow) {
      registerHotkeys(overlayWindow, updated.startHotkey, updated.stopHotkey)
      registerCancelHotkey(overlayWindow)
    }
    // Broadcast settings change to overlay
    if (overlayWindow) {
      overlayWindow.webContents.send('settings:changed', updated)
    }
    // Handle hide pill setting change
    if (newSettings.hidePillWhenIdle !== undefined && overlayWindow) {
      if (updated.hidePillWhenIdle) {
        overlayWindow.hide()
      } else {
        overlayWindow.showInactive()
      }
    }
    // Rebuild tray menu to reflect new state
    buildTrayMenu()
    return updated
  })

  ipcMain.on('settings:open', () => {
    if (settingsWindow) {
      settingsWindow.show()
      settingsWindow.focus()
    }
  })

  ipcMain.on('settings:close', () => {
    if (settingsWindow) {
      settingsWindow.hide()
    }
  })

  // Overlay show/hide
  ipcMain.on('overlay:show', () => {
    if (overlayWindow) {
      overlayWindow.showInactive()
    }
  })

  ipcMain.on('overlay:hide', () => {
    if (overlayWindow) {
      overlayWindow.hide()
    }
  })

  ipcMain.on('settings:minimize', () => {
    if (settingsWindow) {
      settingsWindow.minimize()
    }
  })

  // Pause/resume hotkeys during hotkey capture in settings
  ipcMain.on('hotkeys:pause', () => {
    pauseHotkeys()
  })

  ipcMain.on('hotkeys:resume', () => {
    if (overlayWindow) {
      resumeHotkeys(overlayWindow)
    }
  })
}

app.whenReady().then(() => {
  setupIPC()

  overlayWindow = createOverlayWindow()
  settingsWindow = createSettingsWindow()

  // Register global hotkeys
  const settings = getSettings()
  registerHotkeys(overlayWindow, settings.startHotkey, settings.stopHotkey)
  registerCancelHotkey(overlayWindow)

  // Show overlay only once content is ready, and only if not set to hidden
  overlayWindow.once('ready-to-show', () => {
    if (!getSettings().hidePillWhenIdle) {
      overlayWindow?.showInactive()
    }
  })

  // Create tray icon
  tray = new Tray(getTrayIcon())
  tray.setToolTip('Flow')
  buildTrayMenu()

  // Left-click on tray opens settings
  tray.on('click', () => {
    if (settingsWindow) {
      settingsWindow.show()
      settingsWindow.focus()
    }
  })
})

app.on('before-quit', () => {
  isQuitting = true
})

app.on('will-quit', () => {
  unregisterAll()
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

// Handle SIGTERM/SIGINT so the app exits when the dev server is killed
process.on('SIGTERM', () => {
  isQuitting = true
  app.quit()
})

process.on('SIGINT', () => {
  isQuitting = true
  app.quit()
})
