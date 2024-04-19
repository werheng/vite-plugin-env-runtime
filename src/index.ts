import process from 'node:process'
import { resolve } from 'node:path'
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import MagicString from 'magic-string'
import dotenv from 'dotenv'
import consola from 'consola'
import defu from 'defu'
import type { HtmlTagDescriptor, PluginOption, ResolvedConfig } from 'vite'
import type { Options } from './types'
import { arraify, createFilter } from './utils'

function createContext(viteConfig: ResolvedConfig, rawOptions: Options = {}) {
  const { base, build: { outDir }, envPrefix, envDir } = defu(viteConfig, {
    base: '/',
    build: { outDir: 'dist' },
    envPrefix: 'VITE_',
    envDir: '',
  })

  const options = defu(rawOptions, {
    name: '__PRODUCTION__APP__CONF__',
    filename: 'config.js',
    exclude: [],
  })

  const includes = arraify<string>(options.include ?? arraify(envPrefix).map(v => `${v}*`))
  const excludes = arraify<string>(options.exclude)
  const filter = createFilter(includes, excludes)

  const ENV_DISABLE_KEY = 'VITE_ENV_RUNTIME'
  const CONFIG_NAME = options.name
  const FILENAME = options.filename
  const OUTPUT_DIR = outDir
  const BASE = base
  const ENV_DIR = envDir

  function getConfigName() {
    return CONFIG_NAME.toUpperCase().replace(/\s/g, '')
  }

  function transform(code: string) {
    const s = new MagicString(code)

    function generatePattern(patterns: string[]) {
      return patterns.map((prefix: string) => {
        const regex = prefix.includes('*') ? prefix.replace('*', '[^;]+') : prefix
        return `(${regex})`
      }).join('|')
    }
    const includePattern = generatePattern(includes)
    const excludePattern = generatePattern(excludes)

    const generateReg = (pattern: string) => `import\\.meta\\.env\\.${pattern}*?;`
    const includeReg = new RegExp(generateReg(includePattern), 'g')
    const excludeReg = new RegExp(generateReg(excludePattern), 'g')

    s.replace(includeReg, (match) => {
      if (excludeReg.test(match))
        return match

      return match.replace('import.meta.env.', `window.${getConfigName()}.`)
    })

    return {
      code: s.toString(),
      map: s.generateMap({ hires: 'boundary' }),
    }
  }

  function transformIndexHtml(): HtmlTagDescriptor[] {
    return [{
      tag: 'script',
      attrs: { src: `${BASE + FILENAME}?v=${new Date().getTime()}` },
    }]
  }

  function getConfFiles() {
    const script = process.env.npm_lifecycle_script
    const reg = /--mode ([a-z_\d]+)/
    const result = reg.exec(script as string) as any
    if (result) {
      const mode = result[1] as string
      return ['.env', `.env.${mode}`]
    }
    return ['.env', '.env.production']
  }

  function getEnvConfig(confFiles = getConfFiles()) {
    let envConfig: Record<string, string> = {}

    confFiles.forEach((item) => {
      const path = resolve(process.cwd(), ENV_DIR, item)
      if (!existsSync(path))
        return

      try {
        const env = dotenv.parse(readFileSync(path))
        envConfig = { ...envConfig, ...env }
      }
      catch (e) {
        consola.error(`Error in parsing ${item}`, e)
      }
    })

    if (envConfig[ENV_DISABLE_KEY] === 'false')
      return {}

    Object.keys(envConfig).forEach((key) => {
      if (!filter(key))
        Reflect.deleteProperty(envConfig, key)
    })

    return envConfig
  }

  function runBuildConfig(
    envConfig = getEnvConfig(),
    configName = getConfigName(),
    configFileName = FILENAME,
  ) {
    try {
      const windowConf = `window.${configName}`
      const configContent = `${windowConf}=${JSON.stringify(envConfig)};
         Object.freeze(${windowConf});
         Object.defineProperty(window, "${configName}", {
           configurable: false,
           writable: false,
         });
       `.replace(/\s/g, '')

      const outputDir = resolve(process.cwd(), OUTPUT_DIR)
      const outputFile = resolve(outputDir, configFileName)
      mkdirSync(outputDir, { recursive: true })
      writeFileSync(outputFile, configContent)

      consola.success(`[vite-plugin-env-runtime] Configuration file is build successfully: ${`${OUTPUT_DIR}/${configFileName}`}`)
    }
    catch (error) {
      consola.error(`configuration file failed to package:\n${error}`)
    }
  }

  return {
    transform,
    transformIndexHtml,
    runBuildConfig,
  }
}

export default function viteEnvRuntimePlugin(options?: Options): PluginOption {
  let config: any

  return {
    name: 'vite-plugin-env-runtime',
    apply: 'build',
    configResolved(resolvedConfig) {
      config = resolvedConfig
    },
    transform(code) {
      return createContext(config, options).transform(code)
    },
    transformIndexHtml() {
      return createContext(config, options).transformIndexHtml()
    },
    closeBundle() {
      try {
        createContext(config, options).runBuildConfig()
      }
      catch (error) {
        consola.error(error)
        process.exit(1)
      }
    },
  }
}
