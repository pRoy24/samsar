import React, { useEffect } from "react";
import { useMediaQuery } from 'react-responsive';
import TopNav from "./TopNav.tsx";
import MobileTopNav from "./MobileTopNav.tsx";
import { AlertDialog } from "./AlertDialog.tsx";
import { useUser } from "../../contexts/UserContext";

export default function OverflowContainer(props) {
  const { children } = props;
  const { getUserAPI } = useUser();

  const resetCurrentSession = () => {
    if (props.resetSession) {
      props.resetSession();
    }
  }

  const addCustodyAddress = (address) => {
    // Function to add custody address
  }



  const isMobile = useMediaQuery({ maxWidth: 767 });

  return (
    <div className='h-[100vh] overflow-y-auto'>
      {isMobile ? (
        <MobileTopNav
          resetCurrentSession={resetCurrentSession}
          addCustodyAddress={addCustodyAddress}
        />
      ) : (
        <TopNav
          resetCurrentSession={resetCurrentSession}
          addCustodyAddress={addCustodyAddress}
        />
      )}
      <div>
        <AlertDialog />
        {children}
      </div>
    </div>
  )
}
