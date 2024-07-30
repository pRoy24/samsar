import React, { useEffect } from "react";
import { useNavigate, Routes, Route } from 'react-router-dom';
import { useMediaQuery } from 'react-responsive';
import axios from "axios";

import CommonContainer from "../common/CommonContainer.tsx";
import EditorHome from "../editor/EditorHome.tsx";
import EditorLanding from '../editor/EditorLanding.tsx';
import UserAccount from "../account/UserAccount.tsx";
import ListProduct from "../product/ListProduct.tsx";
import PublicationHome from "../publication/PublicationHome.tsx";
import VerificationHome from "../verification/VerificationHome.tsx";
import VideoHome from "../video/VideoHome.js";
import MobileVideoHome from "../mobile/MobileVideoHome.js";
import AppHome from "./AppHome.tsx";
import { getHeaders } from '../../utils/web.js';
import { useUser } from "../../contexts/UserContext";
import VideoEditorLandingHome from "../video/VideoEditorLandingHome.js";
import ListVideoSessions from "../video/sessions/ListVideoSessions.js";

const PROCESSOR_SERVER = process.env.REACT_APP_PROCESSOR_API;

export default function Home() {
  const { getUser, getUserAPI } = useUser();
  const navigate = useNavigate();
  const isMobile = useMediaQuery({ query: '(max-width: 767px)' });

  useEffect(() => {
    getUserAPI();
  }, []);

  const channel = new BroadcastChannel('oauth_channel');
  channel.onmessage = (event) => {
    if (event.data === 'oauth_complete') {
      console.log('OAuth authentication completed');
      getUserAPI();
      getOrCreateUserSession();
    }
  };

  const getOrCreateUserSession = () => {
    const headers = getHeaders();
    axios.get(`${PROCESSOR_SERVER}/video_sessions/get_or_create_session`, { headers }).then((res) => {
      const sessionData = res.data;
      localStorage.setItem('videoSessionId', sessionData._id);
      navigate(`/video/${sessionData._id}`);
    });
  };

  return (
    <>
      <Routes>
        <Route path="/" element={<VideoEditorLandingHome />} />
        <Route path="/session/:id" element={<EditorHome />} />
        <Route path="/video" element={isMobile ? <MobileVideoHome /> : <VideoEditorLandingHome />} />
        <Route path="/video/:id" element={isMobile ? <MobileVideoHome /> : <VideoHome />} />
        <Route path="/my_sessions" element={<ListVideoSessions />} />
        <Route path="/account" element={<UserAccount />} />
        <Route path="/publication/:id" element={<PublicationHome />} />
        <Route path="/verify" element={<VerificationHome />} />
        {/* Add more routes as needed */}
      </Routes>
    </>
  );
}
