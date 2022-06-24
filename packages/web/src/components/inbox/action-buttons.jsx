import { useEffect, useState } from "react";
import { API } from "aws-amplify";
//import { ToastContainer, toast } from 'react-toastify';
//import 'react-toastify/dist/ReactToastify.css';

const ActionButtons = ({
  selectedUnsavedItems,
  selectedSavedItems,
  openTab,
  getUnSavedEmails,
  getSavedEmails
}) => {

  const companyId = localStorage.getItem("companyId");

  const mSaveUnsavedEmails = `
  mutation saveGmailMessage($companyId: ID, $id: ID, $isSaved: Boolean) {
    gmailMessageSave(companyId: $companyId, id: $id, isSaved: $isSaved) {
      id
    }
  }`;

  const handleEmails = async (status) => {
    console.log(status);
    // Soon will change this to bulk mutation 
    selectedUnsavedItems.map((obj) => {
      console.log(obj.id);
      const request = API.graphql({
        query: mSaveUnsavedEmails,
        variables: {
          companyId: companyId,
          id: obj.id,
          isSaved: status
        },
      });
    });

    setTimeout(() => {
      getSavedEmails();
      getUnSavedEmails();
    }, 2000);
    
  };

  const handleCheckAllChange = (e) => {
    if (e.target.checked) {
      //setSelectedItems(e.target.id);
    } else {
      //setSelectedItems([]);
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
          {selectedUnsavedItems.length !== 0 && openTab === 1 ? (
            <>
              <button
                type="button"
                onClick={() => handleEmails(true)}
                className="bg-green-400 hover:bg-green-500 text-white text-sm py-2 px-4 rounded inline-flex items-center border-0 shadow outline-none focus:outline-none focus:ring mx-4"
              >
                Save Emails
              </button>
            </>
          ) : (
            <>
            </>
          )}

          {selectedSavedItems.length !== 0 && openTab === 2 ? (
            <>
              <button
                type="button"
                onClick={() => handleEmails(false)}
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

      {/** <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
      />
      <ToastContainer />
      */}
    </>
  );
};

export default ActionButtons;
