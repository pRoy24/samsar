import React, { useState, useEffect, useRef } from 'react';
import AceEditor from 'react-ace';
import { cleanJsonTheme } from '../../utils/web.js';
import { FaSpinner } from 'react-icons/fa6';
import ace from 'ace-builds';
import { popularLanguages, getFontFamilyForLanguage } from '../../utils/language.js';
import { ANIMATION_OPTIONS } from '../../utils/animation.js';


import 'ace-builds/src-noconflict/mode-json';
import 'ace-builds/src-noconflict/theme-monokai';

import 'ace-builds/src-noconflict/ext-language_tools';
import 'ace-builds/src-noconflict/ext-beautify';

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
import { useNavigate } from 'react-router-dom';
import { franc } from 'franc';
import AuthContainer from '../auth/AuthContainer.js';
import { INFINITE_ZOOM_ANIMATION_OPTIONS } from '../../utils/animation.js';

ace.config.set('useWorker', false);



const PROCESSOR_API_URL = process.env.REACT_APP_PROCESSOR_API;

export default function QuickEditor() {
  const { id } = useParams(); // Destructure id from useParams
  const { openAlertDialog } = useAlertDialog();

  const navigate = useNavigate();

  // State variables
  const [videoType, setVideoType] = useState({ value: 'Slideshow', label: 'Slideshow' });
  const [animation, setAnimation] = useState({ value: 'preset_short_animation', label: 'Preset Short Animation' });
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
  const [sceneCutoffType, setSceneCutoffType] = useState({ value: 'auto', label: 'Auto' });

  const [customThemeText, setCustomThemeText] = useState('');

  const [updateCustomThemeText, setUpdateCustomThemeText] = useState('');





  // New state variables
  const [wordCount, setWordCount] = useState(0);
  const [characterCount, setCharacterCount] = useState(0);
  const [showCustomCreateThemeTextBox, setShowCustomCreateThemeTextBox] = useState(false);
  const [imageGenerationTheme, setImageGenerationTheme] = useState(null);
  const [jsonTheme, setJsonTheme] = useState('');





  const [basicTextTheme, setBasicTextTheme] = useState('');
  const [parentTextTheme, setParentTextTheme] = useState(null);
  const [derivedTextTheme, setDerivedTextTheme] = useState(null);

  const [parentJsonTheme, setParentJsonTheme] = useState(null);
  const [derivedJsonTheme, setDerivedJsonTheme] = useState(null);

  const [parentJsonSubmitting, setParentJsonSubmitting] = useState(false);
  const [derivedJsonSubmitting, setDerivedJsonSubmitting] = useState(false);


  // State for theme type selection
  const [themeType, setThemeType] = useState('basic'); // 'basic', 'parentText', 'parentJson', 'derivedText', 'derivedJson'

  const toolbarRef = useRef(null);

  // Effect to reset state when id changes
  useEffect(() => {
    setVideoType({ value: 'Slideshow', label: 'Slideshow' });
    setAnimation({ value: 'preset_short_animation', label: 'Preset Short Animation' });
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
    setWordCount(0); // Reset word count
    setCharacterCount(0); // Reset character count

    setThemeType('basic');
    setCustomThemeText('');
    setJsonTheme('');
    setTheme('');
    setShowTheme(false);
    setErrorMessage(null);
    setImageGenerationTheme(null);
    setParentJsonTheme(null);
    setDerivedJsonTheme(null);
    setDerivedTextTheme(null);
    setBasicTextTheme(null);
    setParentTextTheme(null);

    const headers = getHeaders();

    axios.get(`${PROCESSOR_API_URL}/quick_session/details?sessionId=${id}`, headers).then(function (dataRes) {
      const sessionData = dataRes.data;
      setSessionDetails(sessionData);
      if (sessionData.videoLink) {
        setVideoLink(sessionData.videoLink);
      }
      if (sessionData.sessionMessages) {
        setSessionMessages(sessionData.sessionMessages);
      }

      if (sessionData.derivedJsonTheme) {
        const prettyDerivedTheme = JSON.stringify(JSON.parse(sessionData.derivedJsonTheme), null, 2);
        setDerivedJsonTheme(prettyDerivedTheme);
        if (sessionData.parentJsonTheme) {
          const prettyParentTheme = JSON.stringify(JSON.parse(sessionData.parentJsonTheme), null, 2);
          setParentJsonTheme(prettyParentTheme);
        }
        setThemeType('derivedJson');
      } else if (sessionData.parentJsonTheme) {
        const prettyParentTheme = JSON.stringify(JSON.parse(sessionData.parentJsonTheme), null, 2);
        setParentJsonTheme(prettyParentTheme);
        setThemeType('parentJson');
      }
    });
  }, [id]); // This effect runs every time the id changes

  useEffect(() => {
    if (sessionDetails && sessionDetails.imageGenerationTheme) {
      //  setTheme(sessionDetails.imageGenerationTheme);
    }
  }, [sessionDetails]);

  useEffect(() => {
    if (speechLanguage.value !== subtitlesLanguage.value || speechLanguage.value !== 'eng') {
      // remove preset_short_animation from animation options
      const newAnimationOptions = ANIMATION_OPTIONS.filter((option) => option.value !== 'preset_short_animation');
      setAnimationOptions(newAnimationOptions);
      if (animation && animation.value === 'preset_short_animation') {
        const alternateZoomAnimation = ANIMATION_OPTIONS.find((option) => option.value === 'alternate_zoom');
        setAnimation(alternateZoomAnimation);
      }
    }
  }, [speechLanguage, subtitlesLanguage]);

  const getButtonClasses = (buttonType) => {
    const baseClasses = "rounded-lg pl-2 pr-2 pt-1 pb-1 inline-flex cursor-pointer";
    const selectedClasses = themeType === buttonType ? "bg-gray-700 text-white" : "bg-gray-800 text-gray-300 hover:bg-gray-700 hover:text-white";
    return `${baseClasses} ${selectedClasses}`;
  };

  const toggleThemeTextBox = (type) => {
    setThemeType(type);
  };

  useEffect(() => {
    if (sessionDetails && sessionDetails.derivedJsonTheme) {
      try {
        // If the theme is a valid JSON string, pretty format it
        const parsedTheme = JSON.parse(sessionDetails.imageGenerationTheme);
        const prettyTheme = JSON.stringify(parsedTheme, null, 2); // Pretty format with 2 spaces
        setDerivedJsonTheme(prettyTheme);
      } catch (e) {
        // If it's not JSON, handle it as a normal string (fallback)
        // setJsonTheme(sessionDetails.imageGenerationTheme);
      }
    } else if (sessionDetails && sessionDetails.parentJsonTheme) {
      try {
        // If the theme is a valid JSON string, pretty format it
        const parsedTheme = JSON.parse(sessionDetails.parentJsonTheme);
        const prettyTheme = JSON.stringify(parsedTheme, null, 2); // Pretty format with 2 spaces
        setParentJsonTheme(prettyTheme);
      } catch (e) {
        // If it's not JSON, handle it as a normal string (fallback)
        //setJsonTheme(sessionDetails.imageGenerationTheme);
      }
    }
  }, [sessionDetails]);


  const handleParentJsonThemeChange = (value) => {
    setParentJsonTheme(value);
    try {
      // Attempt to parse the JSON to ensure it's valid
      const parsedTheme = JSON.parse(value);
      setErrorMessage(null); // Clear any previous error messages
    } catch (e) {
      // If JSON is invalid, set an error message or handle it accordingly
      setErrorMessage("Invalid JSON format");
    }
  }

  const handleDerivedJsonThemeChange = (value) => {
    setDerivedJsonTheme(value);
    try {
      // Attempt to parse the JSON to ensure it's valid
      const parsedTheme = JSON.parse(value);
      setErrorMessage(null); // Clear any previous error messages
    } catch (e) {
      // If JSON is invalid, set an error message or handle it accordingly
      setErrorMessage("Invalid JSON format");
    }
  }



  const videoTypeOptions = [
    { value: 'Slideshow', label: 'Slideshow' },
    { value: 'Infinitezoom', label: 'Infinite Zoom' },
  ];

  const handleSceneCutoffTypeChange = (selectedOption) => {
    setSceneCutoffType(selectedOption);
  };

  const [animationOptions, setAnimationOptions] = useState(ANIMATION_OPTIONS);

  const speakerOptions = SPEAKER_TYPES.map((speaker_type) => ({
    value: speaker_type,
    label: speaker_type,
  }));

  useEffect(() => {
    if (sessionDetails && sessionDetails.textList) {
      setPromptList(sessionDetails.textList.join('\n'));
    }
  }, [sessionDetails]);

  const handleVideoTypeChange = (selectedOption) => {
    setVideoType(selectedOption);
    setAnimation(null);

    // Update animation options based on the selected video type
    if (selectedOption.value === 'Infinitezoom') {
      setAnimationOptions(INFINITE_ZOOM_ANIMATION_OPTIONS);
    } else if (selectedOption.value === 'Slideshow') {
      setAnimationOptions(ANIMATION_OPTIONS);
    }
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

  const handlePromptListChange = (event) => {
    const newPromptList = event.target.value;
    setPromptList(newPromptList);

    // Detect the language of the new prompt list
    const detectedLanguage = franc(newPromptList);
    const matchedLanguage = popularLanguages.find((lang) => lang.value === detectedLanguage);

    // Update language based on detected language
    if (matchedLanguage) {
      setSpeechLanguage(matchedLanguage);
      setSubtitlesLanguage(matchedLanguage);
    }

    // Update word count and character count
    const words = newPromptList.split(/\s+/).filter(Boolean).length;
    const characters = newPromptList.length;
    setWordCount(words);
    setCharacterCount(characters);

    // Recalculate credits based on the new prompt list
    calculateCredits(characters);
  };

  const calculateCredits = (characterCount) => {
    let credits = 0;

    // Calculate credits based on character count (500 characters per unit)
    const creditUnits = Math.ceil(characterCount / 500);
    credits += creditUnits * 5; // 5 credits per image unit

    if (document.querySelector("input[name='speechRequired']").checked) {
      credits += creditUnits * 5; // 5 credits per speech unit
    }

    if (speechLanguage.value !== subtitlesLanguage.value) {
      credits += creditUnits * 5; // 5 credits per translation unit
    }

    if (document.querySelector("input[name='backgroundMusicRequired']").checked) {
      credits += 5; // Add 5 credits for music if selected
    }

    setCreditsPreview(credits);
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
    if (lineItems.length > 16) {
      setErrorState(true);
      setErrorMessage('Number of prompts must be less than 16.');
      return;
    }

    // Validation: Number of letters in each sentence cannot be more than 300
    if (sceneCutoffType === 'scene_per_line') {
      for (const line of lineItems) {
        if (line.length > 500) {
          setErrorState(true);
          setErrorMessage('Each sentence cannot have more than 500 characters.');
          return;
        }
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

    // Language detection logic
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

    // Clean and stringify the JSON theme




    let addSubtitlesRequired = formData.get('addSubtitlesRequired') === 'on';
    const speechRequired = formData.get('speechRequired') === 'on';
    if (!speechRequired) {
      addSubtitlesRequired = false;
    }

    let themeData;
    if (themeType === 'basic') {
      themeData = theme;
    } else if (themeType === 'parentText') {
      themeData = basicTextTheme;
    } else if (themeType === 'parentJson') {
      themeData = parentJsonTheme;
    } else if (themeType === 'derivedText') {
      themeData = derivedTextTheme;
    } else if (themeType === 'derivedJson') {
      themeData = derivedJsonTheme;
    }


    setErrorMessage(null);
    setErrorState(false);

    let finalJsonTheme = themeData;

    const cleanedJson = cleanJsonTheme(themeData);
    if (cleanedJson && cleanedJson.length > 0) {
      finalJsonTheme = cleanedJson;
    }

    // Constructing the payload with all form elements
    let payload = {
      sessionId: id,
      lineItems: lineItems,
      videoType: videoType ? videoType.value : null,
      animation: animation ? animation.value : null,
      duration: duration.value,
      customDuration: duration.value === 'custom' ? parseInt(customDuration) : undefined,
      sceneCutoffType: sceneCutoffType ? sceneCutoffType.value : 'auto',
      musicPrompt: musicPrompt.trim() || undefined,
      theme: theme.split(',').map((item) => item.trim()).filter(Boolean).join(','),
      speakerType: speakerType ? speakerType.value : null,
      speechLanguage: speechLanguage.value,
      subtitlesLanguage: subtitlesLanguage.value,
      textLanguage: matchedLanguage.value,
      fontFamily: fontFamily,
      subtitlesTranslationRequired: subtitlesTranslationRequired,
      speechTranslationRequired: speechTranslationRequired,
      backgroundMusicRequired: formData.get('backgroundMusicRequired') === 'on',
      speechRequired: speechRequired,
      speechNormalizationRequired: formData.get('speechNormalizationRequired') === 'on',
      addSubtitlesRequired: addSubtitlesRequired,
      themeType: themeType, // Include the selected theme type in the payload
      themeData: themeType === 'basic' ? theme : finalJsonTheme,
      addTranscriptionsRequired: formData.get('addTranscriptionsRequired') === 'on',
    };

    if (duration.value === 'auto') {
      payload.setAutoDurationPerScene = true;
      payload.duration = 10;
    }

    if (duration.value === 'custom') {
      payload.duration = parseFloat(customDuration);
    }

    setExpressGenerationStatus(null);
    setVideoLink(null);


    axios
      .post(`${PROCESSOR_API_URL}/quick_session/create`, payload, headers)
      .then(function (dataRes) {
        startQuickGenerationPoll();
      })
      .catch(function (err) {
        if (err.response.data) {
          setErrorMessage(err.response.data);
        }
        setIsGenerationPending(false);
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
      axios
        .get(`${PROCESSOR_API_URL}/assistants/assistant_query_status?id=${id}`, headers)
        .then((dataRes) => {
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

  const purchaseCreditsForUser = (amountToPurchase) => {
    const purchaseAmountRequest = parseInt(amountToPurchase);
    const headers = getHeaders();
    const payload = {
      amount: purchaseAmountRequest,
    };

    axios
      .post(`${PROCESSOR_API_URL}/users/purchase_credits`, payload, headers)
      .then(function (dataRes) {
        const data = dataRes.data;

        if (data.url) {
          // Open the Stripe payment page in a new tab
          window.open(data.url, "_blank");
        } else {
          console.error("Failed to get Stripe payment URL");
        }
      })
      .catch(function (error) {
        console.error("Error during payment process", error);
      });
  };

  const submitAssistantQuery = (query) => {
    const headers = getHeaders();
    if (!headers) {
      showLoginDialog();
      return;
    }
    setSessionMessages([]);
    setIsAssistantQueryGenerating(true);
    axios
      .post(`${PROCESSOR_API_URL}/assistants/submit_assistant_query`, { id: id, query: query }, headers)
      .then((response) => {
        startAssistantQueryPoll();
      })
      .catch(function (err) {
        setIsAssistantQueryGenerating(false);
      });
  };

  let downloadPreviousRenderLink = null;
  if (sessionDetails && sessionDetails.videoLink) {
    downloadPreviousRenderLink = (
      <div className='flex justify-center text-xs underline hover:text-neutral-600'>
        <a href={`${PROCESSOR_API_URL}/${sessionDetails.videoLink}`} download className='text-white underline'>Download previous render</a>
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

  const handleSpeechCheckboxChange = () => {
    calculateCredits();
  };

  const handleMusicCheckboxChange = () => {
    calculateCredits();
  };

  let creditsProcessedPreviewDisplay = (
    <div className="text-white mt-0 p-2 bg-gray-900 rounded text-center">
      <div className="text-center items-center cursor-pointer" onClick={toggleCreditsBreakdown}>
        <span className='font-bold text-sm text-neutral-100'>This operation will consume {creditsPreview} credits</span>
        <FaChevronDown className={`transform ${showCreditsBreakdown ? 'rotate-180' : ''} inline-flex text-xs ml-1`} />
      </div>
      {showCreditsBreakdown && (
        <div className="mt-2 text-sm">
          {speechLanguage.value === 'jpn' || speechLanguage.value === 'zho' ? (
            <>
              {characterCount <= 2000 ? (
                <>
                  <p>5 credits for image</p>
                  {speakerType && <p>5 credits for speech</p>}
                  {speechLanguage.value !== subtitlesLanguage.value && <p>5 credits for translation</p>}
                  {musicPrompt.trim() !== '' && <p>5 credits for music</p>}
                </>
              ) : (
                <>
                  <p>10 credits for image</p>
                  {speakerType && <p>10 credits for speech</p>}
                  {speechLanguage.value !== subtitlesLanguage.value && <p>10 credits for translation</p>}
                  {musicPrompt.trim() !== '' && <p>5 credits for music</p>}
                </>
              )}
            </>
          ) : (
            <>
              {wordCount <= 500 ? (
                <>
                  <p>5 credits for image</p>
                  {speakerType && <p>5 credits for speech</p>}
                  {speechLanguage.value !== subtitlesLanguage.value && <p>5 credits for translation</p>}
                  {musicPrompt.trim() !== '' && <p>5 credits for music</p>}
                </>
              ) : (
                <>
                  <p>10 credits for image</p>
                  {speakerType && <p>10 credits for speech</p>}
                  {speechLanguage.value !== subtitlesLanguage.value && <p>10 credits for translation</p>}
                  {musicPrompt.trim() !== '' && <p>5 credits for music</p>}
                </>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );

  const viewInStudio = () => {
    navigate(`/video/${id}`);
  };

  const submitCustomTheme = (evt) => {
    evt.preventDefault();
    const headers = getHeaders();

    const payload = {
      sessionId: id,
      customTheme: customThemeText,
    };

    setParentJsonSubmitting(true);

    axios.post(`${PROCESSOR_API_URL}/quick_session/set_base_theme`, payload, headers).then(function (dataRes) {
      const data = dataRes.data;

      setParentJsonSubmitting(false);
      if (data.parentJsonTheme) {


        const imGenTheme = data.parentJsonTheme;
        setThemeType('parentJson');

        try {
          // If the theme is a valid JSON string, pretty format it
          const parsedTheme = JSON.parse(imGenTheme);
          const prettyTheme = JSON.stringify(parsedTheme, null, 2); // Pretty format with 2 spaces
          setParentJsonTheme(prettyTheme);
        } catch (e) {
          // If it's not JSON, handle it as a normal string (fallback)
          //    setJsonTheme(imGenTheme);
        }
      }
    });
  };

  const updatePrimaryJsonTheme = (evt) => {
    evt.preventDefault();
    const headers = getHeaders();
    setErrorMessage(null);
    setErrorState(false);

    const parentJson = cleanJsonTheme(parentJsonTheme);

    if (!parentJson) {

      setErrorState(true);
      setErrorMessage("Invalid JSON format for parent theme.");
      setParentJsonSubmitting(false);
      return;
    }
    const payload = {
      sessionId: id,
      parentJsonTheme: parentJson,
    };

    setParentJsonSubmitting(true);
    axios.post(`${PROCESSOR_API_URL}/quick_session/update_primary_json`, payload, headers).then(function (dataRes) {
      const data = dataRes.data;
      setParentJsonSubmitting(false);

    });

  }

  const updateDerivedJsonTheme = (evt) => {
    evt.preventDefault();
    setDerivedJsonSubmitting(true);
    const headers = getHeaders();
    setErrorMessage(null);
    setErrorState(false);

    const derivedJson = cleanJsonTheme(derivedJsonTheme);
    if (!derivedJson) {
      setErrorMessage("Invalid JSON format for derived theme.");
      setDerivedJsonSubmitting(false);
      return;
    }
    const payload = {
      sessionId: id,
      derivedJsonTheme: derivedJson,
    };

    axios.post(`${PROCESSOR_API_URL}/quick_session/update_derived_json`, payload, headers).then(function (dataRes) {
      setDerivedJsonSubmitting(false);
      const data = dataRes.data;

    });

  }

  const submitDerivedJsonTheme = (evt) => {

    evt.preventDefault();
    setDerivedJsonSubmitting(true);
    const headers = getHeaders();

    setErrorMessage(null);
    setErrorState(false);


    const parentJson = cleanJsonTheme(parentJsonTheme);

    if (!parentJson) {
      setErrorMessage("Invalid JSON format for parent theme.");
      setDerivedJsonSubmitting(false);
      return;
    }


    const payload = {
      sessionId: id,
      derivedTextTheme: derivedTextTheme,
      parentJsonTheme: parentJson,
    };

    axios.post(`${PROCESSOR_API_URL}/quick_session/set_derived_theme`, payload, headers).then(function (dataRes) {
      const data = dataRes.data;
      setDerivedJsonSubmitting(false);

      if (data.derivedJsonTheme) {


        const imGenTheme = data.derivedJsonTheme;
        setThemeType('derivedJson');

        try {
          // If the theme is a valid JSON string, pretty format it
          const parsedTheme = JSON.parse(imGenTheme);
          const prettyTheme = JSON.stringify(parsedTheme, null, 2); // Pretty format with 2 spaces
          setDerivedJsonTheme(prettyTheme);
        } catch (e) {

        }
      }

    });

  }

  let viewInStudioLink = <span />;
  if (videoLink) {
    viewInStudioLink = (
      <div className='flex justify-center text-xs underline hover:text-neutral-600'>
        <div onClick={viewInStudio} className='text-white underline cursor-pointer'>View in Studio</div>
      </div>
    );
  }

  const toggleThemeButton = (evt, type) => {
    evt.stopPropagation();
    toggleThemeTextBox(type)
  }

  let applyCustomThemeButton = <span />;
  let editThemeButtons = <span />;


  let customThemeTypeItems = <span />;

  const resetDerivedJson = (evt) => {
    evt.stopPropagation();
    setDerivedJsonTheme(null);
    setThemeType('parentJson');
  }

  let addThemeButtons = <span />;

  if (derivedJsonTheme && (themeType === 'derivedJson' || themeType === 'derivedParentJson')) {
    addThemeButtons = (
      <>
        <div className={getButtonClasses('derivedParentJson')}
          onClick={(evt) => (toggleThemeButton(evt, "derivedParentJson"))}>
          Parent JSON
        </div>

        <div className={getButtonClasses('derivedJson')}
          onClick={(evt) => (toggleThemeButton(evt, "derivedJson"))}>
          Derived JSON
        </div>

      </>
    )
  } else if (parentJsonTheme) {
    addThemeButtons = (
      <>
        <div className={getButtonClasses('parentJson')}
          onClick={(evt) => (toggleThemeButton(evt, "parentJson"))}>
          Parent JSON
        </div>
        <div className={getButtonClasses('addDerivedJson')}
          onClick={(evt) => (toggleThemeButton(evt, "addDerivedJson"))}>
          Add Derived theme text
        </div>
      </>
    )
  } else {
    addThemeButtons = (
      <>
        <div className={getButtonClasses('basic')}
          onClick={(evt) => (toggleThemeButton(evt, "basic"))}>
          Basic
        </div>
        <div className={getButtonClasses('custom')}
          onClick={(evt) => (toggleThemeButton(evt, "custom"))}>
          Custom
        </div>
      </>
    )
  }

  if (showTheme) {
    applyCustomThemeButton = (
      <div className='w-full'>

        {addThemeButtons}
        {editThemeButtons}
      </div>
    );
  }



  if (parentJsonTheme || derivedJsonTheme) {


    customThemeTypeItems = (
      <>
        {(themeType === 'parentJson' || themeType === 'derivedParentJson') && (
          <>
            <label className="whitespace-nowrap block text-xs text-left pl-2 pb-1">Enter JSON for custom theme (will override all other theme settings):</label>
            <AceEditor
              mode="json"
              theme="monokai"
              name="jsonThemeEditor"
              value={parentJsonTheme}
              onChange={handleParentJsonThemeChange} // Updated to handle JSON changes
              fontSize={14}
              showPrintMargin={true}
              showGutter={true}
              highlightActiveLine={true}
              setOptions={{
                enableBasicAutocompletion: true,
                enableLiveAutocompletion: true,
                enableSnippets: true,
                showLineNumbers: true,
                tabSize: 2,
              }}
              editorProps={{ $blockScrolling: true }}
              width="100%"
              height="200px"
              className="rounded"
            />
            <SecondaryButton onClick={updatePrimaryJsonTheme} isPending={parentJsonSubmitting}>Update Primary JSON</SecondaryButton>
          </>
        )}
        {themeType === 'derivedJson' && (
          <>
            <label className="whitespace-nowrap block text-xs text-left pl-2 pb-1">Enter JSON for custom theme (will override all other theme settings):</label>
            <AceEditor
              mode="json"
              theme="monokai"
              name="jsonThemeEditor"
              value={derivedJsonTheme}
              onChange={handleDerivedJsonThemeChange}


              fontSize={14}
              showPrintMargin={true}
              showGutter={true}
              highlightActiveLine={true}
              setOptions={{
                enableBasicAutocompletion: true,
                enableLiveAutocompletion: true,
                enableSnippets: true,
                showLineNumbers: true,
                tabSize: 2,
              }}
              editorProps={{ $blockScrolling: true }}
              width="100%"
              height="200px"
              className="rounded"
            />
            <div className={getButtonClasses('resetDerivedJson')}
              style={{ 'float': 'left' }}
              onClick={(evt) => resetDerivedJson(evt)}>
              Reset Derived theme
            </div>
            <SecondaryButton onClick={updateDerivedJsonTheme} isPending={derivedJsonSubmitting}>Update Derived JSON</SecondaryButton>



          </>
        )}

        {themeType === 'addDerivedJson' && (
          <>
            <label className="whitespace-nowrap block text-xs text-left pl-2 pb-1">Enter JSON for custom theme (will override all other theme settings):</label>
            <TextareaAutosize
              minRows={6}
              maxRows={10}
              className="w-full bg-gray-950 text-white p-2 rounded"
              placeholder="Enter derived theme text to update the base theme here..."
              name="derivedTextTheme"
              value={derivedTextTheme}
              onChange={(e) => setDerivedTextTheme(e.target.value)} />
            <SecondaryButton onClick={submitDerivedJsonTheme}
              isPending={derivedJsonSubmitting}>Apply Derived Theme</SecondaryButton>
          </>
        )}


        {themeType === 'updateCustom' && (
          <>
            <label className="whitespace-nowrap block text-xs text-left pl-2 pb-1">Enter theme keywords to update theme from the narrative:</label>
            <TextareaAutosize
              minRows={6}
              maxRows={10}
              className="w-full bg-gray-950 text-white p-2 rounded"
              placeholder="Enter custom theme text to update here..."
              name="customThemeText"
              value={customThemeText}
              onChange={(e) => setUpdateCustomThemeText(e.target.value)} />
          </>
        )}

      </>
    )
  }
  let currentThemeView = <span />;
  if (showTheme) {
    if (imageGenerationTheme) {
      currentThemeView = (
        <div className={`p-2 bg-gray-950 rounded mt-2 text-neutral-100`}>
          <div className='text-xs'>Current Theme: {imageGenerationTheme}</div>
        </div>
      );
    } else {

      currentThemeView = (
        <div className='p-2 bg-gray-950 rounded mt-2'>
          {themeType === 'basic' && (
            <>
              <label className="whitespace-nowrap block text-xs text-left pl-2 pb-1">Enter keywords:</label>
              <TextareaAutosize
                minRows={2}
                maxRows={5}
                className="w-full bg-gray-950 text-white p-2 rounded"
                placeholder="Add comma separated keywords for theme elements you'd like to apply to your session, leave empty to autogenerate"
                name="theme"
                value={theme}
                onChange={(e) => setTheme(e.target.value)}
              />
            </>
          )}
          {themeType === 'custom' && (
            <>
              <label className="whitespace-nowrap block text-xs text-left pl-2 pb-1">Enter custom theme which will override theme from the narrative:</label>
              <TextareaAutosize
                minRows={6}
                maxRows={10}
                className="w-full bg-gray-950 text-white p-2 rounded"
                placeholder="Enter custom theme base theme text here which will be applied to all renditions in this session..."
                name="customThemeText"
                value={customThemeText}
                onChange={(e) => setCustomThemeText(e.target.value)}
              />
              <SecondaryButton onClick={submitCustomTheme} isPending={parentJsonSubmitting}>Apply Custom Theme</SecondaryButton>
            </>

          )}
          {customThemeTypeItems}
        </div>
      );
    }
  }


  return (
    <div className='relative w-full'>
      {showResultDisplay && (
        <ProgressIndicator
          videoLink={videoLink}
          isGenerationPending={isGenerationPending}
          expressGenerationStatus={expressGenerationStatus}
          setShowResultDisplay={setShowResultDisplay}
          errorMessage={errorMessage}
          purchaseCreditsForUser={purchaseCreditsForUser}
          viewInStudio={viewInStudio}
        />
      )}
      <div className='mt-[60px]'>
        <div>
          {downloadPreviousRenderLink}
          {viewInStudioLink}
        </div>
        <div>
          {errorMessageDisplay}
        </div>
        <form onSubmit={submitQuickRender}>
          <div className='bg-neutral-950'>
            <div className="toolbar flex items-center gap-2 p-2 bg-gray-900 text-white ">
              <div className="grid grid-cols-4 items-center gap-2 w-full">
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
                </div>
                <div>
                  <div className='block'>
                    <div className='block'>
                      <label className="whitespace-nowrap block  text-xs text-left pl-2 pb-1">Duration/Scene:</label>
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
                <div>
                  <div className='block'>
                    <div className='block'>
                      <label className="whitespace-nowrap block  text-xs text-left pl-2 pb-1">Scene Cutoff:</label>
                    </div>
                  </div>
                  <div>
                    <SingleSelect
                      value={sceneCutoffType}
                      onChange={handleSceneCutoffTypeChange}
                      options={[
                        { label: 'Auto', value: 'auto' },
                        { label: '1 Scene/line', value: 'scene_per_line' },
                      ]}
                      className="w-full"
                    />
                  </div>
                </div>
              </div>
            </div>
            <div className='mt-2 mb-2 p-2 bg-gray-900'>
              <div className='md:flex hidden w-full  text-white '>
                <div className='basis-full  flex  items-center'>
                  <div className='inline-flex mr-2 pr-2 cursor-pointer align-left'
                    style={{ 'textAlign': 'left' }}
                    onClick={toggleDetails}>
                    Speech & music <FaChevronDown className='inline-flex mt-1' />
                  </div>
                  <div className='inline-flex'>
                    <div className='block'>
                      <div className='text-xs block'>
                        Add Music
                      </div>
                      <input type='checkbox' className="custom-checkbox form-checkbox h-5 w-5 text-gray-600"
                        name="backgroundMusicRequired"
                        defaultChecked={true}
                        onChange={handleMusicCheckboxChange} />
                    </div>
                  </div>
                  <div className='flex ml-8 w-full'>
                    <div className=' ml-1 mr-2 mt-1'>
                      <div className='text-xs block'>
                        Add Speech
                      </div>
                      <input type="checkbox"
                        className="custom-checkbox form-checkbox h-5 w-5 text-gray-600"
                        name="speechRequired" defaultChecked={true}
                        onChange={handleSpeechCheckboxChange}
                      />
                    </div>
                    <div>
                      <div>
                        <div className='text-xs'>
                          Normalize text for speech
                        </div>
                        <input type="checkbox"
                          name="speechNormalizationRequired" className="custom-checkbox form-checkbox h-5 w-5 text-gray-600"
                          defaultChecked={true} />
                      </div>
                    </div>
                    <div>
                      <div>
                        <div className='text-xs'>
                          Add Subtitles
                        </div>
                        <input type="checkbox"
                          name="addSubtitlesRequired" className="custom-checkbox form-checkbox h-5 w-5 text-gray-600"
                          defaultChecked={true} />
                      </div>
                    </div>
                    {(speechLanguage.value === subtitlesLanguage.value && speechLanguage.value === 'eng' && 
                    (<div>
                      <div>
                        <div className='text-xs'>
                          Create Transcription
                        </div>
                        <input type="checkbox"
                          name="addTranscriptionsRequired" className="custom-checkbox form-checkbox h-5 w-5 text-gray-600"
                          defaultChecked={true} />
                      </div>
                    </div>) )}

                    <div className='w-1/3'>
                      <label className="whitespace-nowrap block text-xs text-left pl-2 pb-1 text-white">Speech Language:</label>
                      <SingleSelect
                        value={speechLanguage}
                        onChange={handleSpeechLanguageChange}
                        options={popularLanguages}
                        className="w-full"
                      />
                    </div>
                    <div className='w-1/3 ml-4'>
                      <label className="whitespace-nowrap block text-xs text-left pl-2 pb-1 text-white">Subtitles Language:</label>
                      <SingleSelect
                        value={subtitlesLanguage}
                        onChange={handleSubtitlesLanguageChange}
                        options={popularLanguages}
                        className="w-full"
                      />
                    </div>
                    <div className='w-1/3 ml-4'>
                      <label className='whitespace-nowrap block text-xs text-left pl-2 pb-1 text-white'>
                        Speaker
                      </label>
                      <SingleSelect
                        value={speakerType}
                        onChange={handleSpeakerChange}
                        options={speakerOptions}
                        className="w-40 ml-2" // Adjust width and margin as needed
                      />
                    </div>
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
            text-left text-white h-[40px] cursor-pointer'>
              <div className='inline-flex w-[84%]' onClick={toggleTheme}>
                Theme <FaChevronDown className='inline-flex ml-2' />
                {applyCustomThemeButton}
              </div>
            </div>
            {currentThemeView}
            <div className='mt-2 mb-2 p-2 bg-gray-900 text-white
             h-[40px] cursor-pointer text-left' onClick={toggleTheme}>
              Dialog text lines <FaArrowRight className='inline-flex ml-2' />
            </div>
            <div className='mt-2 p-2 bg-gray-900'>
              <TextareaAutosize
                minRows={5}
                maxRows={20}
                className="w-11/12 bg-gray-950 text-white p-4 rounded mx-auto"
                placeholder="Type your dialogs here. One line per dialog. Do not enter prompts, just the dialog text."
                name="promptList"
                value={promptList}
                onChange={handlePromptListChange} // Update state and calculations on change
              />
              <div className='relative mt-4'>
                <CommonButton type="submit" >
                  Submit
                </CommonButton>
                <div className='absolute right-4 top-0'>
                  {creditsProcessedPreviewDisplay}
                </div>
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
