import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { gsap, ScrollTrigger } from '../lib/gsap'
import { gooIn } from '../lib/goo'
import { setupReveals } from '../lib/reveal'
import { useCovers } from '../lib/covers'
import { useApp } from '../lib/app'
import { lenis } from '../lib/scroll'
import { projects, site } from '../content'
import WorkSphere from '../components/WorkSphere'
import Footer from '../components/Footer'

export default function Work() {
  const root = useRef(null)
  const [view, setView] = useState('cards')
  const [hover, setHover] = useState(null)
  const ok = useCovers()
  const { ready } = useApp()
  const jump = useRef(false)

  // Switching views re-measures the page and glides to the new view.
  useEffect(() => {
    ScrollTrigger.refresh()
    if (!jump.current) return
    jump.current = false
    const target = root.current.querySelector('.works-list, .works-sphere')
    if (target) lenis.scrollTo(target, { duration: 1.6 })
  }, [view])

  // Opening: the window opens from a point, then grows into the page.
  useLayoutEffect(() => {
    if (!ready) return
    const ctx = gsap.context(() => {
      gsap.set('[data-hero]', { autoAlpha: 0 })
      gsap.fromTo('.works-box', { clipPath: 'inset(50% 50% 50% 50%)', autoAlpha: 1 }, { clipPath: 'inset(0% 0% 0% 0%)', duration: 1.25, ease: 'eio', delay: 0.1 })
      gooIn('[data-hero]', { delay: 0.45, stagger: 0.08 })
      // --grow drives the window size and pushes the years outwards
      gsap
        .timeline({ scrollTrigger: { trigger: '.works-hero', start: 'top top', end: 'bottom bottom', scrub: 0.6 } })
        .fromTo('.works-sticky', { '--grow': 0 }, { '--grow': 1, ease: 'eio', duration: 1 }, 0)
        .to('.works-title', { scale: 0.42, yPercent: -60, ease: 'eio', duration: 1 }, 0)
      setupReveals(root.current, { skip: '.footer' })
    }, root)
    return () => ctx.revert()
  }, [ready])

  // Cards: gentle parallax inside each frame
  useLayoutEffect(() => {
    if (!ready || view !== 'cards' || !ok) return
    const ctx = gsap.context(() => {
      gsap.utils.toArray('.work-card').forEach((card) => {
        gsap.fromTo(card, { autoAlpha: 0, y: 60 }, { autoAlpha: 1, y: 0, duration: 1.1, ease: 'eout', scrollTrigger: { trigger: card, start: 'top 92%', once: true } })
        gsap.fromTo(
          card.querySelector('.work-card-media'),
          { yPercent: -5 },
          { yPercent: 5, ease: 'none', scrollTrigger: { trigger: card, start: 'top bottom', end: 'bottom top', scrub: true } },
        )
      })
      ScrollTrigger.refresh()
    }, root)
    return () => ctx.revert()
  }, [ready, view, ok])

  return (
    <div className="page page--work" ref={root}>
      <section className="works-hero">
        <div className="works-sticky">
          <span className="h1 works-year works-year--l" data-hero data-reveal>
            {site.workYears[0]}
          </span>
          <span className="h1 works-year works-year--r" data-hero data-reveal>
            {site.workYears[1]}
          </span>
          <div className="works-box" data-reveal>
            <h1 className="h1 works-title" data-hero data-reveal>
              Work
            </h1>
            <div className="works-toggle p1" role="tablist" aria-label="View" data-hero data-reveal>
              {['cards', 'sphere'].map((v, i) => (
                <span key={v}>
                  {i > 0 && <span className="fg-2"> / </span>}
                  <button role="tab" aria-selected={view === v} className={view === v ? 'is-active' : ''} onClick={() => {
                      jump.current = true
                      setView(v)
                    }}>
                    {v === 'cards' ? 'Cards' : 'Sphere'}
                  </button>
                </span>
              ))}
            </div>
          </div>
        </div>
      </section>

      {view === 'cards' ? (
        <section className="works-list" aria-label="Projects">
          <div className="grid works-grid">
            {projects.map((p, i) => (
              <a
                key={p.id}
                className="cell work-card"
                style={{ '--c': i % 2 ? '5 / 9' : '1 / 5', '--mc': '1 / -1' }}
                href={p.href}
                target="_blank"
                rel="noreferrer"
              >
                <div className="work-card-media">{ok && <img src={p.image} alt={`${p.title} — ${p.category}`} loading="lazy" draggable="false" />}</div>
                <div className="work-card-meta p1">
                  <span className="pill">{p.kind}</span>
                  <span>{p.title}</span>
                  <span className="fg-2 only-desktop">{p.category}</span>
                  <span className="work-card-year">
                    {p.year} <span className="work-card-arrow">↗</span>
                  </span>
                </div>
              </a>
            ))}
          </div>
        </section>
      ) : (
        <section className="works-sphere" aria-label="Projects sphere">
          <WorkSphere interactive onHover={setHover} />
          <div className="works-sphere-caption p1" aria-live="polite">
            {hover ? (
              <>
                <span className="pill">{hover.kind}</span> {hover.title} <span className="fg-2">— {hover.category}</span>
              </>
            ) : (
              <span className="fg-2">Drag to spin · hover a frame</span>
            )}
          </div>
        </section>
      )}

      <section className="works-outro">
        <div className="works-outro-box" data-reveal data-clip>
          <p className="p1" data-lines data-reveal>
            Shaped by obsession, refined by patience, poured with care.
          </p>
        </div>
      </section>
      <Footer />
    </div>
  )
}
