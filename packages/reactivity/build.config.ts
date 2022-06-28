import { defineBuildConfig } from 'unbuild'

export default defineBuildConfig({
  entries: ['src/index'],
  declaration: true, // generate .d.ts files
  clean: true,
  rollup: {
    emitCJS: true,
  },
})
