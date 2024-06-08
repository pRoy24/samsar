import React from 'react';

const PROCESSOR_API_URL = process.env.REACT_APP_PROCESSOR_API;

export default function FrameDisplay(props) {
  const { currentFrame , setFrameEditDisplay} = props;

  return (
    <div onClick={() => setFrameEditDisplay(currentFrame)}>
      <img src={`${PROCESSOR_API_URL}/video/frames/${currentFrame.image}`} />
    </div>
  )
}