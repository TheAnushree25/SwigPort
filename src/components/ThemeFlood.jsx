import { useEffect, useRef } from 'react'
import { gsap, reducedMotion } from '../lib/gsap'
import { applyTheme, getTheme } from '../lib/theme'
import { themes } from '../content'
import Totem from './Totem'

// Theme change: the new colour floods out of the click point as a
// liquid (circles merged by an SVG goo filter) while the totem pops up
// in the middle. The real theme swap happens under full cover.
let runner = null
export function floodTheme(id, x, y) {
  if (runner) runner(id, x, y)
  else applyTheme(id)
}

const NS = 'http://www.w3.org/2000/svg'

export default function ThemeFlood() {
  const root = useRef(null)
  const group = useRef(null)
  const totem = useRef(null)
  const busy = useRef(false)

  useEffect(() => {
    runner = (id, x = window.innerWidth / 2, y = window.innerHeight / 2) => {
      if (busy.current || id === getTheme()) return
      const t = themes.find((th) => th.id === id)
      if (!t) return
      if (reducedMotion()) return applyTheme(id)
      busy.current = true
      const W = window.innerWidth
      const H = window.innerHeight
      const R = Math.hypot(Math.max(x, W - x), Math.max(y, H - y)) + 140
      const g = group.current
      g.replaceChildren()
      const circle = () => {
        const c = document.createElementNS(NS, 'circle')
        c.setAttribute('cx', x)
        c.setAttribute('cy', y)
        c.setAttribute('r', 0)
        c.setAttribute('fill', t.bg)
        g.appendChild(c)
        return c
      }
      // one pool that ends up covering everything, plus drops that race
      // ahead of it so the front stays liquid instead of circular
      const pool = circle()
      const drops = Array.from({ length: 18 }, (_, i) => ({ c: circle(), a: (i / 18) * Math.PI * 2 + Math.random() * 0.3 }))
      root.current.style.setProperty('--flood-fg', t.fg)
      root.current.style.setProperty('--flood-bg', t.bg)
      const tl = gsap.timeline({
        onComplete: () => {
          g.replaceChildren()
          busy.current = false
        },
      })
      tl.set(root.current, { autoAlpha: 1 })
      tl.to(pool, { attr: { r: R * 1.06 }, duration: 1.45, ease: 'eio' }, 0)
      drops.forEach(({ c, a }) => {
        const d = R * (0.3 + Math.random() * 0.45)
        tl.to(
          c,
          { attr: { cx: x + Math.cos(a) * d, cy: y + Math.sin(a) * d, r: R * (0.12 + Math.random() * 0.2) }, duration: 0.9 + Math.random() * 0.5, ease: 'eout' },
          Math.random() * 0.25,
        )
      })
      tl.fromTo(totem.current, { scale: 0, rotate: -14 }, { scale: 1, rotate: 0, duration: 0.95, ease: 'back.out(1.7)' }, 0.3)
      tl.add(() => applyTheme(id), 1.46)
      tl.to(totem.current, { scale: 0, rotate: 12, duration: 0.55, ease: 'ein' }, 1.6)
      tl.to(root.current, { autoAlpha: 0, duration: 0.35 }, 1.95)
    }
    return () => {
      runner = null
    }
  }, [])

  return (
    <div className="theme-flood" ref={root} aria-hidden="true">
      <svg className="theme-flood-svg" width="100%" height="100%">
        <defs>
          <filter id="flood-goo" x="-20%" y="-20%" width="140%" height="140%" colorInterpolationFilters="sRGB">
            <feGaussianBlur in="SourceGraphic" stdDeviation="22" result="b" />
            <feColorMatrix in="b" mode="matrix" values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 26 -10" />
          </filter>
        </defs>
        <g ref={group} filter="url(#flood-goo)" />
      </svg>
      <div className="theme-flood-totem" ref={totem}>
        <Totem follow={false} />
      </div>
    </div>
  )
}
