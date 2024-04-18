import process from 'node:process'
import { resolve } from 'node:path'
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import type { HtmlTagDescriptor, PluginOption, UserConfig } from 'vite'
import MagicString from 'magic-string'
import dotenv from 'dotenv'
import consola from 'consola'
import defu from 'defu'
import { minimatch } from 'minimatch'
import type { Options } from './types'

function createContext(viteConfig: UserConfig, rawOptions: Options = {}) {
  const options = defu(rawOptions, {
    name: '__PRODUCTION__APP__CONF__',
    prefix: 'VITE_',
    filename: 'config.js',
    exclude: [],
  })

  const { base, build, envPrefix, envDir } = defu(viteConfig, {
    base: '/',
    build: { outDir: 'dist' },
    envPrefix: 'VITE_',
    envDir: '',
  })

  const ENV_DISABLE_KEY = 'VITE_ENV_RUNTIME'
  const CONFIG_NAME = options.name
  const FILENAME = options.filename
  const EXCLUDE = Array.isArray(options.exclude) ? options.exclude : [options.exclude]
  const PREFIX = options.prefix ?? (Array.isArray(envPrefix) ? envPrefix[0] : envPrefix)
  const OUTPUT_DIR = build.outDir
  const BASE = base
  const ENV_DIR = envDir

  function getConfigName() {
    return CONFIG_NAME.toUpperCase().replace(/\s/g, '')
  }

  function transform(code: string) {
    const target = `import.meta.env.${PREFIX}`
    if (!code.includes(target))
      return null

    const s = new MagicString(code)
    s.replaceAll(target, `window.${getConfigName()}.${PREFIX}`)

    return {
      code: s.toString(),
      map: s.generateMap({ hires: 'boundary' }),
    }
  }

  function transformIndexHtml(): HtmlTagDescriptor[] {
    return [{ tag: 'script', attrs: { src: `${BASE + FILENAME}?v=${new Date().getTime()}` } }]
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

  function getEnvConfig(match = PREFIX, confFiles = getConfFiles()) {
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

    const reg = new RegExp(`^(${match})`)

    Object.keys(envConfig).forEach((key) => {
      if (!reg.test(key) || EXCLUDE.some(exclude => minimatch(key, exclude)))
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
      const configStr = `${windowConf}=${JSON.stringify(envConfig)};
         Object.freeze(${windowConf});
         Object.defineProperty(window, "${configName}", {
           configurable: false,
           writable: false,
         });
       `.replace(/\s/g, '')
      mkdirSync(resolve(process.cwd(), OUTPUT_DIR), { recursive: true })
      writeFileSync(
        resolve(process.cwd(), `${OUTPUT_DIR}/${configFileName}`),
        configStr,
      )

      consola.success('[vite-plugin-env-runtime] Configuration file is build successfully: ' + `${OUTPUT_DIR}/${configFileName}`)
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
