import React, { useState, useEffect } from 'react';
import OverflowContainer from '../common/OverflowContainer.tsx';


import QuickEditor from '../quick_editor/QuickEditor.js';

const PROCESSOR_API_URL = process.env.REACT_APP_PROCESSOR_API;

export default function MobileVideoHome() {




  return (
    <div className='bg-gray-900'>
      <OverflowContainer>
          <QuickEditor />
      </OverflowContainer>
    </div>

  );
}