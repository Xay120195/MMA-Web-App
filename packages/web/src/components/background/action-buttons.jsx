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
  checkNo,
  setCheckNo,
  checkDate,
  setCheckDate,
  checkDesc,
  setCheckDesc,
  checkDocu,
  setCheckDocu,
  checkedStateShowHide,
  setCheckedStateShowHide
}) => {
  const [newWitness, setList] = useState(witness);
  const [showToast, setShowToast] = useState(false);
  const [alertMessage, setalertMessage] = useState();

  const [showRemoveFileModal, setshowRemoveFileModal] = useState(false);
  const [showhideState, setShowHideState] = useState(false);
  const [tableColumnList, setTableColumnList] = useState(null);

  const hideToast = () => {
    setShowToast(false);
  };

  const handleDelete = async (item) => {
    if (item.length === 0) {
      window.alert("Please select row.");
    } else {
      const backgroundIds = item.map((i) => i.id);

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

      setalertMessage(`Successfully deleted`);

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
    const dateToday = new Date().toISOString();

    const mCreateBackground = `
        mutation createBackground($clientMatterId: String, $date: AWSDateTime, $description: String) {
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

    if (tableColumnList === null) {
      getColumnSettings();
    }
  }, [tableColumnList, newWitness]);

  function showModal() {
    setshowRemoveFileModal(true);
  }

  const handleModalClose = () => {
    setshowRemoveFileModal(false);
  };

  const handleColumnCheckChanged = (event, data) => {
    const params = {
      isVisible: event.target.checked,
    };

    // alert("clicked");
    // alert(event.target.checked);
    console.log(data);
    let temp = checkedStateShowHide;
    console.log(temp);

    for(var i=0; i<checkedStateShowHide.length; i++){
      if(data.columnSettings.name === "DATE"){
        if(temp[0]){
          temp[0] = false;
        }else{
          temp[0] = true;
        }
      }else if(data.columnSettings.name === "DOCUMENT"){
        if(temp[2]){
          temp[2] = false;
        }else{
          temp[2] = true;
        }
      }else if(data.columnSettings.name === "DESCRIPTIONOFBACKGROUND"){
        if(temp[1]){
          temp[1] = false;
        }else{
          temp[1] = true;
        }
      }
    }

    console.log(temp);
    setCheckedStateShowHide(temp);
    console.log(checkedStateShowHide);
    updateUserColumnSettings(data.id, params);
  };

  const handleShowHide = () => {
    if (showhideState) {
      setShowHideState(false);
    } else {
      setShowHideState(true);
    }
  };

  const qGetDefaultColumnSettings = `
  query getColumnSettings($tableName: ViewTable) {
    columnSettings(tableName: $tableName) {
      id
      label
      name
      createdAt
    }
  }`;
  const qGetUserColumnSettings = `
  query getUserColumnSettings($tableName: ViewTable, $userId: ID) {
    userColumnSettings(userId: $userId, tableName: $tableName) {
      id
      isVisible
      userId
      columnSettings {
        id
        label
        name
        tableName
      }
    }
  }`;

  const mCreateDefaultUserColumnSettings = `
  mutation createDefaultColumnSettings($columnSettings: [ColumnSettingsInput], $userId: ID) {
    userColumnSettingsCreate(userId: $userId, columnSettings: $columnSettings) {
      userId
    }
  }`;

  var temp = [];

  const getColumnSettings = async () => {
    const tableName = "BACKGROUNDS";

    const userColumnSettings = await API.graphql({
      query: qGetUserColumnSettings,
      variables: {
        tableName: tableName,
        userId: localStorage.getItem("userId"),
      },
    });

    console.log(userColumnSettings.data.userColumnSettings);
   
    userColumnSettings.data.userColumnSettings.map(x=> temp= [...temp, x.isVisible]);
    setCheckedStateShowHide(temp);

    console.log(checkedStateShowHide);

    if (userColumnSettings.data.userColumnSettings.length === 0) {
      // no default user column settings

      const defaultColumnSettings = await API.graphql({
        query: qGetDefaultColumnSettings,
        variables: {
          tableName: tableName,
        },
      });

      if (defaultColumnSettings.data.columnSettings !== null) {
        const defaultColumnSettingsIds =
          defaultColumnSettings.data.columnSettings.map((i) => {
            return { id: i.id };
          });

        const insertDefaultUserColumnSettings = await API.graphql({
          query: mCreateDefaultUserColumnSettings,
          variables: {
            columnSettings: defaultColumnSettingsIds,
            userId: localStorage.getItem("userId"),
          },
        });

        getColumnSettings();
      }
    } else {
      setTableColumnList(userColumnSettings.data.userColumnSettings);
    }
  };

  const mUpdateUserColumnSettings = `
  mutation UpdateUserColumnSettings($isVisible: Boolean, $id: ID) {
    userColumnSettingsUpdate(id: $id, isVisible: $isVisible) {
      id
    }
  }
  `;

  async function updateUserColumnSettings(id, data) {
    return new Promise((resolve, reject) => {
      try {
        const request = API.graphql({
          query: mUpdateUserColumnSettings,
          variables: {
            id: id,
            isVisible: data.isVisible,
          },
        });

        resolve(request);
      } catch (e) {
        reject(e.errors[0].message);
      }
    });
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
              className={
                "hover:bg-gray-200 text-black text-sm py-2 px-4 rounded inline-flex items-center border-0 shadow outline-none focus:outline-none focus:ring mx-2"
              }
              onClick={() => handleShowHide()}
            >
              SHOW/HIDE COLUMNS &nbsp; <AiFillEye />
            </button>
            {showhideState && (
              <div className="w-64 h-38 z-100 bg-white absolute mt-10 ml-2 rounded border-0 shadow outline-none">
                <p className="px-2 py-2 text-gray-400 text-xs font-semibold">
                  TABLE COLUMN OPTIONS
                </p>

                {tableColumnList !== null &&
                  tableColumnList.map((data, index) => (
                    <div className="px-2 py-1" key={data.id}>
                      <input
                        type="checkbox"
                        name={data.columnSettings.name}
                        className="cursor-pointer"
                        // checked={data.isVisible}
                        checked={
                          data.columnSettings.name === 'DATE' ?
                          checkedStateShowHide[0]
                          : data.columnSettings.name === "DOCUMENT" ?
                          checkedStateShowHide[2]
                          : checkedStateShowHide[1]
                        }
                        onChange={(event) =>
                          handleColumnCheckChanged(event, data)
                        }
                      />
                      &nbsp; {data.columnSettings.label} {checkedStateShowHide[index]}
                    </div>
                  ))}
              </div>
            )}
          </div>

          <button
            type="button"
            className={
              !activateButton
                ? " hover:bg-gray-200 text-black text-sm py-2 px-4 rounded inline-flex items-center border-0 shadow outline-none focus:outline-none focus:ring mx-2"
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
