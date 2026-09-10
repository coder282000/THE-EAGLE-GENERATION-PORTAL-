import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { useState } from 'react';
import { CommandPalette } from './command-palette';
import { Button } from '@/components/button';

const meta: Meta<typeof CommandPalette> = {
  title: 'UI/CommandPalette',
  component: CommandPalette,
  parameters: { layout: 'fullscreen' },
};

export default meta;
type Story = StoryObj<typeof CommandPalette>;

const items = [
  { id: '1', label: 'Go to Applications', group: 'Navigate', keywords: ['queue', 'review'], onSelect: () => {} },
  { id: '2', label: 'Go to Members', group: 'Navigate', keywords: ['directory'], onSelect: () => {} },
  { id: '3', label: 'New member', group: 'Actions', keywords: ['create'], onSelect: () => {} },
  { id: '4', label: 'Export applications', group: 'Actions', onSelect: () => {} },
  { id: '5', label: 'Esther W.', group: 'Search', keywords: ['ku'], onSelect: () => {} },
  { id: '6', label: 'Daniel M.', group: 'Search', keywords: ['uon'], onSelect: () => {} },
];

function Demo(props: Partial<React.ComponentProps<typeof CommandPalette>>) {
  const [open, setOpen] = useState(true);
  return (
    <div className="p-8">
      <Button onClick={() => setOpen(true)}>Open palette (⌘K)</Button>
      <CommandPalette open={open} onOpenChange={setOpen} items={items} {...props} />
    </div>
  );
}

export const Playground: Story = { render: () => <Demo /> };
export const Empty: Story = { render: () => <Demo items={[]} emptyMessage="Nothing matches your search." /> };