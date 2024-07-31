import React, { useState, useEffect } from 'react';
import OverflowContainer from '../common/OverflowContainer.tsx';
import TextareaAutosize from 'react-textarea-autosize';
import Select from 'react-select';
import axios from 'axios';
import SecondaryButton from '../common/SecondaryButton.tsx';
import SingleSelect from '../common/SingleSelect.js';
import CommonButton from '../common/CommonButton.tsx';
import { FaChevronDown } from 'react-icons/fa6';
import { useParams } from 'react-router-dom';
import AssistantHome from '../assistant/AssistantHome.js';
import { getHeaders } from '../../utils/web.js';
import MobileProgressIndicator from '../mobile/MobileProgressIndicator.js';



const PROCESSOR_API_URL = process.env.REACT_APP_PROCESSOR_API;

export default function QuickEditor() {
  console.log("ERERE");

  const [videoType, setVideoType] = useState({ value: 'Slideshow', label: 'Slideshow' });
  const [animation, setAnimation] = useState(null);
  const [duration, setDuration] = useState(5);

  const [sessionDetails, setSessionDetails] = useState(null);

  const [isGenerationPending, setIsGenerationPending] = useState(false);
  const [showResultDisplay, setShowResultDisplay] = useState(false);

  const [expressGenerationStatus, setExpressGenerationStatus] = useState(null);

  const [videoLink, setVideoLink] = useState(null);

  let { id } = useParams();

  const videoTypeOptions = [
    { value: 'Slideshow', label: 'Slideshow' },
  ];



  const animationOptions = [
    { value: 'pan_left_to_right', label: 'Pan Left to Right' },
    { value: 'pan_right_to_left', label: 'Pan Right to Left' },
    {
      value: 'pan_top_to_bottom', label: 'Pan Top to Bottom'
    },
    {
      value: 'pan_bottom_top_top', label: 'Pan Bottom to Top'
    },
    { value: 'Zoom in', label: 'Zoom in' },
    { value: 'Zoom Out', label: 'Zoom Out' },
    {
      value: '', label: 'None',
    },
    {
      value: 'random', label: 'Random'
    }

  ];


  useEffect(() => {
    if (id) {
      const headers = getHeaders();
      axios.get(`${PROCESSOR_API_URL}/quick_session/details?sessionId=${id}`, headers).then(function (dataRes) {
        const sessionData = dataRes.data;
        setSessionDetails(sessionData);

      });
    }
  }, [id]);

  const handleVideoTypeChange = (selectedOption) => {
    setVideoType(selectedOption);
    setAnimation(null);
  };

  const handleAnimationChange = (selectedOption) => {
    setAnimation(selectedOption);
  };

  const handleDurationChange = (e) => {
    setDuration(e.target.value);
  };


  const submitAssistantQuery = (query) => {

  }

  const sessionMessages = [];

  const isAssistantQueryGenerating = false;


  const startQuickGenerationPoll = () => {
    const headers = getHeaders();

    const timer = setInterval(() => {
      axios.get(`${PROCESSOR_API_URL}/quick_session/status?sessionId=${id}`, headers).then(function (dataRes) {
        const quickSessionStatus = dataRes.data;

        if (quickSessionStatus.status === 'PENDING') {

          setExpressGenerationStatus(quickSessionStatus.expressGenerationStatus);

        } else if (quickSessionStatus.status === 'COMPLETED') {
          clearInterval(timer);


          setIsGenerationPending(false);

          setVideoLink(quickSessionStatus.videoLink);
        }
      });
    }, 1000);



  }

  const submitQuickRender = (evt) => {
    evt.preventDefault();

    setIsGenerationPending(true);

    setShowResultDisplay(true);

    const formData = new FormData(evt.target);

    const promptList = formData.get('promptList');

    const lineItems = promptList.split('\n').map((prompt) => {
      return prompt.trim();
    }).filter(Boolean);


    const durationPerScene = formData.get('durationPerScene');
    const duration = parseFloat(durationPerScene);



    const payload = {
      lineItems: lineItems,
      duration: duration,
      sessionId: id,
      animation: animation ? animation.value : null
    }


    console.log("INSIDE QUICK RENDER");

    const headers = getHeaders();

    axios.post(`${PROCESSOR_API_URL}/quick_session/create`, payload, headers).then(function (dataRes) {
      const sessionCreateResponse = dataRes.data;

      startQuickGenerationPoll();

    });

  }

  const downloadPreviousRender = () => {
    const videoLink = `${PROCESSOR_API_URL}/${sessionDetails.videoLink}`;
    window.open(videoLink, '_blank');

  }


  let previousRenderDisplay = <span />;
  if (sessionDetails && sessionDetails.videoLink) {


    previousRenderDisplay = (
      <div>
        <div className='text-xs text-white h-[40px]'>
          <div className='float-right mr-2'>
            <SecondaryButton onClick={() => { downloadPreviousRender() }}>
              Download Previous Render
            </SecondaryButton>
          </div>

        </div>
      </div>
    )
  }


  return (
    <div className='relative w-full'>
      {showResultDisplay && (
        <MobileProgressIndicator
          videoLink={videoLink}
          isGenerationPending={isGenerationPending}
          expressGenerationStatus={expressGenerationStatus}
          setShowResultDisplay={setShowResultDisplay}
        />)}
      <div className='mt-[60px]'>
        <div>
          {previousRenderDisplay}
        </div>
        <form onSubmit={submitQuickRender}>
          <div className='bg-neutral-950'>
            <div className="toolbar flex items-center gap-2 p-2 bg-gray-900 text-white ">
              <div className="grid grid-cols-3 items-center gap-2 w-full">
                <div className='block'>
                  <div className='block'>
                    <label className="whitespace-nowrap block text-xs text-left pl-2 pb-1">
                      Type:
                    </label>
                  </div>
                  <div>
                    <SingleSelect

                      value={videoType}
                      onChange={handleVideoTypeChange}
                      options={videoTypeOptions}
                      className="w-24"
                    />
                  </div>
                </div>
                <div>
                  {videoType.value === 'Slideshow' && (
                    <div className='block'>
                      <div className='block'>
                        <label className="whitespace-nowrap block text-xs text-left pl-2 pb-1">Animation:</label>
                      </div>
                      <div>
                        <SingleSelect
                          value={animation}
                          onChange={handleAnimationChange}
                          options={animationOptions}
                          className="w-28"
                        />
                      </div>
                    </div>
                  )}
                </div>
                <div>
                  <div className='block'>
                    <div className='block'>
                      <label className="whitespace-nowrap block  text-xs text-left pl-2 pb-1">Duration:</label>
                    </div>
                  </div>
                  <div>
                    <input
                      type="number"
                      value={duration}
                      onChange={handleDurationChange}
                      name="durationPerScene"
                      className="w-[90%] ml-[5%] h-[40px] p-4 pt-[8px] pb-[8px]
                     rounded bg-gray-950 border-2 border-neutral-500 text-white"
                    />
                  </div>
                </div>
              </div>
            </div>
            <div className='mt-2 mb-2  p-2 bg-gray-900'>
              <div className='flex flex-basis text-white'>
                <div className='inline-flex ml-1 mr-2'>
                  <input type="checkbox" className="custom-checkbox form-checkbox h-5 w-5 text-gray-600" defaultChecked={true} />
                  Add Speech
                </div>
                <div className='inline-flex'>
                  <input type='checkbox' className="custom-checkbox form-checkbox h-5 w-5 text-gray-600" defaultChecked={true} />
                  Add Music
                </div>
                <div className='inline-flex ml-auto mr-2 pr-2'>
                  Details <FaChevronDown className='inline-flex mt-1' />
                </div>
              </div>
            </div>
            <div className='mt-2 mb-2  p-2 bg-gray-900 text-white h-[40px]'>
              <div className='float-left ml-4'>
                Theme <FaChevronDown className='inline-flex ml-2' />
              </div>
            </div>


            <div className='mt-2 p-2 bg-gray-900'>


              <TextareaAutosize
                minRows={5}
                maxRows={20}
                className="w-11/12 bg-gray-950 text-white p-4 rounded mx-auto"
                placeholder="Type your text here..."
                name="promptList"
              />
              <div className='mt-2 mb-2'>
                <CommonButton type="submit">
                  Submit
                </CommonButton>
              </div>
            </div>



          </div>

        </form>


        <AssistantHome
          submitAssistantQuery={submitAssistantQuery}
          sessionMessages={sessionMessages}
          isAssistantQueryGenerating={isAssistantQueryGenerating} />
      </div>
    </div>




  );
}