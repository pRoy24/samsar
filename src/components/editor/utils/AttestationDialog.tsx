import React from 'react';
import CommonButton from '../../common/CommonButton.tsx';

export default function AttestationDialog(props) {
  const { onSubmit } = props;

  return (
    <div>
      <div className='text-xl font-bold'>
        Create Attestation
      </div>
      <div className='pl-4 text-left'>
        <div className='mt-2 font-bold'>
          Please verify the following -
        </div>
        <ol className="list-decimal">
          <li>
            This image does not contain any illegal content.
          </li>
          <li>
            This image is your original work.
          </li>
          <li>
            This image does not contain any copyrighted material.
          </li>
          <li>
            This image does not contain more than 50% AI generated content.
          </li>
        </ol>
      </div>


      <div className='pt-4 boder-top-2 border-color-black text-sm bg-neutral-200 pl-2 pr-2 pb-4 rounded-sm mt-2'>

        <div className='mb-4'>
          <p>


            I agee that the image is my original work and does not contain any illegal content.
            Upon dispute, I agree to manual verification of checkpoints.
          </p>
          <p>


            If the image is found to be in violation of any of the above, I agree to forefeiting the NFT and any associated royalties
            and permanent banning of my account.
          </p>

        </div>

        <CommonButton onClick={onSubmit}>
          I Agree
        </CommonButton>
      </div>
    </div>
  )
}