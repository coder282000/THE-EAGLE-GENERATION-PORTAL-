'use client';

import { useState, useMemo } from 'react';
import { CircleCard } from '@/components/savings/CircleCard';
import { TextInput } from '@/components/input';
import { Select } from '@/components/select';
import { mockCircles } from '@/components/mock/data';

export default function CirclesBrowsePage() {
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');

  const filteredCircles = useMemo(() => {
    let result = mockCircles;
    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter((c) =>
        c.name.toLowerCase().includes(q) ||
        c.description.toLowerCase().includes(q)
      );
    }
    if (typeFilter !== 'ALL') {
      result = result.filter((c) => c.type === typeFilter);
    }
    if (statusFilter !== 'ALL') {
      result = result.filter((c) => c.status === statusFilter);
    }
    return result;
  }, [search, typeFilter, statusFilter]);

  const handleJoin = (circleId: string) => {
    alert(`You requested to join circle ${circleId}. (Mock)`);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-ink">Browse Savings Circles</h1>
        <span className="text-sm text-gray-500">{filteredCircles.length} circles</span>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <TextInput
          id="search-circles"
          label="Search circles"
          placeholder="Search circles..."
          value={search}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearch(e.target.value)}
          className="flex-1"
        />
        <Select
          id="type-filter"
          label="Type"
          value={typeFilter}
          onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setTypeFilter(e.target.value)}
          options={[
            { value: 'ALL', label: 'All Types' },
            { value: 'ROTATING', label: 'Rotating' },
            { value: 'INVESTMENT', label: 'Investment' },
            { value: 'GOAL', label: 'Goal' },
          ]}
          className="w-full sm:w-40"
        />
        <Select
          id="status-filter"
          label="Status"
          value={statusFilter}
          onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setStatusFilter(e.target.value)}
          options={[
            { value: 'ALL', label: 'All Status' },
            { value: 'ACTIVE', label: 'Active' },
            { value: 'PAUSED', label: 'Paused' },
            { value: 'COMPLETED', label: 'Completed' },
          ]}
          className="w-full sm:w-40"
        />
      </div>

      {filteredCircles.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          <p className="text-lg">No circles found.</p>
          <p className="text-sm">Try adjusting your filters or create a new circle.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredCircles.map((circle) => (
            <CircleCard
              key={circle.id}
              circle={circle}
              isMember={circle.memberIds.includes('1')}
              onJoin={handleJoin}
            />
          ))}
        </div>
      )}
    </div>
  );
}