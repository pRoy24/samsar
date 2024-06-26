import React from "react";
import OverflowContainer from "../common/OverflowContainer.tsx";
import UserPublications from "./UserPublications.tsx";
import CommonContainer from "../common/CommonContainer.tsx";
import { useColorMode } from "../../contexts/ColorMode.js";
import { useUser } from "../../contexts/UserContext.js";
import SecondaryButton from "../common/SecondaryButton.tsx";
import { useNavigate } from "react-router-dom";
import { FaChevronCircleLeft } from "react-icons/fa";

export default function UserAccount() {
  const { colorMode } = useColorMode();
  const textColor = colorMode === "dark" ? "text-neutral-100" : "text-neutral-800";
  const bgColor = colorMode === "dark" ? "bg-neutral-900" : "bg-neutral-100";

  const { user , resetUser} = useUser();
  const navigate = useNavigate();

  if (!user) {
    return <span />;
  }

  let accountType = "Free";
  let accountActions = <span />;
  if (user.isPremium) {
    accountType = "Premium";
    accountActions = <SecondaryButton>Cancel Membership</SecondaryButton>;
  } else {
    accountActions = <SecondaryButton>Upgrade to Premium</SecondaryButton>;
  }

  const showPurchaseCreditsAction = () => {
    console.log("showPurchaseCreditsAction");
  }

  const gotoHome = () => {
    navigate("/");
  }

  const logoutUser = () => {
    console.log("logoutUser");
    resetUser();
    navigate("/");

  }
  return (
    <CommonContainer>
      <div className={`${bgColor} ${textColor} p-4 rounded-lg shadow-md mt-[50px] `}>
        <div className="w-full pl-8 pr-8">


          <div className="flex  flex-basis items-center mb-4">
            <div className="basis-1/3 text-left pl-4">
              <div onClick={gotoHome}>
              <FaChevronCircleLeft className="mr-2 inline-flex" />
              <span>Back</span>
              </div>

            </div>
            <div className="basis-1/3 text-centert">
              <h2 className="text-2xl font-bold">Account Information</h2>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-8">
            <div>

              <div className="mb-4">
                <span className="block font-semibold">Account Type</span>
                <span>{accountType}</span>
              </div>
              <div className="mb-4">
                {accountActions}
              </div>
            </div>
            <div>
              <div className="mb-4">
                <span className="block font-semibold">Credits Remaining</span>
                <span>{user.generationCredits}</span>
              </div>
              <div>
                <SecondaryButton onClick={showPurchaseCreditsAction}>
                  Purchase Credits
                </SecondaryButton>
              </div>
            </div>
            <div className="flex justify-end">
              <SecondaryButton onClick={logoutUser}>
                Logout
              </SecondaryButton>
            </div>
          </div>
        </div>
      </div>
    </CommonContainer>
  );
}
