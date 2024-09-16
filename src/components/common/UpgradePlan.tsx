import React, { useState } from 'react';
import axios from 'axios';
import { useUser } from '../../contexts/UserContext.js';
import { getHeaders } from '../../utils/web.js';
import SecondaryButton from './SecondaryButton.tsx';
import { FaChevronDown, FaChevronUp } from 'react-icons/fa';
import { loadStripe } from '@stripe/stripe-js';
import { STRIPE_PUBLIC_KEY } from '../../constants/ApplicationConstants.js';

const stripePromise = loadStripe(STRIPE_PUBLIC_KEY);
const PROCESSOR_SERVER = process.env.REACT_APP_PROCESSOR_API;

export default function UpgradePlan() {
  const { user } = useUser();
  const [isCouponOpen, setIsCouponOpen] = useState(false);
  const [couponCode, setCouponCode] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState({});
  const [showApplyCouponDisplay, setShowApplyCouponDisplay] = useState(true);
  const [selectedPlan, setSelectedPlan] = useState('Premium');
  const [isLoading, setIsLoading] = useState(false);

  const upgradePlan = async () => {
    try {
      if (!user || !user._id) {
        console.error('User not found');
        return;
      }

      setIsLoading(true);

      let payload = {
        email: user.email,
        plan: selectedPlan.toLowerCase(), // 'premium' or 'professional'
      };

      if (appliedCoupon && appliedCoupon.couponCode) {
        payload.couponCode = appliedCoupon.couponCode;
      }

      const headers = getHeaders();
      const { data } = await axios.post(
        `${PROCESSOR_SERVER}/users/upgrade_plan`,
        payload, 
        headers 
      );
      const stripe = await stripePromise;

      window.open(data.url, '_blank');
    } catch (error) {
      console.error('Upgrade plan error:', error);
      setErrorMessage('Failed to upgrade the plan. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const applyCoupon = async () => {
    if (!couponCode.trim()) {
      setErrorMessage('Please enter a coupon code.');
      return;
    }

    try {
      setIsLoading(true);
      const headers = getHeaders();
      const payload = { couponCode: couponCode.trim(), redemptionType: 'subscription' };

      const response = await axios.post(
        `${PROCESSOR_SERVER}/accounts/redeem_coupon_code`,
        payload,
        { headers }
      );
      const couponData = response.data;

      if (couponData.success) {
        setAppliedCoupon(couponData.coupon);
        setErrorMessage('');
        setShowApplyCouponDisplay(false);
      } else {
        setErrorMessage(couponData.message || 'Invalid coupon code.');
      }
    } catch (error) {
      console.error('Error applying coupon:', error);
      setErrorMessage('Failed to apply coupon. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 text-neutral-100 rounded-lg shadow-lg">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold">Choose Your Plan</h1>
        <p className="text-lg mt-2">Unlock all features and enjoy premium benefits.</p>
      </div>

      <div className="flex flex-col md:flex-row justify-center items-start space-y-6 md:space-y-0 md:space-x-6 mb-8">
        {/* Premium Plan */}
        <div
          className={`flex-1 border rounded-lg p-6 cursor-pointer transform transition-transform hover:scale-105 ${
            selectedPlan === 'Premium' ? 'border-blue-500 shadow-lg' : 'border-gray-700'
          }`}
          onClick={() => setSelectedPlan('Premium')}
        >
          <h2 className="text-2xl font-bold mb-4">Premium</h2>
          <div className="text-2xl font-semibold mb-6">
            $9.99<span className="text-xl font-normal"> / mo</span>
          </div>
          <ul className="list-disc list-inside mb-6 space-y-2 text-left">
            <li>No watermarks</li>
            <li>1000 generation credits/month</li>
            <li>Priority access to new features</li>
          </ul>
          {selectedPlan === 'Premium' && (
            <div className="text-center mt-4">
              <span className="px-4 py-2 bg-blue-500 text-white rounded-full">Selected</span>
            </div>
          )}
        </div>

        {/* Professional Plan */}
        <div
          className={`flex-1 border rounded-lg p-6 cursor-pointer transform transition-transform hover:scale-105 ${
            selectedPlan === 'Professional' ? 'border-blue-500 shadow-lg' : 'border-gray-700'
          }`}
          onClick={() => setSelectedPlan('Professional')}
        >
          <h2 className="text-2xl font-bold mb-4">Professional</h2>
          <div className="text-2xl font-semibold mb-6">
            $49.99<span className="text-xl font-normal"> / mo</span>
          </div>
          <ul className="list-disc list-inside mb-6 space-y-2 text-left">
            <li>All Premium Features</li>
            <li>10k generation credits/month</li>
            <li>Dedicated support</li>
          </ul>
          {selectedPlan === 'Professional' && (
            <div className="text-center mt-4">
              <span className="px-4 py-2 bg-blue-500 text-white rounded-full">Selected</span>
            </div>
          )}
        </div>
      </div>

      <div className="mb-8">
        {showApplyCouponDisplay ? (
          <div>
            <div
              className="cursor-pointer flex justify-center items-center text-sm text-blue-400 hover:text-blue-300"
              onClick={() => setIsCouponOpen(!isCouponOpen)}
            >
              <span>Have a coupon?</span>
              {isCouponOpen ? <FaChevronUp className="ml-2" /> : <FaChevronDown className="ml-2" />}
            </div>
            {isCouponOpen && (
              <div className="mt-4">
                <input
                  type="text"
                  placeholder="Enter coupon code"
                  value={couponCode}
                  onChange={(e) => setCouponCode(e.target.value)}
                  className="w-full p-2 bg-gray-800 border border-gray-600 rounded text-white focus:outline-none focus:border-blue-500"
                />
                <button
                  onClick={applyCoupon}
                  className="w-full mt-3 py-2 bg-blue-600 hover:bg-blue-700 rounded text-white font-semibold"
                  disabled={isLoading}
                >
                  {isLoading ? 'Applying...' : 'Apply Coupon'}
                </button>
              </div>
            )}
          </div>
        ) : (
          <div className="text-center text-green-500 text-sm">
            Coupon <strong>{appliedCoupon.couponCode}</strong> applied successfully!
          </div>
        )}
        {errorMessage && (
          <div className="text-center text-red-500 text-sm mt-2">
            {errorMessage}
          </div>
        )}
      </div>

      <button
        className="w-full py-3 bg-green-600 hover:bg-green-700 rounded-lg font-bold disabled:opacity-50"
        onClick={upgradePlan}
        disabled={isLoading}
      >
        {isLoading ? 'Processing...' : `Upgrade to ${selectedPlan}`}
      </button>
    </div>
  );
}
