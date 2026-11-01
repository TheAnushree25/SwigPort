import { useLayoutEffect, useRef } from 'react'
import { gsap } from '../lib/gsap'
import { setupReveals } from '../lib/reveal'
import { manifesto, site, socials } from '../content'
import Clock from './Clock'
import Roll from './Roll'

// Shared closing chapter: manifesto around the live clock, contact
// details and socials. The merged name lands in the space below.
export default function Footer() {
  const root = useRef(null)
  useLayoutEffect(() => {
    const ctx = gsap.context(() => setupReveals(root.current), root)
    return () => ctx.revert()
  }, [])

  const [t1, t2] = manifesto.top
  const [b1, b2] = manifesto.bottom
  return (
    <footer className="footer" ref={root}>
      <div className="footer-rule" data-reveal data-clip />
      <div className="grid footer-manifesto">
        <h2 className="cell h1" style={{ '--c': '3 / 8', '--mc': '1 / -1' }}>
          {t1.map((l) => (
            <span key={l} className="block" data-goo>
              {l}
            </span>
          ))}
        </h2>
        <p className="cell h1 footer-indent" style={{ '--c': '4 / 8', '--mc': '2 / -1' }}>
          {t2.map((l) => (
            <span key={l} className="block" data-goo>
              {l}
            </span>
          ))}
        </p>
      </div>

      <Clock />

      <div className="grid footer-manifesto footer-manifesto--end">
        <p className="cell h1 right" style={{ '--c': '1 / 6', '--mc': '1 / 4' }}>
          {b1.map((l) => (
            <span key={l} className="block" data-goo>
              {l}
            </span>
          ))}
        </p>
        <p className="cell h1 right footer-shift" style={{ '--c': '1 / 7', '--mc': '1 / -1' }}>
          {b2.map((l) => (
            <span key={l} className="block" data-goo>
              {l}
            </span>
          ))}
        </p>
      </div>

      <div className="grid footer-contact">
        <div className="cell" style={{ '--c': '3 / 5', '--mc': '1 / -1' }}>
          <p className="p1" data-lines data-reveal>
            {site.availability[0]}
            <br />
            {site.availability[1]}
          </p>
          <p className="p1 fg-2 footer-label" data-lines data-reveal>
            {site.contact.lead}
          </p>
          <a className="link-button roll-host p1" href={site.contact.href} target="_blank" rel="noreferrer" data-fade data-reveal>
            <Roll text={site.contact.label} />
          </a>
        </div>
      </div>

      <ul className="socials" aria-label="Social links">
        {socials.map((s) => (
          <li key={s.id} className="social-item" data-tile data-reveal>
            <a className="social-link p1" href={s.href} target="_blank" rel="noreferrer" aria-label={s.label}>
              {s.short}
            </a>
          </li>
        ))}
      </ul>
      <div className="footer-name-space" />
    </footer>
  )
}
