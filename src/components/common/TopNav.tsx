import React, { useEffect, useState, useRef } from 'react';

import axios from 'axios';
import { useUser } from '../../contexts/UserContext'
import CommonButton from './CommonButton.tsx';
import { useNavigate } from 'react-router-dom';

import QRCode from "react-qr-code";
import { useAlertDialog } from '../../contexts/AlertDialogContext';
import { IoMdLogIn } from "react-icons/io";
import ToggleButton from './ToggleButton.tsx';
import {
  ConnectButton,
} from "thirdweb/react";

import { useColorMode } from '../../contexts/ColorMode.js';
import { IoMdWallet } from "react-icons/io";
import Login from '../auth/Login.tsx';
import UpgradePlan from './UpgradePlan.tsx';
import AddSessionDropdown from './AddSessionDropdown.js';


import './common.css';
import { FaTwitter, FaStar } from 'react-icons/fa6';
import Register from '../auth/Register.tsx';
import AuthContainer from '../auth/AuthContainer.js';
import { getHeaders } from '../../utils/web.js';


const PROCESSOR_SERVER = process.env.REACT_APP_PROCESSOR_API;

export default function TopNav(props) {
  const { resetCurrentSession, addCustodyAddress } = props;
  const farcasterSignInButtonRef = useRef(null);
  const { colorMode } = useColorMode();
  const { openAlertDialog, closeAlertDialog } = useAlertDialog();



  let bgColor = 'from-cyber-black via-blue-900 to-neutral-900 text-neutral-50';

  if (colorMode === 'light') {
    bgColor = 'from-green-700 to-green-400  text-neutral-900';
  }
  const resetSession = () => {

    closeAlertDialog();
    createNewSession();
  }

  const { user, setUser } = useUser();
  const navigate = useNavigate();

  const [userProfileData, setUserProfileData] = useState({});

  let userProfile = <span />;



  const gotoUserAccount = () => {
    navigate('/account');
  }


  const showLoginDialog = () => {
    const loginComponent = (
      <AuthContainer />
    )
    openAlertDialog(loginComponent);
  }


  const upgradeToPremiumTier = () => {
    const alertDiaplogComponent = (
      <UpgradePlan />
    )
    openAlertDialog(alertDiaplogComponent);
  }

  const createNewSession = () => {

    const headers = getHeaders();
    const payload = {
      prompts: [],
    }
    axios.post(`${PROCESSOR_SERVER}/video_sessions/create_video_session`, payload, headers).then(function (response) {
      const session = response.data;
      navigate(`/video/${session._id}`);
    });
  }

  const gotoViewSessionsPage = () => {
//    navigate('/sessions');

  }
  let userTierDisplay = <span />;

  if (user && user._id) {

    if (user.isPremiumUser) {
      userTierDisplay = (
        <div >
          <FaStar className='inline-flex' /> Premium
        </div>
      )
    } else {
      userTierDisplay = (
        <div >
          <FaStar className='inline-flex text-neutral-100' /> Upgrade
        </div>
      )
    }
    userProfile = (
      <div className='flex cursor' onClick={gotoUserAccount} >
        <div className='inline-flex '>
          <div className='block'>


            <div className='text-lg mr-2 max-w-[90px] whitespace-nowrap overflow-hidden text-ellipsis'>
              <h1>{user.displayName ? user.displayName : user.email}</h1>
            </div>
            <div onClick={upgradeToPremiumTier}>
              {userTierDisplay}
            </div>
          </div>

        </div>

        <img src={user.pfpUrl ? user.pfpUrl : '/46.png'} alt={user.username} className='w-[50px] rounded-[50%] inline-flex' />
      </div>
    );
  } else {
    const nonce = Math.random().toString(36).substring(7);
    userProfile = (
      <div className='mt-1'>
        <button className='m-auto text-center min-w-16
    rounded-lg shadow-lg text-neutral-100 bg-cyber-black pl-8 pr-8 pt-1 pb-2 text-bold
    cursor:pointer font-bold text-lg' onClick={() => { showLoginDialog() }}>
          <IoMdLogIn className='inline-flex' /> Login
        </button>
      </div>
    )
  }

  const gotoHome = () => {
    const alertDialogComponent = (
      <div>
        <div>
          This will reset your current session. Are you sure you want to proceed?
        </div>
        <div className=' mt-4 mb-4 m-auto'>
          <div className='inline-flex ml-2 mr-2'>
            <CommonButton
              onClick={() => {
                resetSession();
              }}
            >
              Yes
            </CommonButton>
          </div>
          <div className='inline-flex ml-2 mr-2'>
            <CommonButton
              onClick={() => {
                closeAlertDialog();
              }}
            >
              No
            </CommonButton>
          </div>
        </div>
      </div>
    )
    openAlertDialog(alertDialogComponent);
  }

  let addSessionButton = <span />;

  if (user && user._id) {
    addSessionButton = (
      <div className='inline-flex'>
        <div className='inline-flex ml-2 mr-2'>
          <AddSessionDropdown
            createNewSession={createNewSession}
            gotoViewSessionsPage={gotoViewSessionsPage}
          />
        </div>
      </div>
    )
  }

  return (
    <div className={`bg-gradient-to-r ${bgColor}
      h-[50px] fixed w-[100vw] shadow-lg z-10`}>
      <div className='grid grid-cols-4'>
        <div>
          <img src={'/one.png'} className='cursor-pointer' onClick={() => gotoHome()} />
        </div>
        <div>

        </div>
        <div>
          {addSessionButton}
        </div>
        <div>
          <div className='inline-flex'>
            {userProfile}
            <div className='inline-flex ml-2 mr-2'>
              <ToggleButton />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
