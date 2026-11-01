import { useLayoutEffect, useRef } from 'react'
import { gsap } from '../lib/gsap'
import { gooIn } from '../lib/goo'
import { TLink, useApp } from '../lib/app'
import Roll from '../components/Roll'

export default function NotFound() {
  const root = useRef(null)
  const { ready } = useApp()
  useLayoutEffect(() => {
    if (!ready) return
    const ctx = gsap.context(() => gooIn('[data-hero]', { stagger: 0.1 }), root)
    return () => ctx.revert()
  }, [ready])
  return (
    <div className="page page--404" ref={root}>
      <h1 className="h1 nf-code" data-hero data-reveal>
        404
      </h1>
      <p className="p1 fg-2" data-hero data-reveal>
        This bottle is empty.
      </p>
      <TLink to="/" className="link-button roll-host p1" data-hero data-reveal>
        <Roll text="Pour another — back home" />
      </TLink>
    </div>
  )
}
