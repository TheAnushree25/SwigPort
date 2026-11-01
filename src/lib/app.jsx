import { createContext, useContext, useEffect, useRef } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { lenis } from './scroll'

export const AppContext = createContext(null)
export const useApp = () => useContext(AppContext)

// Runs `fn` once the preloader has finished (immediately on later pages).
export function useWhenReady(fn, deps = []) {
  const { ready } = useApp()
  const done = useRef(false)
  useEffect(() => {
    if (!ready || done.current) return
    done.current = true
    return fn()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ready, ...deps])
}

// Internal link that routes through the page transition.
export function TLink({ to, children, onClick, ...rest }) {
  const { setMenuOpen, menuOpen } = useApp()
  const navigate = useNavigate()
  const location = useLocation()
  const handle = (e) => {
    if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button !== 0) return
    e.preventDefault()
    onClick?.(e)
    if (location.pathname === to) {
      setMenuOpen(false)
      lenis.scrollTo(0, { duration: 1.4 })
      return
    }
    if (menuOpen) {
      setMenuOpen(false)
      setTimeout(() => navigate(to), 420)
    } else navigate(to)
  }
  return (
    <a href={to} onClick={handle} {...rest}>
      {children}
    </a>
  )
}
