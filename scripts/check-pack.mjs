import { createHash } from 'node:crypto'
import { spawnSync } from 'node:child_process'
import { builtinModules, createRequire } from 'node:module'
import {
  lstatSync,
  mkdirSync,
  mkdtempSync,
  readFileSync,
  readdirSync,
  realpathSync,
  rmdirSync,
  unlinkSync,
  writeFileSync,
} from 'node:fs'
import { tmpdir } from 'node:os'
import { dirname, join, posix, relative, resolve, sep } from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'

const ROOT = resolve(fileURLToPath(new URL('..', import.meta.url)))
const FIXTURE_ROOT = join(ROOT, 'fixtures', 'alpha4')
const FIXTURE_TARBALL_ROOT = join(FIXTURE_ROOT, 'tarballs')
const PACKAGE_NAME = 'dsh-llm-providers-ui'
const PACKAGE_VERSION = '0.1.10'
const ROOT_ARCHIVE = join(ROOT, PACKAGE_NAME + '-' + PACKAGE_VERSION + '.tgz')
const OFFICIAL_ALPHA4 = '0.1.2-alpha.4'
const OFFICIAL_TAG = 'dsh-v0.1.2-alpha.4'
const OFFICIAL_COMMIT = '4e84901e6471b79ec0338099867ebb4606d12bb5'
const OFFICIAL_REPOSITORY = 'https://github.com/deepseek-ai/deepseek-harness.git'
const INVALID_REGISTRY = 'http://127.0.0.1:9/'
const DEPENDENCY_SECTIONS = ['dependencies', 'optionalDependencies', 'peerDependencies']
const INHERITED_ENV_KEYS = [
  'PATH', 'HOME', 'USER', 'LOGNAME', 'SHELL', 'TMPDIR', 'TMP', 'TEMP',
  'LANG', 'LC_ALL', 'TZ', 'CI', 'SystemRoot', 'WINDIR', 'ComSpec', 'PATHEXT',
]
const PACK_CONFIG_ENV_KEYS = new Set([
  'npm_config_userconfig', 'pnpm_config_userconfig',
  'npm_config_registry', 'pnpm_config_registry',
  'npm_config_offline', 'pnpm_config_offline',
  'npm_config_ignore_scripts', 'pnpm_config_ignore_scripts',
  'npm_config_strict_peer_dependencies', 'pnpm_config_strict_peer_dependencies',
  'npm_config_audit', 'pnpm_config_audit',
  'npm_config_fund', 'pnpm_config_fund',
])
const OFFICIAL_VENDOR_PACKAGES = new Map([
  ['@deepseek-ai/cordis', 'vendor/cordis'],
  ['@deepseek-ai/cordis-plugin-include', 'vendor/include'],
  ['@deepseek-ai/cordis-plugin-loader', 'vendor/loader'],
  ['@deepseek-ai/cosmokit', 'vendor/cosmokit'],
  ['@deepseek-ai/schemastery', 'vendor/schemastery'],
])
const REQUIRED_FILES = [
  'LICENSE',
  'README.md',
  'package.json',
  'cordis.patch.yml',
  'lib/index.js',
  'lib/client.js',
  'lib/order.js',
  'lib/sortable.js',
  'lib/provider-ui.js',
  'lib/usage-readers.js',
  'lib/types/index.d.ts',
  'lib/types/client/index.d.ts',
  'lib/types/order.d.ts',
  'lib/types/sortable.d.ts',
  'lib/types/provider-ui.d.ts',
  'lib/types/client/provider-ui.d.ts',
  'lib/types/usage-readers.d.ts',
  'lib/types/client/ProvidersSection.d.ts',
  'lib/types/client/provider-section.d.ts',
]
const EXPECTED_EXPORTS = {
  '.': { types: './lib/types/index.d.ts', default: './lib/index.js' },
  './client': { types: './lib/types/client/index.d.ts', default: './lib/client.js' },
  './package.json': './package.json',
  './order': { types: './lib/types/order.d.ts', default: './lib/order.js' },
  './sortable': { types: './lib/types/sortable.d.ts', default: './lib/sortable.js' },
  './provider-ui': { types: './lib/types/provider-ui.d.ts', default: './lib/provider-ui.js' },
  './usage-readers': { types: './lib/types/usage-readers.d.ts', default: './lib/usage-readers.js' },
}
const BUILTIN_MODULES = new Set([...builtinModules, ...builtinModules.map(name => 'node:' + name)])
const SOURCE_SEGMENTS = new Set(['src', 'source', 'test', 'tests', '__tests__', 'scripts'])

function fail(message) {
  throw new Error('pack gate: ' + message)
}

function commandEnv(extra = {}) {
  const environment = {}
  for (const key of INHERITED_ENV_KEYS) {
    const value = process.env[key]
    if (value !== undefined) environment[key] = value
  }
  environment.NODE_PATH = ''
  for (const [key, value] of Object.entries(extra)) {
    if (!PACK_CONFIG_ENV_KEYS.has(key)) continue
    environment[key] = value
  }
  return environment
}

function run(commandName, args, options = {}) {
  const result = spawnSync(commandName, args, {
    cwd: options.cwd ?? ROOT,
    env: commandEnv(options.env),
    encoding: 'utf8',
    input: options.input,
    maxBuffer: 128 * 1024 * 1024,
    stdio: ['ignore', 'pipe', 'pipe'],
  })
  const stdout = typeof result.stdout === 'string' ? result.stdout : ''
  const stderr = typeof result.stderr === 'string' ? result.stderr : ''
  if (result.error || result.status !== 0) {
    const detail = [stdout, stderr].filter(Boolean).join('\n').trim()
    fail(commandName + ' ' + args.join(' ') + (detail ? ':\n' + detail : ''))
  }
  if (/\bnpm\s+(?:warn|WARN)\b/u.test(stdout + '\n' + stderr)) fail(commandName + ' emitted an npm warning')
  return stdout
}

function readJson(file, label = file) {
  try {
    return JSON.parse(readFileSync(file, 'utf8'))
  } catch (error) {
    fail('invalid JSON in ' + label + ': ' + (error instanceof Error ? error.message : String(error)))
  }
}

function parsePackReport(output) {
  const start = output.lastIndexOf('\n[')
  const json = start >= 0 ? output.slice(start + 1) : output.trim()
  let report
  try {
    report = JSON.parse(json)
  } catch (error) {
    fail('npm pack returned invalid JSON: ' + (error instanceof Error ? error.message : String(error)))
  }
  if (!Array.isArray(report) || report.length !== 1) fail('npm pack returned no single tarball report')
  const item = report[0]
  if (item === null || typeof item !== 'object' || Array.isArray(item) || typeof item.filename !== 'string') fail('npm pack report has no tarball filename')
  if (!Number.isSafeInteger(item.size) || item.size <= 0) fail('npm pack report has an invalid size')
  if (typeof item.shasum !== 'string' || !/^[0-9a-f]{40}$/u.test(item.shasum)) fail('npm pack report has an invalid shasum')
  if (typeof item.integrity !== 'string' || !/^sha512-[A-Za-z0-9+/]{86}==$/u.test(item.integrity)) fail('npm pack report has an invalid integrity')
  if (!Number.isSafeInteger(item.entryCount) || item.entryCount <= 0) fail('npm pack report has an invalid entryCount')
  if (!Array.isArray(item.files)) fail('npm pack report has no file list')
  return item
}

function isExpectedAbsence(error) {
  return error !== null && typeof error === 'object' && 'code' in error
    && (error.code === 'ENOENT' || error.code === 'ENOTDIR')
}

function lstatIfPresent(file) {
  try {
    return lstatSync(file)
  } catch (error) {
    if (isExpectedAbsence(error)) return undefined
    throw error
  }
}

function realpathIfPresent(file) {
  try {
    return realpathSync(file)
  } catch (error) {
    if (isExpectedAbsence(error)) return undefined
    throw error
  }
}

function isRegularFile(file) {
  const stat = lstatIfPresent(file)
  return stat !== undefined && stat.isFile() && !stat.isSymbolicLink()
}

function assertRegularFile(file, label) {
  const stat = lstatIfPresent(file)
  if (stat === undefined) fail(label + ' is missing: ' + file)
  if (!stat.isFile() || stat.isSymbolicLink() || stat.size === 0) fail(label + ' is not a non-empty regular file: ' + file)
  return stat
}

function sha1(file) {
  return createHash('sha1').update(readFileSync(file)).digest('hex')
}

function sha256(file) {
  return createHash('sha256').update(readFileSync(file)).digest('hex')
}

function sha512Integrity(file) {
  return 'sha512-' + createHash('sha512').update(readFileSync(file)).digest('base64')
}

function archiveJson(archive) {
  return JSON.parse(run('tar', ['-xOzf', archive, 'package/package.json']))
}

function archiveFiles(archive) {
  const entries = run('tar', ['-tzf', archive]).split(/\r?\n/u).filter(Boolean)
  const metadata = run('tar', ['-tvzf', archive]).split(/\r?\n/u).filter(Boolean)
  if (metadata.length !== entries.length) fail('archive listing and metadata counts differ')
  const files = new Set()
  for (let index = 0; index < entries.length; index += 1) {
    const entry = entries[index]
    const detail = metadata[index]
    if (detail?.[0] !== '-') fail('archive member is not a regular file: ' + entry)
    if (!entry.startsWith('package/')) fail('archive entry is outside package/: ' + entry)
    const value = entry.slice('package/'.length)
    if (!value || value.endsWith('/')) fail('archive entry is not a file: ' + entry)
    if (value.includes('\0') || value.startsWith('/') || value.startsWith('../') || value.includes('/../') || value.includes('\\') || /^[A-Za-z]:[\\/]/u.test(value)) fail('archive entry is unsafe: ' + value)
    if (files.has(value)) fail('archive contains duplicate path: ' + value)
    files.add(value)
  }
  return files
}

function cleanTarget(target, label, dotRequired = true) {
  if (typeof target !== 'string' || target.length === 0 || target.startsWith('/') || target.startsWith('\\')
    || (dotRequired && !target.startsWith('./'))) fail(label + ' is not a relative export target')
  const value = target.startsWith('./') ? target.slice(2) : target
  const normalized = posix.normalize(value)
  if (!normalized || normalized === '..' || normalized.startsWith('../') || normalized.includes('\\') || normalized.includes('*') || normalized.split('/').includes('..')) {
    fail(label + ' is not a concrete shipped target: ' + target)
  }
  return normalized
}

function collectExportTargets(value, label = 'exports') {
  if (typeof value === 'string') return [{ label, target: value }]
  if (Array.isArray(value)) return value.flatMap((entry, index) => collectExportTargets(entry, label + '[' + String(index) + ']'))
  if (value !== null && typeof value === 'object') return Object.entries(value).flatMap(([key, entry]) => collectExportTargets(entry, label + '.' + key))
  return []
}

function dependencyMap(manifest) {
  const result = new Map()
  for (const section of DEPENDENCY_SECTIONS) {
    for (const [name, spec] of Object.entries(manifest[section] ?? {})) result.set(name, spec)
  }
  return result
}

function dependencyEntries(manifest) {
  const result = []
  const optionalPeers = new Set(Object.entries(manifest.peerDependenciesMeta ?? {})
    .filter(([, meta]) => meta?.optional === true)
    .map(([name]) => name))
  for (const field of DEPENDENCY_SECTIONS) {
    for (const [name, range] of Object.entries(manifest[field] ?? {})) {
      if (typeof range !== 'string') fail('dependency range is not a string for ' + field + '.' + name)
      result.push({ field, name, range, optional: field === 'optionalDependencies' || optionalPeers.has(name) })
    }
  }
  return result
}

function parseVersion(value) {
  const match = /^(\d+)\.(\d+)(?:\.(\d+))?(?:-([0-9A-Za-z.-]+))?(?:\+[0-9A-Za-z.-]+)?$/u.exec(String(value).trim())
  if (match === null) return undefined
  return {
    major: Number(match[1]),
    minor: Number(match[2]),
    patch: match[3] === undefined ? 0 : Number(match[3]),
    partial: match[3] === undefined,
    prerelease: match[4] === undefined ? [] : match[4].split('.'),
  }
}

function compareVersions(left, right) {
  for (const key of ['major', 'minor', 'patch']) {
    if (left[key] !== right[key]) return left[key] < right[key] ? -1 : 1
  }
  if (left.prerelease.length === 0 && right.prerelease.length !== 0) return 1
  if (left.prerelease.length !== 0 && right.prerelease.length === 0) return -1
  for (let index = 0; index < Math.max(left.prerelease.length, right.prerelease.length); index += 1) {
    const a = left.prerelease[index]
    const b = right.prerelease[index]
    if (a === undefined) return -1
    if (b === undefined) return 1
    if (a === b) continue
    const aNumber = /^\d+$/u.test(a) ? Number(a) : undefined
    const bNumber = /^\d+$/u.test(b) ? Number(b) : undefined
    if (aNumber !== undefined && bNumber !== undefined) return aNumber < bNumber ? -1 : 1
    if (aNumber !== undefined) return -1
    if (bNumber !== undefined) return 1
    return a < b ? -1 : 1
  }
  return 0
}

function rangeComparator(version, operator, target) {
  const comparison = compareVersions(version, target)
  if (operator === '>') return comparison > 0
  if (operator === '>=') return comparison >= 0
  if (operator === '<') return comparison < 0
  if (operator === '<=') return comparison <= 0
  return comparison === 0
}

function satisfiesComparator(version, token) {
  const match = /^(\^|~|>=|<=|>|<|=)?\s*(\d+)(?:\.(\d+|x|X|\*))?(?:\.(\d+|x|X|\*))?(?:-([0-9A-Za-z.-]+))?$/u.exec(token.trim())
  if (match === null) return false
  const minorMissing = match[3] === undefined || /^[xX*]$/u.test(match[3])
  const patchMissing = match[4] === undefined || /^[xX*]$/u.test(match[4])
  const bound = {
    major: Number(match[2]),
    minor: minorMissing ? 0 : Number(match[3]),
    patch: patchMissing ? 0 : Number(match[4]),
    prerelease: match[5] === undefined ? [] : match[5].split('.'),
  }
  const operator = match[1] ?? ''
  const comparison = compareVersions(version, bound)
  if (operator === '>') return comparison > 0
  if (operator === '>=') return comparison >= 0
  if (operator === '<') return comparison < 0
  if (operator === '<=') return comparison <= 0
  if (operator === '^') {
    const upper = bound.major > 0
      ? { major: bound.major + 1, minor: 0, patch: 0, prerelease: [] }
      : bound.minor > 0
        ? { major: 0, minor: bound.minor + 1, patch: 0, prerelease: [] }
        : { major: 0, minor: 0, patch: bound.patch + 1, prerelease: [] }
    return comparison >= 0 && compareVersions(version, upper) < 0
  }
  if (operator === '~') {
    const upper = { major: bound.major, minor: bound.minor + 1, patch: 0, prerelease: [] }
    return comparison >= 0 && compareVersions(version, upper) < 0
  }
  if (minorMissing) {
    const upper = { major: bound.major, minor: bound.minor + 1, patch: 0, prerelease: [] }
    return comparison >= 0 && compareVersions(version, upper) < 0
  }
  if (patchMissing) {
    const upper = { major: bound.major, minor: bound.minor + 1, patch: 0, prerelease: [] }
    return comparison >= 0 && compareVersions(version, upper) < 0
  }
  return comparison === 0
}

function satisfiesRange(versionValue, rangeValue) {
  if (typeof rangeValue !== 'string') return false
  const version = parseVersion(versionValue)
  if (version === undefined) return false
  const range = rangeValue.trim().replace(/^workspace:/u, '')
  if (range === '' || range === '*' || range === 'latest') return true
  if (range.includes('||')) return range.split('||').some(part => satisfiesRange(versionValue, part))
  const hyphen = /^(\S+)\s+-\s+(\S+)$/u.exec(range)
  if (hyphen !== null) {
    const lower = parseVersion(hyphen[1])
    const upper = parseVersion(hyphen[2])
    return lower !== undefined && upper !== undefined
      && rangeComparator(version, '>=', lower)
      && rangeComparator(version, '<=', upper)
  }
  const normalized = range.replace(/(>=|<=|>|<|=)[ \t]+/gu, '$1')
  const tokens = normalized.match(/(?:\^|~|>=|<=|>|<|=)?\s*\d+(?:\.(?:\d+|x|X|\*)){0,2}(?:-[0-9A-Za-z.-]+)?/gu)
  if (tokens === null || tokens.length === 0) return false
  return tokens.every(token => satisfiesComparator(version, token))
}

function checkDependencySpecs(manifest, label) {
  for (const section of DEPENDENCY_SECTIONS) {
    for (const [name, spec] of Object.entries(manifest[section] ?? {})) {
      if (typeof spec !== 'string') fail(label + ' has a non-string ' + section + '.' + name)
      if (/^(?:file|link|workspace|npm):/u.test(spec) || spec.startsWith('/') || /^[A-Za-z]:[\\/]/u.test(spec)) {
        fail(label + ' contains a local or alias dependency at ' + section + '.' + name)
      }
      const allowsVerifiedDshRange = name.startsWith('@deepseek-ai/dsh-') && satisfiesRange(OFFICIAL_ALPHA4, spec) && satisfiesRange('0.1.2-rc.1', spec)
      if (/(?:0\.1\.2-alpha\.2|\brc(?:\.|-|\d)|\bnext\b)/iu.test(spec) && !allowsVerifiedDshRange) {
        fail(label + ' contains a prerelease drift at ' + section + '.' + name + ': ' + spec)
      }
      if (name.startsWith('@deepseek-ai/dsh-') && label === 'packed package' && spec !== OFFICIAL_ALPHA4 && !allowsVerifiedDshRange) {
        fail(label + ' DSH dependency ' + name + ' must include Alpha.4 and rc.1, got ' + spec)
      }
    }
  }
}

function checkManifest(manifest, files, label = 'packed package') {
  if (manifest.name !== PACKAGE_NAME) fail(label + ' has unexpected name ' + String(manifest.name))
  if (manifest.version !== PACKAGE_VERSION) fail(label + ' has unexpected version ' + String(manifest.version))
  checkDependencySpecs(manifest, label)
  if (manifest.main === undefined || manifest.types === undefined) fail(label + ' must declare main and types')
  for (const [field, target] of [['main', manifest.main], ['types', manifest.types]]) {
    const file = cleanTarget(target, label + ' ' + field, false)
    if (!files.has(file)) fail(label + ' ' + field + ' target is missing: ' + file)
  }
  if (JSON.stringify(manifest.exports) !== JSON.stringify(EXPECTED_EXPORTS)) fail(label + ' exports changed')
  for (const { label: exportLabel, target } of collectExportTargets(manifest.exports)) {
    const file = cleanTarget(target, label + ' ' + exportLabel)
    if (!files.has(file)) fail(label + ' export target is missing: ' + file)
  }
  for (const section of DEPENDENCY_SECTIONS) {
    if (manifest[section]?.[PACKAGE_NAME] !== undefined) fail(label + ' must not depend on itself')
  }
}

function packageKey(name, version) {
  return name + '@' + version
}

function pathWithin(root, target) {
  const child = relative(root, target)
  return child === '' || (child !== '..' && !child.startsWith('..' + sep) && !child.startsWith('/'))
}

function assertFixtureProvenance(entry) {
  const provenance = entry.provenance
  if (provenance === null || typeof provenance !== 'object' || Array.isArray(provenance)) fail('fixture provenance is missing: ' + entry.key)
  const officialSource = entry.name.startsWith('@deepseek-ai/dsh-') ? 'packages/' : OFFICIAL_VENDOR_PACKAGES.get(entry.name)
  if (officialSource !== undefined) {
    if (provenance.kind !== 'clean-alpha4'
      || provenance.repository !== OFFICIAL_REPOSITORY
      || provenance.tag !== OFFICIAL_TAG
      || provenance.revision !== OFFICIAL_COMMIT
      || provenance.integrity !== 'git:' + OFFICIAL_COMMIT
      || typeof provenance.source !== 'string'
      || !provenance.source.startsWith(officialSource)
      || provenance.source.includes('node_modules')
      || provenance.source.startsWith('/')) {
      fail('fixture is not sourced from the clean alpha4 checkout: ' + entry.key)
    }
    return
  }
  if (provenance.kind !== 'registry' || provenance.registry !== 'https://registry.npmjs.org'
    || typeof provenance.integrity !== 'string' || !/^sha256-[0-9a-f]{64}$/u.test(provenance.integrity)
    || provenance.integrity !== 'sha256-' + entry.sha256) {
    fail('registry fixture provenance is invalid: ' + entry.key)
  }
}

function fixtureArchives() {
  const payload = readJson(join(FIXTURE_ROOT, 'PROVENANCE.json'), 'fixture provenance')
  if (payload?.schema !== 1
    || payload.alpha4?.repository !== OFFICIAL_REPOSITORY
    || payload.alpha4?.tag !== OFFICIAL_TAG
    || payload.alpha4?.revision !== OFFICIAL_COMMIT) {
    fail('fixture provenance does not identify the official alpha.4 checkout')
  }
  if (!Array.isArray(payload.fixtures) || !Array.isArray(payload.edges)) fail('fixture provenance has no graph arrays')
  const fixtureText = JSON.stringify(payload).replaceAll('0.1.2-rc.1', '')
  if (/(?:0\.1\.2-alpha\.2|\brc(?:\.|-|\d))/iu.test(fixtureText)) fail('fixture provenance contains alpha.2 or unapproved RC data')
  const entries = readdirSync(FIXTURE_TARBALL_ROOT, { withFileTypes: true })
  if (entries.some(entry => !entry.isFile() || !entry.name.endsWith('.tgz'))) fail('fixture tarball directory contains an ignored non-archive entry')
  const files = entries.map(entry => entry.name).sort()
  if (files.length !== payload.fixtures.length) fail('fixture archives and provenance nodes differ in count')
  const records = new Map()
  const byPackage = new Map()
  const archivePaths = new Map()
  const seenArchives = new Set()
  for (const entry of payload.fixtures) {
    if (entry === null || typeof entry !== 'object' || Array.isArray(entry)
      || typeof entry.key !== 'string' || typeof entry.name !== 'string' || typeof entry.version !== 'string'
      || entry.key !== packageKey(entry.name, entry.version)) fail('fixture node does not contain an exact package@version key')
    if (records.has(entry.key)) fail('fixture package@version is duplicated: ' + entry.key)
    if (typeof entry.archive !== 'string' || !entry.archive.startsWith('tarballs/') || entry.archive.includes('..') || entry.archive.includes('\\') || entry.archive.startsWith('/')) fail('fixture archive path is unsafe: ' + entry.key)
    const archiveName = entry.archive.slice('tarballs/'.length)
    if (!files.includes(archiveName) || entry.archive !== 'tarballs/' + archiveName || seenArchives.has(archiveName)) fail('fixture archive and provenance node do not match: ' + entry.key)
    seenArchives.add(archiveName)
    const archive = join(FIXTURE_ROOT, entry.archive)
    const stat = assertRegularFile(archive, 'fixture archive')
    if (!Number.isSafeInteger(entry.bytes) || entry.bytes !== stat.size) fail('fixture byte size mismatch for ' + entry.key)
    if (typeof entry.sha256 !== 'string' || !/^[0-9a-f]{64}$/u.test(entry.sha256) || entry.sha256 !== sha256(archive)) fail('fixture SHA-256 mismatch for ' + entry.key)
    if (typeof entry.integrity !== 'string' || entry.integrity !== sha512Integrity(archive)) fail('fixture integrity mismatch for ' + entry.key)
    assertFixtureProvenance(entry)
    const manifest = archiveJson(archive)
    if (manifest.name !== entry.name || manifest.version !== entry.version) fail('fixture archive manifest mismatch: ' + entry.key)
    if (manifest.name.startsWith('@deepseek-ai/dsh-') && manifest.version !== OFFICIAL_ALPHA4) fail('fixture DSH package is not official alpha.4: ' + entry.key)
    const record = { key: entry.key, name: entry.name, version: entry.version, archive, manifest, provenance: entry.provenance }
    records.set(entry.key, record)
    archivePaths.set(entry.key, archive)
    const candidates = byPackage.get(entry.name) ?? []
    candidates.push(record)
    byPackage.set(entry.name, candidates)
  }
  if (seenArchives.size !== files.length || files.some(file => !seenArchives.has(file))) fail('fixture archive directory contains an unrecorded archive')
  for (const candidates of byPackage.values()) candidates.sort((left, right) => compareVersions(parseVersion(right.version), parseVersion(left.version)))
  return { payload, records, byPackage, archivePaths, archives: files.map(file => join(FIXTURE_TARBALL_ROOT, file)) }
}

function edgeSort(left, right) {
  const a = left.parentKey + '>' + left.name + ':' + left.field + '>' + left.childKey
  const b = right.parentKey + '>' + right.name + ':' + right.field + '>' + right.childKey
  return a.localeCompare(b)
}

function validateFixtureGraph(rootManifest, fixture) {
  const rootKey = packageKey(rootManifest.name, rootManifest.version)
  if (fixture.payload.root?.key !== rootKey || fixture.payload.root?.name !== rootManifest.name || fixture.payload.root?.version !== rootManifest.version) fail('fixture graph root does not match packed package')
  const root = { key: rootKey, name: rootManifest.name, version: rootManifest.version, manifest: rootManifest }
  const edges = []
  const edgeByDeclaration = new Map()
  for (const edge of fixture.payload.edges) {
    if (edge === null || typeof edge !== 'object' || Array.isArray(edge)
      || typeof edge.parentKey !== 'string' || typeof edge.parentName !== 'string' || typeof edge.parentVersion !== 'string'
      || typeof edge.childKey !== 'string' || typeof edge.childName !== 'string' || typeof edge.childVersion !== 'string'
      || typeof edge.name !== 'string' || typeof edge.range !== 'string'
      || !DEPENDENCY_SECTIONS.includes(edge.field) || typeof edge.optional !== 'boolean') fail('fixture graph edge is malformed')
    const parent = edge.parentKey === rootKey ? root : fixture.records.get(edge.parentKey)
    const child = fixture.records.get(edge.childKey)
    if (parent === undefined || child === undefined
      || edge.parentName !== parent.name || edge.parentVersion !== parent.version
      || edge.childName !== child.name || edge.childVersion !== child.version) fail('fixture graph edge points to an unknown exact node: ' + edge.parentKey + ' -> ' + edge.childKey)
    const declarations = parent.manifest[edge.field]
    if (declarations === undefined || typeof declarations[edge.name] !== 'string' || declarations[edge.name] !== edge.range) fail('fixture graph edge differs from its parent declaration: ' + edge.parentKey + ' -> ' + edge.name)
    const declarationKey = edge.parentKey + '\0' + edge.field + '\0' + edge.name
    if (edgeByDeclaration.has(declarationKey)) fail('fixture graph has duplicate parent declaration: ' + edge.parentKey + ' -> ' + edge.name)
    edgeByDeclaration.set(declarationKey, edge)
    if (!satisfiesRange(child.version, edge.range)) fail('fixture graph range is unsatisfied: ' + edge.parentKey + ' -> ' + edge.childKey + ' (' + edge.range + ')')
    edges.push(edge)
  }
  const parentRecords = [root, ...fixture.records.values()]
  const expectedDeclarations = new Set()
  for (const parent of parentRecords) {
    for (const declaration of dependencyEntries(parent.manifest)) {
      const declarationKey = parent.key + '\0' + declaration.field + '\0' + declaration.name
      const candidates = (fixture.byPackage.get(declaration.name) ?? []).filter(candidate => satisfiesRange(candidate.version, declaration.range))
      if (candidates.length === 0) {
        if (declaration.optional) continue
        fail('missing fixture for required edge ' + parent.key + ' -> ' + declaration.name + ' (' + declaration.range + ')')
      }
      const edge = edgeByDeclaration.get(declarationKey)
      if (edge === undefined) fail('fixture graph is missing declared edge: ' + parent.key + ' -> ' + declaration.name)
      if (edge.optional !== declaration.optional) fail('fixture graph optional marker differs from manifest: ' + parent.key + ' -> ' + declaration.name)
      if (edge.childKey !== candidates[0].key) fail('fixture graph child is not the deterministic highest matching version: ' + parent.key + ' -> ' + edge.childKey)
      expectedDeclarations.add(declarationKey)
    }
  }
  for (const edge of edges) {
    const declarationKey = edge.parentKey + '\0' + edge.field + '\0' + edge.name
    if (!expectedDeclarations.has(declarationKey)) fail('fixture graph contains an extra edge: ' + edge.parentKey + ' -> ' + edge.name)
  }
  if (edges.length !== expectedDeclarations.size) fail('fixture graph edge count differs from declarations')
  if (JSON.stringify(edges) !== JSON.stringify([...edges].sort(edgeSort))) fail('fixture graph edges are not deterministically sorted')
  const reachable = new Set()
  const queue = edges.filter(edge => edge.parentKey === rootKey).map(edge => edge.childKey)
  while (queue.length > 0) {
    const key = queue.shift()
    if (key === undefined || reachable.has(key)) continue
    reachable.add(key)
    for (const edge of edges) if (edge.parentKey === key) queue.push(edge.childKey)
  }
  for (const key of fixture.records.keys()) if (!reachable.has(key)) fail('fixture graph node is unreachable from the packed root: ' + key)
  if (!edges.some(edge => edge.field === 'peerDependencies') || !edges.some(edge => edge.optional)) fail('fixture graph omitted peer or applicable optional edges')
  return { ...fixture, root, edges, edgeByDeclaration }
}

function packedRoot(packDirectory, report, extractDirectory) {
  if (report.filename !== PACKAGE_NAME + '-' + PACKAGE_VERSION + '.tgz') fail('npm pack returned an unexpected filename')
  const archive = join(packDirectory, report.filename)
  const archiveStat = assertRegularFile(archive, 'plugin tarball')
  if (report.size !== archiveStat.size) fail('npm pack report size differs from tarball')
  if (report.shasum !== sha1(archive)) fail('npm pack report shasum differs from tarball')
  if (report.integrity !== sha512Integrity(archive)) fail('npm pack report integrity differs from tarball')
  if (report.files.length !== report.entryCount) fail('npm pack report entryCount differs from file list')
  const rootStat = assertRegularFile(ROOT_ARCHIVE, 'checked-in root tarball')
  const rootBytes = readFileSync(ROOT_ARCHIVE)
  const archiveBytes = readFileSync(archive)
  if (rootStat.size !== archiveStat.size || sha256(ROOT_ARCHIVE) !== sha256(archive) || !rootBytes.equals(archiveBytes)) {
    fail('checked-in root tarball differs from packed tarball')
  }
  if (report.files.some(file => file === null || typeof file !== 'object' || Array.isArray(file) || typeof file.path !== 'string')) {
    fail('npm pack report contains an invalid file entry')
  }
  const reportPaths = report.files.map(file => file.path)
  if (new Set(reportPaths).size !== reportPaths.length) fail('npm pack report contains duplicate paths')
  const files = new Set(reportPaths)
  const archivePaths = archiveFiles(archive)
  if (report.entryCount !== archivePaths.size || files.size !== archivePaths.size || [...files].some(file => !archivePaths.has(file))) {
    fail('npm pack report does not match tar contents')
  }
  for (const file of files) {
    if (!file || file.startsWith('/') || file.startsWith('../') || file.includes('/../') || file.includes('\\') || /^[A-Za-z]:[\\/]/u.test(file)) fail('pack report contains unsafe path ' + file)
    if (/^(?:src|tests|scripts|node_modules)\//u.test(file)
      || /(?:^|\/)\.env(?:\.|$)/u.test(file)
      || /(?:^|\/)\.(?:git|npmrc)(?:$|\.)/u.test(file)
      || (/\.(?:ts|tsx|map)$/u.test(file) && !file.endsWith('.d.ts'))) fail('packed plugin contains source or private path ' + file)
  }
  for (const required of REQUIRED_FILES) if (!files.has(required)) fail('packed plugin is missing ' + required)
  mkdirSync(extractDirectory, { recursive: true })
  run('tar', ['-xzf', archive, '-C', extractDirectory])
  const packageRoot = join(extractDirectory, 'package')
  if (!existsSync(packageRoot)) fail('tarball extraction has no package directory')
  const manifest = readJson(join(packageRoot, 'package.json'), 'packed package manifest')
  checkManifest(manifest, files)
  return { archive, files, packageRoot, manifest }
}

function existsSync(path) {
  return lstatIfPresent(path) !== undefined
}

function staticSpecifiers(source) {
  const result = new Set()
  const patterns = [
    /\b(?:import|export)\s+(?:(?:[^;\n]*?)\s+from\s+)?['"]([^'"]+)['"]/gu,
    /\bimport\s*\(\s*['"]([^'"]+)['"]\s*\)/gu,
    /\brequire\s*\(\s*['"]([^'"]+)['"]\s*\)/gu,
  ]
  for (const pattern of patterns) {
    for (const match of source.matchAll(pattern)) {
      const specifier = match[1]
      if (specifier !== undefined && /^[A-Za-z0-9@._+:#~/-]+$/u.test(specifier)) result.add(specifier)
    }
  }
  return result
}

function packageName(specifier) {
  return specifier.startsWith('@') ? specifier.split('/').slice(0, 2).join('/') : specifier.split('/')[0]
}

function walkFiles(root) {
  const output = []
  const visit = (directory, prefix = '') => {
    for (const entry of readdirSync(directory, { withFileTypes: true })) {
      if (entry.name === 'node_modules') continue
      const path = join(directory, entry.name)
      const name = prefix.length === 0 ? entry.name : prefix + '/' + entry.name
      if (entry.isDirectory()) visit(path, name)
      else if (entry.isFile()) output.push(name.replaceAll(sep, '/'))
    }
  }
  visit(root)
  return output
}

function installedPackageIndex(consumer) {
  const index = new Map()
  const visitedPackages = new Set()
  const visitedNodeModules = new Set()
  const addPackage = directory => {
    const actual = realpathIfPresent(directory)
    if (actual === undefined || visitedPackages.has(actual)) return
    visitedPackages.add(actual)
    const manifestPath = join(actual, 'package.json')
    if (!existsSync(manifestPath)) return
    const manifest = readJson(manifestPath, 'installed package manifest')
    if (typeof manifest.name !== 'string' || typeof manifest.version !== 'string') fail('installed package has no exact name/version: ' + actual)
    const key = packageKey(manifest.name, manifest.version)
    if (!index.has(key)) index.set(key, { key, name: manifest.name, version: manifest.version, root: actual, manifest })
    const nested = join(actual, 'node_modules')
    if (existsSync(nested)) visitNodeModules(nested)
  }
  const visitNodeModules = directory => {
    const actual = realpathIfPresent(directory)
    if (actual === undefined || visitedNodeModules.has(actual)) return
    visitedNodeModules.add(actual)
    for (const entry of readdirSync(actual, { withFileTypes: true })) {
      if (entry.name === '.bin') continue
      const path = join(actual, entry.name)
      if (entry.name === '.pnpm' && entry.isDirectory()) {
        for (const storeEntry of readdirSync(path, { withFileTypes: true })) {
          if (!storeEntry.isDirectory()) continue
          const nested = join(path, storeEntry.name, 'node_modules')
          if (existsSync(nested)) visitNodeModules(nested)
        }
      } else if (entry.name.startsWith('@') && entry.isDirectory()) {
        for (const packageEntry of readdirSync(path, { withFileTypes: true })) {
          if (packageEntry.isDirectory() || packageEntry.isSymbolicLink()) addPackage(join(path, packageEntry.name))
        }
      } else if (entry.isDirectory() || entry.isSymbolicLink()) {
        addPackage(path)
      }
    }
  }
  visitNodeModules(join(consumer, 'node_modules'))
  return index
}

function packageTargetTargets(manifest) {
  const targets = []
  for (const { label, target } of collectExportTargets(manifest.exports)) {
    if (target.includes('*')) continue
    const path = cleanTarget(target, label)
    if (path.split('/').some(part => SOURCE_SEGMENTS.has(part))) continue
    targets.push({ label, path })
  }
  if (typeof manifest.main === 'string') targets.push({ label: 'main', path: cleanTarget(manifest.main, 'main', false) })
  if (typeof manifest.types === 'string') targets.push({ label: 'types', path: cleanTarget(manifest.types, 'types', false) })
  if (typeof manifest.typings === 'string') targets.push({ label: 'typings', path: cleanTarget(manifest.typings, 'typings', false) })
  if (typeof manifest.bin === 'string') targets.push({ label: 'bin', path: cleanTarget(manifest.bin, 'bin', false) })
  if (manifest.bin !== null && typeof manifest.bin === 'object') {
    for (const [name, target] of Object.entries(manifest.bin)) if (typeof target === 'string') targets.push({ label: 'bin.' + name, path: cleanTarget(target, 'bin.' + name, false) })
  }
  return targets
}

function packageTargetFile(root, target) {
  const base = join(root, ...target.split('/'))
  const candidates = [base]
  if (posix.extname(base) === '') candidates.push(base + '.js', base + '.mjs', base + '.cjs', base + '.json', join(base, 'index.js'))
  return candidates.find(candidate => isRegularFile(candidate))
}

function assertInstalledPackageTargets(installed) {
  for (const record of installed.values()) {
    for (const target of packageTargetTargets(record.manifest)) {
      if (packageTargetFile(record.root, target.path) === undefined) fail(target.label + ' target is missing from installed package ' + record.key + ': ' + target.path)
    }
  }
}
function resolveRelativePackageImport(packageRoot, importer, specifier) {
  const base = resolve(dirname(importer), specifier)
  if (!pathWithin(packageRoot, base)) fail('packed JS relative import escapes package: ' + importer + ' -> ' + specifier)
  const candidates = [base]
  if (posix.extname(base) === '') candidates.push(base + '.js', base + '.mjs', base + '.cjs', base + '.json', join(base, 'index.js'))
  for (const candidate of candidates) if (isRegularFile(candidate)) return candidate
  fail('packed JS relative import is missing: ' + importer + ' -> ' + specifier)
}

function declaredDependency(manifest, name) {
  return DEPENDENCY_SECTIONS.some(section => Object.prototype.hasOwnProperty.call(manifest[section] ?? {}, name))
    || (manifest.bundleDependencies ?? manifest.bundledDependencies ?? []).includes(name)
}

function optionalDependency(manifest, name) {
  return Object.prototype.hasOwnProperty.call(manifest.optionalDependencies ?? {}, name)
    || manifest.peerDependenciesMeta?.[name]?.optional === true
}

function checkStaticClosure(consumer, installed) {
  const consumerModulesRoot = realpathIfPresent(join(consumer, 'node_modules'))
  if (consumerModulesRoot === undefined) fail('consumer node_modules directory is missing')
  const consumerModules = consumerModulesRoot + sep
  const owner = installed.get(packageKey(PACKAGE_NAME, PACKAGE_VERSION))
  if (owner === undefined) fail('installed Host package is not indexed')
  const packageByRoot = new Map([...installed.values()].map(record => [record.root, record]))
  const queue = walkFiles(owner.root)
    .filter(path => /\.(?:c|m)?js$/iu.test(path))
    .map(path => join(owner.root, ...path.split('/')))
  const seen = new Set()
  while (queue.length > 0) {
    const importer = queue.shift()
    if (importer === undefined || seen.has(importer)) continue
    seen.add(importer)
    const record = [...packageByRoot.values()].find(candidate => pathWithin(candidate.root, importer))
    if (record === undefined) fail('packed JS importer is outside its installed package: ' + importer)
    for (const specifier of staticSpecifiers(readFileSync(importer, 'utf8'))) {
      if (BUILTIN_MODULES.has(specifier)) continue
      if (specifier.startsWith('.') || specifier.startsWith('/')) {
        if (specifier.startsWith('/')) fail('packed JS has an absolute import ' + specifier)
        const resolved = resolveRelativePackageImport(record.root, importer, specifier)
        if (/\.(?:c|m)?js$/iu.test(resolved)) queue.push(resolved)
        continue
      }
      const dependency = packageName(specifier)
      if (dependency === record.name) continue
      if (!declaredDependency(record.manifest, dependency)) fail('packed JS imports undeclared package ' + specifier + ' from ' + record.key)
      let resolved
      try {
        resolved = createRequire(importer).resolve(specifier)
      } catch (error) {
        if (optionalDependency(record.manifest, dependency)) continue
        fail('packed JS import is not installed: ' + specifier + ' from ' + record.key + ': ' + (error instanceof Error ? error.message : String(error)))
      }
      const real = realpathIfPresent(resolved)
      if (real === undefined) fail('packed JS import disappeared: ' + specifier)
      if (!real.startsWith(consumerModules)) fail('packed JS import resolves outside consumer: ' + specifier)
      if (/\.(?:c|m)?js$/iu.test(real)) queue.push(real)
    }
  }
}
/** Ensure the consumer install uses pnpm offline with strict peers and disabled network metadata.
 * @param args - pnpm install arguments to validate.
 * @returns The unchanged validated argument list.
 */
export function assertOfflineInstallArgs(args) {
  const required = ['install', '--offline', '--ignore-scripts', '--strict-peer-dependencies', '--lockfile=false', '--config.audit=false', '--config.fund=false', '--registry=' + INVALID_REGISTRY]
  for (const flag of required) if (!args.includes(flag)) fail('consumer install is missing required flag: ' + flag)
  return args
}

function fixtureOverrides(graph) {
  const overrides = {}
  for (const edge of graph.edges) {
    const child = graph.records.get(edge.childKey)
    if (child === undefined) fail('missing fixture archive for graph edge ' + edge.parentKey + ' -> ' + edge.childKey)
    const selector = edge.parentName + '@' + edge.parentVersion + '>' + edge.name
    const value = pathToFileURL(child.archive).href
    if (overrides[selector] !== undefined && overrides[selector] !== value) fail('scoped override resolves to multiple archives: ' + selector)
    overrides[selector] = value
  }
  return overrides
}

function consumerDependencies(graph, ownerArchive) {
  const dependencies = { [PACKAGE_NAME]: pathToFileURL(ownerArchive).href }
  const add = (name, archive) => {
    const value = pathToFileURL(archive).href
    if (dependencies[name] === undefined) dependencies[name] = value
  }
  for (const edge of graph.edges) {
    if (edge.parentKey === graph.root.key || (edge.field === 'peerDependencies' && !edge.optional)) {
      const child = graph.records.get(edge.childKey)
      if (child === undefined) fail('missing direct fixture archive for ' + edge.childKey)
      add(edge.childName, child.archive)
    }
  }
  const required = new Set()
  const queue = graph.edges.filter(edge => edge.parentKey === graph.root.key && !edge.optional).map(edge => edge.childKey)
  while (queue.length > 0) {
    const key = queue.shift()
    if (key === undefined || required.has(key)) continue
    required.add(key)
    for (const edge of graph.edges) if (edge.parentKey === key && !edge.optional) queue.push(edge.childKey)
  }
  for (const record of graph.records.values()) if (!required.has(record.key)) add(record.name, record.archive)
  return dependencies
}

const CONSUMER_SMOKE = [
  "import { createRequire } from 'node:module'",
  "import { lstatSync, readFileSync } from 'node:fs'",
  "import { dirname, isAbsolute, relative, resolve, sep } from 'node:path'",
  "import { Script, createContext } from 'node:vm'",
  "if (process.env.NODE_PATH !== '') throw new Error('NODE_PATH was not empty')",
  "for (const key of ['NODE_OPTIONS', 'npm_config_node_path', 'NPM_CONFIG_NODE_PATH', 'pnpm_config_node_path', 'PNPM_CONFIG_NODE_PATH', 'npm_config_prefix', 'NPM_CONFIG_PREFIX', 'pnpm_config_prefix', 'PNPM_CONFIG_PREFIX', 'npm_config_global', 'NPM_CONFIG_GLOBAL', 'pnpm_config_global', 'PNPM_CONFIG_GLOBAL', 'DSH_PACK_GATE_SENTINEL']) if (process.env[key] !== undefined) throw new Error('pack-gate child environment leaked ' + key)",
  "const requireFromConsumer = createRequire(new URL('./smoke.mjs', import.meta.url))",
  "const hostEntry = requireFromConsumer.resolve('dsh-llm-providers-ui')",
  "const hostRoot = resolve(dirname(hostEntry), '..')",
  "const hostRelative = relative(process.cwd(), hostRoot)",
  "if (isAbsolute(hostRelative) || hostRelative === '..' || hostRelative.startsWith('..' + sep)) throw new Error('Host resolved outside isolated consumer')",
  "if (lstatSync(hostRoot).isSymbolicLink()) throw new Error('Host package is a symlink')",
  "const host = await import('dsh-llm-providers-ui')",
  "const registrations = []",
  "const settings = { installSection(...args) { registrations.push(args); return () => {} } }",
  "host.apply({ get(name) { return name === 'settings' ? settings : undefined }, inject() {} })",
  "const registration = registrations[0]",
  "if (registrations.length !== 1 || registration?.[1] !== 'llm-providers' || typeof registration?.[2] !== 'function' || !Array.isArray(registration?.[3]?.order)) throw new Error('installed Host apply invariants failed')",
  "const clientEntry = requireFromConsumer.resolve('dsh-llm-providers-ui/client')",
  "const clientRoot = resolve(dirname(clientEntry), '..', '..')",
  "const clientRelative = relative(hostRoot, clientEntry)",
  "if (isAbsolute(clientRelative) || clientRelative === '..' || clientRelative.startsWith('..' + sep)) throw new Error('Web client resolved outside installed Host package')",
  "const clientManifest = JSON.parse(readFileSync(resolve(hostRoot, 'package.json'), 'utf8'))",
  "const platformModules = new Set(['react', 'react/jsx-runtime', 'react-dom', 'react-dom/client', '@deepseek-ai/cordis', '@deepseek-ai/dsh-client-store', '@deepseek-ai/dsh-client-ui-slots', '@deepseek-ai/dsh-client-ui-primitives', ...(clientManifest.dsh?.client?.external ?? [])])",
  "const rows = []",
  "const window = { __ModuleLoader__: { load(row) { rows.push(row) } } }",
  "const context = createContext({ window, self: window, console, setTimeout, clearTimeout, requestAnimationFrame: () => 0, cancelAnimationFrame: () => {} })",
  "new Script(readFileSync(clientEntry, 'utf8'), { filename: clientEntry }).runInContext(context)",
  "if (rows.length !== 1 || rows[0]?.id !== 'dsh-llm-providers-ui' || typeof rows[0]?.factory !== 'function') throw new Error('Web ModuleLoader factory registration failed')",
  "const nodeRequire = createRequire(clientEntry)",
  "const client = rows[0].factory(specifier => { if (!platformModules.has(specifier)) throw new Error('Web ModuleLoader factory requested undeclared module-table word ' + specifier); return nodeRequire(specifier) })",
  "if (typeof client.apply !== 'function' || client.name !== 'dsh-llm-providers-ui-client' || !Array.isArray(client.inject) || typeof client.Config !== 'function') throw new Error('Web ModuleLoader factory execution failed')",
  "const clientExports = Object.keys(client).sort()",
  "if (JSON.stringify(clientExports) !== JSON.stringify(['Config', 'apply', 'inject', 'name'])) throw new Error('Web client exports include non-loader API')",
  "console.log('isolated Host apply invariants and Web ModuleLoader factory smoke passed')",
].join(String.fromCharCode(10))

function installConsumer(ownerArchive, graph, work) {
  const consumer = join(work, 'consumer')
  const store = join(work, 'fresh-pnpm-store')
  const userconfig = join(work, 'empty-npmrc')
  mkdirSync(consumer, { recursive: true })
  mkdirSync(store, { recursive: true })
  if (readdirSync(store).length !== 0) fail('consumer pnpm store was not fresh')
  writeFileSync(userconfig, '')
  writeFileSync(join(consumer, 'package.json'), JSON.stringify({
    name: 'dsh-llm-providers-ui-pack-consumer',
    version: '1.0.0',
    private: true,
    type: 'module',
    dependencies: consumerDependencies(graph, ownerArchive),
    pnpm: { overrides: fixtureOverrides(graph) },
  }, null, 2) + '\n')
  writeFileSync(join(consumer, 'smoke.mjs'), CONSUMER_SMOKE + '\n')
  const env = {
    npm_config_userconfig: userconfig,
    pnpm_config_userconfig: userconfig,
    npm_config_registry: INVALID_REGISTRY,
    pnpm_config_registry: INVALID_REGISTRY,
    npm_config_offline: 'true',
    pnpm_config_offline: 'true',
    npm_config_ignore_scripts: 'true',
    pnpm_config_ignore_scripts: 'true',
    npm_config_strict_peer_dependencies: 'true',
    pnpm_config_strict_peer_dependencies: 'true',
    npm_config_audit: 'false',
    pnpm_config_audit: 'false',
    npm_config_fund: 'false',
    pnpm_config_fund: 'false',
  }
  const installArgs = assertOfflineInstallArgs(['install', '--offline', '--ignore-scripts', '--strict-peer-dependencies', '--lockfile=false', '--config.audit=false', '--config.fund=false', '--registry=' + INVALID_REGISTRY, '--store-dir', store])
  run('pnpm', installArgs, { cwd: consumer, env })
  const installed = installedPackageIndex(consumer)
  const owner = installed.get(packageKey(PACKAGE_NAME, PACKAGE_VERSION))
  if (owner === undefined) fail('consumer did not install the exact package')
  if (!pathWithin(consumer, owner.root)) fail('consumer package resolved outside isolated consumer: ' + owner.root)
  for (const key of graph.records.keys()) if (!installed.has(key)) fail('consumer did not install exact fixture ' + key)
  assertInstalledPackageTargets(installed)
  checkStaticClosure(consumer, installed)
  run(process.execPath, ['smoke.mjs'], { cwd: consumer, env })
  return { consumer, installed }
}

function cleanRealDirectory(directory, root, expectedParent) {
  const stat = lstatIfPresent(directory)
  if (stat === undefined) return
  if (!stat.isDirectory() || stat.isSymbolicLink()) fail('refusing to clean an unsafe directory: ' + directory)
  const actual = realpathIfPresent(directory)
  if (actual === undefined) return
  if (!pathWithin(root, actual) || dirname(actual) !== expectedParent) fail('refusing to clean outside the temporary root: ' + directory)
  for (const entry of readdirSync(directory, { withFileTypes: true })) {
    const child = join(directory, entry.name)
    const childStat = lstatIfPresent(child)
    if (childStat === undefined) continue
    if (childStat.isDirectory() && !childStat.isSymbolicLink()) {
      cleanRealDirectory(child, root, actual)
    } else {
      unlinkSync(child)
    }
  }
  rmdirSync(directory)
}

function cleanWorkDirectory(directory) {
  const stat = lstatIfPresent(directory)
  if (stat === undefined) return
  if (!stat.isDirectory() || stat.isSymbolicLink()) fail('refusing to clean an unsafe work path: ' + directory)
  const actual = realpathIfPresent(directory)
  if (actual === undefined) return
  const parent = realpathIfPresent(dirname(directory))
  if (parent === undefined) return
  if (!pathWithin(parent, actual) || dirname(actual) !== parent) fail('refusing to clean a work path outside its parent: ' + directory)
  cleanRealDirectory(directory, actual, parent)
}

let work
let failed = false
let primaryError
try {
  const sourceManifest = readJson(join(ROOT, 'package.json'), 'source package manifest')
  work = mkdtempSync(join(tmpdir(), 'dsh-llm-providers-ui-pack-'))
  const packDirectory = join(work, 'pack')
  const extractDirectory = join(work, 'extract')
  mkdirSync(packDirectory, { recursive: true })
  const report = parsePackReport(run('npm', ['pack', '--json', '--ignore-scripts', '--pack-destination', packDirectory]))
  const packed = packedRoot(packDirectory, report, extractDirectory)
  if (packed.manifest.name !== sourceManifest.name || packed.manifest.version !== sourceManifest.version) fail('packed manifest differs from source manifest')
  const fixture = fixtureArchives()
  const graph = validateFixtureGraph(packed.manifest, fixture)
  installConsumer(packed.archive, graph, work)
  console.log('pack check passed: package@version, fixture graph, alpha.4 provenance, strict offline pnpm consumer, recursive targets/static closure, Host apply, and Web ModuleLoader factory verified')
} catch (error) {
  failed = true
  primaryError = error
} finally {
  if (work !== undefined) {
    try {
      cleanWorkDirectory(work)
    } catch (cleanupError) {
      if (failed) throw new AggregateError([primaryError, cleanupError], 'pack gate failed and cleanup failed')
      throw cleanupError
    }
  }
}
if (failed) throw primaryError
