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
import SelectTemplate from '../editor/SelectTemplate.tsx';
import UploadImageDialog from '../editor/utils/UploadImageDialog.js';
import VideoCanvasContainer from './editor/VideoCanvasContainer.js';
import VideoEditorToolbar from './toolbars/VideoEditorToolbar.js'
import LoadingImage from './util/LoadingImage.js';
import LoadingImageTransparent from './util/LoadingImageTransparent.js';
import ImageLibrary from './util/ImageLibrary.js';
import AuthContainer from '../auth/AuthContainer.js';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { FaCheck, FaTimes } from 'react-icons/fa';


const PROCESSOR_API_URL = process.env.REACT_APP_PROCESSOR_API;


export default function VideoEditorContainer(props) {
  const { selectedLayerId, currentLayerSeek,
    currentLayer, updateSessionLayerActiveItemList,
    updateSessionLayerActiveItemListAnimations,
    activeItemList, setActiveItemList, isLayerSeeking,
    showAddAudioToProjectDialog, generationImages,
    updateCurrentActiveLayer,
    videoSessionDetails,
    setVideoSessionDetails,
    toggleHideItemInLayer,
    pollForLayersUpdate,
    setIsCanvasDirty,
    updateCurrentLayer,
    applyAnimationToAllLayers,
    setGenerationImages,
  } = props;

  const [segmentationData, setSegmentationData] = useState([]);

  let { id } = useParams();

  const showLoginDialog = () => {
    const loginComponent = (
      <AuthContainer />
    )
    openAlertDialog(loginComponent);
  };

  const generationPollIntervalRef = useRef(null);
  const outpaintPollIntervalRef = useRef(null);
  const audioGenerationPollIntervalRef = useRef(null);
  const maskGenerationPollIntervalRef = useRef(null);

  useEffect(() => {
    if (currentLayer && currentLayer.segmentation) {
      setSegmentationData(currentLayer.segmentation);
    }

    if (currentLayer && currentLayer.imageSession && currentLayer.imageSession.generationStatus === 'PENDING') {
      pollForLayersUpdate();
    }

    return () => {
      if (generationPollIntervalRef.current) {
        clearInterval(generationPollIntervalRef.current);
      }
      if (outpaintPollIntervalRef.current) {
        clearInterval(outpaintPollIntervalRef.current);
      }
      if (maskGenerationPollIntervalRef.current) {
        clearInterval(maskGenerationPollIntervalRef.current);
      }
    };
  }, [currentLayer]);

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
  const [eraserOptionsVisible, setEraserOptionsVisible] = useState(false);
  const [cursorSelectOptionVisible, setCursorSelectOptionVisible] = useState(false);

  const [generationError, setGenerationError] = useState(null);
  const [outpaintError, setOutpaintError] = useState(null);

  const [selectedLayerSelectShape, setSelectedLayerSelectShape] = useState(null);

  const [audioGenerationPending, setAudioGenerationPending] = useState(false);

  const [enableSegmentationMask, setEnableSegmentationMask] = useState(false);

  const [canvasActionLoading, setCanvasActionLoading] = useState(false);

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



  const { openAlertDialog, closeAlertDialog, setIsAlertActionPending } = useAlertDialog();
  const { user } = useUser();

  const [showMask, setShowMask] = useState(false);

  const canvasRef = useRef(null);
  const maskGroupRef = useRef(null);

  useEffect(() => {
    setIsAlertActionPending(isPublicationPending);
  }, [isPublicationPending]);


  useEffect(() => {
    if (currentView !== CURRENT_TOOLBAR_VIEW.SHOW_EDIT_MASK_DISPLAY) {
      setEditMaskLines([]);
    }
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
    updateSessionLayerActiveItemList(newItemList);
    closeAlertDialog();
    toast.success(<div><FaCheck className='inline-flex mr-2'/> Image uploaded successfully!</div>, {
      position: "bottom-center",
      className: "custom-toast",
    });
  }, [activeItemList]);

  useEffect(() => {
    if (currentCanvasAction === TOOLBAR_ACTION_VIEW.SHOW_ERASER_DISPLAY) {
      setSelectedId(null);
    }
  }, [currentCanvasAction]);

  const resetCurrentView = () => {
    setCurrentView(CURRENT_TOOLBAR_VIEW.SHOW_DEFAULT_DISPLAY);
  }

  const prevLengthRef = useRef(activeItemList.length);
  const [isIntermediateSaving, setIsIntermediateSaving] = useState(false);

  useEffect(() => {
    const currentLength = activeItemList.length;

    if (prevLengthRef.current !== currentLength) {
      if (!isIntermediateSaving) {
        setIsIntermediateSaving(true);
      }
    }

    prevLengthRef.current = currentLength;
  }, [activeItemList.length]);


  const submitGenerateRequest = async () => {

    const payload = {
      prompt: promptText,
      videoSessionId: id,
      model: selectedGenerationModel,
      layerId: currentLayer._id.toString()
    }
    setGenerationError(null);

    const headers = getHeaders();
    if (!headers) {
      showLoginDialog();
      return;
    }
    axios.post(`${PROCESSOR_API_URL}/video_sessions/request_generate`, payload, headers)
      .then(() => {
        startGenerationPoll();
        toast.success(<div><FaCheck className='inline-flex mr-2'/> Generation request submitted successfully!</div>, {
          position: "bottom-center",
          className: "custom-toast",
        });
      })
      .catch(error => {
        setGenerationError(error.message);
        toast.error(<div><FaTimes /> Failed to submit generation request.</div>, {
          position: "bottom-center",
          className: "custom-toast",
        });
      });
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
    
    // Continue with the outpainting request processing
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
    };
    
    setOutpaintError(null);
    const headers = getHeaders();
    if (!headers) {
      showLoginDialog();
      return;
    }
  
    axios.post(`${PROCESSOR_API_URL}/video_sessions/request_outpaint`, payload, headers)
      .then(() => {
        startOutpaintPoll();
        toast.success(<div><FaCheck className='inline-flex mr-2'/> Outpaint request submitted successfully!</div>, {
          position: "bottom-center",
          className: "custom-toast",
        });
      })
      .catch(error => {
        setOutpaintError(error.message);
        toast.error(<div><FaTimes /> Failed to submit outpaint request.</div>, {
          position: "bottom-center",
          className: "custom-toast",
        });
      });
  };

  

  const exportBaseGroup = () => {
    const baseStage = canvasRef.current;
    const baseLayer = baseStage.getLayers()[0];
  
    // Clone the entire stage to work with
    const clonedStage = baseStage.clone();
  
    // Find the maskGroup in the cloned stage and hide it
    const clonedLayer = clonedStage.getLayers()[0];
    const maskGroup = clonedLayer.children.find((child) => child.attrs && child.attrs.id === 'maskGroup');
  
    if (maskGroup) {
      maskGroup.hide();
    }
  
    // Draw the cloned stage to apply the visibility changes
    clonedStage.draw();
  
    // Export the cloned stage as an image
    const dataUrl = clonedStage.toDataURL({
      width: STAGE_DIMENSIONS.width,
      height: STAGE_DIMENSIONS.height,
      pixelRatio: 1
    });
  
    return dataUrl;
  };
  

  const exportMaskGroupAsColored = async () => {
    const baseStage = canvasRef.current;
    const baseLayer = baseStage.getLayers()[0];
    const maskGroup = baseLayer.children.find((child) => child.attrs && child.attrs.id === 'maskGroup');

    if (maskGroup) {
      const offscreenCanvas = document.createElement('canvas');
      offscreenCanvas.width = baseStage.width();
      offscreenCanvas.height = baseStage.height();
      const ctx = offscreenCanvas.getContext('2d');

      ctx.fillStyle = 'black';
      ctx.fillRect(0, 0, offscreenCanvas.width, offscreenCanvas.height);

      ctx.fillStyle = 'white';

      maskGroup.children.forEach(line => {
        ctx.beginPath();
        ctx.moveTo(line.points()[0], line.points()[1]);
        for (let i = 2; i < line.points().length; i += 2) {
          ctx.lineTo(line.points()[i], line.points()[i + 1]);
        }
        ctx.closePath();
        ctx.fill();
      });

      const dataUrl = offscreenCanvas.toDataURL('image/png', 1);
      return dataUrl;
    } else {
      console.error('Mask group not found');
      return null;
    }
  };


  const exportMaskGroupAsTransparent = async () => {
    const baseStage = canvasRef.current;
  
    // Create an offscreen canvas
    const offscreenCanvas = document.createElement('canvas');
    offscreenCanvas.width = baseStage.width();
    offscreenCanvas.height = baseStage.height();
    const ctx = offscreenCanvas.getContext('2d');
  
    // Clone the stage to work with a copy
    const clonedStage = baseStage.clone();
  
    // Get the cloned layer and find the maskGroup
    const clonedLayer = clonedStage.getLayers()[0];
    const maskGroup = clonedLayer.children.find((child) => child.attrs && child.attrs.id === 'maskGroup');
  
    if (!maskGroup) {
      console.error('Mask group not found');
      return null;
    }
  
    // Hide the maskGroup in the cloned layer
    maskGroup.hide();
  
    // Draw the entire canvas except the maskGroup
    clonedLayer.draw();
    const canvasDataUrl = clonedStage.toDataURL();
    const canvasImage = new Image();
    canvasImage.src = canvasDataUrl;
  
    await new Promise((resolve) => {
      canvasImage.onload = () => {
        ctx.drawImage(canvasImage, 0, 0);
        resolve();
      };
    });
  
    // Draw the maskGroup as transparent on the new canvas
    ctx.globalCompositeOperation = 'destination-out';
    maskGroup.show();
    maskGroup.children.forEach(line => {
      ctx.beginPath();
      ctx.moveTo(line.points()[0], line.points()[1]);
      for (let i = 2; i < line.points().length; i += 2) {
        ctx.lineTo(line.points()[i], line.points()[i + 1]);
      }
      ctx.strokeStyle = 'rgba(0, 0, 0, 1)'; // The color used for masking (this won't be visible)
      ctx.lineWidth = line.strokeWidth();
      ctx.stroke();
    });
  
    // Reset the global composite operation
    ctx.globalCompositeOperation = 'source-over';
  
    // Convert the offscreen canvas to a data URL
    const dataUrl = offscreenCanvas.toDataURL();
    return dataUrl;
  };
  
  

  async function startGenerationPoll() {
    setIsGenerationPending(true);
    const selectedLayerId = currentLayer._id.toString();
    const headers = getHeaders();
    if (!headers) {
      showLoginDialog();
      return;
    }
    const pollStatusData = await axios.get(`${PROCESSOR_API_URL}/video_sessions/generate_status?id=${id}&layerId=${selectedLayerId}`, headers);

    const pollStatus = pollStatusData.data;

    if (pollStatus.status === 'COMPLETED') {

      
      const layerData = pollStatus.layer;
      const imageSession = layerData.imageSession;

      const generationImages = pollStatus.generationImages;
      if (generationImages && generationImages.length > 0) {
      setGenerationImages(generationImages);
      }
      const generatedImageUrlName = imageSession.activeGeneratedImage;
      const generatedURL = `/generations/${generatedImageUrlName}`;
      const item_id = `item_${activeItemList.length}`;
      const nImageList = [...activeItemList, {
        src: generatedURL, id: item_id, type: 'image',
        x: 0, y: 0, width: STAGE_DIMENSIONS.width, height: STAGE_DIMENSIONS.height
      }];
      setActiveItemList(nImageList);
      setIsGenerationPending(false);
      setCurrentView(CURRENT_TOOLBAR_VIEW.SHOW_DEFAULT_DISPLAY);
      toast.success(<div><FaCheck className='inline-flex mr-2'/> Generation completed successfully!</div>, {
        position: "bottom-center",
        className: "custom-toast",
      });
      updateCurrentLayer(layerData);
      return;
    } else if (pollStatus.status === 'FAILED') {
      setIsGenerationPending(false);
      setGenerationError(pollStatus.generationError);
      toast.error(<div><FaTimes /> Generation failed.</div>, {
        position: "bottom-center",
        className: "custom-toast",
      });
      return;
    } else {
      generationPollIntervalRef.current = setTimeout(() => {
        startGenerationPoll();
      }, 1000);
    }
  }

  async function startOutpaintPoll() {
    setIsOutpaintPending(true);

    const selectedLayerId = currentLayer._id.toString();
    const headers = getHeaders();
    if (!headers) {
      showLoginDialog();
      return;
    }

    const pollStatusData = await axios.get(`${PROCESSOR_API_URL}/video_sessions/outpaint_status?id=${id}&layerId=${selectedLayerId}`, headers);

    const pollStatus = pollStatusData.data;

    if (pollStatus.status === 'COMPLETED') {

      const layerData = pollStatus.layer;
      const imageSession = layerData.imageSession;

      const newActiveItemList = imageSession.activeItemList;
      const generatedImageUrlName = imageSession.activeOutpaintedImage;
      const generatedURL = `${generatedImageUrlName}`;
      const item_id = `item_${activeItemList.length}`;
      const nImageList = [...activeItemList, { src: generatedURL, id: item_id, type: 'image' }];

      const generationImages = pollStatus.generationImages;
      if (generationImages && generationImages.length > 0) {
      setGenerationImages(generationImages);
      }

      setCurrentView(CURRENT_TOOLBAR_VIEW.SHOW_DEFAULT_DISPLAY);
      setActiveItemList(nImageList);
      setIsOutpaintPending(false);
      toast.success(<div><FaCheck className='inline-flex mr-2'/> Outpaint completed successfully!</div>, {
        position: "bottom-center",
        className: "custom-toast",
      });
      return;
    } else if (pollStatus.status === 'FAILED') {
      setIsOutpaintPending(false);
      setOutpaintError("Failed to generate outpaint");
      toast.error(<div><FaTimes /> Outpaint failed.</div>, {
        position: "bottom-center",
        className: "custom-toast",
      });
      return;
    } else {
      outpaintPollIntervalRef.current = setTimeout(() => {
        startOutpaintPoll();
      }, 1000);
    }
  }

  const startAudioGenerationPoll = async () => {
    const sessionId = id;
    const headers = getHeaders();
    if (!headers) {
      showLoginDialog();
      return;
    }

    const pollStatusData = await axios.get(`${PROCESSOR_API_URL}/audio/generate_status?sessionId=${sessionId}`, headers);
    const pollStatus = pollStatusData.data;

    if (pollStatus.generationStatus === 'COMPLETED') {
      setVideoSessionDetails(pollStatus.videoSession);
      setAudioGenerationPending(false);
      setCurrentCanvasAction(TOOLBAR_ACTION_VIEW.SHOW_PREVIEW_MUSIC_DISPLAY);
      toast.success(<div><FaCheck className='inline-flex mr-2'/> Audio generation completed successfully!</div>, {
        position: "bottom-center",
        className: "custom-toast",
      });
      return;
    } else if (pollStatus.generationStatus === 'FAILED') {
      setAudioGenerationPending(false);
      toast.error(<div><FaTimes /> Audio generation failed.</div>, {
        position: "bottom-center",
        className: "custom-toast",
      });
      return;
    } else {
      audioGenerationPollIntervalRef.current = setTimeout(() => {
        startAudioGenerationPoll();
      }, 1000);
    }
  }

  const showTemplatesSelect = () => {
    setIsTemplateSelectViewSelected(!isTemplateSelectViewSelected);
  }

  const showAttestationDialog = () => { }

  const addImageItemToActiveList = (payload) => {
    setCurrentCanvasAction(TOOLBAR_ACTION_VIEW.SHOW_DEFAULT_DISPLAY);
    updateCurrentActiveLayer(payload);
  }

  const getRemoteTemplateData = (page) => {
    const headers = getHeaders();
    if (!headers) {
      showLoginDialog();
      return;
    }

    axios.get(`${PROCESSOR_API_URL}/utils/template_list?page=${page}`, headers)
      .then((response) => {
        const generatedImageUrlName = response.data.activeGeneratedImage;
        setTemplateOptionList(response.data);
        toast.success(<div><FaCheck className='inline-flex mr-2'/> Templates loaded successfully!</div>, {
          position: "bottom-center",
          className: "custom-toast",
        });
      })
      .catch(() => {
        toast.error(<div><FaTimes /> Failed to load templates.</div>, {
          position: "bottom-center",
          className: "custom-toast",
        });
      });
  }

  const submitTemplateSearch = (query) => {
    const headers = getHeaders();
    if (!headers) {
      showLoginDialog();
      return;
    }

    axios.get(`${PROCESSOR_API_URL}/utils/search_template?query=${query}`, headers)
      .then((response) => {
        setTemplateOptionList(response.data);
        toast.success(<div><FaCheck className='inline-flex mr-2'/> Template search completed successfully!</div>, {
          position: "bottom-center",
          className: "custom-toast",
        });
      })
      .catch(() => {
        toast.error(<div><FaTimes /> Failed to search templates.</div>, {
          position: "bottom-center",
          className: "custom-toast",
        });
      });
  }

  const startMaskGenerationPoll = () => {
    const sessionId = id;
    axios.get(`${PROCESSOR_API_URL}/video_sessions/generate_mask_status?sessionId=${sessionId}`)
      .then((response) => {
        const maskGeneration = response.data;
        if (maskGeneration.status === 'COMPLETED') {
          const sessionData = maskGeneration.session;
          setVideoSessionDetails(sessionData);

          const layerData = sessionData.layers.find(layer => layer._id.toString() === currentLayer._id.toString());
          const segmentationData = layerData.segmentation;
          setSegmentationData(segmentationData);
          setCanvasActionLoading(false);
          toast.success(<div><FaCheck className='inline-flex mr-2'/> Mask generation completed successfully!</div>, {
            position: "bottom-center",
            className: "custom-toast",
          });
        } else {
          maskGenerationPollIntervalRef.current = setTimeout(() => {
            startMaskGenerationPoll();
          }, 1000);
        }
      })
      .catch(() => {
        toast.error(<div><FaTimes /> Failed to generate mask.</div>, {
          position: "bottom-center",
          className: "custom-toast",
        });
      });

  }

  useEffect(() => {
    if (currentCanvasAction === TOOLBAR_ACTION_VIEW.SHOW_SMART_SELECT_DISPLAY) {
      const headers = getHeaders();
      const originalStage = canvasRef.current.getStage();
      const clonedStage = originalStage.clone();
  
      clonedStage.find(node => node.id().startsWith('bbox_rect_')).forEach(node => {
        node.destroy();
      });
  
      clonedStage.find('Transformer').forEach(transformer => {
        transformer.destroy();
      });
      clonedStage.draw();
      const dataURL = clonedStage.toDataURL();
      const layerId = currentLayer._id.toString();
      const sessionPayload = {
        image: dataURL,
        sessionId: id,
        layerId: layerId
      };
  
      if (activeItemList.length === 0) {
        return;
      }
  
      if (activeItemList.length > 1) {
        const newItemId = `item_${activeItemList.length}`;
  
        const newItem = {
          src: dataURL,
          id: newItemId,
          type: 'image',
          x: 0,
          y: 0,
          width: STAGE_DIMENSIONS.width,
          height: STAGE_DIMENSIONS.height
        };
        const newItemList = [...activeItemList, newItem];
        setActiveItemList(newItemList);
        updateSessionLayerActiveItemList(newItemList);
      }
  
      setEnableSegmentationMask(false);
  
      axios.post(`${PROCESSOR_API_URL}/video_sessions/request_generate_mask`, sessionPayload, headers)
        .then(function (dataRes) {
          startMaskGenerationPoll();
          setEnableSegmentationMask(true);
          setCanvasActionLoading(true);
          toast.success(<div><FaCheck className='inline-flex mr-2'/> Mask generation request submitted successfully!</div>, {
            position: "bottom-center",
            className: "custom-toast",
          });
        })
        .catch(() => {
          toast.error(<div><FaTimes /> Failed to submit mask generation request.</div>, {
            position: "bottom-center",
            className: "custom-toast",
          });
        });
    }
  }, [currentCanvasAction]);

  const addImageToCanvas = (templateOption) => {
    const templateURL = `${PROCESSOR_API_URL}/templates/mm_final/${templateOption}`;
    const nImageList = [...activeItemList, { src: templateURL, id: `item_${nImageList.length}`, type: 'image' }];
    setActiveItemList(nImageList);
    setCurrentView(CURRENT_TOOLBAR_VIEW.SHOW_DEFAULT_DISPLAY);
    updateSessionLayerActiveItemList(nImageList);
  }

  const addTextBoxToCanvas = (payload) => {
    const nImageList = [...activeItemList, { ...payload, id: `item_${activeItemList.length}` }];
    setActiveItemList(nImageList);
    updateSessionLayerActiveItemList(nImageList);
  }

  const showMoveAction = () => { }

  const showResizeAction = () => { }

  const showSaveAction = () => { }

  const showUploadAction = () => {
    setCurrentView(CURRENT_TOOLBAR_VIEW.SHOW_DEFAULT_DISPLAY);
    openAlertDialog(<UploadImageDialog setUploadURL={setUploadURL} />);
  }

  const setSelectedShape = (shapeKey) => {
    
    let shapeConfig;
    if (shapeKey === 'dialog') {
      shapeConfig = {
        x: 512, y: 200, width: 100, height: 50, fillColor: fillColor,
        strokeColor: strokeColor, strokeWidth: strokeWidthValue,
        pointerX: 512, pointerY: 270,
        xRadius: 50, yRadius: 20
      }
    } else {
      shapeConfig = {
        x: 512, y: 200, width: 200, height: 200, fillColor: fillColor, radius: 70,
        strokeColor: strokeColor, strokeWidth: strokeWidthValue
      }
    }

    const currentLayerList = [...activeItemList, {
      'type': 'shape',
      'shape': shapeKey,
      'config': shapeConfig,
      'id': `item_${activeItemList.length}`
    }];
    
    setActiveItemList(currentLayerList);
    setSelectedId(`item_${activeItemList.length}`);
    updateSessionLayerActiveItemList(currentLayerList);
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
      imageNode.hue(value * 360);
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
      imageNode.hue(value * 360);
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
      imageNode.alpha(value);
    }

    stage.batchDraw();

    const updatedImageDataUrl = imageNode.toDataURL();

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
    updateSessionLayerActiveItemList(updatedItemList);
  };

  const handleBubbleChange = (newAttrs) => { };

  const combineCurrentLayerItems = async () => {
    const stage = canvasRef.current.getStage();
    const originalLayer = stage.getLayers()[0];

    stage.find('Transformer').forEach(transformer => {
      transformer.destroy();
    });

    const combinedLayer = new Konva.Layer();
    originalLayer.children.forEach(child => {
      combinedLayer.add(child.clone());
    });

    combinedLayer.draw();
    const combinedImageDataUrl = combinedLayer.toDataURL();

    const combinedItem = {
      src: combinedImageDataUrl,
      id: `item_0`,
      type: 'image',
      x: 0,
      y: 0,
      width: STAGE_DIMENSIONS.width,
      height: STAGE_DIMENSIONS.height,
    };

    const updatedItemList = [combinedItem];
    setActiveItemList(updatedItemList);

    updateSessionLayerActiveItemList(updatedItemList);
    setSelectedId('item_0');
  };

  const submitGenerateMusicRequest = (payload) => {
    const headers = getHeaders();
    if (!headers) {
      showLoginDialog();
      return;
    }
    payload.sessionId = id;
    axios.post(`${PROCESSOR_API_URL}/audio/request_generate_audio`, payload, headers)
      .then((response) => {
        const audioGeneration = response.data;
        setAudioGenerationPending(true);
        startAudioGenerationPoll(audioGeneration);
        toast.success(<div><FaCheck className='inline-flex mr-2'/> Audio generation request submitted successfully!</div>, {
          position: "bottom-center",
          className: "custom-toast",
        });
      })
      .catch(() => {
        toast.error(<div><FaTimes /> Failed to submit audio generation request.</div>, {
          position: "bottom-center",
          className: "custom-toast",
        });
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
  }

  const exportAnimationFrames = async (updatedItemList) => { };

  const submitAddTrackToProject = (index, payload) => {
    const headers = getHeaders();
    if (!headers) {
      showLoginDialog();
      return;
    }
    const sessionId = id;
    const audioLayers = videoSessionDetails.audioLayers;
    const latestAudioLayer = audioLayers[audioLayers.length - 1];
    const layerId = latestAudioLayer._id.toString();

    const requestPayload = {
      sessionId,
      trackIndex: index,
      audioLayerId: layerId,
      ...payload
    }

    axios.post(`${PROCESSOR_API_URL}/audio/add_track_to_project`, requestPayload, headers)
      .then((response) => {
        const sessionData = response.data;
        if (sessionData && sessionData.videoSession) {
          setVideoSessionDetails(sessionData.videoSession);
          setCurrentCanvasAction(TOOLBAR_ACTION_VIEW.SHOW_DEFAULT_DISPLAY);
          toast.success(<div><FaCheck className='inline-flex mr-2'/> Track added to project successfully!</div>, {
            position: "bottom-center",
            className: "custom-toast",
          });
        }
      })
      .catch(() => {
        toast.error(<div><FaTimes /> Failed to add track to project.</div>, {
          position: "bottom-center",
          className: "custom-toast",
        });
      });
  }

  useEffect(() => {
    if (cursorSelectOptionVisible) {
      const selectedId = activeItemList[activeItemList.length - 1].id;
      setSelectedId(`item_${selectedId + 1}`);
      setCurrentView(CURRENT_TOOLBAR_VIEW.SHOW_CURSOR_SELECT_DISPLAY)
    }
  }, [cursorSelectOptionVisible]);

  const selectImageFromLibrary = (imageItem) => {
    const newItemId = `item_${activeItemList.length}`;

    const newItem = {
      src: imageItem,
      id: newItemId,
      type: 'image',
      x: 0,
      y: 0,
      width: STAGE_DIMENSIONS.width,
      height: STAGE_DIMENSIONS.height
    };
    const newItemList = [...activeItemList, newItem];
    setActiveItemList(newItemList);
    updateSessionLayerActiveItemList(newItemList);
    setCurrentCanvasAction(TOOLBAR_ACTION_VIEW.SHOW_DEFAULT_DISPLAY);
    toast.success(<div><FaCheck className='inline-flex mr-2'/> Image added from library successfully!</div>, {
      position: "bottom-center",
      className: "custom-toast",
    });
  }

  const resetImageLibrary = () => {
    setCurrentCanvasAction(TOOLBAR_ACTION_VIEW.SHOW_DEFAULT_DISPLAY);
  }

  let canvasInternalLoading = <span />;
  if (canvasActionLoading) {
    canvasInternalLoading = (
      <div className='absolute t-0 pt-[150px] w-[1024px]  z-10'>
        <LoadingImageTransparent />
      </div>
    )
  }

  if (currentLayer && currentLayer.imageSession && currentLayer.imageSession.activeItemList) {
    if (currentLayer.imageSession.generationStatus === 'PENDING') {
      viewDisplay = <LoadingImage />;
    } else {
      if (currentCanvasAction === TOOLBAR_ACTION_VIEW.SHOW_LIBRARY_DISPLAY) {
        viewDisplay = (
          <ImageLibrary
            generationImages={generationImages}
            addImageItemToActiveList={addImageItemToActiveList}
            selectImageFromLibrary={selectImageFromLibrary}
            resetImageLibrary={resetImageLibrary}
          />
        )
      } else {
        viewDisplay = (
          <div>
            {canvasInternalLoading}
            <VideoCanvasContainer ref={canvasRef}
              maskGroupRef={maskGroupRef}
              sessionDetails={videoSessionDetails}
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
              updateSessionActiveItemList={updateSessionLayerActiveItemList}
              selectedLayerSelectShape={selectedLayerSelectShape}
              setCurrentView={setCurrentView}
              isLayerSeeking={isLayerSeeking}
              setEnableSegmentationMask={setEnableSegmentationMask}
              enableSegmentationMask={enableSegmentationMask}
              segmentationData={segmentationData}
              setSegmentationData={setSegmentationData}
            />
          </div>
        )
      }
    }
  }

  const submitUpdateSessionDefaults = (evt) => {
    evt.preventDefault();
    const formData = new FormData(evt.target);
    const headers = getHeaders();
    if (!headers) {
      showLoginDialog();
      return;
    }
    const payload = {
      sessionId: id,
      defaults: Object.fromEntries(formData),
    };
    axios.post(`${PROCESSOR_API_URL}/video_sessions/update_defaults`, payload, headers)
      .then((response) => {
        const updatedSession = response.data;
        const sessionData = updatedSession.videoSession;
        setVideoSessionDetails(sessionData);
        toast.success(<div><FaCheck className='inline-flex mr-2'/> Session defaults updated successfully!</div>, {
          position: "bottom-center",
          className: "custom-toast",
        });
      })
      .catch(() => {
        toast.error(<div><FaTimes /> Failed to update session defaults.</div>, {
          position: "bottom-center",
          className: "custom-toast",
        });
      });
  }

  const submitGenerateLayeredSpeechRequest = (data) => {

    const payload = {
      ...data,
      fontSize: 40,
      fontColor: '#f5f5f5',
      fontFamily: 'Times New Roman',
      backgroundColor: '#030712',
      videoSessionId: id,
    }

    


    const headers = getHeaders();

    axios.post(`${PROCESSOR_API_URL}/video_sessions/request_generate_layered_speech`, payload, headers).then((response) => {
      const sessionData = response.data;
     // setVideoSessionDetails(sessionData);
      toast.success(<div><FaCheck className='inline-flex mr-2'/> Layered speech generation request submitted successfully!</div>, {
        position: "bottom-center",
        className: "custom-toast",
      });
    }).catch((error) => {

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
          showAttestationDialog={showAttestationDialog}
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
          setSelectedId={setSelectedId}
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
          updateSessionLayerActiveItemListAnimations={updateSessionLayerActiveItemListAnimations}
          eraserOptionsVisible={eraserOptionsVisible}
          submitGenerateMusicRequest={submitGenerateMusicRequest}
          audioLayers={videoSessionDetails.audioLayers}
          audioGenerationPending={audioGenerationPending}
          submitAddTrackToProject={submitAddTrackToProject}
          combineCurrentLayerItems={combineCurrentLayerItems}
          showAddAudioToProjectDialog={showAddAudioToProjectDialog}
          sessionDetails={videoSessionDetails}
          submitUpdateSessionDefaults={submitUpdateSessionDefaults}
          hideItemInLayer={toggleHideItemInLayer}
          applyAnimationToAllLayers={applyAnimationToAllLayers}
          submitGenerateLayeredSpeechRequest={submitGenerateLayeredSpeechRequest}
        />
        <ToastContainer 
          position="bottom-center"
          autoClose={5000}
          hideProgressBar={true}
          newestOnTop={false}
          closeOnClick
          rtl={false}
          pauseOnFocusLoss
          draggable
          pauseOnHover
          className="custom-toast-container"
          toastClassName="custom-toast"
          bodyClassName="custom-toast-body"
        />

      </div>
    </div>
  )
}

