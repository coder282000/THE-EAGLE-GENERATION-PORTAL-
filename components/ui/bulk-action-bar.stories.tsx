import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { useState } from 'react';
import { BulkActionBar } from './bulk-action-bar';

const meta: Meta<typeof BulkActionBar> = {
  title: 'UI/BulkActionBar',
  component: BulkActionBar,
  parameters: { layout: 'centered' },
};
export default meta;
type Story = StoryObj<typeof BulkActionBar>;

export const Default: Story = {
  render: () => {
    const [count, setCount] = useState(3);
    return (
      <div className="w-[640px] space-y-3">
        <button className="text-xs text-sky-600" onClick={() => setCount(3)}>Reset to 3</button>
        <BulkActionBar
          selectedCount={count}
          onClear={() => setCount(0)}
          itemNoun="application"
          actions={[
            { label: 'Schedule interview', onClick: () => {} },
            { label: 'Approve', variant: 'success', onClick: () => {} },
            { label: 'Reject', variant: 'danger', onClick: () => {} },
          ]}
        />
      </div>
    );
  },
};

export const Single: Story = {
  render: () => (
    <div className="w-[640px]">
      <BulkActionBar
        selectedCount={1}
        onClear={() => {}}
        itemNoun="application"
        actions={[{ label: 'Approve', variant: 'success', onClick: () => {} }]}
      />
    </div>
  ),
};