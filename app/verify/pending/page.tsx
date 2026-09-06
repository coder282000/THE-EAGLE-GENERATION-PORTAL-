// app/verify/pending/page.tsx
'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/button';
import { mockKYCSubmissions } from '@/components/mock/data';

const CURRENT_USER_ID = '1';

export default function PendingPage() {
  const router = useRouter();
  const [timeElapsed, setTimeElapsed] = useState(0);
  const [isRefreshing, setIsRefreshing] = useState(false);
  
  const kyc = mockKYCSubmissions.find((s) => s.userId === CURRENT_USER_ID);

  // If not pending, redirect
  useEffect(() => {
    if (!kyc || (kyc.status !== 'pending' && kyc.status !== 'not_started')) {
      router.push('/profile/verification');
    }
  }, [kyc, router]);

  // Timer to show how long it's been
  useEffect(() => {
    const interval = setInterval(() => {
      setTimeElapsed((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const handleRefresh = () => {
    setIsRefreshing(true);
    // Simulate checking status
    setTimeout(() => {
      setIsRefreshing(false);
      // Check if status changed (mock - in real app would check API)
      if (kyc && kyc.status === 'approved') {
        router.push('/profile/verification');
      }
    }, 1500);
  };

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }
    return `${minutes}m`;
  };

  // Estimate review time (random between 24-48 hours from submission)
  const submittedAt = kyc?.submittedAt ? new Date(kyc.submittedAt) : new Date();
  const estimateHours = 24 + Math.floor(Math.random() * 24);
  const estimatedCompletion = new Date(submittedAt.getTime() + estimateHours * 60 * 60 * 1000);
  
  return (
    <div className="container mx-auto px-4 py-16 max-w-2xl">
      <div className="bg-white rounded-lg shadow-lg p-8 text-center">
        <div className="relative inline-block mb-4">
          <div className="text-6xl animate-pulse">⏳</div>
          <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-yellow-400 rounded-full animate-ping"></div>
        </div>
        <h2 className="text-2xl font-bold text-yellow-600 mb-2">Verification Under Review</h2>
        <p className="text-gray-600 mb-6">
          Your identity verification has been submitted and is being reviewed by our team.
        </p>

        {/* Time tracker */}
        <div className="bg-gray-50 rounded-lg p-4 mb-6">
          <div className="flex justify-between text-sm text-gray-600">
            <span>Submitted</span>
            <span className="font-medium">
              {submittedAt.toLocaleDateString('en-KE', { 
                month: 'short', 
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
              })}
            </span>
          </div>
          <div className="flex justify-between text-sm text-gray-600 mt-1">
            <span>Time elapsed</span>
            <span className="font-medium">{formatTime(timeElapsed)}</span>
          </div>
          <div className="flex justify-between text-sm text-gray-600 mt-1">
            <span>Estimated completion</span>
            <span className="font-medium">
              {estimatedCompletion.toLocaleDateString('en-KE', { 
                month: 'short', 
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
              })}
            </span>
          </div>
          <div className="mt-3 w-full bg-gray-200 rounded-full h-2 overflow-hidden">
            <div 
              className="bg-yellow-400 h-2 rounded-full transition-all duration-1000"
              style={{ 
                width: `${Math.min((timeElapsed / (estimateHours * 3600)) * 100, 95)}%` 
              }}
            />
          </div>
          <p className="text-xs text-gray-400 mt-1">Processing... {Math.min(Math.round((timeElapsed / (estimateHours * 3600)) * 100), 95)}%</p>
        </div>

        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 mb-6 text-left">
          <h3 className="font-semibold text-gray-800 mb-2">📋 What happens next?</h3>
          <ul className="space-y-2 text-sm text-gray-600">
            <li className="flex items-start gap-2">
              <span className="text-yellow-500 font-bold">1.</span>
              <span>Our team will review your documents (typically within {estimateHours} hours)</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-yellow-500 font-bold">2.</span>
              <span>You'll receive a notification when your verification is complete</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-yellow-500 font-bold">3.</span>
              <span>If approved, you'll have full access to all platform features</span>
            </li>
          </ul>
        </div>

        <div className="space-y-3">
          <Button 
            variant="secondary" 
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="w-full sm:w-auto"
          >
            {isRefreshing ? 'Checking...' : '🔄 Check Status'}
          </Button>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link href="/help/support">
              <Button variant="secondary">Contact Support</Button>
            </Link>
            <Link href="/dashboard">
              <Button variant="primary">Return to Dashboard</Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}