'use client';
// app/give/page.tsx

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { mockSupportPacks } from '@/components/mock/data';
import { Button } from '@/components/button';
import { TextInput } from '@/components/input';
import { Textarea } from '@/components/textarea';
import { formatCurrency } from '@/lib/utils';
import { cn } from '@/lib/utils';

// Simple public layout (no auth)
export default function PublicGivePage() {
  const router = useRouter();
  const [selectedPackId, setSelectedPackId] = useState<string | null>(null);
  const [customAmount, setCustomAmount] = useState<string>('');
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    message: '',
    isAnonymous: false,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

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

  const handleSelectPack = (packId: string) => {
    setSelectedPackId(packId);
    setCustomAmount('');
  };

  const handleCustomAmount = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (value === '' || /^\d*\.?\d*$/.test(value)) {
      setCustomAmount(value);
      setSelectedPackId(null);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const validate = (): boolean => {
    const newErrors: { [key: string]: string } = {};
    if (!formData.firstName.trim()) newErrors.firstName = 'First name is required';
    if (!formData.lastName.trim()) newErrors.lastName = 'Last name is required';
    if (!formData.email.trim()) newErrors.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = 'Invalid email address';
    if (!formData.phone.trim()) newErrors.phone = 'Phone number is required';
    if (!amount) newErrors.amount = 'Please select a support pack or enter an amount';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setIsSubmitting(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 1500));
      setIsSuccess(true);
    } catch (error) {
      console.error('Donation error:', error);
      setErrors({ submit: 'Failed to process donation. Please try again.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSuccess) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4 py-16">
        <div className="bg-white rounded-lg shadow-lg max-w-md w-full p-8 text-center">
          <div className="text-6xl mb-4">🎉</div>
          <h2 className="text-2xl font-bold text-green-600 mb-2">Thank You for Your Gift!</h2>
          <p className="text-gray-600 mb-2">
            Your donation of {amountDisplay} will make a difference.
          </p>
          <p className="text-sm text-gray-500 mb-6">
            A receipt has been sent to {formData.email}
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link href="/">
              <Button variant="primary">Return Home</Button>
            </Link>
            <Link href="/give">
              <Button variant="secondary">Make Another Donation</Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Public Header (simple) */}
      <header className="bg-white border-b border-gray-200">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="text-xl font-bold text-gray-900">
            Eagle Generation
          </Link>
          <div className="flex items-center gap-4">
            <Link href="/login" className="text-sm text-blue-600 hover:underline">
              Sign In
            </Link>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-4xl">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Support the Eagle Generation</h1>
        <p className="text-gray-500 mb-8">
          Your generous gift helps us train and equip the next generation of Kingdom leaders.
        </p>

        <form onSubmit={handleSubmit} className="space-y-8">
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
              {errors.amount && <p className="mt-1 text-sm text-red-600">{errors.amount}</p>}
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Your Information</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <TextInput
                id="firstName"
                label="First Name"
                name="firstName"
                value={formData.firstName}
                onChange={handleChange}
                error={errors.firstName}
                required
              />
              <TextInput
                id="lastName"
                label="Last Name"
                name="lastName"
                value={formData.lastName}
                onChange={handleChange}
                error={errors.lastName}
                required
              />
              <TextInput
                id="email"
                label="Email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                error={errors.email}
                required
              />
              <TextInput
                id="phone"
                label="Phone"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                error={errors.phone}
                required
                placeholder="0712345678"
              />
              <div className="sm:col-span-2">
                <Textarea
                  label="Message (optional)"
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  placeholder="Share a message of encouragement..."
                  rows={3}
                />
              </div>
              <div className="sm:col-span-2 flex items-center">
                <input
                  type="checkbox"
                  id="anonymous"
                  name="isAnonymous"
                  checked={formData.isAnonymous}
                  onChange={handleChange}
                  className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <label htmlFor="anonymous" className="ml-2 text-sm text-gray-700">
                  Donate anonymously
                </label>
              </div>
            </div>
          </div>

          <div className="bg-gray-50 rounded-lg p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div>
              <p className="text-sm text-gray-600">Total donation</p>
              <p className="text-2xl font-bold text-gray-900">{amountDisplay}</p>
            </div>
            <Button
              type="submit"
              variant="primary"
              size="lg"
              disabled={isSubmitting || !amount}
              className="w-full sm:w-auto"
            >
              {isSubmitting ? 'Processing...' : `Give ${amountDisplay}`}
            </Button>
          </div>
          <p className="text-xs text-gray-500 text-center">
            Your donation is secure and tax-deductible.
          </p>
        </form>
      </main>
    </div>
  );
}
