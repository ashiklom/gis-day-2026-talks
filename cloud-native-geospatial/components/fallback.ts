/**
 * Load an image URL with a timeout. Resolves to the URL actually displayed and
 * whether the static fallback (captured ahead of time, in public/fallback/) was used.
 * Keeps the talk working on bad conference wifi.
 */
export function loadImage(url: string, fallback: string | undefined, timeoutMs = 20000): Promise<{ src: string, offline: boolean }> {
  return new Promise((resolve) => {
    const img = new Image()
    let done = false
    const finish = (ok: boolean) => {
      if (done)
        return
      done = true
      clearTimeout(timer)
      if (ok || !fallback)
        resolve({ src: url, offline: !ok })
      else
        resolve({ src: fallback, offline: true })
    }
    const timer = setTimeout(() => finish(false), timeoutMs)
    img.onload = () => finish(true)
    img.onerror = () => finish(false)
    img.src = url
  })
}

export function fallbackUrl(name: string) {
  return `${import.meta.env.BASE_URL}fallback/${name}`
}
