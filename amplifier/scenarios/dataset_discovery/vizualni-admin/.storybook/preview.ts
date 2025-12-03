import type { Preview } from '@storybook/react'
import '../styles/globals.css'

const preview: Preview = {
  parameters: {
    actions: { argTypesRegex: '^on[A-Z].*' },
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/,
      },
    },
    docs: {
      toc: true,
    },
    backgrounds: {
      default: 'light',
      values: [
        {
          name: 'light',
          value: '#ffffff',
        },
        {
          name: 'dark',
          value: '#1a1a1a',
        },
      ],
    },
    viewport: {
      viewports: {
        mobile: {
          name: 'Mobile',
          styles: {
            width: '375px',
            height: '667px',
          },
        },
        tablet: {
          name: 'Tablet',
          styles: {
            width: '768px',
            height: '1024px',
          },
        },
        desktop: {
          name: 'Desktop',
          styles: {
            width: '1920px',
            height: '1080px',
          },
        },
      },
    },
    // Serbian language specific parameters
    locale: 'sr',
    locales: {
      sr: 'Српски (Cyrillic)',
      'sr-Latn': 'Srpski (Latin)',
      en: 'English',
    },
  },
  globalTypes: {
    locale: {
      description: 'Language locale',
      defaultValue: 'sr',
      toolbar: {
        title: 'Locale',
        icon: 'globe',
        items: [
          { value: 'sr', title: 'Српски (Cyrillic)' },
          { value: 'sr-Latn', title: 'Srpski (Latin)' },
          { value: 'en', title: 'English' },
        ],
        dynamicTitle: true,
      },
    },
  },
  decorators: [
    (Story) => (
      <div lang="sr" dir="ltr">
        <Story />
      </div>
    ),
  ],
}

export default preview