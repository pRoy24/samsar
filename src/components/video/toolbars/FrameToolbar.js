import React, { useState, useEffect, useRef } from 'react';
import { useColorMode } from '../../../contexts/ColorMode.js';
import CommonButton from '../../common/CommonButton.tsx';
import './toolbar.css';
import ReactSlider from 'react-slider';
import { FaMusic, FaPause, FaPlay, FaStop, FaChevronRight, FaPlus } from 'react-icons/fa6';
import SecondaryButton from '../../common/SecondaryButton.tsx';
import VerticalWaveform from '../util/VerticalWaveform.js';
import DualThumbSlider from '../util/DualThumbSlider.js';
import TimeRuler from '../util/TimeRuler.js';
import Draggable from 'react-draggable';
import RangeOverlaySlider from '../util/RangeOverlaySlider.js';
import { FRAME_TOOLBAR_VIEW } from '../../../constants/Types.ts';
import AudioTrackSlider from '../util/AudioTrackSlider.js';
import { FaEdit, FaTimes } from 'react-icons/fa';
import DropdownButton from '../util/DropdownButton.js';

export default function FrameToolbar(props) {
  const {
    layers, setSelectedLayer, submitRenderVideo,
    setLayerDuration, currentLayerSeek, setCurrentLayerSeek, totalDuration,
    showAddAudioToProjectDialog, audioFileTrack, selectedLayerIndex,
    startPlayFrames, downloadVideoDisplay, renderedVideoPath, sessionId,
    updateSessionLayer, setIsLayerSeeking,
    isVideoGenerating, showAudioTrackView, frameToolbarView,
    audioLayers, updateAudioLayer, isAudioLayerDirty,
    removeAudioLayer, handleVolumeChange,
    updateChangesToActiveLayers, addLayerToComposition,
    copyCurrentLayerBelow, removeSessionLayer
  } = props;

  const { colorMode } = useColorMode();
  const bgColor = colorMode === 'light' ? 'bg-cyber-white' : 'bg-gray-800';
  const bg2Color = colorMode === 'light' ? 'bg-stone-200' : 'bg-gray-700';
  let bg3Color = colorMode === 'light' ? "bg-neutral-100" : "bg-neutral-800 ";

  const bgSelectedColor = colorMode === 'light' ? 'bg-stone-200 shadow-lg' : 'bg-gray-950 shadow-lg';

  const textColor = colorMode === 'light' ? 'text-cyber-black' : 'text-neutral-100';
  const [highlightBoundaries, setHighlightBoundaries] = useState({ start: 0, height: 0 });

  const totalDurationInFrames = totalDuration * 30; // Convert total duration to frames (30 fps)
  const [viewRange, setViewRange] = useState([0, totalDurationInFrames]);

  const [startSelectDurationInFrames, setStartSelectDurationInFrames] = useState(0);
  const [endSelectDurationInFrames, setEndSelectDurationInFrames] = useState(0);

  const parentRef = useRef(null);

  useEffect(() => {
    setViewRange([0, totalDurationInFrames]);
  }, [totalDurationInFrames]);

  useEffect(() => {
    if (selectedLayerIndex >= 0 && parentRef.current) {
      const startDuration = layers.slice(0, selectedLayerIndex).reduce((acc, layer) => acc + layer.duration, 0);
      const currentLayerDuration = layers[selectedLayerIndex].duration;
      const heightPercentage = (currentLayerDuration / totalDuration) * 100;
      const parentHeight = parentRef.current.clientHeight;
      const heightPixels = (heightPercentage / 100) * parentHeight;
      const startPixels = (startDuration / totalDuration) * parentHeight;

      setStartSelectDurationInFrames(startDuration * 30);
      setEndSelectDurationInFrames((startDuration + currentLayerDuration) * 30);

      setHighlightBoundaries({ start: startPixels, height: heightPixels });
    }
  }, [selectedLayerIndex, layers, totalDuration, parentRef.current]);

  const handleViewRangeSliderChange = (values) => {
    setViewRange(values);
    if (currentLayerSeek < values[0] || currentLayerSeek > values[1]) {
      setCurrentLayerSeek(values[0]);
    }
  };

  const handleDragTop = (e, data) => {
    const newStart = Math.max(0, highlightBoundaries.start + data.deltaY);
    const newHeight = Math.max(0, highlightBoundaries.height - data.deltaY);

    setHighlightBoundaries({ start: newStart, height: newHeight });
    // Update the layer duration and total duration here
    const newDuration = (newHeight / parentRef.current.clientHeight) * totalDuration;
    setLayerDuration(newDuration, selectedLayerIndex);
    setCurrentLayerSeek(newStart);
  };

  const layerDurationUpdated = (val) => {
    const newDurationInFrames = val[1] - val[0];
    const newDuration = newDurationInFrames / 30;
    setLayerDuration(newDuration, selectedLayerIndex);
    let layer = layers[selectedLayerIndex];
    layer.duration = newDuration;
    updateSessionLayer(layer);
  };

  const layerDurationCellUpdated = (value, index) => {
    setLayerDuration(value, index);
    let layer = layers[index];
    layer.duration = value;
    updateSessionLayer(layer);
  };

  const removeLayer = (index) => {
    let newLayers = layers.slice();
    newLayers.splice(index, 1);
    removeSessionLayer(index);
   // updateSessionLayer(newLayers);
  }

  let layersList = <span />;
  if (layers) {
    layersList = layers.map(function (layer, index) {
      let bgSelected = selectedLayerIndex === index ? bgSelectedColor : '';
      return <div className={`p-2 cursor-pointer ${bg3Color} ${bgSelected} mt-1 ml-1 mr-1 relative`}
        onClick={() => setSelectedLayer(layer)} key={`layer_duration_set_${index}`}>
          <div className='absolute right-2 t-0 cursor-pointer'>
            <FaTimes className='' onClick={() => removeLayer(index)}/>
          </div>
        <div className='m-auto pl-2'>
          <div>Layer {index + 1}</div>
          <div>
            <div>
              <input type="number" value={layer.duration}
                onChange={(e) => layerDurationCellUpdated(e.target.value, index)}
                className={`w-[60px] p-1 rounded-lg ${textColor} ${bg2Color}`} />
            </div>
            <div className='text-[10px]'>Duration</div>
          </div>
        </div>
      </div>
    });
  }

  let audioSpecogramDisplay = <span />;
  if (audioFileTrack) {
    audioSpecogramDisplay = (
      <div>
        <VerticalWaveform audioUrl={audioFileTrack} totalDuration={totalDuration} viewRange={viewRange} />
      </div>
    );
  }

  const setSelectedLayerDurationRange = (val) => {
    const newDurationInFrames = val[1] - val[0];
    const newDuration = newDurationInFrames / 30;
    setLayerDuration(newDuration, selectedLayerIndex);
  };

  let layerSelectOverlay = <span />;
  if (highlightBoundaries) {
    let sliderStartRange = startSelectDurationInFrames > 0 ? startSelectDurationInFrames : 0;
    let sliderEndRange = endSelectDurationInFrames + 1;
    layerSelectOverlay = (
      <div className='layer-select-overlay absolute w-[80px] z-10 top-0 bottom-0'
        ref={parentRef}
        style={{
          pointerEvents: 'none'
        }}
      >
        <div className={`relative `} style={{
          top: `${highlightBoundaries.start}px`,
          height: `100%`,
          width: '60px',
        }}>
          <RangeOverlaySlider onChange={setSelectedLayerDurationRange}
            min={sliderStartRange} max={sliderEndRange}
            value={[startSelectDurationInFrames, endSelectDurationInFrames]}
            highlightBoundaries={highlightBoundaries}
            layerDurationUpdated={layerDurationUpdated} />
        </div>
      </div>
    );
  }

  let submitRenderDisplay = (
    <CommonButton onClick={submitRenderVideo} isPending={isVideoGenerating}>Render</CommonButton>
  );
  if (downloadVideoDisplay && renderedVideoPath) {
    submitRenderDisplay = (
      <a href={renderedVideoPath} download={`${sessionId}.mp4`}>
        <CommonButton>Download</CommonButton>
      </a>
    );
  }

  const showAddedAudioTracks = () => {

    return audioLayers.map((audioTrack) => (
      <AudioTrackSlider
        key={audioTrack.id}
        audioTrack={audioTrack}
        totalDuration={totalDuration}
        onUpdate={updateAudioLayer}
      />
    ));
  };

  const showSelectedAudioTrack = () => {
    const selectedAudioTrack = audioLayers.find((audioTrack) => audioTrack.isSelected);



    if (selectedAudioTrack) {
      return (
        <form onSubmit={updateChangesToActiveLayers}>
          <div className={`grid grid-cols-5 gap-1 `}>
            <div>

              <input type="text" value={selectedAudioTrack.startTime.toFixed(2)} className={`w-[50px] ${bgColor}`} />
              <div className="text-xs">
                Start
              </div>
            </div>

            <div>
              <input type="text" defaultValue={selectedAudioTrack.volume.toFixed(2)} className={`w-[50px] ${bgColor}`}
                onChange={handleVolumeChange} />
              <div className="text-xs">
                Volume
              </div>
            </div>
            <div>
              <SecondaryButton type="submit">Update</SecondaryButton>
            </div>


            <div>
              <button className='bg-neutral-800 rounded-sm text-white' onClick={() => removeAudioLayer(selectedAudioTrack)}>
                <FaTimes className='inline-flex' />
                <div className='text-xs pl-1 pr-1 pb-1'>
                  Remove
                </div>
              </button>
            </div>


            <div>

            </div>

          </div>
        </form>
      )
    }


  }


  useEffect(() => {
    if (frameToolbarView === FRAME_TOOLBAR_VIEW.AUDIO) {

    } else {
      console.log("BE HERE");
    }
  }, [frameToolbarView]);

  let containerWdidth = 'w-[14%] z-1';
  if (frameToolbarView === FRAME_TOOLBAR_VIEW.AUDIO) {
    containerWdidth = 'w-[30%] z-10';
  }

  let audioTrackViewDisplay = <span />;
  let audioSelectedTrackViewDisplay = <span />;

  if (frameToolbarView === FRAME_TOOLBAR_VIEW.AUDIO) {
    audioTrackViewDisplay = showAddedAudioTracks();
    audioSelectedTrackViewDisplay = showSelectedAudioTrack();
  }

  let mtop = 'mt-[52px]';
  if (frameToolbarView === FRAME_TOOLBAR_VIEW.AUDIO) {
    mtop = 'mt-0';
  }

  return (
    <div className={`border-r-2 ${bgColor} shadow-lg m-auto fixed top-0 ${containerWdidth} ${textColor} text-left `}>
      <div className={`${mtop} relative`}>
        <div className='btn-container flex-w-full mt-1 mb-1'>
          <div className='basis-1/2 inline-flex'>
            {submitRenderDisplay}
          </div>
          <div className='basis-1/2 inline-flex float-right mr-2 mt-2'>
            <div className={`${bg3Color} pt-1 pb-1 pl-2 pr-2 w-full m-auto text-center `}>
              <FaPlay className='inline-flex ml-1 mr-1' onClick={startPlayFrames} />
              <FaPause className='inline-flex ml-1 mr-1' />
              <FaStop className='inline-flex ml-1 mr-1' />
            </div>
          </div>
        </div>
        <div >
          <div className={`flex w-full ${bg2Color} p-1`}>
            <div className='inline-flex w-30'>
              <div className='flex'>
                Scenes
                <div className='inline-flex ml-2'>
                  <DropdownButton addLayerToComposition={addLayerToComposition}
                  copyCurrentLayerBelow={copyCurrentLayerBelow} />
                </div>
              </div>
            </div>
            <div className='grow basis-2/3'>
              {audioSelectedTrackViewDisplay}
              <div className='absolute right-0 top-0'>
                <SecondaryButton onClick={showAudioTrackView}>
                  Audio
                  <FaChevronRight className='inline-flex ml-1 mr-1' />
                </SecondaryButton>
              </div>
            </div>
          </div>
        </div>
        <div className='flex flex-row w-full h-[95vh]'>
          <div className='text-xs font-bold basis-1/2'>
            {layersList}
          </div>
          <div className='basis-1/2'>
            <div className='flex flex-row h-[80vh]'>
              <div className='inline-flex h-full'>
                <div className='relative h-full w-full'>
                  {layerSelectOverlay}
                  <div className='inline-flex h-full'>
                    <ReactSlider orientation="vertical" className='vertical-slider' thumbClassName='thumb'
                      trackClassName='track' defaultValue={0} min={viewRange[0]} max={viewRange[1]}
                      value={currentLayerSeek}
                      onChange={(value) => setCurrentLayerSeek(value)}
                      onBeforeChange={() => setIsLayerSeeking(true)}
                      onAfterChange={() => setIsLayerSeeking(false)}
                    />
                  </div>
                </div>
              </div>
              <div className='inline-flex dual-thumb h-auto w-[30px] ml-1'>
                <DualThumbSlider min={0} max={totalDurationInFrames}
                  defaultValue={[0, totalDurationInFrames]}
                  onChange={handleViewRangeSliderChange} />
              </div>
              {audioTrackViewDisplay}
              <div className='inline-flex h-full'>
                <TimeRuler totalDuration={totalDuration} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
