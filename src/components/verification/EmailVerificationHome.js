import React, { useEffect } from 'react';
import axios from 'axios';

const PROCESSOR_API = process.env.REACT_APP_PROCESSOR_API;

export default function EmailVerificationHome() {
  useEffect(() => {
    // fetch the verification code from the URL
    const urlParams = new URLSearchParams(window.location.search);
    const verificationCode = urlParams.get('code');
    const email = urlParams.get('email');
    console.log(verificationCode);

    // send the verification code to the server
    const payload = {
      verificationCode,
      email,
    };

    axios.post(`${PROCESSOR_API}/users/verify_email`, payload).then(function(dataRes) {
      const response = dataRes.data;
      if (response && response.authToken) {
        localStorage.setItem('authToken', response.authToken);
        window.location.href = '/';
      }
    });

  }, []);
  
  return (
    <div>
      <h1>Email Verification</h1>

    </div>  
  )
}