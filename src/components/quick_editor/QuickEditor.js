import React, { useState, useEffect } from 'react';
import OverflowContainer from '../common/OverflowContainer.tsx';
import TextareaAutosize from 'react-textarea-autosize';
import Select from 'react-select';
import axios from 'axios';
import SecondaryButton from '../common/SecondaryButton.tsx';
import SingleSelect from '../common/SingleSelect.js';
import CommonButton from '../common/CommonButton.tsx';
import { FaArrowRight, FaChevronDown, FaLine } from 'react-icons/fa6';
import { useParams } from 'react-router-dom';
import AssistantHome from '../assistant/AssistantHome.js';
import { getHeaders } from '../../utils/web.js';
import ProgressIndicator from './ProgressIndicator.js';
import { useAlertDialog } from '../../contexts/AlertDialogContext.js';
import { SPEAKER_TYPES } from '../../constants/Types.ts';
import { franc } from 'franc';

import AuthContainer from '../auth/AuthContainer.js';


// Top 10 most popular languages supported by Franc
const popularLanguages = [
  { value: 'eng', label: 'English' },
  { value: 'spa', label: 'Spanish' },
  { value: 'fre', label: 'French' },
  { value: 'deu', label: 'German' },
  { value: 'rus', label: 'Russian' },
  { value: 'ita', label: 'Italian' },
  { value: 'por', label: 'Portuguese' },
  { value: 'zho', label: 'Chinese' },
  { value: 'jpn', label: 'Japanese' },
  { value: 'kor', label: 'Korean' },
];


const getFontFamilyForLanguage = (language) => {
  switch (language) {
    case 'eng': // English
      return 'Times New Roman';
    case 'spa': // Spanish
    case 'fre': // French
    case 'deu': // German
    case 'ita': // Italian
    case 'por': // Portuguese
      return 'Arial'; // Arial is widely supported and good for Latin-based scripts
    case 'rus': // Russian
      return 'Arial'; // Arial supports Cyrillic script natively
    case 'zho': // Chinese
      return 'SimHei'; // A common sans-serif font for Simplified Chinese
    case 'jpn': // Japanese
      return 'MS Gothic'; // A common monospaced font for Japanese
    case 'kor': // Korean
      return 'Malgun Gothic'; // A widely used sans-serif font for Korean
    default:
      return 'Arial'; // Default to Arial for unsupported or unexpected languages
  }
};

const PROCESSOR_API_URL = process.env.REACT_APP_PROCESSOR_API;

export default function QuickEditor() {
  const { id } = useParams(); // Destructure id from useParams
  const { openAlertDialog } = useAlertDialog();

  // State variables
  const [videoType, setVideoType] = useState({ value: 'Slideshow', label: 'Slideshow' });
  const [animation, setAnimation] = useState({ value: 'zoom_in', label: 'Zoom in' });
  const [duration, setDuration] = useState({ value: 'auto', label: 'Auto' });
  const [customDuration, setCustomDuration] = useState('');
  const [sessionDetails, setSessionDetails] = useState(null);
  const [isGenerationPending, setIsGenerationPending] = useState(false);
  const [showResultDisplay, setShowResultDisplay] = useState(false);
  const [expressGenerationStatus, setExpressGenerationStatus] = useState(null);
  const [videoLink, setVideoLink] = useState(null);
  const [showDetails, setShowDetails] = useState(false);
  const [showTheme, setShowTheme] = useState(false);
  const [musicPrompt, setMusicPrompt] = useState('');
  const [theme, setTheme] = useState('');
  const [sessionMessages, setSessionMessages] = useState([]);
  const [isCanvasDirty, setIsCanvasDirty] = useState(false);
  const [isAssistantQueryGenerating, setIsAssistantQueryGenerating] = useState(false);
  const [polling, setPolling] = useState(false);
  const [speakerType, setSpeakerType] = useState({ value: 'alloy', label: 'Alloy' });
  const [promptList, setPromptList] = useState(''); // State for prompt list
  const [speechLanguage, setSpeechLanguage] = useState({ value: 'eng', label: 'English' });
  const [subtitlesLanguage, setSubtitlesLanguage] = useState({ value: 'eng', label: 'English' });
  const [errorState, setErrorState] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [creditsPreview, setCreditsPreview] = useState(0);
  const [showCreditsBreakdown, setShowCreditsBreakdown] = useState(false);


  // Effect to reset state when id changes
  useEffect(() => {
    setVideoType({ value: 'Slideshow', label: 'Slideshow' });
    setAnimation({ value: 'zoom_in', label: 'Zoom in' });
    setDuration({ value: 'auto', label: 'Auto' });
    setCustomDuration('');

    setIsGenerationPending(false);
    setShowResultDisplay(false);
    setExpressGenerationStatus(null);
    setVideoLink(null);
    setShowDetails(false);
    setShowTheme(false);
    setMusicPrompt(''); // Reset music prompt
    setTheme(''); // Reset theme
    setSessionMessages([]);
    setIsCanvasDirty(false);
    setIsAssistantQueryGenerating(false);
    setPolling(false);
    setSpeakerType({ value: 'alloy', label: 'Alloy' });
    setPromptList(''); // Reset prompt list
    setCreditsPreview(0);
    setSpeechLanguage({ value: 'eng', label: 'English' }); // Reset speech language
    setSubtitlesLanguage({ value: 'eng', label: 'English' }); // Reset subtitles language

    const headers = getHeaders();

    axios.get(`${PROCESSOR_API_URL}/quick_session/details?sessionId=${id}`, headers).then(function (dataRes) {
      const sessionData = dataRes.data;
      setSessionDetails(sessionData);
    });
  }, [id]); // This effect runs every time the id changes

  const videoTypeOptions = [
    { value: 'Slideshow', label: 'Slideshow' },
  ];

  const animationOptions = [
    { value: 'pan_left_to_right', label: 'Pan Left to Right' },
    { value: 'pan_right_to_left', label: 'Pan Right to Left' },
    { value: 'pan_top_to_bottom', label: 'Pan Top to Bottom' },
    { value: 'pan_bottom_to_top', label: 'Pan Bottom to Top' },
    { value: 'zoom_in', label: 'Zoom in' },
    { value: 'zoom_out', label: 'Zoom Out' },
    { value: '', label: 'None' },
    { value: 'random', label: 'Random' },
  ];

  const speakerOptions = SPEAKER_TYPES.map((speaker_type) => ({
    value: speaker_type,
    label: speaker_type,
  }));

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

  const handleSpeakerChange = (selectedOption) => {
    setSpeakerType(selectedOption);
  };

  const handleSpeechLanguageChange = (selectedOption) => {
    setSpeechLanguage(selectedOption);
  };

  const handleSubtitlesLanguageChange = (selectedOption) => {
    setSubtitlesLanguage(selectedOption);
  };

  useEffect(() => {
    if (promptList.length > 0) {
      calculateCredits();
    }
  }, [promptList, speakerType, musicPrompt, theme, speechLanguage, subtitlesLanguage]);


  const handlePromptListBlur = () => {
    const detectedLanguage = franc(promptList);
    const matchedLanguage = popularLanguages.find((lang) => lang.value === detectedLanguage);

    if (matchedLanguage) {
      setSpeechLanguage(matchedLanguage);
      setSubtitlesLanguage(matchedLanguage);
    }
  };

  const showLoginDialog = () => {
    const loginComponent = <AuthContainer />;
    openAlertDialog(loginComponent);
  };

  const startQuickGenerationPoll = () => {
    const headers = getHeaders();
    const timer = setInterval(() => {
      axios.get(`${PROCESSOR_API_URL}/quick_session/status?sessionId=${id}`, headers).then(function (dataRes) {
        const quickSessionStatus = dataRes.data;
        console.log(quickSessionStatus);

        if (quickSessionStatus.status === 'PENDING') {
          setExpressGenerationStatus(quickSessionStatus.expressGenerationStatus);
        } else if (quickSessionStatus.status === 'COMPLETED' && quickSessionStatus.videoLink) {
          clearInterval(timer);
          setIsGenerationPending(false);
          setVideoLink(quickSessionStatus.videoLink);
        }
      });
    }, 3000);
  };

  const submitQuickRender = (evt) => {
    evt.preventDefault();

    const headers = getHeaders();
    if (!headers) {
      showLoginDialog();
      return;
    }

    const formData = new FormData(evt.target);
    const promptListValue = formData.get('promptList');
    const lineItems = promptListValue.split('\n').map((prompt) => prompt.trim()).filter(Boolean);

    // Validation: Number of prompts must be less than 15
    if (lineItems.length > 15) {
      setErrorState(true);
      setErrorMessage('Number of prompts must be less than 15.');
      return;
    }

    // Validation: Number of letters in each sentence cannot be more than 300
    for (const line of lineItems) {
      if (line.length > 300) {
        setErrorState(true);
        setErrorMessage('Each sentence cannot have more than 300 characters.');
        return;
      }
    }

    // Validation: Trimmed prompt list cannot be empty
    if (lineItems.length === 0) {
      setErrorState(true);
      setErrorMessage('Prompt list cannot be empty.');
      return;
    }

    setIsGenerationPending(true);
    setShowResultDisplay(true);

    // Existing logic for language detection and payload preparation
    const detectedLanguage = franc(promptListValue) || 'und'; // 'und' stands for undetermined
    const matchedLanguage = popularLanguages.find((lang) => lang.value === detectedLanguage) || { value: 'eng' };
    const subtitlesTranslationRequired = subtitlesLanguage.value !== matchedLanguage.value;
    const speechTranslationRequired = speechLanguage.value !== matchedLanguage.value;

    let durationPerScene = 5;
    if (duration.value !== 'auto') {
      durationPerScene = duration.value === 'custom' ? parseFloat(customDuration) : parseFloat(duration.value);
    } else {
      const numItems = lineItems.length;
      durationPerScene = Math.floor(120 / numItems);
      if (durationPerScene > 20) {
        durationPerScene = 20;
      }
    }

    let fontFamily = 'Times New Roman';
    if (subtitlesLanguage.value) {
      fontFamily = getFontFamilyForLanguage(subtitlesLanguage.value);
    }

    let payload = {
      lineItems: lineItems,
      duration: durationPerScene,
      sessionId: id,
      animation: animation ? animation.value : null,
      musicPrompt: musicPrompt.trim() || undefined,
      theme: theme.split(',').map((item) => item.trim()).filter(Boolean).join(','),
      speakerType: speakerType ? speakerType.value : null,
      speechLanguage: speechLanguage.value,
      subtitlesLanguage: subtitlesLanguage.value,
      fontFamily: fontFamily,
      subtitlesTranslationRequired: subtitlesTranslationRequired,
      speechTranslationRequired: speechTranslationRequired,
    };

    if (duration.value === 'auto') {
      payload.setAutoDurationPerScene = true;
    }

    axios.post(`${PROCESSOR_API_URL}/quick_session/create`, payload, headers).then(function (dataRes) {
      startQuickGenerationPoll();
    });
  };


  const calculateCredits = () => {
    const lineItems = promptList.split('\n').map((prompt) => prompt.trim()).filter(Boolean);
    const numPrompts = lineItems.length;
    let credits = 0;

    credits += numPrompts; // 1 credit per prompt for generation

    if (speakerType) {
      credits += numPrompts; // 1 credit per prompt for speech
    }

    if (musicPrompt.trim() === '' && speakerType) {
      credits += 1; // 1 credit if music theme is empty and generate music is selected
    }

    if (musicPrompt.trim() !== '' && speakerType) {
      credits += 2; // 2 credits for background music if generate music is selected
    }

    if (theme.trim() === '') {
      credits += 1; // 1 credit if theme is empty
    }

    const detectedLanguage = franc(promptList) || 'und';
    const matchedLanguage = popularLanguages.find((lang) => lang.value === detectedLanguage) || { value: 'eng' };

    const subtitlesTranslationRequired = subtitlesLanguage.value !== matchedLanguage.value;
    const speechTranslationRequired = speechLanguage.value !== matchedLanguage.value;

    if (subtitlesTranslationRequired && speakerType) {
      credits += Math.ceil(numPrompts / 5); // additional credits for subtitles translation
    }

    if (speechTranslationRequired && speakerType) {
      credits += Math.ceil(numPrompts / 5); // additional credits for speech translation
    }

    setCreditsPreview(credits);
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

  };

  const submitAssistantQuery = (query) => {
    const headers = getHeaders();
    if (!headers) {
      showLoginDialog();
      return;
    }
    setIsAssistantQueryGenerating(true);
    axios.post(`${PROCESSOR_API_URL}/assistants/submit_assistant_query`, { id: id, query: query }, headers).then((response) => {
      startAssistantQueryPoll();
    }).catch(function (err) {
      setIsAssistantQueryGenerating(false);
    });
  };

  let downloadPreviousRenderLink = null;
  if (sessionDetails && sessionDetails.videoLink) {
    downloadPreviousRenderLink = (
      <div className='flex justify-center text-xs underline hover:text-neutral-600'>
        <a href={sessionDetails.videoLink} download className='text-white underline'>Download previous render</a>
      </div>
    );
  }
  let errorMessageDisplay = <span />;
  if (errorState) {
    errorMessageDisplay = (
      <div className='text-red-500 text-sm text-center'>
        {errorMessage}
      </div>
    );
  }

  const toggleCreditsBreakdown = () => {
    setShowCreditsBreakdown(!showCreditsBreakdown);
  };

  let creditsProcessedPreviewDisplay = (
    <div className="text-white mt-4 p-2 bg-gray-900 rounded text-center">
      <div className="text-center items-center cursor-pointer" onClick={toggleCreditsBreakdown}>
        <span className='font-bold text-sm text-neutral-100'>This operation will consume {creditsPreview} credits</span>
        <FaChevronDown className={`transform ${showCreditsBreakdown ? 'rotate-180' : ''} inline-flex text-xs ml-1`} />
      </div>
      {showCreditsBreakdown && (
        <div className="mt-2 text-sm">
          <p>1 credit per prompt for generation</p>
          {speakerType && <p>1 credit per prompt for speech</p>}
          {musicPrompt.trim() === '' && speakerType && <p>1 credit for autogenerated music theme</p>}
          {musicPrompt.trim() !== '' && speakerType && <p>2 credits for custom background music</p>}
          {theme.trim() === '' && <p>1 credit for autogenerated theme</p>}
          {(subtitlesLanguage.value !== 'eng' || speechLanguage.value !== 'eng') && speakerType && (
            <p>{Math.ceil(promptList.split('\n').filter(Boolean).length / 5)} credits for translation</p>
          )}
        </div>
      )}
    </div>
  );


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
        <div>
          {downloadPreviousRenderLink}
        </div>
        <div>
          {errorMessageDisplay}
        </div>
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
                <div className='md:basis-1/3 basis-1/4 ml-auto mr-2 pr-2 cursor-pointer align-left'
                  style={{ 'textAlign': 'left' }}
                  onClick={toggleDetails}>
                  Details <FaChevronDown className='inline-flex mt-1' />
                </div>

                <div className='md:basis-2/3 basis-3/4 align-right flex justify-end items-center' style={{ 'textAlign': 'right' }}>

                  <div className='flex'>
                    <div className='w-1/2'>
                      <label className="whitespace-nowrap block text-xs text-left pl-2 pb-1 text-white">Speech Language:</label>
                      <SingleSelect
                        value={speechLanguage}
                        onChange={handleSpeechLanguageChange}
                        options={popularLanguages}
                        className="w-full"
                      />
                    </div>
                    <div className='w-1/2 ml-4'>
                      <label className="whitespace-nowrap block text-xs text-left pl-2 pb-1 text-white">Subtitles Language:</label>
                      <SingleSelect
                        value={subtitlesLanguage}
                        onChange={handleSubtitlesLanguageChange}
                        options={popularLanguages}
                        className="w-full"
                      />
                    </div>
                  </div>

                  <div className='md:inline-flex mr-8'>
                    <div className='inline-flex ml-1 mr-2 mt-1'>
                      <input type="checkbox" className="custom-checkbox form-checkbox h-5 w-5 text-gray-600" defaultChecked={true} />
                      Add Speech
                    </div>
                    <div className='inline-flex ml-2 mr-2'>
                      <span className='mr-2 mt-1'>
                        Speaker
                      </span>
                      <SingleSelect
                        value={speakerType}
                        onChange={handleSpeakerChange}
                        options={speakerOptions}
                        className="w-40 ml-2" // Adjust width and margin as needed
                      />
                    </div>
                  </div>

                  <div className='md:inline-flex'>
                    <input type='checkbox' className="custom-checkbox form-checkbox h-5 w-5 text-gray-600" defaultChecked={true} />
                    Add Music
                  </div>
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
            <div className='mt-2 mb-2 p-2 bg-gray-900 
            text-left text-white h-[40px] cursor-pointer' onClick={toggleTheme}>
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
            <div className='mt-2 mb-2 p-2 bg-gray-900 text-white
             h-[40px] cursor-pointer text-left' onClick={toggleTheme}>
              Dialog text lines <FaArrowRight className='inline-flex ml-2' />
            </div>
            <div className='mt-2 p-2 bg-gray-900'>
              <TextareaAutosize
                minRows={5}
                maxRows={20}
                className="w-11/12 bg-gray-950 text-white p-4 rounded mx-auto"
                placeholder="Type your dialogs here.
                One line per dialog. Do not enter prompts, just the dialog text."
                name="promptList"
                value={promptList} // Bind state to the textarea
                onChange={(e) => setPromptList(e.target.value)} // Update state on change
                onBlur={handlePromptListBlur} // Language detection on blur
              />
              <div>
                {creditsProcessedPreviewDisplay}
              </div>
              <div className='mt-4'>
                <CommonButton type="submit" >
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
