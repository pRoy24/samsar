import React, { useEffect, useState, useRef, useCallback } from 'react';
import axios from 'axios';
import { useParams } from 'react-router-dom';
import Konva from 'konva';
import { Stage, Layer, Rect, Text } from 'react-konva';
import { useUser } from '../../contexts/UserContext.js';
import { useAlertDialog } from '../../contexts/AlertDialogContext.js';
import { useColorMode } from '../../contexts/ColorMode.js';
import { getHeaders } from '../../utils/web.js';
import { CURRENT_TOOLBAR_VIEW, CANVAS_ACTION } from '../../constants/Types.ts';
import { STAGE_DIMENSIONS } from '../../constants/Image.js';
import SMSCanvas from './SMSCanvas.tsx';
import EditorToolbar from './toolbar/EditorToolbar.tsx';
import SelectTemplate from './SelectTemplate.tsx';
import AttestationDialog from './utils/AttestationDialog.tsx';
import PublishDialog from './utils/PublishDialog.tsx';
import CommonContainer from '../common/CommonContainer.tsx';
import ActionToolbar from './toolbar/ActionToolbar.tsx';
import UploadImageDialog from './utils/UploadImageDialog.js';

import './editor.css';

const PUBLISHER_URL = process.env.REACT_APP_PUBLISHER_URL;
const PROCESSOR_API_URL = process.env.REACT_APP_PROCESSOR_API;
const IPFS_URL_BASE = process.env.REACT_APP_IPFS_URL_BASE;

export default function EditorHome(props) {
  let { id } = useParams();

  const resetSession = () => {
    if (props.resetCurrentSession) {
      props.resetCurrentSession();
    }
  }

  if (!id) {
    id = props.id;
  }

  const [promptText, setPromptText] = useState("");
  const [selectedChain, setSelectedChain] = useState('');
  const [selectedAllocation, setSelectedAllocation] = useState(300);
  const [isTemplateSelectViewSelected, setIsTemplateSelectViewSelected] = useState(false);
  const [templateOptionList, setTemplateOptionList] = useState([]);
  const [activeItemList, setActiveItemList] = useState([]);

  const [editBrushWidth, setEditBrushWidth] = useState(25);
  const [editMasklines, setEditMaskLines] = useState([]);

  const [currentView, setCurrentView] = useState(CURRENT_TOOLBAR_VIEW.SHOW_DEFAULT_DISPLAY);
  const [selectedGenerationModel, setSelectedGenerationModel] = useState('DALLE3');
  const [selectedEditModel, setSelectedEditModel] = useState('DALLE2');
  const [isGenerationPending, setIsGenerationPending] = useState(false);
  const [isOutpaintPending, setIsOutpaintPending] = useState(false);
  const [isPublicationPending, setIsPublicationPending] = useState(false);

  const [currentCanvasAction, setCurrentCanvasAction] = useState(CANVAS_ACTION.DEFAULT);
  const [currentPage, setCurrentPage] = useState(1);

  const { colorMode } = useColorMode();
  const initialBackgroundFillColor = colorMode === 'dark' ? '#030712' : '#f5f5f5';
  const initFillColor = colorMode === 'dark' ? '#f5f5f5' : '#030712';
  const initTextFillColor = colorMode === 'dark' ? '#000000' : '#ffffff';

  const [fillColor, setFillColor] = useState(initFillColor);
  const [strokeColor, setStrokeColor] = useState(initFillColor);
  const [strokeWidthValue, setStrokeWidthValue] = useState(2);
  const [buttonPositions, setButtonPositions] = useState([]);

  const [selectedId, setSelectedId] = useState<any>(null);
  const [selectedLayerType, setSelectedLayerType] = useState<any>(null);


  const [pencilWidth, setPencilWidth] = useState(10);
  const [pencilColor, setPencilColor] = useState('#000000');
  const [eraserWidth, setEraserWidth] = useState(30);
  const [pencilOptionsVisible, setPencilOptionsVisible] = useState(false);
  const [eraserOptionsVisible, setEraserOptionsVisible] = useState(false);
  const [cursorSelectOptionVisible, setCursorSelectOptionVisible] = useState(false);

  const [ generationError, setGenerationError ] = useState(null);
  const [ outpaintError, setOutpaintError ] = useState(null);

  const [textConfig, setTextConfig] = useState({
    fontSize: 40,
    fontFamily: 'Times New Roman',
    fillColor: initTextFillColor
  });

  const setCurrentViewDisplay = (view) => {
    setCurrentView(view);
  }

  const [nftData, setNftData] = useState({
    name: "",
    description: "",
    external_url: "",
    image: "",
    attributes: []
  });

  const { openAlertDialog, closeAlertDialog, setIsAlertActionPending } = useAlertDialog();
  const { user } = useUser();

  const [sessionDetails, setSessionDetails] = useState({});
  const [showMask, setShowMask] = useState(false);

  const canvasRef = useRef(null);
  const maskGroupRef = useRef(null);

  useEffect(() => {
    setIsAlertActionPending(isPublicationPending);
  }, [isPublicationPending]);

  useEffect(() => {
    if (!id) {
      return;
    }
    axios.get(`${PROCESSOR_API_URL}/sessions/details?id=${id}`).then((response) => {
      const activeSelectedImageName = response.data.activeSelectedImage;
      if (activeSelectedImageName) {
        const activeSelectedImageURL = `${PROCESSOR_API_URL}/intermediates/${activeSelectedImageName}`;
        const nImageList: any = Object.assign([], activeItemList);
        nImageList.push({ src: activeSelectedImageURL, id: `item_${nImageList.length}`, type: 'image' });

        setActiveItemList(nImageList);
      } else {
        const nImageList: any = Object.assign([], activeItemList);
        if (nImageList.length === 0) {
          nImageList.push({
            id: `item_${nImageList.length}`,
            type: 'shape',
            shape: 'rectangle',
            config: {
              x: 0, y: 0, width: STAGE_DIMENSIONS.width, height: STAGE_DIMENSIONS.height,
              fill: initialBackgroundFillColor, stroke: initialBackgroundFillColor, strokeWidth: strokeWidthValue,
              fixed: true,
            }
          });
          setActiveItemList(nImageList);
        }
      }
      setSessionDetails(response.data);
    }).catch((error) => {
      console.error(error);
    });
  }, []);

  useEffect(() => {
    if (!id) {
      return;
    }
    axios.get(`${PROCESSOR_API_URL}/sessions/details?id=${id}`).then((response) => {
      const activeSelectedImageName = response.data.activeSelectedImage;
      if (activeSelectedImageName) {
        const activeSelectedImageURL = `${PROCESSOR_API_URL}/intermediates/${activeSelectedImageName}`;
        const nImageList: any = Object.assign([], activeItemList);
        nImageList.push({ src: activeSelectedImageURL, id: `item_${nImageList.length}`, type: 'image' });

        setActiveItemList(nImageList);
      } else {
        const nImageList: any = Object.assign([], activeItemList);
        if (nImageList.length === 0) {
          nImageList.push({
            id: `item_${nImageList.length}`,
            type: 'shape',
            shape: 'rectangle',
            config: {
              x: 0, y: 0, width: STAGE_DIMENSIONS.width, height: STAGE_DIMENSIONS.height,
              fill: initialBackgroundFillColor, stroke: initialBackgroundFillColor, strokeWidth: strokeWidthValue,
              fixed: true,
            }
          });
          setActiveItemList(nImageList);
        }
      }
      setSessionDetails(response.data);
    }).catch((error) => {
      console.error(error);
    });
  }, [id]);

  useEffect(() => {
    if (currentView !== CURRENT_TOOLBAR_VIEW.SHOW_EDIT_MASK_DISPLAY) {
      setEditMaskLines([]);
    }
    setSelectedId(null); // test
  }, [currentView]);

  const setUploadURL = useCallback((data) => {
    if (!data) {
      return;
    }
    setActiveItemList(prevItems => {
      const newId = `item_${prevItems.length}`;  // Create a new ID based on the length of the previous items
      const newItem = {
        src: data.url,
        id: newId,
        type: 'image'  // Assuming the type is always 'image'
      };
  
      return [...prevItems, newItem];  // Return the new array with the added item
    });

    closeAlertDialog();
  }, [activeItemList, activeItemList.length]);

  const resetCurrentView = () => {
    setCurrentView(CURRENT_TOOLBAR_VIEW.SHOW_DEFAULT_DISPLAY);
  }

  const prevLengthRef = useRef(activeItemList.length);
  const [isIntermediateSaving, setIsIntermediateSaving] = useState(false);

  useEffect(() => {
    // Get the current length of activeItemList
    const currentLength = activeItemList.length;

    // Check if previous length is not equal to current length
    if (prevLengthRef.current !== currentLength) {
      if (!isIntermediateSaving) {
        setIsIntermediateSaving(true);
        saveIntermediateImage();
      }
    }

    // Update the ref with the new length for the next render
    prevLengthRef.current = currentLength;
  }, [activeItemList.length]);

  useEffect(() => {
    if (user && id) {
      axios.post(`${PROCESSOR_API_URL}/sessions/get_session`, {
        userId: user._id.toString(),
        sessionId: id
      }).then((response) => {

        
      }).catch((error) => {
        console.error(error);
      });
    }
  }, [user, id]);

  const updateNFTData = (value) => {
    let newNftData = Object.assign({}, nftData, value);
    setNftData(newNftData);
  }

  const submitGenerateRequest = async () => {
    const payload = {
      prompt: promptText,
      sessionId: id,
      model: selectedGenerationModel,
    }
    setGenerationError(null);

    const generateStatus = await axios.post(`${PROCESSOR_API_URL}/sessions/request_generate`, payload);
    startGenerationPoll();
  }

  const submitOutpaintRequest = async (evt) => {
    evt.preventDefault();

    const baseImageData = await exportBaseGroup();
    let maskImageData;
    if (selectedEditModel === 'SDXL') {
      maskImageData = await exportMaskGroupAsColored();
    } else {
      maskImageData = await exportMaskGroupAsTransparent();
    }

    const formData = new FormData(evt.target);
    const promptText = formData.get('promptText');
    const guidanceScale = formData.get('guidanceScale');
    const numInferenceSteps = formData.get('numInferenceSteps');
    const strength = formData.get('strength');

    const payload = {
      image: baseImageData,
      maskImage: maskImageData,
      sessionId: id,
      prompt: promptText,
      model: selectedEditModel,
      guidanceScale: guidanceScale,
      numInferenceSteps: numInferenceSteps,
      strength: strength
    }
    setOutpaintError(null);

    const outpaintStatus = await axios.post(`${PROCESSOR_API_URL}/sessions/request_outpaint`, payload);
    startOutpaintPoll();
  }

  const exportBaseGroup = () => {
    const baseStage: any = canvasRef.current;
    const baseLayer = baseStage.getLayers()[0];
    const baseGroup = baseLayer.children.find((child) => child.attrs && child.attrs.id === 'baseGroup');

    // Ensure the group is found
    if (baseGroup) {
      const dataUrl = baseGroup.toDataURL({
        width: STAGE_DIMENSIONS.width,
        height: STAGE_DIMENSIONS.height,
        pixelRatio: 1 // Ensures that the output resolution is not scaled; adjust as needed for high DPI displays
      });
      return dataUrl;
    } else {
      console.error('Base group not found');
      return null;
    }
  };

  const exportMaskGroupAsColored = async () => {
    const baseStage = canvasRef.current;
    const baseLayer = baseStage.getLayers()[0];
    const maskGroup = baseLayer.children.find((child) => child.attrs && child.attrs.id === 'maskGroup');

    if (maskGroup) {
      // Create an offscreen canvas
      const offscreenCanvas = document.createElement('canvas');
      offscreenCanvas.width = baseStage.width();
      offscreenCanvas.height = baseStage.height();
      const ctx = offscreenCanvas.getContext('2d');

      // Initially fill the canvas with black
      ctx.fillStyle = 'black';
      ctx.fillRect(0, 0, offscreenCanvas.width, offscreenCanvas.height);

      // Set the fill style for the mask to white
      ctx.fillStyle = 'white';

      // Draw each mask shape in white
      maskGroup.children.forEach(line => {
        ctx.beginPath();
        ctx.moveTo(line.points()[0], line.points()[1]);
        for (let i = 2; i < line.points().length; i += 2) {
          ctx.lineTo(line.points()[i], line.points()[i + 1]);
        }
        ctx.closePath();  // Ensures the shape is closed for filling
        ctx.fill();
      });

      // Convert offscreen canvas to data URL
      const dataUrl = offscreenCanvas.toDataURL('image/png', 1); // Ensure full quality
      return dataUrl;
    } else {
      console.error('Mask group not found');
      return null;
    }
  };

  const exportMaskGroupAsTransparent = async () => {
    const baseStage: any = canvasRef.current;
    const baseLayer = baseStage.getLayers()[0];
    const maskGroup = baseLayer.children.find((child) => child.attrs && child.attrs.id === 'maskGroup');

    if (maskGroup) {
      // Create an offscreen canvas
      const offscreenCanvas = document.createElement('canvas');
      offscreenCanvas.width = baseStage.width();
      offscreenCanvas.height = baseStage.height();
      const ctx = offscreenCanvas.getContext('2d');

      // Fill canvas with white
      ctx.fillStyle = 'white';
      ctx.fillRect(0, 0, offscreenCanvas.width, offscreenCanvas.height);

      // Use destination-out to make lines transparent
      ctx.globalCompositeOperation = 'destination-out';

      // Draw each line in the maskGroup onto the offscreen canvas
      maskGroup.children.forEach(line => {
        ctx.beginPath();
        ctx.moveTo(line.points()[0], line.points()[1]);
        for (let i = 2; i < line.points().length; i += 2) {
          ctx.lineTo(line.points()[i], line.points()[i + 1]);
        }
        ctx.strokeStyle = 'rgba(0,0,0,1)';  // Fully opaque black
        ctx.lineWidth = line.strokeWidth();
        ctx.stroke();
      });

      // Reset globalCompositeOperation to default
      ctx.globalCompositeOperation = 'source-over';

      // Convert offscreen canvas to data URL
      const dataUrl = offscreenCanvas.toDataURL();
      return dataUrl;
    } else {
      console.error('Mask group not found');
      return null;
    }
  };

  async function startGenerationPoll() {
    setIsGenerationPending(true);
    const pollStatusData = await axios.get(`${PROCESSOR_API_URL}/sessions/generate_status?id=${id}`);

    const pollStatus = pollStatusData.data;

    if (pollStatus.generationStatus === 'COMPLETED') {
      const generatedImageUrlName = pollStatus.activeGeneratedImage;
      const generatedURL = `${PROCESSOR_API_URL}/generations/${generatedImageUrlName}`;
      const nImageList: any = Object.assign([], activeItemList);
      nImageList.push({ src: generatedURL, id: `item_${nImageList.length}`, type: 'image' });

      setActiveItemList(nImageList);
      setSessionDetails(pollStatus);
      setIsGenerationPending(false);
      setCurrentView(CURRENT_TOOLBAR_VIEW.SHOW_DEFAULT_DISPLAY);
      return;
    } else if (pollStatus.generationStatus === 'FAILED' ) {
      setIsGenerationPending(false);
      setGenerationError(pollStatus.generationError);
      return;
    } else {
      setTimeout(() => {
        startGenerationPoll();
      }, 1000);
    }
  }

  async function startOutpaintPoll() {
    setIsOutpaintPending(true);

    const pollStatusData = await axios.get(`${PROCESSOR_API_URL}/sessions/generate_status?id=${id}`);

    const pollStatus = pollStatusData.data;
    if (pollStatus.outpaintStatus === 'COMPLETED') {
      const generatedImageUrlName = pollStatus.activeOutpaintedImage;
      const generatedURL = `${PROCESSOR_API_URL}/generations/${generatedImageUrlName}`;

      const nImageList: any = Object.assign([], activeItemList);
      nImageList.push({ src: generatedURL, id: `item_${nImageList.length}`, type: 'image' });

      setCurrentView(CURRENT_TOOLBAR_VIEW.SHOW_DEFAULT_DISPLAY);

      setActiveItemList(nImageList);
      setSessionDetails(pollStatus);
      setIsOutpaintPending(false);
      return;
    } else if (pollStatus.outpaintStatus === 'FAILED' ) {
      setIsOutpaintPending(false);
      setOutpaintError(pollStatus.outpaintError);
      return;
    }  else {
      setTimeout(() => {
        startOutpaintPoll();
      }, 1000);
    }
  }

  const showTemplatesSelect = () => {
    setIsTemplateSelectViewSelected(!isTemplateSelectViewSelected);
  }

  const onPublishDialog = (formData) => {
    setIsPublicationPending(true);

    const nftData = {
      name: formData.get('nftName'),
      description: formData.get("nftDescription"),
      attributes: []
    }

    const creatorAllocation = formData.get("creatorAllocation");
    const selectedChain = process.env.REACT_APP_SELECTED_CHAIN;

    if (canvasRef.current) {
      const originalStage = canvasRef.current.getStage();
      const clonedStage = originalStage.clone();
      clonedStage.find('Transformer').forEach(transformer => {
        transformer.destroy();
      });
      clonedStage.draw();

      const dataURL = clonedStage.toDataURL();

      let sessionPayload: any = {
        image: dataURL,
        sessionId: id
      }
      if (nftData) {
        sessionPayload = Object.assign(sessionPayload, { nft: nftData });
      }
      const headers = getHeaders();
      sessionPayload.selectedChain = parseInt(selectedChain);
      sessionPayload.creatorAllocation = creatorAllocation;
      sessionPayload.creatorHandle = user.username;

      axios.post(`${PROCESSOR_API_URL}/sessions/publish_and_set_uri`, sessionPayload, headers).then(function (dataResponse) {
        const publicationResponse = dataResponse.data;
        const publicationId = publicationResponse.slug;
        setIsPublicationPending(false);
        resetSession();

        window.location.href = `${PUBLISHER_URL}/p/${publicationId}`;

      }).catch(function (err) {
        console.error(err);
        setIsPublicationPending(false);
      });
    }
  }

  const showAttestationDialog = () => {
    const publishDialog = <PublishDialog onSubmit={onPublishDialog}
      selectedChain={selectedChain}
      setSelectedChain={setSelectedChain}
      isPublicationPending={isPublicationPending}
    />
    openAlertDialog(publishDialog);
  }

  const getRemoteTemplateData = (page) => {
    axios.get(`${PROCESSOR_API_URL}/utils/template_list?page=${page}`).then((response) => {
      const generatedImageUrlName = response.data.activeGeneratedImage;
      setTemplateOptionList(response.data);
    });
  }

  const submitTemplateSearch = (query) => {
    axios.get(`${PROCESSOR_API_URL}/utils/search_template?query=${query}`).then((response) => {
      setTemplateOptionList(response.data);
    });
  }

  const saveIntermediateImage = () => {
    if (canvasRef.current) {
      const originalStage = canvasRef.current.getStage();
      const clonedStage = originalStage.clone();
      clonedStage.find('Transformer').forEach(transformer => {
        transformer.destroy();
      });
      clonedStage.draw();

      const dataURL = clonedStage.toDataURL();
      const headers = getHeaders();
      const sessionPayload = {
        image: dataURL,
        sessionId: id
      };

      axios.post(`${PROCESSOR_API_URL}/sessions/save_intermediate`, sessionPayload, headers)
        .then(function (dataResponse) {
          setIsIntermediateSaving(false);
        });
    }
  };

  const addImageToCanvas = (templateOption) => {
    const templateURL = `${PROCESSOR_API_URL}/templates/mm_final/${templateOption}`;
    const nImageList: any = Object.assign([], activeItemList);
    nImageList.push({ src: templateURL, id: `item_${nImageList.length}`, type: 'image' });
    setActiveItemList(nImageList);
    setCurrentView(CURRENT_TOOLBAR_VIEW.SHOW_DEFAULT_DISPLAY);
  }

  const addTextBoxToCanvas = (payload) => {
    const nImageList: any = Object.assign([], activeItemList);
    const currentItemId = `item_${nImageList.length}`;
    payload.id = currentItemId;
    nImageList.push(payload);
    setActiveItemList(nImageList);
  }

  const setCurrentAction = (currentAction) => {
    setCurrentCanvasAction(currentAction);
  }

  const showMoveAction = () => {

  }

  const showResizeAction = () => {

  }

  const showSaveAction = () => {
    saveIntermediateImage();
  }

  const showUploadAction = () => {
    setCurrentView(CURRENT_TOOLBAR_VIEW.SHOW_DEFAULT_DISPLAY);
    openAlertDialog(<UploadImageDialog setUploadURL={setUploadURL} />);
  }

  const setSelectedShape = (shapeKey) => {
    let currentLayerList: any = Object.assign([], activeItemList);
    const shapeConfig = {
      x: 512, y: 200, width: 200, height: 200, fill: fillColor, radius: 70,
      stroke: strokeColor, strokeWidth: strokeWidthValue
    }
    const newItem = {
      'type': 'shape',
      'shape': shapeKey,
      'config': shapeConfig,
      'id': `item_${currentLayerList.length}`
    }
    currentLayerList.push(newItem);
    setActiveItemList(currentLayerList);
    setSelectedId(newItem.id);
  }

  const applyFilter = (index, filter, value) => {
    const nodeId = `item_${index}`;
    const stage = canvasRef.current.getStage();
    const imageNode = stage.findOne(`#${nodeId}`);
    if (!imageNode) {
      return;
    }

    imageNode.cache();
    imageNode.filters([filter]);

    if (filter === Konva.Filters.Blur) {
      imageNode.blurRadius(value);
    } else if (filter === Konva.Filters.Brighten) {
      imageNode.brightness(value);
    } else if (filter === Konva.Filters.Contrast) {
      imageNode.contrast(value);
    } else if (filter === Konva.Filters.Grayscale) {
      // No value needed for grayscale
    } else if (filter === Konva.Filters.HSL) {
      imageNode.hue(value * 360); // Example adjustment for HSL filter
    } else if (filter === Konva.Filters.Invert) {
      // No value needed for invert
    } else if (filter === Konva.Filters.Pixelate) {
      imageNode.pixelSize(Math.round(value));
    } else if (filter === Konva.Filters.Posterize) {
      imageNode.levels(Math.round(value));
    } else if (filter === Konva.Filters.Sepia) {
      // No value needed for sepia
    } else if (filter === Konva.Filters.Solarize) {
      // No value needed for solarize
    } else if (filter === Konva.Filters.RGBA) {
      // Assuming the slider controls alpha for RGBA
      imageNode.alpha(value);
    }

    stage.batchDraw();
  };

  const handleBubbleChange = (newAttrs) => {
    const updatedBubbles = activeItemList.map((item) => {
      if (item.id === newAttrs.id) {
        return { ...item, config: newAttrs };
      }
      return item;
    });    
    setActiveItemList(updatedBubbles);
  };

  let viewDisplay = <span />;

  if (currentView === CURRENT_TOOLBAR_VIEW.SHOW_TEMPLATES_DISPLAY) {
    viewDisplay = (
      <SelectTemplate getRemoteTemplateData={getRemoteTemplateData}
        templateOptionList={templateOptionList} addImageToCanvas={addImageToCanvas}
        resetCurrentView={resetCurrentView}
        currentPage={currentPage}
        setCurrentPage={setCurrentPage}
        submitSearch={submitTemplateSearch}
      />
    )
  } else {
    viewDisplay = (
      <SMSCanvas ref={canvasRef}
        maskGroupRef={maskGroupRef}
        sessionDetails={sessionDetails}
        activeItemList={activeItemList}
        setActiveItemList={setActiveItemList}
        editBrushWidth={editBrushWidth}
        currentView={currentView}
        editMasklines={editMasklines}
        setEditMaskLines={setEditMaskLines}
        currentCanvasAction={currentCanvasAction}
        fillColor={fillColor}
        strokeColor={strokeColor}
        selectedId={selectedId}
        setSelectedId={setSelectedId}
        buttonPositions={buttonPositions}
        setButtonPositions={setButtonPositions}
        selectedLayerType={selectedLayerType}
        setSelectedLayerType={setSelectedLayerType}
        applyFilter={applyFilter}
        onChange={handleBubbleChange}
        pencilColor={pencilColor}
        pencilWidth={pencilWidth}
        eraserWidth={eraserWidth}
      />
    )
  }



  useEffect(() => {
    if (pencilOptionsVisible) {
      setCurrentView(CURRENT_TOOLBAR_VIEW.SHOW_PENCIL_DISPLAY)
    }
  }, [pencilOptionsVisible]);

  useEffect(() => {
    if (eraserOptionsVisible) {
      setCurrentView(CURRENT_TOOLBAR_VIEW.SHOW_ERASER_DISPLAY)
    }
  }, [eraserOptionsVisible]);

  useEffect(() => {
    if (cursorSelectOptionVisible) {
      const selectedId = activeItemList[activeItemList.length - 1].id;
      setSelectedId(`item_${selectedId + 1}`);
      setCurrentView(CURRENT_TOOLBAR_VIEW.SHOW_CURSOR_SELECT_DISPLAY)
    }
  }, [cursorSelectOptionVisible]);



  return (
    <CommonContainer resetSession={resetSession}>
      <div className='m-auto'>
        <div className='block'>
          <div className='w-[5%] bg-cyber-black inline-block'>
            <ActionToolbar
              setCurrentAction={setCurrentAction}
              setCurrentViewDisplay={setCurrentViewDisplay}
              showMoveAction={showMoveAction}
              showResizeAction={showResizeAction}
              showSaveAction={showSaveAction}
              showUploadAction={showUploadAction}
              pencilWidth={pencilWidth}
              setPencilWidth={setPencilWidth}
              pencilColor={pencilColor}
              setPencilColor={setPencilColor}
              eraserWidth={eraserWidth}
              setEraserWidth={setEraserWidth}
              pencilOptionsVisible={pencilOptionsVisible}
              setPencilOptionsVisible={setPencilOptionsVisible}
              eraserOptionsVisible={eraserOptionsVisible}
              setEraserOptionsVisible={setEraserOptionsVisible}
              cursorSelectOptionVisible={cursorSelectOptionVisible}
              setCursorSelectOptionVisible={setCursorSelectOptionVisible}
            />
          </div>
          <div className='text-center w-[78%] inline-block h-[100vh] overflow-scroll m-auto  mb-8 '>
            {viewDisplay}
          </div>
          <div className='w-[17%] inline-block bg-cyber-black '>
            <EditorToolbar promptText={promptText} setPromptText={setPromptText}
              submitGenerateRequest={submitGenerateRequest}
              submitOutpaintRequest={submitOutpaintRequest}
              saveIntermediateImage={saveIntermediateImage}
              showAttestationDialog={showAttestationDialog} sessionDetails={sessionDetails}
              updateNFTData={updateNFTData}
              setNftData={setNftData}
              nftData={nftData}
              selectedChain={selectedChain}
              setSelectedChain={setSelectedChain}
              selectedAllocation={selectedAllocation}
              setSelectedAllocation={setSelectedAllocation}
              showTemplatesSelect={showTemplatesSelect}
              addTextBoxToCanvas={addTextBoxToCanvas}
              showMask={showMask}
              setShowMask={setShowMask}
              editBrushWidth={editBrushWidth}
              setEditBrushWidth={setEditBrushWidth}
              setCurrentViewDisplay={setCurrentViewDisplay}
              currentViewDisplay={currentView}
              textConfig={textConfig}
              setTextConfig={setTextConfig}
              activeItemList={activeItemList}
              setActiveItemList={setActiveItemList}
              selectedGenerationModel={selectedGenerationModel}
              setSelectedGenerationModel={setSelectedGenerationModel}
              selectedEditModel={selectedEditModel}
              setSelectedEditModel={setSelectedEditModel}
              isGenerationPending={isGenerationPending}
              isOutpaintPending={isOutpaintPending}
              isPublicationPending={isPublicationPending}
              setSelectedShape={setSelectedShape}
              fillColor={fillColor}
              setFillColor={setFillColor}
              strokeColor={strokeColor}
              setStrokeColor={setStrokeColor}
              strokeWidthValue={strokeWidthValue}
              setStrokeWidthValue={setStrokeWidthValue}
              generationError={generationError}
              outpaintError={outpaintError}
            />
          </div>
        </div>
      </div>
    </CommonContainer>
  )
}
