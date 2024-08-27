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

  const upgradePlan = async () => {
    try {
      if (!user || !user._id) {
        return console.error('User not found');
      }

      let payload = { email: user.email };

      if (appliedCoupon && appliedCoupon.couponCode) {
        payload.couponCode = appliedCoupon.couponCode;
      }

      const headers = getHeaders();
      const { data } = await axios.post(`${PROCESSOR_SERVER}/users/upgrade_plan`, payload, headers);
      const stripe = await stripePromise;

      window.open(data.url, '_blank');
    } catch (error) {
      console.error('Upgrade plan error:', error);
    }
  };

  const requestApplyCreditsCoupon = async (couponCode) => {
    const headers = getHeaders();
    const payload = { couponCode, redemptionType: 'subscription' };

    try {
      const couponRequestResponse = await axios.post(`${PROCESSOR_SERVER}/accounts/redeem_coupon_code`, payload, headers);
      const couponData = couponRequestResponse.data;

      if (couponData.success) {
        setErrorMessage('');
        setAppliedCoupon(couponData.coupon);
        setShowApplyCouponDisplay(false);
      } else {
        setErrorMessage(couponData.message);
      }
    } catch (error) {
      console.error('Error applying coupon:', error);
      setErrorMessage('Failed to apply coupon. Please try again.');
    }
  };

  const handleApplyCoupon = () => {
    requestApplyCreditsCoupon(couponCode);
  };

  return (
    <div className="max-w-lg mx-auto p-6  text-neutral-100 rounded-lg shadow-lg">
      <div className="text-center mb-6">
        <h1 className="text-2xl font-bold">Upgrade Your Plan</h1>
        <p className="text-lg mt-2">Unlock all features and enjoy premium benefits.</p>
      </div>

      <ul className="list-disc list-inside mb-6 text-left space-y-2">
        <li>No watermarks</li>
        <li>1000 generation credits/month</li>
        <li>Priority access to new features</li>
      </ul>

      <div className="text-center text-2xl font-semibold mb-6">$9.99 / mo</div>

      <div className="mb-6">
        {showApplyCouponDisplay ? (
          <div>
            <div
              className="cursor-pointer text-center"
              onClick={() => setIsCouponOpen(!isCouponOpen)}
            >
              <span>Have a coupon?</span>
              {isCouponOpen ? <FaChevronUp className="inline-flex ml-2" /> : <FaChevronDown className="inline-flex ml-2" />}
            </div>
            {isCouponOpen && (
              <div className="mt-4">
                <input
                  type="text"
                  placeholder="Enter coupon code"
                  value={couponCode}
                  onChange={(e) => setCouponCode(e.target.value)}
                  className="p-2 w-full border rounded bg-gray-950 text-neutral-100"
                />
                <div className="text-center mt-4">
                  <SecondaryButton onClick={handleApplyCoupon}>Apply Coupon</SecondaryButton>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="text-center text-green-500">
            <span>Coupon applied successfully</span>
          </div>
        )}
        {errorMessage && (
          <div className="text-center text-red-500 mt-2">
            <span>{errorMessage}</span>
          </div>
        )}
      </div>

      <div className="text-center">
        <button
          className="w-full py-3 bg-green-600 hover:bg-green-700 rounded-lg font-bold"
          onClick={upgradePlan}
        >
          Upgrade Now
        </button>
      </div>
    </div>
  );
}
