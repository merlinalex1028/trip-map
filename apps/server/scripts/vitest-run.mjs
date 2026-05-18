import { spawn } from 'node:child_process'
import { existsSync, readdirSync } from 'node:fs'
import { createRequire } from 'node:module'
import { dirname, relative, resolve } from 'node:path'
import { Socket } from 'node:net'

const require = createRequire(import.meta.url)
const vitestPackageJsonPath = require.resolve('vitest/package.json')
const vitestPackage = require(vitestPackageJsonPath)
const vitestCliPath = resolve(dirname(vitestPackageJsonPath), vitestPackage.bin.vitest)
const forwardedArgs = process.argv.slice(2)
const normalizedArgs = forwardedArgs[0] === '--' ? forwardedArgs.slice(1) : forwardedArgs

const serverRoot = resolve(new URL('..', import.meta.url).pathname)
const testRoot = resolve(serverRoot, 'test')
const databaseEnvPath = resolve(serverRoot, '.env')
const dbRequiredTests = new Set([
  'test/auth-bootstrap.e2e-spec.ts',
  'test/auth-session.e2e-spec.ts',
  'test/records-contract.e2e-spec.ts',
  'test/records-import.e2e-spec.ts',
  'test/records-ownership.e2e-spec.ts',
  'test/records-smoke.e2e-spec.ts',
  'test/records-sync.e2e-spec.ts',
  'test/records-travel.e2e-spec.ts',
])

function normalizeDatabaseUrl(value) {
  if (!value) {
    return value
  }

  try {
    new URL(value)
    return value
  }
  catch {
    const match = value.match(/^(postgres(?:ql)?):\/\/([^:]+):([^@]+)@(.*)$/)

    if (!match) {
      return value
    }

    const [, protocol, user, password, rest] = match
    return `${protocol}://${user}:${encodeURIComponent(password)}@${rest}`
  }
}

function listE2eTests(directory) {
  return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const absolutePath = resolve(directory, entry.name)

    if (entry.isDirectory()) {
      return listE2eTests(absolutePath)
    }

    if (!entry.name.endsWith('.e2e-spec.ts')) {
      return []
    }

    return [relative(serverRoot, absolutePath)]
  })
}

async function isDatabaseReachable() {
  if (existsSync(databaseEnvPath)) {
    process.loadEnvFile(databaseEnvPath)
  }

  const databaseUrl = normalizeDatabaseUrl(process.env.DATABASE_URL)

  if (!databaseUrl) {
    return false
  }

  try {
    const { hostname, port, protocol } = new URL(databaseUrl)
    const fallbackPort = protocol === 'postgres:' || protocol === 'postgresql:' ? 5432 : undefined
    const targetPort = Number(port || fallbackPort)

    if (!hostname || !targetPort) {
      return false
    }

    return await new Promise((resolveReachable) => {
      const socket = new Socket()
      const finish = (reachable) => {
        socket.destroy()
        resolveReachable(reachable)
      }

      socket.setTimeout(1500)
      socket.once('connect', () => finish(true))
      socket.once('error', () => finish(false))
      socket.once('timeout', () => finish(false))
      socket.connect(targetPort, hostname)
    })
  }
  catch {
    return false
  }
}

const hasExplicitTestSelection = normalizedArgs.some(arg => !arg.startsWith('-'))
const vitestArgs = ['run', ...normalizedArgs]

if (!hasExplicitTestSelection && !(await isDatabaseReachable())) {
  const runnableTests = listE2eTests(testRoot).filter(testFile => !dbRequiredTests.has(testFile))

  console.warn('[server:test] DATABASE_URL is not reachable; skipping DB-backed e2e specs.')
  console.warn(`[server:test] Skipped: ${[...dbRequiredTests].join(', ')}`)
  console.warn('[server:test] Run a focused DB spec when the database is available, e.g. pnpm --filter @trip-map/server test -- test/records-travel.e2e-spec.ts')

  vitestArgs.push(...runnableTests)
}

const child = spawn(process.execPath, [vitestCliPath, ...vitestArgs], {
  stdio: 'inherit',
})

child.on('exit', (code, signal) => {
  if (signal) {
    process.kill(process.pid, signal)
    return
  }

  process.exit(code ?? 0)
})
