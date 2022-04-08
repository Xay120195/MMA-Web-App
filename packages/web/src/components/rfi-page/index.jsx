import React, { useState, useEffect } from "react";
import BlankState from "../dynamic-blankstate";
import { MdArrowForwardIos, MdDownload } from "react-icons/md";
import ToastNotification from "../toast-notification";
import { IoIosArrowDroprightCircle, IoIosArrowDropright } from "react-icons/io";
import { AiOutlineFolderOpen } from "react-icons/ai";
import BlankList from "../../assets/images/RFI_Blank_List.svg";
import BlankQuestion from "../../assets/images/RFI_Blank_State.svg";
import BlankAnswer from "../../assets/images/RFI_Blank_Answer.svg";


export default function RFIPage() {
  const [showToast, setShowToast] = useState(false);
  const [alertMessage, setalertMessage] = useState();

  const hideToast = () => {
    setShowToast(false);
  };

  const contentDiv = {
    margin: "0 0 0 65px"
  };

  const mainGrid = {
    display: "grid",
    gridtemplatecolumn: "1fr auto"
  };

  var dummyData = [
    {id: 111, name: "RFI 1", datecreated: "Jan 01, 2022"},
    {id: 112, name: "RFI 2", datecreated: "Jan 02, 2022"},
    {id: 113, name: "RFI 3", datecreated: "Jan 03, 2022"},
    {id: 114, name: "RFI 4", datecreated: "Jan 04, 2022"},
    {id: 115, name: "RFI 5", datecreated: "Jan 05, 2022"},
  ];

  return (
    <>
     
    <div
          className={
            "p-5 relative flex flex-col min-w-0 break-words mb-6 shadow-lg rounded bg-white"
          } style={contentDiv}
        >
          <div className="relative flex-grow flex-1">
            <div style={mainGrid}>
              <div>
                <h1 className="text-3xl">
                  <span className="font-bold text-3xl flex-inline"> <IoIosArrowDropright className="h-8 w-8 absolute -ml-1 "/> &nbsp;&nbsp;&nbsp;&nbsp; Request For Information </span>{" "}
                  <span className="text-gray-500 text-3xl ml-2">
                    
                  </span>
                </h1>
                
              </div>
              <div className="py-3">
                <span className="font-medium py-2 flex"><AiOutlineFolderOpen/> &nbsp; RFI</span>
              </div>

              <div className="absolute right-0">
                {/* <Link to={AppRoutes.DASHBOARD}> */}
                <button className="bg-white hover:bg-gray-100 text-black font-semibold py-2.5 px-4 rounded inline-flex items-center border-0 shadow outline-none focus:outline-none focus:ring">
                  Back &nbsp;
                  <MdArrowForwardIos />
                </button>
                {/* </Link> */}
              </div>
            </div>

            <div className="mt-7">
              <div>
                <input
                  type="search"
                  placeholder="Search ..."
                  // onChange={handleSearchChange}
                  className="px-3 py-3 placeholder-blueGray-300 text-blueGray-600 relative bg-white rounded text-sm border-0 shadow outline-none focus:outline-none focus:ring pl-5 float-right w-3/12"
                />
              </div>
            </div>
          </div>
          
          <div className="shadow overflow-hidden border-b border-gray-200 sm:rounded-lg my-5">
            <table className="table-fixed divide-y divide-x border-slate-500 border flex-1 w-full">
              <tr>
                  <th className="text-left py-4 px-4 border-slate-500 border">Question</th>
                  <th className="text-left py-4 px-4 border-slate-500 border"><IoIosArrowDropright className="h-8 w-8 absolute -ml-8 -mt-1"/> &nbsp; Answer</th>
              </tr>
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
                    noLink={"Start creating your RFIs to collaborate with your client"}
                    iconDisplay={BlankAnswer}
                  />
                </td>
              </tr>
            </table>
          </div>
      </div>
      
      {showToast && 
        <ToastNotification title={alertMessage} hideToast={hideToast} />
      }  
    </>
  );
}

