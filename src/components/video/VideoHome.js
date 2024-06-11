import React, { useEffect, useState } from 'react';
import CommonContainer from '../common/CommonContainer.tsx';

import FrameToolbar from './toolbars/FrameToolbar.js';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import { CURRENT_EDITOR_VIEW } from '../../constants/Types.ts';

import { getHeaders } from '../../utils/web.js';
import VideoEditorContainer from './VideoEditorContainer.js';
import FrameDisplay from './FrameDisplay.js';
import AddAudioDialog from './util/AddAudioDialog.js';
import { useAlertDialog } from '../../contexts/AlertDialogContext.js';
import { Stage, Layer } from 'react-konva';

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

  const [ isVideoGenerating, setIsVideoGenerating ] = useState(false);

  let { id } = useParams();

  useEffect(() => {
    const headers = getHeaders();

    axios.get(`${PROCESSOR_API_URL}/video_sessions/session_details?id=${id}`, headers).then(function (dataRes) {
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
    });
  }, []);



  useEffect(() => {
    if (!currentLayer.imageSession) {
      return;
    }

 
    const fps = 30;
    const currentLayerDuration = currentLayer.duration;
    const currentLayerDurationOffset = currentLayer.durationOffset;
    const frameDurationMs = 1000 / fps; // Duration of each frame in milliseconds
    const currentLayerStartFrame = Math.floor(currentLayerDurationOffset * fps);
    const currentLayerEndFrame = Math.floor((currentLayerDuration + currentLayerDurationOffset) * fps);
    
    // Check if currentLayerSeek exceeds the end of the current layer
    if (currentLayerSeek > currentLayerEndFrame) {
      const nextLayerIndex = layers.findIndex(layer => layer._id === currentLayer._id) + 1;
      if (nextLayerIndex < layers.length) {
        setCurrentLayer(layers[nextLayerIndex]);
      } else {
        console.log("No more layers to switch to");
      }
    }

    // Check if currentLayerSeek goes below the start of the current layer
    if (currentLayerSeek < currentLayerStartFrame) {
      const prevLayerIndex = layers.findIndex(layer => layer._id === currentLayer._id) - 1;
      if (prevLayerIndex >= 0) {
        setCurrentLayer(layers[prevLayerIndex]);
      } else {
        console.log("Already at the first layer");
      }
    }
  }, [currentLayerSeek]);

  useEffect(() => {
    if (currentLayer && currentLayer.imageSession && currentLayer.imageSession.activeItemList) {

      
      const activeList = currentLayer.imageSession.activeItemList;
      setActiveItemList(activeList);
      const newLayerSeek = Math.floor(currentLayer.durationOffset * 30);

      // Set the currentLayerSeek to the beginning of the new layer
      setCurrentLayerSeek(newLayerSeek);
    }
  }, [currentLayer]);

  useEffect(() => {

    if (isLayerGenerationPending) {
      pollForLayersUpdate();
    }
  }, [isLayerGenerationPending]);

  const pollForLayersUpdate = () => {

    const timer = setInterval(() => {
      axios.post(`${PROCESSOR_API_URL}/video_sessions/refresh_session_layers`, { id: id }, getHeaders()).then(function (dataRes) {
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
      axios.post(`${PROCESSOR_API_URL}/video_sessions/get_render_video_status`, { id: id }, getHeaders()).then(function (dataRes) {
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


  const submitRenderVideo = () => {
    axios.post(`${PROCESSOR_API_URL}/video_sessions/request_render_video`, { id: id }, getHeaders()).then(function (dataRes) {

      const sesionFileName = dataRes.data;

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
  const frameDurationMs = 1000 / fps; // Duration of each frame in milliseconds
  const totalDurationInFrames = totalDuration * fps; // Convert total duration to frames (30 fps)


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
    // Prepare the audio
    const audio = audioFileTrack ? new Audio(audioFileTrack) : null;
    if (audio) {
      audio.load();
    }

    let currentFrameIndex = 0;
    const frameRate = 1000 / 30; // 30 FPS

    // Function to update the frame display
    const updateFrame = () => {
      if (currentFrameIndex >= frames.length) {
        clearInterval(playbackInterval);
        if (audio) {
          audio.pause();
          audio.currentTime = 0;
        }
        return;
      }
      // Update currentLayerSeek to trigger frame rendering in your component
      setCurrentLayerSeek(currentFrameIndex);
      currentFrameIndex++;
    };

    // Start playing the audio if available
    if (audio) {
      audio.play();
    }

    // Set interval to update frames at the specified frame rate
    const playbackInterval = setInterval(updateFrame, frameRate);
  };



  const updateSessionLayer = (newLayer) => {

    const headers = getHeaders();

    const reqPayload = {
      sessionId: id,
      layer: newLayer
    }


    axios.post(`${PROCESSOR_API_URL}/video_sessions/update_layer`, reqPayload, headers).then((response) => {
      const videoSessionData = response.data;
      const updatedLayer = videoSessionData.layers.find(layer => layer._id === newLayer._id);
      if (updatedLayer) {
        const updatedLayers = videoSessionData.layers;
        setLayers(updatedLayers);
        setCurrentLayer(updatedLayer);
      }
    });

  }

  const updateSessionLayerActiveItemList = (newActiveItemList) => {

    const headers = getHeaders();
    const reqPayload = {
      sessionId: id,
      activeItemList: newActiveItemList,
      layerId: currentLayer._id.toString()
    }
    axios.post(`${PROCESSOR_API_URL}/video_sessions/update_active_item_list`, reqPayload, headers).then((response) => {
      const videoSessionData = response.data;
      const updatedItemList = videoSessionData.activeItemList;
      if (updatedItemList && updatedItemList.length > 0) {
        setActiveItemList(updatedItemList)
      }
    });
  }


  return (
    <CommonContainer >
      <div className='m-auto'>
        <div className='block'>
          <div className='w-[16%] inline-block'>
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
            />
          </div>
          <div className='w-[84%] bg-cyber-black inline-block'>
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
            />
          </div>
        </div>
      </div>

    </CommonContainer>
  )
}