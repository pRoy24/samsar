import React, { useState, useEffect } from 'react';
import CommonButton from '../../common/CommonButton.tsx';
import PromptGenerator from './PromptGenerator.tsx';
import OutpaintGenerator from './OutpaintGenerator.tsx';
import RangeSlider from '../utils/RangeSlider.js';
import AddText from './AddText.tsx';
import { FaChevronDown, FaRobot, } from 'react-icons/fa';
import AddShapeDisplay from '../utils/AddShapeDisplay.tsx';
import { useColorMode } from '../../../contexts/ColorMode.js';
import LayersDisplay from './LayersDisplay.tsx';
import { CURRENT_TOOLBAR_VIEW } from '../../../constants/Types.ts';

export default function EditorToolbar(props: any) {
  const { saveIntermediateImage,
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
  } = props;


  const [showGenerateDisplay, setShowGenerateDisplay] = useState(false);
  const [showAddTextDisplay, setShowAddTextDisplay] = useState(false);

  const [addText, setAddText] = useState('');
  const { colorMode } = useColorMode();

  const toggleShowgenerateDisplay = () => {
    setShowGenerateDisplay(!showGenerateDisplay);
  }

  const setNFTName = (value: string) => {
    let newNftData = Object.assign({}, nftData, { name: value });
    setNftData(newNftData);
  }

  const setNFTDescription = (value: string) => {
    let newNftData = Object.assign({}, nftData, { description: value });
    setNftData(newNftData);
  }
  const handleSelectChange = (event) => {

    console.log("Selected Chain ID:", event.target.value);
  };

  const setAdminAllocation = (value: string) => {
    let newNftData = Object.assign({}, nftData, { adminAllocation: value });
    setNftData(newNftData);
  }

  const submitAddText = () => {
    const payload = {
      type: 'text',
      text: addText,
      config: textConfig
    }
    addTextBoxToCanvas(payload);
  }

  let generateDisplay = <span />;
  if (currentViewDisplay === CURRENT_TOOLBAR_VIEW.SHOW_GENERATE_DISPLAY) {
    generateDisplay = (
      <PromptGenerator {...props} />
    )
  }

  let addTextDisplay = <span />;
  if (currentViewDisplay === CURRENT_TOOLBAR_VIEW.SHOW_ADD_TEXT_DISPLAY) {
    addTextDisplay = (
      <AddText setAddText={setAddText}
        submitAddText={submitAddText}
        textConfig={textConfig} setTextConfig={setTextConfig}

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
        <LayersDisplay activeItemList={activeItemList}
          setActiveItemList={setActiveItemList} />
      </div>
    )
  }

  let nftDataForm = <span />;
  if (sessionDetails && sessionDetails.attestationId) {
    let chainSelect = (
      <select onChange={handleSelectChange} >
        {chainList.map((chain) => {
          let isSelected = '';
          if (chain.id == selectedChain) {
            isSelected = 'selected';
          }
          return (
            <option key={chain.id} value={chain.id} selected={isSelected}>{chain.name}</option>
          )
        })}
      </select>
    )
    let adminAllocationSelect = (
      <input type='text' placeholder='Admin Allocation' className='mb-2'
        value={nftData.adminAllocation} defaultValue={300} onChange={(evt) => { setAdminAllocation(evt.target.value) }}
      />
    )
    nftDataForm = (
      <div>
        <input type='text' placeholder='NFT Name' className='mb-2' value={nftData.name}
          onChange={(evt) => (setNFTName(evt.target.value))} />
        <input type='text' placeholder='NFT Description' className='mb-2' value={nftData.description}
          onChange={(evt) => (setNFTDescription(evt.target.value))} />
        <div>
          <div>
            {chainSelect}
          </div>
          <div>
            {adminAllocationSelect}
          </div>
        </div>
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


  let addShapeDisplay = (
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


  let bgColor = "bg-cyber-black border-blue-900 text-white ";
  if (colorMode === 'light') {
    bgColor = "bg-neutral-50  text-neutral-900 ";
  }

  let buttonBgcolor = "bg-gray-900  text-white";
  if (colorMode === 'light') {
    buttonBgcolor = "bg-stone-200  text-neutral-900";
  }

  return (
    <div className={`border-l-2 ${bgColor} h-full m-auto fixed top-0 overflow-y-auto pl-2 r-4 w-[16%] pr-2`}>
      <div className='mt-[80px] '>

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
          <div className='text-lg font-bold  m-auto cursor-pointer pl-2 pr-2' onClick={() => toggleCurrentViewDisplay(CURRENT_TOOLBAR_VIEW.SHOW_ADD_TEXT_DISPLAY)}>
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
        <div className={`pt-4 pb-4 ${buttonBgcolor}  mt-4 rounded-sm  text-left pl-2 pr-2`}>

          <div className='text-lg font-bold m-auto cursor-pointer' onClick={showAttestationDialog}>
            <div className='inline-flex ml-4 pl-4'>
              Publish
            </div>
          </div>
        </div>

      </div>

    </div>
  )
}