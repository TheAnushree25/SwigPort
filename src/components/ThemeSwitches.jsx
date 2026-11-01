import { useEffect, useState } from 'react'
import { themes } from '../content'
import { getTheme } from '../lib/theme'
import { floodTheme } from './ThemeFlood'

// Desktop columns for the five swatch tiles (1, 4, 5, 7, 8)
const COLS = ['1 / 2', '4 / 5', '5 / 6', '7 / 8', '8 / 9']

export default function ThemeSwitches() {
  const [current, setCurrent] = useState(getTheme)
  useEffect(() => {
    const on = (e) => setCurrent(e.detail)
    window.addEventListener('themechange', on)
    return () => window.removeEventListener('themechange', on)
  }, [])

  return (
    <div className="grid theme-row" role="group" aria-label="Colour mode">
      {themes.map((t, i) => (
        <button
          key={t.id}
          className={`cell theme-switch${current === t.id ? ' is-active' : ''}`}
          style={{ '--c': COLS[i], '--sw-bg': t.bg, '--sw-fg': t.fg }}
          aria-pressed={current === t.id}
          aria-label={`${t.label} colour mode`}
          data-reveal
          data-tile
          onClick={(e) => {
            navigator.vibrate?.(10)
            const r = e.currentTarget.getBoundingClientRect()
            floodTheme(t.id, r.left + r.width / 2, r.top + r.height / 2)
          }}
        >
          <span className="theme-switch-inner" />
          <span className="theme-switch-label p1">{t.label}</span>
        </button>
      ))}
    </div>
  )
}
