import assert from 'node:assert/strict'
import { execFileSync } from 'node:child_process'
import { mkdtempSync, readFileSync, rmSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { basename, dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { Script, createContext } from 'node:vm'

const root = dirname(dirname(fileURLToPath(import.meta.url)))
const manifest = JSON.parse(readFileSync(join(root, 'package.json'), 'utf8'))
const filename = `${manifest.name}-${manifest.version}.tgz`
const work = mkdtempSync(join(tmpdir(), 'dsh-provider-ui-pack-'))

try {
  const [report] = JSON.parse(execFileSync('npm', ['pack', '--json', '--ignore-scripts', '--pack-destination', work], {
    cwd: root,
    encoding: 'utf8',
  }))
  assert.equal(report.filename, filename)
  const archive = join(work, filename)
  assert.deepEqual(readFileSync(join(root, filename)), readFileSync(archive), 'tracked release archive differs from the current build')
  const packed = JSON.parse(execFileSync('tar', ['-xOzf', archive, 'package/package.json'], { encoding: 'utf8' }))
  assert.equal(packed.name, manifest.name)
  assert.equal(packed.version, manifest.version)
  assert.equal(packed.dsh?.compatibility?.dshReleases?.['0.1.7-alpha.2'], 'compatible')
  assert.equal(packed.dsh?.compatibility?.dshReleases?.['0.1.7-rc.1'], 'compatible')
  for (const section of ['dependencies', 'optionalDependencies', 'peerDependencies']) {
    for (const [name, spec] of Object.entries(packed[section] ?? {})) {
      assert.doesNotMatch(spec, /^(?:file|link|workspace|npm):|^\//u, `${section}.${name} must not be local`)
      if (name.startsWith('@deepseek-ai/dsh-')) {
        assert.equal(section, 'peerDependencies', `${name} must be a Host-provided peer`)
        assert.match(spec, /^>=\d+\.\d+\.\d+(?:-[0-9A-Za-z.-]+)?$/u, `${name} must have no upper version bound`)
      }
    }
  }
  const paths = execFileSync('tar', ['-tzf', archive], { encoding: 'utf8' }).trim().split('\n')
  assert.equal(paths.length, report.entryCount)
  assert(paths.every(path => path.startsWith('package/') && !path.includes('/../') && !/(?:^|\/)\.env(?:\.|$)/u.test(path)))
  for (const entry of ['LICENSE', 'README.md', 'cordis.patch.yml', 'lib/index.js', 'lib/client.js']) {
    assert(paths.includes(`package/${entry}`), `missing ${entry}`)
  }
  for (const entry of Object.values(packed.exports ?? {})) {
    for (const target of typeof entry === 'string' ? [entry] : Object.values(entry)) {
      assert(paths.includes(`package/${target.replace(/^\.\//u, '')}`), `missing export ${target}`)
    }
  }
  const client = execFileSync('tar', ['-xOzf', archive, 'package/lib/client.js'], { encoding: 'utf8' })
  const registered = []
  const window = { __ModuleLoader__: { load(row) { registered.push(row) } } }
  new Script(client, { filename: 'lib/client.js' }).runInContext(createContext({ window, self: window, console }))
  assert.equal(registered.length, 1)
  assert.equal(registered[0].id, packed.name)
  assert.equal(typeof registered[0].factory, 'function')
  console.log(`pack check passed: ${basename(archive)} matches tracked artifact, DSH peer range, exports, and Web ModuleLoader`)
} finally {
  rmSync(work, { recursive: true, force: true })
}
