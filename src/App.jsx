import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react'
import { Route, Routes, useLocation } from 'react-router-dom'
import { gsap, ScrollTrigger, reducedMotion } from './lib/gsap'
import { lenis, scrollToTop } from './lib/scroll'
import { AppContext } from './lib/app'
import { applyTheme, getTheme } from './lib/theme'
import { warmCovers } from './lib/covers'
import Preloader from './components/Preloader'
import Nav from './components/Nav'
import StickyName from './components/StickyName'
import ThemeFlood from './components/ThemeFlood'
import CursorChat from './components/CursorChat'
import Grain from './components/Grain'
import Home from './pages/Home'
import Work from './pages/Work'
import Contact from './pages/Contact'
import Experiments from './pages/Experiments'
import NotFound from './pages/NotFound'

const TITLES = {
  '/': 'Shirsha Bhattacharjee — Senior Visualizer, Designer & Illustrator',
  '/work': 'Work 22–26 — Shirsha Bhattacharjee',
  '/contact': 'Contact — Shirsha Bhattacharjee',
  '/experiments': 'Experiments — Shirsha Bhattacharjee',
}

export default function App() {
  const location = useLocation()
  const [display, setDisplay] = useState(location)
  const [ready, setReady] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const main = useRef(null)
  const latest = useRef(location)
  const leaving = useRef(null)
  latest.current = location

  useEffect(() => applyTheme(getTheme()), [])

  // Leave: the current page blurs and dissolves, then routes swap.
  useEffect(() => {
    if (location.pathname === display.pathname) return
    setMenuOpen(false)
    lenis.stop()
    document.documentElement.classList.add('is-transitioning')
    leaving.current?.kill()
    leaving.current = gsap.to(main.current, {
      filter: reducedMotion() ? 'none' : 'blur(18px)',
      autoAlpha: 0,
      duration: reducedMotion() ? 0.2 : 0.75,
      ease: 'ein',
      onComplete: () => setDisplay(latest.current),
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location])

  // Enter: new page is in the DOM; pages run their own entrances.
  useLayoutEffect(() => {
    scrollToTop()
    gsap.set(main.current, { clearProps: 'filter,opacity,visibility' })
    document.documentElement.classList.remove('is-transitioning')
    document.title = TITLES[display.pathname] || 'Not found — Shirsha Bhattacharjee'
    const id = requestAnimationFrame(() => {
      ScrollTrigger.refresh()
      if (ready) lenis.start()
    })
    return () => cancelAnimationFrame(id)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [display])

  const onLoaded = useCallback(() => {
    setReady(true)
    lenis.start()
    requestAnimationFrame(() => ScrollTrigger.refresh())
  }, [])

  // chrome appears once the counter is gone
  useEffect(() => {
    if (!ready) return
    gsap.fromTo('.menu-btn', { scale: 0, autoAlpha: 1 }, { scale: 1, duration: 0.9, ease: 'back.out(1.6)', delay: 0.6 })
    gsap.fromTo('.grid-toggle', { scale: 0, autoAlpha: 1 }, { scale: 1, duration: 0.7, ease: 'eout', delay: 0.8 })
    document.fonts?.ready.then(() => ScrollTrigger.refresh())
    warmCovers()
  }, [ready])

  const nameMode = display.pathname === '/contact' ? 'merged' : display.pathname === '/experiments' ? 'ghost' : 'scroll'
  const ctx = useMemo(() => ({ ready, menuOpen, setMenuOpen, nameMode }), [ready, menuOpen, nameMode])

  return (
    <AppContext.Provider value={ctx}>
      <StickyName />
      <main className="main" ref={main}>
        <Routes location={display}>
          <Route path="/" element={<Home />} />
          <Route path="/work" element={<Work />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/experiments" element={<Experiments />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>
      <Nav />
      <ThemeFlood />
      <CursorChat />
      <Grain />
      {!ready && <Preloader onDone={onLoaded} />}
    </AppContext.Provider>
  )
}
