import { themes } from '../content'

const KEY = 'swig-theme'
export const DROP_PATH = 'M52,6 C60,30 92,70 92,108 C92,136 73,154 50,154 C27,154 8,136 8,108 C8,70 44,30 52,6 Z'

export function getTheme() {
  const t = document.documentElement.dataset.theme
  return themes.find((x) => x.id === t) ? t : themes[0].id
}

export function themeColors() {
  const cs = getComputedStyle(document.documentElement)
  const read = (n) => cs.getPropertyValue(n).trim()
  return { bg: read('--bg'), bg2: read('--bg-2'), fg: read('--fg'), accent: read('--accent'), deep: read('--deep') }
}

function favicon(theme) {
  const t = themes.find((x) => x.id === theme) || themes[0]
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 160 160"><rect width="160" height="160" rx="36" fill="${t.bg}"/><g transform="translate(40 14) scale(0.8)"><path d="${DROP_PATH}" fill="${t.fg}"/></g></svg>`
  return `data:image/svg+xml,${encodeURIComponent(svg)}`
}

export function applyTheme(id) {
  const t = themes.find((x) => x.id === id) || themes[0]
  document.documentElement.dataset.theme = t.id
  try {
    sessionStorage.setItem(KEY, t.id)
  } catch {
    /* storage can be blocked */
  }
  let link = document.querySelector('link[rel="icon"]')
  if (!link) {
    link = document.createElement('link')
    link.rel = 'icon'
    document.head.appendChild(link)
  }
  link.type = 'image/svg+xml'
  link.href = favicon(t.id)
  document.querySelector('meta[name="theme-color"]')?.setAttribute('content', t.bg)
  window.dispatchEvent(new CustomEvent('themechange', { detail: t.id }))
}
