import { copyFileSync, readFileSync, writeFileSync, readdirSync, unlinkSync, existsSync } from 'node:fs'
import { join } from 'node:path'

const dist = 'dist'
for (const name of ['.htaccess', 'auth.php', 'gate.php', 'index.php', 'sw.js']) {
  copyFileSync(join('xserver', name), join(dist, name))
}

const manifestPath = join(dist, 'manifest.webmanifest')
const manifest = JSON.parse(readFileSync(manifestPath, 'utf8'))
manifest.id = './'
manifest.display = 'standalone'
manifest.start_url = './'
manifest.scope = './'
if (Array.isArray(manifest.icons)) {
  for (const icon of manifest.icons) {
    const src = String(icon.src || '').replace(/^\.?\//, '')
    icon.src = `./${src}`
  }
}
writeFileSync(manifestPath, `${JSON.stringify(manifest)}\n`)

const htmlPath = join(dist, 'index.html')
let html = readFileSync(htmlPath, 'utf8')
if (html.includes('src="/') || html.includes('href="/')) {
  throw new Error('dist/index.html にドメイン直下の絶対パスが残っています')
}
writeFileSync(htmlPath, html)

function dropWorkbox(dir) {
  if (!existsSync(dir)) return
  for (const file of readdirSync(dir)) {
    if (file.startsWith('workbox-') && file.endsWith('.js')) {
      unlinkSync(join(dir, file))
    }
  }
}
dropWorkbox(dist)
dropWorkbox(join(dist, 'assets'))

const sw = readFileSync(join(dist, 'sw.js'), 'utf8')
if (!sw.includes("event.respondWith(fetch(event.request))")) {
  throw new Error('dist/sw.js がアプリ本体をキャッシュしない版ではありません')
}
if (sw.includes('precacheAndRoute')) {
  throw new Error('dist/sw.js がアプリ本体をプリキャッシュしています')
}
