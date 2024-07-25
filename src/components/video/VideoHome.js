import React, { useEffect, useState, useRef } from 'react';
import CommonContainer from '../common/CommonContainer.tsx';
import FrameToolbar from './toolbars/FrameToolbar.js';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import { CURRENT_EDITOR_VIEW, FRAME_TOOLBAR_VIEW } from '../../constants/Types.ts';
import { getHeaders } from '../../utils/web.js';
import VideoEditorContainer from './VideoEditorContainer.js';
import AddAudioDialog from './util/AddAudioDialog.js';
import { useAlertDialog } from '../../contexts/AlertDialogContext.js';
import { debounce } from './util/debounce.js';
import AuthContainer from '../auth/AuthContainer.js';
import LoadingImage from './util/LoadingImage.js';
import AssistantHome from '../assistant/AssistantHome.js';
import { getImagePreloaderWorker } from './workers/imagePreloaderWorkerSingleton'; // Import the worker singleton

const PROCESSOR_API_URL = process.env.REACT_APP_PROCESSOR_API;

export default function VideoHome(props) {
  const [videoSessionDetails, setVideoSessionDetails] = useState(null);
  const [selectedLayerIndex, setSelectedLayerIndex] = useState(0);
  const [currentLayer, setCurrentLayer] = useState({});
  const [layers, setLayers] = useState([]);
  const [frames, setFrames] = useState([]);
  const { openAlertDialog, closeAlertDialog } = useAlertDialog();
  const [currentLayerSeek, setCurrentLayerSeek] = useState(0);
  const [totalDuration, setTotalDuration] = useState(0);
  const [isLayerGenerationPending, setIsLayerGenerationPending] = useState(false);
  const [audioFileTrack, setAudioFileTrack] = useState(null);
  const [currentEditorView, setCurrentEditorView] = useState(CURRENT_EDITOR_VIEW.VIEW);
  const [downloadVideoDisplay, setDownloadVideoDisplay] = useState(false);
  const [renderedVideoPath, setRenderedVideoPath] = useState(null);
  const [activeItemList, setActiveItemList] = useState([]);
  const [isLayerSeeking, setIsLayerSeeking] = useState(false);
  const [isVideoGenerating, setIsVideoGenerating] = useState(false);
  const [frameToolbarView, setFrameToolbarView] = useState(FRAME_TOOLBAR_VIEW.DEFAULT);
  const [audioLayers, setAudioLayers] = useState([]);
  const [isAudioLayerDirty, setIsAudioLayerDirty] = useState(false);
  const [generationImages, setGenerationImages] = useState([]);
  const [layerListRequestAdded, setLayerListRequestAdded] = useState(false);
  const [sessionMessages, setSessionMessages] = useState([]);
  const [isCanvasDirty, setIsCanvasDirty] = useState(false);
  const [isAssistantQueryGenerating, setIsAssistantQueryGenerating] = useState(false);

  let { id } = useParams();

  const showLoginDialog = () => {
    const loginComponent = (
      <AuthContainer />
    );
    openAlertDialog(loginComponent);
  };

  useEffect(() => {
    if (layerListRequestAdded) {
      pollForLayersUpdate();
    }
  }, [layerListRequestAdded, layers]);

  useEffect(() => {
    setVideoSessionDetails(null);
    setSelectedLayerIndex(0);
    setCurrentLayer({});
    setLayers([]);
    setFrames([]);
    setCurrentLayerSeek(0);
    setTotalDuration(0);
    setIsLayerGenerationPending(false);
    setAudioFileTrack(null);
    setCurrentEditorView(CURRENT_EDITOR_VIEW.VIEW);
    setDownloadVideoDisplay(false);
    setRenderedVideoPath(null);
    setActiveItemList([]);
    setIsLayerSeeking(false);
    setIsVideoGenerating(false);
    setFrameToolbarView(FRAME_TOOLBAR_VIEW.DEFAULT);
    setAudioLayers([]);
    setIsAudioLayerDirty(false);
    setGenerationImages([]);
    setLayerListRequestAdded(false);
    setIsCanvasDirty(false);
  }, [id]);

  useEffect(() => {
    const headers = getHeaders();

    axios.get(`${PROCESSOR_API_URL}/video_sessions/session_details?id=${id}`, headers).then((dataRes) => {
      const sessionDetails = dataRes.data;
      if (sessionDetails.audio) {
        const audioFileTrack = `${PROCESSOR_API_URL}/video/audio/${sessionDetails.audio}`;
        setAudioFileTrack(audioFileTrack);
      }
      setVideoSessionDetails(sessionDetails);
      const layers = sessionDetails.layers;
      setLayers(layers);
      setCurrentLayer(layers[0]);
      setSelectedLayerIndex(0);
      let totalDuration = 0;
      layers.forEach(layer => {
        totalDuration += layer.duration;
      });
      setTotalDuration(totalDuration);
      let isLayerPending = false;
      layers.forEach(layer => {
        if (layer.imageSession.generationStatus === 'PENDING') {
          isLayerPending = true;
        }
      });
      setIsLayerGenerationPending(isLayerPending);
      setGenerationImages(sessionDetails.generations);
      setSessionMessages(sessionDetails.sessionMessages);
    });
  }, [id]);

  useEffect(() => {
    if (!currentLayer) {
      return;
    }
    const fps = 30;
    const currentLayerDuration = currentLayer.duration;
    const currentLayerDurationOffset = currentLayer.durationOffset;
    const frameDurationMs = 1000 / fps;
    const currentLayerStartFrame = Math.floor(currentLayerDurationOffset * fps);
    const currentLayerEndFrame = Math.floor((currentLayerDuration + currentLayerDurationOffset) * fps);

    if (currentLayerSeek > currentLayerEndFrame) {
      const nextLayerIndex = layers.findIndex(layer => layer._id === currentLayer._id) + 1;
      if (nextLayerIndex < layers.length) {
        setCurrentLayer(layers[nextLayerIndex]);
        setSelectedLayerIndex(nextLayerIndex);
      } else {
        console.log("No more layers to switch to");
      }
    }

    if (currentLayerSeek < currentLayerStartFrame) {
      const prevLayerIndex = layers.findIndex(layer => layer._id === currentLayer._id) - 1;
      if (prevLayerIndex >= 0) {
        setCurrentLayer(layers[prevLayerIndex]);
        setSelectedLayerIndex(prevLayerIndex);
      } else {
        console.log("Already at the first layer");
      }
    }

  }, [currentLayerSeek, layers]);

  useEffect(() => {
    if (currentLayer && currentLayer.imageSession && currentLayer.imageSession.activeItemList) {
      const activeList = currentLayer.imageSession.activeItemList.map(function (item) {
        return { ...item, isHidden: false };
      });
      setActiveItemList(activeList);
      const newLayerSeek = Math.floor(currentLayer.durationOffset * 30);
      setCurrentLayerSeek(newLayerSeek);
    } else {
      setActiveItemList([]);
    }
  }, [currentLayer]);

  // Image Preloading Worker Setup
  useEffect(() => {
    if (layers.length > 0) {
      const imagePreloaderWorker = getImagePreloaderWorker();

      imagePreloaderWorker.onmessage = function (e) {
        console.log('Images preloaded:', e.data.fetchedImages);
      };

      imagePreloaderWorker.postMessage({ layers });

      return () => {
        imagePreloaderWorker.terminate();
      };
    }
  }, [layers]);


  const toggleHideItemInLayer = (itemId) => {
    const updatedActiveItemList = activeItemList.map(item => {
      if (item.id === itemId) {
        return {
          ...item,
          isHidden: !item.isHidden,
        };
      }
      return item;
    });
    setActiveItemList(updatedActiveItemList);
  }

  useEffect(() => {
    if (isLayerGenerationPending) {
      pollForLayersUpdate();
    }
  }, [isLayerGenerationPending]);


  useEffect(() => {
    if (currentLayer && currentLayer.imageSession && currentLayer.imageSession.generationStatus === 'PENDING') {
      const currentLayerListData = layers.find((layer) => (layer._id.toString() === currentLayer._id.toString()));
      if (currentLayerListData.imageSession.generationStatus === 'COMPLETED') {
        setCurrentLayer(currentLayerListData);
      }
    }

  }, [layers, currentLayer]);

  const pollForLayersUpdate = () => {
    const headers = getHeaders();
    if (!headers) {
      showLoginDialog();
      return;
    }

    const timer = setInterval(() => {
      axios.post(`${PROCESSOR_API_URL}/video_sessions/refresh_session_layers`, { id: id }, headers).then((dataRes) => {
        const frameResponse = dataRes.data;
        if (frameResponse) {
          const newLayers = frameResponse.layers;
          let layersUpdated = false;
          let isGenerationPending = false;
          let updatedLayers = [...layers];

          for (let i = 0; i < newLayers.length; i++) {
            if (!layers[i]) {
              continue;
            }

            if (layers[i].imageSession && layers[i].imageSession.generationStatus !== newLayers[i].imageSession.generationStatus) {
              updatedLayers[i] = newLayers[i];
              layersUpdated = true;
            }
            if (layers[i].imageSession && newLayers[i].imageSession.generationStatus === 'PENDING') {
              isGenerationPending = true;
            }
          }

          if (layersUpdated) {
            setLayers(updatedLayers);
            let isCurrentLayerPending = currentLayer.imageSession.generationStatus === 'PENDING';
            if (isCurrentLayerPending) {
              const newCurrentLayer = updatedLayers.find(layer => layer._id === currentLayer._id);
              if (newCurrentLayer.imageSession.generationStatus === 'COMPLETED') {
                // setCurrentLayer(newCurrentLayer);
              }
            }
          }

          if (!isGenerationPending) {
            clearInterval(timer);
          }
        }
      });
    }, 1000);
  }


  const startVideoRenderPoll = () => {
    const headers = getHeaders();
    if (!headers) {
      showLoginDialog();
      return;
    }

    const timer = setInterval(() => {
      axios.post(`${PROCESSOR_API_URL}/video_sessions/get_render_video_status`, { id: id }, headers).then((dataRes) => {
        const renderData = dataRes.data;
        const renderStatus = renderData.status;
        if (renderStatus === 'COMPLETED') {
          clearInterval(timer);
          const videoLink = renderData.session.videoLink;
          setRenderedVideoPath(`${PROCESSOR_API_URL}/${videoLink}`);
          setDownloadVideoDisplay(true);
          setIsVideoGenerating(false);
          setIsCanvasDirty(false);
        }
      });
    }, 1000);
  }

  useEffect(() => {
    if (videoSessionDetails && videoSessionDetails.audioLayers) {
      const audioLayerMap = videoSessionDetails.audioLayers.filter(layer => layer && layer.isEnabled).map(audioLayer => ({
        isSelected: false,
        ...audioLayer
      }));
      setAudioLayers(audioLayerMap);
    }
  }, [videoSessionDetails]);

  const submitRenderVideo = () => {
    const headers = getHeaders();
    if (!headers) {
      showLoginDialog();
      return;
    }

    axios.post(`${PROCESSOR_API_URL}/video_sessions/request_render_video`, { id: id }, headers).then((dataRes) => {
      setIsVideoGenerating(true);
      startVideoRenderPoll();
    });
  }

  const setLayerDuration = (value, index) => {
    const newLayers = layers;
    newLayers[index].duration = parseFloat(value);
    setLayers(newLayers);
    let totalDuration = 0;
    newLayers.forEach(layer => {
      totalDuration += layer.duration;
    });
    setTotalDuration(totalDuration);
  }

  useEffect(() => {
    let totalDuration = 0;
    if (!layers) {
      return;
    }
    layers.forEach(layer => {
      totalDuration += layer.duration;
    });
    setTotalDuration(totalDuration);
  }, [layers]);

  if (!videoSessionDetails) {
    return <LoadingImage />;
  }

  const fps = 30;
  const frameDurationMs = 1000 / fps;
  const totalDurationInFrames = totalDuration * fps;

  const setNewSeek = (newSeek) => {
    setCurrentLayerSeek(newSeek);
  };

  const addAudioToProject = (file) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const dataURL = reader.result;
      const headers = getHeaders();
      if (!headers) {
        showLoginDialog();
        return;
      }

      const payload = {
        id,
        dataURL,
      }
      axios.post(`${PROCESSOR_API_URL}/video_sessions/add_audio`, payload, headers)
        .then(response => {
          const sessionData = response.data;
          setVideoSessionDetails(sessionData);
          if (sessionData.audio) {
            const audioFileTrack = `${PROCESSOR_API_URL}/video/audio/${sessionData.audio}`;
            setAudioFileTrack(audioFileTrack);
          }
          closeAlertDialog();
        })
        .catch(error => {
          console.error('Error adding audio to project:', error);
        });
    };
    reader.readAsDataURL(file);
  }

  const showAddAudioToProjectDialog = () => {
    openAlertDialog(
      <AddAudioDialog addAudioToProject={addAudioToProject} />,
    )
  }

  const setSelectedLayer = (layer) => {
    const index = layers.findIndex(l => l._id === layer._id);
    setSelectedLayerIndex(index);
    setCurrentLayer(layer);
  }

  const setFrameEditDisplay = (frame) => {
    const layerID = frame.layerId;
    const layerItem = layers.find(layer => layer._id === layerID);
    setSelectedLayer(layerItem);
    setCurrentEditorView(CURRENT_EDITOR_VIEW.EDIT);
  }

  const toggleFrameDisplayType = () => {
    if (currentEditorView === CURRENT_EDITOR_VIEW.VIEW) {
      setCurrentEditorView(CURRENT_EDITOR_VIEW.EDIT);
    } else {
      setCurrentEditorView(CURRENT_EDITOR_VIEW.VIEW);
    }
  }

  const startPlayFrames = () => {
    const audio = audioFileTrack ? new Audio(audioFileTrack) : null;
    if (audio) {
      audio.load();
    }

    let currentFrameIndex = 0;
    const frameRate = 1000 / 30;

    const updateFrame = () => {
      if (currentFrameIndex >= frames.length) {
        clearInterval(playbackInterval);
        if (audio) {
          audio.pause();
          audio.currentTime = 0;
        }
        return;
      }
      setCurrentLayerSeek(currentFrameIndex);
      currentFrameIndex++;
    };

    if (audio) {
      audio.play();
    }

    const playbackInterval = setInterval(updateFrame, frameRate);
  };

  const debouncedUpdateSessionLayerActiveItemList = debounce((newActiveItemList) => {
    const headers = getHeaders();
    if (!headers) {
      showLoginDialog();
      return;
    }

    const reqPayload = {
      sessionId: id,
      activeItemList: newActiveItemList,
      layerId: currentLayer._id.toString(),
    };

    axios.post(`${PROCESSOR_API_URL}/video_sessions/update_active_item_list`, reqPayload, headers).then((response) => {
      const videoSessionData = response.data;
      const updatedItemList = videoSessionData.activeItemList;
      if (updatedItemList && updatedItemList.length > 0) {
        setActiveItemList(updatedItemList);
        setIsCanvasDirty(true);
      }
    });
  }, 5);

  const updateSessionLayerActiveItemList = (newActiveItemList) => {
    //setActiveItemList(newActiveItemList);
    if (currentEditorView !== CURRENT_EDITOR_VIEW.SHOW_ANIMATE_DISPLAY) {
      debouncedUpdateSessionLayerActiveItemList(newActiveItemList);
    }
  };

  const updateSessionLayerActiveItemListAnimations = (newActiveItemList) => {
    //setActiveItemList(newActiveItemList);
    if (currentEditorView !== CURRENT_EDITOR_VIEW.SHOW_ANIMATE_DISPLAY) {
      debouncedUpdateSessionLayerActiveItemList(newActiveItemList);
    }
  };

  const showAudioTrackView = () => {
    if (frameToolbarView === FRAME_TOOLBAR_VIEW.AUDIO) {
      setFrameToolbarView(FRAME_TOOLBAR_VIEW.DEFAULT);
    } else {
      setFrameToolbarView(FRAME_TOOLBAR_VIEW.AUDIO);
    }
  }

  const updateAudioLayer = (audioLayerId, startTime, duration) => {
    const updatedAudioLayers = audioLayers.map(audioLayer => {
      if (audioLayer._id.toString() === audioLayerId.toString()) {
        audioLayer.startTime = startTime;
        audioLayer.isSelected = true;
      } else {
        audioLayer.isSelected = false;
      }
      return audioLayer;
    });

    setAudioLayers(updatedAudioLayers);
    setIsAudioLayerDirty(true);

    const headers = getHeaders();
    if (!headers) {
      showLoginDialog();
      return;
    }

    const reqPayload = {
      sessionId: id,
      audioLayers: updatedAudioLayers,
    };
    axios.post(`${PROCESSOR_API_URL}/video_sessions/update_audio_layers`, reqPayload, headers).then(() => {
      setIsAudioLayerDirty(false);
    });
  };

  const handleVolumeChange = (e) => {
    const selectedAudioTrack = audioLayers.find(audioLayer => audioLayer.isSelected);
    const newVolume = parseFloat(e.target.value);
    const updatedAudioLayer = {
      ...selectedAudioTrack,
      volume: newVolume,
    };
    setAudioLayers(audioLayers.map(audioLayer => {
      if (audioLayer._id.toString() === updatedAudioLayer._id.toString()) {
        return updatedAudioLayer;
      }
      return audioLayer;
    }));
  };

  const removeAudioLayer = (audioLayer) => {
    const updatedAudioLayers = audioLayers.filter(audioLayer => audioLayer._id.toString() !== audioLayer._id.toString());
    setAudioLayers(updatedAudioLayers);
    setIsAudioLayerDirty(true);

    const headers = getHeaders();
    if (!headers) {
      showLoginDialog();
      return;
    }

    const reqPayload = {
      sessionId: id,
      audioLayers: updatedAudioLayers,
    };
    axios.post(`${PROCESSOR_API_URL}/video_sessions/update_audio_layers`, reqPayload, headers).then(() => {
      setIsAudioLayerDirty(false);
    });
  }

  const updateChangesToActiveLayers = (e) => {
    e.preventDefault();
    const headers = getHeaders();
    if (!headers) {
      showLoginDialog();
      return;
    }

    const reqPayload = {
      sessionId: id,
      audioLayers: audioLayers,
    };
    axios.post(`${PROCESSOR_API_URL}/video_sessions/update_audio_layers`, reqPayload, headers).then(() => {
      setIsAudioLayerDirty(false);
    });
  }

  const addLayerToComposition = () => {
    const headers = getHeaders();
    if (!headers) {
      showLoginDialog();
      return;
    }

    const payload = {
      sessionId: id,
      duration: 2,
    };
    axios.post(`${PROCESSOR_API_URL}/video_sessions/add_layer`, payload, headers).then((dataRes) => {
      const resData = dataRes.data;
      const videoSessionDetails = resData.videoSession;
      const newLayers = videoSessionDetails.layers;
      setLayers(newLayers);
      setCurrentLayer(newLayers[newLayers.length - 1]);
      setSelectedLayerIndex(newLayers.length - 1);
      setIsCanvasDirty(true);
    });
  }

  const copyCurrentLayerBelow = () => {
    const headers = getHeaders();
    if (!headers) {
      showLoginDialog();
      return;
    }

    const newLayer = { ...currentLayer, _id: undefined };

    const currentIndex = layers.findIndex((layer) => layer._id === currentLayer._id);
    const newLayerIndex = currentIndex + 1;

    const payload = {
      sessionId: id,
      newLayer,
      index: newLayerIndex,
    };

    axios.post(`${PROCESSOR_API_URL}/video_sessions/copy_layer`, payload, headers).then((dataRes) => {
      const resData = dataRes.data;
      const videoSessionDetails = resData.videoSession;
      const newLayers = videoSessionDetails.layers;

      setLayers(newLayers);
      setSelectedLayerIndex(newLayerIndex);
      setCurrentLayer(newLayers[newLayerIndex]);
      setIsCanvasDirty(true);
    });
  };

  const updateSessionLayer = (newLayer) => {
    const headers = getHeaders();
    if (!headers) {
      showLoginDialog();
      return;
    }

    const reqPayload = {
      sessionId: id,
      layer: newLayer
    };

    axios.post(`${PROCESSOR_API_URL}/video_sessions/update_layer`, reqPayload, headers).then((response) => {
      const videoSessionData = response.data;
      const updatedLayer = videoSessionData.layers.find(layer => layer._id === newLayer._id);
      if (updatedLayer) {
        const updatedLayers = videoSessionData.layers;
        setLayers(updatedLayers);
        setCurrentLayer(updatedLayer);
        setIsCanvasDirty(true);
      }
    });
  } // Adjust the delay as needed

  const removeSessionLayer = (layerIndex) => {
    const headers = getHeaders();
    if (!headers) {
      showLoginDialog();
      return;
    }

    const layerId = layers[layerIndex]._id.toString();
    const reqPayload = {
      sessionId: id,
      layerId: layerId
    }
    axios.post(`${PROCESSOR_API_URL}/video_sessions/remove_layer`, reqPayload, headers).then((response) => {
      const videoSessionDataResponse = response.data;
      const videoSessionData = videoSessionDataResponse.videoSession;
      const updatedLayers = videoSessionData.layers;

      setLayers(updatedLayers);
      setCurrentLayer(updatedLayers[0]);
      setSelectedLayerIndex(0);
      setIsCanvasDirty(true);
    });
  }

  const updateCurrentActiveLayer = (imageItem) => {
    const newActiveItemList = activeItemList.concat(imageItem);
    debouncedUpdateSessionLayerActiveItemList();
  }

  const addLayersViaPromptList = (payload) => {
    const headers = getHeaders();
    if (!headers) {
      showLoginDialog();
      return;
    }

    const { promptList, duration } = payload;

    const reqPayload = {
      sessionId: id,
      promptList: promptList,
      duration: duration,
    };

    setLayerListRequestAdded(false);
    axios.post(`${PROCESSOR_API_URL}/video_sessions/add_layers_via_prompt_list`, reqPayload, headers).then((response) => {
      const videoSessionDataResponse = response.data;
      const videoSessionData = videoSessionDataResponse.videoSession;
      const previousLength = layers.length; // Calculate the previous length

      setVideoSessionDetails(videoSessionData);
      const updatedLayers = videoSessionData.layers;
      setLayers(updatedLayers);
      setLayerListRequestAdded(true);
      setSelectedLayerIndex(previousLength); // Set selected index to the first item of the new prompt list
      setCurrentLayer(updatedLayers[previousLength + 1]);
      setIsCanvasDirty(true);
    });
  }


  const updateLayerMask = (layerData) => {
    let layerDataNew = Object.assign({}, currentLayer, { segmentation: layerData.segmentation })
    setCurrentLayer(layerDataNew);
  }

  const resetLayerMask = () => {
    let layerDataNew = Object.assign({}, currentLayer, { segmentation: null })
    // setCurrentLayer(layerDataNew);
  }

  const updateCurrentLayer = (layerData) => {
    const layerId = layerData._id.toString();
    const updatedLayers = layers.map(layer => {
      if (layer._id.toString() === layerId) {
        return layerData;
      }
      return layer;
    });
    setLayers(updatedLayers);
    setCurrentLayer(layerData);
  }

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
    setIsAssistantQueryGenerating(true);
    const headers = getHeaders();
    axios.post(`${PROCESSOR_API_URL}/assistants/submit_assistant_query`, { id: id, query: query }, headers).then((response) => {
      const assistantResponse = response.data;
      startAssistantQueryPoll();
    }).catch(function (err) {
      setIsAssistantQueryGenerating(false);
    });
  }

  const applyAnimationToAllLayers = (animationData, animationType) => {
    const updatedLayers = layers.map(layer => {
      if (layer.imageSession && layer.imageSession.activeItemList) {
        const updatedActiveItemList = layer.imageSession.activeItemList.map(item => {
          if (item.type === 'image') {
            let animations = item.animations || [];
            const existingAnimationIndex = animations.findIndex(animation => animation.type === animationType);
            if (existingAnimationIndex !== -1) {
              animations[existingAnimationIndex] = {
                type: animationType,
                params: animationData
              };
            } else {
              animations.push({
                type: animationType,
                params: animationData
              });
            }
            return {
              ...item,
              animations: animations
            };
          }
          return item;
        });
        return {
          ...layer,
          imageSession: {
            ...layer.imageSession,
            activeItemList: updatedActiveItemList
          }
        };
      }
      return layer;
    });

    setLayers(updatedLayers);
    updateSessionLayersOnServer(updatedLayers);
  };

  const updateSessionLayersOnServer = (updatedLayers) => {
    const headers = getHeaders();
    if (!headers) {
      showLoginDialog();
      return;
    }

    const reqPayload = {
      sessionId: id,
      layers: updatedLayers
    };

    axios.post(`${PROCESSOR_API_URL}/video_sessions/update_layers`, reqPayload, headers).then((response) => {
      const videoSessionData = response.data;
      setLayers(videoSessionData.layers);
      setIsCanvasDirty(true);
    });
  };

  return (
    <CommonContainer>
      <div className='m-auto'>
        <div className='block'>
          <div className='w-[14%] inline-block'>
            <FrameToolbar
              layers={layers}
              setSelectedLayerIndex={setSelectedLayerIndex}
              currentLayer={currentLayer}
              setCurrentLayer={setCurrentLayer}
              setLayerDuration={setLayerDuration}
              selectedLayerIndex={selectedLayerIndex}
              setCurrentLayerSeek={setNewSeek}
              currentLayerSeek={currentLayerSeek}
              submitRenderVideo={submitRenderVideo}
              totalDuration={totalDuration}
              showAddAudioToProjectDialog={showAddAudioToProjectDialog}
              audioFileTrack={audioFileTrack}
              setSelectedLayer={setSelectedLayer}
              startPlayFrames={startPlayFrames}
              renderedVideoPath={renderedVideoPath}
              downloadVideoDisplay={downloadVideoDisplay}
              sessionId={id}
              updateSessionLayerActiveItemList={updateSessionLayerActiveItemList}
              updateSessionLayer={updateSessionLayer}
              setIsLayerSeeking={setIsLayerSeeking}
              isVideoGenerating={isVideoGenerating}
              showAudioTrackView={showAudioTrackView}
              frameToolbarView={frameToolbarView}
              audioLayers={audioLayers}
              updateAudioLayer={updateAudioLayer}
              isAudioLayerDirty={isAudioLayerDirty}
              removeAudioLayer={removeAudioLayer}
              handleVolumeChange={handleVolumeChange}
              updateChangesToActiveLayers={updateChangesToActiveLayers}
              addLayerToComposition={addLayerToComposition}
              copyCurrentLayerBelow={copyCurrentLayerBelow}
              removeSessionLayer={removeSessionLayer}
              addLayersViaPromptList={addLayersViaPromptList}
              defaultSceneDuration={videoSessionDetails.defaultSceneDuration}
              isCanvasDirty={isCanvasDirty}
            />
          </div>
          <div className='w-[86%] bg-cyber-black inline-block'>
            <VideoEditorContainer
              selectedLayerIndex={selectedLayerIndex}
              layers={layers}
              key={`layer_canvas_${selectedLayerIndex}`}
              currentLayerSeek={currentLayerSeek}
              currentEditorView={currentEditorView}
              setCurrentEditorView={setCurrentEditorView}
              toggleFrameDisplayType={toggleFrameDisplayType}
              setFrameEditDisplay={setFrameEditDisplay}
              currentLayer={currentLayer}
              updateSessionLayerActiveItemList={updateSessionLayerActiveItemList}
              updateSessionLayerActiveItemListAnimations={updateSessionLayerActiveItemListAnimations}
              activeItemList={activeItemList}
              setActiveItemList={setActiveItemList}
              isLayerSeeking={isLayerSeeking}
              showAddAudioToProjectDialog={showAddAudioToProjectDialog}
              generationImages={generationImages}
              updateCurrentActiveLayer={updateCurrentActiveLayer}
              videoSessionDetails={videoSessionDetails}
              setVideoSessionDetails={setVideoSessionDetails}
              toggleHideItemInLayer={toggleHideItemInLayer}
              updateLayerMask={updateLayerMask}
              resetLayerMask={resetLayerMask}
              pollForLayersUpdate={pollForLayersUpdate}
              setIsCanvasDirty={setIsCanvasDirty}
              updateCurrentLayer={updateCurrentLayer}
              applyAnimationToAllLayers={applyAnimationToAllLayers}
            />
          </div>
          <AssistantHome
            submitAssistantQuery={submitAssistantQuery}
            sessionMessages={sessionMessages}
            isAssistantQueryGenerating={isAssistantQueryGenerating} />
        </div>
      </div>
    </CommonContainer>
  );
}
