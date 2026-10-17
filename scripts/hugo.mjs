/**
 * Runs Hugo with the native Dart Sass binary from the `sass-embedded` npm
 * package on PATH, so Sass compiles identically locally and on Netlify
 * without installing Dart Sass separately.
 *
 * Usage: node scripts/hugo.mjs [hugo args…]
 */
import {spawn} from 'node:child_process'
import {existsSync} from 'node:fs'
import {createRequire} from 'node:module'
import {delimiter, dirname, join} from 'node:path'

const require = createRequire(import.meta.url)
const pkg = `sass-embedded-${process.platform}-${process.arch}`

let sassDir
try {
  sassDir = join(dirname(require.resolve(`${pkg}/package.json`)), 'dart-sass')
} catch {
  // Fall through: Hugo will use any `sass` already on PATH.
}

const env = {...process.env}
if (sassDir && existsSync(sassDir)) {
  env.PATH = `${sassDir}${delimiter}${env.PATH ?? ''}`
} else {
  console.warn(`⚠ ${pkg} not found; relying on a Dart Sass install on PATH.`)
}

const hugo = spawn('hugo', ['--source', 'web', ...process.argv.slice(2)], {stdio: 'inherit', env})
hugo.on('exit', (code) => process.exit(code ?? 1))
hugo.on('error', (error) => {
  console.error('✖ Could not start Hugo. Is Hugo (extended) installed?', error.message)
  process.exit(1)
})
