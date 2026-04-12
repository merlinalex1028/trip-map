import { spawn } from 'node:child_process'
import { createRequire } from 'node:module'
import { dirname, resolve } from 'node:path'

const require = createRequire(import.meta.url)
const vitestPackageJsonPath = require.resolve('vitest/package.json')
const vitestPackage = require(vitestPackageJsonPath)
const vitestCliPath = resolve(dirname(vitestPackageJsonPath), vitestPackage.bin.vitest)
const forwardedArgs = process.argv.slice(2)
const normalizedArgs = forwardedArgs[0] === '--' ? forwardedArgs.slice(1) : forwardedArgs

const child = spawn(process.execPath, [vitestCliPath, 'run', ...normalizedArgs], {
  stdio: 'inherit',
})

child.on('exit', (code, signal) => {
  if (signal) {
    process.kill(process.pid, signal)
    return
  }

  process.exit(code ?? 0)
})
