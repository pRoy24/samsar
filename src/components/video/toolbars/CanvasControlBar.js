import React from "react";
import SecondaryButton from "../../common/SecondaryButton.tsx";

export default function CanvasControlBar(props) {
  const { downloadCurrentFrame } = props;
  return (
    <div className="h-[25px] ">
      <div className="float-right mr-4">
        <SecondaryButton className="float-right" onClick={downloadCurrentFrame}>Download Frame</SecondaryButton>
      </div>

    </div>
  )
}