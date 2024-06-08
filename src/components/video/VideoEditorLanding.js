import React from 'react';
import CommonContainer from '../common/CommonContainer.tsx';
import { useColorMode } from '../../contexts/ColorMode';
import CommonButton from '../common/CommonButton.tsx';
import axios from 'axios';
import { getHeaders } from '../../utils/web.js';
import { useNavigate } from 'react-router-dom';
const API_SERVER = process.env.REACT_APP_PROCESSOR_API;

export default function VideoEditorLanding() {
  const { colorMode } = useColorMode();
  const bgColor = colorMode === 'light' ? 'bg-cyber-white' : 'bg-gray-800';
  const textColor = colorMode === 'light' ? 'text-cyber-black' : 'text-neutral-100';

  const navigate = useNavigate();
  const submitPromptList = (evt) => {
    evt.preventDefault();
    const promptList = evt.target[0].value;
    let promptListArray = promptList.split('\n');
    promptListArray = promptListArray.filter((prompt) => prompt && prompt.trim().length > 0);
    const payload = {
      prompts: promptListArray
    };
    const headers = getHeaders();
    axios.post(`${API_SERVER}/video_sessions/create_video_session`, payload, headers).then(function(dataResponse) {
      console.log(dataResponse);
      const sessionData = dataResponse.data;
      navigate(`/video/${sessionData._id}`);
    });
  }
  return (
    <CommonContainer>
      <div className={`w-full mt-[60px] md:w-[90%] md:ml-[5%] m-auto ${bgColor} p-8`}>
        <form onSubmit={submitPromptList}>
          <textarea className={`bg-neutral-800
          mt-4 h-auto min-h-64 overflow-y-scroll min-w-[512px]
          p-4 rounded-sm ${textColor}`} placeholder='Enter the list of prompts separated by newlines.'></textarea>
          <div className='mt-8 mb-8'>
            <CommonButton>
              Submit
            </CommonButton>
          </div>

        </form>
      </div>
    </CommonContainer>
  )
}