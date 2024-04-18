export interface Options {
  /**
   * This is the name of the global variable that will be used to configure your env variables.
   * In the browser, the default global variable name is `window.__PRODUCTION__APP__CONF__`.
   * @default __PRODUCTION__APP__CONF__
   */
  name?: string

  /**
   * Matches the env variables that need to be configured.
   * @default VITE_
   */
  prefix?: string

  /**
   * Name of the configuration file that will be generated.
   * @default config.js
   */
  filename?: string

  /**
   * Exclude env variables by `minimatch`.
   * @example "VITE_EXCLUDE_*"
   * @example ["VITE_A", "VITE_B"]
   */
  exclude?: string | string[]
}
