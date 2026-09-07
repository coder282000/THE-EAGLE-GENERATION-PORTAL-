'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card } from '@/components/card';
import { Button } from '@/components/button';
import { TextInput } from '@/components/input';
import { Textarea } from '@/components/textarea';
import { Select } from '@/components/select';

export default function CreateCirclePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    name: '',
    description: '',
    type: 'ROTATING' as 'ROTATING' | 'INVESTMENT' | 'GOAL',
    contributionAmount: 5000,
    frequency: 'MONTHLY' as 'WEEKLY' | 'MONTHLY' | 'QUARTERLY',
    payoutOrder: 'ROTATIONAL' as 'ROTATIONAL' | 'RANDOM' | 'BIDDING',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    // Mock API call
    await new Promise((resolve) => setTimeout(resolve, 1500));
    setLoading(false);
    router.push('/savings/circles');
  };

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold text-ink mb-6">Create a Savings Circle</h1>
      <Card className="p-6">
        <form onSubmit={handleSubmit} className="space-y-4">
          <TextInput
            id="circle-name"
            label="Circle Name"
            required
            value={form.name}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              setForm({ ...form, name: e.target.value })
            }
          />
          <Textarea
            id="circle-description"
            label="Description"
            value={form.description}
            onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
              setForm({ ...form, description: e.target.value })
            }
            rows={3}
          />
          <Select
            id="circle-type"
            label="Type"
            value={form.type}
            onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
              setForm({ ...form, type: e.target.value as 'ROTATING' | 'INVESTMENT' | 'GOAL' })
            }
            options={[
              { value: 'ROTATING', label: 'Rotating (each member takes turns)' },
              { value: 'INVESTMENT', label: 'Investment (pooled for growth)' },
              { value: 'GOAL', label: 'Goal (saving for a specific purpose)' },
            ]}
          />
          <TextInput
            id="contribution-amount"
            label="Contribution Amount (KES)"
            type="number"
            required
            value={form.contributionAmount}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              setForm({ ...form, contributionAmount: Number(e.target.value) })
            }
          />
          <Select
            id="frequency"
            label="Frequency"
            value={form.frequency}
            onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
              setForm({ ...form, frequency: e.target.value as 'WEEKLY' | 'MONTHLY' | 'QUARTERLY' })
            }
            options={[
              { value: 'WEEKLY', label: 'Weekly' },
              { value: 'MONTHLY', label: 'Monthly' },
              { value: 'QUARTERLY', label: 'Quarterly' },
            ]}
          />
          <Select
            id="payout-order"
            label="Payout Order"
            value={form.payoutOrder}
            onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
              setForm({ ...form, payoutOrder: e.target.value as 'ROTATIONAL' | 'RANDOM' | 'BIDDING' })
            }
            options={[
              { value: 'ROTATIONAL', label: 'Rotational (take turns)' },
              { value: 'RANDOM', label: 'Random (selected each cycle)' },
              { value: 'BIDDING', label: 'Bidding (members bid)' },
            ]}
          />
          <div className="flex gap-3 pt-4">
            <Button
              variant="primary"
              type="submit"
              disabled={loading}
            >
              {loading ? 'Creating...' : 'Create Circle'}
            </Button>
            <Button variant="outline" type="button" onClick={() => router.back()}>
              Cancel
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}