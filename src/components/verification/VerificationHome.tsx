import React, { useEffect } from 'react';
import { FaS, FaSpinner } from 'react-icons/fa6';
import { useNavigate } from 'react-router-dom';


export default function VerificationHome() {
  const navigate = useNavigate();

  const query = new URLSearchParams(window.location.search);
  const authToken = query.get('authToken');
  useEffect(() => {
    if (authToken) {
      localStorage.setItem('authToken', authToken);
      const channel = new BroadcastChannel('oauth_channel');
      channel.postMessage('oauth_complete');
      window.close(); 

    }
  }, [authToken]);

  if (!authToken) {
    return <FaSpinner className="animate-spin" />;
  }

  return (
    <div>
      <div className='m-auto text-center min-w-16 mt-8'>
      <h1>Verification completed</h1>
      <div>
        You can now safely close this tab.
      </div>

      </div>
    </div>
  );
}