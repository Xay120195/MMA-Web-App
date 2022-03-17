import React, { useState, useEffect, useRef } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { Link } from "react-router-dom";
import { AppRoutes } from "../../constants/AppRoutes";
import ToastNotification from "../toast-notification";
import { AiOutlineDownload } from "react-icons/ai";
import EmptyRow from "./empty-row";
import { ModalParagraph } from "./modal";
import { API } from "aws-amplify";
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";
import { MdDragIndicator } from "react-icons/md";

export let selectedRowsBGPass = [];

const TableInfo = ({
  witness,
  files,
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
}) => {
  let temp = selectedRowsBG;
  const [showToast, setShowToast] = useState(false);
  const [alertMessage, setalertMessage] = useState();
  const [loading, setLoading] = useState(true);
  const [sDate, setsDate] = useState(new Date());
  const [active, setActive] = useState(false);
  const [selected, setSelected] = useState("");
  const [descId, setDescId] = useState("");
  const [textDesc, setTextDesc] = useState("");
  const [descAlert, setDescAlert] = useState("");
  const [updateProgess, setUpdateProgress] = useState(false);

  const hideToast = () => {
    setShowToast(false);
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
        }
      }
    } else {
      setId((item) => [...item.filter((x) => x !== event.target.name)]);
      if (temp.indexOf(temp.find((tempp) => tempp.id === id)) > -1) {
        temp.splice(temp.indexOf(temp.find((tempp) => tempp.id === id)), 1);
        setSelectedRowsBG(temp);
        selectedRowsBGPass = temp;
      }
    }
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
        getBackground();
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
          getBackground();
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
    getBackground();
  };

  const mUpdateBackground = `
    mutation updateBackground($id: ID, $description: String, $date: String) {
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
            date: data.date,
            description: data.description,
          },
        });
        resolve(request);
      } catch (e) {
        reject(e.errors[0].message);
      }
    });
  }

  function sortByDate(arr) {
    arr.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
    return arr;
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

  console.log(files);

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
                          <th
                            scope="col"
                            className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                          >
                            No
                          </th>
                          <th
                            scope="col"
                            className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                          >
                            Date
                          </th>
                          <th
                            scope="col"
                            className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                          >
                            Description of Background
                          </th>
                          <th
                            scope="col"
                            className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                          >
                            Document
                          </th>
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
                                    className="h-full"
                                    {...provider.draggableProps}
                                    ref={provider.innerRef}
                                    style={{
                                      ...provider.draggableProps.style,
                                      backgroundColor:
                                        snapshot.isDragging ||
                                        (active && item.id === selected)
                                          ? "rgba(255, 255, 239, 0.767)"
                                          : "white",
                                    }}
                                  >
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

                                    <td
                                      {...provider.dragHandleProps}
                                      className="px-3 py-3"
                                    >
                                      <div>
                                        <DatePicker
                                          className="border w-28 rounded border-gray-300"
                                          selected={
                                            !item.date
                                              ? sDate
                                              : new Date(item.date)
                                          }
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
                                    <td
                                      {...provider.dragHandleProps}
                                      className="py-2 px-3 w-80 text-sm text-gray-500"
                                    >
                                      <Link
                                        className=" w-60 bg-green-400 border border-transparent rounded-md py-2 px-4 mr-3 flex items-center justify-center text-base font-medium text-white hover:bg-green-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                                        to={`${AppRoutes.FILEBUCKET}/${matterId}/${item.id}`}
                                      >
                                        File Bucket +
                                      </Link>

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
                                          {files.map((item) => (
                                            <p className="break-normal" >{item.name}
                                            &nbsp;
                                            <AiOutlineDownload
                                              className="text-blue-400 mx-1 text-2xl cursor-pointer inline-block"
                                              onClick={() =>
                                                previewAndDownloadFile(item.downloadURL)
                                              }
                                            />
                                            </p>
                                          ))}
                                        </>
                                      )}
                                    </td>
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
        />
      )}
      {showToast && (
        <ToastNotification title={alertMessage} hideToast={hideToast} />
      )}
    </>
  );
};

export default TableInfo;
