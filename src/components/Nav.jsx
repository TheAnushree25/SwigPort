import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { useLocation } from 'react-router-dom'
import { gsap } from '../lib/gsap'
import { TLink, useApp } from '../lib/app'
import { navLinks } from '../content'
import Roll from './Roll'
import GridOverlay from './GridOverlay'

const vibrate = (ms = 8) => navigator.vibrate?.(ms)

export default function Nav() {
  const { menuOpen, setMenuOpen } = useApp()
  const [grid, setGrid] = useState(false)
  const root = useRef(null)
  const tl = useRef(null)
  const { pathname } = useLocation()

  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      const panels = gsap.utils.toArray('.menu-panel').reverse()
      gsap.set(panels, { clipPath: 'inset(0% 0% 100% 0%)' })
      gsap.set('.menu', { autoAlpha: 1 })
      tl.current = gsap
        .timeline({ paused: true })
        .set('.menu', { pointerEvents: 'auto' })
        .to(panels, { clipPath: 'inset(0% 0% 0% 0%)', duration: 0.8, ease: 'eio', stagger: 0.07 }, 0)
        .fromTo(gsap.utils.toArray('.menu-label .roll').reverse(), { yPercent: 115 }, { yPercent: 0, duration: 0.8, ease: 'eout', stagger: 0.07 }, 0.3)
        .fromTo(gsap.utils.toArray('.menu-index').reverse(), { scale: 0 }, { scale: 1, duration: 0.6, ease: 'eout', stagger: 0.07 }, 0.35)
        .fromTo('.menu-exp', { yPercent: 102 }, { yPercent: 0, duration: 0.7, ease: 'eio' }, 0.15)
        .to('.menu-btn .lbl-menu', { yPercent: -110, duration: 0.5, ease: 'eio' }, 0)
        .fromTo('.menu-btn .lbl-close', { yPercent: 110 }, { yPercent: 0, duration: 0.5, ease: 'eio' }, 0.05)
    }, root)
    return () => ctx.revert()
  }, [])

  useEffect(() => {
    const t = tl.current
    if (!t) return
    if (menuOpen) t.timeScale(1).play()
    else t.timeScale(1.6).reverse()
    if (!menuOpen) return
    const key = (e) => e.key === 'Escape' && setMenuOpen(false)
    const click = (e) => {
      if (!e.target.closest('.menu-panel, .menu-btn, .menu-exp')) setMenuOpen(false)
    }
    window.addEventListener('keydown', key)
    window.addEventListener('pointerdown', click)
    return () => {
      window.removeEventListener('keydown', key)
      window.removeEventListener('pointerdown', click)
    }
  }, [menuOpen, setMenuOpen])

  return (
    <header className="nav" ref={root}>
      <button
        className={`grid-toggle${grid ? ' is-on' : ''}`}
        data-reveal
        aria-label={grid ? 'Hide layout grid' : 'Show layout grid'}
        aria-pressed={grid}
        onClick={() => {
          vibrate()
          setGrid((g) => !g)
        }}
      />
      <GridOverlay visible={grid} />

      <button
        className={`menu-btn roll-host${menuOpen ? ' is-open' : ''}`}
        data-reveal
        aria-expanded={menuOpen}
        aria-controls="site-menu"
        onClick={() => {
          vibrate()
          setMenuOpen(!menuOpen)
        }}
      >
        <span className="menu-btn-inner p1">
          <span className="lbl-menu">
            <Roll text="Menu" />
          </span>
          <span className="lbl-close" aria-hidden={!menuOpen}>
            <Roll text="Close" />
          </span>
        </span>
      </button>

      <nav id="site-menu" className="menu" aria-label="Main" aria-hidden={!menuOpen}>
        <div className="menu-panels">
          {navLinks.map((l, i) => (
            <TLink key={l.path} to={l.path} className={`menu-panel menu-panel--${i + 1} roll-host`} tabIndex={menuOpen ? 0 : -1}>
              <span className={`menu-index p1${pathname === l.path ? ' is-active' : ''}`}>{l.index}</span>
              <span className="menu-label h2">
                <Roll text={l.label} />
              </span>
            </TLink>
          ))}
        </div>
        <TLink to="/experiments" className="menu-exp roll-host p1" tabIndex={menuOpen ? 0 : -1}>
          <Roll text="Experiments" />
        </TLink>
      </nav>
    </header>
  )
}
