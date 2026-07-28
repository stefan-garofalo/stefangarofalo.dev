#!/usr/bin/env node

import { execFile, spawn } from 'node:child_process'
import { createHash } from 'node:crypto'
import { mkdir, readFile, rename, stat, unlink, writeFile } from 'node:fs/promises'
import http from 'node:http'
import https from 'node:https'
import { basename, dirname, join, relative, resolve } from 'node:path'
import process from 'node:process'
import { promisify } from 'node:util'
import { fileURLToPath } from 'node:url'

const exec = promisify(execFile)
const root = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const initScript = join(root, 'scripts/benchmark-ascii-canvas-init.js')
const baselinePath = join(root, 'benchmarks/ascii-canvas.baseline.json')
const artifactRoot = join(root, '.artifacts/performance/ascii-canvas')
const schemaVersion = 4
const runtimeVersion = 4
const frameClockContract = Object.freeze({
  driver: 'setTimeout',
  installed: true,
  intervalMs: 0,
  strategy: 'next-task',
})
const sourceFiles = [
  'app/components/ascii-ripple-field.tsx',
  'app/components/ascii-forest-data.ts',
  'app/components/article-route-hero.tsx',
  'app/components/nav.tsx',
  'app/blog/[slug]/page.tsx',
  'app/blog/utils.ts',
  'app/global.css',
  'app/layout.tsx',
  'app/page.tsx',
  'articles/Reliable Agent Workflows Need State Machines/article-v2.md',
  'package.json',
  'pnpm-lock.yaml',
]
const harnessFiles = [
  'scripts/benchmark-ascii-canvas.mjs',
  'scripts/benchmark-ascii-canvas-init.js',
]
const profiles = ['Galaxy S25', 'iPhone 16 Pro']
const routes = [
  { path: '/', variant: 'forest' },
  {
    path: '/blog/reliable-agent-workflows-need-state-machines',
    variant: 'topography',
  },
]
const count = 5
const warmupMs = 3_000
const windowMs = 2_000
const toolContract = {
  agentBrowser: {
    command: 'agent-browser',
    expected: 'agent-browser 0.33.1',
    package: 'agent-browser@0.33.1',
  },
  portless: {
    command: 'portless',
    expected: '0.15.4',
    package: 'portless@0.15.4',
  },
}
const limits = {
  cls: 0.1,
  idleCpu: 15,
  idleRateMinimum: { forest: 8 },
  idleRate: { forest: 15, topography: 12 },
  max: 50,
  p95: 16,
  reducedDraws: 1,
  touchCpu: 25,
  touchRateMinimum: 16,
  touchRate: 32,
}
const aggregateMetrics = [
  'canvasCpuPercent',
  'drawMaxMs',
  'drawP95Ms',
  'draws',
  'drawsPerSecond',
  'longTasks',
  'pageLongTasks',
  'pageTbtMs',
  'tbtMs',
]
const sampleModes = Object.freeze({
  idle: { gesture: 'none', source: 'idle', touch: false },
  touch: { gesture: 'horizontal', source: 'synthetic-touch', touch: true },
  'vertical-pan': {
    gesture: 'vertical',
    source: 'synthetic-touch',
    touch: true,
  },
})
const expectedScenarios = profiles.flatMap((profile) =>
  routes.map((route) => ({
    id: `${profile}|${route.path}`,
    profile,
    route: route.path,
    variant: route.variant,
  }))
)
const agentBrowserBaseNamespace = `ab${process.pid}`
const agentBrowserIdleTimeoutMs = 30_000
const agentBrowserChromiumArgs = [
  '--disable-background-timer-throttling',
  '--disable-renderer-backgrounding',
  '--disable-backgrounding-occluded-windows',
]
const agentBrowserArgs = (namespace) => [
  '--namespace',
  namespace,
  '--idle-timeout',
  String(agentBrowserIdleTimeoutMs),
  '--init-script',
  initScript,
  '--args',
  agentBrowserChromiumArgs.join(','),
]
const agentBrowserNamespaceFor = (session) =>
  `${agentBrowserBaseNamespace}${session}`
const sessions = new Set()
let sessionSerial = 0
let server
let cleaning = false

const sleep = (ms) => new Promise((done) => setTimeout(done, ms))
const round = (value) =>
  Number.isFinite(value) ? Number(value.toFixed(3)) : value
const median = (values) => {
  const sorted = [...values].sort((a, b) => a - b)
  return sorted[Math.floor(sorted.length / 2)]
}
const p95 = (values) => {
  if (!values.length) return 0
  const sorted = [...values].sort((a, b) => a - b)
  return sorted[Math.ceil(sorted.length * 0.95) - 1]
}

function help() {
  console.log(`Benchmark the production ASCII canvas on mobile emulation.

Usage: node scripts/benchmark-ascii-canvas.mjs [options]
  --url <url>               Reuse a running server
  --update-baseline         Write benchmarks/ascii-canvas.baseline.json
  --allow-failing-baseline  Allow only known historical ASCII gates:
                            topography idle.rate / vertical draws and forest
                            vertical rate; requires --update-baseline and a
                            complete run
  --allow-dirty-baseline    Allow a managed-server baseline from dirty workload
                            sources; requires --update-baseline and no --url
  --source-revision <ref>   Declare the commit served by --url for a baseline;
                            requires --update-baseline and --url
  --trace                   Save a DevTools trace per scenario
  -h, --help                Show help

Phases: 5 idle, 5 synthetic horizontal-touch, 1 synthetic vertical-pan,
        and 1 reduced-motion horizontal-touch window per scenario.
Relative p95 tolerance: baseline + max(20%, 3ms).
Browser isolation: one namespace per scenario; 30s daemon idle timeout.
Chromium launch args: ${agentBrowserChromiumArgs.join(', ')}.
Init script: scripts/benchmark-ascii-canvas-init.js on every browser command.
Frame clock: benchmark-only next-task setTimeout-backed rAF; app timers own cadence.
Paint vitals: FCP/LCP captured best-effort and non-gating; CLS remains gated.
Required global tools: agent-browser 0.33.1 and Portless 0.15.4
Default server: portless --name stefangarofalo-bench-<pid> pnpm start`)
}

function parseArgs(argv) {
  const options = {
    allowDirtyBaseline: false,
    allowFailingBaseline: false,
    trace: false,
    updateBaseline: false,
  }
  for (let index = 0; index < argv.length; index += 1) {
    const value = argv[index]
    if (value === '-h' || value === '--help') options.help = true
    else if (value === '--trace') options.trace = true
    else if (value === '--update-baseline') options.updateBaseline = true
    else if (value === '--allow-dirty-baseline') {
      options.allowDirtyBaseline = true
    } else if (value === '--allow-failing-baseline') {
      options.allowFailingBaseline = true
    } else if (value === '--source-revision') {
      if (!argv[index + 1] || argv[index + 1].startsWith('--')) {
        throw new Error('--source-revision requires a value')
      }
      options.sourceRevision = argv[++index]
    } else if (value === '--url') {
      if (!argv[index + 1] || argv[index + 1].startsWith('--')) {
        throw new Error('--url requires a value')
      }
      options.url = argv[++index]
    } else throw new Error(`Unknown option: ${value}`)
  }
  if (options.allowFailingBaseline && !options.updateBaseline) {
    throw new Error('--allow-failing-baseline requires --update-baseline')
  }
  if (options.allowDirtyBaseline && !options.updateBaseline) {
    throw new Error('--allow-dirty-baseline requires --update-baseline')
  }
  if (options.sourceRevision && !options.updateBaseline) {
    throw new Error('--source-revision requires --update-baseline')
  }
  if (options.sourceRevision && !options.url) {
    throw new Error('--source-revision requires --url')
  }
  if (options.updateBaseline && options.url && !options.sourceRevision) {
    throw new Error('--update-baseline with --url requires --source-revision')
  }
  if (options.allowDirtyBaseline && options.url) {
    throw new Error('--allow-dirty-baseline only applies without --url')
  }
  if (!options.url) return options
  const url = new URL(options.url)
  if (!['http:', 'https:'].includes(url.protocol)) {
    throw new Error('--url must be an absolute http(s) URL')
  }
  options.url = url.toString().replace(/\/$/, '')
  return options
}

async function command(file, args, timeout = 60_000) {
  try {
    const { stdout } = await exec(file, args, {
      cwd: root,
      encoding: 'utf8',
      maxBuffer: 20 * 1024 * 1024,
      timeout,
    })
    return stdout.trim()
  } catch (error) {
    const detail = [error.stdout, error.stderr].filter(Boolean).join('\n').trim()
    throw new Error(`${file} failed${detail ? `:\n${detail}` : ''}`)
  }
}

async function commandBuffer(file, args, timeout = 60_000) {
  try {
    const { stdout } = await exec(file, args, {
      cwd: root,
      encoding: 'buffer',
      maxBuffer: 20 * 1024 * 1024,
      timeout,
    })
    return stdout
  } catch (error) {
    const detail = [error.stdout, error.stderr]
      .filter(Boolean)
      .map(String)
      .join('\n')
      .trim()
    throw new Error(`${file} failed${detail ? `:\n${detail}` : ''}`)
  }
}

async function resolveRevision(reference) {
  const revision = await command(
    'git',
    ['rev-parse', '--verify', `${reference}^{commit}`],
    10_000
  )
  if (!/^[0-9a-f]{40,64}$/.test(revision)) {
    throw new Error(`git returned an invalid commit for ${reference}`)
  }
  return revision
}

async function fingerprintFiles(files, read) {
  const hash = createHash('sha256')
  for (const path of files) {
    const content = await read(path)
    hash.update(`${path}\0${content.length}\0`)
    hash.update(content)
  }
  return hash.digest('hex')
}

async function collectProvenance(options) {
  const headRevision = await resolveRevision('HEAD')
  const workingFingerprint = await fingerprintFiles(sourceFiles, (path) =>
    readFile(join(root, path))
  )
  const dirtyOutput = await command(
    'git',
    ['status', '--short', '--untracked-files=all', '--', ...sourceFiles],
    10_000
  )
  const dirtyFiles = dirtyOutput ? dirtyOutput.split('\n') : []
  const workingSource = {
    dirtyFiles,
    fingerprint: workingFingerprint,
    revision: headRevision,
    state: dirtyFiles.length ? 'dirty' : 'clean',
  }
  const harness = {
    files: harnessFiles,
    fingerprint: await fingerprintFiles(harnessFiles, (path) =>
      readFile(join(root, path))
    ),
  }
  let benchmarkSource
  if (options.sourceRevision) {
    const revision = await resolveRevision(options.sourceRevision)
    benchmarkSource = {
      dirtyFiles: [],
      fingerprint: await fingerprintFiles(sourceFiles, (path) =>
        commandBuffer('git', ['show', `${revision}:${path}`], 10_000)
      ),
      revision,
      state: 'declared-committed-source',
    }
  } else if (options.url) {
    benchmarkSource = {
      dirtyFiles: [],
      fingerprint: null,
      revision: null,
      state: 'external-source-unverified',
    }
  } else {
    benchmarkSource = workingSource
  }
  return {
    benchmarkSource,
    harness,
    sourceFiles,
    workingSource,
  }
}

async function preflightTools() {
  const versions = {}
  for (const [key, tool] of Object.entries(toolContract)) {
    let actual
    try {
      actual = await command(
        tool.command,
        tool.command === 'agent-browser'
          ? [...agentBrowserArgs(agentBrowserBaseNamespace), '--version']
          : ['--version'],
        10_000
      )
    } catch {
      throw new Error(
        `Required global tool "${tool.command}" is missing or unusable. ` +
          `Install ${tool.package}, ensure it is on PATH, and retry.`
      )
    }
    if (actual !== tool.expected) {
      throw new Error(
        `Required global tool "${tool.command}" must report exactly ` +
          `"${tool.expected}" (received "${actual || '<empty>'}"). ` +
          `Install ${tool.package} and retry.`
      )
    }
    versions[`${key}Version`] = actual
  }
  return versions
}

function parseJson(output) {
  try {
    return JSON.parse(output)
  } catch {
    for (const line of output.split('\n').reverse()) {
      try {
        return JSON.parse(line)
      } catch {}
    }
  }
  throw new Error(`Invalid agent-browser JSON: ${output}`)
}

async function browser(session, args, timeout) {
  const namespace = agentBrowserNamespaceFor(session)
  const value = parseJson(
    await command(
      'agent-browser',
      [...agentBrowserArgs(namespace), '--session', session, '--json', ...args],
      timeout
    )
  )
  if (value?.success === false) throw new Error(value.error ?? value.message)
  return value?.data ?? value
}

async function evaluate(session, source, timeout) {
  let value = await browser(
    session,
    ['eval', '-b', Buffer.from(source).toString('base64')],
    timeout
  )
  if (value?.result !== undefined) value = value.result
  if (value?.value !== undefined) value = value.value
  return value
}

function detectUrl(output, portlessName) {
  const urls =
    output
      .replace(/\u001B\[[0-?]*[ -/]*[@-~]/g, '')
      .match(/https?:\/\/[^\s"'<>]+/g) ?? []
  for (const value of urls) {
    const url = value.replace(/[),.;/]+$/, '')
    try {
      if (new URL(url).hostname === `${portlessName}.localhost`) return url
    } catch {}
  }
}

async function startServer(portlessName) {
  server = spawn(
    'portless',
    ['--name', portlessName, 'pnpm', 'start'],
    {
      cwd: root,
      detached: process.platform !== 'win32',
      env: process.env,
      stdio: ['ignore', 'pipe', 'pipe'],
    }
  )
  let output = ''
  const capture = (chunk) => {
    output = `${output}${chunk}`.slice(-30_000)
  }
  server.stdout.on('data', capture)
  server.stderr.on('data', capture)
  for (let attempt = 0; attempt < 200; attempt += 1) {
    const url = detectUrl(output, portlessName)
    if (url) return url
    if (server.exitCode !== null) throw new Error(`Portless exited:\n${output}`)
    await sleep(100)
  }
  const url = detectUrl(
    await command('portless', ['get', portlessName], 5_000),
    portlessName
  )
  if (!url) {
    throw new Error(
      `Portless did not emit the expected ${portlessName}.localhost route:\n${output}`
    )
  }
  return url
}

function probe(url) {
  return new Promise((done, fail) => {
    const target = new URL(url)
    const local =
      target.hostname === 'localhost' ||
      target.hostname === '127.0.0.1' ||
      target.hostname.endsWith('.localhost')
    const request = (target.protocol === 'https:' ? https : http).request(
      target,
      { rejectUnauthorized: !local },
      (response) => {
        response.resume()
        done(response.statusCode)
      }
    )
    request.setTimeout(3_000, () => request.destroy())
    request.on('error', fail)
    request.end()
  })
}

async function waitUntilReady(url, portlessName) {
  if (
    portlessName &&
    new URL(url).hostname !== `${portlessName}.localhost`
  ) {
    throw new Error(`Refusing to probe a route not owned by ${portlessName}`)
  }
  for (let attempt = 0; attempt < 180; attempt += 1) {
    try {
      const status = await probe(url)
      if (status >= 200 && status < 500) return
    } catch {}
    await sleep(250)
  }
  throw new Error(`Server not ready: ${url}`)
}

async function closeSession(session) {
  const namespace = agentBrowserNamespaceFor(session)
  try {
    await command(
      'agent-browser',
      [...agentBrowserArgs(namespace), '--session', session, '--json', 'close'],
      10_000
    )
  } catch {}
  sessions.delete(session)
}

async function cleanup() {
  if (cleaning) return
  cleaning = true
  await Promise.all([...sessions].map(closeSession))
  if (!server?.pid || server.exitCode !== null) return
  const kill = (signal) => {
    if (process.platform === 'win32') server.kill(signal)
    else process.kill(-server.pid, signal)
  }
  try {
    kill('SIGTERM')
  } catch {
    return
  }
  await Promise.race([
    new Promise((done) => server.once('exit', done)),
    sleep(3_000),
  ])
  if (server.exitCode === null) {
    try {
      kill('SIGKILL')
    } catch {}
  }
}

const requireValue = (condition, message) => {
  if (!condition) throw new Error(`ASCII benchmark contract: ${message}`)
}

function assertFrameClockContract(frameClock) {
  for (const [field, expected] of Object.entries(frameClockContract)) {
    requireValue(
      frameClock?.[field] === expected,
      `frame clock ${field} must equal ${JSON.stringify(expected)}`
    )
  }
}

async function assertRuntimeContract(session) {
  const runtime = await evaluate(
    session,
    `(() => {
      const value = window.__ASCII_BENCHMARK__
      return {
        frameClock: value?.frameClock,
        hookInstalled: value?.hookInstalled,
        version: value?.version,
        windowMs: value?.windowMs
      }
    })()`
  )
  requireValue(
    runtime?.version === runtimeVersion,
    `runtime version must be ${runtimeVersion}`
  )
  requireValue(runtime?.windowMs === windowMs, `runtime window must be ${windowMs}ms`)
  requireValue(runtime?.hookInstalled === true, 'canvas draw hook is not installed')
  assertFrameClockContract(runtime?.frameClock)
}

async function warmAsciiRuntime(session) {
  await browser(session, [
    'wait',
    '--fn',
    "Boolean(document.querySelector('.ascii-field canvas') && window.__ASCII_BENCHMARK__)",
  ])
  await assertRuntimeContract(session)
  await sleep(warmupMs)
}

function assertSnapshotContract(snapshot, mode, requireDraws) {
  const contract = sampleModes[mode]
  requireValue(Boolean(contract), `unknown sample mode: ${mode}`)
  requireValue(snapshot?.hookInstalled === true, 'canvas draw hook is not installed')
  assertFrameClockContract(snapshot?.frameClock)
  requireValue(snapshot?.longTasks?.supported === true, 'Long Tasks observer is unavailable')
  requireValue(
    snapshot?.pageLongTasks?.supported === true,
    'page Long Tasks observer is unavailable'
  )
  requireValue(snapshot?.windowMs === windowMs, 'snapshot window mismatch')
  requireValue(snapshot?.elapsedMs === windowMs, 'snapshot elapsed time mismatch')
  requireValue(Array.isArray(snapshot?.canvas) && snapshot.canvas.length > 0, 'canvas missing')
  requireValue(
    snapshot.canvas.every((canvas) =>
      [
        canvas.backingHeight,
        canvas.backingWidth,
        canvas.cssHeight,
        canvas.cssWidth,
        canvas.effectiveDprX,
        canvas.effectiveDprY,
      ].every(Number.isFinite)
    ),
    'canvas metrics unavailable'
  )
  requireValue(Array.isArray(snapshot?.errors), 'snapshot errors missing')
  requireValue(Array.isArray(snapshot?.pointerTypes), 'pointer types missing')
  requireValue(Array.isArray(snapshot?.draws?.durationsMs), 'draw durations unavailable')
  requireValue(Array.isArray(snapshot?.draws?.intervalsMs), 'draw intervals unavailable')
  requireValue(Number.isFinite(snapshot?.draws?.count), 'draw count unavailable')
  requireValue(Number.isFinite(snapshot?.draws?.cpuPercent), 'draw CPU unavailable')
  requireValue(Number.isFinite(snapshot?.draws?.perSecond), 'draw rate unavailable')
  requireValue(
    snapshot.draws.durationsMs.every(Number.isFinite) &&
      snapshot.draws.intervalsMs.every(Number.isFinite),
    'draw timing contains non-finite values'
  )
  for (const observer of ['longTasks', 'pageLongTasks']) {
    requireValue(
      Number.isFinite(snapshot?.[observer]?.count),
      `${observer} count unavailable`
    )
    requireValue(
      Number.isFinite(snapshot?.[observer]?.tbtMs),
      `${observer} blocking time unavailable`
    )
    requireValue(
      Array.isArray(snapshot?.[observer]?.entries) &&
        snapshot[observer].entries.every(
          (entry) =>
            Number.isFinite(entry?.duration) &&
            Number.isFinite(entry?.startTime)
        ),
      `${observer} entries unavailable`
    )
  }
  requireValue(
    ['coarsePointer', 'dark', 'reducedMotion'].every(
      (field) => typeof snapshot?.media?.[field] === 'boolean'
    ),
    'media state unavailable'
  )
  requireValue(
    snapshot?.source === contract.source,
    'sample source mismatch'
  )
  requireValue(snapshot?.gesture === contract.gesture, 'sample gesture mismatch')
  if (contract.touch) {
    requireValue(snapshot.pointerTypes.includes('touch'), 'touch pointer not observed')
  }
  if (requireDraws) {
    requireValue(
      snapshot.draws.count > 0,
      `no ASCII draws observed for sample mode "${mode}"`
    )
  }
}

async function sample(session, mode, requireDraws) {
  const snapshot = await evaluate(
    session,
    `window.__ASCII_BENCHMARK__.run(${JSON.stringify(mode)})`,
    windowMs + 20_000
  )
  assertSnapshotContract(snapshot, mode, requireDraws)
  return snapshot
}

function aggregate(entries) {
  const durations = entries.map((entry) => entry.draws.durationsMs)
  return {
    canvasCpuPercent: round(
      median(entries.map((entry) => entry.draws.cpuPercent))
    ),
    drawMaxMs: round(Math.max(0, ...durations.flat())),
    drawP95Ms: round(p95(durations.flat())),
    draws: round(median(entries.map((entry) => entry.draws.count))),
    drawsPerSecond: round(
      median(entries.map((entry) => entry.draws.perSecond))
    ),
    longTasks: Math.max(...entries.map((entry) => entry.longTasks.count)),
    pageLongTasks: Math.max(
      ...entries.map((entry) => entry.pageLongTasks.count)
    ),
    pageTbtMs: round(
      Math.max(...entries.map((entry) => entry.pageLongTasks.tbtMs))
    ),
    pointerTypes: [...new Set(entries.flatMap((entry) => entry.pointerTypes))],
    tbtMs: round(Math.max(...entries.map((entry) => entry.longTasks.tbtMs))),
  }
}

async function measure(baseUrl, profile, route, trace, artifacts) {
  const id = `${profile}|${route.path}`
  const session = `s${++sessionSerial}`
  const tracePath = join(
    artifacts,
    `failure-trace-${id.replace(/[^a-z0-9]+/gi, '-').toLowerCase()}.json`
  )
  const raw = { idle: [], touch: [], verticalPan: undefined }
  let tracing = false
  let measurementError
  let result
  let traceError
  sessions.add(session)
  try {
    await browser(session, ['open'])
    await browser(session, ['set', 'device', profile])
    await browser(session, ['set', 'media', 'dark'])
    await browser(
      session,
      ['open', new URL(route.path, `${baseUrl}/`).toString()],
      60_000
    )
    await warmAsciiRuntime(session)
    if (trace) {
      await browser(session, ['trace', 'start'])
      tracing = true
    }
    raw.verticalPan = await sample(session, 'vertical-pan', false)
    await browser(session, ['reload'], 60_000)
    await warmAsciiRuntime(session)
    for (let index = 0; index < count; index += 1) {
      raw.idle.push(
        await sample(session, 'idle', route.variant === 'forest')
      )
    }
    await browser(session, ['reload'], 60_000)
    await warmAsciiRuntime(session)
    for (let index = 0; index < count; index += 1) {
      raw.touch.push(await sample(session, 'touch', true))
    }
    const vitals = await browser(session, ['vitals'])
    await browser(session, ['set', 'media', 'dark', 'reduced-motion'])
    await sleep(250)
    raw.reduced = await sample(session, 'touch', false)
    result = {
      aggregate: {
        idle: aggregate(raw.idle),
        reduced: aggregate([raw.reduced]),
        touch: aggregate(raw.touch),
        verticalPan: aggregate([raw.verticalPan]),
      },
      errors: await browser(session, ['errors']),
      id,
      profile,
      raw,
      route: route.path,
      status: 'measured',
      variant: route.variant,
      vitals,
    }
  } catch (error) {
    measurementError = error
  } finally {
    if (tracing) {
      try {
        await browser(session, ['trace', 'stop', tracePath])
        const traceStats = await stat(tracePath)
        if (traceStats.size === 0) throw new Error('saved trace is empty')
        if (result) result.trace = relative(artifacts, tracePath)
      } catch (error) {
        traceError = new Error(`trace save failed: ${error.message}`)
      }
    }
    await closeSession(session)
  }
  if (measurementError) {
    if (traceError) {
      measurementError.message += `; ${traceError.message}`
    }
    throw measurementError
  }
  if (traceError) throw traceError
  return result
}

function vital(value, name, seen = new Set()) {
  if (!value || typeof value !== 'object' || seen.has(value)) return
  seen.add(value)
  if (String(value.name).toLowerCase() === name && Number.isFinite(value.value)) {
    return value.value
  }
  for (const [key, nested] of Object.entries(value)) {
    if (key.toLowerCase() !== name) continue
    if (Number.isFinite(nested)) return nested
    if (Number.isFinite(nested?.value)) return nested.value
    if (name === 'lcp' && Number.isFinite(nested?.startTime)) {
      return nested.startTime
    }
    if (name === 'cls' && Number.isFinite(nested?.score)) {
      return nested.score
    }
  }
  for (const nested of Object.values(value)) {
    const found = vital(nested, name, seen)
    if (found !== undefined) return found
  }
}

const failure = (run, metric, actual, limit, message) => ({
  actual: Number.isFinite(actual) ? round(actual) : (actual ?? null),
  limit: Number.isFinite(limit) ? round(limit) : (limit ?? null),
  message,
  metric,
  scenario: run?.id,
})

function validateRuns(runs) {
  const failures = []
  const add = (run, metric, actual, limit, message) =>
    failures.push(failure(run, metric, actual, limit, message))
  const expectedIds = new Set(expectedScenarios.map(({ id }) => id))
  for (const run of runs) {
    if (!expectedIds.has(run.id)) add(run, 'coverage', 0, 1, 'unexpected scenario')
  }
  for (const expected of expectedScenarios) {
    const matches = runs.filter((run) => run.id === expected.id)
    if (matches.length !== 1) {
      add(
        matches[0],
        'coverage',
        matches.length,
        1,
        `${expected.id} must be measured exactly once`
      )
      continue
    }
    const run = matches[0]
    if (run.status !== 'measured') continue
    for (const field of ['profile', 'route', 'variant']) {
      if (run[field] !== expected[field]) {
        add(
          run,
          `coverage.${field}`,
          run[field],
          expected[field],
          'scenario metadata mismatch'
        )
      }
    }
    if (run.raw?.idle?.length !== count || run.raw?.touch?.length !== count) {
      add(run, 'samples', null, count, 'idle/touch sample set incomplete')
    }
    if (!run.raw?.reduced)
      add(run, 'samples.reduced', 0, 1, 'reduced-motion sample missing')
    if (!run.raw?.verticalPan)
      add(run, 'samples.verticalPan', 0, 1, 'vertical-pan sample missing')
    if (!Array.isArray(run.errors?.errors)) {
      add(run, 'browser.errors', null, null, 'errors array unavailable')
    }
    const snapshots = [
      ...(run.raw?.idle ?? []).map((snapshot, index) => ({
        label: `idle.${index}`,
        mode: 'idle',
        requireDraws: run.variant === 'forest',
        snapshot,
      })),
      ...(run.raw?.touch ?? []).map((snapshot, index) => ({
        label: `touch.${index}`,
        mode: 'touch',
        requireDraws: true,
        snapshot,
      })),
      {
        label: 'verticalPan',
        mode: 'vertical-pan',
        requireDraws: false,
        snapshot: run.raw?.verticalPan,
      },
      {
        label: 'reduced',
        mode: 'touch',
        requireDraws: false,
        snapshot: run.raw?.reduced,
      },
    ]
    for (const { label, mode, requireDraws, snapshot } of snapshots) {
      if (!snapshot) continue
      try {
        assertSnapshotContract(snapshot, mode, requireDraws)
      } catch (error) {
        add(run, `snapshot.${label}`, null, null, error.message)
      }
    }
    for (const phase of ['idle', 'touch', 'verticalPan', 'reduced']) {
      const stats = run.aggregate?.[phase]
      for (const metric of aggregateMetrics) {
        if (!Number.isFinite(stats?.[metric]))
          add(run, `${phase}.${metric}`, stats?.[metric], null, 'unavailable')
      }
      if (!Array.isArray(stats?.pointerTypes))
        add(run, `${phase}.pointerTypes`, null, null, 'unavailable')
    }
  }
  return failures
}

function gate(runs) {
  const failures = []
  const add = (run, metric, actual, limit, message) =>
    failures.push(failure(run, metric, actual, limit, message))
  const over = (run, name, value, limit, message = 'gate exceeded') => {
    if (!Number.isFinite(value)) add(run, name, value, limit, 'unavailable')
    else if (!Number.isFinite(limit))
      add(run, name, value, limit, 'limit unavailable')
    else if (value > limit) add(run, name, value, limit, message)
  }
  const under = (run, name, value, limit, message = 'gate not met') => {
    if (!Number.isFinite(value)) add(run, name, value, limit, 'unavailable')
    else if (!Number.isFinite(limit))
      add(run, name, value, limit, 'limit unavailable')
    else if (value < limit) add(run, name, value, limit, message)
  }
  for (const run of runs) {
    if (run.status !== 'measured') {
      add(run, 'execution', 0, 0, run.error)
      continue
    }
    over(run, 'cls', vital(run.vitals, 'cls'), limits.cls)
    for (const [phase, stats] of Object.entries(run.aggregate)) {
      over(run, `${phase}.longTasks`, stats.longTasks, 0, 'post-warmup long task')
      over(
        run,
        `${phase}.pageLongTasks`,
        stats.pageLongTasks,
        0,
        'post-warmup page long task'
      )
      over(
        run,
        `${phase}.tbt`,
        stats.tbtMs,
        0,
        'canvas-correlated blocking time'
      )
      over(run, `${phase}.pageTbt`, stats.pageTbtMs, 0, 'page blocking time')
      over(run, `${phase}.p95`, stats.drawP95Ms, limits.p95)
      over(run, `${phase}.max`, stats.drawMaxMs, limits.max)
    }
    const { idle, reduced, touch, verticalPan } = run.aggregate
    over(run, 'idle.cpu', idle.canvasCpuPercent, limits.idleCpu)
    over(run, 'touch.cpu', touch.canvasCpuPercent, limits.touchCpu)
    over(
      run,
      'verticalPan.cpu',
      verticalPan.canvasCpuPercent,
      limits.touchCpu
    )
    if (run.variant === 'forest') {
      under(
        run,
        'idle.rate.minimum',
        idle.drawsPerSecond,
        limits.idleRateMinimum.forest
      )
    }
    under(
      run,
      'touch.rate.minimum',
      touch.drawsPerSecond,
      limits.touchRateMinimum
    )
    over(run, 'idle.rate', idle.drawsPerSecond, limits.idleRate[run.variant])
    over(run, 'touch.rate', touch.drawsPerSecond, limits.touchRate)
    if (run.variant === 'topography') {
      over(
        run,
        'verticalPan.topography.draws',
        verticalPan.draws,
        1,
        'vertical pan activated topography'
      )
    } else {
      over(
        run,
        'verticalPan.forest.rate',
        verticalPan.drawsPerSecond,
        limits.idleRate.forest,
        'vertical pan exceeded forest idle cadence'
      )
    }
    over(
      run,
      'reduced.draws',
      reduced.draws,
      limits.reducedDraws,
      'more than one draw in 2s'
    )
    if (!touch.pointerTypes.includes('touch'))
      add(run, 'touch.pointer', 0, 1, 'not observed')
    if (!verticalPan.pointerTypes.includes('touch'))
      add(run, 'verticalPan.pointer', 0, 1, 'not observed')
    const snapshots = [
      ...run.raw.idle.map((snapshot, index) => ({
        label: `idle.${index}`,
        snapshot,
      })),
      ...run.raw.touch.map((snapshot, index) => ({
        label: `touch.${index}`,
        snapshot,
      })),
      { label: 'verticalPan', snapshot: run.raw.verticalPan },
      { label: 'reduced', snapshot: run.raw.reduced },
    ]
    if (Array.isArray(run.errors?.errors) && run.errors.errors.length > 0) {
      add(
        run,
        'browser.errors',
        run.errors.errors.length,
        0,
        'browser errors observed'
      )
    }
    for (const { label, snapshot } of snapshots) {
      if (Array.isArray(snapshot.errors) && snapshot.errors.length > 0) {
        add(
          run,
          `snapshot.${label}.errors`,
          snapshot.errors.length,
          0,
          'page errors observed'
        )
      }
      for (const canvas of snapshot.canvas) {
        for (const [axis, size] of [
          ['X', canvas.cssWidth],
          ['Y', canvas.cssHeight],
        ]) {
          const limit = 1.75 + (size ? 0.51 / size : 0)
          over(
            run,
            `snapshot.${label}.dpr${axis}`,
            canvas[`effectiveDpr${axis}`],
            limit
          )
        }
      }
    }
    const horizontalTouch = [...run.raw.touch, run.raw.reduced]
    if (
      horizontalTouch.some((snapshot) => snapshot.source !== 'synthetic-touch')
    )
      add(run, 'touch.source', 0, 1, 'label missing')
    if (run.raw.verticalPan.source !== 'synthetic-touch')
      add(run, 'verticalPan.source', 0, 1, 'label missing')
    if (
      horizontalTouch.some(
        (snapshot) => snapshot.gesture !== 'horizontal'
      )
    )
      add(run, 'touch.gesture', 0, 1, 'horizontal label missing')
    if (run.raw.verticalPan.gesture !== 'vertical')
      add(run, 'verticalPan.gesture', 0, 1, 'vertical label missing')
    if (
      snapshots.some(
        ({ snapshot }) =>
          !snapshot.media.dark || !snapshot.media.coarsePointer
      )
    )
      add(run, 'media', 0, 1, 'dark/coarse emulation missing')
    if (!run.raw.reduced.media.reducedMotion)
      add(run, 'reduced.media', 0, 1, 'emulation missing')
  }
  return failures
}

function makeBaseline(runs, versions, provenance) {
  return {
    agentBrowserVersion: versions.agentBrowserVersion,
    createdAt: new Date().toISOString(),
    portlessVersion: versions.portlessVersion,
    provenance: {
      harness: provenance.harness,
      source: {
        ...provenance.benchmarkSource,
        files: provenance.sourceFiles,
      },
    },
    sampleCount: count,
    scenarios: Object.fromEntries(
      runs.map((run) => [
        run.id,
        {
          idle: run.aggregate.idle,
          profile: run.profile,
          route: run.route,
          touch: run.aggregate.touch,
          verticalPan: run.aggregate.verticalPan,
          variant: run.variant,
        },
      ])
    ),
    version: schemaVersion,
    windowMs,
  }
}

function validateBaseline(baseline, versions, provenance) {
  const issues = []
  for (const [field, expected] of [
    ['version', schemaVersion],
    ['sampleCount', count],
    ['windowMs', windowMs],
    ['agentBrowserVersion', versions.agentBrowserVersion],
    ['portlessVersion', versions.portlessVersion],
  ]) {
    if (baseline?.[field] !== expected) {
      issues.push(
        `${field} must equal ${JSON.stringify(expected)}; received ${JSON.stringify(baseline?.[field])}`
      )
    }
  }
  const baselineProvenance = baseline?.provenance
  if (
    !baselineProvenance ||
    typeof baselineProvenance !== 'object' ||
    Array.isArray(baselineProvenance)
  ) {
    issues.push('provenance must be an object')
  } else {
    const harness = baselineProvenance.harness
    if (!harness || typeof harness !== 'object' || Array.isArray(harness)) {
      issues.push('provenance.harness must be an object')
    } else {
      if (
        JSON.stringify(harness.files) !==
        JSON.stringify(provenance.harness.files)
      ) {
        issues.push('provenance.harness.files must match the harness contract')
      }
      if (!/^[0-9a-f]{64}$/.test(harness.fingerprint ?? '')) {
        issues.push('provenance.harness.fingerprint must be a SHA-256 digest')
      } else if (harness.fingerprint !== provenance.harness.fingerprint) {
        issues.push('provenance.harness.fingerprint does not match this harness')
      }
    }
    const source = baselineProvenance.source
    if (!source || typeof source !== 'object' || Array.isArray(source)) {
      issues.push('provenance.source must be an object')
    } else {
      if (JSON.stringify(source.files) !== JSON.stringify(sourceFiles)) {
        issues.push('provenance.source.files must match the workload contract')
      }
      if (!/^[0-9a-f]{40,64}$/.test(source.revision ?? '')) {
        issues.push('provenance.source.revision must be a commit ID')
      }
      if (!/^[0-9a-f]{64}$/.test(source.fingerprint ?? '')) {
        issues.push('provenance.source.fingerprint must be a SHA-256 digest')
      }
      if (
        !['clean', 'dirty', 'declared-committed-source'].includes(source.state)
      ) {
        issues.push('provenance.source.state is invalid')
      }
      if (
        !Array.isArray(source.dirtyFiles) ||
        source.dirtyFiles.some((entry) => typeof entry !== 'string')
      ) {
        issues.push('provenance.source.dirtyFiles must be a string array')
      } else if (source.state === 'clean' && source.dirtyFiles.length > 0) {
        issues.push('clean provenance cannot list dirty files')
      } else if (source.state === 'dirty' && source.dirtyFiles.length === 0) {
        issues.push('dirty provenance must list dirty files')
      } else if (
        source.state === 'declared-committed-source' &&
        source.dirtyFiles.length > 0
      ) {
        issues.push('declared committed provenance cannot list dirty files')
      }
    }
  }
  const scenarios = baseline?.scenarios
  if (!scenarios || typeof scenarios !== 'object' || Array.isArray(scenarios)) {
    issues.push('scenarios must be an object')
    return issues
  }
  const expectedIds = new Set(expectedScenarios.map(({ id }) => id))
  for (const id of Object.keys(scenarios)) {
    if (!expectedIds.has(id)) issues.push(`unexpected scenario: ${id}`)
  }
  for (const expected of expectedScenarios) {
    const scenario = scenarios[expected.id]
    if (!scenario || typeof scenario !== 'object') {
      issues.push(`missing scenario: ${expected.id}`)
      continue
    }
    for (const field of ['profile', 'route', 'variant']) {
      if (scenario[field] !== expected[field]) {
        issues.push(
          `${expected.id}.${field} must equal ${JSON.stringify(expected[field])}`
        )
      }
    }
    for (const phase of ['idle', 'touch', 'verticalPan']) {
      const stats = scenario[phase]
      if (!stats || typeof stats !== 'object') {
        issues.push(`${expected.id}.${phase} must be an object`)
        continue
      }
      for (const metric of aggregateMetrics) {
        if (!Number.isFinite(stats[metric])) {
          issues.push(`${expected.id}.${phase}.${metric} must be finite`)
        }
      }
      if (!Array.isArray(stats.pointerTypes)) {
        issues.push(`${expected.id}.${phase}.pointerTypes must be an array`)
      } else if (
        ['touch', 'verticalPan'].includes(phase) &&
        !stats.pointerTypes.includes('touch')
      ) {
        issues.push(`${expected.id}.${phase}.pointerTypes must include touch`)
      }
    }
  }
  return issues
}

async function writeJsonAtomic(path, value) {
  await mkdir(dirname(path), { recursive: true })
  const temporary = join(
    dirname(path),
    `.${basename(path)}.${process.pid}-${Date.now()}.tmp`
  )
  try {
    await writeFile(temporary, `${JSON.stringify(value, null, 2)}\n`, {
      flag: 'wx',
    })
    await rename(temporary, path)
  } finally {
    await unlink(temporary).catch(() => {})
  }
}

async function compareBaseline(runs, failures, versions, provenance) {
  const add = (run, metric, actual, limit, message) =>
    failures.push(failure(run, metric, actual, limit, message))
  let baseline
  try {
    baseline = JSON.parse(await readFile(baselinePath, 'utf8'))
  } catch (error) {
    add(
      undefined,
      'baseline',
      0,
      1,
      error.code === 'ENOENT'
        ? 'missing; run perf:ascii:baseline'
        : `unreadable: ${error.message}`
    )
    return { status: error.code === 'ENOENT' ? 'missing' : 'invalid' }
  }
  const issues = validateBaseline(baseline, versions, provenance)
  if (issues.length) {
    for (const issue of issues) add(undefined, 'baseline', null, null, issue)
    return { createdAt: baseline.createdAt, status: 'invalid' }
  }
  for (const run of runs.filter((item) => item.status === 'measured')) {
    const previous = baseline.scenarios[run.id]
    if (!previous) continue
    for (const phase of ['idle', 'touch', 'verticalPan']) {
      const current = run.aggregate[phase]
      const before = previous[phase]
      const p95Limit =
        before.drawP95Ms + Math.max(before.drawP95Ms * 0.2, 3)
      const cpuLimit = before.canvasCpuPercent * 1.25 + 1
      const minimumRate = before.drawsPerSecond * 0.7
      const verticalRateLimit = before.drawsPerSecond * 1.25 + 0.5
      if (current.drawP95Ms > p95Limit)
        add(
          run,
          `${phase}.p95.baseline`,
          current.drawP95Ms,
          p95Limit,
          '> max(20%, 3ms)'
        )
      if (current.canvasCpuPercent > cpuLimit)
        add(
          run,
          `${phase}.cpu.baseline`,
          current.canvasCpuPercent,
          cpuLimit,
          '> 25% + 1 point'
        )
      if (current.longTasks > before.longTasks)
        add(
          run,
          `${phase}.longTasks.baseline`,
          current.longTasks,
          before.longTasks,
          'increased'
        )
      if (current.tbtMs > before.tbtMs)
        add(
          run,
          `${phase}.tbt.baseline`,
          current.tbtMs,
          before.tbtMs,
          'increased'
        )
      if (current.pageLongTasks > before.pageLongTasks)
        add(
          run,
          `${phase}.pageLongTasks.baseline`,
          current.pageLongTasks,
          before.pageLongTasks,
          'increased'
        )
      if (current.pageTbtMs > before.pageTbtMs)
        add(
          run,
          `${phase}.pageTbt.baseline`,
          current.pageTbtMs,
          before.pageTbtMs,
          'increased'
        )
      if (
        (phase === 'touch' || (phase === 'idle' && run.variant === 'forest')) &&
        current.drawsPerSecond < minimumRate
      ) {
        add(
          run,
          `${phase}.rate.baseline`,
          current.drawsPerSecond,
          minimumRate,
          '< 70% of baseline'
        )
      }
      if (
        phase === 'verticalPan' &&
        current.drawsPerSecond > verticalRateLimit
      ) {
        add(
          run,
          `${phase}.rate.baseline`,
          current.drawsPerSecond,
          verticalRateLimit,
          '> 25% + 0.5 fps'
        )
      }
    }
  }
  return { createdAt: baseline.createdAt, status: 'compared' }
}

async function main() {
  const options = parseArgs(process.argv.slice(2))
  if (options.help) return help()
  const provenance = await collectProvenance(options)
  if (
    options.updateBaseline &&
    !options.url &&
    provenance.workingSource.state === 'dirty' &&
    !options.allowDirtyBaseline
  ) {
    throw new Error(
      'managed baseline workload sources are dirty; ' +
        'use --allow-dirty-baseline to record that state explicitly'
    )
  }
  const versions = await preflightTools()
  const artifacts = join(
    artifactRoot,
    new Date().toISOString().replace(/[:.]/g, '-')
  )
  await mkdir(artifacts, { recursive: true })
  const portlessName = `stefangarofalo-bench-${process.pid}`
  const baseUrl = options.url ?? (await startServer(portlessName))
  await waitUntilReady(baseUrl, options.url ? undefined : portlessName)
  const environment = {
    agentBrowserBaseNamespace,
    agentBrowserChromiumArgs,
    agentBrowserIdleTimeoutMs,
    agentBrowserInitScript: relative(root, initScript),
    agentBrowserIsolation: 'per-scenario-namespace',
    agentBrowserNamespacePattern: `${agentBrowserBaseNamespace}<session-id>`,
    agentBrowserVersion: versions.agentBrowserVersion,
    baseUrl,
    frameClock: frameClockContract,
    limits,
    node: process.version,
    platform: `${process.platform}-${process.arch}`,
    portlessName: options.url ? null : portlessName,
    portlessVersion: versions.portlessVersion,
    profiles,
    provenance,
    routes,
    samples: count,
    schemaVersion,
    server: options.url ? 'external' : 'managed-portless',
    vitalsContract: {
      cls: 'gated',
      fcp: 'best-effort-non-gating',
      lcp: 'best-effort-non-gating',
      ttfb: 'captured',
    },
    warmupMs,
    windowMs,
  }
  await writeFile(
    join(artifacts, 'environment.json'),
    `${JSON.stringify(environment, null, 2)}\n`
  )

  const runs = []
  for (const profile of profiles) {
    for (const route of routes) {
      process.stdout.write(`measure ${profile} ${route.path} ... `)
      try {
        runs.push(
          await measure(baseUrl, profile, route, options.trace, artifacts)
        )
        console.log('done')
      } catch (error) {
        runs.push({
          error: error.message,
          id: `${profile}|${route.path}`,
          status: 'error',
        })
        console.log('error')
      }
    }
  }

  const runValidationFailures = validateRuns(runs)
  const failures = [...runValidationFailures, ...gate(runs)]
  const knownHistoricalFailureGates = new Set([
    'topography:idle.rate',
    'topography:verticalPan.topography.draws',
    'forest:verticalPan.forest.rate',
  ])
  const nonHistoricalFailures = failures.filter(
    (item) => {
      const variant = expectedScenarios.find(
        (scenario) => scenario.id === item.scenario
      )?.variant
      return !knownHistoricalFailureGates.has(`${variant}:${item.metric}`)
    }
  )
  const complete =
    runValidationFailures.length === 0 &&
    runs.length === expectedScenarios.length &&
    runs.every((run) => run.status === 'measured')
  let baseline
  if (options.updateBaseline) {
    if (!complete) {
      baseline = {
        reason: 'partial, invalid, or errored scenario set',
        status: 'refused',
      }
    } else if (
      failures.length &&
      (!options.allowFailingBaseline || nonHistoricalFailures.length)
    ) {
      baseline = {
        reason: options.allowFailingBaseline
          ? '--allow-failing-baseline only permits topography idle.rate, topography vertical draws, and forest vertical rate failures'
          : 'gates failed; only topography idle.rate, topography vertical draws, and forest vertical rate failures may be overridden with --allow-failing-baseline',
        status: 'refused',
      }
    } else {
      await writeJsonAtomic(
        baselinePath,
        makeBaseline(runs, versions, provenance)
      )
      baseline = { path: relative(root, baselinePath), status: 'updated' }
    }
  } else baseline = await compareBaseline(runs, failures, versions, provenance)

  await writeFile(
    join(artifacts, 'runs.jsonl'),
    `${runs.map((run) => JSON.stringify(run)).join('\n')}\n`
  )
  const summary = {
    baseline,
    failed: failures.length,
    failures,
    passed: failures.length === 0,
    scenarios: runs.map(({ aggregate, error, id, status, trace }) => ({
      aggregate,
      error,
      id,
      status,
      trace,
    })),
  }
  await writeFile(
    join(artifacts, 'summary.json'),
    `${JSON.stringify(summary, null, 2)}\n`
  )
  console.log(`${summary.passed ? 'PASS' : 'FAIL'}: ${failures.length} failure(s)`)
  console.log(`artifacts: ${relative(root, artifacts)}`)
  for (const item of failures.slice(0, 10)) {
    console.error(`- ${item.scenario ?? 'suite'} ${item.metric}: ${item.message}`)
  }
  if (!summary.passed) process.exitCode = 1
}

for (const signal of ['SIGINT', 'SIGTERM']) {
  process.once(signal, () => {
    cleanup().finally(() => process.exit(signal === 'SIGINT' ? 130 : 143))
  })
}
main()
  .catch((error) => {
    console.error(error.message)
    process.exitCode = 1
  })
  .finally(cleanup)
