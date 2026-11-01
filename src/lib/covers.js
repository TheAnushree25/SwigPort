// Image preloading. The 4:3 work images gate the preloader (the counter
// follows them); full-size frames for Experiments load right after,
// while the visitor is already looking around.

import { useEffect, useState } from 'react'
import { projects, experiments } from '../content'

const CORE = [...new Set(projects.map((p) => p.image))]
const REST = [...new Set(experiments.map((e) => e.src))]

function load(url) {
  return new Promise((resolve) => {
    const img = new Image()
    img.decoding = 'async'
    img.onload = () => (img.decode ? img.decode().catch(() => {}).then(resolve) : resolve())
    img.onerror = resolve
    img.src = url
  })
}

let ready
let restReady
let progress = 0
let coreDone = false
let restDone = false
const listeners = new Set()

export function prepareCovers(listener) {
  if (listener) {
    listeners.add(listener)
    listener(progress)
  }
  if (ready) return ready
  ready = (async () => {
    let n = 0
    const fonts = document.fonts?.load('500 40px "Inter Tight Variable"').catch(() => {})
    await Promise.all(
      CORE.map((url) =>
        load(url).then(() => {
          progress = ++n / CORE.length
          listeners.forEach((fn) => fn(progress))
        }),
      ),
    )
    await fonts
    coreDone = true
  })()
  return ready
}

function prepareRest() {
  if (restReady) return restReady
  restReady = (async () => {
    await prepareCovers()
    // a few at a time so the page stays responsive
    for (let i = 0; i < REST.length; i += 4) await Promise.all(REST.slice(i, i + 4).map(load))
    restDone = true
  })()
  return restReady
}

// true once the requested images are decoded ('core' = work images)
export function useCovers(scope = 'core') {
  const isDone = () => (scope === 'core' ? coreDone : restDone)
  const [ok, setOk] = useState(isDone)
  useEffect(() => {
    if (ok) return
    let live = true
    ;(scope === 'core' ? prepareCovers() : prepareRest()).then(() => live && setOk(true))
    return () => {
      live = false
    }
  }, [ok, scope])
  return ok
}

export const warmCovers = () => prepareRest()
