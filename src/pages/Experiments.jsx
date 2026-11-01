import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { gsap } from '../lib/gsap'
import { gooIn } from '../lib/goo'
import { useCovers } from '../lib/covers'
import { useApp } from '../lib/app'
import { FieldScene } from '../lib/webgl/field'
import { useScene } from '../lib/webgl/useScene'
import { experiments } from '../content'

export default function Experiments() {
  const root = useRef(null)
  const canvas = useRef(null)
  const [label, setLabel] = useState(null)
  const ok = useCovers('all')
  const { ready } = useApp()

  const scene = useScene(
    canvas,
    (c) => {
      if (!ok) return null
      const s = new FieldScene(c, experiments.map((e) => e.src))
      s.onHover = (mesh) => setLabel(mesh ? s.tiles.indexOf(mesh) % experiments.length : null)
      return s
    },
    [ok],
  )

  useLayoutEffect(() => {
    if (!ready) return
    const ctx = gsap.context(() => {
      gooIn('[data-hero]', { stagger: 0.1, delay: 0.2 })
      gsap.fromTo('.exp-canvas', { autoAlpha: 0, scale: 1.08 }, { autoAlpha: 1, scale: 1, duration: 2, ease: 'eout' })
    }, root)
    return () => ctx.revert()
  }, [ready])

  useEffect(() => {
    let ty = null
    const wheel = (e) => scene.current?.push(e.deltaY)
    const ts = (e) => (ty = e.touches[0].clientY)
    const tm = (e) => {
      if (ty === null) return
      const y = e.touches[0].clientY
      scene.current?.push((ty - y) * 3)
      ty = y
    }
    const te = () => (ty = null)
    const pm = (e) => scene.current?.pointer((e.clientX / window.innerWidth) * 2 - 1, -(e.clientY / window.innerHeight) * 2 + 1)
    const click = (e) => {
      const s = scene.current
      if (!s?.hovered || e.target.closest('a, button')) return
      const piece = experiments[s.tiles.indexOf(s.hovered) % experiments.length]
      if (piece?.href) window.open(piece.href, '_blank', 'noopener')
    }
    window.addEventListener('click', click)
    window.addEventListener('wheel', wheel, { passive: true })
    window.addEventListener('touchstart', ts, { passive: true })
    window.addEventListener('touchmove', tm, { passive: true })
    window.addEventListener('touchend', te)
    window.addEventListener('pointermove', pm, { passive: true })
    return () => {
      window.removeEventListener('wheel', wheel)
      window.removeEventListener('touchstart', ts)
      window.removeEventListener('touchmove', tm)
      window.removeEventListener('touchend', te)
      window.removeEventListener('pointermove', pm)
      window.removeEventListener('click', click)
    }
  }, [scene])

  return (
    <div className="page page--exp" ref={root}>
      <canvas ref={canvas} className="exp-canvas" aria-hidden="true" />
      <div className="exp-overlay">
        <h1 className="h1 exp-title" data-hero data-reveal>
          Experiments
        </h1>
        <p className="p1 exp-hint fg-2" data-hero data-reveal>
          Scroll or swipe to drift · {experiments.length} pieces
        </p>
        <p className="p1 exp-label" aria-live="polite">
          {label !== null && (
            <>
              <span className="fg-2">{String(label + 1).padStart(2, '0')}</span> {experiments[label].label} <span className="fg-2">↗</span>
            </>
          )}
        </p>
      </div>
    </div>
  )
}
