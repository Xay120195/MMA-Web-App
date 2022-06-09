import React, { useState, useEffect, useRef } from "react";
import ChangePassword from "../change-password";
import { AccountSettingsHeader } from "./account-settings-header";
import { AccountSettingsCategory } from "./account-settings-category";

import Illustration2 from "../../assets/images/personal-info.svg";
import WaveIllustration from "../../assets/images/wave-illustration.svg";
import { BiUser } from "react-icons/bi";
import { FaUserCog } from "react-icons/fa";
import "../../assets/styles/AccountSettings.css";
import { useIdleTimer } from "react-idle-timer";
import SessionTimeout from "../session-timeout/session-timeout-modal";
import { Auth } from "aws-amplify";
import { Redirect, useHistory } from "react-router-dom";



function AccountSettings() {
  const [userInfo, setuserInfo] = useState(null);

  let history = useHistory();
  const bool = useRef(false);
  const [showSessionTimeout, setShowSessionTimeout] = useState(false);
  


  useEffect(() => {
    if (userInfo === null) {
      let ls = {
        email: localStorage.getItem("email"),
        firstName: localStorage.getItem("firstName"),
        lastName: localStorage.getItem("lastName"),
        company: localStorage.getItem("company"),
      };
      setuserInfo(ls);
    }
  }, [userInfo]);

  var timeoutId;
  //session timeout
  const handleOnAction =  (event) => {
    //function for detecting if user moved/clicked.
    //if modal is active and user moved, automatic logout (session expired)
    //bool.current = false;
    if(showSessionTimeout){
      setTimeout(() => {
        Auth.signOut().then(() => {
          clearLocalStorage();
          console.log("Sign out completed.");
          history.push("/");
        });
      
        function clearLocalStorage() {
          localStorage.removeItem("userId");
          localStorage.removeItem("email");
          localStorage.removeItem("firstName");
          localStorage.removeItem("lastName");
          localStorage.removeItem("userType");
          localStorage.removeItem("company");
          localStorage.removeItem("companyId");
          localStorage.removeItem("access");
        }
      }, 3000);
    }

    clearTimeout(timeoutId);
  };

  const handleOnIdle = (event) => {
    //function for detecting if user is on idle.
    //after 30 mins, session-timeout modal will show
    //bool.current = true;
    timeoutId = setTimeout(() => {
      setShowSessionTimeout(true);
    }, 60000 * 40);
  };

  useIdleTimer({
    timeout: 60 * 40,
    onAction: handleOnAction,
    onIdle: handleOnIdle,
    debounce: 1000,
  });


  return (
    <>
      <div className="page-grid">
        <h1>Account Settings</h1>
        <div className="page-crumbs">
          <FaUserCog />
          <p>Account Settings</p>
        </div>
      </div>
      <div className="settings-grid">
        <div className="category-content">
          <AccountSettingsCategory
            title={"Public Profile"}
            desc={"Update your Profile Settings"}
            svg={<BiUser />}
          />
        </div>
        <div className="settings-input">
          <AccountSettingsHeader
            title={"Personal info"}
            desc={"Info about you and your preferences across MMA."}
            graphics={Illustration2}
          />
          <div className="profile-img">
            {userInfo !== null && (
              <div className="profile-img-content">
                {`${userInfo["firstName"].charAt(0)}${userInfo[
                  "lastName"
                ].charAt(0)}`}
              </div>
            )}
            {userInfo !== null && (
              <h1>{`${userInfo["firstName"]} ${userInfo["lastName"]}`}</h1>
            )}
          </div>
          <div className="input-grid">
            <div className="relative flex-auto">
              <p className="input-name">First Name</p>
              <div className="relative my-2">
                <input
                  type="text"
                  className="input-field"
                  defaultValue={userInfo?.firstName}
                />
              </div>
            </div>
            <div className="relative flex-auto">
              <p className="input-name">Last Name</p>
              <div className="relative my-2">
                <input
                  type="text"
                  className="input-field"
                  defaultValue={userInfo?.lastName}
                />
              </div>
            </div>
          </div>
          <div className="relative flex-auto">
            <p className="input-name">Company Name</p>
            <div className="relative my-2">
              <input
                type="text"
                className="input-field"
                defaultValue={userInfo?.company}
              />
            </div>
          </div>
          <div className="input-grid">
            <div className="relative flex-auto">
              <p className="input-name">Email Address</p>
              <div className="relative my-2">
                <input
                  type="text"
                  className="input-field"
                  defaultValue={userInfo?.email}
                />
              </div>
            </div>
            {/* <div className="relative flex-auto">
                            <p className="input-name">Password
                            </p>
                            <div className="relative my-2">
                                <input type="password" className="input-field" defaultValue="Test"/>
                            </div>
                        </div> */}
          </div>
          <ChangePassword />
        </div>
      </div>
      <div className="wave-illustration">
        <img src={WaveIllustration} className="w-full" alt="illusion" />
      </div>
      {showSessionTimeout && (
        <SessionTimeout/>
      )}
    </>
  );
}

export default AccountSettings;
