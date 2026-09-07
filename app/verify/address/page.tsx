'use client';
// app/verify/address/page.tsx
import React, { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/button';
import { TextInput, SelectInput } from '@/components/input';
import { Textarea } from '@/components/textarea';
import { cn } from '@/lib/utils';
import { mockKYCSubmissions } from '@/components/mock/data';
const CURRENT_USER_ID = '1';
const COUNTIES = [
  'Nairobi', 'Mombasa', 'Kisumu', 'Nakuru', 'Eldoret', 'Thika', 'Malindi',
  'Meru', 'Nyeri', 'Kitale', 'Kakamega', 'Machakos', 'Kisii', 'Garissa',
  'Embu', 'Bungoma', 'Vihiga', 'Uasin Gishu', 'Trans Nzoia', 'Laikipia',
];
const OCCUPATIONS = [
  'Student', 'Professional', 'Business Owner', 'Self-Employed', 'Government Employee',
  'Non-Profit / NGO', 'Educator', 'Healthcare', 'Technology', 'Finance',
  'Agriculture', 'Retail', 'Hospitality', 'Other',
];
const SOURCE_OF_FUNDS = [
  'Employment Income', 'Business Revenue', 'Investments', 'Savings',
  'Family Support', 'Gifts', 'Other',
];
export default function AddressPage() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [formData, setFormData] = useState({
    addressLine1: '',
    addressLine2: '',
    city: '',
    county: '',
    postalCode: '',
    country: 'Kenya',
    occupation: '',
    sourceOfFunds: '',
    additionalInfo: '',
  });
  const [proofFile, setProofFile] = useState<File | null>(null);
  const [proofPreview, setProofPreview] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    // Clear error for this field
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      setErrors((prev) => ({ ...prev, proof: 'File size must be less than 5MB' }));
      return;
    }
    if (!['application/pdf', 'image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
      setErrors((prev) => ({ ...prev, proof: 'Only PDF, JPEG, PNG, or WebP allowed' }));
      return;
    }
    setProofFile(file);
    const reader = new FileReader();
    reader.onload = (event) => {
      setProofPreview(event.target?.result as string);
    };
    reader.readAsDataURL(file);
    if (errors.proof) {
      setErrors((prev) => ({ ...prev, proof: '' }));
    }
  };
  const removeProof = () => {
    setProofFile(null);
    setProofPreview(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };
  const validate = (): boolean => {
    const newErrors: { [key: string]: string } = {};
    if (!formData.addressLine1.trim()) newErrors.addressLine1 = 'Address is required';
    if (!formData.city.trim()) newErrors.city = 'City is required';
    if (!formData.county) newErrors.county = 'County is required';
    if (!formData.postalCode.trim()) newErrors.postalCode = 'Postal code is required';
    if (!formData.occupation) newErrors.occupation = 'Occupation is required';
    if (!formData.sourceOfFunds) newErrors.sourceOfFunds = 'Source of funds is required';
    // Proof is optional but recommended
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
      // Update KYC submission with address and proof (if provided)
      const kyc = mockKYCSubmissions.find((s) => s.userId === CURRENT_USER_ID);
      if (kyc) {
        if (proofFile) {
          kyc.documents = kyc.documents.filter((d) => d.type !== 'proof_of_address');
          kyc.documents.push({
            type: 'proof_of_address',
            url: proofPreview || '/mock/proof_of_address.png',
            status: 'pending',
            uploadedAt: new Date().toISOString(),
          });
        }
        if (kyc.status === 'not_started') {
          kyc.status = 'pending';
          kyc.submittedAt = new Date().toISOString();
        }
      }
      router.push('/verify/pending');
    } catch (error) {
      console.error('Address submission error:', error);
      setErrors({ submit: 'Failed to submit address. Please try again.' });
    } finally {
      setIsSubmitting(false);
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
        <Link href="/verify/identity" className="hover:text-blue-600">
          Identity
        </Link>
        <span className="mx-2">/</span>
        <Link href="/verify/liveness" className="hover:text-blue-600">
          Liveness
        </Link>
        <span className="mx-2">/</span>
        <span className="text-gray-700">Address</span>
      </nav>
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Address & Additional Info</h1>
        <p className="text-gray-500 mb-6">
          Provide your address and additional information for verification purposes.
        </p>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Address Fields */}
          <div>
            <h3 className="text-sm font-medium text-gray-700 mb-3">Address Details</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <TextInput
                  id="addressLine1"
                  label="Address Line 1"
                  name="addressLine1"
                  value={formData.addressLine1}
                  onChange={handleInputChange}
                  error={errors.addressLine1}
                  placeholder="Street name and building"
                  required
                />
              </div>
              <div className="md:col-span-2">
                <TextInput
                  id="addressLine2"
                  label="Address Line 2"
                  name="addressLine2"
                  value={formData.addressLine2}
                  onChange={handleInputChange}
                  placeholder="Apartment, suite, etc. (optional)"
                />
              </div>
              <TextInput
                id="city"
                label="City"
                name="city"
                value={formData.city}
                onChange={handleInputChange}
                error={errors.city}
                required
              />
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  County <span className="text-red-500">*</span>
                </label>
                <Select
                  id="county"
                  label="County"
                  name="county"
                  value={formData.county}
                  onChange={handleInputChange}
                  options={[
                    { value: '', label: 'Select County' },
                    ...COUNTIES.map((c) => ({ value: c, label: c })),
                  ]}
                  error={errors.county}
                />
              </div>
              <TextInput
                id="postalCode"
                label="Postal Code"
                name="postalCode"
                value={formData.postalCode}
                onChange={handleInputChange}
                error={errors.postalCode}
                required
              />
              <TextInput
                id="country"
                label="Country"
                name="country"
                value={formData.country}
                onChange={handleInputChange}
                disabled
                className="bg-gray-50"
              />
            </div>
          </div>
          {/* Proof of Address Upload */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Proof of Address <span className="text-gray-400 text-xs">(optional but recommended)</span>
            </label>
            <div
              className={cn(
                'border-2 border-dashed rounded-lg p-6 text-center transition-colors',
                errors.proof ? 'border-red-500 bg-red-50' : 'border-gray-300 hover:border-gray-400'
              )}
            >
              {proofPreview ? (
                <div className="relative">
                  {proofFile?.type.startsWith('image/') ? (
                    <img
                      src={proofPreview}
                      alt="Proof of address"
                      className="max-h-48 mx-auto rounded"
                    />
                  ) : (
                    <div className="text-center">
                      <div className="text-4xl mb-2">ðŸ“„</div>
                      <p className="text-gray-600">{proofFile?.name}</p>
                      <p className="text-xs text-gray-400">
                        {(proofFile?.size || 0) / 1024 < 1024
                          ? `${Math.round((proofFile?.size || 0) / 1024)} KB`
                          : `${((proofFile?.size || 0) / 1024 / 1024).toFixed(1)} MB`}
                      </p>
                    </div>
                  )}
                  <button
                    type="button"
                    onClick={removeProof}
                    className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                  >
                    âœ•
                  </button>
                </div>
              ) : (
                <div>
                  <div className="text-4xl mb-2">ðŸ </div>
                  <p className="text-gray-600">Upload a utility bill, bank statement, or official letter</p>
                  <p className="text-xs text-gray-400 mt-1">PDF, JPEG, PNG, WebP (max 5MB)</p>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".pdf,image/*"
                    onChange={handleFileChange}
                    className="mt-2 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                  />
                </div>
              )}
            </div>
            {errors.proof && <p className="mt-1 text-sm text-red-600">{errors.proof}</p>}
          </div>
          {/* Additional Info */}
          <div>
            <h3 className="text-sm font-medium text-gray-700 mb-3">Additional Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Occupation <span className="text-red-500">*</span>
                </label>
                <Select
                  id="occupation"
                  label="Occupation"
                  name="occupation"
                  value={formData.occupation}
                  onChange={handleInputChange}
                  options={[
                    { value: '', label: 'Select Occupation' },
                    ...OCCUPATIONS.map((o) => ({ value: o, label: o })),
                  ]}
                  error={errors.occupation}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Source of Funds <span className="text-red-500">*</span>
                </label>
                <Select
                  id="sourceOfFunds"
                  label="Source of Funds"
                  name="sourceOfFunds"
                  value={formData.sourceOfFunds}
                  onChange={handleInputChange}
                  options={[
                    { value: '', label: 'Select Source of Funds' },
                    ...SOURCE_OF_FUNDS.map((s) => ({ value: s, label: s })),
                  ]}
                  error={errors.sourceOfFunds}
                />
              </div>
            </div>
            <div className="mt-4">
              <Textarea
                id="additionalInfo"
                label="Additional Information (optional)"
                name="additionalInfo"
                value={formData.additionalInfo}
                onChange={handleInputChange}
                placeholder="Any other information you'd like to share..."
                rows={3}
              />
            </div>
          </div>
          {errors.submit && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
              {errors.submit}
            </div>
          )}
          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-3 justify-end pt-4 border-t border-gray-200">
            <Link href="/verify/liveness">
              <Button variant="secondary" type="button">
                â† Back to Liveness
              </Button>
            </Link>
            <Button variant="primary" type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Submitting...' : 'Submit Verification'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
