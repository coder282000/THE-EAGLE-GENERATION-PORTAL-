'use client';
// app/verify/identity/page.tsx
import React, { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/button';
import { TextInput } from '@/components/input';
import { Select } from '@/components/select';
import { cn } from '@/lib/utils';
import { mockKYCSubmissions } from '@/components/mock/data';
// Mock current user ID
const CURRENT_USER_ID = '1';
type DocumentType = 'national_id' | 'passport' | 'drivers_license';
const DOCUMENT_TYPES = [
  { value: 'national_id', label: 'National ID' },
  { value: 'passport', label: 'Passport' },
  { value: 'drivers_license', label: "Driver's License" },
];
export default function IdentityCapturePage() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [documentType, setDocumentType] = useState<DocumentType>('national_id');
  const [frontFile, setFrontFile] = useState<File | null>(null);
  const [backFile, setBackFile] = useState<File | null>(null);
  const [frontPreview, setFrontPreview] = useState<string | null>(null);
  const [backPreview, setBackPreview] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [idNumber, setIdNumber] = useState('');
  const [fullName, setFullName] = useState('');
  const [dob, setDob] = useState('');
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const handleFileChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    side: 'front' | 'back'
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;
    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setErrors((prev) => ({ ...prev, [side]: 'File size must be less than 5MB' }));
      return;
    }
    // Validate file type
    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
      setErrors((prev) => ({ ...prev, [side]: 'Only JPEG, PNG, or WebP images allowed' }));
      return;
    }
    setErrors((prev) => ({ ...prev, [side]: '' }));
    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      if (side === 'front') {
        setFrontFile(file);
        setFrontPreview(dataUrl);
      } else {
        setBackFile(file);
        setBackPreview(dataUrl);
      }
    };
    reader.readAsDataURL(file);
  };
  const handleRemoveFile = (side: 'front' | 'back') => {
    if (side === 'front') {
      setFrontFile(null);
      setFrontPreview(null);
      if (fileInputRef.current) fileInputRef.current.value = '';
    } else {
      setBackFile(null);
      setBackPreview(null);
    }
  };
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // Validate
    const newErrors: { [key: string]: string } = {};
    if (!frontFile) newErrors.front = 'Front image is required';
    if (!idNumber.trim()) newErrors.idNumber = 'ID number is required';
    if (!fullName.trim()) newErrors.fullName = 'Full name is required';
    if (!dob) newErrors.dob = 'Date of birth is required';
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
    setIsUploading(true);
    try {
      // Simulate API call to upload document
      await new Promise((resolve) => setTimeout(resolve, 1500));
      // Update KYC submission record
      const kyc = mockKYCSubmissions.find((s) => s.userId === CURRENT_USER_ID);
      if (kyc) {
        kyc.documents = kyc.documents.filter((d) => d.type !== documentType);
        kyc.documents.push({
          type: documentType,
          url: frontPreview || '/mock/uploaded_doc.png',
          status: 'pending',
          uploadedAt: new Date().toISOString(),
        });
        if (kyc.status === 'not_started') {
          kyc.status = 'pending';
          kyc.submittedAt = new Date().toISOString();
        }
      }
      // Redirect to next step (liveness check)
      router.push('/verify/liveness');
    } catch (error) {
      console.error('Upload error:', error);
      setErrors({ submit: 'Failed to upload document. Please try again.' });
    } finally {
      setIsUploading(false);
    }
  };
  return (
    <div className="container mx-auto px-4 py-8 max-w-3xl">
      {/* Breadcrumb */}
      <nav className="text-sm text-gray-500 mb-6">
        <Link href="/profile/verification" className="hover:text-blue-600">
          Verification
        </Link>
        <span className="mx-2">/</span>
        <span className="text-gray-700">Identity Document</span>
      </nav>
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Identity Document</h1>
        <p className="text-gray-500 mb-6">
          Upload a clear photo of your government-issued ID. We'll verify your identity.
        </p>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Document Type */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Document Type
            </label>
            <Select
              id="documentType"
              label="Document Type"
              value={documentType}
              onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setDocumentType(e.target.value as DocumentType)}
              options={DOCUMENT_TYPES}
              aria-label="Document type"
            />
          </div>
          {/* Front Image Upload */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Front Image <span className="text-red-500">*</span>
            </label>
            <div
              className={cn(
                'border-2 border-dashed rounded-lg p-6 text-center transition-colors',
                errors.front ? 'border-red-500 bg-red-50' : 'border-gray-300 hover:border-gray-400'
              )}
            >
              {frontPreview ? (
                <div className="relative">
                  <img
                    src={frontPreview}
                    alt="Front of document"
                    className="max-h-48 mx-auto rounded"
                  />
                  <button
                    type="button"
                    onClick={() => handleRemoveFile('front')}
                    className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                  >
                    âœ•
                  </button>
                </div>
              ) : (
                <div>
                  <div className="text-4xl mb-2">ðŸ“„</div>
                  <p className="text-gray-600">Click or drag to upload front image</p>
                  <p className="text-xs text-gray-400 mt-1">JPEG, PNG, WebP (max 5MB)</p>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleFileChange(e, 'front')}
                    className="mt-2 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                  />
                </div>
              )}
            </div>
            {errors.front && <p className="mt-1 text-sm text-red-600">{errors.front}</p>}
          </div>
          {/* Back Image Upload (optional) */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Back Image <span className="text-gray-400 text-xs">(optional)</span>
            </label>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-gray-400 transition-colors">
              {backPreview ? (
                <div className="relative">
                  <img
                    src={backPreview}
                    alt="Back of document"
                    className="max-h-48 mx-auto rounded"
                  />
                  <button
                    type="button"
                    onClick={() => handleRemoveFile('back')}
                    className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                  >
                    âœ•
                  </button>
                </div>
              ) : (
                <div>
                  <div className="text-4xl mb-2">ðŸ“„</div>
                  <p className="text-gray-600">Click or drag to upload back image</p>
                  <p className="text-xs text-gray-400 mt-1">JPEG, PNG, WebP (max 5MB)</p>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleFileChange(e, 'back')}
                    className="mt-2 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                  />
                </div>
              )}
            </div>
          </div>
          {/* ID Data Extraction (mock) */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="text-sm font-medium text-gray-700 mb-3">Extracted Information</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <TextInput
                id="fullName"
                label="Full Name"
                value={fullName}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFullName(e.target.value)}
                error={errors.fullName}
                placeholder="e.g., John Doe"
                required
              />
              <TextInput
                id="idNumber"
                label="ID Number"
                value={idNumber}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setIdNumber(e.target.value)}
                error={errors.idNumber}
                placeholder="e.g., 12345678"
                required
              />
              <TextInput
                id="dob"
                label="Date of Birth"
                type="date"
                value={dob}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setDob(e.target.value)}
                error={errors.dob}
                required
              />
            </div>
            <p className="text-xs text-gray-400 mt-2">
              Please verify the extracted information. This helps us process your verification faster.
            </p>
          </div>
          {errors.submit && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
              {errors.submit}
            </div>
          )}
          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-3 justify-end pt-4 border-t border-gray-200">
            <Link href="/profile/verification">
              <Button variant="secondary" type="button">
                Cancel
              </Button>
            </Link>
            <Button variant="primary" type="submit" disabled={isUploading}>
              {isUploading ? 'Uploading...' : 'Continue to Liveness Check â†’'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
