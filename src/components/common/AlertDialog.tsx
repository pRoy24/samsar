
import React, { useContext, useEffect, useState } from 'react';
import { useAlertDialog } from '../../contexts/AlertDialogContext';
import { useColorMode } from '../../contexts/ColorMode';
import axios from 'axios';
import { useUser } from '../../contexts/UserContext';


const API_SERVER = process.env.REACT_APP_API_SERVER || 'http://localhost:3002';

export function AlertDialog(props) {

  const { isAlertDialogOpen, alertDialogContent, closeAlertDialog , alertDialogSubmit} = useAlertDialog();

  const { children,  } = props;
  const { colorMode } = useColorMode();



  if (!isAlertDialogOpen) return null;

  const submitAction = () => {

    closeAlertDialog();
  }

  let bgColor = colorMode === 'dark' ? 'bg-gray-800 text-neutral-100' : 'bg-neutral-100 text-neutral-900';
  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full" id="my-modal"
    style={{zIndex: 100}}>
      
      <div className={`relative top-20 mx-auto pt-1 pb-5 p-5 border w-[512px] shadow-lg rounded-md ${bgColor}`}>

        <button 
          className="absolute top-2 right-2 text-gray-400 hover:text-gray-500 focus:outline-none"
          onClick={closeAlertDialog}
        >
          <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
            <path
              fillRule="evenodd"
              d="M14.348 5.652a.5.5 0 010 .707L10.707 10l3.641 3.641a.5.5 0 11-.707.707L10 10.707l-3.641 3.641a.5.5 0 01-.707-.707L9.293 10 5.652 6.359a.5.5 0 01.707-.707L10 9.293l3.641-3.641a.5.5 0 01.707 0z"
              clipRule="evenodd"
            />
          </svg>
        </button>

        <div className="mt-1 text-center">
            {alertDialogContent}
        </div>
      </div>
    </div>
  );
}


