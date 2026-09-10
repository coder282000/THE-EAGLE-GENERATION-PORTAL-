import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { ToastProvider, useToast } from './toast';
import { Button } from '@/components/button';

const meta: Meta = {
  title: 'UI/Toast',
  parameters: { layout: 'centered' },
};
export default meta;

function Demo({ variant }: { variant?: 'default' | 'success' | 'danger' }) {
  const { toast } = useToast();
  return (
    <div className="flex gap-3">
      <Button
        onClick={() =>
          toast({
            title: 'Saved',
            description: 'Your changes have been recorded.',
            variant,
          })
        }
      >
        Show toast
      </Button>
      <Button
        variant="secondary"
        onClick={() =>
          toast({
            title: 'Export ready',
            description: 'Click to download the CSV.',
            action: { label: 'Download', onClick: () => {} },
          })
        }
      >
        With action
      </Button>
    </div>
  );
}

function Wrapper(props: { variant?: 'default' | 'success' | 'danger' }) {
  return (
    <ToastProvider>
      <Demo {...props} />
    </ToastProvider>
  );
}

export const Default: StoryObj = { render: () => <Wrapper /> };
export const Success: StoryObj = { render: () => <Wrapper variant="success" /> };
export const Danger: StoryObj = { render: () => <Wrapper variant="danger" /> };