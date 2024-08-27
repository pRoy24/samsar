import React, { useState } from 'react';
import SingleSelect from '../common/SingleSelect.js';
import CommonButton from '../common/CommonButton.tsx';
import SecondaryButton from '../common/SecondaryButton.tsx';
import { FaChevronDown, FaChevronUp } from 'react-icons/fa';

const creditOptions = [
  { value: 10, label: '$10' },
  { value: 25, label: '$25' },
  { value: 50, label: '$50' },
  { value: 100, label: '$100' },
  { value: 500, label: '$500' },
  { value: 1000, label: '$1000' },
];

export default function AddCreditsDialog(props) {
  const { purchaseCreditsForUser , requestApplyCreditsCoupon} = props;

  const [selectedOption, setSelectedOption] = useState({
    value: 10,
    label: '$10',
  });

  const [isCouponOpen, setIsCouponOpen] = useState(false);
  const [couponCode, setCouponCode] = useState('');

  const handlePurchase = () => {
    if (selectedOption) {
      const creditsToPurchase = selectedOption.value * 100;
      console.log(`Purchased ${creditsToPurchase} credits for ${selectedOption.label}`);
      // Implement your purchase logic here
      purchaseCreditsForUser(selectedOption.value);
    }
  };

  const handleApplyCoupon = () => {
    console.log(`Applying coupon code: ${couponCode}`);
    // Implement coupon application logic here
    requestApplyCreditsCoupon(couponCode);
  };

  return (
    <div className="p-4">
      <h2 className="text-xl font-semibold mb-4">Purchase Credits</h2>
      
      <SingleSelect 
        options={creditOptions} 
        value={selectedOption} 
        onChange={setSelectedOption} 
        placeholder="Select amount"
        className="mb-4"
      />
      
      {selectedOption && (
        <div className="mb-4 mt-4">
          <span>You will receive {parseInt(selectedOption.value) * 100} credits for {selectedOption.label}</span>
        </div>
      )}

      <div className="m-auto mb-8">
        <div
          className="m-auto cursor-pointer text-neutral-100 "
          onClick={() => setIsCouponOpen(!isCouponOpen)}
        >
          <span>Have a credits coupon?</span>
          {isCouponOpen ? <FaChevronUp className='inline-flex ml-2'/> : <FaChevronDown className='inline-flex ml-2'/>}
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

      <CommonButton onClick={handlePurchase}>
        Purchase
      </CommonButton>
    </div>
  );
}
