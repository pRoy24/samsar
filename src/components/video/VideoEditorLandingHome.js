import React, { useEffect, useState } from 'react';
import { useUser } from '../../contexts/UserContext';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';


const API_SERVER = process.env.REACT_APP_PROCESSOR_API;

export default function VideoEditorLandingHome() {

  const { user, userFetching } = useUser();
  const [ isGuest, setIsGuest ] = useState(false);
  const navigate = useNavigate();
  console.log(user);

  console.log(userFetching);


  useEffect(() => {
    if ((!user || !user._id ) && !userFetching) {
      console.log('User not found, redirecting to login');
      setIsGuest(true);
    }

  }, [user, userFetching]);

  if (isGuest) {
    axios.get(`${API_SERVER}/video_sessions/fetch_guest_session`).then((res) => {
      const sessionData = res.data;
      console.log(sessionData);
      navigate(`/video/${sessionData._id}`);
    });
  }
  return (
    <div>
      <h1>Video Editor Landing Home</h1>

    </div>
  );
}