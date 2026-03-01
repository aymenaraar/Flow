import { contextBridge, ipcRenderer } from 'electron'

export interface AppSettings {
  groqApiKey: string
  startHotkey: string
  stopHotkey: string
  language: string
  hidePillWhenIdle: boolean
  soundEffects: boolean
}

const api = {
  // Recording
  onStartRecording: (callback: () => void): (() => void) => {
    const listener = (): void => callback()
    ipcRenderer.on('hotkey:start-recording', listener)
    return () => ipcRenderer.removeListener('hotkey:start-recording', listener)
  },

  onStopRecording: (callback: () => void): (() => void) => {
    const listener = (): void => callback()
    ipcRenderer.on('hotkey:stop-recording', listener)
    return () => ipcRenderer.removeListener('hotkey:stop-recording', listener)
  },

  onCancelRecording: (callback: () => void): (() => void) => {
    const listener = (): void => callback()
    ipcRenderer.on('hotkey:cancel-recording', listener)
    return () => ipcRenderer.removeListener('hotkey:cancel-recording', listener)
  },

  sendAudioForTranscription: (audioBase64: string): Promise<string> => {
    return ipcRenderer.invoke('recording:transcribe', audioBase64)
  },

  sendRecordingState: (recording: boolean): void => {
    ipcRenderer.send('recording:state', recording)
  },

  // Overlay control
  resizeOverlay: (width: number, height: number): void => {
    ipcRenderer.send('overlay:resize', width, height)
  },

  showOverlay: (): void => {
    ipcRenderer.send('overlay:show')
  },

  hideOverlay: (): void => {
    ipcRenderer.send('overlay:hide')
  },

  onSettingsChanged: (callback: (settings: AppSettings) => void): (() => void) => {
    const listener = (_event: Electron.IpcRendererEvent, settings: AppSettings): void => callback(settings)
    ipcRenderer.on('settings:changed', listener)
    return () => ipcRenderer.removeListener('settings:changed', listener)
  },

  // Settings
  getSettings: (): Promise<AppSettings> => {
    return ipcRenderer.invoke('settings:get')
  },

  updateSettings: (settings: Partial<AppSettings>): Promise<AppSettings> => {
    return ipcRenderer.invoke('settings:update', settings)
  },

  openSettings: (): void => {
    ipcRenderer.send('settings:open')
  },

  closeSettings: (): void => {
    ipcRenderer.send('settings:close')
  },

  minimizeSettings: (): void => {
    ipcRenderer.send('settings:minimize')
  },

  pauseHotkeys: (): void => {
    ipcRenderer.send('hotkeys:pause')
  },

  resumeHotkeys: (): void => {
    ipcRenderer.send('hotkeys:resume')
  }
}

contextBridge.exposeInMainWorld('api', api)

export type ElectronAPI = typeof api
