import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { useState } from 'react';
import { SearchInput } from './search-input';

const meta: Meta<typeof SearchInput> = {
  title: 'UI/SearchInput',
  component: SearchInput,
  parameters: { layout: 'centered' },
};

export default meta;
type Story = StoryObj<typeof SearchInput>;

function Demo(props: Partial<React.ComponentProps<typeof SearchInput>>) {
  const [value, setValue] = useState('');
  return (
    <div className="w-[400px]">
      <SearchInput value={value} onValueChange={setValue} {...props} />
      <p className="mt-2 text-xs text-fg-subtle">Value: {value || '(empty)'}</p>
    </div>
  );
}

export const Playground: Story = { render: () => <Demo /> };

export const WithValue: Story = {
  render: () => {
    const [value, setValue] = useState('Esther');
    return (
      <div className="w-[400px]">
        <SearchInput value={value} onValueChange={setValue} />
      </div>
    );
  },
};

export const Loading: Story = { render: () => <Demo loading /> };