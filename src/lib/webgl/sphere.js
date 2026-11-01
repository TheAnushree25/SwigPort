import * as THREE from 'three'

// A globe of project tiles. Fronts show the artwork, backs show an
// empty frame, and depth fades everything into the page colour.

const VERT = /* glsl */ `
varying vec2 vUv;
varying float vDepth;
void main() {
  vUv = uv;
  vec4 mv = modelViewMatrix * vec4(position, 1.0);
  vDepth = -mv.z;
  gl_Position = projectionMatrix * mv;
}
`

const FRAG = /* glsl */ `
uniform sampler2D uMap;
uniform float uHasMap;
uniform vec3 uBg;
uniform vec3 uBack;
uniform vec3 uLine;
uniform float uNear;
uniform float uFar;
uniform float uHover;
uniform float uAlpha;
varying vec2 vUv;
varying float vDepth;
void main() {
  vec3 col;
  if (gl_FrontFacing) {
    vec2 uv = (vUv - 0.5) * (1.0 - uHover * 0.06) + 0.5;
    col = uHasMap > 0.5 ? texture2D(uMap, uv).rgb : uBack;
  } else {
    vec2 uv = vec2(1.0 - vUv.x, vUv.y);
    vec2 edge = step(vec2(0.025, 0.033), uv) * step(vec2(0.025, 0.033), 1.0 - uv);
    col = mix(uLine, uBack, edge.x * edge.y);
  }
  float fog = smoothstep(uNear, uFar, vDepth);
  col = mix(col, uBg, fog * 0.82);
  gl_FragColor = vec4(col, uAlpha);
  #include <colorspace_fragment>
}
`

export class SphereScene {
  constructor(canvas, items, { interactive = false, count = 30, radius = 3.25 } = {}) {
    this.canvas = canvas
    this.interactive = interactive
    this.renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true })
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    this.renderer.setClearColor(0x000000, 0)
    this.scene = new THREE.Scene()
    this.camera = new THREE.PerspectiveCamera(30, 1, 0.1, 100)
    this.camera.position.set(0, 0, 15)
    this.root = new THREE.Group()
    this.group = new THREE.Group()
    this.root.add(this.group)
    this.scene.add(this.root)
    this.common = {
      uBg: { value: new THREE.Color() },
      uBack: { value: new THREE.Color() },
      uLine: { value: new THREE.Color() },
      uNear: { value: 12.5 },
      uFar: { value: 18.5 },
      uAlpha: { value: 1 },
    }
    this.textures = new Map()
    this.meshes = []
    const loader = new THREE.TextureLoader()
    const golden = Math.PI * (3 - Math.sqrt(5))
    for (let i = 0; i < count; i++) {
      const item = items[i % items.length]
      const y = 1 - (i / (count - 1)) * 2
      const r = Math.sqrt(1 - y * y)
      const th = golden * i
      const pos = new THREE.Vector3(Math.cos(th) * r, y * 0.92, Math.sin(th) * r).multiplyScalar(radius)
      const big = i % 3 === 0
      const s = big ? 1.05 : 0.48 + ((i * 37) % 10) / 40
      const geo = new THREE.PlaneGeometry(s * 1.333, s, 1, 1)
      if (!this.textures.has(item.url) && item.url) {
        const tex = loader.load(item.url)
        tex.colorSpace = THREE.SRGBColorSpace
        tex.anisotropy = 4
        this.textures.set(item.url, tex)
      }
      const mat = new THREE.ShaderMaterial({
        vertexShader: VERT,
        fragmentShader: FRAG,
        side: THREE.DoubleSide,
        transparent: true,
        uniforms: {
          ...this.common,
          uMap: { value: this.textures.get(item.url) || null },
          uHasMap: { value: item.url ? 1 : 0 },
          uHover: { value: 0 },
        },
      })
      const mesh = new THREE.Mesh(geo, mat)
      mesh.position.copy(pos)
      mesh.lookAt(pos.clone().multiplyScalar(2))
      mesh.userData = { item, base: pos.clone(), hover: 0 }
      this.group.add(mesh)
      this.meshes.push(mesh)
    }
    this.rot = { x: 0.18, y: 0, vx: 0, vy: 0.0016 }
    this.progress = 0
    this.intro = 1
    this.ray = new THREE.Raycaster()
    this.mouse = new THREE.Vector2(9, 9)
    this.hovered = null
    this.onHover = null
  }

  setColors({ bg, bg2, fg }) {
    // the work page shows the globe on the secondary surface
    const surface = this.interactive ? bg2 : bg
    this.common.uBg.value.set(surface)
    this.common.uBack.value.set(this.interactive ? bg : bg2)
    this.common.uLine.value.set(new THREE.Color(surface).lerp(new THREE.Color(fg), 0.35))
  }

  resize(w, h) {
    this.w = w
    this.h = h
    this.renderer.setSize(w, h, false)
    this.camera.aspect = w / h
    // keep the globe a constant share of the viewport height
    const fit = Math.min(1, (w / h) / 0.9)
    this.camera.position.z = 15 / fit
    this.common.uNear.value = this.camera.position.z - 2.5
    this.common.uFar.value = this.camera.position.z + 3.5
    this.camera.updateProjectionMatrix()
  }

  pointer(x, y) {
    this.mouse.set(x, y)
  }

  drag(dx, dy) {
    const clamp = THREE.MathUtils.clamp
    this.rot.vy = clamp(dx * 0.0012, -0.05, 0.05)
    this.rot.vx = clamp(dy * 0.0008, -0.03, 0.03)
    this.rot.y += dx * 0.0045
    this.rot.x = clamp(this.rot.x + dy * 0.003, -0.8, 0.8)
  }

  update(dt, t) {
    const r = this.rot
    if (this.interactive) {
      r.y += r.vy * dt * 60
      r.vy += (0.0016 - r.vy) * 0.03
      r.vx *= 0.92
      r.x += r.vx
      r.x += (0.18 - r.x) * 0.01
    }
    const scroll = this.progress
    this.group.rotation.y = r.y + scroll * Math.PI * 1.35 + t * (this.interactive ? 0 : 0.06)
    this.group.rotation.x = r.x + Math.sin(t * 0.3) * 0.04
    const s = this.intro
    this.root.scale.setScalar(Math.max(0.0001, s))

    if (this.interactive) {
      this.ray.setFromCamera(this.mouse, this.camera)
      const hit = this.ray.intersectObjects(this.meshes, false).find((h) => h.face && h.face.normal && h.object.material && this.isFront(h))
      const next = hit ? hit.object : null
      if (next !== this.hovered) {
        this.hovered = next
        this.onHover?.(next ? next.userData.item : null)
        this.canvas.style.cursor = next ? 'pointer' : ''
      }
    }
    for (const m of this.meshes) {
      const target = m === this.hovered ? 1 : 0
      m.userData.hover += (target - m.userData.hover) * 0.12
      m.material.uniforms.uHover.value = m.userData.hover
      const k = 1 + m.userData.hover * 0.12
      m.scale.setScalar(k)
    }
    this.renderer.render(this.scene, this.camera)
  }

  isFront(hit) {
    const n = hit.face.normal.clone().transformDirection(hit.object.matrixWorld)
    return n.dot(this.ray.ray.direction) < 0
  }

  dispose() {
    this.meshes.forEach((m) => {
      m.geometry.dispose()
      m.material.dispose()
    })
    this.textures.forEach((t) => t.dispose())
    this.renderer.dispose()
  }
}
