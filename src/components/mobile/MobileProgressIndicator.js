import React from 'react';
import { FaChevronLeft } from 'react-icons/fa';

const PROCESSOR_API_URL = process.env.REACT_APP_PROCESSOR_API;

const getProgressPercentage = (status) => {
  const totalTasks = Object.keys(status).length;
  const completedTasks = Object.values(status).filter((state) => state === 'COMPLETED').length;
  return (completedTasks / totalTasks) * 100;
};

export default function MobileProgressIndicator(props) {
  const {
    isGenerationPending,
    expressGenerationStatus,
    videoLink,
    setShowResultDisplay
  } = props;

  const progressPercentage = expressGenerationStatus ? getProgressPercentage(expressGenerationStatus) : 0;

  return (
    <div className="spinner-container absolute t-0 z-10">
      <div >
        <div onClick={() => () => setShowResultDisplay(false)}>
        <FaChevronLeft className='inline-flex'/> Back
        </div>
       
      </div>
      <div>


        {isGenerationPending && expressGenerationStatus && (
          <div>
            <div className="progress-bar">
              <div
                className="progress-bar-fill"
                style={{ width: `${progressPercentage}%` }}
              ></div>
            </div>
            <div className="status">
              <p>Image Generation: {expressGenerationStatus.image_generation}</p>
              <p>Audio Generation: {expressGenerationStatus.audio_generation}</p>
              <p>Frame Generation: {expressGenerationStatus.frame_generation}</p>
              <p>Video Generation: {expressGenerationStatus.video_generation}</p>
            </div>
          </div>
        )}

        {videoLink && !isGenerationPending && (
          <div className="video-container">
            <video controls>
              <source src={`${PROCESSOR_API_URL}/${videoLink}`} type="video/mp4" />
              Your browser does not support the video tag.
            </video>
            <div className="download-button">
              <a href={`${PROCESSOR_API_URL}/${videoLink}`} download="generated_video.mp4">
                Download Video
              </a>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
