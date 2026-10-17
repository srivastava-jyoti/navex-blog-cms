/**
 * Copy-link button on blog posts. The button stays hidden if JavaScript is off.
 */
const share = document.querySelector('[data-share]')
const button = share?.querySelector('[data-share-copy]')
const status = share?.querySelector('[data-share-status]')

async function copy(text) {
  try {
    await navigator.clipboard.writeText(text)
    return true
  } catch {
    // Fallback for browsers where the Clipboard API is unavailable or blocked.
    const field = Object.assign(document.createElement('textarea'), {value: text})
    document.body.append(field)
    field.select()
    const ok = document.execCommand('copy')
    field.remove()
    return ok
  }
}

if (button) {
  button.hidden = false
  button.addEventListener('click', async () => {
    const ok = await copy(share.dataset.url || window.location.href)
    status.textContent = ok ? 'Link copied!' : 'Could not copy the link.'
    setTimeout(() => (status.textContent = ''), 3000)
  })
}
