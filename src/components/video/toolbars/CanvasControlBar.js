import React from "react";
import SecondaryButton from "../../common/SecondaryButton.tsx";
import { useNavigate } from "react-router-dom";

export default function CanvasControlBar(props) {
  const { downloadCurrentFrame , isExpressGeneration , sessionId} = props;
  const navigate = useNavigate();
  console.log(isExpressGeneration);
  console.log(sessionId);
  let expressGenerationLink = null;

  const routeToExpress = () => {
    navigate(`/quick_video/${sessionId}`);
  }
  if (isExpressGeneration && sessionId) {
    expressGenerationLink = (
      <div className="float-left ml-4">
        <SecondaryButton onClick={routeToExpress}>Back To Express Mode</SecondaryButton>
      </div>
    );
  }
  return (
    <div className="h-[25px] ">
      {expressGenerationLink}
      <div className="float-right mr-4">
        <SecondaryButton className="float-right" onClick={downloadCurrentFrame}>Download Frame</SecondaryButton>
      </div>

    </div>
  )
}