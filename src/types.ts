export interface Options {
  /**
   * @default __PRODUCTION__APP__CONF__
   */
  name?: string

  /**
   * @default VITE_
   */
  prefix?: string

  /**
   * @default config.js
   */
  filename?: string
}
