import React from 'react';
import SecondaryButton from '../../common/SecondaryButton.tsx';
export default function PromptViewer(props) {
  const {
    currentDefaultPrompt,
    submitRengeneratePrompt,
    showCreateNewPrompt,
    submitGenerateRecreateRequest,
  } = props;

  
  return (
    <div className="flex flex-col items-center space-y-4">
      <p className="text-center max-h-64 overflow-y-auto">{currentDefaultPrompt}</p>
      <div className="flex space-x-4">
        <SecondaryButton
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          onClick={submitGenerateRecreateRequest}
        >
          Regenerate
        </SecondaryButton>
        <SecondaryButton
          className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
          onClick={showCreateNewPrompt}
        >
           New
        </SecondaryButton>
      </div>
    </div>
  )
}