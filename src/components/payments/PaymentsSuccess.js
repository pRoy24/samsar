import React from 'react';
import   CommonContainer  from '../common/CommonContainer.tsx';

export default function PaymentsSuccess() {
  return (
    <CommonContainer>
    <div className='text-white mt-[90px]'>
      <h1>Payment Succeeded</h1>
      <p>Payment Succeeded. You can safely close this page.</p>
    </div>
    </CommonContainer>
  );
}