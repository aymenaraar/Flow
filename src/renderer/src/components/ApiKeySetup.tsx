import { CogSolid } from '@mynaui/icons-react'

export function ApiKeySetup(): JSX.Element {
  return (
    <div className="flex items-center gap-3 px-4 py-2">
      <div className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
      <span className="text-xs text-white/80 font-medium">API key needed</span>
      <button
        onClick={() => window.api.openSettings()}
        className="flex items-center gap-1.5 text-xs text-white/90 bg-white/10 hover:bg-white/20 px-2.5 py-1 rounded-full transition-colors"
      >
        <CogSolid className="w-3 h-3" />
        Settings
      </button>
    </div>
  )
}
