# Flow

> **This entire app was built using [Zilver Locale](https://discord.gg/VGkyjNBzsC)** (not publicly available yet — join the Discord for early access) **with Claude Opus 4.6 for a total cost of $32.93.**

A lightweight voice-to-text desktop app. Press a hotkey, speak, and your transcribed text is instantly pasted into whatever application you're working in.

Built with Electron, React, and the Groq Whisper API.

![Flow](resources/icon.png)

## Download

| Platform | Link |
|----------|------|
| Windows | [Flow Setup 1.0.0.exe](https://cdn.zilver.com/Flow%20Setup%201.0.0.exe) |
| macOS (Apple Silicon) | [Flow-1.0.0-arm64.dmg](https://cdn.zilver.com/Flow-1.0.0-arm64.dmg) |

## How It Works

1. Press the hotkey (default: `Ctrl+Space`)
2. A small floating pill appears — speak into your microphone
3. Press the hotkey again (or `Escape` to cancel)
4. Your speech is transcribed and pasted directly into the focused input field

Flow runs as a minimal overlay that stays out of your way. The pill can be configured to hide completely when idle, appearing only when you're recording.

## Features

- **Global hotkey** — trigger from any application
- **Instant paste** — transcribed text goes straight into whatever you were typing in
- **Floating overlay** — small, unobtrusive pill with animated waveform visualization
- **Hide when idle** — optionally hide the pill entirely until you start recording
- **System tray** — quick access to settings and controls
- **Sound effects** — subtle audio cues for start, stop, success, and cancel (toggleable)
- **Multi-language** — supports 50+ languages via Groq Whisper
- **Customizable hotkeys** — set your own start/stop key combinations
- **Pastel gradient animations** — smooth, randomized color palettes for waveform and processing states

## Tech Stack

- **Electron** — desktop shell
- **React + TypeScript** — UI
- **Tailwind CSS v4** — styling
- **Groq API** — speech-to-text via `whisper-large-v3-turbo`
- **electron-vite** — build tooling

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) 18+ or [Bun](https://bun.sh/)
- A free [Groq API key](https://console.groq.com/)

### Install

```bash
# Clone the repo
git clone https://github.com/aymenaraar/Flow.git
cd Flow

# Install dependencies
bun install
# or
npm install
```

### Run

```bash
bun run dev
# or
npm run dev
```

On first launch, open Settings (gear icon or tray icon) and enter your Groq API key.

### Build

```bash
bun run build
```

## Configuration

All settings are accessible from the settings panel:

| Setting | Description | Default |
|---------|-------------|---------|
| Groq API Key | Your API key from console.groq.com | — |
| Start Recording | Hotkey to begin recording | `Ctrl+Space` |
| Stop Recording | Hotkey to stop and transcribe | `Ctrl+Space` |
| Language | Transcription language | English |
| Hide pill when idle | Hide the overlay when not recording | Off |
| Sound effects | Play audio cues on actions | On |

Settings auto-save on change.

## How It Pastes

When transcription completes, Flow:
1. Copies the text to your clipboard
2. Simulates `Ctrl+V` to paste into the previously focused application

This works with any app that accepts standard paste — text editors, browsers, chat apps, IDEs, etc.

## Groq Free Tier

The Groq Whisper API has a generous free tier:
- 7,200 requests/day
- 25 MB max file size per request
- No credit card required

For typical voice dictation (5-60 second clips), the free tier is more than enough for daily use.

## License

MIT
