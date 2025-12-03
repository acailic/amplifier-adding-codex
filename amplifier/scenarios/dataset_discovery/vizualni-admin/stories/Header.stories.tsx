import type { Meta, StoryObj } from '@storybook/react'
import Header from '../components/layout/Header'

const meta: Meta<typeof Header> = {
  title: 'Components/Layout/Header',
  component: Header,
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component: 'Header component with Serbian language support and responsive design.',
      },
    },
  },
  argTypes: {
    user: {
      control: 'object',
      description: 'User object with name and role properties',
    },
    notifications: {
      control: 'array',
      description: 'Array of notification objects',
    },
    onMenuToggle: {
      action: 'menu toggled',
      description: 'Callback function when menu is toggled',
    },
    onLanguageChange: {
      action: 'language changed',
      description: 'Callback function when language is changed',
    },
  },
}

export default meta
type Story = StoryObj<typeof meta>

// Default story with Serbian content
export const Default: Story = {
  args: {
    user: {
      name: 'Марко Петровић',
      role: 'Администратор система',
    },
    notifications: [
      {
        id: 1,
        title: 'Нови подаци о демографији',
        message: 'Обновљени подаци за регион Војводине',
        time: 'пре 5 минута',
        read: false,
      },
    ],
  },
  parameters: {
    docs: {
      description: {
        story: 'Default header with Serbian Cyrillic text and user profile.',
      },
    },
  },
}

// Header with notifications
export const WithNotifications: Story = {
  args: {
    user: {
      name: 'Ана Јовановић',
      role: 'Аналитичар података',
    },
    notifications: [
      {
        id: 1,
        title: 'Упозорење о квалитету ваздуха',
        message: 'Повећана концентрација PM2.5 честица',
        time: 'пре 1 сата',
        read: false,
        type: 'warning',
      },
      {
        id: 2,
        title: 'Буџет извештај',
        message: 'Месечни извештај је спреман за преузимање',
        time: 'пре 3 сата',
        read: true,
        type: 'success',
      },
      {
        id: 3,
        title: 'Системска ажурирања',
        message: 'Планирано одржавање у 02:00',
        time: 'пре 6 сати',
        read: true,
        type: 'info',
      },
    ],
  },
  parameters: {
    docs: {
      description: {
        story: 'Header with multiple notifications in Serbian language.',
      },
    },
  },
}

// Mobile responsive view
export const Mobile: Story = {
  args: {
    user: {
      name: 'Петар Николић',
      role: 'Менаџер',
    },
    notifications: [],
  },
  parameters: {
    viewport: {
      defaultViewport: 'mobile',
    },
    docs: {
      description: {
        story: 'Mobile-responsive header with condensed layout.',
      },
    },
  },
}

// Header with Latin script
export const LatinScript: Story = {
  args: {
    user: {
      name: 'Marko Petrović',
      role: 'Administrator sistema',
    },
    notifications: [],
  },
  globals: {
    locale: 'sr-Latn',
  },
  parameters: {
    docs: {
      description: {
        story: 'Header using Serbian Latin script instead of Cyrillic.',
      },
    },
  },
}

// Header with English language
export const English: Story = {
  args: {
    user: {
      name: 'John Smith',
      role: 'System Administrator',
    },
    notifications: [
      {
        id: 1,
        title: 'New demographics data',
        message: 'Updated data for Vojvodina region',
        time: '5 minutes ago',
        read: false,
      },
    ],
  },
  globals: {
    locale: 'en',
  },
  parameters: {
    docs: {
      description: {
        story: 'Header with English language support.',
      },
    },
  },
}

// Dark mode header
export const DarkMode: Story = {
  args: {
    user: {
      name: 'Мирка Петровић',
      role: 'Главни администратор',
    },
    notifications: [],
  },
  parameters: {
    backgrounds: {
      default: 'dark',
    },
    docs: {
      description: {
        story: 'Header optimized for dark theme with proper contrast.',
      },
    },
  },
}

// Header with error state
export const WithError: Story = {
  args: {
    user: {
      name: 'Марко Петровић',
      role: 'Администратор система',
    },
    notifications: [
      {
        id: 1,
        title: 'Грешка у сензору',
        message: 'Сензор за квалитет ваздуха није доступан',
        time: 'пре 30 минута',
        read: false,
        type: 'error',
      },
    ],
  },
  parameters: {
    docs: {
      description: {
        story: 'Header displaying error notifications with proper styling.',
      },
    },
  },
}

// Accessibility focused story
export const Accessibility: Story = {
  args: {
    user: {
      name: 'Марко Петровић',
      role: 'Администратор система',
    },
    notifications: [],
  },
  parameters: {
    docs: {
      description: {
        story: 'Header optimized for accessibility with proper ARIA labels and keyboard navigation support.',
      },
    },
  },
  play: async ({ canvasElement }: { canvasElement: HTMLElement }) => {
    // Test keyboard navigation
    const menuButton = canvasElement.querySelector('[data-testid="menu-button"]') as HTMLElement
    if (menuButton) {
      menuButton.focus()
      expect(document.activeElement).toBe(menuButton)
    }

    // Test ARIA labels
    const navigation = canvasElement.querySelector('[role="navigation"]')
    expect(navigation).toHaveAttribute('aria-label')
  },
}