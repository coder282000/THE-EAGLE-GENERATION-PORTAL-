import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { useState } from 'react';
import { Drawer } from './drawer';
import { Button } from '@/components/button';

const meta: Meta<typeof Drawer> = {
  title: 'UI/Drawer',
  component: Drawer,
  parameters: { layout: 'fullscreen' },
  argTypes: {
    side: { control: 'inline-radio', options: ['left', 'right', 'bottom'] },
    size: { control: 'inline-radio', options: ['sm', 'md', 'lg', 'auto'] },
    open: { control: 'boolean' },
  },
};

export default meta;
type Story = StoryObj<typeof Drawer>;

function Demo(props: Partial<React.ComponentProps<typeof Drawer>>) {
  const [open, setOpen] = useState(true);
  return (
    <div className="p-8">
      <Button onClick={() => setOpen(true)}>Open drawer</Button>
      <Drawer
        open={open}
        onOpenChange={setOpen}
        title="Filters"
        description="Narrow down the results."
        footer={
          <>
            <Button variant="outline" onClick={() => setOpen(false)}>Clear</Button>
            <Button variant="primary" onClick={() => setOpen(false)}>Apply</Button>
          </>
        }
        {...props}
      >
        <p className="text-sm text-fg">Drawer body content.</p>
      </Drawer>
    </div>
  );
}

export const Playground: Story = { render: () => <Demo /> };
export const Right: Story = { render: () => <Demo side="right" /> };
export const Left: Story = { render: () => <Demo side="left" /> };
export const Bottom: Story = { render: () => <Demo side="bottom" /> };
export const Small: Story = { render: () => <Demo size="sm" /> };
export const Large: Story = { render: () => <Demo size="lg" /> };
export const WithoutFooter: Story = { render: () => <Demo footer={undefined} /> };
export const WithHeaderAction: Story = {
  render: () => <Demo headerAction={<Button variant="ghost" size="sm">Edit</Button>} />,
};
export const LongBody: Story = {
  render: () => {
    const [open, setOpen] = useState(true);
    return (
      <div className="p-8">
        <Button onClick={() => setOpen(true)}>Open</Button>
        <Drawer open={open} onOpenChange={setOpen} title="Scrollable drawer" footer={<Button onClick={() => setOpen(false)}>Close</Button>}>
          <div className="space-y-4">
            {Array.from({ length: 40 }, (_, i) => <p key={i} className="text-sm text-fg">Paragraph {i + 1}.</p>)}
          </div>
        </Drawer>
      </div>
    );
  },
};