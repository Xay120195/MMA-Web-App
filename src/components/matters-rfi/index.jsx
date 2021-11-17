import React, { useState } from "react";
import { useHistory } from "react-router-dom";
import BlankState from "../blank-state";
import { HiOutlinePlusCircle } from "react-icons/hi";
import { BsFillInfoCircleFill } from "react-icons/bs";
import { MdArrowForwardIos, MdDownload } from "react-icons/md";
import { matter_rfi, questions } from "./data-source";
import { AppRoutes } from "../../constants/AppRoutes";
import CreateRFIModal from "./create-RFI-modal";
import UploadLinkModal from "./upload-linktochronology-modal"
import SelectLinkModal from "./linktochronology-list-modal"
import ToastNotification from "../toast-notification";

export default function MattersRFI() {
  let history = useHistory();
  const tableHeaders = [
    "No.",
    "Question",
    "Response",
    "Link Chronology",
    "Link to RFI",
  ];
  const modalRFIAlertMsg = "RFI Name successfully created.";
  const modalUploadLinkAlertMsg = "Link to chronology successfully uploaded.";

  const [showCreateRFIModal, setshowCreateRFIModal] = useState(false);
  const [showUploadLinkModal, setshowUploadLinkModal] = useState(false);
  const [showSelectLinkModal, setshowSelectLinkModal] = useState(false);
  const [checkAllState, setcheckAllState] = useState(false);

  const [showToast, setShowToast] = useState(false);
  const [alertMessage, setalertMessage] = useState();

  const handleBlankStateClick = () => {
    console.log("Blank State Button was clicked!");
  };

  const hideToast = () => {
    setShowToast(false);
  };

  const handleSaveRFI = (rfiname) => {
    console.log("RFI name:", rfiname);
    setalertMessage(modalRFIAlertMsg);
    handleModalClose();
    setShowToast(true);

    setTimeout(() => {
      setShowToast(false);
      history.push(`${AppRoutes.MATTERSRFI}/231`);
    }, 3000);
  };

  const handleUploadLink = () => {
    setalertMessage(modalUploadLinkAlertMsg);
    handleModalClose();
    setShowToast(true);
    setTimeout(() => {
      setShowToast(false);
    }, 3000);
  };

  const handleSelectLink = () => {
    handleModalClose();
  };

  const handleModalClose = () => {
    setshowCreateRFIModal(false);
    setshowUploadLinkModal(false);
    setshowSelectLinkModal(false);
  };

  const handleCheckAllChange = (ischecked) => {
    setcheckAllState(!checkAllState);

    if (ischecked) {
      setCheckedState(new Array(questions.length).fill(true));
      settotalChecked(questions.length);
    } else {
      setCheckedState(new Array(questions.length).fill(false));
      settotalChecked(0);
    }
  };

  const [checkedState, setCheckedState] = useState(
    new Array(questions.length).fill(false)
  );

  const [totalChecked, settotalChecked] = useState(0);

  const handleCheckboxChange = (position) => {
    const updatedCheckedState = checkedState.map((item, index) =>
      index === position ? !item : item
    );

    setCheckedState(updatedCheckedState);

    let tc = updatedCheckedState.filter((v) => v === true).length;
    settotalChecked(tc);

    if (tc !== questions.length) {
      if (checkAllState) {
        setcheckAllState(false);
      }
    } else {
      if (!checkAllState) {
        setcheckAllState(true);
      }
    }
  };

  return (
    <>
      {questions.length === 0 ? (
        <BlankState
          title={"affidavits"}
          txtLink={"add row"}
          handleClick={handleBlankStateClick}
        />
      ) : (
        <div
          className={
            "p-5 relative flex flex-col min-w-0 break-words w-full mb-6 shadow-lg rounded bg-white"
          }
        >
          <div className="relative w-full max-w-full flex-grow flex-1">
            <div className={"grid grid-cols-2"}>
              <div>
                <h1 className="text-3xl">
                  <span className="font-bold text-3xl">{matter_rfi.name}</span>{" "}
                  <span className="text-gray-500 text-3xl ml-2">
                    ({matter_rfi.date_created})
                  </span>
                </h1>
                <span className="text-sm mt-3">MATTER AFFIDAVITS OVERVIEW</span>{" "}
                / <span className="text-sm mt-3">WITNESS AFFIDAVIT</span> /{" "}
                <span className="font-medium">RFI</span>
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
                  type="checkbox"
                  name="check_all"
                  id="check_all"
                  className="cursor-pointer mr-2"
                  checked={checkAllState}
                  onChange={(e) => handleCheckAllChange(e.target.checked)}
                />
                <button className="bg-green-400 hover:bg-green-500 text-white text-sm py-2 px-4 rounded inline-flex items-center border-0 shadow outline-none focus:outline-none focus:ring">
                  Add Row &nbsp;
                  <HiOutlinePlusCircle />
                </button>

                <button className="bg-gray-50 hover:bg-gray-100 text-black text-sm py-2 px-4 rounded inline-flex items-center border-0 shadow outline-none focus:outline-none focus:ring ml-2">
                  Export &nbsp;
                  <MdDownload />
                </button>
              </div>
            </div>
          </div>

          {totalChecked > 0 && (
            <div
              className="bg-blue-50 border-blue-200 rounded-b text-blue-500 px-4 py-3 shadow-md mt-4"
              role="alert"
            >
              <div className="flex">
                <div className="py-1">
                  <BsFillInfoCircleFill className="fill-current h-4 w-4 text-blue-500 mr-3" />
                </div>
                <div>
                  <p className="font-light text-sm">
                  <span className="font-bold">{totalChecked}</span> {totalChecked > 1 ? 'items' : 'item'} selected.
                  </p>
                </div>
              </div>
            </div>
          )}
          <div className="shadow overflow-hidden border-b border-gray-200 sm:rounded-lg my-5">
            <table className="min-w-full divide-y divide-gray-200">
              <thead>
                <tr>
                  {tableHeaders.map((header, index) => (
                    <th
                      key={index}
                      scope="col"
                      className="px-6 py-3 font-medium text-gray-500 tracking-wider"
                    >
                      {header}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {questions.map((st, index) => (
                  <tr key={index} index={index}>
                    <td className="px-6 py-4 whitespace-nowrap w-4 text-center">
                    <input
                        type="checkbox"
                        name={`${st.id}_${index}`}
                        id={`${st.id}_${index}`}
                        className="cursor-pointer"
                        checked={checkedState[index]}
                        onChange={() => handleCheckboxChange(index)}
                      />{" "}
                      <span className="text-sm">{st.id}</span>
                    </td>
                    <td className="px-6 py-4 w-1/3 align-top place-items-center">
                      <p className="text-sm">{st.statement}</p>
                    </td>
                    <td className="px-6 py-4 w-1/3 align-top place-items-center">
                      <p className="text-sm">{st.comments}</p>
                    </td>
                    <td className="px-6 py-4 w-4 align-top place-items-center text-center">
                      <button
                        className="bg-blue-200 hover:bg-blue-300 text-blue-500 text-sm py-1.5 px-2.5 rounded-full inline-flex items-center border-0 shadow outline-none focus:outline-none focus:ring"
                        onClick={() => setshowUploadLinkModal(true)}
                      >
                        UPLOAD
                      </button>
                      <button
                        className="bg-blue-200 hover:bg-blue-300 text-blue-500 text-sm py-1.5 px-2.5 rounded-full inline-flex items-center border-0 shadow outline-none focus:outline-none focus:ring ml-2"
                        onClick={() => setshowSelectLinkModal(true)}
                      >
                        SELECT
                      </button>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap w-5 align-top place-items-center text-center">
                      <button
                        className="bg-green-100 hover:bg-green-200 text-green-700 text-sm py-1.5 px-2.5 rounded-full inline-flex items-center border-0 shadow outline-none focus:outline-none focus:ring"
                        onClick={() => setshowCreateRFIModal(true)}
                      >
                        CREATE
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

{showCreateRFIModal && 
        <CreateRFIModal
          handleSave={handleSaveRFI}
          handleModalClose={handleModalClose}
        />
      }

      { showUploadLinkModal && <UploadLinkModal 
        handleSave={handleUploadLink} 
        handleModalClose={handleModalClose} /> }

      { showSelectLinkModal && <SelectLinkModal 
        handleSave={handleSelectLink} 
        handleModalClose={handleModalClose} /> }

      {showToast && 
        <ToastNotification title={alertMessage} hideToast={hideToast} />
      }
      
    </>
  );
}

