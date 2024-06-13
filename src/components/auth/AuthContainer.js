import React, { useState } from 'react';
import Login from './Login.tsx';
import Register from './Register.tsx';
import axios from 'axios';
import { useAlertDialog } from '../../contexts/AlertDialogContext.js';
import { useUser } from '../../contexts/UserContext.js';
const PROCESSOR_SERVER = process.env.REACT_APP_PROCESSOR_API;

export default function AuthContainer() {
  const [ currentLoginView, setCurrentLoginView ] = useState('login');

  const { openAlertDialog, closeAlertDialog } = useAlertDialog();
  const { setUser } = useUser();

  const siginToTwitter = () => {
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

  if (currentLoginView === 'login') {
    return (
      <Login setCurrentLoginView={setCurrentLoginView} 
      siginToTwitter={siginToTwitter}
      verifyAndSetUserProfile={verifyAndSetUserProfile}
      setUser={setUser}
      closeAlertDialog={closeAlertDialog}
      />
    )
  }
  return (
    <Register setCurrentLoginView={setCurrentLoginView} 
    siginToTwitter={siginToTwitter}
    verifyAndSetUserProfile={verifyAndSetUserProfile} 
    setUser={setUser}
    closeAlertDialog={closeAlertDialog}
    />

  )
}