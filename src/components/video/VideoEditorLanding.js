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
    const formData = new FormData(evt.target);
    const imageGenerationTheme = formData.get('imageGenerationTheme');
    const promptList = formData.get('promptList');

    let promptListArray = promptList.split('\n');
    promptListArray = promptListArray.filter((prompt) => prompt && prompt.trim().length > 0);
    let durationPerScene = 2;
    try {
      durationPerScene = parseInt(formData.get('durationPerScene'));
    } catch (e) {
    
    }

    const sessionTheme = imageGenerationTheme ? imageGenerationTheme.trim() : null;
    const payload = {
      imageGenerationTheme: sessionTheme,
      prompts: promptListArray,
      durationPerScene: durationPerScene
    };

    const headers = getHeaders();
    axios.post(`${API_SERVER}/video_sessions/create_video_session`, payload, headers).then(function (dataResponse) {
      console.log(dataResponse);
      const sessionData = dataResponse.data;
      navigate(`/video/${sessionData._id}`);
    });
  }

  return (
    <CommonContainer>
      <div className={`w-full mt-[60px] md:w-[90%] md:ml-[5%] m-auto ${bgColor} p-8`}>
        <form onSubmit={submitPromptList}>
          <div className=''>
            <div className={`${textColor} pt-2 pb-2 bg-neutral-900 w-[512px] m-auto`}>
              Theme
            </div>
            <div>
              <textarea className={`bg-neutral-800
         h-auto h-32 overflow-y-scroll min-w-[512px]
          p-4 rounded-sm ${textColor} mb-4`}
                name="imageGenerationTheme"
                placeholder='Enter a theme, an optional set of keywords that will get applied to all generations in this session' />

            </div>
          </div>

          <div>
            <div className={`${textColor}  bg-neutral-900 align-center pt-2 pb-2 w-[512px] m-auto`}>
              <div className='flex flex-row'>
                <div className='basis-1/2'>
                  Intial Scene Prompts
                </div>
                <div className='basis-1/2'>

                  <div className='inline-flex'>
                    <div className='text-left mr-2'>
                      Duration/scene
                      <div className='text-[12px]'>
                        seconds
                      </div>
                    </div>

                  </div>

                  <input type="number" name="durationPerScene" className={`${bgColor}
                   inline-flex w-[60px] pl-2 rounded-sm `}
                  defaultValue={2} />



                </div>
              </div>


            </div>

            <textarea className={`bg-neutral-800
           h-auto min-h-64 overflow-y-scroll min-w-[512px]
          p-4 rounded-sm ${textColor}`}
              name="promptList"
              placeholder='Enter the list of prompts separated by newlines.'></textarea>
            <div className='mt-8 mb-8'>
              <CommonButton>
                Submit
              </CommonButton>
            </div>
          </div>
        </form>
      </div>
    </CommonContainer>
  )
}