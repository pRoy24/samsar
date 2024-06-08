import React, { useState, useEffect } from "react";
import CommonButton from "../../common/CommonButton.tsx";
import { IMAGE_GENERAITON_MODEL_TYPES } from "../../../constants/Types.ts";
import { useColorMode } from "../../../contexts/ColorMode.js";

export default function PromptGenerator(props) {
  const { promptText, setPromptText, submitGenerateRequest, isGenerationPending,
     selectedGenerationModel, setSelectedGenerationModel, generationError } = props;

  const { colorMode } = useColorMode();

  const selectBG = colorMode === "dark" ? "bg-gray-800" : "bg-gray-200";
  const textBG = colorMode === "dark" ? "bg-gray-800" : "bg-gray-200 border-gray-600 border-2";
  
  const modelOptionMap = IMAGE_GENERAITON_MODEL_TYPES.map((model) => {
    return (
      <option key={model.key} value={model.key} selected={model.key === selectedGenerationModel}>
        {model.name}
      </option>
    )
  })

  const setSelectedModelDisplay = (evt) => {
    setSelectedGenerationModel(evt.target.value);
  }

  const errorDisplay = generationError ? (
    <div className="text-red-500 text-center text-sm">
      {generationError}
    </div>
  ) : null;
  return (
    <div>
      <div className="flex w-full mt-2 mb-2">
        <div className="inline-flex w-[25%]">
          <div className="text-xs font-bold">
            Model
          </div>
        </div>
        <select onChange={setSelectedModelDisplay} className={`${selectBG} inline-flex w-[75%]`}>
          {modelOptionMap}
        </select>
      </div>

      <textarea onChange={(evt) => setPromptText((evt.target.value))}
      placeholder="Add prompt text here" className={`${textBG} w-full m-auto p-4 rounded-lg`} />
      <div className="text-center">
        <CommonButton onClick={submitGenerateRequest} isPending={isGenerationPending} >
          Submit
        </CommonButton>
      </div>
      {errorDisplay}

    </div>
  )
}