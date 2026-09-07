'use client';

import { useParams, useRouter } from 'next/navigation';
import { useState } from 'react';
import { Card } from '@/components/card';
import { Button } from '@/components/button';
import { TextInput } from '@/components/input';
import { Textarea } from '@/components/textarea';
import { mockCircles } from '@/components/mock/data';

export default function RaiseDisputePage() {
  const { id } = useParams();
  const router = useRouter();
  const circle = mockCircles.find((c) => c.id === id);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);

  if (!circle) {
    return <div className="text-center py-12 text-gray-500">Circle not found.</div>;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    await new Promise((resolve) => setTimeout(resolve, 1500));
    setLoading(false);
    router.push(`/savings/circles/${id}`);
  };

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold text-ink mb-6">Raise a Dispute</h1>
      <Card className="p-6">
        <form onSubmit={handleSubmit} className="space-y-4">
          <TextInput
            id="dispute-title"
            label="Title"
            required
            value={title}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              setTitle(e.target.value)
            }
          />
          <Textarea
            id="dispute-description"
            label="Description"
            required
            rows={5}
            value={description}
            onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
              setDescription(e.target.value)
            }
          />
          <div className="flex gap-3">
            <Button
              variant="secondary"  // changed from "clay" to "secondary" (or "warning" if supported)
              type="submit"
              disabled={loading}
            >
              {loading ? 'Submitting...' : 'Submit Dispute'}
            </Button>
            <Button
              variant="outline"
              type="button"
              onClick={() => router.back()}
            >
              Cancel
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}