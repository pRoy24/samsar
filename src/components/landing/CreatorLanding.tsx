import React from 'react';
import ListSessions from '../product/ListSessions.tsx';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { useUser } from '../../contexts/UserContext.js';

const PROCESSOR_SERVER = process.env.REACT_APP_PROCESSOR_API;

export default function CreatorLanding(props) {

  const navigate = useNavigate();
  const { user } = useUser();

  const createNewSession = () => {
    axios.post(`${PROCESSOR_SERVER}/sessions/create`, {
      fid: user.fid,
    }).then((res) => {
      console.log(res);
      navigate(`/session/${res.data._id}`, { replace: true });
      //  window.location.href = `/session/${res.data.id}`;
    }).catch((err) => {
      console.log(err);
    });

  }

  return (
    <div>
      <div className=' bg-stone-200 rounded-lg m-auto text-center w-full pt-[50px] pb-[50px]'>

          <button className='w-[200px] bg-gradient-to-r h-[64px] m-auto from-green-950 to-green-700
          text-neutral-100 font-bold rounded-lg hover:from-green-800 hover:to-green-950 shadow-lg mt-8' onClick={() => createNewSession()}>
            Create new session
          </button>
          <div className='text-xs text-color-neutral-600 mt-1'>
            Create a new Image Session
          </div>
      </div>
      <div>
        <ListSessions />
      </div>
    </div>
  )
}