import React, { useState, useRef, useEffect } from 'react';
import { useColorMode } from '../../contexts/ColorMode.js';
import CommonButton from '../common/CommonButton.tsx';
import { FaCopy } from 'react-icons/fa';
import { MdMinimize } from 'react-icons/md';
import dayjs from 'dayjs';

export default function AssistantHome(props) {
  const { submitAssistantQuery, sessionMessages, isAssistantQueryGenerating } = props;

  const [isOpen, setIsOpen] = useState(false);
  const [userInput, setUserInput] = useState('');
  const { colorMode } = useColorMode();
  const textAreaRef = useRef(null);
  const messagesEndRef = useRef(null);

  const toggleAssistant = () => {
    setIsOpen(!isOpen);
  };

  const handleInputChange = (e) => {
    setUserInput(e.target.value);
    adjustTextAreaHeight();
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('User input:', userInput);
    submitAssistantQuery(userInput);
    setUserInput('');
    adjustTextAreaHeight(); // Adjust height after clearing input
  };

  const adjustTextAreaHeight = () => {
    if (textAreaRef.current) {
      const textarea = textAreaRef.current;
      textarea.style.height = 'auto';
      textarea.style.height = `${Math.min(textarea.scrollHeight, 300)}px`; // 10 rows equivalent height
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text).then(() => {
      console.log('Copied to clipboard:', text);
    }).catch(err => {
      console.error('Failed to copy:', err);
    });
  };

  const scrollToBottom = () => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  };

  useEffect(() => {
    if (isOpen) {
      adjustTextAreaHeight(); // Adjust height when the assistant is opened
      setTimeout(scrollToBottom, 100); // Scroll to the bottom on open
    }
  }, [isOpen]);

  useEffect(() => {
    setTimeout(scrollToBottom, 100); // Scroll to the bottom on messages update
  }, [sessionMessages]);

  const backgroundColor = colorMode === 'dark' ? '#1a202c' : '#f5f5f5';
  const textColor = colorMode === 'dark' ? '#f5f5f5' : '#1a202c';

  console.log(sessionMessages);

  const getBGColorMode = (role) => {
    if (role === 'user') {
      return '#1e293b';
    } else if (role === 'assistant') {
      return '#020617';
    }
    return '#e2e8f0';
  }

  return (
    <div className="fixed bottom-4 right-4">
      <button 
        onClick={toggleAssistant} 
        style={{ backgroundColor, color: textColor }}
        className="p-3 rounded-full shadow-lg focus:outline-none border-2 border-gray-400 pl-6 pr-6" 
      >
        Assistant
      </button>
      {isOpen && (
        <div 
          className="fixed bottom-16 right-4 p-4 rounded-lg shadow-lg border-2 border-gray-600"
          style={{ backgroundColor, color: textColor }}
        >
          <div className="flex justify-between items-center mb-2 font-bold">
            <span>Chat with Samsar</span>
            <button 
              onClick={toggleAssistant} 
              className="p-1 rounded-full shadow-lg focus:outline-none"
            >
              <MdMinimize />
            </button>
          </div>
          <div className="mb-4 space-y-2 w-[512px] max-h-[400px] overflow-y-scroll">
            {sessionMessages && sessionMessages.length > 0 ? sessionMessages.map((message, index) => (
              <div 
                key={index} 
                className={`p-2 rounded whitespace-pre-wrap relative ${
                  message.role === 'user' ? 'text-left' : 'text-right'
                }`} 
                style={{ backgroundColor: colorMode === 'dark' ? getBGColorMode(message.role) : '#e2e8f0', color: textColor }}
              >
                <div className="text-sm mb-1">
                  {dayjs(message.timestamp).format('MMM D, YYYY h:mm A')}
                </div>
                <div>
                  {message.content.split('\n').map((line, i) => (
                    <span key={i} className="block">
                      {line}
                      {line.trim() && (
                        <button 
                          onClick={() => copyToClipboard(line)} 
                          className="ml-2 text-xs"
                          title="Copy to clipboard"
                        >
                          <FaCopy />
                        </button>
                      )}
                    </span>
                  ))}
                </div>
              </div>
            )) : <span />}
            <div ref={messagesEndRef} />
          </div>
          <form onSubmit={handleSubmit}>
            <textarea 
              value={userInput} 
              onChange={handleInputChange}
              ref={textAreaRef}
              className="w-full p-2 rounded border focus:outline-none mb-2 resize-none"
              rows="1"
              style={{ backgroundColor: colorMode === 'dark' ? '#2d3748' : '#e2e8f0', color: textColor }}
            />
            <CommonButton type="submit" isPending={isAssistantQueryGenerating}>
              Submit
            </CommonButton>
          </form>
        </div>
      )}
    </div>
  );
}
