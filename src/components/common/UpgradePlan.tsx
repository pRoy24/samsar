import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useUser } from '../../contexts/UserContext.js';
import { getHeaders } from '../../utils/web.js';
import SecondaryButton from './SecondaryButton.tsx';
import { FaChevronDown, FaChevronUp } from 'react-icons/fa';

import { loadStripe } from '@stripe/stripe-js';

import { STRIPE_PUBLIC_KEY } from '../../constants/ApplicationConstants.js';
import { set } from 'mongoose';

const stripePromise = loadStripe(STRIPE_PUBLIC_KEY);

const PROCESSOR_SERVER = process.env.REACT_APP_PROCESSOR_API;

export default function UpgradePlan() {

  const { user } = useUser();

  const [isCouponOpen, setIsCouponOpen] = useState(false);
  const [couponCode, setCouponCode] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const [ appliedCoupon, setAppliedCoupon ] = useState({});



  const [showApplyCouponDisplay, setShowApplyCouponDisplay] = useState(true);

  const upgradePlan = async () => {

    try {
      if (!user || !user._id) {
        return console.error('User not found');
      }

      let payload = {};
      if (user.email) {
        payload = {
          email: user.email
        }
      }
      console.log(appliedCoupon);

      if (appliedCoupon && appliedCoupon.couponCode) {
        payload.couponCode = appliedCoupon.couponCode;
      }

      const headers = getHeaders();

      const { data } = await axios.post(`${PROCESSOR_SERVER}/users/upgrade_plan`, payload, headers); // Adjust as needed
      const stripe = await stripePromise;

      window.open(data.url, '_blank');

      //const { error } = await stripe.redirectToCheckout({ sessionId: data.id });

    } catch (error) {
      console.error('Upgrade plan error:', error);
    }


  }


  const requestApplyCreditsCoupon = async (couponCode) => {
    console.log('Applying coupon code:', couponCode);

    const headers = getHeaders();

    const payload = {
      couponCode,
      redemptionType: 'subscription',

    }
    const couponRequestResponse = await axios.post(`${PROCESSOR_SERVER}/accounts/redeem_coupon_code`, payload, headers);

    console.log(couponRequestResponse);
    const couponData = couponRequestResponse.data;
    if (couponData.success) {
      setErrorMessage('');
      console.log('Coupon applied successfully');

      setAppliedCoupon(couponData.coupon);
      setShowApplyCouponDisplay(false);
    } else {
      setErrorMessage(couponData.message);
    }
  }

  const handleApplyCoupon = () => {
    console.log(`Applying coupon code: ${couponCode}`);
    // Implement coupon application logic here
    requestApplyCreditsCoupon(couponCode);
  };


  let showCouponDisplay = null;


  if (showApplyCouponDisplay) {
    showCouponDisplay = (
      <div className="m-auto mb-8">
        <div
          className="m-auto cursor-pointer text-neutral-100 "
          onClick={() => setIsCouponOpen(!isCouponOpen)}
        >
          <span>Have a credits coupon?</span>
          {isCouponOpen ? <FaChevronUp className='inline-flex ml-2' /> : <FaChevronDown className='inline-flex ml-2' />}
        </div>
        {isCouponOpen && (
          <div className="mt-4">
            <input
              type="text"
              placeholder="Enter credits code"
              value={couponCode}
              onChange={(e) => setCouponCode(e.target.value)}
              className={`p-2 border rounded mb-2 bg-gray-950 text-neutral-100`}
            />
            <div>
              <SecondaryButton onClick={handleApplyCoupon}>
                Apply Coupon
              </SecondaryButton>
            </div>
          </div>
        )}
      </div>
    )
  } else {
    showCouponDisplay = (
      <div className="m-auto mb-8">
        <div className="m-auto cursor-pointer text-green-500 mt-4 ">
          <span>Coupon applied successfully</span>
        </div>
      </div>
    )
  }

  return (
    <div>
      <div className='text-center mt-4 mb-4 font-bold'>
        Ready to upgrade and unlock all features?
      </div>
      <div className='text-center mt-4 mb-4'>
        <div>
          <div>
            No watermarks
          </div>
          <div>
            1000 generation credits/month
          </div>
          <div>
            Priority access to new features.
          </div>
        </div>
        <div>
          $ 9.99 / mo
        </div>


        <div>
          {showCouponDisplay}
        </div>


        <button className={`h-[60px] w-[200px] m-auto bg-gray-950 mt-4  cursor-pointer`} onClick={upgradePlan}>
          Upgrade Now
        </button>
      </div>
    </div>
  )
}
