import { useEffect, useRef } from 'react'
import { gsap, isTouch, reducedMotion } from '../lib/gsap'
import { FluidReveal as Fluid } from '../lib/webgl/fluid'
import { useScene } from '../lib/webgl/useScene'

// Page-coloured liquid cover over the hero. Moving the pointer wipes
// it away to show what is underneath; it heals behind you.
export default function FluidReveal() {
  const canvas = useRef(null)
  const scene = useScene(canvas, (c) => (reducedMotion() ? null : new Fluid(c)))

  useEffect(() => {
    // show the hidden layer only once the cover has painted a frame
    const host = canvas.current?.parentElement
    let raf = 0
    if (scene.current && host) raf = requestAnimationFrame(() => (raf = requestAnimationFrame(() => host.classList.add('is-live'))))
    let last = -10
    const toLocal = (cx, cy) => {
      const r = canvas.current?.getBoundingClientRect()
      if (!r || !r.height) return null
      return [(cx - r.left) / r.width, 1 - (cy - r.top) / r.height]
    }
    const move = (e) => {
      const s = scene.current
      const p = toLocal(e.clientX, e.clientY)
      if (!s || !p || p[1] < -0.2 || p[1] > 1.2) return
      last = performance.now() / 1000
      s.move(p[0], p[1])
    }
    window.addEventListener('pointermove', move, { passive: true })
    // On touch screens nobody hovers, so a ghost brush wanders by itself.
    const auto = (t) => {
      const s = scene.current
      if (!s || !isTouch() || t - last < 2.5) return
      s.move(0.5 + Math.sin(t * 0.55) * 0.32, 0.55 + Math.sin(t * 0.9 + 1) * 0.22)
    }
    gsap.ticker.add(auto)
    return () => {
      cancelAnimationFrame(raf)
      host?.classList.remove('is-live')
      window.removeEventListener('pointermove', move)
      gsap.ticker.remove(auto)
    }
  }, [scene])

  return <canvas ref={canvas} className="fluid-canvas" aria-hidden="true" />
}
