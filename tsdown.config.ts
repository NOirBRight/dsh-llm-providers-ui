import type { UserConfig } from 'tsdown'

const host: UserConfig = {
  name: 'dsh-llm-providers-ui',
  entry: ['lib/types/index.js'],
  outDir: 'lib',
  format: ['esm'],
  platform: 'node',
  target: 'es2024',
  fixedExtension: false,
  dts: false,
  clean: false,
  deps: {
    neverBundle: [
      '@deepseek-ai/cordis',
      '@deepseek-ai/schemastery',
      '@deepseek-ai/dsh-settings',
    ],
  },
}

export default [host]
