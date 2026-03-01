import { OverlayBar } from './components/OverlayBar'
import { SettingsPanel } from './components/SettingsPanel'

function App(): JSX.Element {
  const params = new URLSearchParams(window.location.search)
  const windowType = params.get('window') || 'overlay'

  if (windowType === 'settings') {
    return <SettingsPanel />
  }

  return <OverlayBar />
}

export default App
