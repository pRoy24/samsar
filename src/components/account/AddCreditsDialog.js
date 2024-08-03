import React, { useState } from 'react';
import SingleSelect from '../common/SingleSelect.js';
import CommonButton from '../common/CommonButton.tsx';

const creditOptions = [
  { value: 10, label: '$10' },
  { value: 25, label: '$25' },
  { value: 50, label: '$50' },
  { value: 100, label: '$100' },
  { value: 500, label: '$500' },
  { value: 1000, label: '$1000' },
];

export default function AddCreditsDialog(props) {
  const { purchaseCreditsForUser} = props;


  const [selectedOption, setSelectedOption] = useState({
    value: 10,
    label: '$10',
  });

  const handlePurchase = () => {
    if (selectedOption) {
      const creditsToPurchase = selectedOption.value * 100;
      console.log(`Purchased ${creditsToPurchase} credits for ${selectedOption.label}`);
      // Implement your purchase logic here
     // purchaseCreditsForUser(selectedOption.value);

     purchaseCreditsForUser(selectedOption.value);
    }
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
      
      <CommonButton onClick={handlePurchase}>
        Purchase
      </CommonButton>
    </div>
  );
}
