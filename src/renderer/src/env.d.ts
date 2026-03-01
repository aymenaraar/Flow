/// <reference types="vite/client" />

interface AppSettings {
  groqApiKey: string
  startHotkey: string
  stopHotkey: string
  language: string
  hidePillWhenIdle: boolean
}

interface ElectronAPI {
  onStartRecording: (callback: () => void) => () => void
  onStopRecording: (callback: () => void) => () => void
  onCancelRecording: (callback: () => void) => () => void
  sendAudioForTranscription: (audioBase64: string) => Promise<string>
  sendRecordingState: (recording: boolean) => void
  resizeOverlay: (width: number, height: number) => void
  showOverlay: () => void
  hideOverlay: () => void
  onSettingsChanged: (callback: (settings: AppSettings) => void) => () => void
  getSettings: () => Promise<AppSettings>
  updateSettings: (settings: Partial<AppSettings>) => Promise<AppSettings>
  openSettings: () => void
  closeSettings: () => void
  minimizeSettings: () => void
}

interface Window {
  api: ElectronAPI
}
