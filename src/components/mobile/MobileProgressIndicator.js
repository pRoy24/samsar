import React from 'react';
import { FaChevronLeft, FaTimes } from 'react-icons/fa';
import './mobileStyles.css';

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
    <div className="spinner-container absolute t-0 z-10 md:w-auto w-[100%] m-auto" style={{
      backgroundColor: 'rgba(0,0,0,0.5)',
      marginTop: '0px', display: 'flex', flexDirection: 'column', justifyContent: 'flex-start'
    }}
    >
      <div className='relative mt-0 w-full p-4'>
        <div>
          <div onClick={() => setShowResultDisplay(false)} className='float-right mr-2 
          mb-8 bg-gray-900 hover:bg-gray-950 pl-4 pr-4 pt-1 pb-1'>
            <FaTimes className='inline-flex' /> Close
          </div>
        </div>
        <div>
          {isGenerationPending && expressGenerationStatus && (
            <div>
              <div className="progress-bar" style={{ width: '100%', backgroundColor: '#333', borderRadius: '5px', overflow: 'hidden', marginBottom: '10px' }}>
                <div
                  className="progress-bar-fill"
                  style={{ width: `${progressPercentage}%`, height: '20px', backgroundColor: '#4caf50' }}
                ></div>
              </div>
              <div className="status" style={{ color: 'white' }}>
                <p>Image Generation: {expressGenerationStatus.image_generation}</p>
                <p>Audio Generation: {expressGenerationStatus.audio_generation}</p>
                <p>Frame Generation: {expressGenerationStatus.frame_generation}</p>
                <p>Video Generation: {expressGenerationStatus.video_generation}</p>
              </div>
            </div>
          )}
          {videoLink && !isGenerationPending && (
            <div className="video-container" style={{ marginTop: '20px' }}>
              <video controls className='md:w-[512px] w-full m-auto'>
                <source src={`${PROCESSOR_API_URL}/${videoLink}`} type="video/mp4" />
                Your browser does not support the video tag.
              </video>
              <div className="download-button" style={{ marginTop: '10px' }}>
                <a href={`${PROCESSOR_API_URL}/${videoLink}`} download="generated_video.mp4" style={{ color: 'white' }}>
                  Download Video
                </a>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
