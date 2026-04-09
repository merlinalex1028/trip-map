import { readFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const currentDir = dirname(fileURLToPath(import.meta.url))
const webRoot = resolve(currentDir, '..')
const repoRoot = resolve(webRoot, '..', '..')

const readWebFile = (relativePath: string) =>
  readFileSync(resolve(webRoot, relativePath), 'utf8')
const readRepoFile = (relativePath: string) =>
  readFileSync(resolve(repoRoot, relativePath), 'utf8')

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
    expect(packageJson.devDependencies?.['@fontsource-variable/nunito']).toBe('^5.2.7')
    expect(packageJson.dependencies?.tailwindcss).toBeUndefined()
    expect(packageJson.dependencies?.['@tailwindcss/vite']).toBeUndefined()
    expect(packageJson.dependencies?.['@fontsource-variable/nunito']).toBeUndefined()
  })

  it('registers the tailwind vite plugin before vue', () => {
    const viteConfigSource = readWebFile('vite.config.ts')

    expect(viteConfigSource).toContain("import tailwindcss from '@tailwindcss/vite'")
    expect(viteConfigSource).toContain('plugins: [tailwindcss(), vue()]')
  })

  it('locks the nunito dependency and tailwind css entrypoint contracts', () => {
    const packageJsonSource = readWebFile('package.json')
    const lockfileSource = readRepoFile('pnpm-lock.yaml')
    const styleSource = readWebFile('src/style.css')
    const mainSource = readWebFile('src/main.ts')

    expect(packageJsonSource).toContain('"@fontsource-variable/nunito": "^5.2.7"')
    expect(lockfileSource).toContain('@fontsource-variable/nunito@5.2.7')

    expect(styleSource).toContain('@import "tailwindcss";')
    expect(styleSource).toContain("@import 'leaflet/dist/leaflet.css';")
    expect(styleSource).toContain("@import './styles/tokens.css';")
    expect(styleSource).toContain("@import './styles/global.css';")

    expect(styleSource.indexOf('@import "tailwindcss";')).toBeLessThan(
      styleSource.indexOf("@import 'leaflet/dist/leaflet.css';"),
    )
    expect(styleSource.indexOf("@import 'leaflet/dist/leaflet.css';")).toBeLessThan(
      styleSource.indexOf("@import './styles/tokens.css';"),
    )
    expect(styleSource.indexOf("@import './styles/tokens.css';")).toBeLessThan(
      styleSource.indexOf("@import './styles/global.css';"),
    )

    for (const token of [
      '--color-sakura-100: #FFD7EA;',
      '--color-sakura-300: #F48FB1;',
      '--color-sakura-500: #FF78AD;',
      '--color-mint-100: #D8F6E8;',
      '--color-mint-300: #B8EAD6;',
      '--color-mint-500: #7ED9B6;',
      '--color-lavender-100: #F1E8FF;',
      '--color-lavender-300: #DBC4FF;',
      '--color-lavender-500: #B79BEA;',
      '--color-cream-100: #FAFAFA;',
      '--color-cream-200: #FFF5F5;',
      '--color-cream-300: #FDF5FF;',
    ]) {
      expect(styleSource).toContain(token)
    }

    expect(styleSource).toContain("--font-sans: 'Nunito Variable'")
    expect(mainSource).toContain("import '@fontsource-variable/nunito'")
    expect(mainSource).toContain("import './style.css'")
    expect(mainSource).not.toContain("./styles/tokens.css")
    expect(mainSource).not.toContain("./styles/global.css")
    expect(mainSource).not.toContain("leaflet/dist/leaflet.css")
  })

  it('keeps the legacy token layer and leaflet svg compatibility patch', () => {
    const tokensSource = readWebFile('src/styles/tokens.css')
    const globalSource = readWebFile('src/styles/global.css')

    expect(tokensSource).toContain('--font-family-body:')
    expect(tokensSource).toContain("'Nunito Variable'")
    expect(tokensSource).toContain('--font-family-display:')
    expect(tokensSource).toContain('--color-page: #FAFAFA;')
    expect(tokensSource).toContain('--color-page-bottom: #FFF5F5;')
    expect(tokensSource).toContain('--color-state-selected:')

    expect(globalSource).toContain('font-family: var(--font-family-body);')
    expect(globalSource).toContain('background: linear-gradient(180deg, var(--color-page), var(--color-page-bottom));')
    expect(globalSource).toContain('.leaflet-container svg {')
    expect(globalSource).toContain('max-width: none;')
    expect(globalSource).toContain('max-height: none;')
  })
})
