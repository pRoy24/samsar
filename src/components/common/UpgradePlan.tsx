import React from 'react';
import axios from 'axios';
import { useUser } from '../../contexts/UserContext.js';
import { getHeaders } from '../../utils/web.js';

import { loadStripe } from '@stripe/stripe-js';

import { STRIPE_PUBLIC_KEY } from '../../constants/ApplicationConstants.js'; 

const stripePromise = loadStripe(STRIPE_PUBLIC_KEY);

const PROCESSOR_SERVER = process.env.REACT_APP_PROCESSOR_API;

export default function UpgradePlan() {

  const { user } = useUser();


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
      const headers = getHeaders();

      const { data } = await axios.post(`${PROCESSOR_SERVER}/users/upgrade_plan`, payload, headers); // Adjust as needed
      const stripe = await stripePromise;

      window.open(data.url, '_blank');

      //const { error } = await stripe.redirectToCheckout({ sessionId: data.id });

    } catch (error) {
      console.error('Upgrade plan error:', error);
    }


  }
  return (
    <div>
      <div className='text-center mt-4 mb-4 font-bold'>
        Upgrade Plan
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

          <button className={`h-[60px] w-[200px] m-auto bg-gray-950 mt-4  cursor-pointer`} onClick={upgradePlan}>
            Upgrade Now
          </button>
      </div>  
    </div>
  )
}