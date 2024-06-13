import React, { useState, useEffect } from 'react';
import { useColorMode } from '../../../../contexts/ColorMode.js';
import { TOOLBAR_ACTION_VIEW } from '../../../../constants/Types.ts';
import SecondaryButton from '../../../common/SecondaryButton.tsx';

export default function MusicSelectToolbar(props) {

  const { audioLayer, setCurrentCanvasAction, submitAddTrackToProject } = props;

  const [audioData, setAudioData] = useState([]);

  useEffect(() => {
    const audioData = audioLayer.remoteAudioData;
    setAudioData(audioData);

  }, [audioLayer]);

  const { colorMode } = useColorMode();

  const showAudioSubOptionsDisplay = (index) => {
    const newAudioLayers = audioData.map((layer, i) => {
      if (i === index) {
        return {
          ...layer,
          isOptionSelected: true
        }
      } else {
        return {
          ...layer,
          isOptionSelected: false
        }
      }
    });
    setAudioData(newAudioLayers);
  }

  let bgColor = "bg-gray-900 ";
  if (colorMode === 'light') {
    bgColor = "bg-neutral-50  text-neutral-900 ";
  }
  const text2Color = colorMode === 'dark' ? 'text-neutral-100' : 'text-neutral-900';

  const latestLayer = audioData[audioData.length - 1];
  if (!latestLayer) {
    return;
  }

  const addTrackSubmit = (evt, index) => {

    const formData = new FormData(evt.target);
    evt.preventDefault();
    const startTimestamp = formData.get('track');
    const volume = formData.get('volume');
    const payload = {
      startTime: startTimestamp,
      volume: volume
    }

    submitAddTrackToProject(index, payload);


  }

  const audioPreviewDisplay = audioData.map((layer, index) => {

    const previewUrl = layer.audio_url;
    let optionsSelectDisplay = <span />;
    if (layer.isOptionSelected) {
      optionsSelectDisplay = (
        <div className={`${bgColor} mt-2`}>
          <form onSubmit={(evt) => addTrackSubmit(evt, index)} className={`${bgColor}`}>
            <div className='grid grid-cols-3 gap-1 '>
              <div>
                <input type='text' name="track" placeholder='Start timestamp (secs)' defaultValue={0}
                  className={` h-[30px] ${bgColor} w-[60px] m-auto
          border-2 border-gray-200 pl-2`} />
                <div className='text-xs'>
                  Start Time (secs)
                </div>
              </div>
              <div>
                <input type='text' name="volume" placeholder='Volume' defaultValue={100} className={` h-[30px]
                 ${bgColor} 
          border-2 border-gray-200 pl-2 w-[60px] m-auto`}
                />
                <div className='text-xs'>
                  Volume
                </div>
              </div>

              <div>
                <SecondaryButton type="submit">
                  Add
                </SecondaryButton>
              </div>
            </div>
          </form>
        </div>
      )
    }

    let selectButton = layer.isOptionSelected ? <span /> : <SecondaryButton>
      Select
    </SecondaryButton>

    return (
      <div onClick={() => showAudioSubOptionsDisplay(index)}>
        <div className='text-sm cursor-pointer'>
          {layer.title}
        </div>
        <div>
          <audio controls className='w-[200px] h-[40px]' >
            <source src={previewUrl} type="audio/mpeg" />
            Your browser does not support the audio element.
          </audio>
        </div>
        <div>
          {selectButton}
        </div>
        <div>
          {optionsSelectDisplay}
        </div>
      </div>
    )
  });


  return (

    <div className={`${bgColor} ${text2Color}`}>
      <div className="mt-2">
        <button onClick={() => setCurrentCanvasAction(TOOLBAR_ACTION_VIEW.SHOW_MUSIC_GENERATE_DISPLAY)}>
          Back
        </button>
        <div>
          {audioPreviewDisplay}
        </div>
      </div>
    </div>


  );
}