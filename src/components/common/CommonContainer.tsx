import React, { useEffect } from "react";
import TopNav from "./TopNav.tsx";
import { AlertDialog } from "./AlertDialog.tsx";
import { useUser } from "../../contexts/UserContext";
import { getHeaders } from '../../utils/web.js';

import axios from 'axios';
const API_SERVER = process.env.REACT_APP_PROCESSOR_API;


export default function CommonContainer(props) {
  const { children } = props;

  const { getUserAPI , user, setUser} = useUser();

  const resetCurrentSession = () => {
    if (props.resetSession) {
      props.resetSession();
    
    }
  }

  const addCustodyAddress = async (address) => {
    const headers = getHeaders();
    axios.post(`${API_SERVER}/users/add_custody_address`, { address: address }, headers).then(function (dataRes) {
      const resData = dataRes.data;

      setUser(resData);

    });
  } 
  useEffect(() => {
    const userFid = localStorage.getItem("fid");
    if (userFid) {
  
    }

  }, []);


  return (
    <div className='h-[100vh] overflow-hidden bg-cyber-black'>
      <TopNav resetCurrentSession={resetCurrentSession} addCustodyAddress={addCustodyAddress}/>
      <div>
        <AlertDialog />
        {children}
      </div>
    </div>
  )
}