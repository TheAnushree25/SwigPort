import { useEffect, useRef } from 'react'
import { gsap, reducedMotion } from '../lib/gsap'
import { DROP_PATH } from '../lib/theme'

// The SwigPort mascot: a drop of port that never quite sits still,
// savouring with closed eyes. Shapes share a 100×160 box.
const DROPS = [
  DROP_PATH,
  'M56,8 C66,34 95,66 93,104 C91,134 76,152 52,153 C28,154 9,138 7,112 C5,82 30,52 44,30 C48,22 53,14 56,8 Z',
  'M50,12 C58,36 96,72 95,110 C94,138 74,153 49,152 C24,151 5,137 6,110 C7,74 42,36 50,12 Z',
  'M53,5 C57,22 70,34 80,52 C90,70 97,88 92,112 C88,134 74,150 54,155 C34,159 14,148 9,126 C4,104 12,82 26,62 C36,46 49,28 53,5 Z',
  'M46,7 C42,30 10,64 8,102 C6,134 26,154 50,154 C74,154 94,136 92,106 C90,72 54,34 46,7 Z',
]
const START = 'M8,6 C30,6 70,6 92,6 C92,50 92,110 92,154 C70,154 30,154 8,154 C8,110 8,50 8,6 Z'

export default function Totem({ className = '', fromRect = false, follow = true, play = true }) {
  const svg = useRef(null)
  const body = useRef(null)
  const eyes = useRef(null)

  useEffect(() => {
    if (!play) return
    const ctx = gsap.context(() => {
      const loop = gsap.timeline({ repeat: -1, paused: fromRect, defaults: { duration: 1.5, ease: 'sine.inOut' } })
      if (!reducedMotion()) [1, 2, 3, 4, 0].forEach((i) => loop.to(body.current, { morphSVG: DROPS[i] }))
      if (fromRect) {
        gsap.set(body.current, { attr: { d: START } })
        gsap.to(body.current, { morphSVG: DROPS[0], duration: 1.1, ease: 'eio', onComplete: () => loop.play() })
      }
      // occasional blink: closed arcs open into dots
      const blink = gsap.timeline({ repeat: -1, repeatDelay: 3.2, delay: 2 })
      blink.to(eyes.current, { scaleY: 0.2, duration: 0.08, transformOrigin: '50% 50%' }).to(eyes.current, { scaleY: 1, duration: 0.18 })
    }, svg)
    if (!follow) return () => ctx.revert()
    const move = (e) => {
      const r = svg.current?.getBoundingClientRect()
      if (!r) return
      const dx = gsap.utils.clamp(-1, 1, (e.clientX - (r.left + r.width / 2)) / 500)
      const dy = gsap.utils.clamp(-1, 1, (e.clientY - (r.top + r.height / 2)) / 500)
      gsap.to(eyes.current, { x: dx * 6, y: dy * 5, duration: 0.6, overwrite: 'auto' })
    }
    window.addEventListener('pointermove', move)
    return () => {
      window.removeEventListener('pointermove', move)
      ctx.revert()
    }
  }, [play, fromRect, follow])

  return (
    <svg ref={svg} className={`totem ${className}`} viewBox="0 0 100 160" aria-hidden="true">
      <path ref={body} className="totem-body" d={DROPS[0]} />
      <g ref={eyes} className="totem-eyes">
        <path d="M27,100 Q35,108.5 43,100" />
        <path d="M57,100 Q65,108.5 73,100" />
      </g>
    </svg>
  )
}
