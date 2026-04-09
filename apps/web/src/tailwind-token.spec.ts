import { readFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const currentDir = dirname(fileURLToPath(import.meta.url))
const webRoot = resolve(currentDir, '..')

const readWebFile = (relativePath: string) =>
  readFileSync(resolve(webRoot, relativePath), 'utf8')

describe('tailwind token contracts', () => {
  it('keeps tailwind dependencies scoped to apps/web devDependencies', () => {
    const packageJsonSource = readWebFile('package.json')

    expect(packageJsonSource).toContain('"tailwindcss": "^4.2.2"')
    expect(packageJsonSource).toContain('"@tailwindcss/vite": "^4.2.2"')

    const packageJson = JSON.parse(packageJsonSource) as {
      dependencies?: Record<string, string>
      devDependencies?: Record<string, string>
    }

    expect(packageJson.devDependencies?.tailwindcss).toBe('^4.2.2')
    expect(packageJson.devDependencies?.['@tailwindcss/vite']).toBe('^4.2.2')
    expect(packageJson.dependencies?.tailwindcss).toBeUndefined()
    expect(packageJson.dependencies?.['@tailwindcss/vite']).toBeUndefined()
  })

  it('registers the tailwind vite plugin before vue', () => {
    const viteConfigSource = readWebFile('vite.config.ts')

    expect(viteConfigSource).toContain("import tailwindcss from '@tailwindcss/vite'")
    expect(viteConfigSource).toContain('plugins: [tailwindcss(), vue()]')
  })
})
