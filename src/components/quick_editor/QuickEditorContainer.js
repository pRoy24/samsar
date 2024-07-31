import React from 'react';
import OverflowContainer from '../common/OverflowContainer.tsx';

import QuickEditor from './QuickEditor';

export default function QuickEditorHome() {
  console.log("HERERTGVVG");

  return (
    <div className='bg-gray-900'>
      <OverflowContainer>
        <div className='container m-auto'>
          <QuickEditor />
        </div>
      </OverflowContainer>
    </div>
  )
}