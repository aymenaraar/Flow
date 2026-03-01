import { app } from 'electron'
import * as fs from 'fs'
import * as path from 'path'
import * as os from 'os'

export interface AppSettings {
  groqApiKey: string
  startHotkey: string
  stopHotkey: string
  language: string
  hidePillWhenIdle: boolean
  soundEffects: boolean
}

const isMac = os.platform() === 'darwin'

const DEFAULT_SETTINGS: AppSettings = {
  groqApiKey: '',
  startHotkey: isMac ? 'Option+Space' : 'Ctrl+Space',
  stopHotkey: isMac ? 'Option+Space' : 'Ctrl+Space',
  language: 'en',
  hidePillWhenIdle: false,
  soundEffects: true
}

function getSettingsPath(): string {
  return path.join(app.getPath('userData'), 'settings.json')
}

export function getSettings(): AppSettings {
  try {
    const settingsPath = getSettingsPath()
    if (fs.existsSync(settingsPath)) {
      const data = fs.readFileSync(settingsPath, 'utf-8')
      return { ...DEFAULT_SETTINGS, ...JSON.parse(data) }
    }
  } catch (error) {
    console.error('Failed to read settings:', error)
  }
  return { ...DEFAULT_SETTINGS }
}

export function updateSettings(newSettings: Partial<AppSettings>): AppSettings {
  const current = getSettings()
  const updated = { ...current, ...newSettings }

  try {
    const settingsPath = getSettingsPath()
    fs.writeFileSync(settingsPath, JSON.stringify(updated, null, 2), 'utf-8')
  } catch (error) {
    console.error('Failed to write settings:', error)
  }

  return updated
}
