'use client';

import { useParams, useRouter } from 'next/navigation';
import { useState } from 'react';
import { Card } from '@/components/card';
import { Button } from '@/components/button';
import { TextInput } from '@/components/input';
import { Select } from '@/components/select';
import { mockCircles } from '@/components/mock/data';

export default function CircleManagementPage() {
  const { id } = useParams();
  const router = useRouter();
  const circle = mockCircles.find((c) => c.id === id);
  const [loading, setLoading] = useState(false);

  if (!circle) {
    return <div className="text-center py-12 text-ink/50">Circle not found.</div>;
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    await new Promise((resolve) => setTimeout(resolve, 1500));
    setLoading(false);
    router.push(`/savings/circles/${id}`);
  };

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold text-ink mb-6">Manage Circle: {circle.name}</h1>
      <Card className="p-6">
        <form onSubmit={handleSave} className="space-y-4">
          <TextInput
            id="circle-name"
            label="Name"
            defaultValue={circle.name}
          />
          <TextInput
            id="circle-description"
            label="Description"
            defaultValue={circle.description}
          />
          <Select
            id="circle-status"
            label="Status"
            defaultValue={circle.status}
            options={[
              { value: 'ACTIVE', label: 'Active' },
              { value: 'PAUSED', label: 'Paused' },
              { value: 'COMPLETED', label: 'Completed' },
              { value: 'DISBANDED', label: 'Disbanded' },
            ]}
          />
          <div className="pt-2">
            <h4 className="font-medium text-ink">Members</h4>
            <ul className="mt-2 space-y-1 text-sm">
              {circle.memberIds.map((memberId) => (
                <li key={memberId} className="flex justify-between items-center bg-paper px-3 py-2 rounded">
                  <span>Member {memberId}</span>
                  {memberId === circle.leaderId && (
                    <span className="text-xs bg-clay/20 text-clay px-2 py-0.5 rounded">Leader</span>
                  )}
                </li>
              ))}
            </ul>
          </div>
          <div className="flex gap-3 pt-4">
            <Button
              variant="primary"
              type="submit"
              disabled={loading}
            >
              {loading ? 'Saving...' : 'Save Changes'}
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