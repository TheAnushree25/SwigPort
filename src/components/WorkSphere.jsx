import { useEffect, useRef } from 'react'
import { gsap, isDesktop } from '../lib/gsap'
import { useCovers } from '../lib/covers'
import { SphereScene } from '../lib/webgl/sphere'
import { useScene } from '../lib/webgl/useScene'
import { projects } from '../content'

// bridge: ref whose .current = { p, intro, lift } is written by a
// ScrollTrigger (home). interactive: drag + hover (work page).
export default function WorkSphere({ bridge, interactive = false, onHover }) {
  const canvas = useRef(null)
  const ok = useCovers()
  const hoverRef = useRef(onHover)
  useEffect(() => {
    hoverRef.current = onHover
  }, [onHover])

  const scene = useScene(
    canvas,
    (c) => {
      if (!ok) return null
      const items = projects.map((p) => ({ ...p, url: p.image }))
      const s = new SphereScene(c, items, { interactive, count: isDesktop() ? 30 : 20 })
      s.onHover = (item) => hoverRef.current?.(item)
      if (!interactive) s.intro = 0
      return s
    },
    [ok],
  )

  useEffect(() => {
    if (!bridge) return
    const tick = () => {
      const s = scene.current
      const b = bridge.current
      if (!s || !b) return
      s.progress = b.p
      s.intro = b.intro
      s.root.position.y = b.lift * 7
    }
    gsap.ticker.add(tick, false, true)
    return () => gsap.ticker.remove(tick)
  }, [bridge, scene])

  useEffect(() => {
    if (!interactive) return
    const c = canvas.current
    let down = null
    const local = (e) => {
      const r = c.getBoundingClientRect()
      return [((e.clientX - r.left) / r.width) * 2 - 1, -((e.clientY - r.top) / r.height) * 2 + 1]
    }
    const pd = (e) => {
      down = { x: e.clientX, y: e.clientY }
      c.setPointerCapture?.(e.pointerId)
      c.classList.add('is-dragging')
    }
    const pm = (e) => {
      const s = scene.current
      if (!s) return
      s.pointer(...local(e))
      if (down) {
        s.drag(e.clientX - down.x, e.clientY - down.y)
        down = { x: e.clientX, y: e.clientY }
      }
    }
    const pu = () => {
      down = null
      c.classList.remove('is-dragging')
    }
    const leave = () => scene.current?.pointer(9, 9)
    c.addEventListener('pointerdown', pd)
    c.addEventListener('pointermove', pm)
    c.addEventListener('pointerup', pu)
    c.addEventListener('pointercancel', pu)
    c.addEventListener('pointerleave', leave)
    return () => {
      c.removeEventListener('pointerdown', pd)
      c.removeEventListener('pointermove', pm)
      c.removeEventListener('pointerup', pu)
      c.removeEventListener('pointercancel', pu)
      c.removeEventListener('pointerleave', leave)
    }
  }, [interactive, scene])

  return <canvas ref={canvas} className={`sphere-canvas${interactive ? ' is-interactive' : ''}`} aria-hidden="true" />
}
