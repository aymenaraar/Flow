import Groq from 'groq-sdk'
import { getSettings } from './settings-store'
import { File } from 'buffer'

let groqClient: Groq | null = null

function getClient(): Groq {
  const settings = getSettings()
  const apiKey = settings.groqApiKey || process.env.GROQ_API_KEY

  if (!apiKey) {
    throw new Error('Groq API key is not configured. Please set it in settings.')
  }

  if (!groqClient) {
    groqClient = new Groq({ apiKey })
  }

  return groqClient
}

export function resetClient(): void {
  groqClient = null
}

export async function transcribeAudio(audioBuffer: Buffer): Promise<string> {
  const client = getClient()

  const file = new File([audioBuffer], 'recording.webm', { type: 'audio/webm' })

  const transcription = await client.audio.transcriptions.create({
    file: file,
    model: 'whisper-large-v3-turbo',
    response_format: 'text'
  })

  return (transcription as unknown as string).trim()
}
