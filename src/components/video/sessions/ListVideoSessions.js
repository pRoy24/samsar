import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { getHeaders } from '../../../utils/web';
import { useNavigate } from 'react-router-dom';
import OverflowContainer from '../../common/OverflowContainer.tsx';
import ShowNewUserIntroDisplay from './ShowNewUserIntroDisplay';
import { useColorMode } from '../../../contexts/ColorMode.js';

const PROCESSOR_API = process.env.REACT_APP_PROCESSOR_API;

export default function ListVideoSessions() {
  const [sessionList, setSessionList] = useState([]);
  const navigate = useNavigate();
  const [showIntroDisplay, setShowIntroDisplay] = useState(false);

  const { colorMode } = useColorMode();
  const bgColor = colorMode === 'dark' ? `bg-gray-900` : `bg-neutral-300`;
  const textColor = colorMode === 'dark' ? `text-white` : `text-black`;

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

  const createNewStudioSession = () => {
    const headers = getHeaders();
    const payload = {
      prompts: [],
    };
    axios.post(`${PROCESSOR_API}/video_sessions/create_video_session`, payload, headers).then(function (response) {
      const session = response.data;
      const sessionId = session._id.toString();
      localStorage.setItem('videoSessionId', sessionId);

      navigate(`/video/${session._id}`);

    });
  }

  const createNewQuickSession = () => {
    const headers = getHeaders();
    const payload = {
      prompts: [],
    };
    axios.post(`${PROCESSOR_API}/video_sessions/create_video_session`, payload, headers).then(function (response) {
      const session = response.data;
      const sessionId = session._id.toString();
      localStorage.setItem('videoSessionId', sessionId);

      navigate(`/quick_video/${session._id}`);

    });
  }

  const handleImportClick = (session, editorType) => {
    console.log(session);
    console.log(editorType);


    const headers = getHeaders();
    const payload = {
      sessionId: session.sessionId,
    }
    axios.post(`${PROCESSOR_API}/video_sessions/import_session`, payload, headers).then(function (dataRes) {
      const session = dataRes.data;
      const sessionId = session._id.toString();
      localStorage.setItem('videoSessionId', sessionId);

      if (editorType === 'studio') {
        navigate(`/video/${session._id}`);
      } else {
        navigate(`/quick_video/${session._id}`);
      }
    });
  }

  if (!sessionList) return null;

  let projectsLabelDisplay = null;
  if (sessionList.length > 0) {
    projectsLabelDisplay = (
      <div className='text-lg font-bold pl-2 pt-2 text-left ml-2 mb-2'>
        My Projects
      </div>
    )
  } else {
    projectsLabelDisplay = (
      <div className='text-lg font-bold pl-2 pt-2 text-left ml-2 mb-2'>
       Looks like you don't have any projects yet. Get started by creating a new project.
      </div>
    )
  }
  return (
    <OverflowContainer>
      <div className={`p-4 pt-8 pb-8 h-full w-full min-h-[100vh] mt-[50px] ${bgColor} ${textColor}`}>
        <div className='flex flex-col items-center justify-center'>
          {projectsLabelDisplay}
          <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 justify-items-center'>
            {sessionList.map((session, index) => {
              if (!session) return null;
              let sessionPreviewImage = '/q2.png';
              if (session.thumbnail) {
                sessionPreviewImage = `${PROCESSOR_API}/${session.thumbnail}`;
              }
              return (
                <div key={index} className='cursor-pointer' onClick={() => gotoPage(session)}>
                  <div className='text-neutral-100 text-center mb-2'>{session.name}</div>
                  <img src={sessionPreviewImage} className="w-64 h-64 object-cover rounded-lg" />
                </div>
              )
            })}
          </div>
          <div className=' w-full'>
            <ShowNewUserIntroDisplay
              createNewStudioSession={createNewStudioSession}
              createNewQuickSession={createNewQuickSession}
              handleImportClick={handleImportClick}
            />
          </div>
        </div>
      </div>
    </OverflowContainer>
  )
}
