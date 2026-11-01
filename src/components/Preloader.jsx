import { useEffect, useRef } from 'react'
import { gsap } from '../lib/gsap'
import { gooOut } from '../lib/goo'
import { prepareCovers } from '../lib/covers'

// Big counter in the bottom-left corner. It follows real work (fonts
// and generated artwork) but never finishes in under ~1.8s, then melts.
export default function Preloader({ onDone }) {
  const root = useRef(null)
  const num = useRef(null)

  useEffect(() => {
    let target = 0
    let shown = 0
    let finished = false
    const start = performance.now()
    prepareCovers((p) => (target = p * 0.98)).then(() => (target = 1))
    const count = root.current.querySelector('.preloader-count')
    gsap.fromTo(count, { yPercent: 40, autoAlpha: 0 }, { yPercent: 0, autoAlpha: 1, duration: 0.9, ease: 'eout', delay: 0.15 })

    const tick = () => {
      const elapsed = (performance.now() - start) / 1000
      const goal = Math.min(target, gsap.parseEase('ewrite')(Math.min(1, elapsed / 1.8)))
      shown += (goal - shown) * 0.14
      if (goal >= 1 && shown > 0.994) shown = 1
      if (num.current) num.current.textContent = String(Math.round(shown * 100))
      if (shown === 1 && !finished) {
        finished = true
        gsap.ticker.remove(tick)
        gooOut(count, { duration: 0.75, factor: 0.42 }).eventCallback('onComplete', onDone)
      }
    }
    gsap.ticker.add(tick)
    return () => gsap.ticker.remove(tick)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <div className="preloader" ref={root} aria-hidden="true">
      <div className="preloader-count h1">
        <span ref={num}>0</span>%
      </div>
    </div>
  )
}
