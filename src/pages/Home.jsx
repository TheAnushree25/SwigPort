import { useLayoutEffect, useRef } from 'react'
import { gsap } from '../lib/gsap'
import { gooIn } from '../lib/goo'
import { setupReveals } from '../lib/reveal'
import { TLink, useApp } from '../lib/app'
import { hero, site } from '../content'
import Totem from '../components/Totem'
import FluidReveal from '../components/FluidReveal'
import OrbitTiles from '../components/OrbitTiles'
import ThemeSwitches from '../components/ThemeSwitches'
import WorkSphere from '../components/WorkSphere'
import Archive from '../components/Archive'
import Footer from '../components/Footer'
import Roll from '../components/Roll'

export default function Home() {
  const root = useRef(null)
  const featured = useRef(null)
  const bridge = useRef({ p: 0, intro: 0, lift: 0 })
  const { ready } = useApp()

  // While the counter runs, the frame of the page draws itself.
  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      gsap.set('[data-hero]', { autoAlpha: 0 })
      gsap.fromTo('.intro-line', { scaleY: 0 }, { scaleY: 1, duration: 2.4, ease: 'eio', delay: 0.2 })
      gooIn('[data-pre]', { delay: 0.35, stagger: 0.1 })
    }, root)
    return () => ctx.revert()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useLayoutEffect(() => {
    if (!ready) return
    const ctx = gsap.context(() => {
      gooIn('[data-hero]', { stagger: 0.055, duration: 1.6 })
      setupReveals(root.current, { skip: '.footer' })

      // Work: the words part, the globe of projects turns between them.
      const sec = featured.current
      const w1 = sec.querySelector('.ft-work')
      const w2 = sec.querySelector('.ft-years')
      const pad = () => parseFloat(getComputedStyle(sec.querySelector('.featured-title')).paddingLeft)
      const st = bridge.current
      gsap
        .timeline({
          defaults: { ease: 'none' },
          scrollTrigger: { trigger: sec, start: 'top top', end: 'bottom bottom', scrub: 0.7, invalidateOnRefresh: true },
        })
        .to(st, { p: 1, duration: 1 }, 0)
        .fromTo(st, { intro: 0 }, { intro: 1, duration: 0.3, ease: 'eout' }, 0.1)
        .fromTo(w1, { x: 0 }, { x: () => pad() - w1.offsetLeft, duration: 0.24, ease: 'eio' }, 0)
        .fromTo(w2, { x: 0 }, { x: () => sec.clientWidth - pad() - (w2.offsetLeft + w2.offsetWidth), duration: 0.24, ease: 'eio' }, 0)
        .to([w1, w2], { x: 0, duration: 0.24, ease: 'eio' }, 0.74)
        .fromTo(st, { lift: 0 }, { lift: 1, duration: 0.3, ease: 'ein' }, 0.7)
    }, root)
    return () => ctx.revert()
  }, [ready])

  const lastB = hero.lineB.length - 1
  return (
    <div className="page page--home" ref={root}>
      <section className="intro">
        <div className="reveal-block">
          <OrbitTiles />
          <FluidReveal />
        </div>
        <span className="intro-line only-desktop" aria-hidden="true" />

        <div className="grid intro-head">
          <div className="cell intro-totem" style={{ '--c': '3 / 4', '--mc': '1 / 2' }} data-hero>
            <Totem fromRect play={ready} />
          </div>
          <div className="cell intro-meta p1" style={{ '--c': '4 / 7', '--mc': '2 / -1' }}>
            <span className="block" data-pre>
              Based in {site.city}
            </span>
            <span className="block" data-pre>
              Working w/{' '}
              <a className="link-underline" href={site.workingWith.href}>
                {site.workingWith.label}
              </a>
            </span>
          </div>
          <p className="cell intro-role p1" style={{ '--c': '3 / 4', '--mc': '1 / -1' }} data-pre>
            {site.role[0]}
            <br />
            {site.role[1]}
          </p>
          <h1 className="cell h1 intro-name" style={{ '--c': '4 / 9', '--mc': '1 / -1' }}>
            <span className="block" data-hero>
              {site.firstName}
            </span>
            <span className="block" data-hero>
              {site.lastName}
            </span>
          </h1>
        </div>

        <div className="grid intro-lines">
          <p className="cell h1" style={{ '--c': '3 / 9', '--mc': '1 / -1' }}>
            {hero.lineA.map((l) => (
              <span key={l} className="block" data-hero>
                {l}
              </span>
            ))}
          </p>
          <p className="cell h1 intro-lineB" style={{ '--c': '4 / 9', '--mc': '2 / -1' }}>
            {hero.lineB.map((l, i) => (
              <span key={l} className={`block${i === lastB ? ' indent' : ''}`} data-hero>
                {l}
              </span>
            ))}
          </p>
        </div>

        <ThemeSwitches />

        <div className="grid">
          <p className="cell p1 intro-desc" style={{ '--c': '4 / 6', '--mc': '2 / -1' }} data-lines data-reveal>
            {site.description}
          </p>
        </div>

        <h2 className="grid statement">
          <span className="cell h1" style={{ '--c': '2 / 4', '--r': 1, '--mc': '1 / 3' }} data-goo>
            {hero.statement.lead}
          </span>
          <span className="cell h1" style={{ '--c': '4 / 9', '--r': 1, '--mc': '3 / -1' }} data-goo>
            {hero.statement.next}
          </span>
          {hero.statement.rest.map((l, i) => (
            <span key={l} className="cell h1" style={{ '--c': '3 / 9', '--r': i + 2, '--mc': '1 / -1' }} data-goo>
              {l}
            </span>
          ))}
        </h2>

        <div className="grid">
          <p className="cell p1 intro-copy" style={{ '--c': '4 / 6', '--mc': '2 / -1' }} data-fade data-reveal>
            © {site.year}
          </p>
        </div>
      </section>

      <section className="featured" ref={featured} aria-label="Selected work">
        <div className="featured-sticky">
          <div className="featured-canvas">
            <WorkSphere bridge={bridge} />
          </div>
          <div className="featured-title">
            <span className="h1 ft-work" data-goo>
              Work
            </span>
            <span className="h1 ft-years" data-goo>
              {site.workYears.join('–')}
            </span>
          </div>
        </div>
      </section>

      <div className="all-works">
        <TLink to="/work" className="h1 underline-link roll-host" data-goo>
          <Roll text="All Works" />
        </TLink>
      </div>

      <Archive />
      <Footer />
    </div>
  )
}
