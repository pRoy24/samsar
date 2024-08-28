import React, { useState } from "react";
import CommonContainer from "../common/CommonContainer.tsx";
import { useColorMode } from "../../contexts/ColorMode.js";
import { useUser } from "../../contexts/UserContext.js";
import SecondaryButton from "../common/SecondaryButton.tsx";
import { useNavigate } from "react-router-dom";
import { FaChevronCircleLeft } from "react-icons/fa";
import { useAlertDialog } from "../../contexts/AlertDialogContext.js";
import AddCreditsDialog from "./AddCreditsDialog.js";
import axios from "axios";
import UpgradePlan from '../common/UpgradePlan.tsx';
import { getHeaders } from "../../utils/web.js";
import MusicPanelContent from "./MusicPanelContent.js";
import ImagePanelContent from "./ImagePanelContent.js";
const PROCESSOR_SERVER = process.env.REACT_APP_PROCESSOR_API;

export default function UserAccount() {
  const { colorMode } = useColorMode();
  const textColor = colorMode === "dark" ? "text-neutral-100" : "text-neutral-800";
  const bgColor = colorMode === "dark" ? "bg-neutral-900" : "bg-neutral-100";

  const { openAlertDialog } = useAlertDialog();
  const { user, resetUser, getUserAPI } = useUser();
  const navigate = useNavigate();

  const [displayPanel, setDisplayPanel] = useState("account"); // Default display is "account"

  if (!user) {
    return <span />;
  }

  let accountType = "Free";
  let accountActions = <span />;

  if (user.isPremiumUser) {
    accountType = "Premium";
    accountActions = (
      <SecondaryButton onClick={() => handleCancelMembership()}>
        Cancel Membership
      </SecondaryButton>
    );
  } else {
    accountActions = (
      <SecondaryButton onClick={() => handleUpgradeToPremium()}>
        Upgrade to Premium
      </SecondaryButton>
    );
  }

  const purchaseCreditsForUser = (amountToPurchase) => {
    const purchaseAmountRequest = parseInt(amountToPurchase);
    const headers = getHeaders();

    const payload = {
      amount: purchaseAmountRequest,
    };

    axios
      .post(`${PROCESSOR_SERVER}/users/purchase_credits`, payload, headers)
      .then(function (dataRes) {
        console.log(dataRes);
        const data = dataRes.data;

        if (data.url) {
          window.open(data.url, "_blank");
        } else {
          console.error("Failed to get Stripe payment URL");
        }
      })
      .catch(function (error) {
        console.error("Error during payment process", error);
      });
  };

  const showPurchaseCreditsAction = () => {
    openAlertDialog(
      <AddCreditsDialog purchaseCreditsForUser={purchaseCreditsForUser} 
      requestApplyCreditsCoupon={requestApplyCreditsCoupon}/>
    );
  };

  const handleUpgradeToPremium = () => {
    const alertDialogComponent = <UpgradePlan />;
    openAlertDialog(alertDialogComponent);
  };

  const handleCancelMembership = () => {
    const headers = getHeaders();
    axios.post(`${PROCESSOR_SERVER}/users/cancel_membership`, {}, headers).then(function (dataRes) {
      getUserAPI();
    });
  };

  const handleDeleteAccount = () => {
    // Implement your delete account logic here
  };

  const handleDeleteAllSessions = () => {
    // Implement delete all sessions logic here
  };

  const handleDeleteAllGenerations = () => {
    // Implement delete all generations logic here
  };


  const requestApplyCreditsCoupon = (couponCode) => {
    console.log("APPLY CREDITS COUPON " + couponCode);
  }

  const gotoHome = () => {
    const sessionIDLocal = localStorage.getItem("videoSessionId");
    if (sessionIDLocal) {
      navigate(`/video/${sessionIDLocal}`);
    } else {
      navigate("/");
    }
  };

  const logoutUser = () => {
    resetUser();
    navigate("/");
  };

  const renderPanelContent = () => {
    switch (displayPanel) {
      case "account":
        return (
          <div className="grid grid-cols-3 gap-4">
            <div>
              <div className="mb-4">
                <span className="block font-semibold">Account Type</span>
                <span>{accountType}</span>
              </div>
              <div className="mb-4">{accountActions}</div>
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
            <div className="flex flex-col justify-between">
              <div />
              <SecondaryButton onClick={logoutUser}>Logout</SecondaryButton>
            </div>
          </div>
        );
      case "images":
        return <ImagePanelContent />;
      case "sounds":
        return <MusicPanelContent />;
      case "billing":
        return <div>Billing Panel Content</div>;
      default:
        return <div>Account Panel Content</div>;
    }
  };

  return (
    <CommonContainer>
      {/* Back Button and Header */}
      <div className="flex items-center mb-6">
        <div className="flex-1 text-left">
          <div onClick={gotoHome} className="cursor-pointer flex items-center mt-[-6px]">
            <FaChevronCircleLeft className="mr-2" />
            <span>Back</span>
          </div>
        </div>
        <div className="flex-1 flex justify-center items-center">
          <h2 className="text-2xl font-bold">Account Information</h2>
        </div>
        <div className="flex-1"></div>
      </div>

      <div className="flex h-[100vh]">
        {/* Left Navigation */}
        <nav className={`w-1/4 p-4 ${bgColor} ${textColor} rounded-l-lg shadow-md border-r`}>
          <ul>
            <li className="mb-4 cursor-pointer" onClick={() => setDisplayPanel("account")}>
              Account
            </li>
            <li className="mb-4 cursor-pointer" onClick={() => setDisplayPanel("images")}>
              Images
            </li>
            <li className="mb-4 cursor-pointer" onClick={() => setDisplayPanel("sounds")}>
              Sounds
            </li>
            <li className="mb-4 cursor-pointer" onClick={() => setDisplayPanel("billing")}>
              Billing
            </li>
            <li className="mb-4 cursor-pointer" onClick={logoutUser}>
              Logout
            </li>
          </ul>
        </nav>

        {/* Main Content */}
        <div
          className={`${bgColor} ${textColor} p-6 rounded-r-lg shadow-md flex-grow flex flex-col justify-between`}
        >
          <div>
            {renderPanelContent()}
          </div>

          <div className="mt-2">
            {displayPanel === "account" && (
              <div className="mt-auto">
                <div className="text-red-600 font-semibold">Danger Zone</div>
                <div className="flex gap-4 mt-2">
                  <SecondaryButton onClick={handleDeleteAllSessions}>
                    Delete All Sessions
                  </SecondaryButton>
                  <SecondaryButton onClick={handleDeleteAllGenerations}>
                    Delete All Generations
                  </SecondaryButton>
                  <SecondaryButton onClick={handleDeleteAccount}>
                    Delete Account
                  </SecondaryButton>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </CommonContainer>
  );
}
