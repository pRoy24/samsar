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
import ProgressIndicator from './ProgressIndicator.js';
import { useAlertDialog } from '../../contexts/AlertDialogContext.js';
import AuthContainer from '../auth/AuthContainer.js';

const PROCESSOR_API_URL = process.env.REACT_APP_PROCESSOR_API;

export default function QuickEditor() {
  const [videoType, setVideoType] = useState({ value: 'Slideshow', label: 'Slideshow' });
  const [animation, setAnimation] = useState(null);
  const [duration, setDuration] = useState({ value: 'auto', label: 'Auto' }); // Updated to use an object similar to Select options
  const [customDuration, setCustomDuration] = useState(''); // Add this line
  const [sessionDetails, setSessionDetails] = useState(null);
  const [isGenerationPending, setIsGenerationPending] = useState(false);
  const [showResultDisplay, setShowResultDisplay] = useState(false);
  const [expressGenerationStatus, setExpressGenerationStatus] = useState(null);
  const [videoLink, setVideoLink] = useState(null);
  const [showDetails, setShowDetails] = useState(false);
  const [showTheme, setShowTheme] = useState(false);
  const [musicPrompt, setMusicPrompt] = useState('');
  const [theme, setTheme] = useState('');
  const { openAlertDialog, closeAlertDialog } = useAlertDialog();
  let { id } = useParams();


  const [sessionMessages, setSessionMessages] = useState([]);
  const [isCanvasDirty, setIsCanvasDirty] = useState(false);
  const [isAssistantQueryGenerating, setIsAssistantQueryGenerating] = useState(false);
  const [polling, setPolling] = useState(false); // New state variable to track polling status

  const videoTypeOptions = [
    { value: 'Slideshow', label: 'Slideshow' },
  ];

  const showLoginDialog = () => {
    const loginComponent = (
      <AuthContainer />
    );
    openAlertDialog(loginComponent);
  };


  const animationOptions = [
    { value: 'pan_left_to_right', label: 'Pan Left to Right' },
    { value: 'pan_right_to_left', label: 'Pan Right to Left' },
    { value: 'pan_top_to_bottom', label: 'Pan Top to Bottom' },
    { value: 'pan_bottom_top_top', label: 'Pan Bottom to Top' },
    { value: 'Zoom in', label: 'Zoom in' },
    { value: 'Zoom Out', label: 'Zoom Out' },
    { value: '', label: 'None' },
    { value: 'random', label: 'Random' },
  ];

  const handleVideoTypeChange = (selectedOption) => {
    setVideoType(selectedOption);
    setAnimation(null);
  };

  const handleAnimationChange = (selectedOption) => {
    setAnimation(selectedOption);
  };

  const handleDurationChange = (selectedOption) => {
    setDuration(selectedOption);
    if (selectedOption.value !== 'custom') {
      setCustomDuration('');
    }
  };

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
  };

  const submitQuickRender = (evt) => {
    evt.preventDefault();

    const headers = getHeaders();
    if (!headers) {
      showLoginDialog();
      return;
    }



    setIsGenerationPending(true);
    setShowResultDisplay(true);

    const formData = new FormData(evt.target);
    const promptList = formData.get('promptList');
    const lineItems = promptList.split('\n').map((prompt) => prompt.trim()).filter(Boolean);
    const durationPerScene = duration.value === 'custom' ? parseFloat(customDuration) : parseFloat(duration.value);

    const payload = {
      lineItems: lineItems,
      duration: durationPerScene,
      sessionId: id,
      animation: animation ? animation.value : null,
      musicPrompt: musicPrompt.trim() || undefined,
      theme: theme.split(',').map((item) => item.trim()).filter(Boolean).join(',')
    };

    if (duration.value === 'auto') {
      payload.setAutoDurationPerScene = true;
      payload.duration = 20;
    }


    axios.post(`${PROCESSOR_API_URL}/quick_session/create`, payload, headers).then(function (dataRes) {
      startQuickGenerationPoll();
    });
  };

  const toggleDetails = () => {
    setShowDetails(!showDetails);
  };

  const toggleTheme = () => {
    setShowTheme(!showTheme);
  };


  

  const startAssistantQueryPoll = () => {
    const headers = getHeaders();
    if (!headers) {
      showLoginDialog();
      return;
    }

    const timer = setInterval(() => {
      axios.get(`${PROCESSOR_API_URL}/assistants/assistant_query_status?id=${id}`, headers).then((dataRes) => {
        const assistantQueryData = dataRes.data;
        const assistantQueryStatus = assistantQueryData.status;
        if (assistantQueryStatus === 'COMPLETED') {
          const sessionData = assistantQueryData.sessionDetails;
          clearInterval(timer);
          const assistantQueryResponse = assistantQueryData.response;
          setSessionMessages(sessionData.sessionMessages);
          setIsAssistantQueryGenerating(false);
        }
      });
    }, 1000);

  }


  const submitAssistantQuery = (query) => {

    const headers = getHeaders();
    if (!headers) {
      showLoginDialog();
      return;
    }
    setIsAssistantQueryGenerating(true);
    axios.post(`${PROCESSOR_API_URL}/assistants/submit_assistant_query`, { id: id, query: query }, headers).then((response) => {
      const assistantResponse = response.data;
      startAssistantQueryPoll();
    }).catch(function (err) {
      setIsAssistantQueryGenerating(false);
    });
  }




  return (
    <div className='relative w-full'>
      {showResultDisplay && (
        <ProgressIndicator
          videoLink={videoLink}
          isGenerationPending={isGenerationPending}
          expressGenerationStatus={expressGenerationStatus}
          setShowResultDisplay={setShowResultDisplay}
        />
      )}
      <div className='mt-[60px]'>
        <form onSubmit={submitQuickRender}>
          <div className='bg-neutral-950'>
            <div className="toolbar flex items-center gap-2 p-2 bg-gray-900 text-white ">
              <div className="grid grid-cols-3 items-center gap-2 w-full">
                <div className='block'>
                  <div className='block'>
                    <label className="whitespace-nowrap block text-xs text-left pl-2 pb-1">Type:</label>
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
                    <SingleSelect
                      value={duration}
                      onChange={handleDurationChange}
                      options={[
                        { label: 'Auto', value: 'auto' },
                        { label: '2 Seconds', value: '2' },
                        { label: '5 Seconds', value: '5' },
                        { label: '10 Seconds', value: '10' },
                        { label: '20 Seconds', value: '20' },
                        { label: 'Custom', value: 'custom' },
                      ]}
                      className="w-full"
                    />
                    {duration.value === 'custom' && (
                      <input
                        type="number"
                        value={customDuration}
                        onChange={(e) => setCustomDuration(e.target.value)}
                        className="w-full mt-2 p-2 rounded bg-gray-950 border-2 border-neutral-500 text-white"
                        placeholder="Enter custom duration"
                      />
                    )}
                  </div>
                </div>
              </div>
            </div>
            <div className='mt-2 mb-2 p-2 bg-gray-900'>
              <div className='flex flex-basis text-white'>
                <div className='inline-flex ml-1 mr-2'>
                  <input type="checkbox" className="custom-checkbox form-checkbox h-5 w-5 text-gray-600" defaultChecked={true} />
                  Add Speech
                </div>
                <div className='inline-flex'>
                  <input type='checkbox' className="custom-checkbox form-checkbox h-5 w-5 text-gray-600" defaultChecked={true} />
                  Add Music
                </div>
                <div className='inline-flex ml-auto mr-2 pr-2 cursor-pointer' onClick={toggleDetails}>
                  Details <FaChevronDown className='inline-flex mt-1' />
                </div>
              </div>
              {showDetails && (
                <div className='p-2 bg-gray-950 rounded mt-2'>
                  <label className="whitespace-nowrap block text-xs text-left pl-2 pb-1 text-white">Add background music prompt:</label>
                  <TextareaAutosize
                    minRows={2}
                    maxRows={5}
                    className="w-full bg-gray-950 text-white p-2 rounded"
                    placeholder="Add background music prompt, leave it empty to autogenerate background music theme"
                    name="musicPrompt"
                    value={musicPrompt}
                    onChange={(e) => setMusicPrompt(e.target.value)}
                  />
                </div>
              )}
            </div>
            <div className='mt-2 mb-2 p-2 bg-gray-900 text-white h-[40px] cursor-pointer' onClick={toggleTheme}>
              Theme <FaChevronDown className='inline-flex ml-2' />
            </div>
            {showTheme && (
              <div className='p-2 bg-gray-950 rounded mt-2'>
                <label className="whitespace-nowrap block text-xs text-left pl-2 pb-1">Add theme keywords:</label>
                <TextareaAutosize
                  minRows={2}
                  maxRows={5}
                  className="w-full bg-gray-950 text-white p-2 rounded"
                  placeholder="Add comma separated keywords for theme elements you'd like to apply to your session, leave empty to autogenerate"
                  name="theme"
                  value={theme}
                  onChange={(e) => setTheme(e.target.value)}
                />
              </div>
            )}
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
            isAssistantQueryGenerating={isAssistantQueryGenerating}
          
        />
      </div>
    </div>
  );
}
