

import React, { useEffect, useState, useRef, useCallback } from 'react';
import axios from 'axios';
import { useParams } from 'react-router-dom';
import Konva from 'konva';
import { useUser } from '../../contexts/UserContext.js';
import { useAlertDialog } from '../../contexts/AlertDialogContext.js';
import { useColorMode } from '../../contexts/ColorMode.js';
import { getHeaders } from '../../utils/web.js';
import { CURRENT_TOOLBAR_VIEW, CANVAS_ACTION, TOOLBAR_ACTION_VIEW } from '../../constants/Types.ts';
import { STAGE_DIMENSIONS } from '../../constants/Image.js';
import SMSCanvas from '../editor/SMSCanvas.tsx';
import EditorToolbar from '../editor/toolbar/EditorToolbar.tsx';
import SelectTemplate from '../editor/SelectTemplate.tsx';
import AttestationDialog from '../editor/utils/AttestationDialog.tsx';
import PublishDialog from '../editor/utils/PublishDialog.tsx';
import CommonContainer from '../common/CommonContainer.tsx';
import ActionToolbar from '../editor/toolbar/ActionToolbar.tsx';
import UploadImageDialog from '../editor/utils/UploadImageDialog.js';
import VideoCanvas from './editor/VideoCanvas.js';
import VideoEditorToolbar from './toolbars/VideoEditorToolbar.js'
import LoadingImage from './util/LoadingImage.js';
import ImageLibrary from './util/ImageLibrary.js';

const PUBLISHER_URL = process.env.REACT_APP_PUBLISHER_URL;
const PROCESSOR_API_URL = process.env.REACT_APP_PROCESSOR_API;
const IPFS_URL_BASE = process.env.REACT_APP_IPFS_URL_BASE;

export default function VideoEditorContainer(props) {
  const { selectedLayerId, currentLayerSeek,
    currentEditorView, setCurrentEditorView, setFrameEditDisplay,
    currentLayer, updateSessionLayerActiveItemList,
    activeItemList, setActiveItemList, isLayerSeeking,
    showAddAudioToProjectDialog, generationImages,
    updateCurrentActiveLayer,
    videoSessionDetails,
  } = props;

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


  const [editBrushWidth, setEditBrushWidth] = useState(25);
  const [editMasklines, setEditMaskLines] = useState([]);

  const [currentView, setCurrentView] = useState(CURRENT_TOOLBAR_VIEW.SHOW_DEFAULT_DISPLAY);
  const [currentCanvasAction, setCurrentCanvasAction] = useState(TOOLBAR_ACTION_VIEW.SHOW_DEFAULT_DISPLAY);


  const [selectedGenerationModel, setSelectedGenerationModel] = useState('DALLE3');
  const [selectedEditModel, setSelectedEditModel] = useState('DALLE2');
  const [isGenerationPending, setIsGenerationPending] = useState(false);
  const [isOutpaintPending, setIsOutpaintPending] = useState(false);
  const [isPublicationPending, setIsPublicationPending] = useState(false);


  const [currentPage, setCurrentPage] = useState(1);

  const { colorMode } = useColorMode();
  const initialBackgroundFillColor = colorMode === 'dark' ? '#030712' : '#f5f5f5';
  const initFillColor = colorMode === 'dark' ? '#f5f5f5' : '#030712';
  const initTextFillColor = colorMode === 'dark' ? '#000000' : '#ffffff';

  const [fillColor, setFillColor] = useState(initFillColor);
  const [strokeColor, setStrokeColor] = useState(initFillColor);
  const [strokeWidthValue, setStrokeWidthValue] = useState(2);
  const [buttonPositions, setButtonPositions] = useState([]);

  const [selectedId, setSelectedId] = useState(null);
  const [selectedLayerType, setSelectedLayerType] = useState(null);


  const [pencilWidth, setPencilWidth] = useState(10);
  const [pencilColor, setPencilColor] = useState('#000000');
  const [eraserWidth, setEraserWidth] = useState(30);
  const [pencilOptionsVisible, setPencilOptionsVisible] = useState(false);
  const [eraserOptionsVisible, setEraserOptionsVisible] = useState(false);
  const [cursorSelectOptionVisible, setCursorSelectOptionVisible] = useState(false);

  const [generationError, setGenerationError] = useState(null);
  const [outpaintError, setOutpaintError] = useState(null);

  const [selectedLayerSelectShape, setSelectedLayerSelectShape] = useState(null);

  const [audioGenerationPending, setAudioGenerationPending] = useState(false);



  const [textConfig, setTextConfig] = useState({
    fontSize: 40,
    fontFamily: 'Times New Roman',
    fillColor: initTextFillColor,
    x: 512,
    y: 200,
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

  // useEffect(() => {
  //   if (!id) {
  //     return;
  //   }


  //   const headers = getHeaders();

  //   setActiveItemList([]);

  //   axios.get(`${PROCESSOR_API_URL}/video_sessions/details?id=${id}`, headers).then((response) => {


  //     const session = response.data;

      
  //   //  setSessionDetails(session);


  //     if (session.activeItemList) {

  //       setActiveItemList(session.activeItemList);
  //     } else if (session.activeSelectedImage) {

  //       const activeSelectedImageName = session.activeSelectedImage;

  //       const activeSelectedImageURL = `${PROCESSOR_API_URL}/generations/${activeSelectedImageName}`;


  //       const nImageList: any = Object.assign([], activeItemList);
  //       nImageList.push({
  //         src: activeSelectedImageURL, id: `item_${nImageList.length}`,
  //         type: 'image', width: STAGE_DIMENSIONS.width,
  //         height: STAGE_DIMENSIONS.height,
  //         x: 0, y: 0
  //       });

  //       setActiveItemList(nImageList);


  //     } else {
  //       const nImageList: any = Object.assign([], activeItemList);
  //       if (nImageList.length === 0) {
  //         nImageList.push({
  //           id: `item_${nImageList.length}`,
  //           type: 'shape',
  //           shape: 'rectangle',
  //           config: {
  //             x: 0, y: 0, width: STAGE_DIMENSIONS.width, height: STAGE_DIMENSIONS.height,
  //             fillColor: initialBackgroundFillColor, strokeColor: initialBackgroundFillColor, strokeWidth: strokeWidthValue,
  //             fixed: true,
  //           }
  //         });
  //         // setActiveItemList(nImageList);
  //       }
  //     }

  //   });


  // }, [selectedLayerId]);



  useEffect(() => {
    if (currentView !== CURRENT_TOOLBAR_VIEW.SHOW_EDIT_MASK_DISPLAY) {
      setEditMaskLines([]);
    }
    //setSelectedId(null); // test
  }, [currentView]);

  const setUploadURL = useCallback((data) => {
    if (!data) {
      return;
    }
    const newItemId = `item_${activeItemList.length}`;

    let newItem = {
      src: data.url,
      id: newItemId,
      type: 'image',
      x: data.x,
      y: data.y,
      width: data.width,
      height: data.height
    };

    const newItemList = [...activeItemList, newItem];
    setActiveItemList(newItemList);
    updateSessionActiveItemList(newItemList);
    closeAlertDialog();

  }, [activeItemList]);



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
        // saveIntermediateImage();
      }
    }

    // Update the ref with the new length for the next render
    prevLengthRef.current = currentLength;
  }, [activeItemList.length]);


  const updateNFTData = (value) => {
    let newNftData = Object.assign({}, nftData, value);
    setNftData(newNftData);
  }

  const submitGenerateRequest = async () => {
    const payload = {
      prompt: promptText,
      videoSessionId: id,
      model: selectedGenerationModel,
      layerId: currentLayer._id.toString()

    }
    setGenerationError(null);

    const headers = getHeaders();
    const generateStatus = await axios.post(`${PROCESSOR_API_URL}/video_sessions/request_generate`, payload, headers);
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
      layerId: currentLayer._id.toString(),
      prompt: promptText,
      model: selectedEditModel,
      guidanceScale: guidanceScale,
      numInferenceSteps: numInferenceSteps,
      strength: strength
    }
    setOutpaintError(null);
    const headers = getHeaders();

    const outpaintStatus = await axios.post(`${PROCESSOR_API_URL}/video_sessions/request_outpaint`, payload, headers);
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
    const selectedLayerId = currentLayer._id.toString();
    const headers = getHeaders();
    const pollStatusData = await axios.get(`${PROCESSOR_API_URL}/video_sessions/generate_status?id=${id}&layerId=${selectedLayerId}`, headers);

    const pollStatus = pollStatusData.data;


    if (pollStatus.generationStatus === 'COMPLETED') {
      const generatedImageUrlName = pollStatus.activeGeneratedImage;
      const generatedURL = `/generations/${generatedImageUrlName}`;
      const nImageList: any = Object.assign([], activeItemList);
      const newItem = {
        src: generatedURL, id: `item_${nImageList.length}`, type: 'image',
        x: 0, y: 0, width: STAGE_DIMENSIONS.width, height: STAGE_DIMENSIONS.height
      };

      nImageList.push(newItem);

      setActiveItemList(nImageList);
     // updateSessionActiveItemList(nImageList);
     // setSessionDetails(pollStatus);
      setIsGenerationPending(false);
      setCurrentView(CURRENT_TOOLBAR_VIEW.SHOW_DEFAULT_DISPLAY);

      return;
    } else if (pollStatus.generationStatus === 'FAILED') {
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

    const selectedLayerId = currentLayer._id.toString();
    const headers = getHeaders();

    const pollStatusData = await axios.get(`${PROCESSOR_API_URL}/video_sessions/outpaint_status?id=${id}&layerId=${selectedLayerId}`, headers);

    const pollStatus = pollStatusData.data;


    if (pollStatus.outpaintStatus === 'COMPLETED') {
      const newActiveItemList = pollStatus.activeItemList;

      const generatedImageUrlName = pollStatus.activeOutpaintedImage;
      const generatedURL = `${generatedImageUrlName}`;

      const nImageList: any = Object.assign([], activeItemList);
      nImageList.push({ src: generatedURL, id: `item_${nImageList.length}`, type: 'image' });

      setCurrentView(CURRENT_TOOLBAR_VIEW.SHOW_DEFAULT_DISPLAY);

      setActiveItemList(nImageList);
     // setSessionDetails(pollStatus);
      setIsOutpaintPending(false);

      return;
    } else if (pollStatus.outpaintStatus === 'FAILED') {
      setIsOutpaintPending(false);
      setOutpaintError(pollStatus.outpaintError);
      return;
    } else {
      setTimeout(() => {
        startOutpaintPoll();
      }, 1000);
    }
  }

  const startAudioGenerationPoll = async () => {


    const sessionId = id
    const pollStatusData = await axios.get(`${PROCESSOR_API_URL}/audio/generate_status?sessionId=${sessionId}`);
    const pollStatus = pollStatusData.data;


    if (pollStatus.generationStatus === 'COMPLETED') {
      setSessionDetails(pollStatus.videoSession);
      setAudioGenerationPending(false);
      setCurrentCanvasAction(TOOLBAR_ACTION_VIEW.SHOW_PREVIEW_MUSIC_DISPLAY);
      return;
    } else if (pollStatus.generationStatus === 'FAILED') {
      setAudioGenerationPending(false);


      return;
    } else {
      setTimeout(() => {
        startAudioGenerationPoll();
      }, 1000);
    }
  }

  const showTemplatesSelect = () => {
    setIsTemplateSelectViewSelected(!isTemplateSelectViewSelected);
  }



  const showAttestationDialog = () => {

  }

  const addImageItemToActiveList = (payload) => {
    setCurrentCanvasAction(TOOLBAR_ACTION_VIEW.SHOW_DEFAULT_DISPLAY);
    updateCurrentActiveLayer(payload);
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

      axios.post(`${PROCESSOR_API_URL}/video_sessions/save_intermediate`, sessionPayload, headers)
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
    updateSessionActiveItemList(nImageList);
  }

  const addTextBoxToCanvas = (payload) => {


    const nImageList: any = Object.assign([], activeItemList);
    const currentItemId = `item_${nImageList.length}`;
    payload.id = currentItemId;
    nImageList.push(payload);
    setActiveItemList(nImageList);
    updateSessionActiveItemList(nImageList);
  }


  const updateTargetActiveLayerConfig = (id) => {

  }

  const updateSessionActiveItemList = (newActiveItemList) => {
    updateSessionLayerActiveItemList(newActiveItemList);
  }



  const showMoveAction = () => {

  }

  const showResizeAction = () => {

  }

  const showSaveAction = () => {
    // saveIntermediateImage();
  }

  const showUploadAction = () => {
    setCurrentView(CURRENT_TOOLBAR_VIEW.SHOW_DEFAULT_DISPLAY);
    openAlertDialog(<UploadImageDialog setUploadURL={setUploadURL} />);
  }

  const setSelectedShape = (shapeKey) => {

    let shapeConfig;
    if (shapeKey === 'dialog') {
      let xVal = 512;
      let yVal = 200;
      let height = 50;
      let width = 100;
      shapeConfig = {
        x: xVal, y: yVal, width: width, height: height, fillColor: fillColor,
        strokeColor: strokeColor, strokeWidth: strokeWidthValue,
        pointerX: xVal, pointerY: yVal + height / 2 + 20,
        xRadius: width / 2, yRadius: 20
      }
    } else {
      shapeConfig = {
        x: 512, y: 200, width: 200, height: 200, fillColor: fillColor, radius: 70,
        strokeColor: strokeColor, strokeWidth: strokeWidthValue
      }
    }

    let currentLayerList: any = Object.assign([], activeItemList);

    const newItem = {
      'type': 'shape',
      'shape': shapeKey,
      'config': shapeConfig,
      'id': `item_${currentLayerList.length}`
    }
    currentLayerList.push(newItem);
    setActiveItemList(currentLayerList);
    setSelectedId(newItem.id);
    updateSessionActiveItemList(currentLayerList);
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

  const applyFinalFilter = async (index, filter, value) => {
    const nodeId = `item_${index}`;
    const stage = canvasRef.current.getStage();
    const imageNode = stage.findOne(`#${nodeId}`);
    if (!imageNode) {
      return;
    }

    // Apply the filter to the image node
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

    // Convert the updated image node to a data URL
    const updatedImageDataUrl = imageNode.toDataURL();

    // Update the activeItemList with the new data URL
    const updatedItemList = activeItemList.map((item, idx) => {
      if (idx === index) {
        return {
          ...item,
          src: updatedImageDataUrl,
        };
      }
      return item;
    });

    setActiveItemList(updatedItemList);

    // Send a backend request to update the session layer
    updateSessionLayerActiveItemList(updatedItemList);
  };





  const handleBubbleChange = (newAttrs) => {
    // const updatedBubbles = activeItemList.map((item) => {
    //   if (item.id === newAttrs.id) {
    //     return { ...item, config: newAttrs };
    //   }
    //   return item;
    // });
    // setActiveItemList(updatedBubbles);
  };

  const combineCurrentLayerItems = async () => {
    const stage = canvasRef.current.getStage();
    const originalLayer = stage.getLayers()[0];

    // Remove transformers before combining
    stage.find('Transformer').forEach(transformer => {
      transformer.destroy();
    });

    // Create a new Konva layer to combine all items
    const combinedLayer = new Konva.Layer();
    originalLayer.children.forEach(child => {
      combinedLayer.add(child.clone());
    });

    // Draw the combined layer
    combinedLayer.draw();

    // Convert the combined layer to a data URL
    const combinedImageDataUrl = combinedLayer.toDataURL();

    // Create a new item for the combined image
    const combinedItem = {
      src: combinedImageDataUrl,
      id: `item_${activeItemList.length}`,
      type: 'image',
      x: 0,
      y: 0,
      width: STAGE_DIMENSIONS.width,
      height: STAGE_DIMENSIONS.height,
    };

    // Update the activeItemList with the combined image
    const updatedItemList = [combinedItem];

    setActiveItemList(updatedItemList);
    updateSessionLayerActiveItemList(updatedItemList);

    // Send a backend request to update the session layer
    const headers = getHeaders();
    const payload = {
      sessionId: id,
      activeItemList: updatedItemList,
      layerId: currentLayer._id.toString(),
    };

    axios.post(`${PROCESSOR_API_URL}/video_sessions/update_active_item_list`, payload, headers)
      .then(response => {
        const updatedSession = response.data;
        setActiveItemList(updatedSession.activeItemList);
      })
      .catch(error => {
        console.error('Error updating active item list:', error);
      });
  };





  const submitGenerateMusicRequest = (payload) => {
    const headers = getHeaders();
    payload.sessionId = id;
    axios.post(`${PROCESSOR_API_URL}/audio/request_generate_audio`, payload, headers).then((response) => {
      const audioGeneration = response.data;
      setAudioGenerationPending(true);
      startAudioGenerationPoll(audioGeneration);
    });
  }

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
  } else if (activeItemList.length > 0) {



  }


  const exportAnimationFrames = async (updatedItemList) => {

  };

  const submitAddTrackToProject = (index, payload) => {
    const headers = getHeaders();
    const sessionId = id;

    const audioLayers = sessionDetails.audioLayers;
    const latestAudioLayer = audioLayers[audioLayers.length - 1];
    const layerId = latestAudioLayer._id.toString();

    const requestPayload = {
      sessionId,
      trackIndex: index,
      audioLayerId: layerId,
      ...payload
    }

    axios.post(`${PROCESSOR_API_URL}/audio/add_track_to_project`, requestPayload, headers).then((response) => {
      console.log(response);
      const sessionData = response.data;
      if (sessionData && sessionData.videoSession) {
        setSessionDetails(sessionData.videoSession);
        setCurrentCanvasAction(TOOLBAR_ACTION_VIEW.SHOW_DEFAULT_DISPLAY)
      }

    });
  }

  useEffect(() => {
    if (cursorSelectOptionVisible) {
      const selectedId = activeItemList[activeItemList.length - 1].id;
      setSelectedId(`item_${selectedId + 1}`);
      setCurrentView(CURRENT_TOOLBAR_VIEW.SHOW_CURSOR_SELECT_DISPLAY)
    }
  }, [cursorSelectOptionVisible]);




  if (currentLayer && currentLayer.imageSession && currentLayer.imageSession.activeItemList) {

    if (currentLayer.imageSession.generationStatus === 'PENDING') {
      viewDisplay = <LoadingImage />;
    } else {

      if (currentCanvasAction === TOOLBAR_ACTION_VIEW.SHOW_LIBRARY_DISPLAY) {
        viewDisplay = (
          <ImageLibrary
            generationImages={generationImages}
            addImageItemToActiveList={addImageItemToActiveList}/>
        )
      } else {  
        viewDisplay = (
          <VideoCanvas ref={canvasRef}
            key={`canvas_${currentLayer._id.toString()}`}
            maskGroupRef={maskGroupRef}
            sessionDetails={sessionDetails}
            activeItemList={activeItemList}
            setActiveItemList={setActiveItemList}
            editBrushWidth={editBrushWidth}
            currentView={currentView}
            editMasklines={editMasklines}
            setEditMaskLines={setEditMaskLines}
            currentCanvasAction={currentCanvasAction}
            setCurrentCanvasAction={setCurrentCanvasAction}
            fillColor={fillColor}
            strokeColor={strokeColor}
            selectedId={selectedId}
            setSelectedId={setSelectedId}
            buttonPositions={buttonPositions}
            setButtonPositions={setButtonPositions}
            selectedLayerType={selectedLayerType}
            setSelectedLayerType={setSelectedLayerType}
            applyFilter={applyFilter}
            applyFinalFilter={applyFinalFilter}
            onChange={handleBubbleChange}
            pencilColor={pencilColor}
            pencilWidth={pencilWidth}
            eraserWidth={eraserWidth}
            sessionId={id}
            selectedLayerId={selectedLayerId}
            exportAnimationFrames={exportAnimationFrames}
            currentLayerSeek={currentLayerSeek}
            currentLayer={currentLayer}
            updateTargetActiveLayerConfig={updateTargetActiveLayerConfig}
            updateSessionActiveItemList={updateSessionActiveItemList}
            selectedLayerSelectShape={selectedLayerSelectShape}
            setCurrentView={setCurrentView}
            isLayerSeeking={isLayerSeeking}



          />
        )
      }
    }

  }


  const submitUpdateSessionDefaults = (evt) => {
    evt.preventDefault();
    const formData = new FormData(evt.target);
    const headers = getHeaders();
    const payload = {
      sessionId: id,
      defaults: Object.fromEntries(formData),
    };
    console.log(payload);
    axios.post(`${PROCESSOR_API_URL}/video_sessions/update_defaults`, payload, headers).then((response) => {
      console.log(response);
    });

  }

  return (

    <div className='block'>

      <div className='text-center w-[82%] inline-block h-[100vh] overflow-scroll m-auto  mb-8 '>
        {viewDisplay}
      </div>
      <div className='w-[18%] inline-block bg-cyber-black '>
        <VideoEditorToolbar promptText={promptText} setPromptText={setPromptText}
          submitGenerateRequest={submitGenerateRequest}
          submitOutpaintRequest={submitOutpaintRequest}
          saveIntermediateImage={saveIntermediateImage}
          showAttestationDialog={showAttestationDialog} 
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
          selectedId={selectedId}
          exportAnimationFrames={exportAnimationFrames}
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
          cursorSelectOptionVisible={cursorSelectOptionVisible}
          setCursorSelectOptionVisible={setCursorSelectOptionVisible}
          setCurrentCanvasAction={setCurrentCanvasAction}
          currentCanvasAction={currentCanvasAction}
          selectedLayerSelectShape={selectedLayerSelectShape}
          setSelectedLayerSelectShape={setSelectedLayerSelectShape}
          updateSessionLayerActiveItemList={updateSessionLayerActiveItemList}
          eraserOptionsVisible={eraserOptionsVisible}
          submitGenerateMusicRequest={submitGenerateMusicRequest}
          audioLayers={sessionDetails.audioLayers}
          audioGenerationPending={audioGenerationPending}
          submitAddTrackToProject={submitAddTrackToProject}
          combineCurrentLayerItems={combineCurrentLayerItems}
          showAddAudioToProjectDialog={showAddAudioToProjectDialog}
          sessionDetails={videoSessionDetails}
          submitUpdateSessionDefaults={submitUpdateSessionDefaults}

        />
      </div>

    </div>

  )
}
