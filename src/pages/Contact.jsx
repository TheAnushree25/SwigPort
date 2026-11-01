import { useLayoutEffect, useRef } from 'react'
import { gsap } from '../lib/gsap'
import { gooIn } from '../lib/goo'
import { useApp } from '../lib/app'
import Dial from '../components/Dial'

export default function Contact() {
  const root = useRef(null)
  const { ready } = useApp()

  useLayoutEffect(() => {
    if (!ready) return
    const ctx = gsap.context(() => {
      gsap.fromTo('.dial', { scale: 0.6, rotate: -90, autoAlpha: 0 }, { scale: 1, rotate: 0, autoAlpha: 1, duration: 1.4, ease: 'eio' })
      gsap.fromTo('.contact-cord', { scaleX: 0, autoAlpha: 1 }, { scaleX: 1, duration: 1.2, ease: 'eio', delay: 0.4 })
      gooIn('.dial-caption', { delay: 0.9 })
    }, root)
    return () => ctx.revert()
  }, [ready])

  return (
    <div className="page page--contact" ref={root}>
      <section className="contact">
        <h1 className="sr-only">Contact</h1>
        <span className="contact-cord contact-cord--l" aria-hidden="true" data-reveal />
        <span className="contact-cord contact-cord--r" aria-hidden="true" data-reveal />
        <Dial />
      </section>
    </div>
  )
}
