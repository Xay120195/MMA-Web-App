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

const mTagEmailClientMatter = `
  mutation tagGmailMessageClientMatter($clientMatterId: ID, $gmailMessageId: String) {
    gmailMessageClientMatterTag(
      clientMatterId: $clientMatterId
      gmailMessageId: $gmailMessageId
    ) {
      id
    }
  }`;

const mUpdateRowDescription = `mutation saveGmailDescription($id: String, $description: String) {
  gmailMessageDescriptionUpdate(id: $id, description: $description) {
    id
  }
}`;

const qGetFileDownloadLink = `
query getAttachmentDownloadLink($id: String) {
  gmailAttachment(id: $id) {
    downloadURL
  }
}`;

const TableSavedInfo = ({
  selectedSavedItems,
  setSelectedSavedItems,
  savedEmails,
  matterList,
  maxLoadingSavedEmail,
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

  const listClientMatters = `
  query listClientMatters($companyId: String) {
    company(id: $companyId) {
      clientMatters (sortOrder: CREATED_DESC) {
        items {
          id
          createdAt
          client {
            id
            name
          }
          matter {
            id
            name
          }
        }
      }
    }
  }
  `;

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

  /*const handleSelectItem = (e, position) => {
    const { value } = e.target;
    const checkedId = selectedSavedItems.some((x) => x.id === value);

    if (!checkedId && e.target.checked) {
      const x = selectedSavedItems;
      x.push({ id: value });
      setSelectedSavedItems(x);

      const updatedCheckedState = selectedSavedItems.map((item, index) =>
        index === position ? !item : item
      );
      setSelectedSavedItems(updatedCheckedState);
    } else {
        setSelectedSavedItems([]);
    }
  }*/

  const handleSelectItem = (e) => {
    const { id, checked } = e.target;
    setSelectedSavedItems([...selectedSavedItems, id]);
    if (!checked) {
      setSelectedSavedItems(selectedSavedItems.filter((item) => item !== id));
    }
  };

  const handleClientMatterChanged = (newValue) => {
    console.log(newValue);
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

  const handleClientMatter = async (e, gmailMessageId) => {
    const request = API.graphql({
      query: mTagEmailClientMatter,
      variables: {
        clientMatterId: e.value,
        gmailMessageId: gmailMessageId,
      },
    });
  };

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
        var totalPages = pdf.internal.getNumberOfPages();
        var i = 0;

        for (i = 1; i <= totalPages; i++) {
          pdf.setPage(i);
          pdf.setFontSize(10);
          pdf.setTextColor(150);
          pdf.text(
            pdf.internal.pageSize.width - 100,
            pdf.internal.pageSize.height - 30,
            "Page " + i + " of " + totalPages
          );
        }
        window.open(pdf.output("bloburl"), "_blank");
      });
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
      <table className="table-fixed min-w-full divide-y divide-gray-200 text-xs border-b-2 border-l-2 border-r-2 border-slate-100">
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
          {savedEmails.map((item, index) => (
            <tr key={item.id + "-" + index}>
              <td className="p-2 align-top">
                <input
                  key={item.id}
                  className="cursor-pointer mr-1"
                  onChange={handleSelectItem}
                  type="checkbox"
                  value={item.id}
                  id={item.id}
                  checked={selectedSavedItems.includes(item.id)}
                />
              </td>
              <td className="p-2 align-top">
                <p className="text-sm font-medium">{item.subject}</p>
                <p className="text-xs">
                  {item.from} at{" "}
                  {moment(item.date).format("DD MMM YYYY, hh:mm A")}
                </p>
                <p>
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
                </p>
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
              <td className="p-2 align-top">
                <p
                  className="hidden p-2 w-full h-full font-poppins rounded-sm"
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
                <p
                  className="p-2 w-full h-full font-poppins rounded-sm"
                  dangerouslySetInnerHTML={{ __html: item.description }}
                ></p>
                {item.attachments.items.map((item_attach, index) => (
                  <React.Fragment key={item_attach.id}>
                    <div className="flex items-start mt-1">
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
                <div className="relative">
                  {/* {item.labels &&
                    item.labels.items &&
                    item.labels.items.map((i, index) => (
                      <button
                        key={i.id}
                        className=" mb-1
                          text-opacity-90 1
                          textColor  group text-xs font-semibold py-1 px-2  rounded textColor bg-gray-100 inline-flex items-center  hover:text-opacity-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-opacity-75"
                        id="headlessui-popover-button-87"
                        type="button"
                        aria-expanded="false"
                      >
                        {i.name}
                      </button>
                    ))}

                  {item.attachments &&
                    item.attachments.items.map(
                      (attach, index) =>
                        attach.labels &&
                        attach.labels.items &&
                        attach.labels.items.map((lbl, index) => (
                          <button
                            key={lbl.id}
                            className=" mb-1
                  text-opacity-90 1
                  textColor  group text-xs font-semibold py-1 px-2  rounded textColor bg-gray-100 inline-flex items-center  hover:text-opacity-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-opacity-75"
                            id="headlessui-popover-button-87"
                            type="button"
                            aria-expanded="false"
                          >
                            {lbl.name}
                          </button>
                        ))
                    )} */}
                </div>
              </td>
              <td className="p-2 align-top">
                <>
                  
                  {item.clientMatters.items.map((item_clientMatter, index) => (
                    <>
                      <span
                        className="text-sm cursor-pointer mr-1 text-opacity-90 1
                  textColor  group text-xs font-semibold py-1 px-2  rounded textColor bg-gray-100 inline-flex items-center  hover:text-opacity-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-opacity-75"
                      >
                        {item_clientMatter.client.name +
                          "/" +
                          item_clientMatter.matter.name}
                      </span>
                    </>
                  ))}
                </>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {maxLoadingSavedEmail ? (
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

export default TableSavedInfo;
