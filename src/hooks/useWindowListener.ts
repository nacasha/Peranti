import { appWindow } from '@tauri-apps/api/window'
import { useEffect } from 'react'

export function useWindowListener() {
  useEffect(() => {
    if (document) {
      document.getElementById('titlebar-minimize')
        ?.addEventListener('click', () => appWindow.minimize())
      document.getElementById('titlebar-maximize')
        ?.addEventListener('click', () => appWindow.toggleMaximize())
      document.getElementById('titlebar-close')
        ?.addEventListener('click', () => appWindow.close())
    }
  }, [])
}
