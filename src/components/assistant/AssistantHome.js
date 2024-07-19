import React, { useState } from 'react';
import { useColorMode } from '../../contexts/ColorMode.js';
import SecondaryButton from '../common/SecondaryButton.tsx';  // Assuming you have a SecondaryButton component

export default function AssistantHome() {
  const [isOpen, setIsOpen] = useState(false);
  const [userInput, setUserInput] = useState('');
  const { colorMode } = useColorMode();

  const toggleAssistant = () => {
    setIsOpen(!isOpen);
  };

  const handleInputChange = (e) => {
    setUserInput(e.target.value);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('User input:', userInput);
    setUserInput('');
  };

  const backgroundColor = colorMode === 'dark' ? '#1a202c' : '#f5f5f5';
  const textColor = colorMode === 'dark' ? '#f5f5f5' : '#1a202c';

  return (
    <div className="fixed bottom-4 right-4">
      <button 
        onClick={toggleAssistant} 
        style={{ backgroundColor, color: textColor }}
        className="p-3 rounded-full shadow-lg focus:outline-none"
      >
        Assistant
      </button>
      {isOpen && (
        <div 
          className="fixed bottom-16 right-4 p-4 rounded-lg shadow-lg w-64"
          style={{ backgroundColor, color: textColor }}
        >
          <div className="mb-2 font-bold">How may I help you?</div>
          <form onSubmit={handleSubmit}>
            <textarea 
              value={userInput} 
              onChange={handleInputChange}
              className="w-full p-2 rounded border focus:outline-none mb-2"
              rows="3"
              style={{ backgroundColor: colorMode === 'dark' ? '#2d3748' : '#e2e8f0', color: textColor }}
            />
            <SecondaryButton type="submit">
              Submit
            </SecondaryButton>
          </form>
        </div>
      )}
    </div>
  );
}
