import { gsap, reducedMotion } from './gsap'

// Liquid ("goo") reveal: each element gets its own SVG filter whose blur
// shrinks while an alpha threshold keeps the edges crisp, so text melts
// in from blobs. Matrix runs from a hard threshold back to identity so
// glyphs end antialiased.

const NS = 'http://www.w3.org/2000/svg'
let defs
let uid = 0

function node(tag, attrs) {
  const n = document.createElementNS(NS, tag)
  for (const k in attrs) n.setAttribute(k, attrs[k])
  return n
}

function getDefs() {
  if (defs) return defs
  const svg = node('svg', { 'aria-hidden': 'true', width: 0, height: 0 })
  svg.style.cssText = 'position:absolute;width:0;height:0;overflow:hidden;pointer-events:none'
  defs = node('defs', {})
  svg.appendChild(defs)
  document.body.appendChild(svg)
  return defs
}

export function createGoo() {
  const id = `goo-${++uid}`
  const filter = node('filter', { id, x: '-30%', y: '-30%', width: '160%', height: '160%', 'color-interpolation-filters': 'sRGB' })
  const blur = node('feGaussianBlur', { in: 'SourceGraphic', stdDeviation: 0, result: 'blur' })
  const matrix = node('feColorMatrix', { in: 'blur', mode: 'matrix', values: '' })
  filter.append(blur, matrix)
  getDefs().appendChild(filter)
  const set = (b, mult, off) => {
    blur.setAttribute('stdDeviation', b.toFixed(2))
    matrix.setAttribute('values', `1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 ${mult.toFixed(2)} ${off.toFixed(2)}`)
  }
  set(0, 1, 0)
  return { id, set, destroy: () => filter.remove() }
}

function blurFor(el, factor) {
  const fs = parseFloat(getComputedStyle(el).fontSize) || 40
  return Math.max(6, Math.min(60, fs * factor))
}

// Melt targets in. Returns a timeline so callers can position it.
export function gooIn(targets, { duration = 1.4, stagger = 0.08, factor = 0.45, delay = 0 } = {}) {
  const els = gsap.utils.toArray(targets)
  const tl = gsap.timeline({ delay })
  if (reducedMotion()) {
    tl.fromTo(els, { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.4, stagger: 0.03 })
    return tl
  }
  els.forEach((el, i) => {
    const goo = createGoo()
    const max = blurFor(el, factor)
    goo.set(max, 22, -9)
    const p = { v: 0 }
    tl.add(
      gsap.to(p, {
        v: 1,
        duration,
        ease: 'eout',
        onStart: () => {
          gsap.set(el, { autoAlpha: 1 })
          el.style.filter = `url(#${goo.id})`
        },
        onUpdate: () => {
          const v = p.v
          const b = max * (1 - v)
          // keep the threshold hard until the shapes have formed
          const k = gsap.utils.clamp(0, 1, (v - 0.55) / 0.45)
          goo.set(b, 22 - 21 * k, -9 + 9 * k)
        },
        onComplete: () => {
          el.style.filter = ''
          goo.destroy()
        },
      }),
      i * stagger,
    )
    gsap.set(el, { autoAlpha: 0 })
  })
  return tl
}

// Melt targets away into blobs.
export function gooOut(targets, { duration = 0.9, stagger = 0.04, factor = 0.5 } = {}) {
  const els = gsap.utils.toArray(targets)
  const tl = gsap.timeline()
  if (reducedMotion()) {
    tl.to(els, { autoAlpha: 0, duration: 0.3 })
    return tl
  }
  els.forEach((el, i) => {
    const goo = createGoo()
    const max = blurFor(el, factor)
    const p = { v: 0 }
    tl.add(
      gsap.to(p, {
        v: 1,
        duration,
        ease: 'ein',
        onStart: () => (el.style.filter = `url(#${goo.id})`),
        onUpdate: () => {
          const v = p.v
          const k = gsap.utils.clamp(0, 1, v / 0.3)
          goo.set(max * v, 1 + 21 * k, -9 * k)
        },
        onComplete: () => {
          gsap.set(el, { autoAlpha: 0 })
          el.style.filter = ''
          goo.destroy()
        },
      }),
      i * stagger,
    )
  })
  return tl
}
