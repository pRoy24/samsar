import React, { useState } from 'react';
import SecondaryButton from '../../common/SecondaryButton.tsx';
import TextareaAutosize from 'react-textarea-autosize';

export default function PromptViewer(props) {
  const {
    currentDefaultPrompt,
    submitGenerateRecreateRequest,
    showCreateNewPrompt,
  } = props;

  const [promptText, setPromptText] = useState(currentDefaultPrompt);

  const handleInputChange = (e) => {
    setPromptText(e.target.value);
  };

  const handleSubmit = () => {
    submitGenerateRecreateRequest(promptText);
  };

  return (
    <div className="flex flex-col items-center space-y-4 bg-[#374151] p-4 rounded-lg">
      <TextareaAutosize
        className="text-left max-h-64 overflow-y-auto w-full px-2 py-2 border rounded bg-[#171717] text-[#fafafa]
        "
        value={promptText}
        onChange={handleInputChange}
        minRows={3} // Adjusts the minimum number of rows
        maxRows={10} // Adjusts the maximum number of rows
        style={{ resize: 'none' }} // Prevents manual resizing
      />
      <div className="flex space-x-4">
        <SecondaryButton
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          onClick={handleSubmit}
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
  );
}
