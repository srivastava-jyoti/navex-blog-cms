/**
 * Progressive enhancements for post pages. Everything here is optional:
 * without JavaScript the TOC stays expanded and the share links still work.
 */

/** Modern async Clipboard API (needs a secure context and permission). */
async function copyWithClipboardApi(text) {
  if (!navigator.clipboard?.writeText) return false
  try {
    await navigator.clipboard.writeText(text)
    return true
  } catch {
    return false
  }
}

/** Fallback for browsers or contexts where the Clipboard API is blocked. */
function copyWithSelection(text) {
  const field = document.createElement('textarea')
  field.value = text
  field.setAttribute('readonly', '')
  field.style.position = 'fixed'
  field.style.opacity = '0'
  document.body.append(field)
  field.select()
  let ok = false
  try {
    ok = document.execCommand('copy')
  } catch {
    ok = false
  }
  field.remove()
  return ok
}

/** Copy-link and native share buttons. */
function initShare() {
  const root = document.querySelector('[data-share]')
  if (!root) return

  const url = root.dataset.url || window.location.href
  const title = root.dataset.title || document.title
  const status = root.querySelector('[data-share-status]')
  const copyButton = root.querySelector('[data-share-copy]')
  const nativeButton = root.querySelector('[data-share-native]')
  let resetTimer

  const announce = (message) => {
    if (!status) return
    status.textContent = message
    clearTimeout(resetTimer)
    resetTimer = setTimeout(() => (status.textContent = ''), 4000)
  }

  if (copyButton) {
    copyButton.hidden = false
    copyButton.addEventListener('click', async () => {
      const copied = (await copyWithClipboardApi(url)) || copyWithSelection(url)
      announce(copied ? 'Link copied to clipboard.' : 'Could not copy the link. Please copy it from the address bar.')
      copyButton.focus()
    })
  }

  if (nativeButton && navigator.share) {
    nativeButton.hidden = false
    nativeButton.addEventListener('click', async () => {
      try {
        await navigator.share({title, url})
      } catch (error) {
        // AbortError means the user closed the share sheet: not an error.
        if (error?.name !== 'AbortError') announce('Sharing is not available right now.')
      }
    })
  }
}

/** Collapse the TOC on small screens and highlight the section in view. */
function initToc() {
  const toc = document.querySelector('[data-toc]')
  if (!toc) return

  const desktop = window.matchMedia('(min-width: 64rem)')
  const syncOpen = () => {
    if (desktop.matches) toc.open = true
  }
  if (!desktop.matches) toc.open = false
  desktop.addEventListener('change', syncOpen)

  // On desktop the TOC is always expanded; ignore clicks on the summary.
  toc.querySelector('summary')?.addEventListener('click', (event) => {
    if (desktop.matches) event.preventDefault()
  })

  const links = new Map()
  toc.querySelectorAll('a[href^="#"]').forEach((link) => {
    const target = document.getElementById(decodeURIComponent(link.hash.slice(1)))
    if (target) links.set(target, link)
  })
  if (!links.size) return

  // Active section = the last heading scrolled past the sticky header.
  const headings = [...links.keys()]
  const offset = () => (parseFloat(getComputedStyle(document.documentElement).scrollPaddingTop) || 80) + 1
  let ticking = false

  const update = () => {
    ticking = false
    const line = offset()
    const atBottom = window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 2
    let current = atBottom ? headings.at(-1) : undefined
    if (!current) {
      for (const heading of headings) {
        if (heading.getBoundingClientRect().top <= line) current = heading
        else break
      }
    }
    links.forEach((link, heading) => {
      const active = heading === current
      link.classList.toggle('is-active', active)
      if (active) link.setAttribute('aria-current', 'location')
      else link.removeAttribute('aria-current')
    })
  }

  window.addEventListener(
    'scroll',
    () => {
      if (!ticking) {
        ticking = true
        requestAnimationFrame(update)
      }
    },
    {passive: true},
  )
  update()
}


initShare()
initToc()
