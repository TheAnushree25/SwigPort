import { useEffect, useRef, useState } from 'react'
import { gsap } from '../lib/gsap'
import { rakhi, site, socials, themes } from '../content'
import { floodTheme } from './ThemeFlood'
import Totem from './Totem'

// Rotary phone dial. Grab a hole and turn it clockwise to the finger
// stop (or just tap it) to dial: five colour modes and four ways to
// reach the studio. Angles are clockwise from 12 o'clock.
const STOP = 120
const byId = (id) => socials.find((s) => s.id === id)
const ITEMS = [
  { angle: 30, kind: 'theme', theme: 'port' },
  { angle: 0, kind: 'theme', theme: 'bone' },
  { angle: 330, kind: 'theme', theme: 'crimson' },
  { angle: 300, kind: 'theme', theme: 'noir' },
  { angle: 270, kind: 'theme', theme: 'rose' },
  { angle: 240, kind: 'link', short: '26', label: `Latest case — ${rakhi.title}`, href: rakhi.href },
  { angle: 210, kind: 'link', short: byId('instagram').short, label: byId('instagram').label, href: byId('instagram').href },
  { angle: 180, kind: 'link', short: byId('behance').short, label: `Hire on Behance — ${site.contact.label}`, href: byId('behance').href },
  { angle: 150, kind: 'link', short: byId('linkedin').short, label: byId('linkedin').label, href: byId('linkedin').href },
].map((it) => ({ ...it, max: (STOP - it.angle + 360) % 360, ...(it.kind === 'theme' ? { t: themes.find((t) => t.id === it.theme) } : {}) }))

// ratios inside a 1000-unit box (item 72 / gap 16 / dial 462)
const RING = 500 - ((72 / 2 + 16) / 462) * 1000
const HOLE = (36 / 462) * 1000
const HALF = (Math.asin(HOLE / RING) * 180) / Math.PI
const circle = (cx, cy, r) => `M${cx - r},${cy} a${r},${r} 0 1,0 ${r * 2},0 a${r},${r} 0 1,0 ${-r * 2},0 Z`
const holeAt = (deg) => {
  const a = ((deg - 90) * Math.PI) / 180
  return [500 + Math.cos(a) * RING, 500 + Math.sin(a) * RING]
}
const WHEEL = [circle(500, 500, 499), ...ITEMS.map((it) => circle(...holeAt(it.angle), HOLE))].join(' ')

const norm = (d) => ((d % 360) + 360) % 360
const delta = (a, b) => ((a - b + 540) % 360) - 180

export default function Dial() {
  const wrap = useRef(null)
  const wheel = useRef(null)
  const rot = useRef({ v: 0 })
  const busy = useRef(false)
  const [hover, setHover] = useState(null)

  const fire = (it) => {
    navigator.vibrate?.([12, 40, 12])
    if (it.kind === 'theme') {
      const r = wrap.current.getBoundingClientRect()
      floodTheme(it.theme, r.left + r.width / 2, r.top + r.height / 2)
    } else window.open(it.href, '_blank', 'noopener')
  }

  const render = () => gsap.set(wheel.current, { rotate: rot.current.v })

  const springBack = (onDone) => {
    const v = rot.current.v
    gsap.to(rot.current, {
      v: 0,
      duration: 0.3 + (v / 360) * 1.25,
      ease: 'power1.inOut',
      onUpdate: render,
      onComplete: () => {
        busy.current = false
        onDone?.()
      },
    })
  }

  useEffect(() => {
    const el = wrap.current
    let drag = null
    const geo = (e) => {
      const r = el.getBoundingClientRect()
      const dx = e.clientX - (r.left + r.width / 2)
      const dy = e.clientY - (r.top + r.height / 2)
      return { a: norm((Math.atan2(dx, -dy) * 180) / Math.PI), d: (Math.hypot(dx, dy) / r.width) * 1000 }
    }
    const pick = ({ a, d }) => (Math.abs(d - RING) > HOLE * 1.15 ? null : ITEMS.find((it) => Math.abs(delta(a, it.angle)) < HALF * 1.2) || null)

    const down = (e) => {
      if (busy.current) return
      const g = geo(e)
      const it = pick(g)
      if (!it) return
      e.preventDefault()
      el.setPointerCapture?.(e.pointerId)
      drag = { it, prev: g.a, moved: 0 }
      busy.current = true
    }
    const move = (e) => {
      const g = geo(e)
      if (!drag) {
        if (!busy.current) setHover(pick(g))
        return
      }
      const d = delta(g.a, drag.prev)
      drag.prev = g.a
      drag.moved += Math.abs(d)
      rot.current.v = gsap.utils.clamp(0, drag.it.max, rot.current.v + d)
      render()
    }
    const up = () => {
      if (!drag) return
      const { it, moved } = drag
      drag = null
      if (moved < 4) {
        // tap: dial it for them
        gsap.to(rot.current, {
          v: it.max,
          duration: 0.25 + (it.max / 360) * 0.9,
          ease: 'power2.inOut',
          onUpdate: render,
          onComplete: () => {
            fire(it)
            springBack()
          },
        })
      } else if (rot.current.v >= it.max - 8) {
        fire(it)
        springBack()
      } else springBack()
    }
    el.addEventListener('pointerdown', down)
    window.addEventListener('pointermove', move)
    window.addEventListener('pointerup', up)
    window.addEventListener('pointercancel', up)
    return () => {
      el.removeEventListener('pointerdown', down)
      window.removeEventListener('pointermove', move)
      window.removeEventListener('pointerup', up)
      window.removeEventListener('pointercancel', up)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <div className="dial-block">
      <div className={`dial${hover ? ' is-hover' : ''}`} ref={wrap} role="group" aria-label="Rotary dial" data-reveal>
        <div className="dial-plate" />
        {ITEMS.map((it) => (
          <button
            key={it.angle}
            className={`dial-item${hover === it ? ' is-hover' : ''}`}
            style={{ '--angle': `${it.angle}deg` }}
            aria-label={it.kind === 'theme' ? `${it.t.label} colour mode` : it.label}
            tabIndex={0}
            onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && (e.preventDefault(), fire(it))}
          >
            {it.kind === 'theme' ? <span className="dial-swatch" style={{ '--sw-bg': it.t.bg, '--sw-fg': it.t.fg }} /> : <span className="p1">{it.short}</span>}
          </button>
        ))}
        <svg className="dial-wheel" ref={wheel} viewBox="0 0 1000 1000" aria-hidden="true">
          <path d={WHEEL} fillRule="evenodd" className="dial-wheel-face" />
          {ITEMS.map((it) => {
            const [x, y] = holeAt(it.angle)
            return <circle key={it.angle} cx={x} cy={y} r={HOLE} className="dial-wheel-hole" />
          })}
          <circle cx="500" cy="500" r="499" className="dial-wheel-rim" />
        </svg>
        <div className="dial-center">
          <Totem className="totem--inverse" />
        </div>
        <svg className="dial-stop" viewBox="0 0 60 120" style={{ '--angle': `${STOP}deg` }} aria-hidden="true">
          <path d="M30,0 C52,28 58,70 46,118 C38,96 22,72 6,58 C18,42 26,22 30,0 Z" />
        </svg>
      </div>
      <p className="dial-caption p1" aria-live="polite" data-reveal>
        {hover ? (hover.kind === 'theme' ? `Dial for ${hover.t.label}` : hover.label) : 'Turn a hole to the stop — or just tap it'}
      </p>
    </div>
  )
}
