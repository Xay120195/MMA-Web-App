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
import { List, AutoSizer, CellMeasurer, CellMeasurerCache, WindowScroller } from "react-virtualized";

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

const qGetFileDownloadLink = `
query getAttachmentDownloadLink($id: String) {
  gmailAttachment(id: $id) {
    downloadURL
  }
}`;

const TableUnsavedInfo = ({
  selectedUnsavedItems,
  setSelectedUnsavedItems,
  unSavedEmails,
  setUnsavedEmails,
  matterList,
  maxLoadingUnSavedEmail,
  getUnSavedEmails,
  emailFilters,
  labelsList,
  waitUnSaved,
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

  const cache = useRef(new CellMeasurerCache({
    fixedWidth: true,
    defaultHeight: 100,
  }));

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
    console.log("test", unSavedEmails);
    if (counter !== 0) {
      const { id, checked } = e.target;
      setSelectedUnsavedItems([...selectedUnsavedItems, id]);
      // console.log("selected", selectedUnsavedItems);
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

  const handleSaveDesc = async (e, id, rowId) => {
    const data = {
      id: id,
      description: e.target.innerHTML,
    };
    const success = await updateAttachmentDesc(data);
    if (success) {

      var objIndex = unSavedEmails.findIndex(
        (obj) => obj.id === rowId
      );

      const itemsAttachments = unSavedEmails[objIndex].attachments.items.map(x => (x.id === id ? { ...x, details: e.target.innerHTML } : x));
      
      var updateArrAttachment = unSavedEmails.map((obj) => {
        if (obj.id === rowId) {
          return { ...obj, attachments: { items: itemsAttachments } };
        }
        return obj;
      });

      setUnsavedEmails(updateArrAttachment);
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
          client: { id: "", name: e.label.split("/")[0] },
          matter: { id: "", name: e.label.split("/")[1] },
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
      const newArrDescription = unSavedEmails.map(emails => {
        if (emails.id === id) {
          return {...emails, description: e.target.innerHTML};
        }
      
        return emails;
      });
      setUnsavedEmails(newArrDescription);
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
    const arr = enabledArrays.find((element) => element === id);
    return arr;
  }

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

  const mTagFileLabel = `
  mutation tagFileLabel($fileId: ID, $labels: [LabelInput]) {
    fileLabelTag(file: {id: $fileId}, label: $labels) {
      file {
        id
      }
    }
  }`;

  const handleAddLabel = async (e, gmid) => {
    var selectedLabels = [];

    for (var i = 0; i < e.length; i++) {
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
    } else {
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
    var taggedLabels = [];

    console.log("arrr", unSavedEmails);

    for (var i = 0; i < e.length; i++) {
      selectedLabels = [...selectedLabels, e[i].value];
      taggedLabels = [...taggedLabels, { id: e[i].value, name: e[i].label }];
    }

    if (e.length > 0) {
      const result = await API.graphql({
        query: mAddEmailAttachmentLabel,
        variables: {
          labelId: selectedLabels,
          attachmentId: atid,
        },
      });

      // const result1 = await API.graphql({
      //   query: mTagFileLabel,
      //   variables: {
      //     labels: taggedLabels,
      //     fileId: atid,
      //   },
      // });

      // console.log("tagging", result1);
    } else {
      const result = await API.graphql({
        query: mAddEmailAttachmentLabel,
        variables: {
          labelId: [],
          attachmentId: atid,
        },
      });

      // const result1 = await API.graphql({
      //   query: mTagFileLabel,
      //   variables: {
      //     labels: [],
      //     fileId: atid,
      //   },
      // });

      // console.log("tagging", result1);
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

    if (cmidarr.length > 0) {
      cmid = cmidarr[0].client.id;
    } else {
      cmid = "";
    }

    if (labelsList.length > 0 || labelsList !== null) {
      for (var i = 0; i < labelsList.length; i++) {
        // console.log("optionscheck",labelsList[i]);

        if (mainLabels[i].labelsExtracted.length === 0) {
          return null;
        } else {
          if (mainLabels[i].cmid === cmid) {
            if(mainLabels[i].labelsExtracted.length === 0){
              return null;
            }else{
              const newOptions = mainLabels[i].labelsExtracted.map(
                ({ id: value, name: label }) => ({
                  value,
                  label,
                })
              );
              return newOptions;
            }
          }
        }
      }
    } else {
      return null;
    }
  };

  const previewAndDownloadFile = async (id) => {
    const params = {
      query: qGetFileDownloadLink,
      variables: {
        id: id,
      },
    };

    await API.graphql(params).then((result) => {
      window.open(result.data.gmailAttachment.downloadURL);
    });
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
        <tbody 
          className="bg-white divide-y divide-gray-200"
          style={{width:"100%", height:"100vh"}}
        >
          {waitUnSaved ? (
            <tr>
              <td colSpan={5} ><Loading /></td>
            </tr>
          ) : (
          <WindowScroller
          key={0}
          >
            {({ height, scrollTop }) => (
              <AutoSizer disableHeight>
              {({ width }) => (
                <List

                autoHeight
                scrollTop={scrollTop}
                width={width}
                height={Infinity}
                rowHeight={cache.current.rowHeight}
                deferredMeasurementCache={cache.current}
                rowCount={unSavedEmails.length}
                rowRenderer={({ key, index, style, parent }) => {
                  const item = unSavedEmails[index];
                  return (
                    <CellMeasurer 
                      key={item.id + "-" + index} 
                      cache={cache.current} 
                      parent={parent} 
                      rowIndex={index} 
                      columnIndex={0}
                    >
                      {/* <div 
                      style={{
                        ...style,
                        width: "100%",
                        height: "100%",
                        border: '1px solid #f0f0f0', 
                      }}
                      > */}
                      {/* {({ registerChild }) => ( */}
                        <tr 
                          style={{
                            ...style,
                            width: "100%",
                            height: "100%",
                            border: '1px solid #f0f0f0', 
                          }}
                          //ref={registerChild}
                          key={key}
                        >
                          <td className="p-2 align-top w-10">
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
                          <td className="p-2 align-top w-1/4">
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
                                      ).replace("body{color:", ""),
                                    }}
                                  ></p>
                                </div>
                              )}
                            </span>
                            <button
                              className="hidden no-underline hover:underline text-xs text-blue-400"
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
                          <td className="p-2 align-top w-2/8">
                            <p
                              className="p-2 w-full font-poppins rounded-sm"
                              style={{
                                border: "solid 1px #c4c4c4",
                                cursor: "auto",
                                outlineColor: "rgb(204, 204, 204, 0.5)",
                                outlineWidth: "thin",
                                minHeight: "35px",
                                maxHeight: "35px",
                                overflow: "auto",
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
                                    onClick={() => previewAndDownloadFile(item_attach.id)}
                                  >
                                    {item_attach.name.substring(0, 10)}
                                    {item_attach.name.length >= 10 ? "..." : ""}
                                  </p>
                                  <div
                                    className="p-2 w-full h-full font-poppins rounded-sm float-right"
                                    style={{
                                      border: "solid 1px #c4c4c4",
                                      cursor: "auto",
                                      outlineColor: "rgb(204, 204, 204, 0.5)",
                                      outlineWidth: "thin",
                                      minHeight: "35px",
                                      maxHeight: "35px",
                                      overflow: "auto",
                                      
                                    }}
                                    suppressContentEditableWarning
                                    dangerouslySetInnerHTML={{
                                      __html: item_attach.details,
                                    }}
                                    onBlur={(e) => handleSaveDesc(e, item_attach.id, item.id)}
                                    contentEditable={true}
                                  ></div>
                                </div>
                              </React.Fragment>
                            ))}
                          </td>
                          <td className="p-2 align-top w-1/6">
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
                                defaultValue={() => defaultLabels(item.labels.items)}
                                isMulti
                                isClearable
                                options={getOptions(item.clientMatters.items)}
                                isSearchable
                                openMenuOnClick={true}
                                isDisabled={
                                  checkArrLength(item.clientMatters.items.length) ||
                                  checkEnable(item.id)
                                    ? false
                                    : true
                                }
                                onChange={(e) => handleAddLabel(e, item.id)}
                                placeholder="Labels"
                                className="-mt-4 w-60 placeholder-blueGray-300 text-blueGray-600 text-xs bg-white rounded border-0 shadow outline-none focus:outline-none focus:ring z-100"
                              />
                            </div>
                            {item.attachments.items.map((item_attach, index) => (
                              <CreatableSelect
                                defaultValue={() => defaultLabels(item_attach.labels.items)}
                                isMulti
                                isClearable
                                options={getOptions(item.clientMatters.items)}
                                openMenuOnClick={true}
                                isDisabled={
                                  checkArrLength(item.clientMatters.items.length) ||
                                  checkEnable(item.id)
                                    ? false
                                    : true
                                }
                                onChange={(e) =>
                                  handleAddEmailAttachmentLabel(e, item_attach.id)
                                }
                                placeholder="Labels"
                                className="mt-1 w-60 placeholder-blueGray-300 text-blueGray-600 text-xs bg-white rounded border-0 shadow outline-none focus:outline-none focus:ring z-100"
                              />
                            ))}
                          </td>
                          <td className="p-2 align-top w-1/6">
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
                      {/* )} */}
                      {/* </div> */}
                    </CellMeasurer>
                  );
                }}
                />
                )}
              </AutoSizer>
              )}
              </WindowScroller>
            )}
        </tbody>
      </table>
      {/*{maxLoadingUnSavedEmail ? (
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
      )}*/}

      {showToast && resultMessage && (
        <ToastNotification title={resultMessage} hideToast={hideToast} />
      )}
      </>
  );
};

export default TableUnsavedInfo;
