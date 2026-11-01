import { useEffect, useRef } from 'react'

// Film grain: one small noise tile, jittered at 12fps by CSS.
export default function Grain() {
  const el = useRef(null)
  useEffect(() => {
    const c = document.createElement('canvas')
    c.width = c.height = 180
    const ctx = c.getContext('2d')
    const img = ctx.createImageData(180, 180)
    for (let i = 0; i < img.data.length; i += 4) {
      const v = Math.random() * 255
      img.data[i] = img.data[i + 1] = img.data[i + 2] = v
      img.data[i + 3] = Math.random() * 90
    }
    ctx.putImageData(img, 0, 0)
    el.current.style.backgroundImage = `url(${c.toDataURL()})`
  }, [])
  return <div className="grain" ref={el} aria-hidden="true" />
}
