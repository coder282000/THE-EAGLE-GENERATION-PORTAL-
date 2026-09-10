import type { Preview } from '@storybook/nextjs-vite';
import '../styles/tokens.css';

const preview: Preview = {
  parameters: {
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
      expanded: true,
    },
    backgrounds: { disable: true },
    layout: 'fullscreen',
    viewport: {
      viewports: {
        xs: { name: 'xs (360px)',  styles: { width: '360px',  height: '800px' } },
        sm: { name: 'sm (640px)',  styles: { width: '640px',  height: '900px' } },
        md: { name: 'md (768px)',  styles: { width: '768px',  height: '1024px' } },
        lg: { name: 'lg (1024px)', styles: { width: '1024px', height: '768px' } },
        xl: { name: 'xl (1280px)', styles: { width: '1280px', height: '800px' } },
      },
    },
    a11y: {
      config: {},
      options: {
        runOnly: {
          type: 'tag',
          values: ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'],
        },
      },
    },
  },

  globalTypes: {
    theme: {
      name: 'Theme',
      description: 'Light or dark mode',
      defaultValue: 'light',
      toolbar: {
        icon: 'paintbrush',
        items: [
          { value: 'light', title: 'Light' },
          { value: 'dark',  title: 'Dark'  },
        ],
        dynamicTitle: true,
      },
    },
  },

  decorators: [
    (Story, context) => {
      const theme = context.globals.theme as 'light' | 'dark';
      return (
        <div className={theme === 'dark' ? 'dark' : ''} data-theme={theme}>
          <div className="bg-paper text-fg font-body antialiased p-6 min-h-screen">
            <Story />
          </div>
        </div>
      );
    },
  ],
};

export default preview;
