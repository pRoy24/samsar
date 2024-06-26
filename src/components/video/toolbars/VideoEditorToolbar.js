import React, { useState } from 'react';

import PromptGenerator from '../../editor/toolbar/PromptGenerator.tsx';
import OutpaintGenerator from '../../editor/toolbar/OutpaintGenerator.tsx';
import RangeSlider from '../../editor/utils/RangeSlider.js';
import AddText from '../../editor/toolbar/AddText.tsx';
import { FaChevronDown, FaRobot } from 'react-icons/fa';
import AddShapeDisplay from '../../editor/utils/AddShapeDisplay.tsx';
import { useColorMode } from '../../../contexts/ColorMode.js';
import LayersDisplay from '../../editor/toolbar/LayersDisplay.tsx';
import Select from 'react-select';
import { CURRENT_EDITOR_VIEW, CURRENT_TOOLBAR_VIEW, TOOLBAR_ACTION_VIEW } from '../../../constants/Types.ts';
import CommonButton from '../../common/CommonButton.tsx';
import SecondaryButton from '../../common/SecondaryButton.tsx';
import { PiSelectionAll } from "react-icons/pi";
import { HiTemplate } from "react-icons/hi";
import { MdOutlineRectangle } from "react-icons/md";
import { IoTriangleOutline } from "react-icons/io5";
import { FaPencilAlt, FaEraser, FaCrosshairs, FaUpload } from 'react-icons/fa';
import { HiRefresh } from "react-icons/hi";
import { FaRegCircle } from "react-icons/fa";
import { GrRadialSelected } from "react-icons/gr";
import { FaMusic } from 'react-icons/fa6';
import { RiSpeakLine } from "react-icons/ri";
import MusicSelectToolbar from './audio/MusicSelectToolbar.js';
import { LuCombine } from "react-icons/lu";
import { TbLibraryPhoto } from "react-icons/tb";


import { SPEAKER_TYPES } from '../../../constants/Types.ts';




export default function VideoEditorToolbar(props: any) {
  const {
    saveIntermediateImage,
    showAttestationDialog,
    sessionDetails, nftData, setNftData,
    chainList, setSelectedChain, selectedChain,
    showTemplatesSelect, addTextBoxToCanvas,
    showMask, setShowMask,
    editBrushWidth, setEditBrushWidth,
    setCurrentViewDisplay, currentViewDisplay,
    textConfig, setTextConfig,
    activeItemList, setActiveItemList,
    selectedGenerationModel, setSelectedGenerationModel,
    editMasklines, setEditMaskLines,
    setSelectedShape,
    isOutpaintPending,
    fillColor, setFillColor,
    strokeColor, setStrokeColor,
    strokeWidthValue, setStrokeWidthValue,
    generationError,
    outpaintError,
    isPublicationPending,
    selectedId,
    exportAnimationFrames,

    pencilWidth,
    setPencilWidth,
    pencilColor,
    setPencilColor,
    eraserWidth,
    setEraserWidth,
    pencilOptionsVisible,
    eraserOptionsVisible,
    // setEraserOptionsVisible,
    cursorSelectOptionVisible,
    setCursorSelectOptionVisible,
    showUploadAction,
    currentCanvasAction,
    setCurrentCanvasAction,
    setSelectedLayerSelectShape,
    updateSessionLayerActiveItemList,
    submitGenerateMusicRequest,
    audioLayers,
    audioGenerationPending,
    submitAddTrackToProject,
    combineCurrentLayerItems,
     showAddAudioToProjectDialog,
     submitUpdateSessionDefaults

  } = props;


  const [selectedAnimationOption, setSelectedAnimationOption] = useState(null);
  const [animationParams, setAnimationParams] = useState({});
  const [addText, setAddText] = useState('');
  const { colorMode } = useColorMode();


  const submitAddText = () => {
    const payload = {
      type: 'text',
      text: addText,
      config: textConfig
    }
    addTextBoxToCanvas(payload);
  }

  const applyAnimationToLayer = () => {
    if (selectedId) {
      const updatedItemList = activeItemList.map(layer => {
        if (layer.id === selectedId) {
          let animations = layer.animations || [];

          // Check if an animation of the same type already exists
          const existingAnimationIndex = animations.findIndex(animation => animation.type === selectedAnimationOption);

          if (existingAnimationIndex !== -1) {
            // Update the existing animation
            animations[existingAnimationIndex] = {
              type: selectedAnimationOption,
              params: animationParams
            };
          } else {
            // Add a new animation
            animations.push({
              type: selectedAnimationOption,
              params: animationParams
            });
          }

          return {
            ...layer,
            animations: animations
          };
        }
        return layer;
      });

      setActiveItemList(updatedItemList);
      updateSessionLayerActiveItemList(updatedItemList);
      exportAnimationFrames(updatedItemList);
    }
  }


  const handleAnimationChange = (selectedOption) => {
    setSelectedAnimationOption(selectedOption.value);
  }

  const updateAnimationParams = (param, value) => {
    const floatValue = parseFloat(value);
    setAnimationParams(prevParams => ({
      ...prevParams,
      [param]: isNaN(floatValue) ? 0 : floatValue
    }));
  }

  const getAnimationBoundariesDisplay = (selectedOption) => {
    if (selectedOption === 'fade') {
      return (
        <div className='mt-2'>
          <div className='grid grid-cols-2 gap-2 m-auto text-center'>
            <div>
              <input type='text' placeholder='Start Fade' onChange={(e) => updateAnimationParams('startFade', e.target.value)} className='w-[60px]' />
              <div>Start Fade</div>
            </div>
            <div>
              <input type='text' placeholder='End Fade' onChange={(e) => updateAnimationParams('endFade', e.target.value)} className='w-[60px]' />
              <div>End Fade</div>
            </div>
          </div>
          <div className='m-auto text-center'>
            <SecondaryButton onClick={applyAnimationToLayer}>Apply</SecondaryButton>
          </div>
        </div>
      )
    } else if (selectedOption === 'slide') {
      return (
        <div className='mt-2'>
          <div className='grid grid-cols-2 gap-2 m-auto text-center'>
            <div>
              <input type='text' placeholder='Start X' onChange={(e) => updateAnimationParams('startX', e.target.value)} className='w-[60px]' />
              <div>Start X</div>
            </div>
            <div>
              <input type='text' placeholder='Start Y' onChange={(e) => updateAnimationParams('startY', e.target.value)} className='w-[60px]' />
              <div>Start Y</div>
            </div>
            <div>
              <input type='text' placeholder='End X' onChange={(e) => updateAnimationParams('endX', e.target.value)} className='w-[60px]' />
              <div>End X</div>
            </div>
            <div>
              <input type='text' placeholder='End Y' onChange={(e) => updateAnimationParams('endY', e.target.value)} className='w-[60px]' />
              <div>End Y</div>
            </div>
          </div>
          <div className='m-auto text-center'>
            <SecondaryButton onClick={applyAnimationToLayer}>Apply</SecondaryButton>
          </div>
        </div>
      )
    } else if (selectedOption === 'zoom') {
      return (
        <div className='mt-2'>
          <div className='grid grid-cols-2 gap-2 m-auto text-center'>
            <div>
              <input type='text' placeholder='Start Scale'
                onChange={(e) => updateAnimationParams('startScale', e.target.value)} className='w-full' />
              <div>Start Scale</div>
            </div>
            <div>
              <input type='text' placeholder='End Scale'
                onChange={(e) => updateAnimationParams('endScale', e.target.value)} className='w-full' />
              <div>End Scale</div>
            </div>
          </div>
          <div className='m-auto text-center'>
            <SecondaryButton onClick={applyAnimationToLayer}>Apply</SecondaryButton>
          </div>
        </div>
      )
    } else if (selectedOption === 'rotate') {
      return (
        <div className='mt-2'>
          <div className='grid grid-cols-2 gap-2 m-auto text-center'>
            <div>
              <input type='text' placeholder='Start Rotate'
                onChange={(e) => updateAnimationParams('rotationSpeed', e.target.value)} className='w-[60px] m-auto' />
              <div>Rotations/second</div>
            </div>
          </div>
          <div className='m-auto text-center'>
            <SecondaryButton onClick={applyAnimationToLayer}>Apply</SecondaryButton>
          </div>
        </div>
      )
    }
  }

  let generateDisplay = <span />;
  if (currentViewDisplay === CURRENT_TOOLBAR_VIEW.SHOW_GENERATE_DISPLAY) {
    generateDisplay = <PromptGenerator {...props} />
  }

  let addTextDisplay = <span />;
  if (currentViewDisplay === CURRENT_TOOLBAR_VIEW.SHOW_ADD_TEXT_DISPLAY) {
    addTextDisplay = (
      <AddText
        setAddText={setAddText}
        submitAddText={submitAddText}
        textConfig={textConfig}
        setTextConfig={setTextConfig}
      />
    )
  }

  let editDisplay = <span />;
  if (currentViewDisplay === CURRENT_TOOLBAR_VIEW.SHOW_EDIT_MASK_DISPLAY) {
    editDisplay = (
      <div>
        <RangeSlider editBrushWidth={editBrushWidth} setEditBrushWidth={setEditBrushWidth} />
        <OutpaintGenerator {...props} />
      </div>
    )
  }

  let layersDisplay = <span />;
  if (currentViewDisplay === CURRENT_TOOLBAR_VIEW.SHOW_LAYERS_DISPLAY) {
    layersDisplay = (
      <div>
        <LayersDisplay activeItemList={activeItemList} setActiveItemList={setActiveItemList}
          updateSessionLayerActiveItemList={updateSessionLayerActiveItemList} />
      </div>
    )
  }


  const toggleCurrentViewDisplay = (view: string) => {
    if (view === currentViewDisplay) {
      setCurrentViewDisplay(CURRENT_TOOLBAR_VIEW.SHOW_DEFAULT_DISPLAY);
    } else {
      setCurrentViewDisplay(view);
    }
  }

  const showLibraryAction = () => {
    setCurrentCanvasAction(TOOLBAR_ACTION_VIEW.SHOW_LIBRARY_DISPLAY);
  }

  let addShapeDisplay = <span />;

  if (currentViewDisplay === CURRENT_TOOLBAR_VIEW.SHOW_ADD_SHAPE_DISPLAY) {
    addShapeDisplay = (
      <AddShapeDisplay
        setSelectedShape={setSelectedShape}
        setStrokeColor={setStrokeColor}
        setFillColor={setFillColor}
        fillColor={fillColor}
        strokeColor={strokeColor}
        strokeWidthValue={strokeWidthValue}
        setStrokeWidthValue={setStrokeWidthValue}
      />
    )
  }

  let uploadDisplay = <span />;
  if (currentViewDisplay === CURRENT_TOOLBAR_VIEW.SHOW_UPLOAD_DISPLAY) {
    uploadDisplay = (
      <div>
        <div className='m-auto text-center grid grid-cols-3'>
          <div className="text-center m-auto align-center mt-4 mb-4" onClick={() => showTemplateAction()} >
            <HiTemplate className="text-2xl m-auto cursor-pointer" />
            <div className="text-[10px] tracking-tight m-auto text-center">
              Templates
            </div>
          </div>

          <div className="text-center m-auto align-center mt-4 mb-4">
            <FaUpload className="text-2xl m-auto cursor-pointer" onClick={() => showUploadAction()} />
            <div className="text-[12px] tracking-tight m-auto text-center">
              Upload
            </div>
          </div>
          <div className="text-center m-auto align-center mt-4 mb-4">
            <TbLibraryPhoto className="text-2xl m-auto cursor-pointer" onClick={() => showLibraryAction()} />
            <div className="text-[12px] tracking-tight m-auto text-center">
              Library
            </div>
          </div>

        </div>

      </div>
    )

  }

  let bgColor = "bg-cyber-black border-blue-900  ";
  if (colorMode === 'light') {
    bgColor = "bg-neutral-50  text-neutral-900 ";
  }

  let buttonBgcolor = "bg-gray-900  text-white";
  if (colorMode === 'light') {
    buttonBgcolor = "bg-stone-200  text-neutral-900";
  }

  let textInnerColor = colorMode === 'dark' ? 'text-neutral-900' : 'text-white';

  const text2Color = colorMode === 'dark' ? 'text-neutral-100' : 'text-neutral-900';

  let animateOptionsDisplay = <span />;

  const animationOptions = [
    { value: 'fade', label: 'Fade' },
    { value: 'slide', label: 'Slide' },
    { value: 'zoom', label: 'Zoom' },
    { value: 'rotate', label: 'Rotate' }
  ];

  if (currentViewDisplay === CURRENT_TOOLBAR_VIEW.SHOW_ANIMATE_DISPLAY) {
    let animationOptionMeta = <span />;
    if (selectedAnimationOption) {
      animationOptionMeta = getAnimationBoundariesDisplay(selectedAnimationOption);
    }
    animateOptionsDisplay = (
      <div>
        Select animation
        <div>
          <Select options={animationOptions} onChange={handleAnimationChange} />
        </div>
        <div>
          {animationOptionMeta}
        </div>
      </div>
    )
  }

  const submitGenerateMusic = (evt) => {
    evt.preventDefault();

    const formData = new FormData(evt.target);
    const promptText = formData.get('promptText');
    const isInstrumental = formData.get('isInstrumental') === 'on';

    const body = {
      prompt: promptText,
      generationType: 'music',
      isInstrumental: isInstrumental,
    }

    submitGenerateMusicRequest(body);

  }

  const submitGenerateSpeech = (evt) => {
    evt.preventDefault();

    const formData = new FormData(evt.target);
    const promptText = formData.get('promptText');

    const speaker = formData.get('speakerOptions');

    const body = {
      prompt: promptText,
      generationType: 'speech',
      speaker: speaker
    };

    submitGenerateMusicRequest(body);
  }


  const showTemplateAction = () => {
    //   setPencilOptionsVisible(false);
    // setEraserOptionsVisible(false);
    setCursorSelectOptionVisible(false);
    setCurrentViewDisplay(CURRENT_TOOLBAR_VIEW.SHOW_TEMPLATES_DISPLAY)
  }


  let bgSelectedColor = colorMode === 'dark' ? "bg-gray-800" : "bg-gray-200";
  let actionsOptionsDisplay = <span />;
  let actionsSubOptionsDisplay = <span />;

  if (currentViewDisplay === CURRENT_TOOLBAR_VIEW.SHOW_ACTIONS_DISPLAY) {

    if (currentCanvasAction === TOOLBAR_ACTION_VIEW.SHOW_PENCIL_DISPLAY) {
      actionsSubOptionsDisplay = (
        <div>
          <div className="static mt-2  rounded shadow-lg">
            <label className="block mb-2">Width:</label>
            <input type="range" min="1" max="50"
              className="w-full" value={pencilWidth} onChange={(e) => setPencilWidth(e.target.value)} />
            <label className="block mt-2 mb-2">Color:</label>
            <input type="color" value={pencilColor} onChange={(e) => setPencilColor(e.target.value)} />
          </div>
        </div>
      )
    } else if (currentCanvasAction === TOOLBAR_ACTION_VIEW.SHOW_ERASER_DISPLAY) {
      actionsSubOptionsDisplay = (
        <div>
          <div className="static mt-2  rounded shadow-lg ">
            <label className="block mb-2">Width:</label>
            <input type="range" min="1" max="100" className="w-full"
              value={eraserWidth} onChange={(e) => setEraserWidth(e.target.value)} />
          </div>
        </div>
      )
    }

    actionsOptionsDisplay = (
      <div className={`grid grid-cols-3 ${text2Color} h-auto`}>
        <div className={`text-center m-auto align-center  p-1 h-[50px]  rounded-sm ${pencilOptionsVisible ? bgSelectedColor : bgColor}`}>
          <div onClick={() => setCurrentCanvasAction(TOOLBAR_ACTION_VIEW.SHOW_PENCIL_DISPLAY)}>
            <FaPencilAlt className="text-2xl m-auto cursor-pointer" />
            <div className="text-[10px] tracking-tight m-auto text-center">
              Pencil
            </div>
          </div>

          {pencilOptionsVisible && (
            <div className="static mt-2  rounded shadow-lg">
              <label className="block mb-2">Width:</label>
              <input type="range" min="1" max="50"
                className="w-full" value={pencilWidth} onChange={(e) => setPencilWidth(e.target.value)} />
              <label className="block mt-2 mb-2">Color:</label>
              <input type="color" value={pencilColor} onChange={(e) => setPencilColor(e.target.value)} />
            </div>
          )}
        </div>

        <div className={`text-center m-auto align-center p-1 h-[50px]  rounded-sm ${eraserOptionsVisible ? bgSelectedColor : bgColor}`}>
          <div onClick={() => setCurrentCanvasAction(TOOLBAR_ACTION_VIEW.SHOW_ERASER_DISPLAY)}>
            <FaEraser className="text-2xl m-auto cursor-pointer" />
            <div className="text-[10px] tracking-tight m-auto text-center">
              Eraser
            </div>
          </div>

          {eraserOptionsVisible && (
            <div className="static mt-2  rounded shadow-lg ">
              <label className="block mb-2">Width:</label>
              <input type="range" min="1" max="100" className="w-full"
                value={eraserWidth} onChange={(e) => setEraserWidth(e.target.value)} />
            </div>
          )}
        </div>

        <div className={`text-center m-auto align-center p-1 h-[50px]  rounded-sm ${cursorSelectOptionVisible ? bgSelectedColor : bgColor}`} onClick={() => setCursorSelectOptionVisible(!cursorSelectOptionVisible)}>


          <div onClick={() => combineCurrentLayerItems()}>
            <LuCombine className="text-2xl m-auto cursor-pointer" />
            <div className="text-[10px] tracking-tight m-auto text-center">
              Combine
            </div>
          </div>

          {eraserOptionsVisible && (
            <div className="static mt-2  rounded shadow-lg ">
              <label className="block mb-2">Width:</label>
              <input type="range" min="1" max="100" className="w-full"
                value={eraserWidth} onChange={(e) => setEraserWidth(e.target.value)} />
            </div>
          )}



        </div>
      </div>
    )
  }

  let selectOptionsDisplay = <span />;
  if (currentViewDisplay === CURRENT_TOOLBAR_VIEW.SHOW_SELECT_DISPLAY) {
    selectOptionsDisplay = (
      <div className={`grid grid-cols-2 ${text2Color} h-auto`}>
        <div>
          <div className={`text-center m-auto align-center p-1 h-[50px]  rounded-sm ${cursorSelectOptionVisible ? bgSelectedColor : bgColor}`}
            onClick={() => setCurrentCanvasAction(TOOLBAR_ACTION_VIEW.SHOW_SELECT_LAYER_DISPLAY)}>
            <FaCrosshairs className="text-2xl m-auto cursor-pointer" />
            <div className="text-[10px] tracking-tight m-auto text-center">
              Select Layer
            </div>
          </div>
        </div>
        <div className={`text-center m-auto align-center p-1 h-[50px]  rounded-sm `}
          onClick={() => setCurrentCanvasAction(TOOLBAR_ACTION_VIEW.SHOW_SELECT_SHAPE_DISPLAY)} >
          <PiSelectionAll className="text-2xl m-auto cursor-pointer" />
          <div className="text-[10px] tracking-tight m-auto text-center">
            Select Shape
          </div>
        </div>
      </div>
    )
  }

  let selectSubObjectionsDisplay = <span />;

  if (currentCanvasAction === TOOLBAR_ACTION_VIEW.SHOW_SELECT_SHAPE_DISPLAY &&
    currentViewDisplay === CURRENT_TOOLBAR_VIEW.SHOW_SELECT_DISPLAY
  ) {
    selectSubObjectionsDisplay = (
      <div>
        <div className={`grid grid-cols-2 w-full ${text2Color} h-auto`}>
          <div className="text-center m-auto align-center p-1 h-[50px] rounded-sm">
            <button onClick={() => setSelectedLayerSelectShape('rectangle')}>
              <div className="text-2xl m-auto cursor-pointer">
                <MdOutlineRectangle />
                <div className='text-xs'>
                  Rectangle
                </div>
              </div>
            </button>
          </div>
          <div className="text-center m-auto align-center p-1 h-[50px] rounded-sm">
            <button onClick={() => setSelectedLayerSelectShape('circle')}>
              <div className="text-2xl m-auto cursor-pointer">

                <FaRegCircle />
                <div className='text-xs'>
                  Circle
                </div>
              </div>
            </button>
          </div>
        </div>
      </div>
    )
  }

  let audioOptionsDisplay = <span />;
  let audioSubOptionsDisplay = <span />;
  if (currentViewDisplay === CURRENT_TOOLBAR_VIEW.SHOW_AUDIO_DISPLAY) {
    audioOptionsDisplay = (
      <div className={`grid grid-cols-3 ${text2Color} h-auto`}>

        <div onClick={() => { setCurrentCanvasAction(TOOLBAR_ACTION_VIEW.SHOW_SPEECH_GENERATE_DISPLAY) }}>
          <RiSpeakLine />
          Speech
        </div>
        <div onClick={() => (setCurrentCanvasAction(TOOLBAR_ACTION_VIEW.SHOW_MUSIC_GENERATE_DISPLAY))}>
          <FaMusic />
          Music
        </div>
        <div onClick={() => showAddAudioToProjectDialog()}>
          <FaUpload />
          Upload
        </div>
      </div>
    )


    if (currentCanvasAction === TOOLBAR_ACTION_VIEW.SHOW_MUSIC_GENERATE_DISPLAY) {
      audioSubOptionsDisplay = (
        <div>
          <form name="audioGenerateForm" className="w-full" onSubmit={submitGenerateMusic}>
            <textarea className={`w-full h-20 ${bgColor} ${text2Color}`}
              name="promptText" placeholder="Enter prompt text here" />
            <div className='flex flex-row'>
              <div className='basis-1/3'>
                <input type='checkbox' name='isInstrumental' />
                <div className='inline-flex text-xs'>
                  Instr
                </div>
              </div>
              <div className='basis-2/3 m-auto'>
                <SecondaryButton type='submit' isPending={audioGenerationPending}>
                  Generate
                </SecondaryButton>
              </div>
            </div>


          </form>
        </div>
      )
    }
    if (currentCanvasAction === TOOLBAR_ACTION_VIEW.SHOW_SPEECH_GENERATE_DISPLAY) {
      const speakerOptions = SPEAKER_TYPES.map(speaker => {
        return {
          value: speaker,
          label: speaker
        }
      });
      audioSubOptionsDisplay = (
        <div>
          <form name="audioGenerateForm" className="w-full" onSubmit={submitGenerateSpeech}>
            <textarea className={`w-full h-20 ${bgColor} ${text2Color}`}
              name="promptText" placeholder="Enter prompt text here" />
            <div className='flex flex-row'>
              <div className='basis-1/2'>
                <Select name="speakerOptions" options={speakerOptions}

                  styles={{
                    control: (provided, state) => ({
                      ...provided,
                      backgroundColor: 'white',
                      borderColor: state.isFocused ? '#007BFF' : '#ced4da',
                      '&:hover': {
                        borderColor: state.isFocused ? '#007BFF' : '#ced4da'
                      },
                      boxShadow: state.isFocused ? '0 0 0 0.2rem rgba(0, 123, 255, 0.25)' : null,
                      minHeight: '38px',
                      height: '38px'
                    }),
                    option: (provided, state) => ({
                      ...provided,
                      backgroundColor: state.isSelected ? '#007BFF' : state.isFocused ? '#e7f3ff' : null,
                      color: state.isSelected ? 'white' : 'black',
                      '&:hover': {
                        backgroundColor: '#e7f3ff'
                      }
                    })
                  }}
                  defaultValue={speakerOptions[0]}
                />
              </div>
              <div className='basis-1/2 m-auto'>
                <SecondaryButton type='submit' isPending={audioGenerationPending}>
                  Generate
                </SecondaryButton>
              </div>
            </div>


          </form>

        </div>
      )
    }

    if (currentCanvasAction === TOOLBAR_ACTION_VIEW.SHOW_PREVIEW_MUSIC_DISPLAY) {
      if (audioLayers.length === 0) {
        return;
      }
      const latestAudioLayer = audioLayers[audioLayers.length - 1];
      audioOptionsDisplay = <MusicSelectToolbar audioLayer={latestAudioLayer}
        submitAddTrackToProject={submitAddTrackToProject}
        setCurrentCanvasAction={setCurrentCanvasAction}
      />;

      audioSubOptionsDisplay = <span />;

    }
  }

  let defaultsOptionDisplay = <span />;
  let defaultsSubOptionsDisplay = <span />;

  if (currentViewDisplay === CURRENT_TOOLBAR_VIEW.SHOW_SET_DEFAULTS_DISPLAY) {
    console.log(sessionDetails);
    const { defaultSceneDuration, imageGenerationTheme } = sessionDetails;
    defaultsOptionDisplay = (
      <div>
        <form onSubmit={submitUpdateSessionDefaults}>
          <input type="textarea" placeholder="Project theme"
          name="imageGenerationTheme" 
          rows={5}
          className={`w-full h-20 mt-2 ${bgColor} ${text2Color}`} 
          defaultValue={imageGenerationTheme} 
          />
          <input type="text" placeholder="Scene duration"
            name="defaultSceneDuration"
           className={`w-full mt-2 ${bgColor} ${text2Color}`}
            defaultValue={defaultSceneDuration}
          />
          <SecondaryButton type="submit">Save</SecondaryButton>
        </form>
      </div>
    )

  }
  return (
    <div className={`border-l-2 ${bgColor}  h-full m-auto fixed top-0 overflow-y-auto pl-2 r-4 w-[16%] pr-2`}>
      <div className='mt-[80px] '>
        <div className={`pt-4 pb-4 ${buttonBgcolor} mt-4 rounded-sm  text-left pl-2 pr-2`}>
          <div className='text-lg font-bold m-auto cursor-pointer' onClick={() => toggleCurrentViewDisplay(CURRENT_TOOLBAR_VIEW.SHOW_SET_DEFAULTS_DISPLAY)}>
            <div className='inline-flex ml-4 pl-4'>
              Defaults
            </div>
            <FaChevronDown className='inline-flex float-right mr-4 mt-2 text-sm' />
          </div>
          <div className={`${textInnerColor}`}>
            {defaultsOptionDisplay}
          </div>
          <div>
            {defaultsSubOptionsDisplay}
          </div>
        </div>
        <div className={`pt-4 pb-4 ${buttonBgcolor} mt-4 rounded-sm  text-left pl-2 pr-2`}>
          <div className='text-lg font-bold m-auto cursor-pointer' onClick={() => toggleCurrentViewDisplay(CURRENT_TOOLBAR_VIEW.SHOW_ACTIONS_DISPLAY)}>
            <div className='inline-flex ml-4 pl-4'>
              Actions
            </div>
            <FaChevronDown className='inline-flex float-right mr-4 mt-2 text-sm' />
          </div>
          <div className={`${textInnerColor}`}>
            {actionsOptionsDisplay}
          </div>
          <div>
            {actionsSubOptionsDisplay}
          </div>
        </div>
        <div className={`pt-4 pb-4 ${buttonBgcolor} mt-4 rounded-sm  text-left pl-2 pr-2`}>
          <div className='text-lg font-bold m-auto cursor-pointer' onClick={() => toggleCurrentViewDisplay(CURRENT_TOOLBAR_VIEW.SHOW_AUDIO_DISPLAY)}>
            <div className='inline-flex ml-4 pl-4'>
              Generate Audio
            </div>
            <FaChevronDown className='inline-flex float-right mr-4 mt-2 text-sm' />
          </div>
          <div className={`${textInnerColor}`}>
            {audioOptionsDisplay}
          </div>
          <div>
            {audioSubOptionsDisplay}
          </div>
        </div>

        <div className={`pt-4 pb-4 ${buttonBgcolor} mt-4 rounded-sm  text-left pl-2 pr-2`}>
          <div className='text-lg font-bold m-auto cursor-pointer' onClick={() => toggleCurrentViewDisplay(CURRENT_TOOLBAR_VIEW.SHOW_SELECT_DISPLAY)}>
            <div className='inline-flex ml-4 pl-4'>
              Select
            </div>
            <FaChevronDown className='inline-flex float-right mr-4 mt-2 text-sm' />
          </div>
          <div className={`${textInnerColor}`}>
            {selectOptionsDisplay}
          </div>
          <div className={`${textInnerColor}`}>
            {selectSubObjectionsDisplay}
          </div>
        </div>

        <div className={`pt-4 pb-4 ${buttonBgcolor} mt-4 rounded-sm  text-left pl-2 pr-2`}>
          <div className='text-lg font-bold m-auto cursor-pointer' onClick={() => toggleCurrentViewDisplay(CURRENT_TOOLBAR_VIEW.SHOW_ANIMATE_DISPLAY)}>
            <div className='inline-flex ml-4 pl-4'>
              Animate
            </div>
            <FaChevronDown className='inline-flex float-right mr-4 mt-2 text-sm' />
          </div>
          <div className={`${textInnerColor}`}>
            {animateOptionsDisplay}
          </div>
        </div>
        <div className={`pt-4 pb-4 ${buttonBgcolor} mt-4 rounded-sm  text-left pl-2 pr-2`}>
          <div className='text-lg font-bold m-auto cursor-pointer' onClick={() => toggleCurrentViewDisplay(CURRENT_TOOLBAR_VIEW.SHOW_GENERATE_DISPLAY)}>
            <div className='inline-flex ml-4 pl-4'>
              Generate
            </div>
            <FaRobot className='inline-flex text-lg ml-1 mb-1 text-neutral-500' />
            <FaChevronDown className='inline-flex float-right mr-4 mt-2 text-sm' />
          </div>
          {generateDisplay}
        </div>
        <div className={`pt-4 pb-4 ${buttonBgcolor}  mt-4 rounded-sm  text-left pl-2 pr-2`}>
          <div className='text-lg font-bold m-auto cursor-pointer' onClick={() => toggleCurrentViewDisplay(CURRENT_TOOLBAR_VIEW.SHOW_EDIT_MASK_DISPLAY)}>
            <div className='inline-flex ml-4 pl-4'>
              Edit
            </div>
            <FaRobot className='inline-flex text-sm ml-1' />
            <FaChevronDown className='inline-flex float-right mr-4 mt-2 text-sm' />
          </div>
          {editDisplay}
        </div>
        <div className={`pt-4 pb-4 ${buttonBgcolor} mt-4 rounded-sm  text-left pl-2 pr-2`}>
          <div className='text-lg font-bold m-auto cursor-pointer' onClick={() => toggleCurrentViewDisplay(CURRENT_TOOLBAR_VIEW.SHOW_UPLOAD_DISPLAY)}>
            <div className='inline-flex ml-4 pl-4'>
              Upload/Library
            </div>
            <FaChevronDown className='inline-flex float-right mr-4 mt-2 text-sm' />
          </div>
          {uploadDisplay}
        </div>
        <div className={`pt-4 pb-4 ${buttonBgcolor}  mt-4 rounded-sm  text-left pl-2 pr-2`}>
          <div className='text-lg font-bold  m-auto cursor-pointer' onClick={() => toggleCurrentViewDisplay(CURRENT_TOOLBAR_VIEW.SHOW_ADD_TEXT_DISPLAY)}>
            <div className='inline-flex ml-4 pl-4'>
              Text
            </div>
            <FaChevronDown className='inline-flex float-right mr-4 mt-2 text-sm' />
          </div>
          {addTextDisplay}
        </div>
        <div className={`pt-4 pb-4 ${buttonBgcolor}  mt-4 rounded-sm  text-left `}>
          <div className='text-lg font-bold  m-auto cursor-pointer pl-2 pr-2' onClick={() => toggleCurrentViewDisplay(CURRENT_TOOLBAR_VIEW.SHOW_ADD_SHAPE_DISPLAY)}>
            <div className='inline-flex ml-4 pl-4'>
              Shape
            </div>
            <FaChevronDown className='inline-flex float-right mr-4 mt-2 text-sm' />
          </div>
          {addShapeDisplay}
        </div>
        <div className={`pt-4 pb-4 ${buttonBgcolor}  mt-4 rounded-sm  text-left pl-2 pr-2`}>
          <div className='text-lg font-bold m-auto cursor-pointer' onClick={() => toggleCurrentViewDisplay(CURRENT_TOOLBAR_VIEW.SHOW_LAYERS_DISPLAY)}>
            <div className='inline-flex ml-4 pl-4'>
              Layers
            </div>
            <FaChevronDown className='inline-flex float-right mr-4 mt-2 text-sm' />
          </div>
          {layersDisplay}
        </div>
      </div>
    </div>
  )
}
