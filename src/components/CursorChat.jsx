import { useEffect, useRef, useState } from 'react'
import { gsap, isTouch } from '../lib/gsap'

// Press "/" anywhere to say something; the bubble rides along with
// the cursor for a few seconds and then evaporates.
export default function CursorChat() {
  const [mode, setMode] = useState('idle') // idle | typing | said
  const [text, setText] = useState('')
  const bubble = useRef(null)
  const input = useRef(null)
  const pos = useRef({ x: -200, y: -200, tx: -200, ty: -200 })

  useEffect(() => {
    if (isTouch()) return
    const move = (e) => {
      pos.current.tx = e.clientX
      pos.current.ty = e.clientY
    }
    const key = (e) => {
      const tag = document.activeElement?.tagName
      if (e.key === '/' && mode !== 'typing' && tag !== 'INPUT' && tag !== 'TEXTAREA') {
        e.preventDefault()
        setText('')
        setMode('typing')
      }
    }
    const tick = () => {
      const p = pos.current
      p.x += (p.tx - p.x) * 0.25
      p.y += (p.ty - p.y) * 0.25
      if (bubble.current) gsap.set(bubble.current, { x: p.x + 14, y: p.y + 18 })
    }
    window.addEventListener('pointermove', move, { passive: true })
    window.addEventListener('keydown', key)
    gsap.ticker.add(tick)
    return () => {
      window.removeEventListener('pointermove', move)
      window.removeEventListener('keydown', key)
      gsap.ticker.remove(tick)
    }
  }, [mode])

  useEffect(() => {
    if (mode === 'typing') {
      input.current?.focus()
      gsap.fromTo(bubble.current, { scale: 0.6, autoAlpha: 0 }, { scale: 1, autoAlpha: 1, duration: 0.35, ease: 'back.out(2)' })
    }
    if (mode === 'said') {
      const t = gsap.to(bubble.current, { autoAlpha: 0, y: '-=10', delay: 4.5, duration: 0.6, onComplete: () => setMode('idle') })
      return () => t.kill()
    }
  }, [mode])

  if (mode === 'idle') return null
  return (
    <div className="cursor-chat" ref={bubble} aria-live="polite">
      {mode === 'typing' ? (
        <input
          ref={input}
          className="cursor-chat-input p1"
          value={text}
          maxLength={60}
          placeholder="Say something…"
          aria-label="Say something"
          onChange={(e) => setText(e.target.value)}
          onBlur={() => setMode(text.trim() ? 'said' : 'idle')}
          onKeyDown={(e) => {
            if (e.key === 'Enter') setMode(text.trim() ? 'said' : 'idle')
            if (e.key === 'Escape') setMode('idle')
            e.stopPropagation()
          }}
          style={{ width: `${Math.max(12, text.length + 1)}ch` }}
        />
      ) : (
        <span className="cursor-chat-msg p1">{text}</span>
      )}
    </div>
  )
}
