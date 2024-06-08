import React, { useState } from "react";
import { FaHand } from "react-icons/fa6";
import { FaDownload, FaExpandArrowsAlt, FaPencilAlt, FaEraser, FaUpload, FaSave, FaCrosshairs } from "react-icons/fa";
import { CANVAS_ACTION, CURRENT_TOOLBAR_VIEW } from "../../../constants/Types.ts";
import { HiTemplate } from "react-icons/hi";
import { useColorMode } from "../../../contexts/ColorMode.js";

export default function ActionToolbar(props) {
  const { setCurrentAction, setCurrentViewDisplay, showMoveAction, showResizeAction,
    showSaveAction, showUploadAction,

    pencilWidth,
    setPencilWidth,
    pencilColor,
    setPencilColor,
    eraserWidth,
    setEraserWidth,
    pencilOptionsVisible,
    setPencilOptionsVisible,
    eraserOptionsVisible,
    setEraserOptionsVisible,
    cursorSelectOptionVisible,
    setCursorSelectOptionVisible,
  } = props;

  const { colorMode } = useColorMode();



  let bgColor = "bg-cyber-black border-blue-900 text-white ";
  if (colorMode === 'light') {
    bgColor = "bg-neutral-50  text-neutral-900 ";
  }

  let bgSelectedColor = colorMode === 'dark' ? "bg-gray-800" : "bg-gray-200";

  const togglePencilOptions = () => {
    setPencilOptionsVisible(!pencilOptionsVisible);
    setEraserOptionsVisible(false);
    setCursorSelectOptionVisible(false);
  };

  const toggleEraserOptions = () => {
    setEraserOptionsVisible(!eraserOptionsVisible);
    setPencilOptionsVisible(false);
    setCursorSelectOptionVisible(false);

  };

  const showTemplateAction = () => {
    setPencilOptionsVisible(false);
    setEraserOptionsVisible(false);
    setCursorSelectOptionVisible(false);
    setCurrentViewDisplay(CURRENT_TOOLBAR_VIEW.SHOW_TEMPLATES_DISPLAY)
  }

  const toggleCursorSelectOptions = () => {
    setCursorSelectOptionVisible(!cursorSelectOptionVisible);
    setPencilOptionsVisible(false);
    setEraserOptionsVisible(false);
  };



  return (
    <div className={`border-r-2 ${bgColor} shadow-lg h-full m-auto fixed top-0 overflow-auto w-[5%] `}>
      <div className="h-[60%]">
        <div className=" mt-[80px]">
          <div className={`text-center m-auto align-center mt-4 mb-4 pt-2 pb-2 ${cursorSelectOptionVisible ? bgSelectedColor : bgColor}`}>
            <FaCrosshairs className="text-2xl m-auto cursor-pointer" onClick={toggleCursorSelectOptions} />
            <div className="text-[10px] tracking-tight m-auto text-center">
              Select
            </div>
          </div>


          <div className={`text-center m-auto align-center mt-4 mb-4 pt-2 pb-2 ${pencilOptionsVisible ? bgSelectedColor : bgColor}`}>
            <FaPencilAlt className="text-2xl m-auto cursor-pointer" onClick={togglePencilOptions} />
            <div className="text-[10px] tracking-tight m-auto text-center">
              Pencil
            </div>
            {pencilOptionsVisible && (
              <div className="static mt-2  rounded shadow-lg">
                <label className="block mb-2">Width:</label>
                <input type="range" min="1" max="50"
                  className="w-full" value={pencilWidth} onChange={(e) => setPencilWidth(e.target.value)} />
                <label className="block mt-2 mb-2">Color:</label>
                <input type="color" value={pencilColor} onChange={(e) => setPencilColor(e.target.value)} />
              </div>
            )}
          </div>

          <div className={`text-center m-auto align-center mt-4 mb-4 pt-2 pb-2 ${eraserOptionsVisible ? bgSelectedColor : bgColor}`}>
            <FaEraser className="text-2xl m-auto cursor-pointer" onClick={toggleEraserOptions} />
            <div className="text-[10px] tracking-tight m-auto text-center">
              Magic Eraser
            </div>
            {eraserOptionsVisible && (
              <div className="static mt-2  rounded shadow-lg ">
                <label className="block mb-2">Width:</label>
                <input type="range" min="1" max="100" className="w-full"
                  value={eraserWidth} onChange={(e) => setEraserWidth(e.target.value)} />
              </div>
            )}
          </div>


        </div>
      </div>
      <div>
        <div className="text-center m-auto align-center mt-4 mb-4">
          <FaUpload className="text-2xl m-auto cursor-pointer" onClick={() => showUploadAction()} />
          <div className="text-[12px] tracking-tight m-auto text-center">
            Upload
          </div>
        </div>
      </div>
      <div>
        <div className="text-center m-auto align-center mt-4 mb-4">
          <FaSave className="text-2xl m-auto cursor-pointer" onClick={() => showSaveAction()} />
          <div className="text-[12px] tracking-tight m-auto text-center">
            Save
          </div>
        </div>
      </div>
    </div>
  );
}
