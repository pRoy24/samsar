import React from 'react';
import { FaChevronLeft, FaTimes, FaSpinner } from 'react-icons/fa';
import './mobileStyles.css';

const PROCESSOR_API_URL = process.env.REACT_APP_PROCESSOR_API;

const getProgressPercentage = (status) => {
  const totalTasks = Object.keys(status).length;
  const completedTasks = Object.values(status).filter((state) => state === 'COMPLETED').length;
  return (completedTasks / totalTasks) * 100;
};

export default function ProgressIndicator(props) {
  const {
    isGenerationPending,
    expressGenerationStatus,
    videoLink,
    setShowResultDisplay
  } = props;

  console.log(expressGenerationStatus);
  

  const progressPercentage = expressGenerationStatus ? getProgressPercentage(expressGenerationStatus) : 0;

  return (
    <div className="absolute top-0 z-10 w-full h-full flex flex-col justify-start bg-black bg-opacity-90 rounded-lg">
      <div className="relative w-full p-4">
        <div>
          <div
            onClick={() => setShowResultDisplay(false)}
            className="float-right mr-2 mb-8 bg-gray-900 hover:bg-gray-950 px-4 py-1 rounded cursor-pointer
            text-white"
          >
            <FaTimes className="inline-flex" /> Close
          </div>
        </div>
        <div className='m-auto'>
          {isGenerationPending && expressGenerationStatus ? (
            <div>
              <div className="w-full bg-gray-800 rounded overflow-hidden mb-2">
                <div
                  className="h-5 bg-green-500"
                  style={{ width: `${progressPercentage}%` }}
                ></div>
              </div>
              <div className="text-white">
                <p>Prompt Generation: {expressGenerationStatus.prompt_generation}</p>
                <p>Image Generation: {expressGenerationStatus.image_generation}</p>
                <p>Audio Generation: {expressGenerationStatus.audio_generation}</p>
                <p>Frame Generation: {expressGenerationStatus.frame_generation}</p>
                <p>Video Generation: {expressGenerationStatus.video_generation}</p>
              </div>
            </div>
          ) : expressGenerationStatus === null ? (
            <div className="flex justify-center items-center h-48">
              <FaSpinner className="animate-spin text-4xl text-white" />
            </div>
          ) : null}
          {videoLink && !isGenerationPending && (
            <div className="mt-5">
              <video controls className="md:w-[512px] w-full mx-auto">
                <source src={`${PROCESSOR_API_URL}/${videoLink}`} type="video/mp4" />
                Your browser does not support the video tag.
              </video>
              <div className="text-center mt-3">
                <a href={`${PROCESSOR_API_URL}/${videoLink}`} download="generated_video.mp4" className="text-white">
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
