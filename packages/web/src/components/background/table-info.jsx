import React, { useState, useEffect, useRef } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { Link } from "react-router-dom";
import { AppRoutes } from "../../constants/AppRoutes";
import ToastNotification from "../toast-notification";
import { AiOutlineDownload } from "react-icons/ai";
import { FaPaste } from "react-icons/fa";
import { BsFillTrashFill } from "react-icons/bs";
import EmptyRow from "./empty-row";
import { ModalParagraph } from "./modal";
import { API } from "aws-amplify";
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";
import { MdDragIndicator } from "react-icons/md";
import RemoveModal from "../delete-prompt-modal";
import { useHistory, useLocation } from "react-router-dom";
import barsFilter from "../../assets/images/bars-filter.svg";
import { useMemo } from "react";
import { useCallback } from "react";

export let selectedRowsBGPass = [],
  selectedRowsBGFilesPass = [];

const TableInfo = ({
  witness,
  files,
  setFiles,
  setIdList,
  setWitness,
  checkAllState,
  setcheckAllState,
  checkedState,
  setCheckedState,
  settotalChecked,
  search,
  getId,
  setId,
  getBackground,
  matterId,
  selectedRowsBG,
  setSelectedRowsBG,
  ShowModalParagraph,
  setShowModalParagraph,
  paragraph,
  setParagraph,
  setAscDesc,
  ascDesc,
  setShowDeleteButton,
  activateButton,
  setSelectedRowsBGFiles,
  selectedRowsBGFiles,
  setSelectedId,
  selectedId,
  setpasteButton,
  pasteButton,
  setActivateButton,
  checkNo,
  checkDate,
  checkDesc,
  checkDocu,
}) => {
  let temp = selectedRowsBG;
  let tempFiles = selectedRowsBGFiles;
  const [showToast, setShowToast] = useState(false);
  const [alertMessage, setalertMessage] = useState();
  const [loading, setLoading] = useState(true);

  const [active, setActive] = useState(false);
  const [selected, setSelected] = useState("");
  const [descId, setDescId] = useState("");
  const [textDesc, setTextDesc] = useState("");
  const [descAlert, setDescAlert] = useState("");
  const [updateProgess, setUpdateProgress] = useState(false);
  const [showRemoveFileModal, setshowRemoveFileModal] = useState(false);
  const [selectedFileBG, setselectedFileBG] = useState([]);
  const [highlightRows, setHighlightRows] = useState("bg-green-200");

  const location = useLocation();
  const history = useHistory();

  const searchItem = location.search;
  const counter = new URLSearchParams(searchItem).get("count");

  const queryParams = new URLSearchParams(location.search);

  const hideToast = () => {
    setShowToast(false);
  };

  const showModal = (id, backgroundId) => {
    var tempIndex = [];
    tempIndex = [
      ...tempIndex,
      { id: id, backgroundId: backgroundId, fileName: "x" },
    ];
    setselectedFileBG(tempIndex);
    setshowRemoveFileModal(true);
  };

  const handleModalClose = () => {
    setshowRemoveFileModal(false);
  };

  const handleCheckboxChange = (position, event, id) => {
    const updatedCheckedState = checkedState.map((item, index) =>
      index === position ? !item : item
    );
    setCheckedState(updatedCheckedState);

    let tc = updatedCheckedState.filter((v) => v === true).length;
    settotalChecked(tc);

    if (tc !== witness.length) {
      if (checkAllState) {
        setcheckAllState(false);
      }
    } else {
      if (!checkAllState) {
        setcheckAllState(true);
      }
    }
    if (event.target.checked) {
      if (!witness.includes({ id: event.target.name })) {
        setId((item) => [...item, event.target.name]);
        if (temp.indexOf(temp.find((tempp) => tempp.id === id)) > -1) {
        } else {
          //edited part
          temp = [...temp, { id: id, fileName: position.toString() }];
          selectedRowsBGPass = temp;
          setSelectedRowsBG(temp);

          if (temp.length > 0) {
            setShowDeleteButton(true);
          } else {
            setShowDeleteButton(false);
          }
        }
      }
    } else {
      setId((item) => [...item.filter((x) => x !== event.target.name)]);
      if (temp.indexOf(temp.find((tempp) => tempp.id === id)) > -1) {
        temp.splice(temp.indexOf(temp.find((tempp) => tempp.id === id)), 1);
        setSelectedRowsBG(temp);
        selectedRowsBGPass = temp;
      }

      if (temp.length > 0) {
        setShowDeleteButton(true);
      } else {
        setShowDeleteButton(false);
      }
    }

    console.log(selectedRowsBGFiles);
  };

  useEffect(() => {
    setTimeout(() => {
      setLoading(false);
    }, 1000);

    setIdList(getId);
  }, [getId]);

  const handleDescContent = (e, description, id) => {
    if (!descAlert) {
      setTextDesc(description);
      setDescId(id);
      setDescAlert("");
    } else {
      setDescAlert("");
    }
  };

  const handleChangeDesc = (event) => {
    setTextDesc(event.currentTarget.textContent);
    const countspace = textDesc.split("\n\n");
    console.log(countspace);
  };

  const handleSaveDesc = async (e, description, date, id) => {
    if (textDesc.length <= 0) {
      setDescAlert("description can't be empty");
      setUpdateProgress(false);
    } else if (textDesc === description) {
      setDescAlert("");
      setUpdateProgress(true);
      setalertMessage(`Saving in progress..`);
      setShowToast(true);

      const data = {
        description: description,
        date: date,
      };

      await updateBackgroundDetails(id, data);
      setTimeout(() => {
        setTimeout(() => {
          setTextDesc("");
          setalertMessage(`Successfully updated `);
          setShowToast(true);
          setTimeout(() => {
            setShowToast(false);
            setUpdateProgress(false);
          }, 1000);
        }, 1000);
      }, 1000);
    } else {
      {
        setDescAlert("");
        setUpdateProgress(true);
        setalertMessage(`Saving in progress..`);
        setShowToast(true);

        const data = {
          description: textDesc,
          date: date,
        };
        await updateBackgroundDetails(id, data);
        setTimeout(() => {
          setTimeout(() => {
            setTextDesc("");
            setalertMessage(`Successfully updated `);
            setShowToast(true);
            setTimeout(() => {
              setShowToast(false);
              setUpdateProgress(false);
            }, 1000);
          }, 1000);
        }, 1000);
      }
    }
  };

  const handleChangeDate = async (selected, id, description) => {
    const data = {
      description: !description ? "" : description,
      date: String(selected),
    };
    await updateBackgroundDetails(id, data);

    const updatedOSArray = witness.map((p) =>
      p.id === id ? { ...p, date: String(selected) } : p
    );

    setWitness(updatedOSArray);
  };

  const mUpdateBackground = `
    mutation updateBackground($id: ID, $description: String, $date: AWSDateTime) {
      backgroundUpdate(id: $id, description: $description, date: $date) {
        id
        description
        date
      }
    }
  `;

  async function updateBackgroundDetails(id, data) {
    return new Promise((resolve, reject) => {
      try {
        const request = API.graphql({
          query: mUpdateBackground,
          variables: {
            id: id,
            date: new Date(data.date).toISOString(),
            description: data.description,
          },
        });
        resolve(request);
      } catch (e) {
        reject(e.errors[0].message);
      }
    });
  }

  function stripedTags(str) {
    const stripedStr = str.replace(/<[^>]+>/g, "");
    return stripedStr;
  }

  const handleDragEnd = async (e) => {
    let tempWitness = [...witness];

    let [selectedRow] = tempWitness.splice(e.source.index, 1);

    tempWitness.splice(e.destination.index, 0, selectedRow);
    setWitness(tempWitness);

    const res = tempWitness.map(myFunction);

    function myFunction(item, index) {
      let data;
      return (data = {
        id: item.id,
        order: index + 1,
      });
    }

    res.map(async function (x) {
      const mUpdateBackgroundOrder = `
  mutation updateBackground($id: ID, $order: Int) {
    backgroundUpdate(id: $id, order: $order) {
      id
      order
    }
  }`;
      await API.graphql({
        query: mUpdateBackgroundOrder,
        variables: {
          id: x.id,
          order: x.order,
        },
      });
    });
  };

  const handleChageBackground = (id) => {
    setSelected(id);
    if (active) {
      setActive(false);
    } else {
      setActive(true);
    }
  };

  const previewAndDownloadFile = async (downloadURL) => {
    window.open(downloadURL);
  };

  const mUpdateBackgroundFile = `
    mutation addBackgroundFile($backgroundId: ID, $files: [FileInput]) {
      backgroundFileTag(backgroundId: $backgroundId, files: $files) {
        id
      }
    }
  `;

  const handleDelete = async (item) => {
    const filteredArrFiles = files.filter((i) => i.uniqueId !== item[0].id);
    let arrFiles = [];
    for (let i = 0; i < witness.length; i++) {
      arrFiles = filteredArrFiles
        .filter((element) => element.backgroundId === witness[i].id)
        .map(({ id }) => ({
          id: id,
        }));
      console.log(arrFiles);
      if (witness[i].id !== null) {
        const request = API.graphql({
          query: mUpdateBackgroundFile,
          variables: {
            backgroundId: witness[i].id,
            files: arrFiles,
          },
        });
      }
    }
    setFiles(filteredArrFiles);
    setshowRemoveFileModal(false);
    setalertMessage(`File successfully deleted!`);
    setShowToast(true);
    setTimeout(() => {
      setShowToast(false);
    }, 3000);
  };

  setTimeout(() => {
    setHighlightRows("bg-white");

    if (queryParams.has("count")) {
      queryParams.delete("count");
      history.replace({
        search: queryParams.toString(),
      });
    }
  }, 10000);

  const SortBydate = () => {
    if (!ascDesc) {
      setAscDesc(true);

      witness.sort(
        (a, b) =>
          new Date(a.date) - new Date(b.date) ||
          new Date(a.createdAt) - new Date(b.createdAt)
      );
    } else {
      setAscDesc(false);
      witness.sort(
        (a, b) =>
          new Date(b.date) - new Date(a.date) ||
          new Date(b.createdAt) - new Date(a.createdAt)
      );
    }
    setWitness(witness);
  };

  const handleFilesCheckboxChange = (event, id, files_id, background_id) => {
    if (event.target.checked) {
      if (!files.includes({ uniqueId: event.target.name })) {
        if (
          tempFiles.indexOf(
            tempFiles.find((temppFiles) => temppFiles.id === id)
          ) > -1
        ) {
        } else {
          tempFiles = [
            ...tempFiles,
            { id: id, files: files_id, backgroundId: background_id },
          ];
          selectedRowsBGFilesPass = tempFiles;
          setSelectedRowsBGFiles(tempFiles);
        }
      }
    } else {
      if (
        tempFiles.indexOf(
          tempFiles.find((temppFiles) => temppFiles.id === id)
        ) > -1
      ) {
        tempFiles.splice(
          tempFiles.indexOf(
            tempFiles.find((temppFiles) => temppFiles.id === id)
          ),
          1
        );
        setSelectedRowsBGFiles(tempFiles);
        selectedRowsBGFilesPass = tempFiles;
      }
    }
  };

  const qlistBackgroundFiles = `
  query getBackgroundByID($id: ID) {
    background(id: $id) {
      id
      files {
        items {
          id
          downloadURL
          details
          name
        }
      }
    }
  }`;

  const pasteFilestoBackground = async (background_id) => {
    let arrCopyFiles = [];
    let arrFileResult = [];
    const seen = new Set();

    const backgroundFilesOpt = await API.graphql({
      query: qlistBackgroundFiles,
      variables: {
        id: background_id,
      },
    });

    if (backgroundFilesOpt.data.background.files !== null) {
      arrFileResult = backgroundFilesOpt.data.background.files.items.map(
        ({ id }) => ({
          id: id,
        })
      );
    }

    arrCopyFiles = selectedRowsBGFiles.map(({ files }) => ({
      id: files,
    }));

    arrCopyFiles.push(...arrFileResult);

    const filteredArr = arrCopyFiles.filter(el => {
      const duplicate = seen.has(el.id);
      seen.add(el.id);
      return !duplicate;
    });

    if (background_id !== null) {
      const request = await API.graphql({
        query: mUpdateBackgroundFile,
        variables: {
          backgroundId: background_id,
          files: filteredArr,
        },
      });
      getBackground();
    }

    setSelectedId(background_id);
    setTimeout(() => {
      setSelectedId(0);
    }, 2000);
  };

  const handleSelected = (date) => {
    return new Date(date);
  };
  return (
    <>
      <div
        className="flex flex-col"
        style={{ padding: "2rem", marginLeft: "4rem" }}
      >
        <div className="-my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
          <div className="py-2 align-middle inline-block min-w-full sm:px-6 lg:px-8">
            <div className="shadow overflow-hidden border-b border-gray-200 sm:rounded-lg">
              {witness.length === 0 ? (
                <EmptyRow search={search} />
              ) : (
                <>
                  <DragDropContext onDragEnd={handleDragEnd}>
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          {checkNo && (
                            <th
                              scope="col"
                              className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                            >
                              No
                            </th>
                          )}
                          {checkDate && (
                            <th
                              scope="col"
                              className="px-3 py-3 text-left flex text-xs font-medium text-gray-500 uppercase tracking-wider"
                            >
                              Date
                              <img
                                src={barsFilter}
                                className="mx-auto"
                                alt="filter"
                                onClick={SortBydate}
                                style={{ cursor: "pointer" }}
                              />
                            </th>
                          )}
                          {checkDesc && (
                            <th
                              scope="col"
                              className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                            >
                              Description of Background
                            </th>
                          )}
                          {checkDocu && (
                            <th
                              scope="col"
                              className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                            >
                              Document
                            </th>
                          )}
                        </tr>
                      </thead>
                      <Droppable droppableId="droppable-1">
                        {(provider) => (
                          <tbody
                            ref={provider.innerRef}
                            {...provider.droppableProps}
                            className="bg-white divide-y divide-gray-200"
                          >
                            {witness.map((item, index) => (
                              <Draggable
                                key={item.id}
                                draggableId={item.id}
                                index={index}
                              >
                                {(provider, snapshot) => (
                                  <tr
                                    key={item.id}
                                    index={index}
                                    className={
                                      index + 1 <= counter ? highlightRows : ""
                                    }
                                    {...provider.draggableProps}
                                    ref={provider.innerRef}
                                    style={{
                                      ...provider.draggableProps.style,
                                      backgroundColor:
                                        snapshot.isDragging ||
                                        (active && item.id === selected)
                                          ? "rgba(255, 255, 239, 0.767)"
                                          : "",
                                    }}
                                  >
                                    {checkNo && (
                                      <td
                                        {...provider.dragHandleProps}
                                        className="px-3 py-3 w-10"
                                      >
                                        <div className="flex items-center ">
                                          <MdDragIndicator
                                            className="text-2xl"
                                            onClick={() =>
                                              handleChageBackground(item.id)
                                            }
                                          />
                                          <input
                                            type="checkbox"
                                            name={item.id}
                                            className="cursor-pointer w-10"
                                            checked={checkedState[index]}
                                            onChange={(event) =>
                                              handleCheckboxChange(
                                                index,
                                                event,
                                                item.id
                                              )
                                            }
                                          />
                                          <label
                                            htmlFor="checkbox-1"
                                            className="text-sm font-medium text-gray-900 dark:text-gray-300"
                                          >
                                            {index + 1}
                                          </label>
                                        </div>
                                      </td>
                                    )}
                                    {checkDate && (
                                      <td
                                        {...provider.dragHandleProps}
                                        className="px-3 py-3"
                                      >
                                        <div>
                                          <DatePicker
                                            className="border w-28 rounded border-gray-300"
                                            selected={new Date(item.date)}
                                            onChange={(selected) =>
                                              handleChangeDate(
                                                selected,
                                                item.id,
                                                item.description
                                              )
                                            }
                                          />
                                        </div>
                                      </td>
                                    )}
                                    {checkDesc && (
                                      <td
                                        {...provider.dragHandleProps}
                                        className="w-full px-6 py-4"
                                      >
                                        <p
                                          className="p-2 w-full font-poppins"
                                          style={{
                                            cursor: "auto",
                                            outlineColor:
                                              "rgb(204, 204, 204, 0.5)",
                                            outlineWidth: "thin",
                                          }}
                                          suppressContentEditableWarning
                                          onClick={(event) =>
                                            handleDescContent(
                                              event,
                                              item.description,
                                              item.id
                                            )
                                          }
                                          onInput={(event) =>
                                            handleChangeDesc(event)
                                          }
                                          onBlur={(e) =>
                                            handleSaveDesc(
                                              e,
                                              item.description,
                                              item.date,
                                              item.id
                                            )
                                          }
                                          contentEditable={
                                            updateProgess ? false : true
                                          }
                                        >
                                          {item.description}
                                        </p>
                                        <span className="text-red-400 filename-validation">
                                          {item.id === descId && descAlert}
                                        </span>
                                      </td>
                                    )}
                                    {checkDocu && (
                                      <td
                                        {...provider.dragHandleProps}
                                        className="py-2 px-3 w-80 text-sm text-gray-500"
                                      >
                                        {!activateButton ? (
                                          <span
                                            className=" w-60 bg-green-400 border border-transparent rounded-md py-2 px-4 mr-3 flex items-center justify-center text-base font-medium text-white hover:bg-green-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                                            onClick={() => {
                                              window.location.href = `${AppRoutes.FILEBUCKET}/${matterId}/${item.id}`;
                                            }}
                                          >
                                            {" "}
                                            File Bucket +
                                          </span>
                                        ) : (
                                          <span
                                            className={
                                              selectedId === item.id
                                                ? "w-60 bg-white-400 border border-green-400 text-green-400 rounded-md py-2 px-4 mr-3 flex items-center justify-center text-base font-medium hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                                                : "w-60 bg-green-400 border border-transparent rounded-md py-2 px-4 mr-3 flex items-center justify-center text-base font-medium text-white hover:bg-green-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                                            }
                                            onClick={() => {
                                              pasteFilestoBackground(item.id);
                                            }}
                                          >
                                            {" "}
                                            {selectedId === item.id
                                              ? "Pasted"
                                              : "Paste"}{" "}
                                            &nbsp;
                                            <FaPaste />
                                          </span>
                                        )}

                                        {files.length === 0 ? (
                                          <>
                                            <br />
                                            <p className="text-xs">
                                              <b>No items yet</b>
                                            </p>
                                            <p className="text-xs">
                                              Select from the files bucket to
                                              start adding one row
                                            </p>
                                          </>
                                        ) : (
                                          <>
                                            <br />
                                            <span className="font-bold">
                                              Files Selected
                                            </span>
                                            <br />
                                            <br />
                                            {files
                                              .filter(
                                                (x) =>
                                                  x.backgroundId === item.id
                                              )
                                              .map((items, index) => (
                                                <>
                                                  <p className="break-normal border-dotted border-2 border-gray-500 p-1 rounded-lg mb-2 bg-gray-100">
                                                    {activateButton ? (
                                                      <input
                                                        type="checkbox"
                                                        name={items.uniqueId}
                                                        className="cursor-pointer w-10 inline-block align-middle"
                                                        onChange={(event) =>
                                                          handleFilesCheckboxChange(
                                                            event,
                                                            items.uniqueId,
                                                            items.id,
                                                            items.backgroundId
                                                          )
                                                        }
                                                      />
                                                    ) : (
                                                      ""
                                                    )}
                                                    <span className="align-middle">{items.name.substring(0, 15)}</span>
                                                    &nbsp;
                                                    <AiOutlineDownload
                                                      className="text-blue-400 mx-1 text-2xl cursor-pointer inline-block"
                                                      onClick={() =>
                                                        previewAndDownloadFile(
                                                          items.downloadURL
                                                        )
                                                      }
                                                    />
                                                    {activateButton ? (
                                                      <BsFillTrashFill
                                                        className="text-red-400 hover:text-red-500 my-1 text-1xl cursor-pointer inline-block float-right"
                                                        onClick={() =>
                                                          showModal(
                                                            items.uniqueId,
                                                            items.backgroundId
                                                          )
                                                        }
                                                      />
                                                    ) : (
                                                      <BsFillTrashFill
                                                        className="text-gray-400 hover:text-red-500 my-1 text-1xl cursor-pointer inline-block float-right"
                                                        onClick={() =>
                                                          showModal(
                                                            items.uniqueId,
                                                            items.backgroundId
                                                          )
                                                        }
                                                      />
                                                    )}
                                                  </p>
                                                </>
                                              ))}
                                          </>
                                        )}
                                      </td>
                                    )}
                                  </tr>
                                )}
                              </Draggable>
                            ))}
                            {provider.placeholder}
                          </tbody>
                        )}
                      </Droppable>
                    </table>
                  </DragDropContext>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
      {ShowModalParagraph && (
        <ModalParagraph
          setShowModalParagraph={setShowModalParagraph}
          getBackground={getBackground}
          paragraph={paragraph}
          setParagraph={setParagraph}
          setCheckedState={setCheckedState}
          witness={witness}
          setSelectedRowsBG={setSelectedRowsBG}
          setShowDeleteButton={setShowDeleteButton}
          API={API}
          matterId={matterId}
          setcheckAllState={setcheckAllState}
        />
      )}
      {showRemoveFileModal && (
        <RemoveModal
          handleSave={handleDelete}
          handleModalClose={handleModalClose}
          selectedRowsBG={selectedFileBG}
        />
      )}
      {showToast && (
        <ToastNotification title={alertMessage} hideToast={hideToast} />
      )}
    </>
  );
};

export default TableInfo;
