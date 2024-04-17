import type { Options } from 'tsup'

export default <Options>{
  entryPoints: [
    'src/index.ts',
  ],
  clean: true,
  dts: true,
  format: ['cjs', 'esm'],
}
