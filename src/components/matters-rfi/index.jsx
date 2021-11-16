import React, { useState } from "react";
import { Link, useHistory } from "react-router-dom";
import BlankState from "../blank-state";
import { HiOutlinePlusCircle } from "react-icons/hi";
import { MdDownload, MdArrowForwardIos } from "react-icons/md";
import { RiFileInfoLine } from "react-icons/ri";
import { matter_rfi, questions } from "./data-source";
import { AppRoutes } from "../../constants/AppRoutes";
import Modal from "../modal";
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
  const [showToast, setShowToast] = useState(false);
  const [alertMessage, setalertMessage] = useState();
  const [RFIname, setRFIname] = useState();

  const hideToast = () => {
    setShowToast(false);
  };

  const handleBlankStateClick = () => {
    console.log("Blank State Button was clicked!");
  };

  const handleSaveRFI = () => {
    console.log("RFI name:", RFIname);

    if (RFIname === undefined) {
      alert("RFI name is required.");
      return false;
    } else {
      setalertMessage(modalRFIAlertMsg);
      handleModalClose(false);
      setShowToast(true);
      setTimeout(() => {
        setShowToast(false);
        history.push(`${AppRoutes.MATTERSRFI}/231`);
      }, 3000);
    }
  };

  const handleUploadLink = () => {
    setalertMessage(modalUploadLinkAlertMsg);
    handleModalClose(false);
    setShowToast(true);
    setTimeout(() => {
      setShowToast(false);
    }, 3000);
  };

  const handleSelectLink = () => {
    handleModalClose(false);
  };

  const handleRFINameChanged = (event) => {
    setRFIname(event.target.value);
  };

  const handleUploadLinkChanged = (event) => {
    console.log("Upload link handled", event);
  };

  const handleModalClose = (action) => {
    setshowCreateRFIModal(action);
    setshowUploadLinkModal(action);
    setshowSelectLinkModal(action);
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
                <button className="bg-green-400 hover:bg-green-500 text-white text-sm py-2 px-4 rounded inline-flex items-center border-0 shadow outline-none focus:outline-none focus:ring">
                  Add Row &nbsp;
                  <HiOutlinePlusCircle />
                </button>

                <button className="bg-gray-50 hover:bg-gray-100 text-black text-sm py-2 px-4 rounded inline-flex items-center border-0 shadow outline-none focus:outline-none focus:ring ml-2">
                  Extract PDF &nbsp;
                  <MdDownload />
                </button>
              </div>
            </div>
          </div>

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
                      <p>{st.id}</p>
                    </td>
                    <td className="px-6 py-4 w-1/3 align-top place-items-center">
                      <p>{st.statement}</p>
                    </td>
                    <td className="px-6 py-4 w-1/3 align-top place-items-center">
                      <p>{st.comments}</p>
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

      {showCreateRFIModal && (
        <Modal
          title={"Create RFI"}
          content={
            <CreateRFIContent handleRFINameChanged={handleRFINameChanged} />
          }
          customCTAButton={"Create"}
          customCancelButton={"Cancel"}
          handleSave={handleSaveRFI}
          handleModalClose={handleModalClose}
        />
      )}

      {showUploadLinkModal && (
        <Modal
          title={"Upload link to chronology"}
          content={
            <UploadLinkContent
              handleUploadLinkChanged={handleUploadLinkChanged}
            />
          }
          customCTAButton={"Upload"}
          customCancelButton={"Cancel"}
          handleSave={handleUploadLink}
          handleModalClose={handleModalClose}
        />
      )}

      {showSelectLinkModal && (
        <Modal
          title={"Select link to chronology"}
          content={<SelectLinkContent />}
          customCTAButton={"Select"}
          customCancelButton={"Cancel"}
          handleSave={handleSelectLink}
          handleModalClose={handleModalClose}
        />
      )}

      {showToast && (
        <ToastNotification title={alertMessage} hideToast={hideToast} />
      )}
    </>
  );
}

export const CreateRFIContent = (props) => {
  const handleRFINameChanged = (event) => {
    props.handleRFINameChanged(event);
  };

  return (
    <>
      <p className="font-semi-bold text-sm">RFI Name *</p>
      <div className="relative my-2">
        <div className="absolute pin-r pin-t mt-4 mr-5 ml-2 text-purple-lighter">
          <RiFileInfoLine />
        </div>
        <input
          type="text"
          className="bg-purple-white shadow rounded border-0 py-3 pl-8 w-full"
          placeholder="RFI Name"
          onChange={handleRFINameChanged}
        />
      </div>
    </>
  );
};

export const UploadLinkContent = (props) => {
  const handleUploadLinkChanged = (event) => {
    props.handleUploadLinkChanged(event);
  };

  return (
    <>
      <p>Drop files here or browse</p>
    </>
  );
};

export const SelectLinkContent = (props) => {
  const handleSelectLinkChanged = (event) => {
    props.handleSelectLinkChanged(event);
  };

  return (
    <>
      <p>Select Link to Chronology</p>
    </>
  );
};
