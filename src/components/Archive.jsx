import { useEffect, useRef, useState } from 'react'
import { gsap } from '../lib/gsap'
import { useCovers } from '../lib/covers'
import { projects } from '../content'

// Index of every project, newest year first. Hovering a row floats its
// cover beside the pointer (tilting with its speed); rows open Behance.
const GROUPS = Object.entries(
  projects
    .filter((p) => p.kind === 'Case')
    .reduce((acc, p) => {
      ;(acc[p.year] ||= []).push(p)
      return acc
    }, {}),
).sort((a, b) => b[0] - a[0])

const short = (year) => `'${year.slice(2)}`

export default function Archive() {
  const ok = useCovers()
  const cert = useRef(null)
  const [active, setActive] = useState(null)
  const [shown, setShown] = useState(null)

  useEffect(() => {
    const el = cert.current
    const pos = { x: 0, y: 0, tx: 0, ty: 0 }
    const move = (e) => {
      pos.tx = e.clientX
      pos.ty = e.clientY
    }
    const tick = () => {
      const vx = pos.tx - pos.x
      pos.x += vx * 0.16
      pos.y += (pos.ty - pos.y) * 0.16
      gsap.set(el, { x: pos.x, y: pos.y, rotate: gsap.utils.clamp(-14, 14, vx * 0.12) })
    }
    window.addEventListener('pointermove', move, { passive: true })
    gsap.ticker.add(tick)
    return () => {
      window.removeEventListener('pointermove', move)
      gsap.ticker.remove(tick)
    }
  }, [])

  useEffect(() => {
    gsap.to(cert.current, { scale: active ? 1 : 0, autoAlpha: active ? 1 : 0, duration: 0.45, ease: active ? 'back.out(1.6)' : 'ein' })
  }, [active])

  return (
    <section className="awards" aria-labelledby="archive-title">
      <h2 className="grid awards-head" id="archive-title">
        <span className="cell h1" style={{ '--c': '3 / 7', '--r': 1, '--mc': '1 / -1' }} data-goo>
          Index
        </span>
        <span className="cell h1" style={{ '--c': '2 / 3', '--r': 2, '--mc': '1 / 2' }} data-goo>
          &amp;
        </span>
        <span className="cell h1" style={{ '--c': '3 / 7', '--r': 2, '--mc': '2 / -1' }} data-goo>
          Arch-
        </span>
        <span className="cell h1" style={{ '--c': '4 / 7', '--r': 3, '--mc': '2 / -1' }} data-goo>
          ive
        </span>
      </h2>

      <div className="grid">
        <div className="cell awards-table" style={{ '--c': '2 / 8' }} onPointerLeave={() => setActive(null)}>
          {GROUPS.map(([year, list]) => (
            <div className="award-group" key={year} data-fade data-reveal>
              <div className="award-group-head p1">
                <span>{short(year)}</span>
                <span>
                  {list.length} {list.length === 1 ? 'project' : 'projects'}
                </span>
              </div>
              {list.map((p, j) => (
                <a
                  key={p.id}
                  href={p.href}
                  target="_blank"
                  rel="noreferrer"
                  className={`award-row${active === p.id ? ' is-active' : ''}`}
                  onPointerEnter={(e) => {
                    if (e.pointerType !== 'mouse') return
                    setActive(p.id)
                    setShown(p)
                  }}
                >
                  <span className="award-cell p1 fg-2 only-desktop">{j === 0 ? short(year) : ''}</span>
                  <span className="award-cell award-cell--2 p1">{p.title}</span>
                  <span className="award-cell award-cell--2 p1">{p.category}</span>
                  <span className="award-cell p1 only-desktop">Behance ↗</span>
                </a>
              ))}
            </div>
          ))}
        </div>
      </div>

      <div className="award-cert award-cert--wide" ref={cert} aria-hidden="true">
        {ok && shown && <img src={shown.image} alt="" />}
      </div>
    </section>
  )
}
