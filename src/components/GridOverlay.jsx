import { useEffect, useRef } from 'react'
import { gsap } from '../lib/gsap'

export default function GridOverlay({ visible }) {
  const root = useRef(null)
  useEffect(() => {
    const cols = root.current.children
    gsap.to(cols, {
      scaleY: visible ? 1 : 0,
      transformOrigin: visible ? '50% 0%' : '50% 100%',
      duration: 0.7,
      ease: 'eio',
      stagger: { each: 0.04, from: visible ? 'start' : 'end' },
    })
  }, [visible])
  return (
    <div className="grid grid-overlay" ref={root} aria-hidden="true">
      {Array.from({ length: 8 }, (_, i) => (
        <span key={i} className="grid-overlay-col" />
      ))}
    </div>
  )
}
