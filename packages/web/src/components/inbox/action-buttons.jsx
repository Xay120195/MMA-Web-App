import React, { useState } from "react";
import ToastNotification from "../toast-notification";

const ActionButtons = ({
  selectedItems,
  setSelectedItems,
  openTab,
}) => {
  
  const handleSaveRead = () => {
    
  }

  const handleUnSaveRead = () => {
    
  }

  const handleCheckAllChange = (ischecked) => {

    if (ischecked) {
      
    } else {
      
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
            onChange={(e) => handleCheckAllChange(e.target.checked)}
            type="checkbox"
            className="w-4 h-4 text-cyan-600 bg-gray-100 rounded border-gray-300 focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
          />
          {selectedItems.length !== 0 && openTab === 1 ? (
            <>
              <button
                type="button"
                onClick={() => handleSaveRead()}
                className="bg-green-400 hover:bg-green-500 text-white text-sm py-2 px-4 rounded inline-flex items-center border-0 shadow outline-none focus:outline-none focus:ring mx-4"
              >
                Save Emails
              </button>
            </>
          ) : (
            <>
            </>
          )}

          {selectedItems.length !== 0 && openTab === 2 ? (
            <>
              <button
                type="button"
                onClick={() => handleUnSaveRead()}
                className="bg-green-400 hover:bg-green-500 text-white text-sm py-2 px-4 rounded inline-flex items-center border-0 shadow outline-none focus:outline-none focus:ring mx-4"
              >
                Unsave Emails
              </button>
            </>
          ) : (<></>)}
        </div>

        <div className=" col-span-1 pt-2">
        </div>
      </div>
    </>
  );
};

export default ActionButtons;
