'use client';
// app/giving/page.tsx

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { mockSupportPacks, mockDonations } from '@/components/mock/data';
import { Button } from '@/components/button';
import { TextInput } from '@/components/input';
import { Textarea } from '@/components/textarea';
import { formatCurrency } from '@/lib/utils';
import { cn } from '@/lib/utils';

// Mock current user ID (in a real app, this comes from auth)
const CURRENT_USER_ID = '1';

interface DonationFormData {
  firstName: string;
  lastName: string;
  email: string;
  message: string;
  isAnonymous: boolean;
}

export default function GivingPage() {
  const router = useRouter();
  const [selectedPackId, setSelectedPackId] = useState<string | null>(null);
  const [customAmount, setCustomAmount] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [errors, setErrors] = useState<Partial<Record<keyof DonationFormData, string>>>({});

  const [formData, setFormData] = useState<DonationFormData>({
    firstName: 'Grace',
    lastName: 'Mwangi',
    email: 'grace@example.com',
    message: '',
    isAnonymous: false,
  });

  // Determine the donation amount
  const getAmount = (): number | null => {
    if (selectedPackId) {
      const pack = mockSupportPacks.find((p) => p.id === selectedPackId);
      return pack ? pack.amount : null;
    }
    if (customAmount) {
      const amount = parseFloat(customAmount);
      return !isNaN(amount) && amount > 0 ? Math.round(amount * 100) : null;
    }
    return null;
  };

  const amount = getAmount();
  const selectedPack = mockSupportPacks.find((p) => p.id === selectedPackId);
  const amountDisplay = amount ? formatCurrency(amount, 'KES') : 'Select an amount';

  const validate = (): boolean => {
    const newErrors: Partial<Record<keyof DonationFormData, string>> = {};
    if (!formData.firstName.trim()) newErrors.firstName = 'First name is required';
    if (!formData.lastName.trim()) newErrors.lastName = 'Last name is required';
    if (!formData.email.trim()) newErrors.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = 'Invalid email address';
    if (!amount) newErrors.message = 'Please select a support pack or enter an amount' as any;

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setIsSubmitting(true);

    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1500));

      // Create a mock donation record
      const newDonation = {
        id: `don_${Date.now()}`,
        userId: CURRENT_USER_ID,
        supportPackId: selectedPackId || undefined,
        amount: amount!,
        currency: 'KES',
        message: formData.message || undefined,
        isAnonymous: formData.isAnonymous,
        status: 'success' as const,
        receiptUrl: `/receipts/don_${Date.now()}.pdf`,
        createdAt: new Date().toISOString(),
      };

      // In a real app, this would be saved to the database
      // For now, we'll just push it to the mock array
      // mockDonations.push(newDonation);

      setIsSuccess(true);
    } catch (error) {
      console.error('Donation error:', error);
      router.push('/checkout/failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSelectPack = (packId: string) => {
    setSelectedPackId(packId);
    setCustomAmount('');
  };

  const handleCustomAmount = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    // Only allow numbers and decimal point
    if (value === '' || /^\d*\.?\d*$/.test(value)) {
      setCustomAmount(value);
      setSelectedPackId(null);
    }
  };

  if (isSuccess) {
    return (
      <div className="container mx-auto px-4 py-16 max-w-md">
        <div className="bg-white rounded-lg shadow-lg p-8 text-center">
          <div className="text-6xl mb-4">🎉</div>
          <h2 className="text-2xl font-bold text-green-600 mb-2">Thank You for Your Gift!</h2>
          <p className="text-gray-600 mb-2">
            Your donation of {amountDisplay} will make a difference in the lives of many.
          </p>
          <p className="text-sm text-gray-500 mb-6">
            A receipt has been sent to {formData.email}
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link href="/profile/giving">
              <Button variant="primary">View Giving History</Button>
            </Link>
            <Link href="/dashboard">
              <Button variant="secondary">Return to Dashboard</Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="flex items-center gap-2 text-sm text-gray-500 mb-6">
        <Link href="/dashboard" className="hover:text-blue-600">Dashboard</Link>
        <span>/</span>
        <span className="text-gray-700">Give</span>
      </div>

      <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">Support the Eagle Generation</h1>
      <p className="text-gray-500 mb-8">
        Your generous gift helps us train and equip the next generation of Kingdom leaders.
      </p>

      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Support Packs */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Choose a Support Pack</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {mockSupportPacks.map((pack) => {
                  const isSelected = selectedPackId === pack.id;
                  return (
                    <button
                      key={pack.id}
                      type="button"
                      onClick={() => handleSelectPack(pack.id)}
                      className={cn(
                        'p-4 rounded-lg border-2 text-left transition-all',
                        isSelected
                          ? 'border-blue-500 bg-blue-50 ring-2 ring-blue-200'
                          : 'border-gray-200 hover:border-gray-300'
                      )}
                    >
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-2xl">{pack.icon}</span>
                        <span className="font-bold text-gray-900">{pack.name}</span>
                      </div>
                      <p className="text-lg font-bold text-blue-600">{formatCurrency(pack.amount, 'KES')}</p>
                      <p className="text-sm text-gray-500 mt-1">{pack.description}</p>
                    </button>
                  );
                })}
              </div>

              <div className="mt-4">
                <label className="text-sm font-medium text-gray-700">Or enter a custom amount</label>
                <div className="mt-1 relative">
                  <span className="absolute left-3 top-2 text-gray-500">KES</span>
                  <input
                    type="text"
                    value={customAmount}
                    onChange={handleCustomAmount}
                    placeholder="0.00"
                    className="w-full pl-12 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
            </div>

            {/* Donor Information */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Your Information</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <TextInput
                  id="firstName"
                  label="First Name"
                  name="firstName"
                  value={formData.firstName}
                  onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                  error={errors.firstName}
                  required
                />
                <TextInput
                  id="lastName"
                  label="Last Name"
                  name="lastName"
                  value={formData.lastName}
                  onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                  error={errors.lastName}
                  required
                />
                <TextInput
                  id="email"
                  label="Email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  error={errors.email}
                  required
                />
                <div className="flex items-center mt-6">
                  <input
                    type="checkbox"
                    id="anonymous"
                    checked={formData.isAnonymous}
                    onChange={(e) => setFormData({ ...formData, isAnonymous: e.target.checked })}
                    className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <label htmlFor="anonymous" className="ml-2 text-sm text-gray-700">
                    Donate anonymously
                  </label>
                </div>
              </div>
              <div className="mt-4">
                <Textarea
                  label="Message (optional)"
                  name="message"
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  placeholder="Share a message of encouragement..."
                  rows={3}
                />
              </div>
            </div>
          </div>

          {/* Sidebar - Summary */}
          <div className="lg:col-span-1">
            <div className="bg-gray-50 rounded-lg p-6 sticky top-24">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Donation Summary</h3>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Selected Pack</span>
                  <span className="font-medium">{selectedPack?.name || 'Custom'}</span>
                </div>
                <div className="flex justify-between border-t border-gray-200 pt-3 text-base font-bold">
                  <span>Total</span>
                  <span>{amountDisplay}</span>
                </div>
              </div>
              {amount && (
                <Button
                  type="submit"
                  variant="primary"
                  size="lg"
                  className="w-full mt-6"
                  disabled={isSubmitting || !amount}
                >
                  {isSubmitting ? 'Processing...' : `Give ${amountDisplay}`}
                </Button>
              )}
              <p className="text-xs text-gray-500 mt-3 text-center">
                Your donation is secure and tax-deductible.
              </p>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
