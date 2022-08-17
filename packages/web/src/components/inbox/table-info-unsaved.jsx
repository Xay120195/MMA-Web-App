import React, { useState, useEffect, useCallback, useRef } from "react";
import { API } from "aws-amplify";
import ToastNotification from "../toast-notification";
import Loading from "../loading/loading";
import CreatableSelect from "react-select/creatable";
import { useRootClose } from "react-overlays";
import imgLoading from "../../assets/images/loading-circle.gif";
import { FaEye, FaTrash } from "react-icons/fa";
import { Base64 } from "js-base64";
import html2pdf from "html2pdf.js";
import googleLogin from "../../assets/images/gmail-print.png";
import {
  CustomMenuList,
  CustomValueContainer,
} from "./custom-select-components";
import { AiOutlinePlus } from "react-icons/ai";
import {
  List,
  AutoSizer,
  CellMeasurer,
  CellMeasurerCache,
  WindowScroller,
} from "react-virtualized";
import { AbsolutePosition } from "yjs";

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
    id,
  }
}`;

const qGetFileDownloadLink = `
query getAttachmentDownloadLink($id: String) {
  gmailAttachment(id: $id) {
    downloadURL
  }
}`;

const mUpdateAttachmentStatus = `
mutation updateAttachment($id: ID, $isDeleted: Boolean) {
  gmailMessageAttachmentUpdate(id: $id, isDeleted: $isDeleted) {
    id
  }
}`;

const mCreateLabel = `
mutation createLabel($clientMatterId: String, $name: String) {
    labelCreate(clientMatterId:$clientMatterId, name:$name) {
        id
        name
    }
}
`;

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
  emailIntegration,
  userTimeZone,
  momentTZ,
  qGmailMessagesbyCompany,
  setAttachmentIsDeleted,
  setAttachmentId,
  lastCounter
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
  const [ShowAddLabel, setShowAddLabel] = useState([{ index: 0, show: false }]);
  const [ShowLabelDescription, setShowLabelDescription] = useState(false);
  const bindList = useRef(null);

  const cache = useRef(
    new CellMeasurerCache({
      fixedWidth: true,
      defaultHeight: 100,
    })
  );

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

  const handleSaveDesc = async (e, id, rowId, index) => {
    const data = {
      id: id,
      description: e.target.innerHTML,
    };
    const success = await updateAttachmentDesc(data);
    if (success) {
      var objIndex = unSavedEmails.findIndex((obj) => obj.id === rowId);

      const itemsAttachments = unSavedEmails[objIndex].attachments.items.map(
        (x) => (x.id === id ? { ...x, details: e.target.innerHTML } : x)
      );

      var updateArrAttachment = unSavedEmails.map((obj) => {
        if (obj.id === rowId) {
          return { ...obj, attachments: { items: itemsAttachments } };
        }
        return obj;
      });

      setUnsavedEmails(updateArrAttachment);
      setResultMessage("Successfully updated.");
      setShowToast(true);
      autoAdjustRowHeight(index);
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
      }).then(function (result) {
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

        // run updated labels query
        const params = {
          query: qGmailMessagesbyCompany,
          variables: {
            id: companyId,
            isSaved: false,
            recipient: emailIntegration,
            userTimeZone: userTimeZone,
            startDate:
              emailFilters.startDate != null
                ? momentTZ(emailFilters.startDate, userTimeZone).format(
                    "YYYY-MM-DD"
                  )
                : momentTZ(new Date(), userTimeZone).format("YYYY-MM-DD"),
            endDate:
              emailFilters.endDate != null
                ? momentTZ(emailFilters.endDate, userTimeZone).format(
                    "YYYY-MM-DD"
                  )
                : momentTZ(new Date(), userTimeZone).format("YYYY-MM-DD"),
          },
        };

        console.log("Get Messages by Company params:", params);
        API.graphql(params).then((result) => {
          const emailList = result.data.company.gmailMessages.items;
          setUnsavedEmails(emailList);
        });

        setResultMessage("Successfully updated.");
        setShowToast(true);
      });
    }

    console.log(enabledArrays);
    let temp = [...enabledArrays];
    temp = [...temp, gmailMessageId];
    setEnabledArrays(temp);
  };

  const handleSaveMainDesc = async (e, id, rowId) => {
    const data = {
      id: id,
      description: e.target.innerHTML,
    };
    const success = await updateRowDesc(data);
    if (success) {
      setResultMessage("Successfully updated.");
      setShowToast(true);

      const newArrDescription = unSavedEmails.map((emails) => {
        if (emails.id === id) {
          return { ...emails, description: e.target.innerHTML };
        }

        return emails;
      });
      setUnsavedEmails(newArrDescription);
      autoAdjustRowHeight(rowId);
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

  const handleAddLabel = async (e, gmid, index) => {
    var selectedLabels = [];
    var taggedLabels = [];

    for (var i = 0; i < e.length; i++) {
      selectedLabels = [...selectedLabels, e[i].value];
      taggedLabels = [...taggedLabels, { id: e[i].value, name: e[i].label }];
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

    const newArrLabels = unSavedEmails;

    newArrLabels.map((emails) => {
      if (emails.id === gmid) {
        emails.labels.items = taggedLabels;
      }
    });

    console.log("updated", newArrLabels);
    setUnsavedEmails(newArrLabels);

    autoAdjustRowHeight(index);
  };

  const handleAddEmailAttachmentLabel = async (e, atid, rowId, index) => {
    var selectedLabels = [];
    var taggedLabels = [];

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
    } else {
      const result = await API.graphql({
        query: mAddEmailAttachmentLabel,
        variables: {
          labelId: [],
          attachmentId: atid,
        },
      });
    }

    console.log("MainArray", unSavedEmails);

    var objIndex = unSavedEmails.findIndex((obj) => obj.id === rowId);

    const itemsAttachments = unSavedEmails[objIndex].attachments.items.map(
      (x) => (x.id === atid ? { ...x, labels: { items: taggedLabels } } : x)
    );

    const updateArrAttachment = unSavedEmails;
    updateArrAttachment.map((obj) => {
      if (obj.id === rowId) {
        obj.attachments.items = itemsAttachments;
      }
    });

    console.log("updateArr", updateArrAttachment);

    setUnsavedEmails(updateArrAttachment);
    autoAdjustRowHeight(index);
  };

  const defaultLabels = (items) => {
    if (items !== null) {
      const newOptions = items.map(({ id: value, name: label }) => ({
        value,
        label,
      }));
      return newOptions;
    } else {
      return [];
    }
  };

  const getOptions = (cmidarr) => {
    var mainLabels = labelsList;
    var cmid;

    setTimeout(() => {
      if (cmidarr.length > 0) {
        cmid = cmidarr[0].client.id;
      } else {
        cmid = "";
      }
  
      if (labelsList.length > 0 || labelsList !== null) {
        for (var i = 0; i < labelsList.length; i++) {
          // console.log("optionscheck",labelsList[i]);
  
          if (mainLabels[i].labelsExtracted.length === 0) {
            return [{value: "test", label: "no labels extracted"}];
          } else {
            if (mainLabels[i].cmid === cmid) {
              // if (mainLabels[i].labelsExtracted.length === 0) {
              //   return [];
              // } else {
                const newOptions = mainLabels[i].labelsExtracted.map(
                  ({ id: value, name: label }) => ({
                    value,
                    label,
                  })
                );
                return newOptions;
              //}
            }
          }
        }
      } else {
        return [{value: "test", label: "labelsList null"}];
      }

    }, 2000);

    
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

  const handleDeleteAttachment = async (id, rowId, index, val, e) => {
    const params = {
      query: mUpdateAttachmentStatus,
      variables: {
        id: id,
        isDeleted: val
      },
    };

    await API.graphql(params).then((result) => {
      console.log(result);
      setAttachmentIsDeleted(val);
      setAttachmentId(index);

      var objIndex = unSavedEmails.findIndex((obj) => obj.id === rowId);

      const itemsAttachments = unSavedEmails[objIndex].attachments.items.map(
        (x) => (x.id === id ? { ...x, isDeleted: val } : x)
      );

      var updateArrAttachment = unSavedEmails.map((obj) => {
        if (obj.id === rowId) {
          return { ...obj, attachments: { items: itemsAttachments } };
        }
        return obj;
      });

      setUnsavedEmails(updateArrAttachment);
    });
  }

  const handleOnKeyupRows = (e, rowId) => {
    autoAdjustRowHeight(rowId);
  }

  const autoAdjustRowHeight = (index) => {
    //bindList and cache must not be null
    console.log("Items", bindList);
    if (bindList && cache) {
      //clear first
      cache?.current.clearAll();
      bindList?.current?.recomputeRowHeights(index);
      bindList?.current?.forceUpdateGrid(index);
    } else {
      console("List reference not found || cache not found!");
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
        <tbody
          className="bg-white divide-y divide-gray-200 mb-8"
          style={{ width: "100%", height: "100vh" }}
        >
          {waitUnSaved ? (
            <tr>
              <td colSpan={5}>
                <Loading />
              </td>
            </tr>
          ) : (
            <WindowScroller key={0}
            >
              {({ height, scrollTop }) => (
                <AutoSizer disableHeight>
                  {({ width }) => (
                    <List
                      ref={bindList}
                      autoHeight
                      scrollTop={scrollTop}
                      width={width}
                      height={height}
                      rowHeight=/*{cache.current.rowHeight}*/
                      {unSavedEmails.length === 1 ?
                        "100" : cache.current.rowHeight
                      }
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
                              style=
                              /*{lastCounter === index+1 ? 
                                {
                                  ...style,
                                  width: "100%",
                                  height: "100%",
                                  border: "1px solid #f0f0f0",
                                  paddingBottom: "150px",
                                } : {
                                  ...style,
                                  width: "100%",
                                  height: "100%",
                                  border: "1px solid #f0f0f0",
                                }
                              }*/
                              {{
                                ...style,
                                width: "100%",
                                height: "100%",
                                border: "1px solid #f0f0f0",
                              }}
                              className={lastCounter === index+1 ? "tr-child" : ""}
                              key={key}
                            >
                              <td className="p-2 align-top h-full w-10">
                                <input
                                  key={item.id}
                                  className="cursor-pointer mr-1"
                                  onChange={(e) =>
                                    handleSelectItem(
                                      e,
                                      item.clientMatters.items.length
                                    )
                                  }
                                  type="checkbox"
                                  value={item.id}
                                  id={item.id}
                                  checked={selectedUnsavedItems.includes(
                                    item.id
                                  )}
                                />
                              </td>
                              <td className="p-2 align-top w-1/4">
                                <div className="w-96">
                                  <p className="text-sm font-medium">
                                    {item.subject}
                                  </p>
                                  <p className="text-xs">
                                    {item.from} at{" "}
                                    {moment(item.date).format(
                                      "DD MMM YYYY, hh:mm A"
                                    )}
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
                                        className="fixed rounded shadow bg-white p-6 z-50 w-2/3 max-h-60 overflow-auto"
                                        id={item.id}
                                      >
                                        <p>From : {item.from}</p>
                                        <p>
                                          Date :{" "}
                                          {moment(item.date).format(
                                            "DD MMM YYYY, hh:mm A"
                                          )}
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
                                        Date :{" "}
                                        {moment(item.date).format(
                                          "DD MMM YYYY, hh:mm A"
                                        )}
                                      </p>
                                      <p>To : {item.to}</p>
                                      <p>CC: {item.cc}</p>
                                    </span>
                                  </div>
                                </div>
                              </td>
                              <td className="p-2 align-top w-2/5">
                                <p
                                  className="p-2 w-full font-poppins rounded-sm"
                                  style={{
                                    border: "solid 1px #c4c4c4",
                                    cursor: "auto",
                                    outlineColor: "rgb(204, 204, 204, 0.5)",
                                    outlineWidth: "thin",
                                    //minHeight: "35px",
                                    //maxHeight: "35px",
                                    overflow: "auto",
                                  }}
                                  suppressContentEditableWarning
                                  dangerouslySetInnerHTML={{
                                    __html: item.description,
                                  }}
                                  onBlur={(e) => handleSaveMainDesc(e, item.id, index)}
                                  onInput={(e) => handleOnKeyupRows(e, index)}
                                  contentEditable={true}
                                ></p>
                                {item.attachments.items.map(
                                  (item_attach, indexAttachments) => (
                                    <React.Fragment key={item_attach.id}>
                                      <div className="flex items-start mt-2">
                                        <p
                                          className="
                                    cursor-pointer mr-1 text-opacity-90 1 
                                    textColor  group text-xs font-semibold py-1 px-2  rounded textColor bg-gray-100 inline-flex items-center  hover:text-opacity-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-opacity-75 "
                                          id={item_attach.id}
                                          title={item_attach.name}
                                          onClick={() =>
                                            previewAndDownloadFile(
                                              item_attach.id
                                            )
                                          }
                                        >
                                          {item_attach.name.substring(0, 10)}
                                          {item_attach.name.length >= 10
                                            ? "..."
                                            : ""}
                                        </p>
                                        <div
                                          className=
                                          {!item_attach.isDeleted || item_attach.isDeleted === null ?
                                            "p-2 w-full h-full font-poppins rounded-sm float-right"
                                            :
                                            "p-2 w-full h-full font-poppins rounded-sm float-right bg-gray-300"
                                          }
                                          style={{
                                            border: "solid 1px #c4c4c4",
                                            cursor: "auto",
                                            outlineColor:
                                              "rgb(204, 204, 204, 0.5)",
                                            outlineWidth: "thin",
                                            //minHeight: "35px",
                                            //maxHeight: "35px",
                                            //overflow: "auto",
                                          }}
                                          suppressContentEditableWarning
                                          dangerouslySetInnerHTML={{
                                            __html: item_attach.details,
                                          }}
                                          onBlur={(e) =>
                                            handleSaveDesc(
                                              e,
                                              item_attach.id,
                                              item.id,
                                              index
                                            )
                                          }
                                          onInput={(e) => handleOnKeyupRows(e, index)}
                                          contentEditable=
                                            {!item_attach.isDeleted || item_attach.isDeleted === null ? 
                                              true : false
                                            }
                                        ></div>
                                        {!item_attach.isDeleted || item_attach.isDeleted === null ? 
                                          <span 
                                            className="mt-2 ml-2 cursor-pointer hover:text-red-700 font-bold" 
                                            onClick={(e) =>
                                              handleDeleteAttachment(
                                                item_attach.id,
                                                item.id,
                                                indexAttachments,
                                                true,
                                                e
                                              )
                                            }
                                          >
                                            X
                                          </span>
                                          :
                                          <button
                                          className="bg-white-500 hover:bg-gray-700 hover:text-white text-gray font-bold py-2 px-1 rounded ml-2 cursor-pointer"
                                          onClick={(e) =>
                                            handleDeleteAttachment(
                                              item_attach.id,
                                              item.id,
                                              indexAttachments,
                                              false,
                                              e
                                            )
                                          }
                                          >Cancel</button>
                                        }
                                      </div>
                                    </React.Fragment>
                                  )
                                )}
                              </td>
                              <td className="p-2 align-top w-1/6">
                                <div className="relative mt-4" disabled={true}>
                                  {/*mt-2 new version mt-4 old version*/}
                                  {/* <button
                                className="
                              text-opacity-90 1
                              textColor  group text-xs font-semibold py-1 px-2  rounded textColor bg-gray-100 inline-flex items-center  hover:text-opacity-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-opacity-75"
                                id="headlessui-popover-button-87"
                                type="button"
                                aria-expanded="false"
                              >
                                {item.labelIds}
                              </button> */}
                                  {/* --NEW LABEL DESIGN STARTS HERE-- 
                                  <button
                                    onClick={() => {
                                      if (
                                        ShowAddLabel[0].item === item.id &&
                                        ShowAddLabel[0].isDesc === true &&
                                        ShowAddLabel[0].show === true
                                      ) {
                                        setShowAddLabel((prev) => [
                                          {
                                            item: item.id,
                                            index: index,
                                            show: false,
                                            isDesc: false,
                                          },
                                        ]);
                                      } else {
                                        setShowAddLabel((prev) => [
                                          {
                                            item: item.id,
                                            index: index,
                                            show: true,
                                            isDesc: true,
                                          },
                                        ]);
                                      }
                                    }}
                                    disabled={
                                      checkArrLength(
                                        item.clientMatters.items.length
                                      ) || checkEnable(item.id)
                                        ? false
                                        : true
                                    }
                                    className={`flex flex-row justify-center items-center border border-gray-300 px-1 py-1 mr-2 focus:ring mt-4 shadow-md ${
                                      checkArrLength(
                                        item.clientMatters.items.length
                                      ) || checkEnable(item.id)
                                        ? "hover:border-gray-400"
                                        : "bg-gray-200 cursor-default"
                                    }`}
                                    style={{ width: "110px" }}
                                  >
                                    <div>
                                      {`${
                                        ShowAddLabel[0].item === item.id &&
                                        ShowAddLabel[0].isDesc === true &&
                                        ShowAddLabel[0].show === true
                                          ? "Cancel Add"
                                          : "Add Labels"
                                      }`}
                                    </div>
                                  </button>
                                  {ShowAddLabel[0].item === item.id &&
                                    ShowAddLabel[0].isDesc === true &&
                                    ShowAddLabel[0].show === true && (
                                      <CreatableSelect
                                        defaultValue={() =>
                                          defaultLabels(item.labels.items)
                                        }
                                        menuPortalTarget={document.body}
                                        styles={{
                                          container: (base) => ({
                                            ...base,
                                            zIndex: "1000",
                                          }),
                                          control: (base, state) => ({
                                            ...base,
                                            position: "fixed",
                                            minWidth: "250px",
                                          }),
                                          valueContainer: (base) => ({
                                            ...base,
                                            width: "auto",
                                          }),
                                        }}
                                        components={{
                                          MenuList: CustomMenuList,
                                          MultiValueContainer:
                                            CustomValueContainer,
                                        }}
                                        isMulti
                                        isClearable
                                        options={getOptions(
                                          item.clientMatters.items
                                        )}
                                        isSearchable
                                        openMenuOnClick={true}
                                        isDisabled={
                                          checkArrLength(
                                            item.clientMatters.items.length
                                          ) || checkEnable(item.id)
                                            ? false
                                            : true
                                        }
                                        onChange={(e) =>
                                          handleAddLabel(e, item.id)
                                        }
                                        placeholder="Labels"
                                        className="bottom-8 left-32 fixed w-60 placeholder-blueGray-300 text-blueGray-600 text-xs bg-white rounded border-0 shadow outline-none focus:outline-none focus:ring z-100"
                                      />
                                    )}
                                    */}
                                  {/*Reverted Changes STARTS HERE 1st part */}
                                  <CreatableSelect
                                    defaultValue={() =>
                                      defaultLabels(item.labels.items)
                                    }
                                    isMulti
                                    isClearable
                                    options={getOptions(
                                      item.clientMatters.items
                                    )}
                                    isSearchable
                                    openMenuOnClick={true}
                                    isDisabled={
                                      checkArrLength(
                                        item.clientMatters.items.length
                                      ) || checkEnable(item.id)
                                        ? false
                                        : true
                                    }
                                    onChange={(e) => handleAddLabel(e, item.id, index)}
                                    placeholder="Labels"
                                    className="-mt-4 w-60 placeholder-blueGray-300 text-blueGray-600 text-xs bg-white rounded border-0 shadow outline-none focus:outline-none focus:ring z-100"
                                  />
                                </div>
                                {item.attachments.items.map(
                                  (item_attach, index) => (
                                    /*NEW LABELS STARTS HERE PART 2 
                                    <>
                                      
                                      <div className="flex flex-row items-center">
                                        <button
                                          onClick={() => {
                                            if (
                                              ShowAddLabel[0].item ===
                                                item.id &&
                                              ShowAddLabel[0].index === index &&
                                              ShowAddLabel[0].show === true &&
                                              ShowAddLabel[0].isDesc === false
                                            ) {
                                              setShowAddLabel((prev) => [
                                                {
                                                  item: item.id,
                                                  index: index,
                                                  show: false,
                                                  isDesc: false,
                                                },
                                              ]);
                                            } else {
                                              setShowAddLabel((prev) => [
                                                {
                                                  item: item.id,
                                                  index: index,
                                                  show: true,
                                                  isDesc: false,
                                                },
                                              ]);
                                            }
                                          }}
                                          disabled={
                                            checkArrLength(
                                              item.clientMatters.items.length
                                            ) || checkEnable(item.id)
                                              ? false
                                              : true
                                          }
                                          className={`flex flex-row justify-center items-center border border-gray-300 px-1 py-1 mr-2 focus:ring mt-4 shadow-md ${
                                            checkArrLength(
                                              item.clientMatters.items.length
                                            ) || checkEnable(item.id)
                                              ? "hover:border-gray-400"
                                              : "bg-gray-200 cursor-default"
                                          }`}
                                          style={{ width: "110px" }}
                                        >
                                          <div>
                                            {`${
                                              ShowAddLabel[0].item ===
                                                item.id &&
                                              ShowAddLabel[0].index === index &&
                                              ShowAddLabel[0].show === true &&
                                              ShowAddLabel[0].isDesc === false
                                                ? "Cancel Add"
                                                : "Add Labels"
                                            }`}
                                          </div>
                                        </button>
                                        <div className="mt-4 ml-5">
                                          (
                                          {defaultLabels(
                                            item_attach.labels.items
                                          ).length > 0 &&
                                            defaultLabels(
                                              item_attach.labels.items
                                            ).length}
                                          )
                                        </div>
                                      </div>
                                      {ShowAddLabel[0].item === item.id &&
                                        ShowAddLabel[0].index === index &&
                                        ShowAddLabel[0].show === true &&
                                        ShowAddLabel[0].isDesc === false && (
                                          <div className="">
                                            <CreatableSelect
                                              menuPortalTarget={document.body}
                                              defaultValue={() =>
                                                defaultLabels(
                                                  item_attach.labels.items
                                                )
                                              }
                                              styles={{
                                                container: (base) => ({
                                                  ...base,
                                                  zIndex: "1000",
                                                }),
                                                control: (base, state) => ({
                                                  ...base,
                                                  //bottom: "-3px",
                                                  //left: "120px",
                                                  position: "fixed",
                                                  minWidth: "250px",
                                                }),
                                                valueContainer: (base) => ({
                                                  ...base,
                                                  width: "auto",
                                                }),
                                              }}
                                              components={{
                                                MenuList: CustomMenuList,
                                                MultiValueContainer:
                                                  CustomValueContainer,
                                              }}
                                              isMulti
                                              isClearable
                                              options={getOptions(
                                                item.clientMatters.items
                                              )}
                                              openMenuOnClick={true}
                                              isDisabled={
                                                checkArrLength(
                                                  item.clientMatters.items
                                                    .length
                                                ) || checkEnable(item.id)
                                                  ? false
                                                  : true
                                              }
                                              onChange={(e) =>
                                                handleAddEmailAttachmentLabel(
                                                  e,
                                                  item_attach.id,
                                                  item.id
                                                )
                                              }
                                              placeholder="Labels"
                                              className="bottom-8 left-32 fixed w-60 placeholder-blueGray-300 text-blueGray-600 text-xs bg-white rounded border-0 shadow outline-none focus:outline-none focus:ring z-100"
                                            />
                                          </div>
                                        )}
                                    </>
                                    REVERT CHANGES START HERE*/

                                    <CreatableSelect
                                      defaultValue={() =>
                                        defaultLabels(item_attach.labels.items)
                                      }
                                      isMulti
                                      isClearable
                                      options={getOptions(
                                        item.clientMatters.items
                                      )}
                                      openMenuOnClick={true}
                                      isDisabled={
                                        checkArrLength(
                                          item.clientMatters.items.length
                                        ) || checkEnable(item.id)
                                          ? false
                                          : true
                                      }
                                      onChange={(e) =>
                                        handleAddEmailAttachmentLabel(
                                          e,
                                          item_attach.id,
                                          item.id,
                                          index
                                        )
                                      }
                                      placeholder="Labels"
                                      className="mt-1 w-60 placeholder-blueGray-300 text-blueGray-600 text-xs bg-white rounded border-0 shadow outline-none focus:outline-none focus:ring z-100"
                                    />
                                  )
                                )}
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
