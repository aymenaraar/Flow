import { clipboard } from 'electron'
import { exec } from 'child_process'

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

export async function pasteText(text: string): Promise<void> {
  // Save current clipboard content
  const previousClipboard = clipboard.readText()

  // Write transcribed text to clipboard
  clipboard.writeText(text)

  // Small delay to ensure clipboard is ready
  await sleep(100)

  // Simulate Ctrl+V using PowerShell SendKeys
  return new Promise((resolve, reject) => {
    exec(
      'powershell -command "Add-Type -AssemblyName System.Windows.Forms; [System.Windows.Forms.SendKeys]::SendWait(\'^v\')"',
      (error) => {
        if (error) {
          console.error('Failed to simulate paste:', error)
          reject(error)
          return
        }

        // Restore original clipboard after a delay
        setTimeout(() => {
          clipboard.writeText(previousClipboard)
          resolve()
        }, 500)
      }
    )
  })
}
