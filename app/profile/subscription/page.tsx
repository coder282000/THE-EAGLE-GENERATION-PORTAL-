'use client';
// app/profile/subscription/page.tsx
'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { mockSubscriptions, mockPaymentTransactions } from '@/components/mock/data';
import { Button } from '@/components/button';
import { formatCurrency } from '@/lib/utils';
import { cn } from '@/lib/utils';

// Mock current user ID (in a real app, this comes from auth)
const CURRENT_USER_ID = '1'; // Grace Mwangi

type Plan = 'standard' | 'premium' | 'enterprise';

const PLAN_DETAILS: Record<Plan, { label: string; price: number; features: string[]; color: string }> = {
  standard: {
    label: 'Standard',
    price: 6000,
    features: ['Access to all courses', 'Chapter membership', 'Community forums', 'Monthly newsletter'],
    color: 'border-blue-200 bg-blue-50',
  },
  premium: {
    label: 'Premium',
    price: 12000,
    features: ['Everything in Standard', 'Advanced courses', 'Mentorship matching', 'Private events', 'Priority support'],
    color: 'border-purple-200 bg-purple-50',
  },
  enterprise: {
    label: 'Enterprise',
    price: 24000,
    features: ['Everything in Premium', 'Custom cohorts', 'Dedicated success manager', 'API access', 'White-label options'],
    color: 'border-gold-200 bg-yellow-50',
  },
};

const getSubscription = () => {
  return mockSubscriptions.find((s) => s.userId === CURRENT_USER_ID) || null;
};

export default function SubscriptionPage() {
  const router = useRouter();
  const subscription = getSubscription();
  const [isLoading, setIsLoading] = useState(false);
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);

  if (!subscription) {
    // No subscription – show a "Subscribe" flow
    return <NoSubscriptionPage />;
  }

  const planDetails = PLAN_DETAILS[subscription.plan as Plan] || PLAN_DETAILS.standard;
  const isActive = subscription.status === 'active';
  const isPaused = subscription.status === 'paused';
  const isCancelled = subscription.status === 'cancelled';
  const isExpired = subscription.status === 'expired';

  const renewalDate = new Date(subscription.renewalDate);
  const formattedRenewal = renewalDate.toLocaleDateString('en-KE', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  const handleCancel = async () => {
    setIsLoading(true);
    await new Promise((resolve) => setTimeout(resolve, 1000));
    // Mock cancellation – just update the subscription in memory (would be API call)
    subscription.status = 'cancelled';
    setShowCancelConfirm(false);
    setIsLoading(false);
    alert('Subscription cancelled. You will not be charged again.');
    // Optionally refresh the page
    window.location.reload();
  };

  const handleChangePlan = (plan: Plan) => {
    // Navigate to a plan selection page, or show inline modal.
    // For simplicity, we'll show an alert.
    alert(`Upgrade to ${PLAN_DETAILS[plan].label} plan. This would redirect to checkout.`);
    // In a real app, go to checkout with plan param.
    // router.push(`/checkout?plan=${plan}`);
  };

  const handleResume = async () => {
    setIsLoading(true);
    await new Promise((resolve) => setTimeout(resolve, 1000));
    subscription.status = 'active';
    setIsLoading(false);
    alert('Subscription resumed.');
    window.location.reload();
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">Subscription Management</h1>
      <p className="text-gray-500 mb-8">Manage your membership plan and billing details.</p>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main subscription card */}
        <div className="lg:col-span-2">
          <div className={cn(
            'bg-white rounded-lg shadow-sm border-2 p-6',
            isActive ? 'border-green-400' : 'border-gray-200'
          )}>
            <div className="flex items-start justify-between">
              <div>
                <h2 className="text-xl font-bold text-gray-900">{planDetails.label}</h2>
                <p className="text-2xl font-bold text-gray-900 mt-1">
                  {formatCurrency(planDetails.price, subscription.currency)}
                  <span className="text-sm font-normal text-gray-500">/{subscription.billingCycle}</span>
                </p>
                <div className="mt-2 flex items-center gap-2">
                  <span className={cn(
                    'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium',
                    isActive ? 'bg-green-100 text-green-800' :
                    isPaused ? 'bg-yellow-100 text-yellow-800' :
                    isCancelled ? 'bg-red-100 text-red-800' :
                    'bg-gray-100 text-gray-800'
                  )}>
                    {subscription.status.charAt(0).toUpperCase() + subscription.status.slice(1)}
                  </span>
                  {isActive && subscription.autoRenew && (
                    <span className="text-xs text-gray-500">Auto-renew on {formattedRenewal}</span>
                  )}
                  {isCancelled && (
                    <span className="text-xs text-red-500">Expires on {formattedRenewal}</span>
                  )}
                </div>
              </div>
              {isActive && (
                <div className="flex flex-col items-end gap-2">
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => setShowCancelConfirm(true)}
                    disabled={isLoading}
                  >
                    Cancel
                  </Button>
                </div>
              )}
            </div>

            <ul className="mt-4 space-y-2 text-sm text-gray-600">
              {planDetails.features.map((feature, idx) => (
                <li key={idx} className="flex items-center gap-2">
                  <span className="text-green-500">✓</span> {feature}
                </li>
              ))}
            </ul>

            <div className="mt-6 border-t border-gray-200 pt-4">
              <h3 className="text-sm font-medium text-gray-700 mb-2">Billing History</h3>
              <div className="space-y-1 text-sm">
                <div className="flex justify-between text-gray-600">
                  <span>Last payment</span>
                  <span>{formatCurrency(planDetails.price, subscription.currency)} on {formattedRenewal}</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Next payment</span>
                  {isActive && subscription.autoRenew ? (
                    <span>{formatCurrency(planDetails.price, subscription.currency)} on {formattedRenewal}</span>
                  ) : (
                    <span className="text-gray-400">No upcoming payments</span>
                  )}
                </div>
              </div>
              <Link href="/profile/orders" className="text-sm text-blue-600 hover:underline mt-2 inline-block">
                View full billing history →
              </Link>
            </div>
          </div>
        </div>

        {/* Sidebar – Plan actions and upgrade options */}
        <div className="lg:col-span-1">
          <div className="bg-gray-50 rounded-lg p-6 space-y-4">
            <h3 className="font-semibold text-gray-900">Available Plans</h3>
            {(['standard', 'premium', 'enterprise'] as Plan[]).map((plan) => {
              const isCurrent = subscription.plan === plan;
              const details = PLAN_DETAILS[plan];
              return (
                <div key={plan} className={cn(
                  'border rounded-lg p-3',
                  isCurrent ? 'border-blue-500 bg-blue-50' : 'border-gray-200 bg-white'
                )}>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">{details.label}</p>
                      <p className="text-sm text-gray-500">{formatCurrency(details.price, subscription.currency)}/{subscription.billingCycle}</p>
                    </div>
                    {isCurrent ? (
                      <span className="text-xs font-medium text-blue-600">Current</span>
                    ) : (
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => handleChangePlan(plan)}
                        disabled={!isActive || isLoading}
                      >
                        Switch
                      </Button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          <div className="mt-4 bg-gray-50 rounded-lg p-4 text-sm text-gray-600">
            <p className="font-medium text-gray-800">Need help?</p>
            <p className="mt-1">Contact our support team for billing or plan questions.</p>
            <Link href="/help/support" className="text-blue-600 hover:underline mt-2 inline-block">
              Contact Support →
            </Link>
          </div>
        </div>
      </div>

      {/* Cancel Confirmation Modal */}
      {showCancelConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <h3 className="text-xl font-bold text-gray-900 mb-2">Cancel Subscription?</h3>
            <p className="text-gray-600 mb-4">
              You will lose access to premium features and your plan will expire on {formattedRenewal}. You can resubscribe anytime.
            </p>
            <div className="flex gap-3 justify-end">
              <Button variant="secondary" onClick={() => setShowCancelConfirm(false)} disabled={isLoading}>
                Keep Plan
              </Button>
              <Button variant="danger" onClick={handleCancel} disabled={isLoading}>
                {isLoading ? 'Cancelling...' : 'Yes, Cancel'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// NoSubscription Page – shows options to subscribe
function NoSubscriptionPage() {
  const router = useRouter();

  const handleSubscribe = (plan: Plan) => {
    // Redirect to checkout with plan
    router.push(`/checkout?plan=${plan}`);
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">Subscription Management</h1>
      <p className="text-gray-500 mb-8">You don't have an active subscription. Choose a plan to get started.</p>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {(['standard', 'premium', 'enterprise'] as Plan[]).map((plan) => {
          const details = PLAN_DETAILS[plan];
          return (
            <div key={plan} className={cn(
              'bg-white rounded-lg shadow-sm border border-gray-200 p-6 flex flex-col',
              details.color.replace('border-', '').trim() ? `border-2 ${details.color}` : ''
            )}>
              <h3 className="text-lg font-bold text-gray-900">{details.label}</h3>
              <p className="text-2xl font-bold text-gray-900 mt-1">
                {formatCurrency(details.price, 'KES')}
                <span className="text-sm font-normal text-gray-500">/year</span>
              </p>
              <ul className="mt-4 space-y-2 text-sm text-gray-600 flex-1">
                {details.features.map((feature, idx) => (
                  <li key={idx} className="flex items-center gap-2">
                    <span className="text-green-500">✓</span> {feature}
                  </li>
                ))}
              </ul>
              <Button
                variant="primary"
                className="mt-6 w-full"
                onClick={() => handleSubscribe(plan)}
              >
                Choose {details.label}
              </Button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
