import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { ApplicationStatusStepper } from './application-status-stepper';
import type { ApplicationStatus } from '@/components/mock/data';

const meta: Meta<typeof ApplicationStatusStepper> = {
  title: 'Applications/ApplicationStatusStepper',
  component: ApplicationStatusStepper,
  parameters: { layout: 'centered' },
  argTypes: {
    status: {
      control: 'select',
      options: [
        'DRAFT',
        'SUBMITTED',
        'UNDER_REVIEW',
        'INTERVIEW_SCHEDULED',
        'INTERVIEWED',
        'APPROVED',
        'REJECTED',
        'WITHDRAWN',
        'LAPSED',
      ],
    },
    reopened: { control: 'boolean' },
  },
  decorators: [
    (Story) => (
      <div className="w-[640px] p-6">
        <Story />
      </div>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof ApplicationStatusStepper>;

export const Playground: Story = {
  args: { status: 'UNDER_REVIEW' },
};

export const Submitted: Story = { args: { status: 'SUBMITTED' } };
export const UnderReview: Story = { args: { status: 'UNDER_REVIEW' } };
export const InterviewScheduled: Story = {
  args: { status: 'INTERVIEW_SCHEDULED' },
};
export const Interviewed: Story = { args: { status: 'INTERVIEWED' } };

export const Approved: Story = { args: { status: 'APPROVED' } };
export const Rejected: Story = { args: { status: 'REJECTED' } };
export const Withdrawn: Story = { args: { status: 'WITHDRAWN' } };
export const Lapsed: Story = { args: { status: 'LAPSED' } };

export const Reopened: Story = {
  args: { status: 'UNDER_REVIEW', reopened: true },
  parameters: {
    docs: {
      description: {
        story:
          'A rejected application that a SUPER_ADMIN reopened within 30 days.',
      },
    },
  },
};

export const AllStates: Story = {
  render: () => (
    <div className="flex flex-col gap-6 w-[640px] p-6">
      {(
        [
          'SUBMITTED',
          'UNDER_REVIEW',
          'INTERVIEW_SCHEDULED',
          'INTERVIEWED',
          'APPROVED',
          'REJECTED',
          'WITHDRAWN',
          'LAPSED',
        ] as ApplicationStatus[]
      ).map((status) => (
        <div key={status} className="space-y-2">
          <p className="text-[10px] uppercase tracking-wider text-fg-subtle font-semibold">
            {status}
          </p>
          <ApplicationStatusStepper status={status} />
        </div>
      ))}
      <div className="space-y-2">
        <p className="text-[10px] uppercase tracking-wider text-fg-subtle font-semibold">
          UNDER_REVIEW (reopened)
        </p>
        <ApplicationStatusStepper status="UNDER_REVIEW" reopened />
      </div>
    </div>
  ),
};