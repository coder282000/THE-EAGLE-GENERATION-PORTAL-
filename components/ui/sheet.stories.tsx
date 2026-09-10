import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { useState } from 'react';
import { Sheet } from './sheet';
import { Button } from '@/components/button';

const meta: Meta<typeof Sheet> = {
  title: 'UI/Sheet',
  component: Sheet,
  parameters: { layout: 'fullscreen' },
  argTypes: {
    width: { control: { type: 'number', min: 320, max: 800, step: 20 } },
  },
};

export default meta;
type Story = StoryObj<typeof Sheet>;

function Demo(props: Partial<React.ComponentProps<typeof Sheet>>) {
  const [open, setOpen] = useState(true);
  return (
    <div className="flex h-screen bg-paper">
      <main className="flex-1 min-w-0 overflow-y-auto p-8">
        <h1 className="text-2xl font-semibold text-fg mb-4">Queue</h1>
        <p className="text-sm text-fg-muted mb-4">Main content. Sheet pushes layout when open.</p>
        <Button onClick={() => setOpen(true)}>Open detail</Button>
      </main>
      <Sheet
        open={open}
        onClose={() => setOpen(false)}
        title="Esther W."
        description="APP-26-100004"
        footer={
          <>
            <Button variant="outline" onClick={() => setOpen(false)}>Close</Button>
            <Button variant="primary">Take action</Button>
          </>
        }
        {...props}
      >
        <p className="text-sm text-fg">Detail content.</p>
      </Sheet>
    </div>
  );
}

export const Playground: Story = { render: () => <Demo /> };
export const Narrow: Story = { render: () => <Demo width={360} /> };
export const Wide: Story = { render: () => <Demo width={720} /> };
export const WithoutFooter: Story = { render: () => <Demo footer={undefined} /> };
export const WithHeaderAction: Story = {
  render: () => <Demo headerAction={<Button variant="ghost" size="sm">Open full</Button>} />,
};
export const Closed: Story = {
  render: () => {
    const [open, setOpen] = useState(false);
    return (
      <div className="flex h-screen bg-paper">
        <main className="flex-1 min-w-0 overflow-y-auto p-8">
          <h1 className="text-2xl font-semibold text-fg mb-4">Queue</h1>
          <Button onClick={() => setOpen(true)}>Open detail</Button>
        </main>
        <Sheet open={open} onClose={() => setOpen(false)} title="Detail" footer={<Button onClick={() => setOpen(false)}>Close</Button>}>
          <p className="text-sm text-fg">Detail content.</p>
        </Sheet>
      </div>
    );
  },
};