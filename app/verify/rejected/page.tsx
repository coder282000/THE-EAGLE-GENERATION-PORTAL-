'use client';
// app/verify/rejected/page.tsx

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/button';
import { mockKYCSubmissions } from '@/components/mock/data';

const CURRENT_USER_ID = '1';

export default function RejectedPage() {
  const router = useRouter();
  const [showTips, setShowTips] = useState(true);
  
  const kyc = mockKYCSubmissions.find((s) => s.userId === CURRENT_USER_ID);

  // If not rejected, redirect
  useEffect(() => {
    if (!kyc || kyc.status !== 'rejected') {
      router.push('/profile/verification');
    }
  }, [kyc, router]);

  const handleResubmit = () => {
    router.push('/verify/identity');
  };

  // Get rejected documents
  const rejectedDocs = kyc?.documents.filter(d => d.status === 'rejected') || [];
  const hasRejectedDocs = rejectedDocs.length > 0;

  // Format rejection reasons
  const getDocLabel = (type: string) => {
    const labels: Record<string, string> = {
      national_id: 'National ID',
      passport: 'Passport',
      drivers_license: "Driver's License",
      selfie: 'Selfie Photo',
      proof_of_address: 'Proof of Address',
    };
    return labels[type] || type;
  };

  return (
    <div className="container mx-auto px-4 py-16 max-w-2xl">
      <div className="bg-white rounded-lg shadow-lg p-8">
        <div className="text-center">
          <div className="text-6xl mb-4">❌</div>
          <h2 className="text-2xl font-bold text-red-600 mb-2">Verification Rejected</h2>
          <p className="text-gray-600 mb-6">
            Your identity verification could not be approved. Please review the reason below and resubmit.
          </p>
        </div>

        {/* Rejection Reason */}
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 mb-6">
          <h3 className="font-semibold text-red-800 mb-2">Rejection Reason</h3>
          <p className="text-sm text-red-700">
            {kyc?.rejectionReason || 'Document image quality insufficient. Please upload clear images of your ID.'}
          </p>
          
          {hasRejectedDocs && (
            <div className="mt-3">
              <p className="text-sm font-medium text-red-800 mb-1">Affected documents:</p>
              <ul className="list-disc list-inside text-sm text-red-700">
                {rejectedDocs.map((doc, index) => (
                  <li key={index}>
                    {getDocLabel(doc.type)}
                    {doc.rejectionReason && `: ${doc.rejectionReason}`}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {/* Tips Section */}
        {showTips && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-6">
            <div className="flex items-start justify-between">
              <h3 className="font-semibold text-blue-800 mb-2">💡 Tips for resubmission</h3>
              <button
                onClick={() => setShowTips(false)}
                className="text-blue-400 hover:text-blue-600 text-sm"
              >
                ✕
              </button>
            </div>
            <ul className="space-y-2 text-sm text-blue-700">
              <li className="flex items-start gap-2">
                <span className="text-blue-500">📸</span>
                <span>Ensure images are well-lit and in focus</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-500">📐</span>
                <span>Make sure all corners of the document are visible</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-500">🔍</span>
                <span>Check that text is legible and not cut off</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-500">🧑</span>
                <span>Use a plain background for selfies and ensure your face is fully visible</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-500">📄</span>
                <span>For proof of address, ensure the document is recent (within 3 months)</span>
              </li>
            </ul>
          </div>
        )}

        {/* Quick Actions */}
        <div className="border-t border-gray-200 pt-6">
          <h3 className="font-semibold text-gray-800 mb-3">Quick Actions</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <button
              onClick={() => router.push('/verify/identity')}
              className="flex items-center gap-2 p-3 bg-gray-50 hover:bg-gray-100 rounded-lg border border-gray-200 transition-colors text-left"
            >
              <span className="text-2xl">🪪</span>
              <div>
                <p className="text-sm font-medium text-gray-800">Re-upload ID</p>
                <p className="text-xs text-gray-500">Upload a clear photo</p>
              </div>
            </button>
            <button
              onClick={() => router.push('/verify/liveness')}
              className="flex items-center gap-2 p-3 bg-gray-50 hover:bg-gray-100 rounded-lg border border-gray-200 transition-colors text-left"
            >
              <span className="text-2xl">📷</span>
              <div>
                <p className="text-sm font-medium text-gray-800">Retake Selfie</p>
                <p className="text-xs text-gray-500">Take a new photo</p>
              </div>
            </button>
            <button
              onClick={() => router.push('/verify/address')}
              className="flex items-center gap-2 p-3 bg-gray-50 hover:bg-gray-100 rounded-lg border border-gray-200 transition-colors text-left"
            >
              <span className="text-2xl">🏠</span>
              <div>
                <p className="text-sm font-medium text-gray-800">Update Address</p>
                <p className="text-xs text-gray-500">Review your address details</p>
              </div>
            </button>
            <Link href="/help/support">
              <div className="flex items-center gap-2 p-3 bg-gray-50 hover:bg-gray-100 rounded-lg border border-gray-200 transition-colors cursor-pointer text-left">
                <span className="text-2xl">💬</span>
                <div>
                  <p className="text-sm font-medium text-gray-800">Contact Support</p>
                  <p className="text-xs text-gray-500">Get help with your verification</p>
                </div>
              </div>
            </Link>
          </div>
        </div>

        <div className="mt-6 flex flex-col sm:flex-row gap-3 justify-center pt-4 border-t border-gray-200">
          <Button variant="primary" onClick={handleResubmit} size="lg">
            🔄 Start Over
          </Button>
          <Link href="/dashboard">
            <Button variant="secondary">Go to Dashboard</Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
