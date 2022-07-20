import React, { useState, useEffect, useCallback, useRef } from "react";
import { API } from "aws-amplify";
import ToastNotification from "../toast-notification";
import Loading from "../loading/loading";
import CreatableSelect from "react-select/creatable";
import { useRootClose } from "react-overlays";
import imgLoading from "../../assets/images/loading-circle.gif";
import { FaEye } from "react-icons/fa";
import { Base64 } from "js-base64";
import html2pdf from "html2pdf.js";
import googleLogin from "../../assets/images/gmail-print.png";

var moment = require("moment");

const mUpdateAttachmentDescription = `mutation MyMutation($details: String, $id: ID) {
  gmailMessageAttachmentUpdate(id: $id, details: $details) {
    id
    details
  }
}`;

const mUpdateRowDescription = `mutation saveGmailDescription($id: String, $description: String) {
  gmailMessageDescriptionUpdate(id: $id, description: $description) {
    id
  }
}`;

const mTagEmailClientMatter = `
mutation tagGmailMessageClientMatter($clientMatterId: ID, $gmailMessageId: String) {
  gmailMessageClientMatterTag(
    clientMatterId: $clientMatterId
    gmailMessageId: $gmailMessageId
  ) {
    id
  }
}`;

const TableUnsavedInfo = ({
  selectedUnsavedItems,
  setSelectedUnsavedItems,
  unSavedEmails,
  matterList,
  maxLoadingUnSavedEmail,
  getUnSavedEmails,
  labelsList,
}) => {
  const ref = useRef([]);
  const [show, setShow] = useState(false);
  const [snippetId, setSnippetId] = useState();
  const handleRootClose = () => setShow(false);
  const [selectedClientMatter, setSelectedClientMatter] = useState();
  const [isShiftDown, setIsShiftDown] = useState(false);
  const [lastSelectedItem, setLastSelectedItem] = useState(null);
  const companyId = localStorage.getItem("companyId");

  const [showToast, setShowToast] = useState(false);
  const [resultMessage, setResultMessage] = useState("");

  const [enabledArrays, setEnabledArrays] = useState([]);

  const [options, setOptions] = useState(null);

  const handleSnippet = (e) => {
    setSnippetId(e.target.id);
    setShow(true);
  };

  useRootClose(ref, handleRootClose, {
    disabled: !show,
  });

  const handleKeyUp = (e) => {
    if (e.key === "Shift" && isShiftDown) {
      setIsShiftDown(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Shift" && !isShiftDown) {
      setIsShiftDown(true);
    }
  };

  const handleSelectItem = (e, counter) => {
    if (counter !== 0) {
      const { id, checked } = e.target;
      setSelectedUnsavedItems([...selectedUnsavedItems, id]);
      if (!checked) {
        setSelectedUnsavedItems(
          selectedUnsavedItems.filter((item) => item !== id)
        );
      }
    } else {
      alert("Please assign client/matter before selecting.");
    }
  };

  const hideToast = () => {
    setShowToast(false);
  };

  const handleSaveDesc = async (e, id) => {
    const data = {
      id: id,
      description: e.target.innerHTML,
    };
    const success = await updateAttachmentDesc(data);
    if (success) {
      setResultMessage("Successfully updated.");
      setShowToast(true);
    }
  };

  async function updateAttachmentDesc(data) {
    return new Promise((resolve, reject) => {
      try {
        const request = API.graphql({
          query: mUpdateAttachmentDescription,
          variables: {
            id: data.id,
            details: data.description,
          },
        });
        resolve(request);
      } catch (e) {
        reject(e.errors[0].message);
      }
    });
  }

  const handleClientMatter = async (e, gmailMessageId) => {
    if (e.value !== null) {
      API.graphql({
        query: mTagEmailClientMatter,
        variables: {
          clientMatterId: e.value,
          gmailMessageId: gmailMessageId,
        },
      });
      var objIndex = unSavedEmails.findIndex(
        (obj) => obj.id === gmailMessageId
      );
      unSavedEmails[objIndex].clientMatters.items = [
        {
          id: e.value,
          client: { id: "", name: "" },
          matter: { id: "", name: "" },
        },
      ];
    }

    let temp = [...enabledArrays];
    temp = [...temp, gmailMessageId];
    setEnabledArrays(temp);
  };

  const handleSaveMainDesc = async (e, id) => {
    const data = {
      id: id,
      description: e.target.innerHTML,
    };
    const success = await updateRowDesc(data);
    if (success) {
      setResultMessage("Successfully updated.");
      setShowToast(true);
    }
  };

  async function updateRowDesc(data) {
    return new Promise((resolve, reject) => {
      try {
        const request = API.graphql({
          query: mUpdateRowDescription,
          variables: {
            id: data.id,
            description: data.description,
          },
        });
        resolve(request);
      } catch (e) {
        reject(e.errors[0].message);
      }
    });
  }

  const handleDownload = (gmailMessageId, subject, htmlContent) => {
    var opt = {
      margin: [30, 30, 30, 30],
      filename: subject,
      image: { type: "jpeg", quality: 0.98 },
      html2canvas: {
        dpi: 96,
        scale: 1,
        scrollX: 0,
        scrollY: 0,
        backgroundColor: "#FFF",
      },
      jsPDF: { unit: "pt", format: "a4", orientation: "p" },
      pagebreak: { before: ".page-break", avoid: "img" },
    };

    var content = document.getElementById("preview_" + gmailMessageId);
    content.innerHTML += Base64.decode(htmlContent);

    html2pdf()
      .set(opt)
      .from(content)
      .toPdf()
      .get("pdf")
      .then(function (pdf) {
        window.open(pdf.output("bloburl"), "_blank");
      });
  };

  function checkArrLength(arrLength) {
    const arr = arrLength > 0 ? true : false;
    return arr;
  }

  function checkEnable(id) {
    const arr = enabledArrays.find(element => element === id);
    return arr;
  }

  // const listLabels = `
  //   query listLabels($clientMatterId: ID) {
  //     clientMatter(id: $clientMatterId) {
  //       labels {
  //         items {
  //           id
  //           name
  //         }
  //       }
  //     }
  //   }
  //   `;

  // const getOptions = (cmID) => {
  //   var cmid;
  //   cmID.map(x => cmid = x.id);

  //   console.log("cmid", cmid);
  //   const labelsOpt = API.graphql({
  //     query: listLabels,
  //     variables: {
  //       clientMatterId: cmid
  //     },
  //   });

  //   var returnArr = [];

  //   if(labelsOpt.data.clientMatter!==null){
  //     labelsOpt.data.clientMatter.labels.items.map(x=> returnArr = [...returnArr, {value: x.id, label: x.name}])
  //   }
  //   console.log("returnArr", returnArr);

  //   const optionss = [{value: "1", label: "1"}, {value: "2", label: "2"}];

  //   console.log(optionss);
  //   if(labelsOpt!==null){
  //     return optionss;
  //   }else{
  //     return null;
  //   }
  // }

  const mAddEmailLabel = `
  mutation saveGmailMessageLabel($gmailMessageId: String, $labelId: [ID]) {
    gmailMessageLabelTag(labelId: $labelId, gmailMessageId: $gmailMessageId) {
      id
    }
  }`;

  const mAddEmailAttachmentLabel = `
  mutation saveGmailAttachmentLabel($attachmentId: String, $labelId: [ID]) {
    gmailAttachmentLabelTag(attachmentId: $attachmentId, labelId: $labelId) {
      id
    }
  }`;


  const handleAddLabel = async (e, gmid) => {
    var selectedLabels = [];

    for(var i=0; i<e.length; i++){
      selectedLabels = [...selectedLabels, e[i].value];
    }

    console.log("selectedLabels", selectedLabels);
    if (e.length > 0) {
      const result = await API.graphql({
        query: mAddEmailLabel,
        variables: {
          labelId: selectedLabels,
          gmailMessageId: gmid,
        },
      });
    }else{
      const result = await API.graphql({
        query: mAddEmailLabel,
        variables: {
          labelId: [],
          gmailMessageId: gmid,
        },
      });
    }
    console.log("MainArray", unSavedEmails);
  };

  const handleAddEmailAttachmentLabel = async (e, atid) => {
    var selectedLabels = [];

    for(var i=0; i<e.length; i++){
      selectedLabels = [...selectedLabels, e[i].value];
    }

    if (e.length > 0) {
      const result = await API.graphql({
        query: mAddEmailAttachmentLabel,
        variables: {
          labelId: selectedLabels,
          attachmentId: atid,
        },
      });
    }else{
      const result = await API.graphql({
        query: mAddEmailAttachmentLabel,
        variables: {
          labelId: [],
          attachmentId: atid,
        },
      });
    }

    console.log("MainArray", unSavedEmails);
  };

  const defaultLabels = (items) => {
    if (items !== null) {
      const newOptions = items.map(({ id: value, name: label }) => ({
        value,
        label,
      }));
      return newOptions;
    } else {
      return null;
    }
  };

  const getOptions = (cmidarr) => {
    var mainLabels = labelsList;
    var cmid;
    console.log("cmidinoptions", cmidarr);
    console.log("mainLabels",labelsList);

    if(cmidarr.length > 0){
      cmid = cmidarr[0].client.id
    }else{
      cmid = '';
    }

    if(labelsList.length>0){
      for(var i=0; i<labelsList.length; i++){
        console.log("optionscheck",labelsList[i]);
        if(mainLabels[i].cmid === cmid){
          const newOptions = mainLabels[i].labelsExtracted.map(({ id: value, name: label }) => ({
              value,
              label,
            }));
          return newOptions;
        }else{
          return null;
        }
      }
    }else{
      return null;
    }
  };


  return (
    <>
      <table
        id="table-el"
        className="table-fixed min-w-full divide-y divide-gray-200 text-xs border-b-2 border-l-2 border-r-2 border-slate-100"
      >
        <thead
          className="z-10 bg-white"
          style={{ position: "sticky", top: "50px" }}
        >
          <tr>
            <th className="font-medium px-2 py-4 text-center whitespace-nowrap w-10"></th>
            <th className="font-medium px-2 py-4 text-center whitespace-nowrap w-1/4">
              Email Details
            </th>
            <th className="font-medium px-2 py-4 text-center whitespace-nowrap w-2/8">
              Attachments and Description
            </th>
            <th className="font-medium px-2 py-4 text-center whitespace-nowrap w-1/6">
              Labels
            </th>
            <th className="font-medium px-2 py-4 text-center whitespace-nowrap w-1/6">
              Client Matter
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {unSavedEmails.map((item, index) => (
            <tr key={item.id + "-" + index}>
              <td className="p-2 align-top">
                <input
                  key={item.id}
                  className="cursor-pointer mr-1"
                  onChange={(e) =>
                    handleSelectItem(e, item.clientMatters.items.length)
                  }
                  type="checkbox"
                  value={item.id}
                  id={item.id}
                  checked={selectedUnsavedItems.includes(item.id)}
                />
              </td>
              <td className="p-2 align-top">
                <p className="text-sm font-medium">{item.subject}</p>
                <p className="text-xs">
                  {item.from} at{" "}
                  {moment(item.date).format("DD MMM YYYY, hh:mm A")}
                </p>
                <span>
                  <div className="relative">
                    <button
                      className="p-1 text-blue-600
                text-opacity-90
                text-[12px] font-normal inline-flex items-center gap-x-2 rounded primary_light hover:text-opacity-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-opacity-75 text-xs "
                      type="button"
                      aria-expanded="false"
                      id={item.id}
                      onClick={handleSnippet}
                    >
                      read more
                      <FaEye />
                    </button>
                  </div>
                  {show && snippetId === item.id && (
                    <div
                      ref={(el) => (ref.current[index] = el)}
                      className="absolute rounded shadow bg-white p-6 z-50 w-2/3 max-h-60 overflow-auto"
                      id={item.id}
                    >
                      <p>From : {item.from}</p>
                      <p>
                        Date :{" "}
                        {moment(item.date).format("DD MMM YYYY, hh:mm A")}
                      </p>
                      <p>Subject : {item.subject}</p>
                      <p>To : {item.to}</p>
                      <p>CC: {item.cc}</p>

                      <p
                        className="mt-8 p-2"
                        dangerouslySetInnerHTML={{
                          __html: Base64.decode(
                            item.payload
                              .map((email) => email.content)
                              .join("")
                              .split('data":"')
                              .pop()
                              .split('"}')[0]
                          ),
                        }}
                      ></p>
                    </div>
                  )}
                </span>
                <button
                  className="no-underline hover:underline text-xs text-blue-400"
                  onClick={(e) =>
                    handleDownload(
                      item.id,
                      item.subject,
                      item.payload
                        .map((email) => email.content)
                        .join("")
                        .split('data":"')
                        .pop()
                        .split('"}')[0]
                    )
                  }
                >
                  Preview Email PDF
                </button>
                <div className="hidden">
                  <span id={"preview_" + item.id}>
                    <img src={googleLogin} alt="" />
                    <hr></hr>
                    <h2>
                      <b>{item.subject}</b>
                    </h2>
                    <hr></hr>
                    <br />
                    <p>From : {item.from}</p>
                    <p>
                      Date : {moment(item.date).format("DD MMM YYYY, hh:mm A")}
                    </p>
                    <p>To : {item.to}</p>
                    <p>CC: {item.cc}</p>
                  </span>
                </div>
              </td>
              <td className="p-2 align-top">
                <p
                  className="p-2 w-full h-full font-poppins rounded-sm"
                  style={{
                    border: "solid 1px #c4c4c4",
                    cursor: "auto",
                    outlineColor: "rgb(204, 204, 204, 0.5)",
                    outlineWidth: "thin",
                  }}
                  suppressContentEditableWarning
                  dangerouslySetInnerHTML={{ __html: item.description }}
                  onBlur={(e) => handleSaveMainDesc(e, item.id)}
                  contentEditable={true}
                ></p>
                {item.attachments.items.map((item_attach, index) => (
                  <React.Fragment key={item_attach.id}>
                    <div className="flex items-start mt-2">
                      <p
                        className="
                  cursor-pointer mr-1 text-opacity-90 1 
                  textColor  group text-xs font-semibold py-1 px-2  rounded textColor bg-gray-100 inline-flex items-center  hover:text-opacity-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-opacity-75 "
                        id={item_attach.id}
                        title={item_attach.name}
                      >
                        {item_attach.name.substring(0, 20)}
                        {item_attach.name.length >= 20 ? "..." : ""}
                      </p>
                      <div
                        className="p-2 w-full h-full font-poppins rounded-sm float-right"
                        style={{
                          border: "solid 1px #c4c4c4",
                          cursor: "auto",
                          outlineColor: "rgb(204, 204, 204, 0.5)",
                          outlineWidth: "thin",
                        }}
                        suppressContentEditableWarning
                        dangerouslySetInnerHTML={{
                          __html: item_attach.details,
                        }}
                        onBlur={(e) => handleSaveDesc(e, item_attach.id)}
                        contentEditable={true}
                      ></div>
                    </div>
                  </React.Fragment>
                ))}
              </td>
              <td className="p-2 align-top">
                <div className="relative" disabled={true}>
                  <button
                    className="
                  text-opacity-90 1
                  textColor  group text-xs font-semibold py-1 px-2  rounded textColor bg-gray-100 inline-flex items-center  hover:text-opacity-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-opacity-75"
                    id="headlessui-popover-button-87"
                    type="button"
                    aria-expanded="false"
                  >
                    {item.labelIds}
                  </button>
                  <CreatableSelect
                    defaultValue={() =>
                      defaultLabels(
                        item.labels.items
                      )
                    }
                    isMulti
                    isClearable
                    // options={[{value: "c3bb6cd1-8d69-48f9-95b6-e4ddf46a52bc" , label: "test"}, {value: "c2896ea6-6a1f-4668-8844-7294eef18e8e", label: "test6"}]}
                    options={getOptions(item.clientMatters.items)}
                    isSearchable
                    openMenuOnClick={true}
                    isDisabled={
                      checkArrLength(item.clientMatters.items.length) || checkEnable(item.id) ? false : true
                    }
                    onChange={
                      (e) => handleAddLabel(e, item.id)
                    }
                    placeholder="Labels"
                    className="-mt-4 w-60 placeholder-blueGray-300 text-blueGray-600 text-xs bg-white rounded border-0 shadow outline-none focus:outline-none focus:ring z-100"
                  />
                </div>
                {item.attachments.items.map((item_attach, index) => (
                  <CreatableSelect
                    defaultValue={() =>
                      defaultLabels(
                        item_attach.labels.items
                      )
                    }
                    isMulti
                    isClearable
                    options={getOptions(item.clientMatters.items)}
                    openMenuOnClick={true}
                    isDisabled={
                      checkArrLength(item.clientMatters.items.length) || checkEnable(item.id) ? false : true
                    }
                    onChange={
                      (e) => handleAddEmailAttachmentLabel(e, item_attach.id)
                    }
                    placeholder="Labels"
                    className="mt-1 w-60 placeholder-blueGray-300 text-blueGray-600 text-xs bg-white rounded border-0 shadow outline-none focus:outline-none focus:ring z-100"
                  />
                ))}
              </td>
              <td className="p-2 align-top">
                <React.Fragment key={item.id}>
                  <CreatableSelect
                    defaultValue={item.clientMatters.items.map(
                      (item_clientMatter, index) => ({
                        value: item_clientMatter.id,
                        label:
                          item_clientMatter.client.name +
                          "/" +
                          item_clientMatter.matter.name,
                      })
                    )}
                    options={matterList}
                    isSearchable
                    onChange={(options, e) =>
                      handleClientMatter(options, item.id)
                    }
                    noOptionsMessage={() => "No result found"}
                    isValidNewOption={() => false}
                    placeholder="Client/Matter"
                    className="placeholder-blueGray-300 text-blueGray-600 relative bg-white rounded text-sm border-0 shadow outline-none focus:outline-none focus:ring w-full"
                  />
                </React.Fragment>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {maxLoadingUnSavedEmail ? (
        <>
          <div className="flex justify-center items-center mt-5">
            All Data has been loaded
          </div>
        </>
      ) : (
        <>
          <div className="flex justify-center items-center mt-5">
            <img src={imgLoading} alt="" width={50} height={100} />
          </div>
        </>
      )}

      {showToast && resultMessage && (
        <ToastNotification title={resultMessage} hideToast={hideToast} />
      )}
    </>
  );
};

export default TableUnsavedInfo;
