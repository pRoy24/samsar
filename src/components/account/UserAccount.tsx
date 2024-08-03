import React from "react";
import OverflowContainer from "../common/OverflowContainer.tsx";
import UserPublications from "./UserPublications.tsx";
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
const PROCESSOR_SERVER = process.env.REACT_APP_PROCESSOR_API;

export default function UserAccount() {
  const { colorMode } = useColorMode();
  const textColor = colorMode === "dark" ? "text-neutral-100" : "text-neutral-800";
  const bgColor = colorMode === "dark" ? "bg-neutral-900" : "bg-neutral-100";

  const { openAlertDialog } = useAlertDialog();

  const { user, resetUser, getUserAPI } = useUser();
  const navigate = useNavigate();

  if (!user) {
    return <span />;
  }

  let accountType = "Free";
  let accountActions = <span />;
  console.log(user);

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
    console.log("purchaseCreditsForUser", amountToPurchase);

    const purchaseAmountRequest = parseInt(amountToPurchase);

    console.log(purchaseAmountRequest);
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
          // Open the Stripe payment page in a new tab
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
    console.log("showPurchaseCreditsAction");

    openAlertDialog(
      <AddCreditsDialog purchaseCreditsForUser={purchaseCreditsForUser} />
    );
  };

  const handleUpgradeToPremium = () => {
    const alertDialogComponent = <UpgradePlan />;
    openAlertDialog(alertDialogComponent);
  };

  const handleCancelMembership = () => {
    console.log("Cancel Membership clicked");
    const headers = getHeaders();
    axios.post(`${PROCESSOR_SERVER}/users/cancel_membership`, {}, headers).then(function (dataRes) {
      getUserAPI();
    });
    // Implement your cancel membership logic here
  };

  const handleDeleteAccount = () => {
    console.log("Delete Account clicked");
    // Implement your delete account logic here
  };

  const gotoHome = () => {
    const sessionIDLocal = localStorage.getItem("videoSessionId");
    if (sessionIDLocal) {
      navigate(`/video/${sessionIDLocal}`);
    } else {
      navigate("/");
    }
  };

  const logoutUser = () => {
    console.log("logoutUser");
    resetUser();
    navigate("/");
  };




  return (
    <CommonContainer>
      <div
        className={`${bgColor} ${textColor} p-6 rounded-lg shadow-md mt-[50px] h-[calc(100vh-100px)] flex flex-col`}
      >
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

        <div className="flex-grow grid grid-cols-3 gap-2 mt-4 ">
          <div className="col-span-1">
            <div className="mb-4">
              <span className="block font-semibold">Account Type</span>
              <span>{accountType}</span>
            </div>
            <div className="mb-4">{accountActions}</div>
          </div>
          <div className="col-span-1">
            <div className="mb-4">
              <span className="block font-semibold ">Credits Remaining</span>
              <span>{user.generationCredits}</span>
            </div>
            <div>
              <SecondaryButton onClick={showPurchaseCreditsAction}>
                Purchase Credits
              </SecondaryButton>
            </div>
          </div>
          <div className="col-span-1 ">
            <div className="h-4">

            </div>
            <SecondaryButton onClick={logoutUser}>Logout</SecondaryButton>
          </div>
        </div>

        <div className="mt-8">
          <div className="text-red-600 font-semibold">Danger Zone</div>
          <SecondaryButton onClick={handleDeleteAccount} className="mt-2">
            Delete Account
          </SecondaryButton>
        </div>
      </div>
    </CommonContainer>
  );
}
