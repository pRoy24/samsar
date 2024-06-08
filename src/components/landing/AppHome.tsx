import React from 'react';
import { useUser } from "../../contexts/UserContext";
import PublicLanding from "./PublicLanding.tsx";
import CreatorLanding from "./CreatorLanding.tsx";
import OverflowContainer from '../common/OverflowContainer.tsx';

export default function AppHome() {

  const channel = new BroadcastChannel('oauth_channel');
  channel.onmessage = (event) => {
    if (event.data === 'oauth_complete') {
        console.log('OAuth authentication completed');
    }
  };

  return (
    <OverflowContainer>
      <CreatorLanding />
    </OverflowContainer>
  )
}
