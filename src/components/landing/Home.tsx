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
import QuickEditorContainer from "../quick_editor/QuickEditorContainer.js";

import QuickEditorLandingHome from "../quick_editor/QuickEditorLandingHome.js";
import MobileVideoLandingHome from "../mobile/MobileVideoLandingHome.js";

import PaymentsSuccess from "../payments/PaymentsSuccess.js";
import PaymentsFailure from "../payments/PaymentsFailure.js";

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
      let currentMediaFlowPath = localStorage.getItem('currentMediaFlowPath');
      if (currentMediaFlowPath && currentMediaFlowPath === 'quick_video') {
        navigate(`/quick_video/${sessionData._id}`);
      } else {
        navigate(`/video/${sessionData._id}`);
      }
    });
  };

  return (
    <>
      <Routes>
        <Route path="/" element={<VideoEditorLandingHome />} />
        <Route path="/session/:id" element={<EditorHome />} />
        <Route path="/video" element={isMobile ? <MobileVideoLandingHome /> : <VideoEditorLandingHome />} />
        <Route path="/video/:id" element={isMobile ? <MobileVideoHome /> : <VideoHome />} />
        <Route path="/quick_video/:id" element={isMobile ? <MobileVideoHome /> : <QuickEditorContainer />} />
        <Route path="/quick_video" element={isMobile ? <MobileVideoLandingHome /> : <QuickEditorLandingHome />} />
        <Route path="/my_sessions" element={<ListVideoSessions />} />
        <Route path="/account" element={<UserAccount />} />
        <Route path="/publication/:id" element={<PublicationHome />} />
        <Route path="/verify" element={<VerificationHome />} />
        <Route path="/payment_success" element={<PaymentsSuccess />} />
        <Route path="/payment_cancel" element={<PaymentsFailure />} />

        {/* Add more routes as needed */}
      </Routes>
    </>
  );
}
