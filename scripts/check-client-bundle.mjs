import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'

const source = await readFile(new URL('../lib/client.js', import.meta.url), 'utf8')
const sourceMap = JSON.parse(await readFile(new URL('../lib/client.js.map', import.meta.url), 'utf8'))
const imports = [...source.matchAll(/\brequire\((['"])([^'"]+)\1\)/g)].map(match => match[2])
const allowed = new Set([
  'react', 'react/jsx-runtime', 'react-dom', 'react-dom/client',
  '@deepseek-ai/cordis', '@deepseek-ai/dsh-client-store', '@deepseek-ai/dsh-client-ui-slots',
])
const forbidden = [...new Set(imports.filter(id => !allowed.has(id)))].sort()

assert.deepEqual(forbidden, [], `client bundle contains unavailable imports: ${forbidden.join(', ')}`)
assert.match(source, /plugins\.bundle\.config/)
assert.match(source, /web-search-pro/)
// The client module registers under its package name; the loader looks the
// bundle up by that name and reports "did not activate" on a mismatch.
assert.match(source, /id:\s*["']dsh-web-search-pro-plus["']/)
assert.match(source, /key:\s*["']dsh-web-search-pro-plus["']/)
assert.match(source, /Web Search Pro/)
assert.equal('sourcesContent' in sourceMap, false, 'client source map must exclude platform-dependent source contents')
console.log(`client bundle check passed (${[...new Set(imports)].length} module-table imports)`)
