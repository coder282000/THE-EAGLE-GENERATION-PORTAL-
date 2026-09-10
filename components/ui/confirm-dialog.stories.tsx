import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { useState } from 'react';
import { ConfirmDialog } from './confirm-dialog';
import { Button } from '@/components/button';

const meta: Meta<typeof ConfirmDialog> = {
  title: 'UI/ConfirmDialog',
  component: ConfirmDialog,
  parameters: { layout: 'fullscreen' },
  argTypes: {
    tone: { control: 'inline-radio', options: ['default', 'danger', 'success'] },
    loading: { control: 'boolean' },
    confirmDisabled: { control: 'boolean' },
    children: { control: false },
    description: { control: false },
    onConfirm: { control: false },
    onOpenChange: { control: false },
  },
};

export default meta;
type Story = StoryObj<typeof ConfirmDialog>;

function Demo(props: Partial<React.ComponentProps<typeof ConfirmDialog>>) {
  const [open, setOpen] = useState(true);
  return (
    <div className="p-8">
      <Button onClick={() => setOpen(true)}>Open confirm</Button>
      <ConfirmDialog
        open={open}
        onOpenChange={setOpen}
        title="Are you sure?"
        description="This action will be recorded."
        confirmLabel="Confirm"
        onConfirm={() => setOpen(false)}
        {...props}
      />
    </div>
  );
}

export const Playground: Story = { render: () => <Demo /> };

export const Danger: Story = {
  render: () => (
    <Demo
      tone="danger"
      title="Delete 3 applications?"
      description="The applicants will be notified without reason. This action cannot be undone."
      confirmLabel="Delete"
    />
  ),
};

export const Success: Story = {
  render: () => (
    <Demo
      tone="success"
      title="Approve Esther's application?"
      description="A member number will be issued and a welcome email sent."
      confirmLabel="Approve"
    />
  ),
};

export const Loading: Story = {
  render: () => (
    <Demo
      loading
      title="Approving…"
      description="Please wait while we process this action."
    />
  ),
};

export const DisabledConfirm: Story = {
  render: () => (
    <Demo
      tone="danger"
      title="Reject 3 applications?"
      description="Provide an internal reason to enable the Reject button."
      confirmLabel="Reject"
      confirmDisabled
    />
  ),
};

export const WithChildren: Story = {
  render: () => {
    const [open, setOpen] = useState(true);
    const [reason, setReason] = useState('');
    const disabled = reason.trim().length < 10;

    return (
      <div className="p-8">
        <Button onClick={() => setOpen(true)}>Reject</Button>
        <ConfirmDialog
          open={open}
          onOpenChange={setOpen}
          tone="danger"
          title="Reject 5 applications?"
          description="The applicants will be notified without reason. This action cannot be undone."
          confirmLabel="Reject"
          confirmDisabled={disabled}
          onConfirm={() => setOpen(false)}
        >
          <div>
            <label
              htmlFor="reason"
              className="block text-xs font-medium text-fg-muted mb-1"
            >
              Internal reason (not shared)
            </label>
            <textarea
              id="reason"
              rows={3}
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Minimum 10 characters"
              className="w-full rounded-md border border-border bg-paper p-2 text-sm text-fg outline-none focus:shadow-focus"
            />
            <p className="mt-1 text-xs text-fg-subtle">
              {disabled
                ? `${10 - reason.trim().length} more character${10 - reason.trim().length === 1 ? '' : 's'} needed`
                : 'Reason will be stored in the audit log.'}
            </p>
          </div>
        </ConfirmDialog>
      </div>
    );
  },
};