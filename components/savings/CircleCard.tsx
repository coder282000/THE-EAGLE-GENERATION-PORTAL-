import Link from 'next/link';
import { Card } from '@/components/card';
import { Button } from '@/components/button';
import { AvatarGroup } from '@/components/avatar-group'; // we'll create this or use a simple list
import { PillarTag } from '@/components/pillartag';
import { formatCurrency } from '@/lib/utils';
import { Circle } from '@/components/mock/data';

interface CircleCardProps {
  circle: Circle;
  isMember?: boolean;
  onJoin?: (id: string) => void;
}

export function CircleCard({ circle, isMember = false, onJoin }: CircleCardProps) {
  const statusColor = {
    ACTIVE: 'bg-emerald-100 text-emerald-800',
    PAUSED: 'bg-amber-100 text-amber-800',
    COMPLETED: 'bg-blue-100 text-blue-800',
    DISBANDED: 'bg-gray-100 text-gray-800',
  }[circle.status];

  return (
    <Card className="p-4 hover:shadow-md transition-shadow">
      <div className="flex justify-between items-start">
        <div>
          <h3 className="text-lg font-semibold text-ink">{circle.name}</h3>
          <p className="text-sm text-gray-600 mt-1">{circle.description}</p>
        </div>
        <span className={`text-xs font-medium px-2 py-1 rounded-full ${statusColor}`}>
          {circle.status}
        </span>
      </div>

      <div className="mt-3 grid grid-cols-2 gap-2 text-sm">
        <div>
          <span className="text-gray-500">Contribution</span>
          <p className="font-medium">{formatCurrency(circle.contributionAmount, circle.currency)}</p>
        </div>
        <div>
          <span className="text-gray-500">Frequency</span>
          <p className="font-medium capitalize">{circle.frequency.toLowerCase()}</p>
        </div>
        <div>
          <span className="text-gray-500">Members</span>
          <p className="font-medium">{circle.memberCount}</p>
        </div>
        <div>
          <span className="text-gray-500">Total Balance</span>
          <p className="font-medium">{formatCurrency(circle.totalBalance, circle.currency)}</p>
        </div>
      </div>

      <div className="mt-3 flex items-center justify-between">
        <div className="flex -space-x-2">
          {circle.memberIds.slice(0, 3).map((id) => (
            <div
              key={id}
              className="w-6 h-6 rounded-full bg-sky-200 border-2 border-white flex items-center justify-center text-xs font-medium text-sky-700"
            >
              {id.slice(0, 1).toUpperCase()}
            </div>
          ))}
          {circle.memberCount && circle.memberCount > 3 && (
            <div className="w-6 h-6 rounded-full bg-gray-200 border-2 border-white flex items-center justify-center text-xs font-medium text-gray-600">
              +{circle.memberCount - 3}
            </div>
          )}
        </div>
        <div className="flex gap-2">
          <Link href={`/savings/circles/${circle.id}`}>
            <Button variant="outline" size="sm">View</Button>
          </Link>
          {!isMember && onJoin && (
            <Button variant="sky" size="sm" onClick={() => onJoin(circle.id)}>Join</Button>
          )}
          {isMember && circle.leaderId === '3' && ( // mock current user as leader
            <Link href={`/savings/circles/${circle.id}/manage`}>
              <Button variant="clay" size="sm">Manage</Button>
            </Link>
          )}
        </div>
      </div>
    </Card>
  );
}