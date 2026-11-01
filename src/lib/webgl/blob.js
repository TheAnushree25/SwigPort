import * as THREE from 'three'
import { FULLSCREEN_VERT } from './glsl'

// A raymarched drop of port: three metaballs folding into each other,
// lit like dark glass. Lives inside the footer clock.

const FRAG = /* glsl */ `
uniform float uTime;
uniform vec2 uRes;
uniform vec2 uMouse;
uniform vec3 uBase;
uniform vec3 uGlow;
uniform vec3 uSpec;
uniform vec3 uBgTop;
uniform vec3 uBgBottom;
varying vec2 vUv;

float smin(float a, float b, float k) {
  float h = clamp(0.5 + 0.5 * (b - a) / k, 0.0, 1.0);
  return mix(b, a, h) - k * h * (1.0 - h);
}

float map(vec3 p) {
  float t = uTime * 0.7;
  vec3 q = p;
  q.xz *= mat2(cos(t * 0.4), -sin(t * 0.4), sin(t * 0.4), cos(t * 0.4));
  float d = length(q - vec3(sin(t) * 0.32, cos(t * 1.3) * 0.22, 0.0)) - 0.52;
  d = smin(d, length(q - vec3(cos(t * 0.8) * 0.42, sin(t * 1.1) * 0.38, sin(t * 0.9) * 0.2)) - 0.36, 0.42);
  d = smin(d, length(q - vec3(sin(t * 1.6 + 1.0) * 0.3, -cos(t * 0.7) * 0.44, cos(t * 1.2) * 0.25)) - 0.3, 0.42);
  d = smin(d, length(q - vec3(-0.35 + uMouse.x * 0.25, 0.2 + uMouse.y * 0.25, 0.25)) - 0.18, 0.35);
  d += sin(q.x * 9.0 + t * 2.0) * sin(q.y * 8.0 + t * 1.7) * sin(q.z * 7.0 + t) * 0.012;
  return d;
}

vec3 normalAt(vec3 p) {
  vec2 e = vec2(0.0015, 0.0);
  return normalize(vec3(
    map(p + e.xyy) - map(p - e.xyy),
    map(p + e.yxy) - map(p - e.yxy),
    map(p + e.yyx) - map(p - e.yyx)
  ));
}

void main() {
  vec2 uv = (vUv - 0.5) * vec2(uRes.x / uRes.y, 1.0);
  vec3 ro = vec3(0.0, 0.0, 2.6);
  vec3 rd = normalize(vec3(uv, -1.55));
  vec3 bg = mix(uBgBottom, uBgTop, vUv.y);
  float t = 0.0;
  float hit = 0.0;
  for (int i = 0; i < 72; i++) {
    vec3 p = ro + rd * t;
    float d = map(p);
    if (d < 0.0012) { hit = 1.0; break; }
    t += d * 0.9;
    if (t > 6.0) break;
  }
  vec3 col = bg;
  if (hit > 0.5) {
    vec3 p = ro + rd * t;
    vec3 n = normalAt(p);
    vec3 l = normalize(vec3(-0.6, 0.8, 0.7));
    float diff = max(dot(n, l), 0.0);
    float fres = pow(1.0 - max(dot(n, -rd), 0.0), 3.0);
    vec3 r = reflect(rd, n);
    float env = smoothstep(-0.2, 0.9, r.y) * 0.9 + smoothstep(0.4, 1.0, r.x) * 0.35;
    float spec = pow(max(dot(r, l), 0.0), 48.0);
    float spec2 = pow(max(dot(r, normalize(vec3(0.7, -0.2, 0.6))), 0.0), 18.0);
    col = uBase * (0.25 + diff * 0.75);
    col += uGlow * fres * 1.1;
    col += uGlow * env * 0.22;
    col += uSpec * (spec * 1.4 + spec2 * 0.25);
  }
  // soft bloom halo
  float halo = exp(-length(uv) * 3.2) * 0.22;
  col += uGlow * halo * (1.0 - hit);
  gl_FragColor = vec4(col, 1.0);
  #include <colorspace_fragment>
}
`

export class LiquidBlob {
  constructor(canvas) {
    this.renderer = new THREE.WebGLRenderer({ canvas, antialias: false, alpha: false })
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    this.scene = new THREE.Scene()
    this.camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1)
    this.mat = new THREE.ShaderMaterial({
      vertexShader: FULLSCREEN_VERT,
      fragmentShader: FRAG,
      uniforms: {
        uTime: { value: 0 },
        uRes: { value: new THREE.Vector2(1, 1) },
        uMouse: { value: new THREE.Vector2() },
        uBase: { value: new THREE.Color('#4a0710') },
        uGlow: { value: new THREE.Color('#e2323e') },
        uSpec: { value: new THREE.Color('#fff1e6') },
        uBgTop: { value: new THREE.Color('#1a0407') },
        uBgBottom: { value: new THREE.Color('#070102') },
      },
    })
    this.scene.add(new THREE.Mesh(new THREE.PlaneGeometry(2, 2), this.mat))
    this.mouse = new THREE.Vector2()
  }

  resize(w, h) {
    this.renderer.setSize(w, h, false)
    this.mat.uniforms.uRes.value.set(w, h)
  }

  update(dt, t) {
    const m = this.mat.uniforms.uMouse.value
    m.lerp(this.mouse, 0.05)
    this.mat.uniforms.uTime.value = t
    this.renderer.render(this.scene, this.camera)
  }

  dispose() {
    this.mat.dispose()
    this.renderer.dispose()
  }
}
