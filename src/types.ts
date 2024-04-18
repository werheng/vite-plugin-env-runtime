export interface Options {
  /**
   * This is the name of the global variable that will be used to configure your Env variables.
   * In the browser, the default global variable name is `window.__PRODUCTION__APP__CONF__`.
   * @default __PRODUCTION__APP__CONF__
   */
  name?: string

  /**
   * Matches the Env variables that need to be configured.
   * @default VITE_
   */
  prefix?: string

  /**
   * Name of the configuration file that will be generated.
   * @default config.js
   */
  filename?: string
}
