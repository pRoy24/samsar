import React from "react";
import { FaSpinner } from "react-icons/fa6";
import { useUser } from "../../contexts/UserContext";
import { useColorMode } from "../../contexts/ColorMode";

export default function SecondaryButton(props) {
  const { children , onClick, isPending, extraClasses} = props;
  const { user } = useUser();
  const { colorMode } = useColorMode();


  let isBtnDisabled = false;

  if (!user || !user._id) {
    isBtnDisabled = true;
  }
  
  let pendingSpinner = <span />;
  if (isPending) {
    pendingSpinner = <FaSpinner className="animate-spin inline-flex ml-2" />;
  }

  const bgColor = colorMode === 'dark' ? `text-neutral-100  border-2 border-gray-400 from-neutral-900 to-gray-800
   text-neutral-200 hover:bg-gray-800 hover:text-neutral-100` :
    `text-neutral-100  from-green-500 to-green-600  hover:bg-green-60 hover:text-neutral-300`;
  return (
    <button onClick={onClick} className={`m-auto text-center min-w-8
    rounded-lg shadow-sm 
    ${bgColor}
    font-bold
    bg-gradient-to-r 
    pl-2 pr-2 pt-1 pb-1 text-bold
    shadow-lg 
    cursor:pointer text-sm
    disabled:opacity-50 disabled:cursor-not-allowed disabled:bg-gray-800 disabled:text-neutral-100 ${extraClasses}`}
    disabled={isBtnDisabled}>
      {children}
      {pendingSpinner}
    </button>
  )
}