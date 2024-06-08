import React, { useEffect, useState } from 'react';
import { SignInButton, useProfile, useSignIn } from '@farcaster/auth-kit';
import { useUser } from '../../contexts/UserContext';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import './landing.css';
import ListProduct from '../product/ListProduct.tsx';

export default function PublicLanding() {


  const {
    isAuthenticated,
    profile,
  } = useProfile();

  const { setUserApi, user, setUser } = useUser();
  const navigate = useNavigate();
  const [isProcessing, setIsProcessing] = useState(false);
  const [userProfileData, setUserProfileData] = useState({});
  const [isFarcasterSignupCompleted, setIsFarcasterSignupCompleted] = useState(true);



  useEffect(() => {
    if (user && user.fid) {
    //  navigate('/')
      // checkFarcasterSignupStatus();
    }
  }, [user]);


  const setUserProfile = (profile) => {
    if (!isProcessing) {
      setIsProcessing(true);
      setUserProfileData(profile);
    }
  }



  const checkFarcasterSignupStatus = () => {
    const payload = {
      fid: user.fid,
    }
    axios.post(`${PROCESSOR_SERVER}/users/poll_signer`, payload).then(function (res) {
      const resData = res.data;
      if (resData.status === "COMPLETED") {
        setIsFarcasterSignupCompleted(true);
      } else {
        setIsFarcasterSignupCompleted(false);
      }
    }).catch(function (err) {
      setIsFarcasterSignupCompleted(false);
    });
  }
  useEffect(() => {
    if (isProcessing && userProfileData && userProfileData.fid) {
      setUserApi(userProfileData);
    }

  }, [isProcessing, userProfileData]);

  return (
    <div>
      <div className=' bg-stone-200 rounded-lg m-auto text-center w-full pt-[50px] pb-[50px]'>
        <SignInButton
          onSuccess={(profile) => setUserProfile(profile)}
        />
        <div className='mt-2 text-sm'>
          Don't have a Farcaster account?
          <a href="https://warpcast.com/~/invite-page/400220?id=ecc67eab" className='underline cursor-pointer 
          hover:text-neutral-800'> Sign up (Referral link)</a>
        </div>
      </div>
      <div>
        <ListProduct />
      </div>
    </div>
  )
}