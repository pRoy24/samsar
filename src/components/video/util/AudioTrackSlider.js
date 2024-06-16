import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import ReactSlider from 'react-slider';

const AudioTrackSlider = ({ audioTrack, totalDuration, onUpdate }) => {
  console.log(audioTrack);

  const [audioDuration, setAudioDuration] = useState(0);
  const totalDurationInFrames = totalDuration * 30;

  useEffect(() => {
    const audio = new Audio(audioTrack.url);
    audio.onloadedmetadata = () => {
      setAudioDuration(audio.duration);
    };
  }, [audioTrack.url]);

  const startFrame = (audioTrack.startTime / totalDuration) * totalDurationInFrames;
  const defaultDuration = Math.min(totalDuration, 120);
  const durationFrames = (audioDuration > 0 ? audioDuration : defaultDuration) * 30;

  const handleChange = (value) => {
    const newStartTime = (value[0] / totalDurationInFrames) * totalDuration;
    const newDuration = ((value[1] - value[0]) / totalDurationInFrames) * totalDuration;
    onUpdate(audioTrack._id, newStartTime, newDuration);
  };

  return (
    <ReactSlider
      className="vertical-slider ml-2"
      thumbClassName="thumb"
      trackClassName="track"
      orientation="vertical"
      min={0}
      max={totalDurationInFrames}
      defaultValue={[startFrame, startFrame + durationFrames]}
      onChange={handleChange}
      renderThumb={(props, state) => <div {...props} />}
      pearling
    />
  );
};

AudioTrackSlider.propTypes = {
  audioTrack: PropTypes.object.isRequired,
  totalDuration: PropTypes.number.isRequired,
  onUpdate: PropTypes.func.isRequired
};

export default AudioTrackSlider;
