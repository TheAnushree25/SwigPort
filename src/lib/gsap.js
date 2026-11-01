import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { SplitText } from 'gsap/SplitText'
import { CustomEase } from 'gsap/CustomEase'
import { MorphSVGPlugin } from 'gsap/MorphSVGPlugin'
import { Draggable } from 'gsap/Draggable'
import { InertiaPlugin } from 'gsap/InertiaPlugin'

gsap.registerPlugin(ScrollTrigger, SplitText, CustomEase, MorphSVGPlugin, Draggable, InertiaPlugin)

// Same curves as the CSS custom properties in base.css
CustomEase.create('eio', '0.76,0,0.24,1')
CustomEase.create('eout', '0.25,1,0.5,1')
CustomEase.create('ein', '0.5,0,0.75,0')
CustomEase.create('ewrite', '0.333,0,0.667,1')

gsap.defaults({ ease: 'eout', duration: 0.8 })
ScrollTrigger.config({ ignoreMobileResize: true })

export const reducedMotion = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches
export const isTouch = () => window.matchMedia('(hover: none), (pointer: coarse)').matches
export const isDesktop = () => window.matchMedia('(min-width: 992px)').matches

export { gsap, ScrollTrigger, SplitText, CustomEase, MorphSVGPlugin, Draggable, InertiaPlugin }
