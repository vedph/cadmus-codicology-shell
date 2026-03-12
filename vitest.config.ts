/// <reference types="vitest" />
import { defineConfig } from 'vitest/config';
import angular from '@analogjs/vite-plugin-angular';
import { resolve } from 'path';

export default defineConfig({
  plugins: [angular({ tsconfig: './tsconfig.spec.json' })],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./setup-test.ts'],
    include: ['src/**/*.spec.ts', 'projects/**/*.spec.ts'],
    exclude: ['node_modules/**'],
  },
  resolve: {
    alias: {
      // path aliases for your libraries
      '@myrmidon/cadmus-codicology-ui': resolve(
        __dirname,
        'projects/myrmidon/cadmus-codicology-ui/src/public-api.ts',
      ),
      '@myrmidon/cadmus-codicology-bindings': resolve(
        __dirname,
        'projects/myrmidon/cadmus-codicology-bindings/src/public-api.ts',
      ),
      '@myrmidon/cadmus-codicology-contents': resolve(
        __dirname,
        'projects/myrmidon/cadmus-codicology-contents/src/public-api.ts',
      ),
      '@myrmidon/cadmus-codicology-decorations': resolve(
        __dirname,
        'projects/myrmidon/cadmus-codicology-decorations/src/public-api.ts',
      ),
      '@myrmidon/cadmus-codicology-edits': resolve(
        __dirname,
        'projects/myrmidon/cadmus-codicology-edits/src/public-api.ts',
      ),
      '@myrmidon/cadmus-codicology-hands': resolve(
        __dirname,
        'projects/myrmidon/cadmus-codicology-hands/src/public-api.ts',
      ),
      '@myrmidon/cadmus-codicology-layouts': resolve(
        __dirname,
        'projects/myrmidon/cadmus-codicology-layouts/src/public-api.ts',
      ),
      '@myrmidon/cadmus-codicology-material-dsc': resolve(
        __dirname,
        'projects/myrmidon/cadmus-codicology-material-dsc/src/public-api.ts',
      ),
      '@myrmidon/cadmus-codicology-pg': resolve(
        __dirname,
        'projects/myrmidon/cadmus-codicology-pg/src/public-api.ts',
      ),
      '@myrmidon/cadmus-codicology-sheet-labels': resolve(
        __dirname,
        'projects/myrmidon/cadmus-codicology-sheet-labels/src/public-api.ts',
      ),
      '@myrmidon/cadmus-codicology-shelfmarks': resolve(
        __dirname,
        'projects/myrmidon/cadmus-codicology-shelfmarks/src/public-api.ts',
      ),
      '@myrmidon/cadmus-codicology-watermarks': resolve(
        __dirname,
        'projects/myrmidon/cadmus-codicology-watermarks/src/public-api.ts',
      ),
    },
  },
});
