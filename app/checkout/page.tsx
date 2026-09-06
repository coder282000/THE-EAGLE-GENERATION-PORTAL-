// app/checkout/page.tsx
'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useCart } from '@/context/CartContext';
import { Button } from '@/components/button';
import { TextInput, SelectInput } from '@/components/input';
import { formatCurrency } from '@/lib/utils';

type PaymentMethod = 'mpesa' | 'card' | 'bank_transfer';

interface FormData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  county: string;
  postalCode: string;
  country: string;
  paymentMethod: PaymentMethod;
  mpesaPhone?: string;
  cardNumber?: string;
  expiryDate?: string;
  cvv?: string;
}

const PAYMENT_METHODS = [
  { value: 'mpesa', label: 'M-Pesa (STK Push)' },
  { value: 'card', label: 'Credit / Debit Card' },
  { value: 'bank_transfer', label: 'Bank Transfer' },
];

const COUNTIES = [
  'Nairobi', 'Mombasa', 'Kisumu', 'Nakuru', 'Eldoret', 'Thika', 'Malindi',
  'Meru', 'Nyeri', 'Kitale', 'Kakamega', 'Machakos', 'Kisii', 'Garissa',
  'Embu', 'Bungoma', 'Vihiga', 'Uasin Gishu', 'Trans Nzoia', 'Laikipia',
];

export default function CheckoutPage() {
  const router = useRouter();
  const { items, totalItems, totalPrice, clearCart } = useCart();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState<FormData>({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    county: '',
    postalCode: '',
    country: 'Kenya',
    paymentMethod: 'mpesa',
    mpesaPhone: '',
    cardNumber: '',
    expiryDate: '',
    cvv: '',
  });

  // Form validation
  const [errors, setErrors] = useState<Partial<Record<keyof FormData, string>>>({});

  // If cart is empty, redirect to shop
  if (items.length === 0) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <div className="text-6xl mb-4">🛒</div>
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Your cart is empty</h2>
        <p className="text-gray-600 mb-6">
          You need items in your cart to proceed to checkout.
        </p>
        <Link href="/shop">
          <Button variant="primary">Start Shopping</Button>
        </Link>
      </div>
    );
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    // Clear error for this field
    if (errors[name as keyof FormData]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  };

  const validate = (): boolean => {
    const newErrors: Partial<Record<keyof FormData, string>> = {};
    if (!formData.firstName.trim()) newErrors.firstName = 'First name is required';
    if (!formData.lastName.trim()) newErrors.lastName = 'Last name is required';
    if (!formData.email.trim()) newErrors.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = 'Invalid email address';
    if (!formData.phone.trim()) newErrors.phone = 'Phone number is required';
    if (!formData.address.trim()) newErrors.address = 'Address is required';
    if (!formData.city.trim()) newErrors.city = 'City is required';
    if (!formData.county) newErrors.county = 'County is required';
    if (!formData.postalCode.trim()) newErrors.postalCode = 'Postal code is required';
    if (!formData.paymentMethod) newErrors.paymentMethod = 'Payment method is required';

    // Conditional validation for payment method details
    if (formData.paymentMethod === 'mpesa') {
      if (!formData.mpesaPhone?.trim()) newErrors.mpesaPhone = 'M-Pesa phone number is required';
      else if (!/^0\d{9}$/.test(formData.mpesaPhone)) newErrors.mpesaPhone = 'Invalid phone number (e.g., 0712345678)';
    }
    if (formData.paymentMethod === 'card') {
      if (!formData.cardNumber?.trim()) newErrors.cardNumber = 'Card number is required';
      if (!formData.expiryDate?.trim()) newErrors.expiryDate = 'Expiry date is required';
      if (!formData.cvv?.trim()) newErrors.cvv = 'CVV is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setIsSubmitting(true);

    // Simulate API call for order creation and payment
    try {
      await new Promise((resolve) => setTimeout(resolve, 1500));

      // For M-Pesa, we would redirect to wait screen
      if (formData.paymentMethod === 'mpesa') {
        router.push('/checkout/mpesa');
        return;
      }

      // For card or bank, redirect to success
      router.push('/checkout/success');
    } catch (error) {
      console.error('Checkout error:', error);
      router.push('/checkout/failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center gap-2 text-sm text-gray-500 mb-6">
        <Link href="/shop" className="hover:text-blue-600">Shop</Link>
        <span>/</span>
        <Link href="/cart" className="hover:text-blue-600">Cart</Link>
        <span>/</span>
        <span className="text-gray-700">Checkout</span>
      </div>

      <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-8">Checkout</h1>

      <form onSubmit={handleSubmit}>
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Main Form */}
          <div className="lg:w-2/3 space-y-6">
            {/* Shipping Address */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Shipping Address</h2>
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
                  <TextInput
                    id="address"
                    label="Address"
                    name="address"
                    value={formData.address}
                    onChange={handleChange}
                    error={errors.address}
                    required
                    placeholder="Street name and building"
                  />
                </div>
                <TextInput
                  id="city"
                  label="City"
                  name="city"
                  value={formData.city}
                  onChange={handleChange}
                  error={errors.city}
                  required
                />
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">County</label>
                  <SelectInput
                    id="county"
                    label="County"
                    name="county"
                    value={formData.county}
                    onChange={handleChange}
                    options={[
                      { value: '', label: 'Select County' },
                      ...COUNTIES.map(c => ({ value: c, label: c }))
                    ]}
                    error={errors.county}
                  />
                </div>
                <TextInput
                  id="postalCode"
                  label="Postal Code"
                  name="postalCode"
                  value={formData.postalCode}
                  onChange={handleChange}
                  error={errors.postalCode}
                  required
                />
                <TextInput
                  id="country"
                  label="Country"
                  name="country"
                  value={formData.country}
                  onChange={handleChange}
                  disabled
                  className="bg-gray-50"
                />
              </div>
            </div>

            {/* Payment Method */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Payment Method</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Select Payment Method</label>
                  <SelectInput
                    id="paymentMethod"
                    label="Payment Method"
                    name="paymentMethod"
                    value={formData.paymentMethod}
                    onChange={handleChange}
                    options={PAYMENT_METHODS}
                    error={errors.paymentMethod}
                  />
                </div>

                {/* Conditional payment details */}
                {formData.paymentMethod === 'mpesa' && (
                  <div className="mt-3 p-4 bg-blue-50 rounded-lg">
                    <p className="text-sm text-blue-700 mb-2">
                      You will receive an M-Pesa STK push on your phone. Please enter the phone number registered with M-Pesa.
                    </p>
                    <TextInput
                      id="mpesaPhone"
                      label="M-Pesa Phone Number"
                      name="mpesaPhone"
                      value={formData.mpesaPhone || ''}
                      onChange={handleChange}
                      error={errors.mpesaPhone}
                      placeholder="0712345678"
                    />
                  </div>
                )}

                {formData.paymentMethod === 'card' && (
                  <div className="mt-3 p-4 bg-gray-50 rounded-lg">
                    <p className="text-sm text-gray-600 mb-2">Enter your card details (test mode).</p>
                    <div className="space-y-3">
                      <TextInput
                        id="cardNumber"
                        label="Card Number"
                        name="cardNumber"
                        value={formData.cardNumber || ''}
                        onChange={handleChange}
                        error={errors.cardNumber}
                        placeholder="1234 5678 9012 3456"
                      />
                      <div className="grid grid-cols-2 gap-3">
                        <TextInput
                          id="expiryDate"
                          label="Expiry Date"
                          name="expiryDate"
                          value={formData.expiryDate || ''}
                          onChange={handleChange}
                          error={errors.expiryDate}
                          placeholder="MM/YY"
                        />
                        <TextInput
                          id="cvv"
                          label="CVV"
                          name="cvv"
                          value={formData.cvv || ''}
                          onChange={handleChange}
                          error={errors.cvv}
                          placeholder="123"
                          type="password"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {formData.paymentMethod === 'bank_transfer' && (
                  <div className="mt-3 p-4 bg-gray-50 rounded-lg">
                    <p className="text-sm text-gray-600">
                      Please transfer the total amount to the following bank account. Reference: Your order number.
                    </p>
                    <div className="mt-2 text-sm bg-white p-3 rounded border border-gray-200">
                      <p><strong>Bank:</strong> Equity Bank</p>
                      <p><strong>Account Name:</strong> Eagle Generation Limited</p>
                      <p><strong>Account Number:</strong> 1234567890</p>
                      <p><strong>Branch:</strong> Nairobi</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Order Summary */}
          <div className="lg:w-1/3">
            <div className="bg-gray-50 rounded-lg p-6 sticky top-24">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Order Summary</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Items ({totalItems})</span>
                  <span className="text-gray-900 font-medium">{formatCurrency(totalPrice, 'KES')}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Shipping</span>
                  <span className="text-gray-900 font-medium">Calculated at checkout</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Tax</span>
                  <span className="text-gray-900 font-medium">Calculated at checkout</span>
                </div>
              </div>
              <hr className="my-4" />
              <div className="flex justify-between text-lg font-bold">
                <span>Total</span>
                <span>{formatCurrency(totalPrice, 'KES')}</span>
              </div>
              <Button
                type="submit"
                variant="primary"
                size="lg"
                className="w-full mt-6"
                disabled={isSubmitting || items.length === 0}
              >
                {isSubmitting ? 'Processing...' : 'Place Order'}
              </Button>
              <Link href="/cart" className="block text-center text-sm text-blue-600 hover:underline mt-3">
                ← Return to Cart
              </Link>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}