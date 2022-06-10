import React, { useState, useEffect, useRef } from "react";
import BlankState from "../dynamic-blankstate";
import { MdArrowForwardIos } from "react-icons/md";
import ToastNotification from "../toast-notification";
import { IoIosArrowDropright } from "react-icons/io";
import { AiOutlineFolderOpen } from "react-icons/ai";
// import BlankList from "../../assets/images/RFI_Blank_List.svg";
import BlankQuestion from "../../assets/images/RFI_Blank_State.svg";
import BlankAnswer from "../../assets/images/RFI_Blank_Answer.svg";
import { Link } from "react-router-dom";
import { AppRoutes } from "../../constants/AppRoutes";
import { useIdleTimer } from "react-idle-timer";
import SessionTimeout from "../session-timeout/session-timeout-modal";
import { Auth } from "aws-amplify";
import { Redirect, useHistory } from "react-router-dom";

export default function RFIPage() {
  const [showToast, setShowToast] = useState(false);
  const [alertMessage, setalertMessage] = useState();
  let history = useHistory();
  const bool = useRef(false);
  const [showSessionTimeout, setShowSessionTimeout] = useState(false);


  const hideToast = () => {
    setShowToast(false);
  };

  const contentDiv = {
    margin: "0 0 0 65px",
  };

  const mainGrid = {
    display: "grid",
    gridtemplatecolumn: "1fr auto",
  };


  const rfiListUrl =
    AppRoutes.MATTERSRFI +
    "/" +
    getParameterByName("matter_id") +
    "/?matter_name=" +
    getParameterByName("matter_name") +
    "&client_name=" +
    getParameterByName("client_name");

  function getParameterByName(name, url = window.location.href) {
    name = name.replace(/[\[\]]/g, "\\$&");
    var regex = new RegExp("[?&]" + name + "(=([^&#]*)|&|#|$)"),
      results = regex.exec(url);
    if (!results) return null;
    if (!results[2]) return "";
    return decodeURIComponent(results[2].replace(/\+/g, " "));
  }

  function utf8_to_b64(str) {
    return window.btoa(unescape(encodeURIComponent(str)));
  }

  function b64_to_utf8(str) {
    return decodeURIComponent(escape(window.atob(str)));
  }

  var timeoutId;

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
      <div
        className={
          "p-5 relative flex flex-col min-w-0 break-words mb-6 shadow-lg rounded bg-white"
        }
        style={contentDiv}
      >
        <div className="relative flex-grow flex-1">
          <div style={mainGrid}>
            <div>
              <h1 className="text-3xl">
                <span className="font-bold text-3xl flex-inline">
                  {" "}
                  <IoIosArrowDropright className="h-8 w-8 absolute -ml-1 " />{" "}
                  &nbsp;&nbsp;&nbsp;&nbsp; Request For Information{" "}
                </span>
                of
                <span className="text-gray-500 text-3xl ml-2">
                  {b64_to_utf8(getParameterByName("rfi_name"))}
                </span>
              </h1>
            </div>
            <div className="py-3">
              <span className="font-medium py-2 flex px-3">
                <AiOutlineFolderOpen /> &nbsp; RFI
              </span>
            </div>

            <div className="absolute right-0">
              <Link to={rfiListUrl}>
                <button className="bg-white hover:bg-gray-100 text-black font-semibold py-2.5 px-4 rounded inline-flex items-center border-0 shadow outline-none focus:outline-none focus:ring">
                  Back &nbsp;
                  <MdArrowForwardIos />
                </button>
              </Link>
            </div>
          </div>

          <div className="mt-7">
            {/* <div>
              <input
                type="search"
                placeholder="Search ..."
                onChange={handleSearchChange}
                className="px-3 py-3 placeholder-blueGray-300 text-blueGray-600 relative bg-white rounded text-sm border-0 shadow outline-none focus:outline-none focus:ring pl-5 float-right w-3/12"
              />
            </div> */}
          </div>
        </div>

        <div className="shadow overflow-hidden border-b border-gray-200 sm:rounded-lg my-5">
          <table className="table-fixed divide-y divide-x border-slate-500 border flex-1 w-full">
            <thead>
              <tr>
                <th className="text-left py-4 px-4 border-slate-500 border">
                  Question
                </th>
                <th className="text-left py-4 px-4 border-slate-500 border">
                  <IoIosArrowDropright className="h-8 w-8 absolute -ml-8 -mt-1" />{" "}
                  &nbsp; Answer
                </th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="border-slate-500 border ">
                  <BlankState
                    displayText={"There are no questions to show here yet"}
                    txtLink={"start adding one"}
                    iconDisplay={BlankQuestion}
                  />
                </td>
                <td className="border-slate-500 border ">
                  <BlankState
                    displayText={"There are no answers to show in this section"}
                    noLink={
                      "Start creating your RFIs to collaborate with your client"
                    }
                    iconDisplay={BlankAnswer}
                  />
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {showToast && (
        <ToastNotification title={alertMessage} hideToast={hideToast} />
      )}
      {showSessionTimeout && (
        <SessionTimeout/>
      )}
    </>
  );
}
