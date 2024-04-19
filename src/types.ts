export type Arrayable<T> = T | Array<T>

export interface Options {
  /**
   * Name of the global variable that will be used to configure your env variables.
   * In the browser, the default global variable name is `window.__PRODUCTION__APP__CONF__`.
   * @default __PRODUCTION__APP__CONF__
   */
  name?: string

  /**
   * Name of the configuration file that will be generated.
   * @default config.js
   */
  filename?: string

  /**
   * Match variable to be configured by `minimatch`.
   * Default value is according to `vite.config` - `envPrefix`.
   * @default 'VITE_*'
   */
  include?: string | string[]

  /**
   * Match variable to NOT be configured by `minimatch`.
   */
  exclude?: string | string[]
}
