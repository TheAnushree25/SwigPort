import { gsap, ScrollTrigger, SplitText, reducedMotion } from './gsap'
import { gooIn } from './goo'

// Scroll reveals for everything inside `root`. Call inside a
// gsap.context so SplitText and triggers are reverted on unmount.
//   [data-goo]    liquid melt-in (headings)
//   [data-lines]  masked lines slide up (paragraphs)
//   [data-fade]   simple rise + fade
//   [data-clip]   wipes open from the bottom
//   [data-tile]   scale-in squares (staggered per row)
// `skip`: selector of sub-trees that run their own reveals (the footer)
export function setupReveals(root, { start = 'top 88%', skip = null } = {}) {
  const q = (s) => [...root.querySelectorAll(s)].filter((el) => !skip || !el.closest(skip))
  const rm = reducedMotion()

  q('[data-goo]').forEach((el) => {
    gsap.set(el, { autoAlpha: 0 })
    ScrollTrigger.create({ trigger: el, start, once: true, onEnter: () => gooIn(el, { duration: 1.35 }) })
  })

  q('[data-lines]').forEach((el) => {
    const split = SplitText.create(el, { type: 'lines', mask: 'lines', linesClass: 'line' })
    gsap.set(el, { autoAlpha: 1 })
    gsap.set(split.lines, { yPercent: rm ? 0 : 110 })
    ScrollTrigger.create({
      trigger: el,
      start,
      once: true,
      onEnter: () => gsap.to(split.lines, { yPercent: 0, duration: 1.1, stagger: 0.07, ease: 'eout' }),
    })
  })

  q('[data-fade]').forEach((el) => {
    gsap.set(el, { autoAlpha: 0, y: rm ? 0 : 24 })
    ScrollTrigger.create({ trigger: el, start, once: true, onEnter: () => gsap.to(el, { autoAlpha: 1, y: 0, duration: 1, ease: 'eout' }) })
  })

  q('[data-clip]').forEach((el) => {
    gsap.set(el, { autoAlpha: 1, clipPath: rm ? 'inset(0% 0% 0% 0%)' : 'inset(100% 0% 0% 0%)' })
    ScrollTrigger.create({
      trigger: el,
      start,
      once: true,
      onEnter: () => gsap.to(el, { clipPath: 'inset(0% 0% 0% 0%)', duration: 1.1, ease: 'eio' }),
    })
  })

  const tiles = q('[data-tile]')
  if (tiles.length) {
    gsap.set(tiles, { autoAlpha: 1, scale: rm ? 1 : 0 })
    ScrollTrigger.batch(tiles, {
      start,
      once: true,
      onEnter: (batch) => gsap.to(batch, { scale: 1, duration: 0.9, ease: 'eout', stagger: 0.07 }),
    })
  }
}
