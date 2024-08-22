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
import { CURRENT_EDITOR_VIEW, CURRENT_TOOLBAR_VIEW, TOOLBAR_ACTION_VIEW, SPEECH_SELECT_TYPES } from '../../../constants/Types.ts';
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
import { GrObjectUngroup } from "react-icons/gr";
import { SPEAKER_TYPES } from '../../../constants/Types.ts';
import TextareaAutosize from 'react-textarea-autosize';

export default function VideoEditorToolbar(props: any) {
  const {
    showAttestationDialog,
    sessionDetails,
    addTextBoxToCanvas,
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
    selectedId,
    exportAnimationFrames,
    setSelectedId,
    pencilWidth,
    setPencilWidth,
    pencilColor,
    setPencilColor,
    eraserWidth,
    setEraserWidth,
    pencilOptionsVisible,
    eraserOptionsVisible,
    cursorSelectOptionVisible,
    setCursorSelectOptionVisible,
    showUploadAction,
    currentCanvasAction,
    setCurrentCanvasAction,
    setSelectedLayerSelectShape,
    updateSessionLayerActiveItemList,
    updateSessionLayerActiveItemListAnimation,
    submitGenerateMusicRequest,
    audioLayers,
    audioGenerationPending,
    submitAddTrackToProject,
    combineCurrentLayerItems,
    showAddAudioToProjectDialog,
    submitUpdateSessionDefaults,
    hideItemInLayer,
    updateSessionLayerActiveItemListAnimations,
    applyAnimationToAllLayers,
    submitGenerateLayeredSpeechRequest
  } = props;

  
  const [selectedAnimationOption, setSelectedAnimationOption] = useState(null);
  const [animationParams, setAnimationParams] = useState({});
  const [addText, setAddText] = useState('');
  const [animateAllLayersSelected, setAnimateAllLayersSelected] = useState(false);
  const { colorMode } = useColorMode();
  const [addSubtitles, setAddSubtitles] = useState(true);
  const [currentSpeechSelectDisplay, setCurrentSpeechSelectDisplay] = useState(SPEECH_SELECT_TYPES.SPEECH_LAYER);

  const submitAddText = () => {
    const payload = {
      type: 'text',
      text: addText,
      config: textConfig
    };
    addTextBoxToCanvas(payload);
  };

  const handleAnimationChange = (selectedOption) => {
    setSelectedAnimationOption(selectedOption.value);
  };

  const submitApplyAnimationToLayer = (evt) => {
    evt.preventDefault();

    const formData = new FormData(evt.target);

    // Parse form values as floats
    let formValues = Object.fromEntries(formData.entries());
    for (let key in formValues) {
      if (!isNaN(formValues[key])) {
        formValues[key] = parseFloat(formValues[key]);
      }
    }

    const animationType = formValues.type;
    delete formValues.type;

    if (selectedId && !animateAllLayersSelected) {

      const newActiveItemList = activeItemList.map(item => {
        if (item.id === selectedId) {
          let animations = item.animations || [];
          const existingAnimationIndex = animations.findIndex(animation => animation.type === animationType);
          if (existingAnimationIndex !== -1) {
            animations[existingAnimationIndex] = {
              type: animationType,
              params: formValues
            };
          } else {
            animations.push({
              type: animationType,
              params: formValues
            });
          }
          return {
            ...item,
            animations: animations
          };
        }
        return item;
      });

      setActiveItemList(newActiveItemList);
      updateSessionLayerActiveItemListAnimations(newActiveItemList);
      exportAnimationFrames(newActiveItemList);

    } else {
      applyAnimationToAllLayers(formValues, animationType);
    }
  };

  const getAnimationBoundariesDisplay = (selectedOption) => {
    const selectedItem = activeItemList.find(item => item.id === selectedId);

    if ((!selectedItem || activeItemList.length === 0) && !animateAllLayersSelected) {
      return;
    }

    let animationParams = null;
    if (selectedItem) {
      animationParams = selectedItem.animations;
    }

    if (selectedOption === 'fade') {
      let startFade = 100;
      let endFade = 100;
      if (animationParams && animationParams.length > 0) {
        let fadeAnimationParams = animationParams.find(animation => animation.type === 'fade');
        if (fadeAnimationParams) {
          startFade = fadeAnimationParams.params.startFade;
          endFade = fadeAnimationParams.params.endFade;
        }
      }
      return (
        <div className='mt-2'>
          <form onSubmit={submitApplyAnimationToLayer} key="fadeForm">
            <div className='grid grid-cols-2 gap-2 m-auto text-center'>
              <div>
                <input type='text' placeholder='Start Fade'
                  name="startFade" defaultValue={startFade}
                  className={`w-full ${bgColor} ${text2Color} p-4`}
                />
                <div>Start Fade</div>
              </div>
              <div>
                <input type='text' placeholder='End Fade'
                  name="endFade" defaultValue={endFade}
                  className={`w-full ${bgColor} ${text2Color} p-4`} />
                <div>End Fade</div>
                <input type="hidden" name="type" value="fade" />
              </div>
            </div>
            <div className='m-auto text-center'>
              <SecondaryButton type="submit">Apply</SecondaryButton>
            </div>
          </form>
        </div>
      );
    } else if (selectedOption === 'slide') {

      let startX = 0;
      let startY = 0;
      let endX = 0;
      let endY = 0;

      if (selectedItem) {
        startX = selectedItem.x;
        startY = selectedItem.y;
        endX = selectedItem.x;
        endY = selectedItem.y;
      }

      if (animationParams) {
        let slideAnimationParams = animationParams.find(animation => animation.type === 'slide');
        if (slideAnimationParams) {
          startX = slideAnimationParams.params.startX;
          startY = slideAnimationParams.params.startY;
          endX = slideAnimationParams.params.endX;
          endY = slideAnimationParams.params.endY;
        }
      }

      return (
        <div className='mt-2'>
          <form onSubmit={submitApplyAnimationToLayer} key="slideForm">
            <div className='grid grid-cols-2 gap-2 m-auto text-center'>
              <div>
                <input type='text' name="startX" placeholder='Start X' defaultValue={startX}
                  className={`w-full ${bgColor} ${text2Color} p-4`} />
                <div>Start X</div>
              </div>
              <div>
                <input type='text' name="startY" placeholder='Start Y' defaultValue={startY}
                  className={`w-full ${bgColor} ${text2Color} p-4`} />
                <div>Start Y</div>
              </div>
              <div>
                <input type='text' placeholder='End X'
                  name="endX"
                  defaultValue={endX}
                  className={`w-full ${bgColor} ${text2Color} p-4`} />
                <div>End X</div>
              </div>
              <div>
                <input type='text' placeholder='End Y'
                  name='endY'
                  defaultValue={endY}
                  className={`w-full ${bgColor} ${text2Color} p-4`} />
                <div>End Y</div>
              </div>
            </div>
            <input type="hidden" name="type" value="slide" />
            <div className='m-auto text-center'>
              <SecondaryButton type="submit">Apply</SecondaryButton>
            </div>
          </form>
        </div>
      );
    } else if (selectedOption === 'zoom') {
      let startScale = 100;
      let endScale = 100;
      if (animationParams) {
        let zoomAnimationParams = animationParams.find(animation => animation.type === 'zoom');
        if (zoomAnimationParams) {
          startScale = zoomAnimationParams.params.startScale;
          endScale = zoomAnimationParams.params.endScale;
        }
      }
      return (
        <div className='mt-2'>
          <form onSubmit={submitApplyAnimationToLayer} key="zoomForm">
            <div className='grid grid-cols-2 gap-2 m-auto text-center'>
              <div>
                <input type='text' placeholder='Start Scale'
                  name="startScale"
                  className={`w-full ${bgColor} ${text2Color} p-4`}
                  defaultValue={startScale}
                />
                <div>Start Scale</div>
              </div>
              <div>
                <input type='text' placeholder='End Scale'
                  name="endScale"
                  className={`w-full ${bgColor} ${text2Color} p-4`}
                  defaultValue={endScale}
                />
                <div>End Scale</div>
              </div>
            </div>
            <input type="hidden" name="type" value="zoom" />
            <div className='m-auto text-center'>
              <SecondaryButton type="submit">Apply</SecondaryButton>
            </div>
          </form>
        </div>
      );
    } else if (selectedOption === 'rotate') {
      let startRotate = 0;

      if (animationParams) {
        const startRotateParams = animationParams.find(animation => animation.type === 'rotate');
        if (startRotateParams) {
          startRotate = startRotateParams.params.startRotate;
        }
      }
      return (
        <div className='mt-2'>
          <form onSubmit={submitApplyAnimationToLayer} key="rotateForm">
            <div className='grid grid-cols-2 gap-2 m-auto text-center'>
              <div>
                <input type='text' name="startRotate" defaultValue={startRotate}
                  placeholder='Rotations / second'
                  className={`w-full ${bgColor} ${text2Color} p-4`}
                />
                <div>Rotations/second</div>
              </div>
            </div>
            <input type="hidden" name="type" value="rotate" />
            <div className='m-auto text-center'>
              <SecondaryButton type="submit">Apply</SecondaryButton>
            </div>
          </form>
        </div>
      );
    }
  };

  let generateDisplay = <span />;
  if (currentViewDisplay === CURRENT_TOOLBAR_VIEW.SHOW_GENERATE_DISPLAY) {
    generateDisplay = <PromptGenerator {...props} />;
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
    );
  }

  let editDisplay = <span />;
  if (currentViewDisplay === CURRENT_TOOLBAR_VIEW.SHOW_EDIT_MASK_DISPLAY) {
    editDisplay = (
      <div>
        <RangeSlider editBrushWidth={editBrushWidth} setEditBrushWidth={setEditBrushWidth} />
        <OutpaintGenerator {...props} />
      </div>
    );
  }

  let layersDisplay = <span />;
  if (currentViewDisplay === CURRENT_TOOLBAR_VIEW.SHOW_LAYERS_DISPLAY) {
    layersDisplay = (
      <div>
        <LayersDisplay activeItemList={activeItemList} setActiveItemList={setActiveItemList}
          updateSessionLayerActiveItemList={updateSessionLayerActiveItemList}
          hideItemInLayer={hideItemInLayer}
          selectedId={selectedId}
          setSelectedId={setSelectedId}
        />
      </div>
    );
  }

  const toggleCurrentViewDisplay = (view: string) => {
    setCurrentCanvasAction(TOOLBAR_ACTION_VIEW.SHOW_DEFAULT_DISPLAY);
    if (view === currentViewDisplay) {
      setCurrentViewDisplay(CURRENT_TOOLBAR_VIEW.SHOW_DEFAULT_DISPLAY);
    } else {
      setCurrentViewDisplay(view);
    }
  };

  const showLibraryAction = () => {
    setCurrentCanvasAction(TOOLBAR_ACTION_VIEW.SHOW_LIBRARY_DISPLAY);
  };

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
    );
  }

  let uploadDisplay = <span />;
  if (currentViewDisplay === CURRENT_TOOLBAR_VIEW.SHOW_UPLOAD_DISPLAY) {
    uploadDisplay = (
      <div>
        <div className='m-auto text-center grid grid-cols-3'>
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
    );
  }

  let bgColor = "bg-cyber-black border-blue-900";
  if (colorMode === 'light') {
    bgColor = "bg-neutral-50 text-neutral-900";
  }

  let buttonBgcolor = "bg-gray-900 text-white";
  if (colorMode === 'light') {
    buttonBgcolor = "bg-stone-200 text-neutral-900";
  }

  let textInnerColor = colorMode === 'dark' ? 'text-neutral-900' : 'text-white';
  const text2Color = colorMode === 'dark' ? 'text-neutral-100' : 'text-neutral-900';

  // Styles for select and dropdowns
  let formSelectBgColor = colorMode === 'dark' ? '#030712' : '#f3f4f6';
  let formSelectTextColor = colorMode === 'dark' ? '#f3f4f6' : '#111827';
  let formSelectSelectedTextColor = colorMode === 'dark' ? '#f3f4f6' : '#111827';
  let formSelectHoverColor = colorMode === 'dark' ? '#1f2937' : '#2563EB';

  let animateOptionsDisplay = <span />;

  const animationOptions = [
    { value: 'fade', label: 'Fade' },
    { value: 'slide', label: 'Slide' },
    { value: 'zoom', label: 'Zoom' },
    { value: 'rotate', label: 'Rotate' }
  ];

  const setAnimateAllLayersSelectedFunc = () => {
    setAnimateAllLayersSelected(true);
  }

  if (currentViewDisplay === CURRENT_TOOLBAR_VIEW.SHOW_ANIMATE_DISPLAY) {
    let animationOptionMeta = <span />;
    if ((!selectedId || selectedId === -1) && !animateAllLayersSelected) {
      animateOptionsDisplay = (
        <div className={`${text2Color} pl-2`}>
          <div>
            <div className=' block mb-4 t-0 text-xs r-0 pr-2 align-right mt-2'>
              <SecondaryButton onClick={setAnimateAllLayersSelectedFunc}>
                Animate all layers
              </SecondaryButton>
            </div>
            <div className='block mt-4'>
              Please select a layer to animate.
            </div>
          </div>
        </div>
      );
    } else {
      if (selectedAnimationOption) {
        animationOptionMeta = getAnimationBoundariesDisplay(selectedAnimationOption);
      }
      animateOptionsDisplay = (
        <div>
          Select animation
          <div>
            <Select options={animationOptions} onChange={handleAnimationChange}
              styles={{
                menu: (provided) => ({
                  ...provided,
                  backgroundColor: formSelectBgColor,
                }),
                singleValue: (provided) => ({
                  ...provided,
                  color: formSelectTextColor,
                }),
                control: (provided, state) => ({
                  ...provided,
                  backgroundColor: formSelectBgColor,
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
                  backgroundColor: formSelectBgColor,
                  color: state.isSelected ? formSelectSelectedTextColor : formSelectTextColor,
                  '&:hover': {
                    backgroundColor: formSelectHoverColor
                  }
                })
              }}
            />
          </div>
          <div key={`${selectedId}_form_input`}>
            {animationOptionMeta}
          </div>
        </div>
      );
    }
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
    };

    submitGenerateMusicRequest(body);
  };

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

    if (currentSpeechSelectDisplay === SPEECH_SELECT_TYPES.SPEECH_PER_SCENE) {
      const promptList = promptText.split('\n').filter(prompt => prompt && prompt.trim().length > 0);
      const layeredSpeechBody = {
        generationType: 'speech',
        speaker: speaker,
        promptList: promptList,
        addSubtitles: addSubtitles
      }
      submitGenerateLayeredSpeechRequest(layeredSpeechBody);
      
    } else {
      submitGenerateMusicRequest(body);
    }
  };

  const showTemplateAction = () => {
    setCursorSelectOptionVisible(false);
    setCurrentViewDisplay(CURRENT_TOOLBAR_VIEW.SHOW_TEMPLATES_DISPLAY);
  };

  let bgSelectedColor = colorMode === 'dark' ? "bg-gray-800" : "bg-gray-200";
  let actionsOptionsDisplay = <span />;
  let actionsSubOptionsDisplay = <span />;

  if (currentViewDisplay === CURRENT_TOOLBAR_VIEW.SHOW_ACTIONS_DISPLAY) {
    if (currentCanvasAction === TOOLBAR_ACTION_VIEW.SHOW_PENCIL_DISPLAY) {
      actionsSubOptionsDisplay = (
        <div>
          <div className="static mt-2 rounded shadow-lg">
            <label className="block mb-2">Width:</label>
            <input type="range" min="1" max="50"
              className="w-full" value={pencilWidth} onChange={(e) => setPencilWidth(e.target.value)} />
            <label className="block mt-2 mb-2">Color:</label>
            <input type="color" value={pencilColor} onChange={(e) => setPencilColor(e.target.value)} />
          </div>
        </div>
      );
    } else if (currentCanvasAction === TOOLBAR_ACTION_VIEW.SHOW_ERASER_DISPLAY) {
      actionsSubOptionsDisplay = (
        <div>
          <div className="static mt-2 rounded shadow-lg ">
            <label className="block mb-2">Width:</label>
            <input type="range" min="1" max="100" className="w-full"
              value={eraserWidth} onChange={(e) => setEraserWidth(e.target.value)} />
          </div>
        </div>
      );
    }

    actionsOptionsDisplay = (
      <div className={`grid grid-cols-3 ${text2Color} h-auto`}>
        <div className={`text-center m-auto align-center p-1 h-[50px] rounded-sm ${pencilOptionsVisible ? bgSelectedColor : bgColor}`}>
          <div onClick={() => setCurrentCanvasAction(TOOLBAR_ACTION_VIEW.SHOW_PENCIL_DISPLAY)}>
            <FaPencilAlt className="text-2xl m-auto cursor-pointer" />
            <div className="text-[10px] tracking-tight m-auto text-center">
              Pencil
            </div>
          </div>

          {pencilOptionsVisible && (
            <div className="static mt-2 rounded shadow-lg">
              <label className="block mb-2">Width:</label>
              <input type="range" min="1" max="50"
                className="w-full" value={pencilWidth} onChange={(e) => setPencilWidth(e.target.value)} />
              <label className="block mt-2 mb-2">Color:</label>
              <input type="color" value={pencilColor} onChange={(e) => setPencilColor(e.target.value)} />
            </div>
          )}
        </div>

        <div className={`text-center m-auto align-center p-1 h-[50px] rounded-sm ${eraserOptionsVisible ? bgSelectedColor : bgColor}`}>
          <div onClick={() => setCurrentCanvasAction(TOOLBAR_ACTION_VIEW.SHOW_ERASER_DISPLAY)}>
            <FaEraser className="text-2xl m-auto cursor-pointer" />
            <div className="text-[10px] tracking-tight m-auto text-center">
              Eraser
            </div>
          </div>

          {eraserOptionsVisible && (
            <div className="static mt-2 rounded shadow-lg ">
              <label className="block mb-2">Width:</label>
              <input type="range" min="1" max="100" className="w-full"
                value={eraserWidth} onChange={(e) => setEraserWidth(e.target.value)} />
            </div>
          )}
        </div>

        <div className={`text-center m-auto align-center p-1 h-[50px] rounded-sm ${cursorSelectOptionVisible ? bgSelectedColor : bgColor}`} onClick={() => setCursorSelectOptionVisible(!cursorSelectOptionVisible)}>
          <div onClick={() => combineCurrentLayerItems()}>
            <LuCombine className="text-2xl m-auto cursor-pointer" />
            <div className="text-[10px] tracking-tight m-auto text-center">
              Combine
            </div>
          </div>

          {eraserOptionsVisible && (
            <div className="static mt-2 rounded shadow-lg ">
              <label className="block mb-2">Width:</label>
              <input type="range" min="1" max="100" className="w-full"
                value={eraserWidth} onChange={(e) => setEraserWidth(e.target.value)} />
            </div>
          )}
        </div>
      </div>
    );
  }

  let selectOptionsDisplay = <span />;
  if (currentViewDisplay === CURRENT_TOOLBAR_VIEW.SHOW_SELECT_DISPLAY) {
    selectOptionsDisplay = (
      <div className={`grid grid-cols-3 ${text2Color} h-auto`}>
        <div>
          <div className={`text-center m-auto align-center p-1 h-[50px] rounded-sm ${cursorSelectOptionVisible ? bgSelectedColor : bgColor}`}
            onClick={() => setCurrentCanvasAction(TOOLBAR_ACTION_VIEW.SHOW_SELECT_LAYER_DISPLAY)}>
            <FaCrosshairs className="text-2xl m-auto cursor-pointer" />
            <div className="text-[10px] tracking-tight m-auto text-center">
              Select Layer
            </div>
          </div>
        </div>
        <div className={`text-center m-auto align-center p-1 h-[50px] rounded-sm `}
          onClick={() => setCurrentCanvasAction(TOOLBAR_ACTION_VIEW.SHOW_SELECT_SHAPE_DISPLAY)} >
          <PiSelectionAll className="text-2xl m-auto cursor-pointer" />
          <div className="text-[10px] tracking-tight m-auto text-center">
            Select Shape
          </div>
        </div>
        {/* <div className={`text-center m-auto align-center p-1 h-[50px] rounded-sm `}
          onClick={() => setCurrentCanvasAction(TOOLBAR_ACTION_VIEW.SHOW_SMART_SELECT_DISPLAY)} >
          <GrObjectUngroup className="text-2xl m-auto cursor-pointer" />
          <div className="text-[10px] tracking-tight m-auto text-center">
            Smart Select
          </div>
        </div> */}
      </div>
    );
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
    );
  }

  const handleAddSingleSpeechLayer = () => {
    setCurrentSpeechSelectDisplay(SPEECH_SELECT_TYPES.SPEECH_LAYER);
    console.log('Add Single Speech Layer');
  };

  const handleAddSpeechPerScene = () => {
    setCurrentSpeechSelectDisplay(SPEECH_SELECT_TYPES.SPEECH_PER_SCENE);
    console.log('Add Speech Per Scene');
  };


  let audioOptionsDisplay = <span />;
  let audioSubOptionsDisplay = <span />;
  if (currentViewDisplay === CURRENT_TOOLBAR_VIEW.SHOW_AUDIO_DISPLAY) {
    audioOptionsDisplay = (
      <div className={`grid grid-cols-2 ${text2Color} h-auto`}>
        <div
          onClick={() => { setCurrentCanvasAction(TOOLBAR_ACTION_VIEW.SHOW_SPEECH_GENERATE_DISPLAY) }}
          className='cursor-pointer flex flex-col items-center justify-center'>
          <RiSpeakLine />
          <div className="text-xs">Speech</div>
        </div>
        <div
          onClick={() => (setCurrentCanvasAction(TOOLBAR_ACTION_VIEW.SHOW_MUSIC_GENERATE_DISPLAY))}
          className='cursor-pointer flex flex-col items-center justify-center'>
          <FaMusic />
          <div className="text-xs">Music</div>
        </div>
      </div>
    );

    if (currentCanvasAction === TOOLBAR_ACTION_VIEW.SHOW_MUSIC_GENERATE_DISPLAY) {
      audioSubOptionsDisplay = (
        <div>
          <form name="audioGenerateForm" className="w-full" onSubmit={submitGenerateMusic}>
            <textarea className={`w-full h-20 ${bgColor} ${text2Color} p-1`}
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
      );
    }
    if (currentCanvasAction === TOOLBAR_ACTION_VIEW.SHOW_SPEECH_GENERATE_DISPLAY) {
      const speakerOptions = SPEAKER_TYPES.map(speaker => ({
        value: speaker,
        label: speaker
      }));

      audioSubOptionsDisplay = (
        <div>
          <div className="mb-4">
            <div className="flex space-x-2">
              <SecondaryButton onClick={handleAddSingleSpeechLayer} className="px-4 py-2 bg-blue-500 text-white rounded">
                Speech Layer
              </SecondaryButton>
              <SecondaryButton onClick={handleAddSpeechPerScene} className="px-4 py-2 bg-blue-500 text-white rounded">
                Speech Per Scene
              </SecondaryButton>
            </div>
          </div>
          <form name="audioGenerateForm" className="w-full" onSubmit={submitGenerateSpeech}>
            <textarea className={`w-full h-20 ${bgColor} ${text2Color}`}
              name="promptText" placeholder="Enter prompt text here" />
            <div className='flex flex-row'>
              <div className='basis-1/2'>
                <Select name="speakerOptions" options={speakerOptions}
                  styles={{
                    menu: (provided) => ({
                      ...provided,
                      backgroundColor: formSelectBgColor,
                    }),
                    singleValue: (provided) => ({
                      ...provided,
                      color: formSelectTextColor,
                    }),
                    control: (provided, state) => ({
                      ...provided,
                      backgroundColor: formSelectBgColor,
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
                      backgroundColor: formSelectBgColor,
                      color: state.isSelected ? formSelectSelectedTextColor : formSelectTextColor,
                      '&:hover': {
                        backgroundColor: formSelectHoverColor
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
            {currentSpeechSelectDisplay === SPEECH_SELECT_TYPES.SPEECH_PER_SCENE && (
              <div className="flex items-center mt-2">
                <input
                  type="checkbox"
                  checked={addSubtitles}
                  onChange={(e) => setAddSubtitles(e.target.checked)}
                  className="mr-2"
                />
                <label className="text-xs">Add subtitles text</label>
              </div>
            )}
          </form>
        </div>
      );
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
    const { defaultSceneDuration, imageGenerationTheme } = sessionDetails;
    defaultsOptionDisplay = (
      <div>
        <form onSubmit={submitUpdateSessionDefaults}>
          <TextareaAutosize
            placeholder="Project theme"
            name="imageGenerationTheme"
            minRows={3}
            className={`w-full mt-2 ${bgColor} ${text2Color} p-2`}
            defaultValue={imageGenerationTheme}
          />
          <div className={`text-xs ${text2Color} mb-2 ml-2`}>
            Theme keywords
          </div>
          <input
            type="text"
            placeholder="Scene duration"
            name="defaultSceneDuration"
            className={`w-full mt-2 ${bgColor} ${text2Color} p-1 h-[30px]`}
            defaultValue={defaultSceneDuration}
          />
          <div className={`text-xs ${text2Color} mb-2 ml-2`}>
            Default scene duration
          </div>
          <div className="ml-2">
            <SecondaryButton type="submit">Save</SecondaryButton>
          </div>
        </form>
      </div>
    );
  }
  

  return (
    <div className={`border-l-2 ${bgColor} h-full m-auto fixed top-0 overflow-y-auto pl-2 r-4 w-[16%] pr-2`}>
      <div className='mt-[80px]'>
        <div className={`pt-2 pb-2 ${buttonBgcolor} mt-4 rounded-sm text-left pl-2 pr-2`}>
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
        <div className={`pt-2 pb-2 ${buttonBgcolor} mt-4 rounded-sm text-left pl-2 pr-2`}>
          <div className='text-lg font-bold m-auto cursor-pointer' onClick={() => toggleCurrentViewDisplay(CURRENT_TOOLBAR_VIEW.SHOW_GENERATE_DISPLAY)}>
            <div className='inline-flex ml-4 pl-4'>
              Generate Image
            </div>
            <FaChevronDown className='inline-flex float-right mr-4 mt-2 text-sm' />
          </div>
          {generateDisplay}
        </div>
        <div className={`pt-2 pb-2 ${buttonBgcolor} mt-4 rounded-sm text-left pl-2 pr-2`}>
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
        <div className={`pt-2 pb-2 ${buttonBgcolor} mt-4 rounded-sm text-left pl-2 pr-2`}>
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
        <div className={`pt-2 pb-2 ${buttonBgcolor} mt-4 rounded-sm text-left pl-2 pr-2`}>
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
        <div className={`pt-2 pb-2 ${buttonBgcolor} mt-4 rounded-sm text-left pl-2 pr-2`}>
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
        <div className={`pt-2 pb-2 ${buttonBgcolor} mt-4 rounded-sm text-left pl-2 pr-2`}>
          <div className='text-lg font-bold m-auto cursor-pointer' onClick={() => toggleCurrentViewDisplay(CURRENT_TOOLBAR_VIEW.SHOW_EDIT_MASK_DISPLAY)}>
            <div className='inline-flex ml-4 pl-4'>
              Edit Image
            </div>
            <FaRobot className='inline-flex text-sm ml-1' />
            <FaChevronDown className='inline-flex float-right mr-4 mt-2 text-sm' />
          </div>
          {editDisplay}
        </div>
        <div className={`pt-2 pb-2 ${buttonBgcolor} mt-4 rounded-sm text-left pl-2 pr-2`}>
          <div className='text-lg font-bold m-auto cursor-pointer' onClick={() => toggleCurrentViewDisplay(CURRENT_TOOLBAR_VIEW.SHOW_UPLOAD_DISPLAY)}>
            <div className='inline-flex ml-4 pl-4'>
              Upload/Library
            </div>
            <FaChevronDown className='inline-flex float-right mr-4 mt-2 text-sm' />
          </div>
          {uploadDisplay}
        </div>
        <div className={`pt-2 pb-2 ${buttonBgcolor} mt-4 rounded-sm text-left`}>
          <div className='text-lg font-bold m-auto cursor-pointer' onClick={() => toggleCurrentViewDisplay(CURRENT_TOOLBAR_VIEW.SHOW_ADD_TEXT_DISPLAY)}>
            <div className='inline-flex ml-4 pl-4'>
              Text
            </div>
            <FaChevronDown className='inline-flex float-right mr-4 mt-2 text-sm' />
          </div>
          {addTextDisplay}
        </div>
        <div className={`pt-2 pb-2 ${buttonBgcolor} mt-4 rounded-sm text-left`}>
          <div className='text-lg font-bold m-auto cursor-pointer' onClick={() => toggleCurrentViewDisplay(CURRENT_TOOLBAR_VIEW.SHOW_ADD_SHAPE_DISPLAY)}>
            <div className='inline-flex ml-4 pl-4'>
              Shape
            </div>
            <FaChevronDown className='inline-flex float-right mr-4 mt-2 text-sm' />
          </div>
          {addShapeDisplay}
        </div>
        <div className={`pt-2 pb-2 mb-32 ${buttonBgcolor} mt-4 rounded-sm text-left`}>
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
  );
}
