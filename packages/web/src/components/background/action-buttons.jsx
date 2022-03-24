import React, { useState, useEffect } from "react";
import ToastNotification from "../toast-notification";
import { API } from "aws-amplify";
import RemoveFileModal from "../file-bucket/remove-file-modal";
import { AiFillFile, AiFillEye } from "react-icons/ai";
//import { selectedRowsBG } from "./table-info";

const ActionButtons = ({
  idList,
  setWitness,
  witness,
  setShowSearch,
  checkAllState,
  setcheckAllState,
  setCheckedState,
  settotalChecked,
  setSearch,
  setId,
  matterId,
  getBackground,
  selectedRowsBG,
  setSelectedRowsBG,
  setShowModalParagraph,
  showDeleteButton,
  setShowDeleteButton,
  activateButton,
  handleManageFiles,
  checkNo, setCheckNo,
  checkDate, setCheckDate,
  checkDesc, setCheckDesc,
  checkDocu, setCheckDocu
}) => {
  const [newWitness, setList] = useState(witness);
  const [showToast, setShowToast] = useState(false);
  const [alertMessage, setalertMessage] = useState();

  const [showRemoveFileModal, setshowRemoveFileModal] = useState(false);
  const [showhideState, setShowHideState] = useState(false);



  const hideToast = () => {
    setShowToast(false);
  };

  const handleDelete = async (item) => {
    console.log(item);
    if (item.length === 0) {
      window.alert("Please select row.");
    } else {
      const backgroundIds = item.map((i) => i.id);

      console.log("backgroundIds", backgroundIds);

      const mDeleteBackground = `
        mutation bulkDeleteBackground($id: [ID]) {
          backgroundBulkDelete(id: $id) {
            id
          }
        }
        `;

      const deleteBackgroundRow = await API.graphql({
        query: mDeleteBackground,
        variables: {
          id: backgroundIds,
        },
      });

      console.log(deleteBackgroundRow);

      setalertMessage(`Successfully deleted`);
      console.log(setCheckedState);

      const newArr = Array(witness.length).fill(false);
      setCheckedState(newArr);

      setSelectedRowsBG([]);

      if (temp.length > 0) {
        setShowDeleteButton(true);
      } else {
        setShowDeleteButton(false);
      }

      setShowToast(true);
      setshowRemoveFileModal(false);
      setTimeout(() => {
        setShowToast(false);
        getBackground();
        setWitness([]);
        setcheckAllState(false);
      }, 3000);
    }
  };

  const handleAddRow = async () => {
    const dateToday =
      new Date().getFullYear() +
      "/" +
      (new Date().getMonth() + 1) +
      "/" +
      new Date().getDate();

    const mCreateBackground = `
        mutation createBackground($clientMatterId: String, $date: String, $description: String) {
          backgroundCreate(clientMatterId: $clientMatterId, date: $date, description: $description) {
            id
          }
        }
    `;

    const createBackgroundRow = await API.graphql({
      query: mCreateBackground,
      variables: {
        clientMatterId: matterId,
        date: dateToday,
        description: "",
      },
    });
    if (createBackgroundRow) {
      getBackground();
      setcheckAllState(false);

      // const newArr = Array(witness.length).fill(false);
      // setCheckedState = newArr;
      setCheckedState(new Array(witness.length).fill(false));
      setSelectedRowsBG([]);
      setShowDeleteButton(false);
    }
  };
  var temp = [];
  const handleCheckAllChange = (ischecked) => {
    setcheckAllState(!checkAllState);

    if (ischecked) {
      setCheckedState(new Array(witness.length).fill(true));
      settotalChecked(0);
      //insert row
      witness.map((data) => (temp = [...temp, { id: data.id, fileName: "x" }]));
      setSelectedRowsBG(temp);
      if (temp.length > 0) {
        setShowDeleteButton(true);
      } else {
        setShowDeleteButton(false);
      }
    } else {
      setCheckedState(new Array(witness.length).fill(false));
      settotalChecked(witness.length);
      setId(witness.map((s) => s.id));
      setShowDeleteButton(false);
      setSelectedRowsBG([]);
    }
  };

  const handleSearchChange = (event) => {
    setSearch(event.target.value);
    var dm = event.target.value;
    var str = dm.toString();
    var result = newWitness.filter((x) => x.name.toLowerCase().includes(str));
    if (result === []) {
      setWitness(witness);
      setShowSearch(true);
    } else {
      setWitness(result);
    }
  };
  useEffect(() => {
    setWitness(newWitness);
  }, [newWitness]);

  function showModal() {
    setshowRemoveFileModal(true);
  }

  const handleModalClose = () => {
    setshowRemoveFileModal(false);
  };

  const handleCheckNo = () => {
    if(checkNo){
      setCheckNo(false);
    }else{
      setCheckNo(true);
    }
  };

  const handleCheckDate = () => {
    if(checkDate){
      setCheckDate(false);
    }else{
      setCheckDate(true);
    }
  };

  const handleCheckDesc = () => {
    if(checkDesc){
      setCheckDesc(false);
    }else{
      setCheckDesc(true);
    }
  };

  const handleCheckDocu = () => {
    if(checkDocu){
      setCheckDocu(false);
    }else{
      setCheckDocu(true);
    }
  };

  const handleShowHide = () => {
    if(showhideState){
      setShowHideState(false);
    }else{
      setShowHideState(true);
    }
  }

  return (
    <>
      <div className="grid grid-rows grid-flow-col pt-5">
        <div className="col-span-6 ">
          <input
            name="check_all"
            id="check_all"
            aria-describedby="checkbox-1"
            type="checkbox"
            checked={checkAllState}
            onChange={(e) => handleCheckAllChange(e.target.checked)}
            className="w-4 h-4 text-blue-600 bg-gray-100 rounded border-gray-300 focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
          />

          <button
            onClick={handleAddRow}
            type="button"
            className="bg-green-400 hover:bg-green-500 text-white text-sm py-2 px-4 rounded inline-flex items-center border-0 shadow outline-none focus:outline-none focus:ring mx-2"
          >
            Add row
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-4 w-4 mx-1"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v3m0 0v3m0-3h3m-3 0H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </button>
          <button
            onClick={() => setShowModalParagraph(true)}
            type="button"
            className="bg-white-400 hover:bg-white-500 text-black text-sm py-2 px-4 rounded inline-flex items-center border-0 shadow outline-none focus:outline-none focus:ring mx-2"
          >
            Add Paragraph
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-4 w-4 mx-1"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v3m0 0v3m0-3h3m-3 0H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </button>


          <div className="inline-flex">
          <button
            type="button"
            className=
            {!activateButton ? " hover:bg-gray-200 text-black text-sm py-2 px-4 rounded inline-flex items-center border-0 shadow outline-none focus:outline-none focus:ring mx-2"
            : "bg-green-400 hover:bg-green-350 text-white text-sm py-2 px-4 rounded inline-flex items-center border-0 shadow outline-none focus:outline-none focus:ring mx-2"
            }
            onClick={() => handleShowHide()}
          >
            SHOW/HIDE COLUMNS &nbsp; <AiFillEye />
          </button>
          {showhideState &&
          <div className="w-64 h-48 z-100 bg-white absolute mt-10 ml-2 rounded border-0 shadow outline-none">
            <p className="px-2 py-2 text-gray-400 text-xs font-semibold">TABLE COLUMN OPTIONS</p>
            <div className="px-2 py-1">
              <input type="checkbox" 
                name="checkNo"
                className="cursor-pointer"
                checked={checkNo}
                onChange={(event) => handleCheckNo()}
              />
              &nbsp; No.
            </div>
            <div className="px-2 py-1">
              <input type="checkbox" 
                  name="checkDate"
                  className="cursor-pointer"
                  checked={checkDate}
                  onChange={(event) => handleCheckDate()}
              />
              &nbsp; Date
            </div>
            <div className="px-2 py-1">
              <input type="checkbox" 
                name="checkDesc"
                className="cursor-pointer"
                checked={checkDesc}
                onChange={(event) => handleCheckDesc()}
              />
              &nbsp; Description of Background and Category
            </div>
            <div className="px-2 py-1">
              <input type="checkbox" 
                name="checkDocu"
                className="cursor-pointer"
                checked={checkDocu}
                onChange={(event) => handleCheckDocu()}
              />
              &nbsp; Document
            </div>
          </div>
          }
          </div>
       
          
          <button
            type="button"
            className=
            {!activateButton ? " hover:bg-gray-200 text-black text-sm py-2 px-4 rounded inline-flex items-center border-0 shadow outline-none focus:outline-none focus:ring mx-2"
            : "bg-green-400 hover:bg-green-350 text-white text-sm py-2 px-4 rounded inline-flex items-center border-0 shadow outline-none focus:outline-none focus:ring mx-2"
            }
            onClick={() => handleManageFiles()}
          >
            MANAGE FILES &nbsp; <AiFillFile />
          </button>

          {showDeleteButton && (
            <button
              type="button"
              onClick={() => setshowRemoveFileModal(true)}
              className="bg-red-400 hover:bg-red-500 text-white text-sm py-2 px-4 rounded inline-flex items-center border-0 shadow outline-none focus:outline-none focus:ring ml-2"
            >
              Delete
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z"
                  clipRule="evenodd"
                />
              </svg>
            </button>
          )}
        </div>
      </div>
      {showToast && (
        <ToastNotification title={alertMessage} hideToast={hideToast} />
      )}

      {showRemoveFileModal && (
        <RemoveFileModal
          handleSave={handleDelete}
          handleModalClose={handleModalClose}
          selectedRowsBG={selectedRowsBG}
        />
      )}
    </>
  );
};

export default ActionButtons;
