import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { Button } from './button';

const meta: Meta<typeof Button> = {
  title: 'UI/Button',
  component: Button,
  parameters: { layout: 'centered' },
  argTypes: {
    variant: {
      control: 'select',
      options: ['primary', 'secondary', 'outline', 'ghost', 'destructive', 'success', 'clay', 'danger'],
    },
    size: { control: 'inline-radio', options: ['sm', 'md', 'lg', 'icon'] },
    fullWidth: { control: 'boolean' },
    loading: { control: 'boolean' },
    disabled: { control: 'boolean' },
    asChild: { table: { disable: true } },
    leadingIcon: { control: false },
    trailingIcon: { control: false },
  },
  args: {
    children: 'Button',
    variant: 'primary',
    size: 'md',
  },
};

export default meta;
type Story = StoryObj<typeof Button>;

export const Playground: Story = {};

export const AllVariants: Story = {
  render: () => (
    <div className="flex flex-wrap gap-3 items-center p-4">
      <Button variant="primary">Primary</Button>
      <Button variant="secondary">Secondary</Button>
      <Button variant="outline">Outline</Button>
      <Button variant="ghost">Ghost</Button>
      <Button variant="destructive">Destructive</Button>
      <Button variant="success">Success</Button>
      <Button variant="clay">Clay</Button>
    </div>
  ),
};

export const AllSizes: Story = {
  render: () => (
    <div className="flex flex-wrap gap-3 items-center p-4">
      <Button size="sm">Small</Button>
      <Button size="md">Medium</Button>
      <Button size="lg">Large</Button>
      <Button size="icon" aria-label="Settings">⚙</Button>
    </div>
  ),
};

export const Loading: Story = {
  render: () => (
    <div className="flex flex-wrap gap-3 items-center p-4">
      <Button loading>Saving…</Button>
      <Button variant="success" loading>Approving</Button>
      <Button variant="destructive" loading>Deleting</Button>
    </div>
  ),
};

export const Disabled: Story = {
  render: () => (
    <div className="flex flex-wrap gap-3 items-center p-4">
      <Button disabled>Primary</Button>
      <Button variant="secondary" disabled>Secondary</Button>
      <Button variant="outline" disabled>Outline</Button>
      <Button variant="destructive" disabled>Destructive</Button>
    </div>
  ),
};

export const WithIcons: Story = {
  render: () => (
    <div className="flex flex-wrap gap-3 items-center p-4">
      <Button leadingIcon={<span aria-hidden>＋</span>}>Create</Button>
      <Button variant="secondary" trailingIcon={<span aria-hidden>→</span>}>Continue</Button>
      <Button variant="outline" leadingIcon={<span aria-hidden>⬇</span>} trailingIcon={<span aria-hidden>↗</span>}>
        Export
      </Button>
      <Button variant="ghost" size="icon" aria-label="Close">
        <span aria-hidden>✕</span>
      </Button>
    </div>
  ),
};

export const FullWidth: Story = {
  render: () => (
    <div className="w-[320px] p-4">
      <Button fullWidth>Full width button</Button>
    </div>
  ),
};

export const FocusRing: Story = {
  render: () => (
    <div className="flex gap-3 items-center p-4">
      <Button className="shadow-focus">Focused by force</Button>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'The `shadow-focus` utility renders the double focus ring. Keyboard navigation applies it automatically via `:focus-visible`.',
      },
    },
  },
};