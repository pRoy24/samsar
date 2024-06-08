import React from "react";
import CommonButton from "../../common/CommonButton.tsx";
import { IMAGE_EDIT_MODEL_TYPES } from "../../../constants/Types.ts";
import { useColorMode } from "../../../contexts/ColorMode.js";

export default function OutpaintGenerator(props) {
  const { promptText, setPromptText, submitOutpaintRequest,
    selectedEditModel, setSelectedEditModel,
    isOutpaintPending, outpaintError
  } = props;
  const { colorMode } = useColorMode();


  const modelOptionMap = IMAGE_EDIT_MODEL_TYPES.map((model) => {
    return (
      <option key={model.key} value={model.key} selected={model.key === selectedEditModel}>
        {model.name}
      </option>
    )
  })

  const setSelectedModelDisplay = (evt) => {
    setSelectedEditModel(evt.target.value);
  }

  let editOptionsDisplay = <span />;

  const formElementBG = colorMode === "dark" ? "bg-gray-800 text-neutral-50" : "bg-gray-100 text-neutral-800 ";
  const textElementBG = colorMode === "dark" ? "bg-gray-800 text-neutral-50" : "bg-gray-100 text-neutral-800 border-gray-600 border-2"; 

  if (selectedEditModel === "SDXL") {

    editOptionsDisplay = (<div className="grid grid-cols-3 gap-1">
      <div>
        <input type="text" className={`${formElementBG} w-[96%] pl-2 pr-2`} name="guidanceScale" defaultValue={5}/>
        <div className="text-xs ">
            Guidance 
         </div> 
      </div>
      <div>
        <input type="text" className={`${formElementBG} w-[96%] pl-2 pr-2`} name="numInferenceSteps" defaultValue={30}/>
        <div className="text-xs">
          Inference
        </div>  
      </div>
      <div>

        <input type="text" className={`${formElementBG} w-[96%] pl-2 pr-2`} name="strength" defaultValue={0.99} />
        <div className="text-xs">
          Strength
        </div>  
      </div>

    </div>);
  }
  
  const errorDisplay = outpaintError ? (
    <div className="text-red-500 text-center text-sm">
      {outpaintError}
    </div>
  ) : null;

  return (
    <div>
      <form onSubmit={submitOutpaintRequest}>
      <div className=" w-full mt-2 mb-2">
        <div className="block">
          <div className="text-xs font-bold">
            Model
          </div>
          <select onChange={setSelectedModelDisplay}  className={`${formElementBG} inline-flex w-[75%]`}>
            {modelOptionMap}
          </select>
        </div>
        <div className="block">
          {editOptionsDisplay}
        </div>
      </div>

      <textarea name="promptText" onChange={(evt) => setPromptText((evt.target.value))}
        className={`${textElementBG} w-full m-auto p-4 rounded-lg`} />
      <div className="text-center">
        <CommonButton type="submit"  isPending={isOutpaintPending}>
          Submit
        </CommonButton>
      </div>
      </form>
      {errorDisplay}
    </div>
  )
}
