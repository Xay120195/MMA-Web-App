import React, { useState, useEffect } from "react";
import { Redirect, useHistory } from "react-router-dom";
import ToastNotification from "../toast-notification";
import Illustration from "../../assets/images/session-timeout.png";
import { Auth } from "aws-amplify";
import {AiFillRightCircle} from "react-icons/ai";


export default function SessionTimeout() {
  let history = useHistory();
  const [showToast, setShowToast] = useState(false);
  const [alertMessage, setalertMessage] = useState();
    useEffect(() => {
        //Signout();
    });

  const hideToast = () => {
    setShowToast(false);
  };

  async function Signout(){
      await Auth.signOut().then(() => {
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
  
  }

  const imageSize = {
    width: 400,
    height: 400
  };

  return (
  <>
    <div className="justify-center items-center flex overflow-x-hidden overflow-y-auto fixed inset-0 z-50 outline-none focus:outline-none">
      <div className="fixed w-full my-6 mx-auto h-full">
        <div className="w-full h-full border-0 rounded-lg shadow-lg relative w-full bg-white outline-none focus:outline-none">
          <div className="items-center w-full h-full ">   
            <div className=" details-txt text-center content-center">
                <div className="flex items-center justify-center mt-20">
                    <img src={Illustration} alt="" style={imageSize} />
                </div>
                <h1 className="text-center content-center">
                    Session Timeout
                </h1>
                <p className="content-center items-center justify-items-center">
                    You weren't clicking around anymore, so we logged you out for your protection.
                    Please Login again.
                </p>
                <div className="text-center content-center">
                  <button className="bg-gray-800 text-white px-3 py-1 rounded"
                    onClick={()=>Signout()}
                  >
                    <div className="inline-flex text-white mt-1">Go to Login <AiFillRightCircle className="mt-1/2 ml-1"/></div>
                  </button>
                </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    </>
  );
}
