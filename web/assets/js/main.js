/**
 * Copy-link button on blog posts. The button stays hidden if JavaScript is off.
 */
const share = document.querySelector('[data-share]')
const button = share?.querySelector('[data-share-copy]')
const status = share?.querySelector('[data-share-status]')
let clearStatusTimer

/** Copy text to the clipboard. Returns true on success. */
async function copyToClipboard(text) {
  try {
    await navigator.clipboard.writeText(text)
    return true
  } catch {
    // Fallback for browsers where the Clipboard API is unavailable or blocked.
    const field = Object.assign(document.createElement('textarea'), {value: text})
    document.body.append(field)
    field.select()
    try {
      return document.execCommand('copy')
    } catch {
      return false
    } finally {
      field.remove()
    }
  }
}

if (button && status) {
  button.hidden = false
  button.addEventListener('click', async () => {
    const copied = await copyToClipboard(share.dataset.url || window.location.href)
    status.textContent = copied ? 'Link copied!' : 'Could not copy the link.'
    clearTimeout(clearStatusTimer)
    clearStatusTimer = setTimeout(() => (status.textContent = ''), 3000)
  })
}
