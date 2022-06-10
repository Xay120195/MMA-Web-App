import React, { useState, useEffect, useRef } from "react";
import ToastNotification from "../toast-notification";
import { FaTimes } from "react-icons/fa";
import { TiCancel } from "react-icons/ti";
import { BsFillTrashFill } from "react-icons/bs";


export default function RemoveBriefModal(props) {
  const handleModalClose = () => {
    props.handleModalClose();
  };

  const [showToast, setShowToast] = useState(false);
  const [resultMessage, setResultMessage] = useState("");
  const hideToast = () => {
    setShowToast(false);
  };
  var rowsToDelete;

  const handleDelete = async () => {
    props.handleSave(props.removeBriefId);
  };

  return (
    <>
      <div className="justify-center items-center flex overflow-x-hidden overflow-y-auto fixed inset-0 z-50 outline-none focus:outline-none">
        <div className="relative w-full my-6 mx-auto max-w-lg">
          <div className="border-0 rounded-lg shadow-lg relative w-full bg-white outline-none focus:outline-none">
            <div className="items-center">
              <div className="flex items-center justify-center p-6 rounded-b">
                <BsFillTrashFill className="text-3xl items-center" />
              </div>
              <div className="flex items-center justify-center py-1 rounded-b">
                <p className="text-lg font-semibold">
                  Delete
                </p>
              </div>
              <div className="items-center rounded-b mb-5">
                <div className="px-5 w-full items-center text-center text-md">
                Once confirmed, this action will never be undone. <br/>Do you want to continue?
                </div>
              </div>

              <div className="flex items-center justify-end p-6 rounded-b">
                <div className="px-5 w-full flex items-center justify-center text-md">
                  <button
                    className="mr-2 bg-white hover:bg-gray-300 text-black text-sm py-2 px-4 rounded inline-flex items-center border-0 shadow outline-none focus:outline-none focus:ring"
                    onClick={handleModalClose}
                  >
                    Cancel &nbsp; <TiCancel />
                  </button>

                  <button
                    className="ml-2 bg-red-400 hover:bg-red-500 text-white font-semibold py-2 px-4 rounded inline-flex items-center border-0 shadow outline-none focus:outline-none focus:ring"
                    type="button"
                    onClick={() => handleDelete()}
                  >
                    Delete &nbsp; <BsFillTrashFill />
                  </button>
                </div>
              </div>
              {showToast && resultMessage && (
                <ToastNotification
                  title={resultMessage}
                  hideToast={hideToast}
                />
              )}
            </div>
          </div>
        </div>
      </div>
      <div className="opacity-25 fixed inset-0 z-40 bg-black"></div>
    </>
  );
}
