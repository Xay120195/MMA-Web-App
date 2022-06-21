import React, { useState } from "react";
import ToastNotification from "../toast-notification";

const ActionButtons = ({
  unreaddata,
  readdata,
  setCheckedStateRead,
  setCheckedStateUnreRead,
  setTotalReadChecked,
  setTotalUnReadChecked,
  totalChecked,
  getIdUnread,
  getIdRead,
  data,
  dispatch,
  ACTIONS,
  checkAllState,
  setcheckAllState,
  setId,
  getId,
  setSelectMessage,
}) => {
  const hideToast = () => {
    setShowToast(false);
  };
  const [showToast, setShowToast] = useState(false);
  const [alertMessage, setalertMessage] = useState();

  const handleCheckAllChange = (ischecked) => {
    setcheckAllState(!checkAllState);

    if (ischecked) {
      setCheckedStateRead(new Array(readdata.length).fill(true));
      setCheckedStateUnreRead(new Array(unreaddata.length).fill(true));
      setTotalReadChecked(readdata.length);
      setTotalUnReadChecked(unreaddata.length);
      setId(data.map((s) => s.id));
      setSelectMessage(true);
    } else {
      setCheckedStateRead(new Array(readdata.length).fill(false));
      setCheckedStateUnreRead(new Array(readdata.length).fill(false));
      setTotalUnReadChecked(0);
      setTotalReadChecked(0);
      setSelectMessage(false);
    }
  };
  const handleSaveRead = (listId1, listId2) => {
    const total = [];
    const totalId = total.concat(listId1, listId2);

    var id = totalId.map(function (x) {
      return parseInt(x, 10);
    });

    var totalid = getId.map(function (x) {
      return parseInt(x, 10);
    });

    const seletedId = checkAllState === true ? totalid : id;

    seletedId.forEach((findId) => {
      const foundObj = data.find(({ id }) => id == findId);
      if (foundObj) foundObj.save = true;
      if (foundObj) {
        setalertMessage(`Successfully saved message`);
        setShowToast(true);
        setTimeout(() => {
          setShowToast(false);
        }, 3000);
      }
    });

    dispatch({ type: ACTIONS.SAVE_READ, payload: { data: data } });

    setCheckedStateRead(new Array(readdata.length).fill(false));
    setCheckedStateUnreRead(new Array(readdata.length).fill(false));
    setTotalUnReadChecked(0);
    setTotalReadChecked(0);
    setcheckAllState(false);
    setSelectMessage(false);
  };

  const handleMarkUnread = (listId1, listId2) => {
    const total = [];
    const totalId = total.concat(listId1, listId2);

    const id = totalId.map(function (x) {
      return parseInt(x, 10);
    });

    var totalid = getId.map(function (x) {
      return parseInt(x, 10);
    });

    const seletedId = checkAllState === true ? totalid : id;

    seletedId.forEach((findId) => {
      const foundObj = data.find(({ id }) => id == findId);
      if (foundObj) foundObj.status = true;
      if (foundObj) {
        setalertMessage(`Successfully mark as unread message`);
        setShowToast(true);
        setTimeout(() => {
          setShowToast(false);
        }, 3000);
      }
    });

    dispatch({ type: ACTIONS.MARK_UNREAD, payload: { data: data } });

    setCheckedStateRead(new Array(readdata.length).fill(false));
    setCheckedStateUnreRead(new Array(readdata.length).fill(false));
    setTotalUnReadChecked(0);
    setTotalReadChecked(0);
    setcheckAllState(false);
    setSelectMessage(false);
  };
  const handleDelete = (listId1, listId2) => {
    const total = [];
    const totalId = total.concat(listId1, listId2);

    var id = totalId.map(function (x) {
      return parseInt(x, 10);
    });

    dispatch({
      type: ACTIONS.DELETE_DATA,
      payload: { id: checkAllState === true ? getId : id },
    });

    setCheckedStateRead(new Array(readdata.length).fill(false));
    setCheckedStateUnreRead(new Array(readdata.length).fill(false));
    setTotalUnReadChecked(0);
    setTotalReadChecked(0);
    setcheckAllState(false);
    setSelectMessage(false);

    if (id) {
      setalertMessage(`Successfully deleted`);
      setShowToast(true);
      setTimeout(() => {
        setShowToast(false);
      }, 3000);
    }
  };

  return (
    <>
      <div className="grid grid-rows grid-flow-col pt-5">
        <div className="col-span-6 ">
          <input
            name="check_all"
            id="check_all"
            aria-describedby="checkbox-1"
            checked={checkAllState}
            onChange={(e) => handleCheckAllChange(e.target.checked)}
            type="checkbox"
            className="w-4 h-4 text-cyan-600 bg-gray-100 rounded border-gray-300 focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
          />
          {totalChecked === 0 ? (
            <>
            
            </>
          ) : (
            <>
              <button
                type="button"
                onClick={() => handleSaveRead(getIdRead, getIdUnread)}
                className="bg-green-400 hover:bg-green-500 text-white text-sm py-2 px-4 rounded inline-flex items-center border-0 shadow outline-none focus:outline-none focus:ring mx-4"
              >
                Save
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-4 w-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4"
                  />
                </svg>
              </button>
              <button
                type="button"
                onClick={() => handleMarkUnread(getIdRead, getIdUnread)}
                className="bg-slate-100 hover:bg-slate-200 text-black text-sm py-2 px-2 rounded inline-flex items-center border-0 shadow outline-none focus:outline-none focus:ring "
              >
                Mark as unread
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-4 w-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                  />
                </svg>
              </button>
              <button
                type="button"
                onClick={() => handleDelete(getIdRead, getIdUnread)}
                className="bg-red-400 hover:bg-red-500 text-white text-sm py-2 px-4 rounded inline-flex items-center border-0 shadow outline-none focus:outline-none focus:ring mx-4"
              >
                Delete
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-4 w-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                  />
                </svg>
              </button>
            </>
          )}
        </div>

        <div className=" col-span-1 pt-2">
        </div>
      </div>
      {showToast && (
        <ToastNotification title={alertMessage} hideToast={hideToast} />
      )}
    </>
  );
};

export default ActionButtons;
