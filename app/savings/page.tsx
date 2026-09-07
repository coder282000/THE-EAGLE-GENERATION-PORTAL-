import Link from 'next/link';
import { Card } from '@/components/card';
import { Button } from '@/components/button';
import { formatCurrency } from '@/lib/utils';
import { mockCircles, mockContributions, mockPayouts } from '@/components/mock/data';

export default function SavingsOverviewPage() {
  // For a real implementation, we'd get the current user's circles
  const userCircles = mockCircles.filter((c) => c.memberIds.includes('1'));
  const totalBalance = userCircles.reduce((sum, c) => sum + c.totalBalance, 0);
  const pendingContributions = mockContributions.filter((c) => c.status === 'PENDING' && c.memberId === '1');
  const upcomingPayouts = mockPayouts.filter((p) => p.status === 'PENDING' && p.memberId === '1');

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-ink">Savings Overview</h1>
        <Link href="/savings/circles/new">
          <Button variant="primary">Create Circle</Button>
        </Link>
      </div>

      {/* Stats cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-4">
          <p className="text-sm text-gray-500">Total Balance</p>
          <p className="text-2xl font-bold text-ink">{formatCurrency(totalBalance, 'KES')}</p>
        </Card>
        <Card className="p-4">
          <p className="text-sm text-gray-500">Active Circles</p>
          <p className="text-2xl font-bold text-ink">{userCircles.filter((c) => c.status === 'ACTIVE').length}</p>
        </Card>
        <Card className="p-4">
          <p className="text-sm text-gray-500">Pending Contributions</p>
          <p className="text-2xl font-bold text-amber-600">{pendingContributions.length}</p>
        </Card>
        <Card className="p-4">
          <p className="text-sm text-gray-500">Upcoming Payouts</p>
          <p className="text-2xl font-bold text-sky-600">{upcomingPayouts.length}</p>
        </Card>
      </div>

      {/* Your Circles */}
      <div>
        <h2 className="text-xl font-semibold text-ink mb-4">Your Circles</h2>
        {userCircles.length === 0 ? (
          <Card className="p-8 text-center text-gray-500">
            <p>You are not a member of any savings circle yet.</p>
            <Link href="/savings/circles">
              <Button variant="primary" className="mt-4">Browse Circles</Button>
            </Link>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {userCircles.map((circle) => (
              <Link key={circle.id} href={`/savings/circles/${circle.id}`}>
                <Card className="p-4 hover:shadow-md transition-shadow cursor-pointer">
                  <div className="flex justify-between">
                    <h3 className="font-semibold text-ink">{circle.name}</h3>
                    <span className={`text-xs px-2 py-1 rounded-full ${
                      circle.status === 'ACTIVE' ? 'bg-emerald-100 text-emerald-800' :
                      circle.status === 'PAUSED' ? 'bg-amber-100 text-amber-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {circle.status}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 mt-1">{circle.description}</p>
                  <div className="mt-2 flex justify-between text-sm">
                    <span>Balance: {formatCurrency(circle.totalBalance, circle.currency)}</span>
                    <span>{circle.memberCount} members</span>
                  </div>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Link href="/savings/statements">
          <Card className="p-4 text-center hover:shadow-md transition-shadow cursor-pointer">
            <div className="text-2xl mb-1">📊</div>
            <p className="text-sm font-medium">Statements</p>
          </Card>
        </Link>
        <Link href="/savings/circles">
          <Card className="p-4 text-center hover:shadow-md transition-shadow cursor-pointer">
            <div className="text-2xl mb-1">🔍</div>
            <p className="text-sm font-medium">Browse Circles</p>
          </Card>
        </Link>
        <Link href="/savings/circles/new">
          <Card className="p-4 text-center hover:shadow-md transition-shadow cursor-pointer">
            <div className="text-2xl mb-1">➕</div>
            <p className="text-sm font-medium">Create Circle</p>
          </Card>
        </Link>
        <Link href="/profile/verification">
          <Card className="p-4 text-center hover:shadow-md transition-shadow cursor-pointer">
            <div className="text-2xl mb-1">🛡️</div>
            <p className="text-sm font-medium">KYC Status</p>
          </Card>
        </Link>
      </div>
    </div>
  );
}