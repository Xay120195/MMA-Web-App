import React, { useState, useEffect, useRef } from "react";
import ToastNotification from "../toast-notification";
import { API } from "aws-amplify";
import RemoveFileModal from "../file-bucket/remove-file-modal";
import BriefModal from "../background/create-minibrief-modal";
import { AiFillFile, AiFillEye } from "react-icons/ai";

const ActionButtons = (props) => {
  const {
    background,
    setSelectedItems,
    checkAllState,
    setcheckAllState,
    setCheckedState,
    settotalChecked,
    setId,
    matterId,
    selectedItems,
    getBackground,
    selectedRowsBG,
    setSelectedRowsBG,
    setShowModalParagraph,
    showDeleteButton,
    setShowDeleteButton,
    activateButton,
    handleManageFiles,
    checkDate,
    setCheckDate,
    checkDesc,
    setCheckDesc,
    checkDocu,
    setCheckDocu,
    checkedStateShowHide,
    selectRow,
    setSelectRow,
    pasteButton,
    setPasteButton,
    setBackground,
    setMaxLoading,
    sortByOrder,
    briefId,
    matter_name,
    client_name,
    holdDelete,
    setHoldDelete,
  } = props;

  const [showToast, setShowToast] = useState(false);
  const [alertMessage, setalertMessage] = useState();

  const [showRemoveFileModal, setshowRemoveFileModal] = useState(false);
  const [showhideState, setShowHideState] = useState(false);
  const [tableColumnList, setTableColumnList] = useState(null);
  const [showBriefModal, setShowBriefModal] = useState(false);
  const [deletePermanently, setDeletePermanently] = useState(true);

  const bool = useRef(true);

  var moment = require("moment");

  const hideToast = () => {
    setShowToast(false);
  };

  const handleDelete = (item) => {
    const newArr = Array(background.length).fill(false);
    setCheckedState(newArr);
    setcheckAllState(false);
    setshowRemoveFileModal(false);
    setalertMessage(`Deleting Rows. Click HERE to undo action`);
    setShowToast(true);

    setHoldDelete(true);

    console.log("Deleted IDs: ", item);
    if (item.length === 0) {
      window.alert("Please select row.");
    } else {
      setTimeout(() => {
        setShowToast(false);
      }, 10000);

      setTimeout(() => {
        if (bool.current) {
          deleteProper(item);
        } else {
          cancelDelete();
        }
      }, 10000);
    }
  };

  const deleteProper = (item) => {
    const newArr = Array(background.length).fill(false);
    setCheckedState(newArr);
    setcheckAllState(false);

    console.log("item", item);

    setHoldDelete(true);
    const mDeleteBackground = `
            mutation untagBriefBackground($briefId: ID, $background: [BackgroundInput]) {
              briefBackgroundUntag(briefId: $briefId, background: $background) {
                id
              }
            }
            `;

    const deletedId = API.graphql({
      query: mDeleteBackground,
      variables: {
        briefId: briefId,
        background: item,
      },
    });

    setMaxLoading(false);
    setSelectedRowsBG([]);
    setSelectRow([]);
    setSelectedItems([]);

    if (temp.length > 0) {
      setShowDeleteButton(true);
    } else {
      setShowDeleteButton(false);
    }
    setalertMessage(`Successfully Deleted Permanently.`);
    setShowToast(true);

    setTimeout(() => {
      setShowToast(false);
      setHoldDelete(false);
      getBackground();
    }, 2000);
  };

  const cancelDelete = () => {
    const newArr = Array(background.length).fill(false);
    setCheckedState(newArr);
    setcheckAllState(false);
    getBackground();
    setalertMessage(`Successfully Restored Rows.`);
    setShowToast(true);
    setSelectRow([]);
    setHoldDelete(false);
    setSelectedItems([]);
    setSelectedRowsBG([]);

    bool.current = false;

    if (temp.length > 0) {
      setShowDeleteButton(true);
    } else {
      setShowDeleteButton(false);
    }

    setTimeout(() => {
      setShowToast(false);
      setcheckAllState(false);
    }, 2000);
  };

  function undoAction() {
    setalertMessage(`Restoring Rows..`);
    setShowToast(true);
    const newArr = Array(background.length).fill(false);
    setCheckedState(newArr);
    setSelectedRowsBG([]);
    setSelectedItems([]);
    setcheckAllState(false);
    setHoldDelete(false);
    bool.current = false;

    setTimeout(() => {
      setShowToast(false);
    }, 3000);
  }

  const handleAddRow = async () => {
    console.log("handleAddRow");
    const dateToday = moment
      .utc(moment(new Date(), "YYYY-MM-DD"))
      .toISOString();

    const mCreateBackground = `
        mutation createBackground($briefId: ID, $description: String, $date: AWSDateTime) {
          backgroundCreate(briefId: $briefId, description: $description, date: $date) {
            id
          }
        }
    `;

    const createBackgroundRow = await API.graphql({
      query: mCreateBackground,
      variables: {
        briefId: briefId,
        description: "",
        date: null,
      },
    });

    if (createBackgroundRow) {
      const result = {
        createdAt: dateToday,
        id: createBackgroundRow.data.backgroundCreate.id,
        description: "",
        date: null,
        order: 0,
        files: { items: [] },
      };

      setBackground((background) => sortByOrder(background.concat(result)));
      background.splice(0, 0, result);

      const rowArrangement = background.map(({ id }, index) => ({
        id: id,
        order: index + 1,
      }));

      const mUpdateBackgroundOrder = `
        mutation bulkUpdateBackgroundOrders($arrangement: [ArrangementInput]) {
          backgroundBulkUpdateOrders(arrangement: $arrangement) {
            id
            order
          }
        }`;
      const response = await API.graphql({
        query: mUpdateBackgroundOrder,
        variables: {
          arrangement: rowArrangement,
        },
      });
      console.log(response);

      setcheckAllState(false);
      setCheckedState(new Array(background.length).fill(false));
      setSelectedRowsBG([]);
      setShowDeleteButton(false);
      setMaxLoading(false);

      setBackground(background);
    }
  };

  var temp = [];
  const handleCheckAllChange = (ischecked) => {
    setcheckAllState(!checkAllState);

    if (ischecked) {
      setCheckedState(new Array(background.length).fill(true));
      settotalChecked(0);
      //insert row
      // remove order after migration
      background.map(
        (data) =>
          (temp = [...temp, { id: data.id, fileName: "x", order: data.order }])
      );
      setSelectedRowsBG(temp);
      if (temp.length > 0) {
        setShowDeleteButton(true);
      } else {
        setShowDeleteButton(false);
      }
    } else {
      setCheckedState(new Array(background.length).fill(false));
      settotalChecked(background.length);
      setId(background.map((s) => s.id));
      setShowDeleteButton(false);
      setSelectedRowsBG([]);
    }
  };

  useEffect(() => {
    if (tableColumnList === null) {
      getColumnSettings();
    }
  }, [tableColumnList]);

  const handleModalClose = () => {
    setshowRemoveFileModal(false);
    setShowBriefModal(false);
  };
  const handleClick = (event, name, state) => {
    if (name === "DATE") {
      if (checkDate) {
        setCheckDate(false);
      } else {
        setCheckDate(true);
      }
    }

    if (name === "DOCUMENT") {
      if (checkDocu) {
        setCheckDocu(false);
      } else {
        setCheckDocu(true);
      }
    }

    if (name === "DESCRIPTIONOFBACKGROUND") {
      if (checkDesc) {
        setCheckDesc(false);
      } else {
        setCheckDesc(true);
      }
    }
  };

  const handleColumnCheckChanged = (event, data) => {
    setShowHideState(true);
    const params = {
      isVisible: event.target.checked,
    };

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

  const getColumnSettings = async () => {
    const tableName = "BACKGROUNDS";

    const userColumnSettings = await API.graphql({
      query: qGetUserColumnSettings,
      variables: {
        tableName: tableName,
        userId: localStorage.getItem("userId"),
      },
    });

    userColumnSettings.data.userColumnSettings.map(
      (x) => x.columnSettings.name === "DATE" && setCheckDate(x.isVisible)
    );
    userColumnSettings.data.userColumnSettings.map(
      (x) => x.columnSettings.name === "DOCUMENT" && setCheckDocu(x.isVisible)
    );
    userColumnSettings.data.userColumnSettings.map(
      (x) =>
        x.columnSettings.name === "DESCRIPTIONOFBACKGROUND" &&
        setCheckDesc(x.isVisible)
    );

    if (
      tableColumnList === null &&
      userColumnSettings.data.userColumnSettings.length === 0
    ) {
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

        await API.graphql({
          query: mCreateDefaultUserColumnSettings,
          variables: {
            columnSettings: defaultColumnSettingsIds,
            userId: localStorage.getItem("userId"),
          },
        }).then((data) => {
          getColumnSettings();
        });
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

  const qlistBackgroundFiles = `
  query getBackgroundByID($id: ID) {
    background(id: $id) {
      id
      files {
        items {
          id
          details
          name
        }
      }
    }
  }`;

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

  setBackground(background);

  const handleCopyRow = () => {
    setPasteButton(true);
    localStorage.setItem("selectedRows", JSON.stringify(selectRow));
  };

  const handleShowBrief = () => {
    setShowBriefModal(true);
  };

  const handleCheckAll = (e) => {
    const ids = background.map(({ id }) => ({
      id,
      fileName: "",
    }));
    if (e.target.checked) {
      setSelectedItems(background.map((x) => x.id));
      setcheckAllState(true);
      setShowDeleteButton(true);
      setSelectRow(background.map((x) => x));
      setSelectedRowsBG(ids);
    } else {
      setSelectedItems([]);
      setcheckAllState(false);
      setShowDeleteButton(false);
      setSelectRow([]);
      setSelectedRowsBG([]);
    }
  };

  return (
    <>
      <div className="pl-2 py-1 grid grid-cols-1 gap-1.5">
        <div className="col-span-6">
          <input
            name="check_all"
            id="check_all"
            aria-describedby="checkbox-1"
            type="checkbox"
            checked={checkAllState ? true : false}
            onChange={handleCheckAll}
            className="w-4 h-4 text-blue-600 bg-gray-100 rounded border-gray-300 focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
          />
          {!showDeleteButton && (
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
          )}
          {!showDeleteButton && (
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
          )}
          <div className="inline-flex">
            {!showDeleteButton && (
              <button
                type="button"
                className={
                  "hover:bg-gray-200 text-black text-sm py-2 px-4 rounded inline-flex items-center border-0 shadow outline-none focus:outline-none focus:ring mx-2"
                }
                onClick={() => handleShowHide()}
              >
                SHOW/HIDE COLUMNS &nbsp; <AiFillEye />
              </button>
            )}
            {showhideState && (
              <div className="w-64 h-38 z-500 bg-white absolute mt-10 ml-2 rounded border-0 shadow outline-none">
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
                          data.columnSettings.name === "DATE"
                            ? checkDate
                            : data.columnSettings.name === "DOCUMENT"
                            ? checkDocu
                            : checkDesc
                        }
                        onClick={(event) =>
                          handleClick(
                            event,
                            data.columnSettings.name,
                            checkedStateShowHide
                          )
                        }
                        onChange={(event) =>
                          handleColumnCheckChanged(event, data)
                        }
                      />
                      &nbsp; {data.columnSettings.label}
                    </div>
                  ))}
              </div>
            )}
          </div>
          {!showDeleteButton && (
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
          )}
          {showDeleteButton && (
            <>
              <button
                type="button"
                className={
                  !activateButton
                    ? " hover:bg-gray-200 text-black text-sm py-2 px-4 rounded inline-flex items-center border-0 shadow outline-none focus:outline-none focus:ring mx-2"
                    : "bg-green-400 hover:bg-green-350 text-white text-sm py-2 px-4 rounded inline-flex items-center border-0 shadow outline-none focus:outline-none focus:ring mx-2"
                }
                onClick={() => handleShowBrief()}
              >
                Create Brief +
              </button>
              <button
                type="button"
                onClick={handleCopyRow}
                className="bg-white-400 hover:bg-white-500 text-black text-sm py-2 px-4 rounded inline-flex items-center border-0 shadow outline-none focus:outline-none focus:ring ml-2"
              >
                {pasteButton ? "PASTE" : "COPY"} {selectRow.length}
                &nbsp;{selectRow.length >= 2 ? "ROWS" : "ROW"}
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M8 7v8a2 2 0 002 2h6M8 7V5a2 2 0 012-2h4.586a1 1 0 01.707.293l4.414 4.414a1 1 0 01.293.707V15a2 2 0 01-2 2h-2M8 7H6a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2v-2"
                  />
                </svg>
              </button>
              <button
                type="button"
                disabled={pasteButton ? true : false}
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
            </>
          )}
        </div>
      </div>
      {/* {showToast && (
        <ToastNotification title={alertMessage} hideToast={hideToast} />
      )} */}

      {showToast && (
        <div onClick={holdDelete ? () => undoAction() : null}>
          <ToastNotification title={alertMessage} hideToast={hideToast} />
        </div>
      )}

      {showRemoveFileModal && (
        <RemoveFileModal
          handleSave={handleDelete}
          handleModalClose={handleModalClose}
          selectedRowsBG={selectedRowsBG}
        />
      )}

      {showBriefModal && (
        <BriefModal
          selectedRowsBG={selectedRowsBG}
          handleModalClose={handleModalClose}
          matterId={matterId}
          briefId={briefId}
          matter_name={matter_name}
          client_name={client_name}
        />
      )}
    </>
  );
};

export default ActionButtons;
