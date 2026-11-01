import { useEffect, useRef, useState } from 'react'
import { gsap } from '../lib/gsap'
import { LiquidBlob } from '../lib/webgl/blob'
import { useScene } from '../lib/webgl/useScene'
import { site } from '../content'

function now() {
  const parts = new Intl.DateTimeFormat('en-GB', { hour: '2-digit', minute: '2-digit', hour12: false, timeZone: site.timeZone }).formatToParts(new Date())
  return [parts.find((p) => p.type === 'hour')?.value ?? '00', parts.find((p) => p.type === 'minute')?.value ?? '00']
}

// ( HH : [liquid port] : MM ) — live time in the studio's city.
export default function Clock() {
  const [[hh, mm], setTime] = useState(now)
  const canvas = useRef(null)
  const box = useRef(null)
  const scene = useScene(canvas, (c) => new LiquidBlob(c))

  useEffect(() => {
    const id = setInterval(() => setTime(now()), 5000)
    return () => clearInterval(id)
  }, [])

  useEffect(() => {
    const move = (e) => {
      const r = box.current?.getBoundingClientRect()
      const s = scene.current
      if (!r || !s) return
      s.mouse.set(
        gsap.utils.clamp(-1, 1, (e.clientX - (r.left + r.width / 2)) / 600),
        gsap.utils.clamp(-1, 1, -(e.clientY - (r.top + r.height / 2)) / 600),
      )
    }
    window.addEventListener('pointermove', move, { passive: true })
    return () => window.removeEventListener('pointermove', move)
  }, [scene])

  return (
    <div className="grid clock" aria-label={`${site.city} time ${hh}:${mm}`}>
      <span className="cell h1 clock-paren clock-paren--l" style={{ '--c': '1 / 2' }} data-goo>
        (
      </span>
      <span className="cell h1 clock-hh" style={{ '--c': '2 / 3' }} data-goo>
        {hh}
      </span>
      <span className="cell h1 clock-colon" style={{ '--c': '3 / 4' }} data-goo>
        :
      </span>
      <div className="cell clock-blob" style={{ '--c': '4 / 6' }} ref={box} data-reveal data-clip>
        <canvas ref={canvas} />
        <span className="clock-city p1">{site.city}</span>
      </div>
      <span className="cell h1 clock-colon" style={{ '--c': '6 / 7' }} data-goo>
        :
      </span>
      <span className="cell h1 clock-mm" style={{ '--c': '7 / 8' }} data-goo>
        {mm}
      </span>
      <span className="cell h1 clock-paren clock-paren--r" style={{ '--c': '8 / 9' }} data-goo>
        )
      </span>
    </div>
  )
}
