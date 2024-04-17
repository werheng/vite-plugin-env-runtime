# vite-plugin-env-runtime [![npm version][npm-version-src]][npm-version-href]

Configure environment variables on runtime.

## Features

- 🚀 Replace environment variables by global variable.
- ✨ No need to change your source code.
- 🌱 Read `base`, `outDir`, `envPrefix` value by `vite.config`.
- 📦 Generate configuration files at build time.
- 🦾 Written in TypeScript.

## Install

```bash
# npm
npm i vite-plugin-env-runtime -D

# yarn
yarn add vite-plugin-env-runtime -D

# pnpm
pnpm add vite-plugin-env-runtime -D
```

## Usage

Add `EnvRuntime` plugin to `vite.config.js / vite.config.ts` and configure it:

```ts
// vite.config.js / vite.config.ts
import EnvRuntime from 'vite-plugin-env-runtime'

export default {
  plugins: [
    EnvRuntime()
  ],
}
```

And then you can use `dist/config.js` to configure your environment variables.

## Options

### `name`

- **Type:** `string`
- **Default:** `__PRODUCTION__APP__CONF__`

  This is the name of the global variable that will be used to configure your environment variables. In the browser, the global variable name is `window.__PRODUCTION__APP__CONF__`.

### `prefix`

- **Type:** `string`
- **Default:** `VITE_`

  Matches the environment variables that need to be configured.

### `filename`

- **Type:** `string`
- **Default:** `config.js`

  Name of the configuration file that will be generated.

## License

[MIT](./LICENSE) License &copy; 2024-PRESENT [Werheng Zhang](https://github.com/werheng)

<!-- Badges -->
[npm-version-src]: https://img.shields.io/npm/v/vite-plugin-env-runtime?style=flat-square
[npm-version-href]: https://npmjs.com/package/vite-plugin-env-runtime
