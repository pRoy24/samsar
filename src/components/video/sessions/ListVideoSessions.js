import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { getHeaders } from '../../../utils/web';
import { useNavigate } from 'react-router-dom';
import OverflowContainer from '../../common/OverflowContainer.tsx';

const PROCESSOR_API = process.env.REACT_APP_PROCESSOR_API;


export default function ListVideoSessions() {
  const [sessionList, setSessionList] = useState([]);
  const navigate = useNavigate();
  const [showIntroDisplay, setShowIntroDisplay] = useState(false);

  useEffect(() => {
    const headers = getHeaders();

    axios.get(`${PROCESSOR_API}/video_sessions/list`, headers).then(function (dataRes) {
      const sessionList = dataRes.data;
      setSessionList(sessionList);
      if (sessionList.length === 0) {
        setShowIntroDisplay(true);
      }
    })
  }, []);

  const gotoPage = (session) => {
    const newSessionId = session.id.toString();
    localStorage.setItem('sessionId', newSessionId);
    navigate(`/video/${newSessionId}`);
  }
  if (!sessionList) return null;

  let introDisplay = null;
  if (showIntroDisplay) {
    introDisplay = (
      <div className='text-neutral-100 text-center'>
        <h1 className='text-2xl'>No sessions found</h1>
        <p className='text-lg'>Please create a session to get started</p>
      </div>
    )
  }
  
  return (
    <OverflowContainer>
      <div className='p-4 pt-8 pb-8 bg-gray-900 h-full w-full min-h-[100vh] mt-[50px]'>
        {introDisplay}
        <div className='grid grid-cols-4 gap-2'>
          {sessionList.map(function (session, index) {
            if (!session) return null;
            return (
              <div key={index} className='cursor-pointer' onClick={() => (gotoPage(session))}>
                <div className='text-neutral-100 '>{session.name}</div>
                <img src={`${PROCESSOR_API}/${session.thumbnail}`} />
              </div>
            )
          })}
        </div>
      </div>
    </OverflowContainer>
  )
}