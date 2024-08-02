import React, { useState } from 'react';
import Login from './Login.tsx';
import Register from './Register.tsx';
import axios from 'axios';
import { useAlertDialog } from '../../contexts/AlertDialogContext.js';
import { useUser } from '../../contexts/UserContext.js';
import { useNavigate, useLocation } from 'react-router-dom';
import { getHeaders } from '../../utils/web.js';
const PROCESSOR_SERVER = process.env.REACT_APP_PROCESSOR_API;

export default function AuthContainer() {
  const [ currentLoginView, setCurrentLoginView ] = useState('login');

  const API_SERVER = process.env.REACT_APP_PROCESSOR_API;
  const navigate = useNavigate();
  const location = useLocation();  // Get the current location
  const { openAlertDialog, closeAlertDialog } = useAlertDialog();
  const { setUser } = useUser();

  const siginToTwitter = () => {
    let currentMediaFlowPath = 'video';
    if (location.pathname.includes('/quick_video/')) {
      currentMediaFlowPath = 'quick_video';
    }
    localStorage.setItem('currentMediaFlowPath', currentMediaFlowPath);
    
    axios.get(`${PROCESSOR_SERVER}/users/twitter_login`).then(function (dataRes) {
      const authPayload = dataRes.data;
      const twitterAuthUrl = authPayload.loginUrl;
      window.open(twitterAuthUrl, '_blank');
    })
    closeAlertDialog();

  }

  const registerToTwitter = () => {
    axios.get(`${PROCESSOR_SERVER}/users/twitter_login`).then(function (dataRes) {
      const authPayload = dataRes.data;
      const twitterAuthUrl = authPayload.loginUrl;
      window.open(twitterAuthUrl, '_blank');
    })
    closeAlertDialog();
  
  }

  const verifyAndSetUserProfile = (profile) => {
    axios.post(`${PROCESSOR_SERVER}/users/verify`, profile).then(function (dataRes) {
      const userData = dataRes.data;
      const authToken = userData.authToken;
      localStorage.setItem('authToken', authToken);
      setUser(userData);
      closeAlertDialog();
    })
  }

  const getOrCreateUserSession = () => {
    const headers = getHeaders();

    axios.get(`${API_SERVER}/video_sessions/get_or_create_session`, headers).then((res) => {
      const sessionData = res.data;
      localStorage.setItem('videoSessionId', sessionData._id);

      // Check the current path and navigate accordingly
      if (location.pathname.includes('/video/')) {
        navigate(`/video/${sessionData._id}`);
      } else {
        navigate(`/quick_video/${sessionData._id}`);
      }
    });

  }

  if (currentLoginView === 'login') {
    return (
      <Login setCurrentLoginView={setCurrentLoginView} 
      siginToTwitter={siginToTwitter}
      verifyAndSetUserProfile={verifyAndSetUserProfile}
      setUser={setUser}
      closeAlertDialog={closeAlertDialog}
      getOrCreateUserSession={getOrCreateUserSession}
      />
    )
  }
  return (
    <Register setCurrentLoginView={setCurrentLoginView} 
    registerToTwitter={registerToTwitter}
    verifyAndSetUserProfile={verifyAndSetUserProfile} 
    setUser={setUser}
    getOrCreateUserSession={getOrCreateUserSession}
    closeAlertDialog={closeAlertDialog}
    />
  )
}
