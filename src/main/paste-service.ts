import { clipboard } from 'electron'
import { exec } from 'child_process'

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

function simulatePaste(): Promise<void> {
  return new Promise((resolve, reject) => {
    const platform = process.platform

    let command: string

    if (platform === 'darwin') {
      // macOS: Use AppleScript to simulate Cmd+V
      command = `osascript -e 'tell application "System Events" to keystroke "v" using command down'`
    } else if (platform === 'win32') {
      // Windows: Use PowerShell SendKeys
      command = `powershell -command "Add-Type -AssemblyName System.Windows.Forms; [System.Windows.Forms.SendKeys]::SendWait('^v')"`
    } else {
      // Linux: Use xdotool
      command = `xdotool key ctrl+v`
    }

    exec(command, (error) => {
      if (error) {
        console.error('Failed to simulate paste:', error)
        reject(error)
        return
      }
      resolve()
    })
  })
}

export async function pasteText(text: string): Promise<void> {
  // Save current clipboard content
  const previousClipboard = clipboard.readText()

  // Write transcribed text to clipboard
  clipboard.writeText(text)

  // Small delay to ensure clipboard is ready
  await sleep(100)

  // Simulate paste keystroke
  await simulatePaste()

  // Restore original clipboard after a delay
  await sleep(500)
  clipboard.writeText(previousClipboard)
}
