import React, { useState, useEffect } from "react";
import { Link, useHistory } from "react-router-dom";
import BlankState from "../blank-state";
import {
  HiOutlineShare,
  HiOutlinePlusCircle,
  HiOutlineFilter,
  HiMinus,
  HiMinusCircle,
  HiTrash,
} from "react-icons/hi";
import { BsFillInfoCircleFill } from "react-icons/bs";
import { MdArrowForwardIos, MdDownload } from "react-icons/md";
import { matter_affidavit, statements } from "./data-source";
import { AppRoutes } from "../../constants/AppRoutes";
import CreateRFIModal from "../matters-rfi/create-RFI-modal"; // shared functions/modal from matters-rfi
import UploadLinkModal from "../link-to-chronology/upload-linktochronology-modal"; // shared functions/modal from link-to-chronology
import SelectLinkModal from "../link-to-chronology/linktochronology-list-modal"; // shared functions/modal from link-to-chronology
import PreviewModal from "../link-to-chronology/preview-linktochronology-modal"; // shared functions/modal from link-to-chronology
import ToastNotification from "../toast-notification";
import ContentEditable from "react-contenteditable";
import AccessControl from "../../shared/accessControl";

export default function WitnessAffidavit() {
  let history = useHistory();
  const tableHeaders = [
    "No.",
    "Statement",
    "Comments",
    "Link Chronology",
    "Link to RFI",
  ];
  const modalRFIAlertMsg = "RFI Name successfully created.";
  const modalUploadLinkAlertMsg = "Link to chronology successfully uploaded.";
  const saveAlertTDChanges = "Successfully updated!";

  const [showCreateRFIModal, setshowCreateRFIModal] = useState(false);
  const [showUploadLinkModal, setshowUploadLinkModal] = useState(false);
  const [showSelectLinkModal, setshowSelectLinkModal] = useState(false);
  const [checkAllState, setcheckAllState] = useState(false);
  const [datastatements, setstatements] = useState(statements);
  const [searchTable, setSearchTable] = useState();

  const [showToast, setShowToast] = useState(false);
  const [showAddRow, setShowAddRow] = useState(false);
  const [showExport, setShowExport] = useState(false);
  const [showDeleteRow, setShowDeleteRow] = useState(false);
  const [allowUpdateStatement, setAllowUpdateStatement] = useState(false);
  const [allowUpdateComment, setAllowUpdateComment] = useState(false);

  const [allowUploadLinkToChronology, setAllowUploadLinkToChronology] =
    useState(false);
  const [allowSelectLinkToChronology, setAllowSelectLinkToChronology] =
    useState(false);
  const [allowPreviewLinkToChronology, setAllowPreviewLinkToChronology] =
    useState(false);

  const [allowOpenRFI, setAllowOpenRFI] = useState(false);
  const [alertMessage, setalertMessage] = useState();
  const [showPreviewModal, setshowPreviewModal] = useState(false);

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

  const handleUploadLink = (uploadFiles) => {
    console.log(uploadFiles, "handleFiles");
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
    setshowPreviewModal(false);
    setshowSelectLinkModal(false);
  };

  const handleCheckAllChange = (ischecked) => {
    setcheckAllState(!checkAllState);

    if (ischecked) {
      setCheckedState(new Array(statements.length).fill(true));
      settotalChecked(statements.length);
    } else {
      setCheckedState(new Array(statements.length).fill(false));
      settotalChecked(0);
    }
  };

  const [checkedState, setCheckedState] = useState(
    new Array(statements.length).fill(false)
  );

  const [totalChecked, settotalChecked] = useState(0);

  const handleCheckboxChange = (position) => {
    const updatedCheckedState = checkedState.map((item, index) =>
      index === position ? !item : item
    );

    setCheckedState(updatedCheckedState);

    let tc = updatedCheckedState.filter((v) => v === true).length;
    settotalChecked(tc);

    if (tc !== statements.length) {
      if (checkAllState) {
        setcheckAllState(false);
      }
    } else {
      if (!checkAllState) {
        setcheckAllState(true);
      }
    }
  };

  const HandleChangeToTD = (evt) => {
    console.log(evt.target.innerHTML);

    setalertMessage(saveAlertTDChanges);
    setShowToast(true);
    setTimeout(() => {
      setShowToast(false);
    }, 3000);
  };

  const contentDiv = {
    margin: "0 0 0 65px",
  };

  const mainGrid = {
    display: "grid",
    gridtemplatecolumn: "1fr auto",
  };

  let tableRowIndex = datastatements.length;
  const handleAddRow = () => {
    tableRowIndex++;
    setstatements((previousState) => [
      {
        id: tableRowIndex,
        statement: "Sample Data",
        chronology: { id: 15, link: "", name: "Lorem Ipsum" },
        comments: "Lorem ipsum dolor sit amet, consectetur adipiscing elit.",
        rfi: { id: 15, name: "Lorem Ipsum" },
      },
      ...previousState,
    ]);
    console.log(datastatements);
  };

  const handleDeleteRow = () => {
    var updatedRows = [...datastatements];
    var _data = [];
    checkedState.map(function (item, index) {
      if (item) {
        _data = updatedRows.filter((e, i) => i !== index);
      }
    });
    setstatements(_data);
  };

  const handleSearchChange = (e) => {
    console.log("L114" + e.target.value);
    setSearchTable(e.target.value);
  };

  useEffect(() => {
    if (searchTable !== undefined) {
      filter(searchTable);
      console.log("L121" + searchTable);
    }
    featureAccessFilters();
  }, [searchTable]);

  const featureAccessFilters = async () => {
    console.log("featureAccessFilters()");
    const mattersOverviewAccess = await AccessControl("WITNESSAFFIDAVIT");

    if (mattersOverviewAccess.status !== "restrict") {
      console.log(mattersOverviewAccess);
      setShowAddRow(mattersOverviewAccess.data.features.includes("ADDROW"));

      setShowExport(mattersOverviewAccess.data.features.includes("EXPORT"));
      setShowDeleteRow(
        mattersOverviewAccess.data.features.includes("DELETEROW")
      );

      setAllowUpdateStatement(
        mattersOverviewAccess.data.features.includes("UPDATESTATEMENT")
      );

      setAllowUpdateComment(
        mattersOverviewAccess.data.features.includes("UPDATECOMMENT")
      );

      setAllowUploadLinkToChronology(
        mattersOverviewAccess.data.features.includes("UPLOADLINKTOCHRONOLOGY")
      );

      setAllowSelectLinkToChronology(
        mattersOverviewAccess.data.features.includes("SELECTLINKTOCHRONOLOGY")
      );

      setAllowPreviewLinkToChronology(
        mattersOverviewAccess.data.features.includes("PREVIEWLINKTOCHRONOLOGY")
      );
    } else {
      console.log(mattersOverviewAccess.message);
    }

    const RFIAccess = await AccessControl("MATTERSRFI");

    if (RFIAccess.status !== "restrict") {
      setAllowOpenRFI(true);
    } else {
      console.log(RFIAccess.message);
    }
  };

  const filter = (v) => {
    setstatements(
      statements.filter(
        (x) =>
          x.statement.toLowerCase().includes(v.toLowerCase()) ||
          x.comments.toLowerCase().includes(v.toLowerCase())
      )
    );
  };

  return (
    <>
      {datastatements === undefined ? (
        <BlankState
          title={"affidavits"}
          txtLink={"add row"}
          handleClick={handleBlankStateClick}
        />
      ) : (
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
                  Witness Affidavit of{" "}
                  <span className="font-bold text-3xl">
                    {matter_affidavit.name}
                  </span>
                </h1>
                <span className={"text-sm mt-3"}>
                  MATTER AFFIDAVITS OVERVIEW
                </span>{" "}
                /{" "}
                <span className={"text-sm mt-3 font-medium"}>
                  WITNESS AFFIDAVIT
                </span>
              </div>

              <div className="absolute right-0">
                <Link to={AppRoutes.DASHBOARD}>
                  <button className="bg-white hover:bg-gray-100 text-black font-semibold py-2.5 px-4 rounded inline-flex items-center border-0 shadow outline-none focus:outline-none focus:ring">
                    Back &nbsp;
                    <MdArrowForwardIos />
                  </button>
                </Link>
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

                {showAddRow && (
                  <button
                    className="bg-green-400 hover:bg-green-500 text-white text-sm py-2 px-4 rounded inline-flex items-center border-0 shadow outline-none focus:outline-none focus:ring"
                    onClick={() => handleAddRow()}
                  >
                    Add Row &nbsp;
                    <HiOutlinePlusCircle />
                  </button>
                )}

                {showExport && (
                  <button className="bg-gray-50 hover:bg-gray-100 text-black text-sm py-2 px-4 rounded inline-flex items-center border-0 shadow outline-none focus:outline-none focus:ring ml-2">
                    Export &nbsp;
                    <MdDownload />
                  </button>
                )}
                {showDeleteRow && (
                  <button
                    className="bg-red-400 hover:bg-red-500 text-white text-sm py-2 px-4 rounded inline-flex items-center border-0 shadow outline-none focus:outline-none focus:ring ml-2"
                    onClick={() => handleDeleteRow(this)}
                  >
                    Delete &nbsp;
                    <HiTrash />
                  </button>
                )}

                <input
                  type="search"
                  placeholder="Search ..."
                  onChange={handleSearchChange}
                  className="px-3 py-3 placeholder-blueGray-300 text-blueGray-600 relative bg-white rounded text-sm border-0 shadow outline-none focus:outline-none focus:ring pl-5 float-right w-3/12"
                />
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
                    <span className="font-bold">{totalChecked}</span>{" "}
                    {totalChecked > 1 ? "items" : "item"} selected.
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
                {datastatements
                  .map((st, index) => (
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
                        {allowUpdateStatement ? (
                          <ContentEditable
                            html={st.statement}
                            data-column="statement"
                            className="content-editable text-sm p-2"
                            onBlur={HandleChangeToTD}
                          />
                        ) : (
                          <p className="text-sm p-2">{st.statement}</p>
                        )}
                      </td>
                      <td className="px-6 py-4 w-1/3 align-top place-items-center">
                        {allowUpdateComment ? (
                          <ContentEditable
                            html={st.comments}
                            data-column="comments"
                            className="content-editable text-sm p-2"
                            onBlur={HandleChangeToTD}
                          />
                        ) : (
                          <p className="text-sm p-2">{st.comments}</p>
                        )}
                      </td>
                      <td className="px-6 py-4 w-4 align-top place-items-center text-center">
                      {allowPreviewLinkToChronology &&
                        <div className="mb-4 upload-details">
                          
                            <div
                              className="upload-file"
                              onClick={() => setshowPreviewModal(true)}
                            >
                              <a>
                                Matter 1_Payment Schedule for Claim No.
                                58711308181433_100521 03_58AM.pdf
                              </a>
                            </div>
                          

                          
                          <div className="line-separator">
                            <span>or</span>
                          </div>

                        </div>}

                        
                          <button
                            className="bg-blue-200 hover:bg-blue-300 text-blue-500 text-sm py-1.5 px-2.5 rounded-full inline-flex items-center border-0 shadow outline-none focus:outline-none focus:ring"
                            onClick={() => setshowUploadLinkModal(true)}
                            disabled = {!allowUploadLinkToChronology}
                          >
                            UPLOAD
                          </button>
                        
                        
                          <button
                            className="bg-blue-200 hover:bg-blue-300 text-blue-500 text-sm py-1.5 px-2.5 rounded-full inline-flex items-center border-0 shadow outline-none focus:outline-none focus:ring ml-2"
                            onClick={() => setshowSelectLinkModal(true)}
                            disabled={!allowSelectLinkToChronology}
                          >
                            SELECT
                          </button>
                        
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap w-5 align-top place-items-center text-center">
                        <button
                          className="bg-green-100 hover:bg-green-200 text-green-700 text-sm py-1.5 px-2.5 rounded-full inline-flex items-center border-0 shadow outline-none focus:outline-none focus:ring"
                          onClick={() => setshowCreateRFIModal(true)}
                          disabled={!allowOpenRFI}
                        >
                          CREATE
                        </button>
                      </td>
                    </tr>
                  ))
                  .sort((a, b) => (a.id > b.id ? 1 : -1))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {showCreateRFIModal && (
        <CreateRFIModal
          handleSave={handleSaveRFI}
          handleModalClose={handleModalClose}
        />
      )}

      {showUploadLinkModal && (
        <UploadLinkModal
          handleSave={handleUploadLink}
          handleModalClose={handleModalClose}
        />
      )}

      {showPreviewModal && <PreviewModal handleModalClose={handleModalClose} />}

      {showSelectLinkModal && (
        <SelectLinkModal
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
