import React from "react";
import CommonContainer from "../common/CommonContainer.tsx";
import { useEffect } from "react";
import EditorHome from "../editor/EditorHome.tsx";
import EditorLanding from '../editor/EditorLanding.tsx';
import UserAccount from "../account/UserAccount.tsx";
import ListProduct from "../product/ListProduct.tsx";
import PublicationHome from "../publication/PublicationHome.tsx";
import VerificationHome from "../verification/VerificationHome.tsx";
import VideoHome from "../video/VideoHome.js";

import AppHome from "./AppHome.tsx";
import axios from "axios";
import { useUser } from "../../contexts/UserContext";

import { Routes, Route } from 'react-router-dom';

import VideoEditorLandingHome from "../video/VideoEditorLandingHome.js";
import ListVideoSessions from "../video/sessions/ListVideoSessions.js";

const PROCESSOR_SERVER = process.env.REACT_APP_PROCESSOR_API;

export default function Home() {

  const { getUser, getUserAPI } = useUser();
  useEffect(() => {
    getUserAPI();
  }, []);


  const channel = new BroadcastChannel('oauth_channel');
  channel.onmessage = (event) => {
    if (event.data === 'oauth_complete') {
        console.log('OAuth authentication completed');
        getUserAPI();
    }
  };


  return (
    <>
      <Routes>
        <Route path="/" element={<VideoEditorLandingHome />} />
        <Route path="/session/:id" element={<EditorHome />} />
        <Route path="/video" element={<VideoEditorLandingHome />} />
        <Route path="/video/:id" element={<VideoHome />} />
        <Route path="/my_sessions" element={<ListVideoSessions />} />

        <Route path="/account" element={<UserAccount />} />
        <Route path="/publication/:id" element={<PublicationHome />} />
        <Route path="/verify" element={<VerificationHome />} />  
        {/* Add more routes as needed */}
      </Routes>

    </>
  );
}