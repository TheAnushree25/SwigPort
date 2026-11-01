import * as THREE from 'three'

// Experiments: an endless corridor of framed pieces. Wheel/drag moves
// the camera through the field; tiles wrap around so it never ends.

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
uniform vec3 uBg;
uniform vec3 uFrame;
uniform float uFrameW;
uniform float uAspect;
uniform float uFar;
uniform float uHover;
varying vec2 vUv;
varying float vDepth;
void main() {
  vec2 fw = vec2(uFrameW / uAspect, uFrameW);
  vec2 inner = step(fw, vUv) * step(fw, 1.0 - vUv);
  float isImg = inner.x * inner.y;
  vec2 uv = (vUv - fw) / (1.0 - 2.0 * fw);
  uv = (uv - 0.5) * (1.0 - uHover * 0.05) + 0.5;
  vec3 col = mix(uFrame, texture2D(uMap, uv).rgb, isImg);
  float near = smoothstep(0.4, 2.2, vDepth);
  float far = smoothstep(uFar * 0.22, uFar * 0.85, vDepth);
  col = mix(col, uBg, far * 0.9);
  gl_FragColor = vec4(col, near * (1.0 - far * 0.8));
  #include <colorspace_fragment>
}
`

export class FieldScene {
  constructor(canvas, urls, { count = 54, depth = 64 } = {}) {
    this.canvas = canvas
    this.renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true })
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    this.renderer.setClearColor(0x000000, 0)
    this.scene = new THREE.Scene()
    this.camera = new THREE.PerspectiveCamera(50, 1, 0.1, 120)
    this.depth = depth
    this.common = { uBg: { value: new THREE.Color() }, uFar: { value: depth * 0.75 } }
    this.tiles = []
    const loader = new THREE.TextureLoader()
    const tex = urls.map((u) => {
      const t = loader.load(u, (tt) => {
        const img = tt.image
        this.tiles.forEach((m) => {
          if (m.material.uniforms.uMap.value === tt) this.fit(m, img.width / img.height)
        })
      })
      t.colorSpace = THREE.SRGBColorSpace
      return t
    })
    this.textures = tex
    let seed = 7
    const rnd = () => ((seed = (seed * 16807) % 2147483647) / 2147483647)
    for (let i = 0; i < count; i++) {
      const map = tex[i % tex.length]
      const dark = rnd() > 0.5
      const mat = new THREE.ShaderMaterial({
        vertexShader: VERT,
        fragmentShader: FRAG,
        transparent: true,
        uniforms: {
          ...this.common,
          uMap: { value: map },
          uFrame: { value: new THREE.Color(dark ? '#0c0203' : '#f3ebe1') },
          uFrameW: { value: 0.045 + rnd() * 0.03 },
          uAspect: { value: 1.33 },
          uHover: { value: 0 },
        },
      })
      const size = 0.7 + rnd() * 1.3
      const mesh = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), mat)
      mesh.userData = { size, hover: 0, spin: (rnd() - 0.5) * 0.25 }
      // a loose tunnel around the camera keeps the centre (title) clear
      const ang = rnd() * Math.PI * 2
      const rad = 2.3 + rnd() * 3.4
      mesh.position.set(Math.cos(ang) * rad * 1.5, Math.sin(ang) * rad * 0.78, -rnd() * depth)
      this.fit(mesh, 1.33)
      this.scene.add(mesh)
      this.tiles.push(mesh)
    }
    this.z = 4
    this.vz = 0
    this.target = new THREE.Vector2()
    this.mouse = new THREE.Vector2()
    this.ray = new THREE.Raycaster()
    this.hovered = null
    this.onHover = null
  }

  fit(mesh, aspect) {
    const s = mesh.userData.size
    mesh.scale.set(s * Math.min(aspect, 1.8), s, 1)
    mesh.material.uniforms.uAspect.value = Math.min(aspect, 1.8)
  }

  setColors({ bg }) {
    this.common.uBg.value.set(bg)
  }

  resize(w, h) {
    this.renderer.setSize(w, h, false)
    this.camera.aspect = w / h
    this.camera.updateProjectionMatrix()
  }

  push(delta) {
    this.vz += delta * 0.0022
  }

  pointer(x, y) {
    this.target.set(x, y)
    this.mouse.set(x, y)
  }

  update(dt) {
    this.vz *= Math.pow(0.9, dt * 60)
    this.z -= (this.vz + 0.006) * dt * 60
    const cam = this.camera
    cam.position.z = this.z
    cam.position.x += (this.target.x * 0.6 - cam.position.x) * 0.05
    cam.position.y += (this.target.y * 0.4 - cam.position.y) * 0.05
    cam.lookAt(cam.position.x * 0.6, cam.position.y * 0.6, this.z - 10)
    for (const m of this.tiles) {
      // wrap tiles that fell behind the camera to the far end
      if (m.position.z > this.z + 1) m.position.z -= this.depth
      else if (m.position.z < this.z - this.depth) m.position.z += this.depth
      m.rotation.y = m.userData.spin + m.userData.hover * 0.1
      m.userData.hover += ((m === this.hovered ? 1 : 0) - m.userData.hover) * 0.12
      m.material.uniforms.uHover.value = m.userData.hover
    }
    this.ray.setFromCamera(this.mouse, cam)
    const hit = this.ray.intersectObjects(this.tiles, false)[0]
    const next = hit && hit.distance < 14 ? hit.object : null
    if (next !== this.hovered) {
      this.hovered = next
      this.onHover?.(next)
    }
    this.renderer.render(this.scene, cam)
  }

  dispose() {
    this.tiles.forEach((m) => {
      m.geometry.dispose()
      m.material.dispose()
    })
    this.textures.forEach((t) => t.dispose())
    this.renderer.dispose()
  }
}
