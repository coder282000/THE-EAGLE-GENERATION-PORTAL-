import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { useState } from 'react';
import { Input } from './input';
import { FormField } from './form-field';

const meta: Meta<typeof Input> = {
  title: 'UI/Input',
  component: Input,
  parameters: { layout: 'centered' },
  argTypes: {
    state: { control: 'inline-radio', options: ['default', 'error', 'success'] },
    numeric: { control: 'boolean' },
    disabled: { control: 'boolean' },
    readOnly: { control: 'boolean' },
  },
};

export default meta;
type Story = StoryObj<typeof Input>;

export const Playground: Story = {
  args: { placeholder: 'Enter text…' },
  render: (args) => (
    <div className="w-[320px]">
      <Input {...args} />
    </div>
  ),
};

export const States: Story = {
  render: () => (
    <div className="w-[360px] space-y-3">
      <Input placeholder="Default" />
      <Input placeholder="Error" state="error" defaultValue="invalid@" />
      <Input placeholder="Success" state="success" defaultValue="valid@example.com" />
      <Input placeholder="Disabled" disabled />
      <Input placeholder="Read-only" readOnly defaultValue="Cannot change" />
    </div>
  ),
};

export const Numeric: Story = {
  render: () => (
    <div className="w-[360px] space-y-3">
      <Input numeric placeholder="1000" />
      <Input numeric placeholder="+254 712 345 678" />
      <Input numeric placeholder="000 000" />
    </div>
  ),
};

export const WithIcons: Story = {
  render: () => (
    <div className="w-[360px] space-y-3">
      <Input placeholder="Search" leadingIcon={<span aria-hidden>🔍</span>} />
      <Input placeholder="Email" leadingIcon={<span aria-hidden>@</span>} />
      <Input
        placeholder="Amount"
        numeric
        trailingIcon={<span aria-hidden>KES</span>}
      />
    </div>
  ),
};

export const InFormField: Story = {
  render: () => {
    const [value, setValue] = useState('');
    const [touched, setTouched] = useState(false);
    const error = touched && value.length > 0 && !value.includes('@') ? 'Enter a valid email address' : undefined;

    return (
      <div className="w-[360px] space-y-4">
        <FormField
          label="Email address"
          hint="We will send your application confirmation here"
          error={error}
          required
        >
          {(controlProps) => (
            <Input
              {...controlProps}
              type="email"
              placeholder="you@example.com"
              value={value}
              onChange={(e) => setValue(e.target.value)}
              onBlur={() => setTouched(true)}
              state={error ? 'error' : 'default'}
            />
          )}
        </FormField>
      </div>
    );
  },
};