import React from 'react';
import CommonButton from '../../common/CommonButton.tsx';
import { useColorMode } from '../../../contexts/ColorMode';

export default function BatchPrompt(props) {
  const { submitPromptList, defaultSceneDuration } = props;
  const { colorMode } = useColorMode();
  const textColor = colorMode === 'light' ? 'text-cyber-black' : 'text-neutral-100';
  const bgColor = colorMode === 'light' ? 'bg-neutral-200' : 'bg-gray-900';
  return (
    <div>
      <form onSubmit={submitPromptList}>
        <div className='mt-2 text-sm font-bold'>
          <div className='inline-flex items-center'>
          Add Prompts
          </div>
          <div className='inline-flex items-center text-xs  ml-4'>
            Duration <input type="number" name="duration" className={`w-16 ml-2 mr-2 p-1 rounded-sm ${bgColor}`} placeholder="Enter duration per scene"
            defaultValue={defaultSceneDuration} />
          </div>  

         </div> 
        <textarea className={`bg-gray-900
           h-auto min-h-64 overflow-y-scroll w-full mt-2 mb-2
          p-4 rounded-sm ${textColor}`}
          name="promptList"
          placeholder='Enter the list of prompts separated by newlines.'></textarea>

        <CommonButton type="submit">
          Submit
        </CommonButton>
      </form>
    </div>
  )
}