import { defineConfig } from 'rollup';
import typescript from '@rollup/plugin-typescript';
import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import peerDepsExternal from 'rollup-plugin-peer-deps-external';

export default defineConfig([
  // ES Module build
  {
    input: 'src/index.ts',
    output: {
      file: 'dist/index.esm.js',
      format: 'esm',
      sourcemap: true,
    },
    plugins: [
      peerDepsExternal(),
      resolve(),
      commonjs(),
      typescript({
        tsconfig: './tsconfig.json',
        declaration: false,
      }),
    ],
    external: ['react', 'react-dom', 'csv-parse/sync', 'make-plural/plurals'],
  },
  // CommonJS build
  {
    input: 'src/index.ts',
    output: {
      file: 'dist/index.js',
      format: 'cjs',
      sourcemap: true,
    },
    plugins: [
      peerDepsExternal(),
      resolve(),
      commonjs(),
      typescript({
        tsconfig: './tsconfig.json',
        declaration: false,
      }),
    ],
    external: ['react', 'react-dom', 'csv-parse/sync', 'make-plural/plurals'],
  },
  // Types
  {
    input: 'src/index.ts',
    output: {
      file: 'dist/index.d.ts',
      format: 'es',
    },
    plugins: [
      typescript({
        tsconfig: './tsconfig.json',
        declaration: true,
        declarationOnly: true,
      }),
    ],
    external: ['react', 'react-dom', 'csv-parse/sync', 'make-plural/plurals'],
  },
]);