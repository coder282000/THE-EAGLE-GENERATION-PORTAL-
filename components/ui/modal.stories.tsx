import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { useState } from 'react';
import { Modal } from './modal';
import { Button } from '@/components/button';

const meta: Meta<typeof Modal> = {
  title: 'UI/Modal',
  component: Modal,
  parameters: { layout: 'fullscreen' },
  argTypes: {
    size: { control: 'inline-radio', options: ['sm', 'md', 'lg', 'xl', 'full'] },
    preventClose: { control: 'boolean' },
    hideCloseButton: { control: 'boolean' },
    open: { control: 'boolean' },
    footer: { control: false },
    children: { control: false },
  },
};

export default meta;
type Story = StoryObj<typeof Modal>;

function ModalDemo(props: Partial<React.ComponentProps<typeof Modal>>) {
  const [open, setOpen] = useState(true);
  return (
    <div className="p-8">
      <Button onClick={() => setOpen(true)}>Open modal</Button>
      <Modal
        open={open}
        onOpenChange={setOpen}
        title="Modal title"
        description="A short description explaining what this dialog is for."
        footer={
          <>
            <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
            <Button variant="primary" onClick={() => setOpen(false)}>Confirm</Button>
          </>
        }
        {...props}
      >
        <p className="text-sm text-fg">
          Modal body content goes here. This is inside a scrollable region when
          content exceeds viewport height.
        </p>
      </Modal>
    </div>
  );
}

export const Playground: Story = {
  render: () => <ModalDemo />,
};

export const Small: Story = {
  render: () => <ModalDemo size="sm" />,
};

export const Large: Story = {
  render: () => <ModalDemo size="lg" />,
};

export const ExtraLarge: Story = {
  render: () => <ModalDemo size="xl" />,
};

export const FullWidth: Story = {
  render: () => <ModalDemo size="full" />,
};

export const WithoutDescription: Story = {
  render: () => <ModalDemo description={undefined} />,
};

export const WithoutFooter: Story = {
  render: () => <ModalDemo footer={undefined} />,
};

export const WithoutCloseButton: Story = {
  render: () => <ModalDemo hideCloseButton />,
};

export const PreventClose: Story = {
  render: () => <ModalDemo preventClose />,
  parameters: {
    docs: {
      description: {
        story: 'Esc and backdrop click are disabled. Use when a destructive action is in-flight.',
      },
    },
  },
};

export const LongBody: Story = {
  render: () => {
    const [open, setOpen] = useState(true);
    return (
      <div className="p-8">
        <Button onClick={() => setOpen(true)}>Open</Button>
        <Modal
          open={open}
          onOpenChange={setOpen}
          title="Scrollable content"
          description="Body scrolls; header and footer stay pinned."
          size="md"
          footer={<Button onClick={() => setOpen(false)}>Close</Button>}
        >
          <div className="space-y-4">
            {Array.from({ length: 40 }, (_, i) => (
              <p key={i} className="text-sm text-fg">
                Paragraph {i + 1}. Lorem ipsum dolor sit amet, consectetur adipiscing elit.
              </p>
            ))}
          </div>
        </Modal>
      </div>
    );
  },
};