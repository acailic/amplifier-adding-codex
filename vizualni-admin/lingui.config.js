import { linguiConfig } from '@lingui/conf';

export default linguiConfig({
  locales: ['sr', 'sr-Latn', 'en'],
  sourceLocale: 'sr',
  fallbackLocale: 'en',
  extractBabelOptions: {
    plugins: [
      '@lingui/babel-plugin-transform-jsx-styled-components',
    ],
  },
  format: 'po',
  extractors: [
    '@lingui/extractor-typescript',
  ],
  catalogs: [
    {
      path: 'locales/{locale}',
      include: [
        'src/**/*.{ts,tsx}',
        '!src/**/*.d.ts',
        '!src/**/*.stories.{ts,tsx}',
        '!src/**/*.test.{ts,tsx}',
      ],
      exclude: [
        'src/**/*.test.{ts,tsx}',
        'src/**/*.stories.{ts,tsx}',
      ],
    },
  ],
  catalogsMergePath: 'locales/{locale}',
  orderBy: 'messageId',
  pseudoLocale: 'pseudo',
  runtimeConfigModule: ['@lingui/core', 'i18n'],
});