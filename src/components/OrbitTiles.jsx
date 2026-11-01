import { useEffect, useRef } from 'react'
import { gsap } from '../lib/gsap'
import { rakhi } from '../content'

// The hidden layer under the hero's liquid cover: Rakhi'26 frames
// circling on a flat ellipse, sorted by depth.
const PICKS = [0, 6, 11, 4, 9, 12]

export default function OrbitTiles() {
  const root = useRef(null)
  const items = PICKS.map((i) => rakhi.frames[i])

  useEffect(() => {
    const els = gsap.utils.toArray('.orbit-tile', root.current)
    const n = els.length
    let a = 0
    const tick = (t, dt) => {
      const r = root.current?.getBoundingClientRect()
      if (!r || r.bottom < 0 || r.top > window.innerHeight) return
      a += (dt / 1000) * 0.32
      const w = root.current?.clientWidth || 1
      els.forEach((el, i) => {
        const th = a + (i / n) * Math.PI * 2
        const z = Math.cos(th)
        const depth = (z + 1) / 2
        gsap.set(el, {
          x: Math.sin(th) * w * 0.27,
          y: -z * w * 0.015,
          scale: 0.2 + Math.pow(depth, 1.6) * 0.8,
          zIndex: Math.round(depth * 100),
          '--shade': (1 - depth) * 0.55,
        })
      })
    }
    gsap.ticker.add(tick)
    return () => gsap.ticker.remove(tick)
  }, [])

  return (
    <div className="orbit" ref={root} aria-hidden="true">
      {items.map((f) => (
        <figure key={f.image} className="orbit-tile">
          <img src={f.image} alt="" draggable="false" />
          <figcaption className="p1">
            <span>
              {rakhi.title} — {f.label}
            </span>
            <span>2026</span>
          </figcaption>
        </figure>
      ))}
    </div>
  )
}
