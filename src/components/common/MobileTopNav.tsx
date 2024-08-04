import React, { useEffect, useState, useRef } from 'react';
import axios from 'axios';
import { useUser } from '../../contexts/UserContext';
import CommonButton from './CommonButton.tsx';
import { useNavigate } from 'react-router-dom';
import { useAlertDialog } from '../../contexts/AlertDialogContext';
import { IoMdLogIn } from 'react-icons/io';
import ToggleButton from './ToggleButton.tsx';
import { useColorMode } from '../../contexts/ColorMode.js';
import { IoMdWallet } from 'react-icons/io';
import Login from '../auth/Login.tsx';
import UpgradePlan from './UpgradePlan.tsx';
import AddSessionDropdown from './AddSessionDropdown.js';
import './common.css';
import { FaTwitter, FaStar } from 'react-icons/fa6';
import AuthContainer from '../auth/AuthContainer.js';
import { getHeaders } from '../../utils/web.js';

const PROCESSOR_SERVER = process.env.REACT_APP_PROCESSOR_API;

export default function MobileTopNav(props) {
  const { resetCurrentSession, addCustodyAddress } = props;
  const farcasterSignInButtonRef = useRef(null);
  const { colorMode } = useColorMode();
  const { openAlertDialog, closeAlertDialog } = useAlertDialog();

  let bgColor = 'from-cyber-black via-blue-900 to-neutral-900 text-neutral-50';

  if (colorMode === 'light') {
    bgColor = 'from-green-700 to-green-400 text-neutral-900';
  }

  const resetSession = () => {
    closeAlertDialog();
    createNewSession();
  };

  const alertDialogComponent = (
    <div>
      <div>This will reset your current session. Are you sure you want to proceed?</div>
      <div className="mt-4 mb-4 m-auto">
        <div className="inline-flex ml-2 mr-2">
          <CommonButton
            onClick={() => {
              resetSession();
            }}
          >
            Yes
          </CommonButton>
        </div>
        <div className="inline-flex ml-2 mr-2">
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
  );

  const { user, setUser } = useUser();
  const navigate = useNavigate();

  const [userProfileData, setUserProfileData] = useState({});

  let userProfile = <span />;

  const gotoUserAccount = () => {
    navigate('/account');
  };

  const showLoginDialog = () => {
    const loginComponent = <AuthContainer />;
    openAlertDialog(loginComponent);
  };

  const upgradeToPremiumTier = () => {
    const alertDialogComponent = <UpgradePlan />;
    openAlertDialog(alertDialogComponent);
  };

  const createNewSession = () => {
    const headers = getHeaders();
    const payload = {
      prompts: [],
    };
    axios.post(`${PROCESSOR_SERVER}/video_sessions/create_video_session`, payload, headers).then(function (response) {
      const session = response.data;
      const sessionId = session._id.toString();
      localStorage.setItem('videoSessionId', sessionId);
      navigate(`/video/${session._id}`);
    });
  };

  const gotoViewSessionsPage = () => {
    navigate('/my_sessions');
  };

  const createNewSessionDialog = () => {
    openAlertDialog(alertDialogComponent);
  };

  let userTierDisplay = <span />;

  let bottomToggleDisplay = <span />;

  let userCredits;
  let nextUpdate;

  if (user && user._id) {
    if (user.isPremiumUser) {
      userTierDisplay = (
        <div>
          <FaStar className="inline-flex text-neutral-100" /> Premium
        </div>
      );
    } else {
      userTierDisplay = (
        <div>
          <FaStar className="inline-flex text-neutral-700" /> Upgrade
        </div>
      );
    }

    userCredits = user.generationCredits;

    if (user.isPremiumUser) {
      const now = new Date();
      const lastUpdated = new Date(user.premiumUserCreditsLastUpdated);
      const nextUpdateDate = new Date(lastUpdated);
      nextUpdateDate.setMonth(nextUpdateDate.getMonth() + 1);
      const timeDiff = nextUpdateDate.getTime() - now.getTime();
      nextUpdate = Math.ceil(timeDiff / (1000 * 3600 * 24));
    }

    userProfile = (
      <div className="flex items-center justify-end cursor-pointer" onClick={gotoUserAccount}>
        <div className="flex flex-col text-left mr-2">
          <div className="text-md max-w-[90px] whitespace-nowrap overflow-hidden text-ellipsis">
            <h1>{user.displayName ? user.displayName : user.email}</h1>
          </div>
          <div onClick={upgradeToPremiumTier} className="cursor-pointer">
            {userTierDisplay}
          </div>
        </div>
        <img
          src={user.pfpUrl ? user.pfpUrl : '/46.png'}
          alt={user.username}
          className="w-[50px] rounded-full"
        />
      </div>
    );

    bottomToggleDisplay = (
      <div className="flex justify-end">
        <ToggleButton />
      </div>
    );
  } else {
    userProfile = (
      <div className="mt-1 flex justify-end">
        <button
          className="m-auto text-center min-w-16 rounded-lg shadow-lg text-neutral-100 bg-cyber-black pl-8 pr-8 pt-1 pb-2 font-bold text-lg"
          onClick={showLoginDialog}
        >
          <IoMdLogIn className="inline-flex" /> Login
        </button>
      </div>
    );
  }

  const gotoHome = () => {
    openAlertDialog(alertDialogComponent);
  };

  let addSessionButton = <span />;

  if (user && user._id) {
    addSessionButton = (

      <div className="">
        <AddSessionDropdown createNewSession={createNewSessionDialog} gotoViewSessionsPage={gotoViewSessionsPage} />
      </div>

    );
  }

  let daysToUpdate = <span />;
  let userCreditsDisplay = <span />;
  if (user && user._id) {
    if (user.isPremiumUser) {
      daysToUpdate = <div>{nextUpdate} days until update</div>;
    } else {
      daysToUpdate = <div>Free Tier</div>;
    }
    userCreditsDisplay = <div>{userCredits} credits</div>;
  }

  return (
    <div className={`bg-gradient-to-r ${bgColor} h-[50px] fixed w-[100vw] shadow-lg z-10`}>
      <div className="flex flex-basis">
        <div className='basis-1/4'>
          <img src={'/log_ff1.png'} className="cursor-pointer h-[44px] w-[44px] ml-2 mt-1 mr-2" onClick={gotoHome} />
        </div>
        <div className="basis-3/4  ">
          <div className="text-xs inline-flex">
            <div>{addSessionButton}</div>
          </div>
          <div className=" inline-flex float-right mr-2">{userProfile}</div>
        </div>

      </div>
    </div>
  );
}
