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
  let { id } = useParams();
  const activeItemListRef = useRef(activeItemList);

  useEffect(() => {
    activeItemListRef.current = activeItemList;
  }, [activeItemList]);

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
      let sessionGenerationImages = [];
      layers.forEach(layer => {
        sessionGenerationImages = sessionGenerationImages.concat(layer.imageSession.generations);
        if (layer.imageSession.generationStatus === 'PENDING') {
          isLayerPending = true;
        }
      });
      setIsLayerGenerationPending(isLayerPending);
      setGenerationImages(sessionGenerationImages);
    });
  }, [id]);

  useEffect(() => {


    if (!currentLayer.imageSession || currentLayer.imageSession.activeItemList.length === 0) {
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
      } else {
        console.log("No more layers to switch to");
      }
    }

    if (currentLayerSeek < currentLayerStartFrame) {
      const prevLayerIndex = layers.findIndex(layer => layer._id === currentLayer._id) - 1;
      if (prevLayerIndex >= 0) {
        setCurrentLayer(layers[prevLayerIndex]);
      } else {
        console.log("Already at the first layer");
      }
    }
  }, [currentLayerSeek, layers]);

  useEffect(() => {

    if (currentLayer && currentLayer.imageSession && currentLayer.imageSession.activeItemList) {
      const activeList = currentLayer.imageSession.activeItemList;
      setActiveItemList(activeList);
      const newLayerSeek = Math.floor(currentLayer.durationOffset * 30);
      setCurrentLayerSeek(newLayerSeek);
    } else {
      setActiveItemList([]);
    }
  }, [currentLayer]);

  useEffect(() => {
    if (isLayerGenerationPending) {
      pollForLayersUpdate();
    }
  }, [isLayerGenerationPending]);

  const pollForLayersUpdate = () => {
    const timer = setInterval(() => {
      axios.post(`${PROCESSOR_API_URL}/video_sessions/refresh_session_layers`, { id: id }, getHeaders()).then((dataRes) => {
        const frameResponse = dataRes.data;
        if (frameResponse) {
          const newLayers = frameResponse.layers;
          let layersUpdated = false;
          let isGenerationPending = false;
          for (let i = 0; i < newLayers.length; i++) {
            if (layers[i].imageSession.generationStatus !== newLayers[i].imageSession.generationStatus) {
              layersUpdated = true;
            }
            if (newLayers[i].imageSession.generationStatus === 'PENDING') {
              isGenerationPending = true;
            }
          }
          if (layersUpdated) {
            setLayers(newLayers);
            let isCurrentLayerPending = currentLayer.imageSession.generationStatus === 'PENDING';
            if (isCurrentLayerPending) {
              setCurrentLayer(newLayers[selectedLayerIndex]);
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
    const timer = setInterval(() => {
      axios.post(`${PROCESSOR_API_URL}/video_sessions/get_render_video_status`, { id: id }, getHeaders()).then((dataRes) => {
        const renderData = dataRes.data;
        const renderStatus = renderData.status;
        if (renderStatus === 'COMPLETED') {
          clearInterval(timer);
          const videoLink = renderData.session.videoLink;
          setRenderedVideoPath(`${PROCESSOR_API_URL}/${videoLink}`);
          setDownloadVideoDisplay(true);
          setIsVideoGenerating(false);
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
    axios.post(`${PROCESSOR_API_URL}/video_sessions/request_render_video`, { id: id }, getHeaders()).then((dataRes) => {
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
    layers.forEach(layer => {
      totalDuration += layer.duration;
    });
    setTotalDuration(totalDuration);
  }, [layers]);

  if (!videoSessionDetails) {
    return <div>Loading...</div>;
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

    console.log("SETTING SLEECTED LAYER");


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

  const debouncedUpdateSessionLayerActiveItemList = debounce(() => {
    console.log("Updating active item list after debounce");
    const headers = getHeaders();
    const reqPayload = {
      sessionId: id,
      activeItemList: activeItemListRef.current,
      layerId: currentLayer._id.toString(),
    };
   
    axios.post(`${PROCESSOR_API_URL}/video_sessions/update_active_item_list`, reqPayload, headers).then((response) => {
      const videoSessionData = response.data;
      const updatedItemList = videoSessionData.activeItemList;
      if (updatedItemList && updatedItemList.length > 0) {
        setActiveItemList(updatedItemList);
      }
    });
  }, 50);

  const updateSessionLayerActiveItemList = (newActiveItemList) => {
    setActiveItemList(newActiveItemList);
    debouncedUpdateSessionLayerActiveItemList();
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
    });
  }

  const copyCurrentLayerBelow = () => {
    const headers = getHeaders();
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
    });
  };

  const updateSessionLayer =(newLayer) => {
    console.log("UPDATING SESSION LAYER YY");

    const headers = getHeaders();

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
      }
    });
  } // Adjust the delay as needed

  const removeSessionLayer = (layerIndex) => {
    const headers = getHeaders();
    const layerId = layers[layerIndex]._id.toString();
    const reqPayload = {
      sessionId: id,
      layerId: layerId
    }
    axios.post(`${PROCESSOR_API_URL}/video_sessions/remove_layer`, reqPayload, headers).then((response) => {
      const videoSessionData = response.data;
      const updatedLayers = videoSessionData.layers;
      setSelectedLayerIndex(0);
      setLayers(updatedLayers);
    });
  }
  
  const updateCurrentActiveLayer = (imageItem) => {
    console.log(imageItem);
    
    const newActiveItemList = activeItemList.concat(imageItem);
    setActiveItemList(newActiveItemList);
    debouncedUpdateSessionLayerActiveItemList();


  }

  const addLayersViaPromptList = (promptList) => {
    const headers = getHeaders();
    const reqPayload = {
      sessionId: id,
      promptList: promptList,
    };
    console.log(reqPayload);

    axios.post(`${PROCESSOR_API_URL}/video_sessions/add_layers_via_prompt_list`, reqPayload, headers).then((response) => {
      const videoSessionDataResponse = response.data;

      console.log(videoSessionDataResponse);

      const videoSessionData = videoSessionDataResponse.videoSession;

      setVideoSessionDetails(videoSessionData);

      const updatedLayers = videoSessionData.layers;
      setLayers(updatedLayers);
      setCurrentLayer(updatedLayers[updatedLayers.length - 1]);
    });
  }


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
              updateSessionLayer={updateSessionLayer} // Add this line
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
              removeSessionLayer={removeSessionLayer} // Add this line
              addLayersViaPromptList={addLayersViaPromptList}
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
              activeItemList={activeItemList}
              setActiveItemList={setActiveItemList}
              isLayerSeeking={isLayerSeeking}
              showAddAudioToProjectDialog={showAddAudioToProjectDialog}
              generationImages={generationImages}
              updateCurrentActiveLayer={updateCurrentActiveLayer}
              videoSessionDetails={videoSessionDetails}
              
            />
          </div>
        </div>
      </div>
    </CommonContainer>
  )
}
