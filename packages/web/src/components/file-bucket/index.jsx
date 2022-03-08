import React, { useEffect, useState, useRef } from "react";
import { Link } from "react-router-dom";
import ToastNotification from "../toast-notification";
import { API, toast } from "aws-amplify";
import BlankState from "../blank-state";
import { AppRoutes } from "../../constants/AppRoutes";
import { useParams } from "react-router-dom";
import { MdArrowForwardIos } from "react-icons/md";
import { AiOutlineDownload } from "react-icons/ai";
import { FiUpload } from "react-icons/fi";
import "../../assets/styles/BlankState.css";
import UploadLinkModal from "./file-upload-modal";
import AccessControl from "../../shared/accessControl";
import ContentEditable from "react-contenteditable";
import CreatableSelect from "react-select/creatable";
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";
import { FaRegFileAudio, FaRegFileVideo } from "react-icons/fa";
import {
  GrDocumentPdf,
  GrDocumentText,
  GrDocumentImage,
  GrDocument,
  GrDocumentExcel,
  GrDocumentWord,
  GrDocumentTxt,
} from "react-icons/gr";

export default function FileBucket() {
  let tempArr = [];
  let nameArr = [];
  let descArr = [];
  const [showToast, setShowToast] = useState(false);
  const [resultMessage, setResultMessage] = useState("");
  const [matterFiles, setMatterFiles] = useState(null);
  const [labels, setLabels] = useState(null);
  const [clientMatterName, setClientMatterName] = useState("");
  const [updateProgess, setUpdateProgress] = useState(false);
  const [active, setActive] = useState(false);
  const [selected, setSelected] = useState("");
  const { matter_id } = useParams();

  const hideToast = () => {
    setShowToast(false);
  };

  const openNewTab = (url) => {
    window.open(url);
  };

  const [showUploadModal, setShowUploadModal] = useState(false);

  const handleUploadLink = (uf) => {
    var uploadedFiles = uf.files.map((f) => ({ ...f, matterId: matter_id }));

    uploadedFiles.map(async (file) => {
      await createMatterFile(file).then(() => {
        setResultMessage(`File successfully uploaded!`);
        setShowToast(true);
        handleModalClose();
        setTimeout(() => {
          setShowToast(false);
          getMatterFiles();
          tempArr = [];
          nameArr = [];
          descArr = [];
        }, 3000);
      });
    });
  };

  const handleModalClose = () => {
    setShowUploadModal(false);
  };

  const contentDiv = {
    margin: "0 0 0 65px",
  };

  const noStyle = {
    textDecoration: "none",
  };

  const mCreateMatterFile = `
      mutation createMatterFile ($matterId: ID, $s3ObjectKey: String, $size: Int, $type: String, $name: String) {
        matterFileCreate(matterId: $matterId, s3ObjectKey: $s3ObjectKey, size: $size, type: $type, name: $name) {
          id
          name
          downloadURL
        }
      }
  `;

  const mUpdateMatterFile = `
      mutation updateMatterFile ($id: ID, $name: String, $details: String, $labels : [LabelInput], $order: Int) {
        matterFileUpdate(id: $id, name: $name, details: $details, labels : $labels, order: $order) {
          id
          name
          details
          labels {
            id
            name
          }
          order
        }
      }
  `;

  const qGetMatterFiles = `
  query getMatterFile($matterId: ID, $isDeleted: Boolean) {
    clientMatter(id: $matterId) {
      matter {
        name
      }
      client {
        name
      }
    }
    matterFile(matterId: $matterId, isDeleted: $isDeleted) {
      id
      name
      downloadURL
      size
      type
      details
      labels {
        id
        name
      }
      createdAt
      order
    }
  }`;

  const listLabels = `
query listLabels($clientMatterId: ID) {
  clientMatter(id: $clientMatterId) {
    labels {
      items {
        id
        name
      }
    }
  }
}
`;

  const mCreateLabel = `
mutation createLabel($clientMatterId: String, $name: String) {
    labelCreate(clientMatterId:$clientMatterId, name:$name) {
        id
        name
    }
}
`;

  const mTagFileLabel = `
mutation tagFileLabel($fileId: ID, $labels: [LabelInput]) {
  fileLabelTag(file: {id: $fileId}, label: $labels) {
    file {
      id
    }
  }
}
`;

  const mUpdateMatterFileOrder = `
      mutation updateMatterFile ($id: ID, $order: Int) {
        matterFileUpdate(id: $id, order: $order) {
          id
          order
        }
      }
  `;

  async function updateMatterFileOrder(id, data) {
    return new Promise((resolve, reject) => {
      try {
        const request = API.graphql({
          query: mUpdateMatterFileOrder,
          variables: {
            id: id,
            order: data.order,
          },
        });

        resolve(request);
      } catch (e) {
        reject(e.errors[0].message);
      }
    });
  }

  const getLabels = async () => {
    let result = [];

    const labelsOpt = await API.graphql({
      query: listLabels,
      variables: {
        clientMatterId: matter_id,
      },
    });

    if (labelsOpt.data.clientMatter.labels !== null) {
      result = labelsOpt.data.clientMatter.labels.items
        .map(({ id, name }) => ({
          value: id,
          label: name,
        }))
        .sort((a, b) => a.label.localeCompare(b.label));
    }

    setLabels(result);
  };

  const addLabel = async (data) => {
    let result;

    const createLabel = await API.graphql({
      query: mCreateLabel,
      variables: {
        clientMatterId: matter_id,
        name: data,
      },
    });

    result = createLabel.data.labelCreate;

    getLabels();
    return result;
  };

  useEffect(() => {
    if (matterFiles === null) {
      getMatterFiles();
    }

    if (labels === null) {
      getLabels();
    }
  }, [matterFiles]);

  let getMatterFiles = async () => {
    const params = {
      query: qGetMatterFiles,
      variables: {
        matterId: matter_id,
        isDeleted: false,
      },
    };

    await API.graphql(params).then((files) => {
      setMatterFiles(files.data.matterFile);
      console.log(files.data.matterFile);
      setClientMatterName(
        `${files.data.clientMatter.client.name}/${files.data.clientMatter.matter.name}`
      );
    });
  };

  async function createMatterFile(file) {
    return new Promise((resolve, reject) => {
      try {
        const request = API.graphql({
          query: mCreateMatterFile,
          variables: file,
        });

        resolve(request);
      } catch (e) {
        reject(e.errors[0].message);
      }
    });
  }

  async function updateMatterFile(id, data) {
    return new Promise((resolve, reject) => {
      try {
        const request = API.graphql({
          query: mUpdateMatterFile,
          variables: {
            id: id,
            name: data.name,
            details: data.details,
            labels: data.labels,
            order: data.order,
          },
        });

        resolve(request);
      } catch (e) {
        reject(e.errors[0].message);
      }
    });
  }

  async function tagFileLabel(fileId, labels) {
    return new Promise((resolve, reject) => {
      try {
        const request = API.graphql({
          query: mTagFileLabel,
          variables: {
            fileId: fileId,
            labels: labels,
          },
        });
        resolve(request);
      } catch (e) {
        reject(e.errors[0].message);
      }
    });
  }

  const mainGrid = {
    display: "grid",
    gridtemplatecolumn: "1fr auto",
  };

  const textName = useRef("");
  const textDetails = useRef("");

  const handleChangeDesc = (evt) => {
    textDetails.current = evt.target.value;
  };

  const handleMatterChanged = async (
    options,
    id,
    name,
    details,
    index,
    order
  ) => {
    let newOptions = [];

    options.map(async (o) => {
      if (o.__isNew__) {
        newOptions = await addLabel(o.label);
      }
    });

    newOptions = options.map(({ value: id, label: name }) => ({
      id,
      name,
    }));

    const data = {
      name: name,
      details: details,
      labels: newOptions,
      order: order,
    };

    updateArr(data.labels, index);
    await updateMatterFile(id, data);
    await tagFileLabel(id, data.labels);
  };

  function updateArr(data, index) {
    tempArr[index] = data;
  }

  const pasteHandler = (event) => {
    event.target.style.textDecoration = "none";
    textDetails.current = event.target.value;
  };

  const HandleChangeToTD = async (id, name, details, labels, index, order) => {
    setResultMessage(`Saving in progress..`);
    setShowToast(true);
    setUpdateProgress(true);
    var updatedLabels = [];
    var updatedName = [];

    if (typeof tempArr[index] === "undefined") {
      updatedLabels[0] = labels;
    } else {
      updatedLabels[0] = tempArr[index];
    }

    if (typeof nameArr[index] === "undefined") {
      updatedName[0] = name;
    } else {
      updatedName[0] = nameArr[index];
    }

    const filterDetailsInitial = !details
      ? ""
      : details.replace(/(<([^>]+)>)/gi, "");
    const filterDetails = filterDetailsInitial.replace(/(style=".+?")/gm, "");

    const ouputDetails = textDetails.current;

    const finaloutputInitial = ouputDetails.replace(/(<([^>]+)>)/gi, "");
    const finaloutput = finaloutputInitial.replace(/(style=".+?")/gm, "");

    let lbls = [];
    const data = {
      details:
        !textDetails.current && !filterDetails ? filterDetails : finaloutput,
      name: !name ? "&nbsp;" : updatedName[0],
      labels: updatedLabels[0],
      order: order,
    };

    descArr[index] = finaloutput;

    await updateMatterFile(id, data);
    textDetails.current = "";
    setTimeout(() => {
      getMatterFiles();
      setTimeout(() => {
        setResultMessage(`Successfully updated `);
        setShowToast(true);
        setTimeout(() => {
          setShowToast(false);
          setUpdateProgress(false);
        }, 1000);
      }, 1000);
    }, 1000);
  };

  const handleChangeName = (evt) => {
    evt.currentTarget.parentNode.nextSibling.innerHTML = "";
    var name = evt.target.value;

    if (name === undefined || name.replace(/(<([^>]+)>)/gi, "").trim() === "") {
      evt.currentTarget.parentNode.nextSibling.innerHTML =
        "File name can't be blank.";
    } else {
      textName.current = name;
    }
  };

  const HandleChangeToTDName = async (
    id,
    details,
    name,
    labels,
    index,
    order,
    evt
  ) => {
    if (
      textName.current === undefined ||
      textName.current.replace(/(<([^>]+)>)/gi, "").trim() === ""
    ) {
      evt.currentTarget.parentNode.nextSibling.innerHTML =
        "File name can't be blank.";
    } else {
      evt.currentTarget.parentNode.nextSibling.innerHTML = "";

      setUpdateProgress(true);
      setResultMessage(`Saving in progress..`);
      setShowToast(true);
      var updatedLabels = [];
      var updatedDesc = [];

      if (typeof tempArr[index] === "undefined") {
        updatedLabels[0] = labels;
      } else {
        updatedLabels[0] = tempArr[index];
      }

      if (details == "") {
        updatedDesc[0] = "";
      } else if (typeof descArr[index] === "undefined") {
        updatedDesc[0] = details;
      } else {
        updatedDesc[0] = descArr[index];
      }
      const filterName = name.replace(/(<([^>]+)>)/gi, "");
      const ouputName = textName.current;
      const finaloutput = ouputName.replace(/(<([^>]+)>)/gi, "");

      const data = {
        name: !textName.current ? filterName : finaloutput,
        details: updatedDesc[0],
        labels: updatedLabels[0],
        order: order,
      };

      nameArr[index] = finaloutput;

      await updateMatterFile(id, data);
      textName.current = "";
      setTimeout(() => {
        getMatterFiles();
        setTimeout(() => {
          setResultMessage(`Successfully updated `);
          setShowToast(true);
          setTimeout(() => {
            setShowToast(false);
            setUpdateProgress(false);
          }, 1000);
        }, 1000);
      }, 1000);
    }
  };

  const extractArray = (ar) => {
    if (Array.isArray(ar) && ar.length) {
      const newOptions = ar.map(({ id: value, name: label }) => ({
        value,
        label,
      }));
      return newOptions;
    } else {
      return null;
    }
  };

  function sortByOrder(arr) {
    arr.sort((a, b) => a.order - b.order);
    return arr;
  }

  //drag and drop functions
  const handleDragEnd = async (e) => {
    setResultMessage(`sorting in progress..`);
    setShowToast(true);
    setUpdateProgress(true);

    const source = matterFiles.find(
      (element) => element.order === e.destination.index
    );

    const src = source ? source.order : e.destination.index;
    let targetLocation;
    if (e.source.index <= e.destination.index) {
      targetLocation = src + 1;
    } else if (e.source.index >= e.destination.index) {
      targetLocation = src - 1;
    }

    const data = {
      order: targetLocation,
    };
    const id = e.draggableId;

    await updateMatterFileOrder(id, data);

    setTimeout(() => {
      getMatterFiles();
      setTimeout(() => {
        setResultMessage(`Successfully Sorted`);
        setShowToast(true);
        setTimeout(() => {
          setShowToast(false);
          setUpdateProgress(false);
        }, 1000);
      }, 1000);
    }, 1000);
  };

  const handleChageBackground = (id) => {
    setSelected(id);
    if (active) {
      setActive(false);
    } else {
      setActive(true);
    }
  };

  return (
    <>
      <div
        className={
          "p-5 relative flex flex-col min-w-0 break-words mb-6 shadow-lg rounded bg-white"
        }
        style={contentDiv}
      >
        <div className="relative flex-grow flex-1">
          <div style={mainGrid}>
            <div>
              <h1 className="font-bold text-3xl">
                File Bucket&nbsp;<span className="text-3xl">of</span>&nbsp;
                <span className="font-semibold text-3xl">
                  {clientMatterName}
                </span>
              </h1>
            </div>
            <div className="absolute right-0">
              <Link to={AppRoutes.DASHBOARD}>
                <button className="bg-white hover:bg-gray-100 text-black font-semibold py-2.5 px-4 rounded inline-flex items-center border-0 shadow outline-none focus:outline-none focus:ring">
                  Back &nbsp;
                  <MdArrowForwardIos />
                </button>
              </Link>
            </div>
          </div>
        </div>

        <div className="p-5 left-0"></div>
        <div className="p-5 py-1 left-0">
          <div>
            <button
              className="bg-white hover:bg-gray-100 text-black font-semibold py-1 px-5 rounded inline-flex items-center border-0 shadow outline-none focus:outline-none focus:ring"
              onClick={() => setShowUploadModal(true)}
            >
              FILE UPLOAD &nbsp;
              <FiUpload />
            </button>
          </div>
        </div>

        <div className="p-5 px-5 py-0 left-0">
          <p className={"text-lg mt-3 font-medium"}>FILES</p>
        </div>

        {matterFiles !== null && (
          <>
            {matterFiles.length === 0 ? (
              <div className="p-5 px-5 py-1 left-0">
                <div className="w-full h-42 bg-gray-100 rounded-lg border border-gray-200 mb-6 py-1 px-1">
                  <BlankState
                    title={"items"}
                    txtLink={"file upload button"}
                    handleClick={() => setShowUploadModal(true)}
                  />
                </div>
              </div>
            ) : (
              <>
                {matterFiles !== null && matterFiles.length !== 0 && (
                  <div className="shadow border-b border-gray-200 sm:rounded-lg my-5">
                    {/* <DragDropContext onDragEnd={handleDragEnd}> */}
                    <table className=" table-fixed min-w-full divide-y divide-gray-200">
                      <thead>
                        <tr>
                          {/* <th className="px-6 py-4 text-left w-20">Item No.</th> */}
                          <th className="px-6 py-4 text-left w-40">Name</th>
                          <th className="px-6 py-4 text-left">Description</th>
                          <th className="px-6 py-4 text-left w-40">Labels</th>
                        </tr>
                      </thead>
                      {/* <Droppable droppableId="droppable-1">
                          {(provider) => ( */}
                      <tbody
                        // ref={provider.innerRef}
                        // {...provider.droppableProps}
                        className="bg-white divide-y divide-gray-200"
                      >
                        {sortByOrder(matterFiles).map((data, index) => (
                          // <Draggable
                          //   key={data.id}
                          //   draggableId={data.id}
                          //   index={index}
                          // >
                          //   {(provider, snapshot) => (
                          <tr
                            key={data.id}
                            index={index}
                            className="h-full"
                            // {...provider.draggableProps}
                            // ref={provider.innerRef}
                            // style={{
                            //   ...provider.draggableProps.style,
                            //   backgroundColor:
                            //     snapshot.isDragging ||
                            //     (active && data.id === selected)
                            //       ? "rgba(255, 255, 239, 0.767)"
                            //       : "white",
                            // }}
                          >
                            {/* <td
                                        {...provider.dragHandleProps}
                                        className="px-6 py-6 inline-flex"
                                      >
                                        <svg
                                          xmlns="http://www.w3.org/2000/svg"
                                          className="h-6 w-6"
                                          fill="none"
                                          onClick={() =>
                                            handleChageBackground(data.id)
                                          }
                                          viewBox="0 0 24 24"
                                          stroke="currentColor"
                                          strokeWidth={2}
                                        >
                                          <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"
                                          />
                                        </svg>
                                        <span className="px-3">
                                          {index + 1}
                                        </span>
                                      </td> */}
                            <td
                              // {...provider.dragHandleProps}
                              className="px-6 py-4 place-items-center relative flex-wrap w-40"
                            >
                              <div className="inline-flex">
                                {data.type.split("/").slice(0, -1).join("/") ==
                                "image" ? (
                                  <GrDocumentImage className="text-2xl" />
                                ) : data.type
                                    .split("/")
                                    .slice(0, -1)
                                    .join("/") == "audio" ? (
                                  <FaRegFileAudio className="text-2xl" />
                                ) : data.type
                                    .split("/")
                                    .slice(0, -1)
                                    .join("/") == "video" ? (
                                  <FaRegFileVideo className="text-2xl" />
                                ) : data.type
                                    .split("/")
                                    .slice(0, -1)
                                    .join("/") == "text" ? (
                                  <GrDocumentTxt className="text-2xl" />
                                ) : data.type
                                    .split("/")
                                    .slice(0, -1)
                                    .join("/") == "application" &&
                                  data.type.split(".").pop() == "sheet" ? (
                                  <GrDocumentExcel className="text-2xl" />
                                ) : data.type
                                    .split("/")
                                    .slice(0, -1)
                                    .join("/") == "application" &&
                                  data.type.split(".").pop() == "document" ? (
                                  <GrDocumentWord className="text-2xl" />
                                ) : data.type
                                    .split("/")
                                    .slice(0, -1)
                                    .join("/") == "application" &&
                                  data.type.split(".").pop() == "text" ? (
                                  <GrDocumentText className="text-2xl" />
                                ) : data.type
                                    .split("/")
                                    .slice(0, -1)
                                    .join("/") == "application" ? (
                                  <GrDocumentPdf className="text-2xl" />
                                ) : (
                                  <GrDocumentText className="text-2xl" />
                                )}
                                &nbsp;&nbsp;
                                {/* <input defaultValue={data.type.split('.').pop()}/> */}
                                <ContentEditable
                                  style={{ cursor: "auto" }}
                                  disabled={updateProgess ? true : false}
                                  html={
                                    !data.name
                                      ? "<p> </p>"
                                      : `<p>${data.name}</p>`
                                  }
                                  onChange={(evt) => handleChangeName(evt)}
                                  onBlur={(evt) =>
                                    HandleChangeToTDName(
                                      data.id,
                                      data.details,
                                      data.name,
                                      data.labels,
                                      index,
                                      data.order,
                                      evt
                                    )
                                  }
                                  className="w-40"
                                />
                                <span>
                                  <AiOutlineDownload
                                    className="text-blue-400 mx-1"
                                    onClick={() =>
                                      //openNewTab(data.downloadURL.substr(0,data.downloadURL.indexOf("?")))
                                      openNewTab(data.downloadURL)
                                    }
                                  />
                                </span>
                              </div>
                              <p className="text-red-400 filename-validation"></p>{" "}
                              {/* do not change */}
                            </td>

                            <td
                              // {...provider.dragHandleProps}
                              className="px-6 py-4 place-items-center w-full"
                            >
                              <ContentEditable
                                style={{ cursor: "auto" }}
                                disabled={updateProgess ? true : false}
                                html={
                                  !data.details
                                    ? `<p> </p>`
                                    : `<p>${data.details}</p>`
                                }
                                onChange={(evt) => handleChangeDesc(evt)}
                                onBlur={() =>
                                  HandleChangeToTD(
                                    data.id,
                                    data.name,
                                    data.details,
                                    data.labels,
                                    index,
                                    data.order
                                  )
                                }
                                onPaste={pasteHandler}
                                className="pt-2 pb-5 font-poppins"
                                options={labels}
                                type="text"
                              />
                            </td>

                            <td
                              // {...provider.dragHandleProps}
                              className="px-6 py-4 align-top place-items-center relative  flex-wrap"
                            >
                              <CreatableSelect
                                defaultValue={extractArray(
                                  data.labels
                                    ? data.labels
                                    : { value: 0, label: "" }
                                )}
                                options={labels}
                                isMulti
                                isClearable
                                isSearchable
                                onChange={(options) =>
                                  handleMatterChanged(
                                    options,
                                    data.id,
                                    data.name,
                                    data.details,
                                    index,
                                    data.order
                                  )
                                }
                                // onBlur={(options) =>
                                //   handleMatterChanged(
                                //     options,
                                //     data.id,
                                //     data.name,
                                //     data.details
                                //   )
                                // }
                                placeholder="Labels"
                                className="w-60 placeholder-blueGray-300 text-blueGray-600 bg-white rounded text-sm border-0 shadow outline-none focus:outline-none focus:ring z-100"
                              />
                            </td>
                          </tr>
                          //   )}
                          // </Draggable>
                        ))}
                        {/* {provider.placeholder} */}
                      </tbody>
                      {/* )} */}
                      {/* </Droppable> */}
                    </table>
                    {/* </DragDropContext> */}
                  </div>
                )}
              </>
            )}
          </>
        )}
      </div>

      {showUploadModal && (
        <UploadLinkModal
          title={""}
          handleSave={handleUploadLink}
          bucketName={matter_id}
          handleModalClose={handleModalClose}
        />
      )}

      {showToast && resultMessage && (
        <ToastNotification title={resultMessage} hideToast={hideToast} />
      )}
    </>
  );
}
