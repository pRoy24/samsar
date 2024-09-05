import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useColorMode } from '../../../contexts/ColorMode.js';
import { getHeaders } from '../../../utils/web';
import { useNavigate } from 'react-router-dom';

import { FaVideo, FaForward } from "react-icons/fa";

const API_SERVER = process.env.REACT_APP_PROCESSOR_API;

export default function ShowNewUserIntroDisplay(props) {
  const { createNewStudioSession, createNewQuickSession, handleImportClick } = props;

  const [introSessionList, setIntroSessionList] = useState([]);
  const [selectedSessionIndex, setSelectedSessionIndex] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const headers = getHeaders();
    axios.get(`${API_SERVER}/video_sessions/intro_sessions`, headers).then((dataRes) => {
      const introSessionList = dataRes.data;
      if (introSessionList.length > 0) {
        setIntroSessionList(introSessionList);
      }
    });
  }, []);

  const { colorMode } = useColorMode();
  const bgColor = colorMode === 'dark' ? `bg-gray-900` : `bg-neutral-300`;
  const textColor = colorMode === 'dark' ? `text-white` : `text-black`;

  const handleSessionClick = (index) => {
    setSelectedSessionIndex(index === selectedSessionIndex ? null : index);
  };



  let introSessionsListDisplay = <span />;
  if (introSessionList.length > 0) {
    introSessionsListDisplay = (
      <div className={`bg-gray-800  mb-2 pt-2 pb-2 pl-4 pr-4`}>
        <div className='text-lg font-bold pb-4  mb-2'>
          Import project from Template
        </div>
        <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 justify-items-center'>
          {introSessionList.map((session, index) => {
            const isSelected = index === selectedSessionIndex;
            return (
              <div key={index} className="w-full">
                <div
                  className={`cursor-pointer p-4 border rounded-lg ${isSelected ? 'bg-blue-900 text-white' : 'bg-gray-900 text-neutral-100'}`}
                  onClick={() => handleSessionClick(index)}
                >
                  <div className='text-center mb-2'>{session.sessionName}</div>
                  <img src={`${API_SERVER}${session.sessionFrameImage}`} alt={session.sessionName} className="w-64 h-64 object-cover rounded-lg mx-auto" />
                </div>
                {isSelected && (
                  <div className="flex justify-between mt-2">
                    <button
                      onClick={() => handleImportClick(session, 'express')}
                      className="bg-green-800 hover:bg-green-700 text-white py-2 px-4 rounded-lg w-full mr-2"
                    >
                      Import in Express Editor
                    </button>
                    <button
                      onClick={() => handleImportClick(session, 'studio')}
                      className="bg-blue-900 hover:bg-blue-800 text-white py-2 px-4 rounded-lg w-full"
                    >
                      Import in Studio Editor
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className={`${bgColor} ${textColor} p-4`}>

        <div className='bg-gray-800 mt-4 mb-4 pb-4 pt-2'>
          <div className='text-lg font-bold mb-4 '>
            Create New Project
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 justify-items-center  ">

            <div
              onClick={() => createNewStudioSession()}
              className="flex flex-col items-center justify-center cursor-pointer"
            >
              <FaVideo className="text-4xl mb-2" />
              <span> Studio Session</span>
            </div>
            <div
              onClick={() => createNewQuickSession()}
              className="flex flex-col items-center justify-center cursor-pointer"
            >
              <FaForward className="text-4xl mb-2" />
              <span> Express Session</span>
            </div>
          </div>
        </div>


      </div>
    </div>
  );
}
