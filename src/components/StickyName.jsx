import { useEffect, useRef } from 'react'
import { gsap, isDesktop } from '../lib/gsap'
import { lenis } from '../lib/scroll'
import { useApp } from '../lib/app'
import { site } from '../content'

// "Swig" and "Port" wait as ghosts in the bottom corners and slide
// together into the full name as you reach the end of a page.
export default function StickyName() {
  const { nameMode, ready } = useApp()
  const root = useRef(null)
  const left = useRef(null)
  const right = useRef(null)
  const meta = useRef(null)
  const state = useRef({ cur: 0 })

  useEffect(() => {
    if (!ready) return
    gsap.set(root.current, { autoAlpha: 1 })
    gsap.fromTo([left.current, right.current], { yPercent: 135 }, { yPercent: 0, duration: 1.2, ease: 'eout', delay: 0.5 })
  }, [ready])

  useEffect(() => {
    let dims = null
    const measure = () => {
      const pad = parseFloat(getComputedStyle(root.current).paddingLeft)
      dims = { W: root.current.clientWidth, pad, wl: left.current.offsetWidth, wr: right.current.offsetWidth }
    }
    measure()
    const ro = new ResizeObserver(measure)
    ro.observe(root.current)
    const s = state.current
    const tick = () => {
      let target
      if (nameMode === 'merged') target = 1
      else if (nameMode === 'ghost') target = 0
      else {
        const lim = lenis.limit
        const vh = window.innerHeight
        target = lim < 8 ? 1 : gsap.utils.clamp(0, 1, (lenis.animatedScroll - (lim - vh * 0.65)) / (vh * 0.65))
      }
      s.cur += (target - s.cur) * 0.14
      if (Math.abs(target - s.cur) < 0.0005) s.cur = target
      const p = s.cur
      const e = gsap.parseEase('eio')(p)
      const { W, pad, wl, wr } = dims
      const start = (W - wl - wr) / 2
      gsap.set(left.current, { x: (start - pad) * e })
      gsap.set(right.current, { x: -(W - pad - wr - (start + wl)) * e })
      const ghost = isDesktop() ? 0.12 : 0
      gsap.set([left.current, right.current], { opacity: ghost + (1 - ghost) * p * p })
      gsap.set(meta.current, { autoAlpha: gsap.utils.clamp(0, 1, (p - 0.75) / 0.25) })
    }
    gsap.ticker.add(tick)
    return () => {
      gsap.ticker.remove(tick)
      ro.disconnect()
    }
  }, [nameMode])

  return (
    <div className="sticky-name" ref={root} aria-hidden="true">
      <div className="sticky-name-mask">
        <span className="h1 sticky-name-part" ref={left}>
          {site.brandParts[0]}
        </span>
        <span className="h1 sticky-name-part sticky-name-part--r" ref={right}>
          {site.brandParts[1]}
        </span>
      </div>
      <div className="sticky-name-meta p1" ref={meta}>
        <span>{site.rights}</span>
        <span>{site.signature}</span>
      </div>
    </div>
  )
}
