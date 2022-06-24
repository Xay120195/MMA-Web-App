import React, { useState, useEffect, useCallback, useRef } from "react";
import { AppRoutes } from "../../constants/AppRoutes";
import ToastNotification from "../toast-notification";
import { AiOutlineDownload } from "react-icons/ai";
import { FaPaste, FaSync, FaSort, FaPlus, FaChevronDown } from "react-icons/fa";
import Loading from "../loading/loading";
import CreatableSelect from "react-select/creatable";
import {
  BsFillTrashFill,
  BsFillBucketFill,
  BsSortUpAlt,
  BsSortDown,
} from "react-icons/bs";
import Unsaved from "./data-source";
import { useRootClose } from 'react-overlays';

var moment = require("moment");

const TableSavedInfo = ({
  selectedSavedItems,
  setSelectedSavedItems,
  savedEmails,
}) => {
  const ref = useRef([]);
  const [show, setShow] = useState(false);
  const [snippetId, setSnippetId] = useState();
  const handleRootClose = () => setShow(false);
  const [selectedClientMatter, setSelectedClientMatter] = useState();
  const [isShiftDown, setIsShiftDown] = useState(false);
  const [lastSelectedItem, setLastSelectedItem] = useState(null);

  const companyId = localStorage.getItem("companyId");

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
            <th className="font-medium px-2 py-4 text-center whitespace-nowrap w-1/4">
              Attachments and Description
            </th>
            <th className="font-medium px-2 py-4 text-center whitespace-nowrap w-1/4">
              Labels
            </th>
            <th className="font-medium px-2 py-4 text-center whitespace-nowrap w-1/4">
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
              <td className="p-2" >
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
                    <span>{JSON.stringify(item.payload.data)}</span>
                  </div>
                )}
                </p>
              </td>
              <td className="p-2" >

              </td>
              <td className="p-2" >

              </td>
              <td className="p-2" >
                <CreatableSelect
                  //options={clientsOptions}
                  isClearable
                  isSearchable
                  onChange={handleClientMatterChanged}
                  placeholder="Client/Matter"
                  className="placeholder-blueGray-300 text-blueGray-600 relative bg-white rounded text-sm border-0 shadow outline-none focus:outline-none focus:ring w-full"
                />
              </td>
            </tr>
          ))}
          </tbody>
      </table>
    </>
  );
};

export default TableSavedInfo;
