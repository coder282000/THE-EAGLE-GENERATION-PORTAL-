import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { useState } from 'react';
import { Pagination } from './pagination';

const meta: Meta<typeof Pagination> = {
  title: 'UI/Pagination',
  component: Pagination,
  parameters: { layout: 'centered' },
};
export default meta;
type Story = StoryObj<typeof Pagination>;

export const Short: Story = {
  render: () => {
    const [page, setPage] = useState(1);
    return (
      <div className="w-[500px] bg-paper-elevated rounded-lg border border-border">
        <Pagination currentPage={page} totalPages={3} onPageChange={setPage} />
      </div>
    );
  },
};

export const Long: Story = {
  render: () => {
    const [page, setPage] = useState(6);
    return (
      <div className="w-[500px] bg-paper-elevated rounded-lg border border-border">
        <Pagination currentPage={page} totalPages={24} onPageChange={setPage} pageSize={25} totalItems={597} />
      </div>
    );
  },
};

export const Mobile: Story = {
  render: () => {
    const [page, setPage] = useState(3);
    return (
      <div className="w-[360px] bg-paper-elevated rounded-lg border border-border">
        <Pagination currentPage={page} totalPages={12} onPageChange={setPage} pageSize={10} totalItems={115} />
      </div>
    );
  },
};