import { useEffect, useRef } from 'react'
import { gsap } from '../gsap'
import { themeColors } from '../theme'

// Mounts a WebGL scene on a canvas: sizing, theme colours, a shared
// GSAP ticker and pausing while the canvas is off screen.
export function useScene(canvasRef, create, deps = []) {
  const sceneRef = useRef(null)
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    let scene
    try {
      scene = create(canvas)
    } catch (err) {
      console.warn('[SwigPort] WebGL scene skipped:', err)
      return
    }
    if (!scene) return
    sceneRef.current = scene
    const fit = () => scene.resize(Math.max(1, canvas.clientWidth), Math.max(1, canvas.clientHeight))
    fit()
    const ro = new ResizeObserver(fit)
    ro.observe(canvas)
    const colors = () => scene.setColors?.(themeColors())
    colors()
    window.addEventListener('themechange', colors)
    // render only while the canvas is (nearly) on screen
    const tick = (time, deltaMs) => {
      if (document.hidden) return
      const r = canvas.getBoundingClientRect()
      if (r.bottom < -120 || r.top > window.innerHeight + 120 || !r.width) return
      scene.update(Math.min(deltaMs / 1000, 0.05), time)
    }
    gsap.ticker.add(tick)
    return () => {
      gsap.ticker.remove(tick)
      ro.disconnect()
      window.removeEventListener('themechange', colors)
      sceneRef.current = null
      scene.dispose()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps)
  return sceneRef
}
