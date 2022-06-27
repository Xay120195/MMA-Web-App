import React, { useState, useEffect, useCallback, useRef } from "react";
import { API } from "aws-amplify";
import ToastNotification from "../toast-notification";
import Loading from "../loading/loading";
import CreatableSelect from "react-select/creatable";
import { useRootClose } from 'react-overlays';
import imgLoading from "../../assets/images/loading-circle.gif";

var moment = require("moment");

const mUpdateAttachmentDescription = `mutation MyMutation($details: String, $id: ID) {
    gmailMessageAttachmentUpdate(id: $id, details: $details) {
      id
      details
    }
  }`;

const mTagEmailClientMatter = `
  mutation tagGmailMessageClientMatter($clientMatterId: ID, $gmailMessageId: ID) {
    gmailMessageClientMatterTag(
      clientMatterId: $clientMatterId
      gmailMessageId: $gmailMessageId
    ) {
      id
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
  }

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

  const handleSelectItem = (e, position) => {
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
  }

  /*const getNextValue = (value) => {
    const hasBeenSelected = !selectedItems.includes(value);

    if (isShiftDown) {
      const newSelectedItems = getNewSelectedItems(value);

      const selections = [...new Set([...selectedItems, ...newSelectedItems])];

      if (!hasBeenSelected) {
        return selections.filter((item) => !newSelectedItems.includes(item));
      }

      return selections;
    }

    // if it's already in there, remove it, otherwise append it
    return selectedItems.includes(value)
      ? selectedItems.filter((item) => item !== value)
      : [...selectedItems, value];
  };

  const getNewSelectedItems = (value) => {
    const currentSelectedIndex = unSavedEmails.findIndex(
      (item) => item.id === value
    );
    const lastSelectedIndex = unSavedEmails.findIndex(
      (item) => item.id === lastSelectedItem
    );

    return unSavedEmails
      .slice(
        Math.min(lastSelectedIndex, currentSelectedIndex),
        Math.max(lastSelectedIndex, currentSelectedIndex) + 1
      )
      .map((item) => item.id);
  };

  useEffect(() => {
    document.addEventListener("keyup", handleKeyUp, false);
    document.addEventListener("keydown", handleKeyDown, false);

    return () => {
      document.removeEventListener("keyup", handleKeyUp);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [handleKeyUp, handleKeyDown]);
  */

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

    const handleClientMatter = async (e, gmailMessageId) => {
    const request = API.graphql({
        query: mTagEmailClientMatter,
        variables: {
        clientMatterId: e.value,
        gmailMessageId: gmailMessageId
        },
    });
    };
  
  return (
    <>
      <table className="table-fixed min-w-full divide-y divide-gray-200 text-xs border-b-2 border-l-2 border-r-2 border-slate-100">
        <thead
          className="z-10"
          /*style={{ position: "sticky", top: "190px" }}*/
        >
          <tr>
            <th className="font-medium px-2 py-4 text-center whitespace-nowrap w-10">
              
              </th>
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
          <tbody className="bg-white divide-y divide-gray-200" >
          {savedEmails.map((item, index) => (
            <tr>
              <td className="p-2" >
                <input
                  className="cursor-pointer mr-1"
                  onChange={handleSelectItem}
                  type="checkbox"
                  value={item.id}
                  id={`item-${item.id}`}
                />
              </td>
              <td className="p-2 align-top" >
                <p className="text-sm font-medium" >{item.subject}</p>
                <p className="text-xs" >{item.from} at {moment(item.date).format("DD MMM YYYY, hh:mm A")}</p>
                <p><div className="relative"><button className="
                text-opacity-90
                text-[12px] font-normal inline-flex items-center gap-x-2 rounded primary_light hover:text-opacity-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-opacity-75 text-xs" type="button" aria-expanded="false"
                id={item.id}
                onClick={handleSnippet}
                >read more</button></div>
                {show && (
                  <div
                    ref={el => (ref.current[index] = el)}
                    className="absolute rounded shadow bg-white p-6 z-50 w-1/2 max-h-60 overflow-auto"
                    id={item.id}
                  >
                    <p>From : {item.from}</p>
                    <p>Date : {moment(item.date).format("DD MMM YYYY, hh:mm A")}</p>
                    <p>Subject : {item.subject}</p>
                    <p>To : {item.to}</p>
                    <p>BCC: </p>
                    <p>CC:</p>
                    <br/>
                    <span>{item.payload}</span>
                  </div>
                )}
                </p>
              </td>
              <td className="p-2" >
              {item.attachments.items.map((item_attach, index) => (
                <>
                  <div className="flex items-start mt-1" >
                  <p className="
                  cursor-pointer mr-1 text-opacity-90 1
                  textColor  group text-xs font-semibold py-1 px-2  rounded textColor bg-gray-100 inline-flex items-center  hover:text-opacity-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-opacity-75" id={item_attach.id} >{item_attach.name}</p>
                  <div
                    className="p-2 w-1/2 h-full font-poppins rounded-sm"
                    style={{
                      border: "solid 1px #c4c4c4",
                      cursor: "auto",
                      outlineColor:
                        "rgb(204, 204, 204, 0.5)",
                      outlineWidth: "thin",
                    }}
                    suppressContentEditableWarning
                    dangerouslySetInnerHTML={{
                      __html: item_attach.details,
                    }}
                    
                    onBlur={(e) =>
                      handleSaveDesc(
                        e,
                        item_attach.id
                      )
                    }
                    contentEditable={true}
                  ></div>
                </div>
                </>
              ))}

              </td>
              <td className="p-2 align-top" >
                <div className="relative"><button className="
                  text-opacity-90 1
                  textColor  group text-xs font-semibold py-1 px-2  rounded textColor bg-gray-100 inline-flex items-center  hover:text-opacity-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-opacity-75" id="headlessui-popover-button-87" type="button" aria-expanded="false">{item.labelIds}</button>
                </div>
              </td>
              <td className="p-2 align-top" >
                <>
                  <CreatableSelect
                      defaultValue={
                        item.clientMatters.items.map((item_clientMatter, index) => (
                        { value: item_clientMatter.id , label: item_clientMatter.client.name+"/"+item_clientMatter.matter.name}
                      ))}
                      options={matterList}
                      isClearable
                      isSearchable
                      onChange={(options, e) =>
                        handleClientMatter(
                          options,
                          item.id
                        )
                      }
                      placeholder="Client/Matter"
                      className="placeholder-blueGray-300 text-blueGray-600 relative bg-white rounded text-sm border-0 shadow outline-none focus:outline-none focus:ring w-full"
                  />
                </>
              </td>
            </tr>
          ))}
          </tbody>
      </table>
      {maxLoadingSavedEmail ? (
        <><div className="flex justify-center items-center mt-5">All Data has been loaded</div></>
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
