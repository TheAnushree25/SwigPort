import Lenis from 'lenis'
import { gsap, ScrollTrigger, reducedMotion } from './gsap'

// One Lenis instance for the whole app, driven by GSAP's ticker so
// ScrollTrigger and smooth scroll share the same frame.
export const lenis = new Lenis({
  lerp: reducedMotion() ? 1 : 0.09,
  wheelMultiplier: 1,
  touchMultiplier: 1.4,
  smoothWheel: !reducedMotion(),
})

lenis.on('scroll', ScrollTrigger.update)
gsap.ticker.add((time) => lenis.raf(time * 1000))
gsap.ticker.lagSmoothing(0)

lenis.stop()

export function scrollToTop() {
  lenis.scrollTo(0, { immediate: true, force: true })
  window.scrollTo(0, 0)
}
