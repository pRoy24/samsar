import React, { useEffect, useState } from "react";
import ObjectId from 'bson-objectid';

import EditorHome from "./EditorHome.tsx";


export default function EditorLanding() {

  const [sessionID, setSessionID] = useState<string | null>(null);

  useEffect(() => {
    let sessionID = localStorage.getItem("sessionID");
    if (!sessionID) {
      const newUUID = (ObjectId()).toString();
      localStorage.setItem("sessionID", newUUID);
      sessionID = newUUID;
    }
    setSessionID(sessionID);



  }, []);

  const resetCurrentSession = () => {
    localStorage.removeItem("sessionID");
    const newUUID = (ObjectId()).toString();
    localStorage.setItem("sessionID", newUUID);
    const sessionID = newUUID;
    setSessionID(sessionID);
  }

  if (!sessionID) {
    return <span />;
  }
  return (
    <div>
      <EditorHome id={sessionID} key={sessionID}
        resetCurrentSession={resetCurrentSession} />
    </div>
  )
}