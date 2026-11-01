import * as THREE from 'three'
import { FULLSCREEN_VERT, SNOISE } from './glsl'

// Cursor-driven liquid mask. A ping-pong buffer accumulates brush
// strokes and slowly heals; the display pass draws the page colour
// everywhere except the wiped area, with a wine-red rim at the edge.

const SIM = /* glsl */ `
uniform sampler2D uPrev;
uniform vec2 uTexel;
uniform vec2 uA;
uniform vec2 uB;
uniform float uRadius;
uniform float uStrength;
uniform float uDecay;
uniform float uAspect;
uniform float uTime;
varying vec2 vUv;
${SNOISE}
void main() {
  float c = texture2D(uPrev, vUv).r;
  float n = texture2D(uPrev, vUv + vec2(0.0, uTexel.y)).r;
  float s = texture2D(uPrev, vUv - vec2(0.0, uTexel.y)).r;
  float e = texture2D(uPrev, vUv + vec2(uTexel.x, 0.0)).r;
  float w = texture2D(uPrev, vUv - vec2(uTexel.x, 0.0)).r;
  float v = mix(c, (n + s + e + w) * 0.25, 0.3) * uDecay;

  vec2 asp = vec2(uAspect, 1.0);
  vec2 p = vUv * asp;
  vec2 a = uA * asp;
  vec2 b = uB * asp;
  vec2 pa = p - a, ba = b - a;
  float h = clamp(dot(pa, ba) / max(dot(ba, ba), 1e-6), 0.0, 1.0);
  float d = length(pa - ba * h);
  float wob = snoise(p * 5.0 + uTime * 0.5) * 0.45 * uRadius;
  float brush = 1.0 - smoothstep(uRadius * 0.3, uRadius + wob, d);
  v = max(v, brush * uStrength);
  gl_FragColor = vec4(clamp(v, 0.0, 1.0), 0.0, 0.0, 1.0);
}
`

const DISPLAY = /* glsl */ `
uniform sampler2D uMask;
uniform vec3 uCover;
uniform vec3 uRim;
uniform float uTime;
uniform float uAspect;
varying vec2 vUv;
${SNOISE}
void main() {
  float m = texture2D(uMask, vUv).r;
  float n = snoise(vec2(vUv.x * uAspect, vUv.y) * 4.0 + uTime * 0.2) * 0.07;
  float v = m + n;
  float fw = max(fwidth(v), 1e-4);
  float hole = smoothstep(0.345 - fw, 0.345 + fw, v);
  // a crisp ink contour of constant width, plus a faint inner warmth
  float line = 1.0 - smoothstep(fw * 0.6, fw * 2.2, abs(v - 0.335));
  float warm = smoothstep(0.25, 0.34, v) * (1.0 - hole) * 0.12;
  vec4 col = vec4(mix(uCover, uRim, clamp(line + warm, 0.0, 1.0)), 1.0 - hole);
  gl_FragColor = col;
  #include <colorspace_fragment>
  gl_FragColor.rgb *= gl_FragColor.a;
}
`

export class FluidReveal {
  constructor(canvas) {
    this.renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: false, premultipliedAlpha: true })
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5))
    this.renderer.setClearColor(0x000000, 0)
    this.scene = new THREE.Scene()
    this.camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1)
    this.quad = new THREE.Mesh(new THREE.PlaneGeometry(2, 2))
    this.scene.add(this.quad)
    const opts = { type: THREE.HalfFloatType, minFilter: THREE.LinearFilter, magFilter: THREE.LinearFilter, depthBuffer: false }
    this.rt = [new THREE.WebGLRenderTarget(4, 4, opts), new THREE.WebGLRenderTarget(4, 4, opts)]
    this.sim = new THREE.ShaderMaterial({
      vertexShader: FULLSCREEN_VERT,
      fragmentShader: SIM,
      uniforms: {
        uPrev: { value: null },
        uTexel: { value: new THREE.Vector2() },
        uA: { value: new THREE.Vector2(-1, -1) },
        uB: { value: new THREE.Vector2(-1, -1) },
        uRadius: { value: 0.1 },
        uStrength: { value: 0 },
        uDecay: { value: 0.985 },
        uAspect: { value: 1 },
        uTime: { value: 0 },
      },
    })
    this.display = new THREE.ShaderMaterial({
      vertexShader: FULLSCREEN_VERT,
      fragmentShader: DISPLAY,
      transparent: true,
      uniforms: {
        uMask: { value: null },
        uCover: { value: new THREE.Color() },
        uRim: { value: new THREE.Color() },
        uTime: { value: 0 },
        uAspect: { value: 1 },
      },
    })
    this.pointer = { x: -1, y: -1, px: -1, py: -1, moved: false, speed: 0 }
    this.time = 0
  }

  setColors({ bg, accent }) {
    this.display.uniforms.uCover.value.set(bg)
    this.display.uniforms.uRim.value.set(accent)
  }

  resize(w, h) {
    this.w = w
    this.h = h
    this.renderer.setSize(w, h, false)
    const sw = Math.max(64, Math.round(w / 4))
    const sh = Math.max(64, Math.round(h / 4))
    this.rt.forEach((t) => t.setSize(sw, sh))
    this.sim.uniforms.uTexel.value.set(1 / sw, 1 / sh)
    this.sim.uniforms.uAspect.value = w / h
    this.display.uniforms.uAspect.value = w / h
  }

  move(x, y) {
    const p = this.pointer
    if (p.x < 0) {
      p.px = x
      p.py = y
    }
    p.x = x
    p.y = y
    p.moved = true
  }

  update(dt) {
    this.time += dt
    const p = this.pointer
    const u = this.sim.uniforms
    const dist = p.moved ? Math.hypot((p.x - p.px) * (this.w / this.h), p.y - p.py) : 0
    p.speed += (dist / Math.max(dt, 1 / 240) - p.speed) * 0.2
    const strength = p.moved ? Math.min(1, 0.55 + p.speed * 0.9) : 0
    u.uA.value.set(p.px, p.py)
    u.uB.value.set(p.x, p.y)
    u.uRadius.value = 0.085 + Math.min(0.09, p.speed * 0.05)
    u.uStrength.value = strength
    u.uDecay.value = Math.pow(0.986, dt * 60)
    u.uTime.value = this.time
    u.uPrev.value = this.rt[0].texture

    this.quad.material = this.sim
    this.renderer.setRenderTarget(this.rt[1])
    this.renderer.render(this.scene, this.camera)
    this.rt.reverse()

    this.quad.material = this.display
    this.display.uniforms.uMask.value = this.rt[0].texture
    this.display.uniforms.uTime.value = this.time
    this.renderer.setRenderTarget(null)
    this.renderer.render(this.scene, this.camera)

    p.px = p.x
    p.py = p.y
    p.moved = false
  }

  dispose() {
    this.rt.forEach((t) => t.dispose())
    this.sim.dispose()
    this.display.dispose()
    this.quad.geometry.dispose()
    this.renderer.dispose()
  }
}
