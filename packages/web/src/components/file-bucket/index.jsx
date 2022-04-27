import React, { useEffect, useState, useCallback } from "react";
import { Link } from "react-router-dom";
import ToastNotification from "../toast-notification";
import { API } from "aws-amplify";
import BlankState from "../blank-state";
import NoResultState from "../no-result-state";
import { AppRoutes } from "../../constants/AppRoutes";
import { useParams } from "react-router-dom";
import { MdArrowBackIos, MdDragIndicator } from "react-icons/md";
import * as IoIcons from "react-icons/io";
import DatePicker from "react-datepicker";
import barsFilter from "../../assets/images/bars-filter.svg";
import ellipsis from "../../shared/ellipsis";
import { AiOutlineDownload, AiFillTags } from "react-icons/ai";
import { FiUpload, FiCopy } from "react-icons/fi";
import "../../assets/styles/BlankState.css";
import "../../assets/styles/custom-styles.css";
import UploadLinkModal from "./file-upload-modal";
import FilterLabels from "./filter-labels-modal";
import PageReferenceModal from "./page-reference-modal";
//import AccessControl from "../../shared/accessControl";
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
import { BsArrowLeft, BsFillTrashFill } from "react-icons/bs";
import RemoveFileModal from "./remove-file-modal";
import { useBottomScrollListener } from "react-bottom-scroll-listener";
import imgLoading from "../../assets/images/loading-circle.gif";

import ScrollToTop from "react-scroll-to-top";

export var selectedRows = [];
export var selectedCompleteDataRows = [];
export var pageSelectedLabels;

export default function FileBucket() {
  let tempArr = [];
  let nameArr = [];
  let descArr = [];
  const [showToast, setShowToast] = useState(false);
  const [resultMessage, setResultMessage] = useState("");
  const [files, setFiles] = useState(null);
  const [matterFiles, setMatterFiles] = useState(files);
  const [labels, setLabels] = useState(null);
  const [clientMatterName, setClientMatterName] = useState("");
  const [updateProgess, setUpdateProgress] = useState(false);
  const [active, setActive] = useState(false);
  const [selected, setSelected] = useState("");
  const [fileAlert, setFileAlert] = useState("");
  const [descAlert, setDesAlert] = useState("");
  const [fileId, setFileId] = useState("");
  const [detId, setDetId] = useState("");
  const [textName, setTextName] = useState("");
  const [textDetails, setTextDetails] = useState("");
  const { matter_id, background_id } = useParams();
  const [searchFile, setSearchFile] = useState();
  const [filterLabelsData, setFilterLabelsData] = useState([]);
  const [pageTotal, setPageTotal] = useState(0);
  const [pageSize, setPageSize] = useState(20);
  const [pageIndex, setPageIndex] = useState(1);
  const [vNextToken, setVnextToken] = useState(null);
  const [loading, setLoading] = useState(false);
  const [maxLoading, setMaxLoading] = useState(false);
  const [ascDesc, setAscDesc] = useState(false);
  const [showPageReferenceModal, setShowPageReferenceModal] = useState(false);
  const [pageReferenceFileId, setPageReferenceFileId] = useState("");
  const [pageReferenceBackgroundId, setPageReferenceBackgroundId] =
    useState("");
  const [pageReferenceClientMatter, setPageReferenceClientMatter] =
    useState("");
  const [pageReferenceDescription, setPageReferenceDescription] = useState("");
  const [pageReferenceRowOrder, setPageReferenceRowOrder] = useState("");

  let filterOptionsArray = [];

  const [showRemoveFileModal, setshowRemoveFileModal] = useState(false);
  const [showRemoveFileButton, setshowRemoveFileButton] = useState(false);
  const [showAttachBackgroundButton, setshowAttachBackgroundButton] =
    useState(false);
  var fileCount = 0;

  const [filterLabels, setFilterLabels] = useState(false);
  const [deletingState, setDeletingState] = useState(false);

  const hideToast = () => {
    setShowToast(false);
  };

  const previewAndDownloadFile = async (id) => {
    const params = {
      query: qGetFileDownloadLink,
      variables: {
        id: id,
      },
    };

    await API.graphql(params).then((result) => {
      window.open(result.data.file.downloadURL);
    });
  };

  const [showUploadModal, setShowUploadModal] = useState(false);

  const handleUploadLink = async (uf) => {
    var uploadedFiles = uf.files.map((f) => ({ ...f, matterId: matter_id }));
    //adjust order of existing files
    let tempMatter = [...matterFiles];
    // tempMatter.sort((a, b) => b.order - a.order);
    const result = tempMatter.map(({ id }, index) => ({
      id: id,
      order: index + uploadedFiles.length,
    }));

    const mUpdateBulkMatterFileOrder = `
    mutation bulkUpdateMatterFileOrders($arrangement: [ArrangementInput]) {
      matterFileBulkUpdateOrders(arrangement: $arrangement) {
        id
        order
      }
    }
    `;

    await API.graphql({
      query: mUpdateBulkMatterFileOrder,
      variables: {
        arrangement: result,
      },
    });

    //add order to new files
    var next = 1;
    var sortedFiles = uploadedFiles.sort(
      (a, b) => b.oderSelected - a.oderSelected
    );

    sortedFiles.map((file) => {
      createMatterFile(file);
    });

    setResultMessage(`File successfully uploaded!`);
    setShowToast(true);
    handleModalClose();
    setTimeout(() => {
      setShowToast(false);
      getMatterFiles(next);
    }, 3000);
  };

  const handleModalClose = () => {
    setShowUploadModal(false);
    setshowRemoveFileModal(false);
    setFilterLabels(false);
    setShowPageReferenceModal(false);
  };

  const contentDiv = {
    margin: "0 0 0 65px",
  };

  const noStyle = {
    textDecoration: "none",
  };

  const mCreateMatterFile = `
      mutation createMatterFile ($matterId: ID, $s3ObjectKey: String, $size: Int, $type: String, $name: String, $order: Int) {
        matterFileCreate(matterId: $matterId, s3ObjectKey: $s3ObjectKey, size: $size, type: $type, name: $name, order: $order) {
          id
          name
          downloadURL
          order
        }
      }
  `;

  const mUpdateMatterFile = `
      mutation updateMatterFile ($id: ID, $name: String, $details: String, $labels : [LabelInput]) {
        matterFileUpdate(id: $id, name: $name, details: $details, labels : $labels ) {
          id
          name
          details
        }
      }
  `;

  const mUpdateMatterFileDesc = `
      mutation updateMatterFile ($id: ID, $details: String) {
        matterFileUpdate(id: $id, details: $details) {
          id
          details
        }
      }
  `;

  const mUpdateMatterFileName = `
      mutation updateMatterFile ($id: ID, $name: String) {
        matterFileUpdate(id: $id, name: $name) {
          id
          name
        }
      }
  `;

  const mUpdateMatterFileDate = `
      mutation updateMatterFile ($id: ID, $date: AWSDateTime) {
        matterFileUpdate(id: $id, date: $date) {
          id
          date
        }
      }
  `;

  const mSoftDeleteMatterFile = `
      mutation softDeleteMatterFile ($id: ID) {
        matterFileSoftDelete(id: $id) {
          id
        }
      }
  `;

  const qGetMatterDetails = `
  query getMatterDetails($matterId: ID) {
    clientMatter(id: $matterId) {
      matter {
        name
      }
      client {
        name
      }
    }
  }`;

  const qGetFileDownloadLink = `
  query getFileDownloadLink($id: ID) {
    file(id: $id) {
      downloadURL
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

  //   const mUpdateMatterFileOrder = `
  //     mutation updateMatterFile ($id: ID, $order: Int) {
  //       matterFileUpdate(id: $id, order: $order) {
  //         id
  //         order
  //       }
  //     }
  // `;

  const mUpdateBackgroundFile = `
    mutation addBackgroundFile($backgroundId: ID, $files: [FileInput]) {
      backgroundFileTag(backgroundId: $backgroundId, files: $files) {
        id
      }
    }
  `;

  // WITH PAGINAGTION

  const mPaginationbyItems = `
query getFilesByMatter($isDeleted: Boolean, $limit: Int, $matterId: ID, $nextToken: String) {
  matterFiles(isDeleted: $isDeleted, matterId: $matterId, nextToken: $nextToken, limit: $limit, sortOrder:CREATED_DESC) {
    items {
      id
      name
      details
      date
      labels {
        items {
          id
          name
        }
      }
      backgrounds {
        items {
          id
          order
          description
        }
      }
      createdAt
      order
      type
      size
    }
    nextToken
  }
}
`;

  // WITHOUT PAGINAGTION

  const mNoPaginationbyItems = `
query getFilesByMatter($isDeleted: Boolean, $matterId: ID) {
  matterFiles(isDeleted: $isDeleted, matterId: $matterId, sortOrder:CREATED_DESC) {
    items {
      id
      name
      details
      date
      labels {
        items {
          id
          name
        }
      }
      backgrounds {
        items {
          id
          order
          description
        }
      }
      createdAt
      order
      type
      size
    }
    nextToken
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
          downloadURL
          details
          name
        }
      }
    }
  }`;

  async function tagBackgroundFile() {
    let arrFiles = [];
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

    arrFiles = selectedRows.map(({ id }) => ({
      id: id,
    }));

    arrFiles.push(...arrFileResult);

    const filteredArr = arrFiles.filter((el) => {
      const duplicate = seen.has(el.id);
      seen.add(el.id);
      return !duplicate;
    });

    if (background_id !== null) {
      return new Promise((resolve, reject) => {
        try {
          const request = API.graphql({
            query: mUpdateBackgroundFile,
            variables: {
              backgroundId: background_id,
              files: filteredArr,
            },
          });
          resolve(request);
          setTimeout(() => {
            window.location.href = `${AppRoutes.BACKGROUND}/${matter_id}`;
          }, 1000);
        } catch (e) {
          reject(e.errors[0].message);
        }
      });
    }
  }

  // async function updateMatterFileOrder(id, data) {
  //   return new Promise((resolve, reject) => {
  //     try {
  //       const request = API.graphql({
  //         query: mUpdateMatterFileOrder,
  //         variables: {
  //           id: id,
  //           order: data.order,
  //         },
  //       });

  //       resolve(request);
  //     } catch (e) {
  //       reject(e.errors[0].message);
  //     }
  //   });
  // }

  const getLabels = async () => {
    let result = [];

    const labelsOpt = await API.graphql({
      query: listLabels,
      variables: {
        clientMatterId: matter_id,
      },
    });

    if (labelsOpt.data.clientMatter.labels !== null) {
      if (labelsOpt.data.clientMatter.labels.items !== null) {
        result = labelsOpt.data.clientMatter.labels.items
          .map(({ id, name }) => ({
            value: id,
            label: name,
          }))
          .sort((a, b) => a.label.localeCompare(b.label));
      }
    }
    console.log("Labels", result);

    setLabels(result);
  };

  const addLabel = async (fileId, data, index, newLabel) => {
    console.group("addLabel()");
    let result;

    if (labels.some((x) => x.label === newLabel.trim())) {
      return;
    } else {
      const createLabel = await API.graphql({
        query: mCreateLabel,
        variables: {
          clientMatterId: matter_id,
          name: newLabel,
        },
      });
      result = createLabel.data.labelCreate;
      console.log("createLabel result:", result);
      console.groupEnd();
      getLabels();

      console.log("348 - data.labels.items", data.labels.items);

      const newOptions = data.labels.items.map((d) =>
        d.name === d.id ? { ...d, id: createLabel.data.labelCreate.id } : d
      );
      console.log("353 - newOptions", newOptions);

      data.labels = newOptions;
      updateArrLabels(newOptions, index);
      //await updateMatterFile(fileId, data);
      tagFileLabel(fileId, newOptions);
    }

    return result;
  };

  useEffect(() => {
    if (matterFiles === null) {
      console.log("matterFiles is null");
      getMatterFiles();
    }

    if (labels === null) {
      getLabels();
    }

    if (searchFile !== undefined) {
      filterRecord(searchFile);
    }

    console.log("searchFile", searchFile);
    console.log("matterFiles", matterFiles);
  }, [searchFile]);

  let getMatterDetails = async () => {
    const params = {
      query: qGetMatterDetails,
      variables: {
        matterId: matter_id,
        isDeleted: false,
      },
    };

    await API.graphql(params).then((files) => {
      setClientMatterName(
        `${files.data.clientMatter.client.name}/${files.data.clientMatter.matter.name}`
      );
    });
  };

  let getMatterFiles = async (next) => {
    let q = mPaginationbyItems;
    if (matter_id === "c934548e-c12a-4faa-a102-d77f75e3da2b") {
      q = mNoPaginationbyItems;
    }

    const params = {
      query: q,
      variables: {
        matterId: matter_id,
        isDeleted: false,
        limit: 20,
        nextToken: next === 1 ? null : vNextToken,
      },
    };
    await API.graphql(params).then((files) => {
      const matterFilesList = files.data.matterFiles.items;
      console.log("checkthis", matterFilesList);
      setVnextToken(files.data.matterFiles.nextToken);
      setFiles(sortByOrder(matterFilesList));
      getMatterDetails();
      setMatterFiles(sortByOrder(matterFilesList));
      setMaxLoading(false);
    });
  };

  let loadMoreMatterFiles = async () => {
    if (vNextToken !== null && !loading) {
      let q = mPaginationbyItems;
      if (matter_id === "c934548e-c12a-4faa-a102-d77f75e3da2b") {
        q = mNoPaginationbyItems;
      }

      const params = {
        query: q,
        variables: {
          matterId: matter_id,
          isDeleted: false,
          limit: 20,
          nextToken: vNextToken,
        },
      };

      await API.graphql(params).then((files) => {
        const matterFilesList = files.data.matterFiles.items;
        console.log("Files", matterFilesList);
        //setFiles(matterFilesList);
        setVnextToken(files.data.matterFiles.nextToken);
        setMatterFiles((matterFiles) =>
          matterFiles.concat(sortByOrder(matterFilesList))
        );
        setMaxLoading(false);
        console.log("error", matterFilesList);
      });
    } else {
      console.log("Last Result!");
      setMaxLoading(true);
    }
  };

  function createMatterFile(file) {
    const request = API.graphql({
      query: mCreateMatterFile,
      variables: file,
    });

    return request;
  }

  async function updateMatterFile(id, data) {
    console.group("updateMatterFile()");
    console.log("id:", id);
    console.log("data:", data);
    console.groupEnd();
    return new Promise((resolve, reject) => {
      try {
        const request = API.graphql({
          query: mUpdateMatterFile,
          variables: {
            id: id,
            name: data.name,
            details: data.details,
            // labels: data.labels.items,
          },
        });

        resolve(request);
      } catch (e) {
        reject(e.errors[0].message);
      }
    });
  }

  async function tagFileLabel(fileId, labels) {
    console.log("tagFileLabel()");
    console.log("fileId", fileId, "check", labels);
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
        console.log("reqq", request);
      } catch (e) {
        reject(e.errors[0].message);
      }
    });
  }

  const mainGrid = {
    display: "grid",
    gridtemplatecolumn: "1fr auto",
  };

  const handleLabelChanged = async (options, fileId, name, details, index) => {
    setFileId(fileId);
    let newOptions = [];
    let createdLabel;
    let isNewCtr = 0;

    newOptions = options.map(({ value: id, label: name }) => ({
      id: id,
      name: name,
    }));

    const data = {
      name: name,
      details: details,
      labels: { items: newOptions },
    };

    console.log("options", options);

    await options.map(async (o) => {
      if (o.__isNew__) {
        isNewCtr++;
        console.log("ooo", o);
        console.log("newlabel", o.label);
        createdLabel = await addLabel(fileId, data, index, o.label);
        console.log("cl", createdLabel);
      }
    });

    if (isNewCtr === 0) {
      console.log("No new labels found");
      console.log("data.labels.items", data.labels.items);

      updateArrLabels(data.labels.items, index);
      await updateMatterFile(fileId, data);
      tagFileLabel(fileId, data.labels.items);
    }

    var next = 1;
    setResultMessage(`Updating labels..`);
    setShowToast(true);
    setTimeout(() => {
      getMatterFiles(next);
      setTimeout(() => {
        setTimeout(() => {
          setShowToast(false);
        }, 1000);
      }, 1000);
    }, 1000);
  };

  function updateArrLabels(data, index) {
    console.log("updateArrLabels", data, index);
    tempArr[index] = data;
  }

  //description saving
  const handleDetailsContent = (e, details, id) => {
    if (!descAlert) {
      setTextDetails(!details ? "" : details);
      setDetId(id);
      setDesAlert("");
    } else {
      setTextDetails("");
    }
  };

  const handleOnChangeDetails = (event) => {
    setTextDetails(event.currentTarget.textContent);
  };

  const handleSaveDetails = async (e, details, id) => {
    const updatedDesc = matterFiles.map((obj) => {
      if (obj.id === id) {
        return {
          ...obj,
          details: e.target.innerHTML,
        };
      }
      return obj;
    });
    setMatterFiles(updatedDesc);
    if (textDetails.length <= 0) {
      setDesAlert("Description can't be empty");
    } else if (textDetails === details) {
      setDesAlert("");
      const data = {
        details: e.target.innerHTML,
      };
      await updateMatterFileDesc(id, data);

      //   getMatterFiles();
      setTimeout(() => {
        setResultMessage(`Successfully updated `);
        setShowToast(true);
        setTimeout(() => {
          setShowToast(false);
        }, 1000);
      }, 1000);
    } else {
      const updatedDesc = matterFiles.map((obj) => {
        if (obj.id === id) {
          return {
            ...obj,
            details: e.target.innerHTML,
          };
        }
        return obj;
      });
      setMatterFiles(updatedDesc);

      setDesAlert("");
      const data = {
        details: e.target.innerHTML,
      };
      await updateMatterFileDesc(id, data);

      //   getMatterFiles();
      setTimeout(() => {
        setResultMessage(`Successfully updated `);
        setShowToast(true);
        setTimeout(() => {
          setShowToast(false);
        }, 1000);
      }, 1000);
      // }, 1000);
    }
  };

  async function updateMatterFileDesc(id, data) {
    console.log("data:", data);
    console.groupEnd();
    return new Promise((resolve, reject) => {
      try {
        const request = API.graphql({
          query: mUpdateMatterFileDesc,
          variables: {
            id: id,
            details: data.details,
          },
        });
        resolve(request);
      } catch (e) {
        reject(e.errors[0].message);
      }
    });
  }

  //filename saving
  const handleNameContent = (e, name, id) => {
    if (!fileAlert) {
      setTextName(!name ? "" : name);
      setFileId(id);
      setFileAlert("");
    } else {
      setTextName("");
    }
  };

  const handleOnChangeName = (event) => {
    setTextName(event.currentTarget.textContent);
  };

  const handleSaveName = async (e, name, id) => {
    if (textName.length <= 0) {
      setFileAlert("File name can't be empty");
    } else if (textName === name) {
      setFileAlert("");
      const data = {
        name: name,
      };
      await updateMatterFileName(id, data);
      //   getMatterFiles();
      setTimeout(() => {
        setResultMessage(`Successfully updated `);
        setShowToast(true);
        setTimeout(() => {
          setShowToast(false);
        }, 1000);
      }, 1000);
    } else {
      setFileAlert("");
      const data = {
        name: textName,
      };
      await updateMatterFileName(id, data);
      //   getMatterFiles();
      setTimeout(() => {
        setResultMessage(`Successfully updated `);
        setShowToast(true);
        setTimeout(() => {
          setShowToast(false);
        }, 1000);
      }, 1000);
    }
  };

  async function updateMatterFileName(id, data) {
    console.log("data:", data);
    console.groupEnd();
    return new Promise((resolve, reject) => {
      try {
        const request = API.graphql({
          query: mUpdateMatterFileName,
          variables: {
            id: id,
            name: data.name,
          },
        });
        resolve(request);
      } catch (e) {
        reject(e.errors[0].message);
      }
    });
  }

  const handleChangeDate = async (selected, id) => {
    const data = {
      date: selected !== null ? String(selected) : null,
    };
    await updateMatterFileDate(id, data);
    const updatedArray = matterFiles.map((p) =>
      p.id === id ? { ...p, date: data.date } : p
    );
    setMatterFiles(updatedArray);
  };

  async function updateMatterFileDate(id, data) {
    return new Promise((resolve, reject) => {
      try {
        const request = API.graphql({
          query: mUpdateMatterFileDate,
          variables: {
            id: id,
            date:
              data.date !== null && data.date !== "null" && data.date !== ""
                ? new Date(data.date).toISOString()
                : null,
          },
        });
        resolve(request);
      } catch (e) {
        reject(e.errors[0].message);
      }
    });
  }

  //extracting labels function
  const extractArray = (ar) => {
    if (Array.isArray(ar) && ar.length) {
      const newOptions = ar.map(({ id: value, name: label }) => ({
        value,
        label,
      }));
      newOptions.map(
        (data) => (filterOptionsArray = [...filterOptionsArray, data])
      );
      pageSelectedLabels = [
        ...new Map(
          filterOptionsArray.map((item) => [JSON.stringify(item), item])
        ).values(),
      ];
      return newOptions;
    } else {
      return null;
    }
  };

  //sorting files function
  function sortByOrder(arr) {
    // const isAllNotZero = arr.every(
    //   (item) => item.order >= 0 && item.order !== 0
    // );
    let sort;
    // if (isAllNotZero) {
    sort = arr.sort((a, b) => a.order - b.order);
    // } else {
    //   sort = arr;
    // }
    return sort;
  }

  function sortArrayByKey(array, key) {
    return array.sort((a, b) => {
      let x = a[key];
      let y = b[key];

      return x < y ? -1 : x > y ? 1 : 0;
    });
  }

  //drag and drop functions
  const handleDragEnd = async (e) => {
    let tempMatter = [...matterFiles];

    let [selectedRow] = tempMatter.splice(e.source.index, 1);

    tempMatter.splice(e.destination.index, 0, selectedRow);
    setMatterFiles(tempMatter);

    const result = tempMatter.map(({ id }, index) => ({
      id: id,
      order: index + 1,
    }));

    const mUpdateBulkMatterFileOrder = `
    mutation bulkUpdateMatterFileOrders($arrangement: [ArrangementInput]) {
      matterFileBulkUpdateOrders(arrangement: $arrangement) {
        id
        order
      }
    }
    `;

    await API.graphql({
      query: mUpdateBulkMatterFileOrder,
      variables: {
        arrangement: result,
      },
    });
  };

  //checkbox-related functions
  const [checkedState, setCheckedState] = useState(
    new Array(fileCount).fill(false)
  );
  const [isAllChecked, setIsAllChecked] = useState(false);

  //checking each row
  function checked(id, fileName, details, size, downloadURL, type, date, idx) {
    if (isAllChecked) {
      selectedRows.splice(
        selectedRows.indexOf(selectedRows.find((temp) => temp.id === id)),
        1
      );
      const updatedCheckedState = checkedState.map((item, index) =>
        index === idx ? !item : item
      );

      setCheckedState(updatedCheckedState);
      setIsAllChecked(false);
    } else {
      if (
        selectedRows.indexOf(selectedRows.find((temp) => temp.id === id)) > -1
      ) {
        selectedRows.splice(
          selectedRows.indexOf(selectedRows.find((temp) => temp.id === id)),
          1
        );
        setIsAllChecked(false);
        const updatedCheckedState = checkedState.map((item, index) =>
          index === idx ? !item : item
        );
        setCheckedState(updatedCheckedState);
      } else {
        selectedRows = [
          ...selectedRows,
          { id: id, fileName: fileName, details: details, date: date },
        ];

        selectedCompleteDataRows = [
          ...selectedCompleteDataRows,
          {
            id: id,
            fileName: fileName,
            details: details,
            date: date,
            size: size,
            type: type,
            downloadURL: downloadURL,
            order: 0,
          },
        ];
        setIsAllChecked(false);
        const updatedCheckedState = checkedState.map((item, index) =>
          index === idx ? !item : item
        );
        setCheckedState(updatedCheckedState);
      }
    }

    if (selectedRows.length > 0) {
      setshowRemoveFileButton(true);
      if (background_id !== "000") {
        setshowAttachBackgroundButton(true);
      }
    } else {
      setshowRemoveFileButton(false);
      if (background_id !== "000") {
        setshowAttachBackgroundButton(false);
      }
    }
  }

  //checking all rows
  function checkAll(files) {
    if (isAllChecked) {
      setIsAllChecked(false);
      selectedRows = [];
      const newArr = Array(files.length).fill(false);
      setCheckedState(newArr);
    } else {
      setIsAllChecked(true);
      selectedRows = [];
      files.map(
        (data) =>
          (selectedRows = [
            ...selectedRows,
            {
              id: data.id,
              fileName: data.name,
              details: data.details,
              date: data.date,
            },
          ])
      );
      const newArr = Array(files.length).fill(true);
      setCheckedState(newArr);
    }

    if (selectedRows.length > 0) {
      setshowRemoveFileButton(true);
      if (background_id !== "000") {
        setshowAttachBackgroundButton(true);
      }
    } else {
      setshowRemoveFileButton(false);
      if (background_id !== "000") {
        setshowAttachBackgroundButton(false);
      }
    }
  }

  //delete function
  const handleDeleteFile = async (fileID) => {
    setDeletingState(true);
    fileID.map(async (id) => {
      await deleteMatterFile(id);
    });
    selectedRows = [];
    var next = 1;
    setshowRemoveFileButton(false);
    setResultMessage(`Deleting File`);
    setShowToast(true);
    handleModalClose();
    setTimeout(() => {
      setIsAllChecked(false);
      const newArr = Array(files.length).fill(false);
      setCheckedState(newArr);
      setResultMessage(`Successfully Deleted!`);
      setShowToast(true);
      setTimeout(() => {
        getMatterFiles(next);
        setShowToast(false);
        setDeletingState(false);
      }, 3000);
    }, 1000);
  };

  const deleteMatterFile = (fileID) => {
    return new Promise((resolve, reject) => {
      try {
        const request = API.graphql({
          query: mSoftDeleteMatterFile,
          variables: fileID,
        });

        resolve(request);
      } catch (e) {
        reject(e.errors[0].message);
      }
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

  function newOptions(data, oldOpt) {
    var myArray = data;

    if (Array.isArray(oldOpt) && oldOpt.length > 0) {
      var newOptions = oldOpt.map(({ id: value, name: label }) => ({
        value,
        label,
      }));
      return data;
    } else {
      return data;
    }
  }

  const [selectedOption, setSelect] = useState(null);
  const handleChange = (selectedOption) => {
    setSelect(selectedOption);
  };
  const removeOption = (e) => {
    const newSelect = selectedOption.filter(
      (item) => item.value !== e.target.name
    );
    setSelect(newSelect);
  };

  const handleSearchFileChange = (e) => {
    console.log("handleSearchFileChange()", e.target.value);
    setSearchFile(e.target.value);
  };

  const filterRecord = (v) => {
    console.log("filter", v);
    var next = 1;

    if (v === "") {
      getMatterFiles(next);
    } else {
      const filterRecord = files.filter((x) =>
        x.name.toLowerCase().includes(v.toLowerCase())
      );

      console.log("filterRecord:", filterRecord);
      setMatterFiles(filterRecord);
    }
  };

  //filter function
  const handleFilter = (fileFilter) => {
    console.log("ff", fileFilter);
    console.log("filesToFilter", matterFiles);
    setFilterLabels(false);
    var next = 1;

    var filterRecord = [];
    if (
      fileFilter === null ||
      fileFilter === undefined ||
      fileFilter.length === 0
    ) {
      getMatterFiles(next);
      setMatterFiles(sortByOrder(matterFiles));
      // setFiles(sortByOrder(matterFiles));
    } else {
      // getMatterFiles(next);
      console.log("files", files);
      for (var i = 0; i < fileFilter.length; i++) {
        files.map((x) =>
          x.labels.items !== null
            ? x.labels.items.map((y) =>
                y.name === fileFilter[i]
                  ? (filterRecord = [...filterRecord, x])
                  : (filterRecord = filterRecord)
              )
            : x.labels.items
        );
      }

      var listFilter = [
        ...new Map(filterRecord.map((x) => [JSON.stringify(x), x])).values(),
      ];
      console.log(listFilter);
      setMatterFiles(sortByOrder(listFilter));
      // setFiles(sortByOrder(listFilter));
    }
  };

  const mCreateBackground = `
  mutation createBackground($clientMatterId: String, $description: String, $date: AWSDateTime) {
    backgroundCreate(clientMatterId: $clientMatterId, description: $description, date: $date) {
      createdAt
      date
      description
      id
      order
    }
  }
`;

  async function addFileBucketToBackground() {
    let arrFiles = [];
    setShowToast(true);
    setResultMessage(`Copying details to background..`);

    arrFiles = selectedRows.map(({ id, details, date }) => ({
      id: id,
      details: details,
      date: date,
    }));

    var counter = 0;
    for (let i = 0; i < arrFiles.length; i++) {
      counter++;
      const createBackgroundRow = await API.graphql({
        query: mCreateBackground,
        variables: {
          clientMatterId: matter_id,
          description: arrFiles[i].details,
          date:
            arrFiles[i].date !== null
              ? new Date(arrFiles[i].date).toISOString()
              : null,
        },
      });

      if (createBackgroundRow.data.backgroundCreate.id !== null) {
        const request = await API.graphql({
          query: mUpdateBackgroundFile,
          variables: {
            backgroundId: createBackgroundRow.data.backgroundCreate.id,
            files: [{ id: arrFiles[i].id }],
          },
        });
      }
    }

    setTimeout(() => {
      setShowToast(false);
      window.location.href = `${AppRoutes.BACKGROUND}/${matter_id}/?count=${counter}`;
    }, 1000);
  }

  const handleBottomScroll = useCallback(() => {
    console.log("Reached bottom page " + Math.round(performance.now()));
    setTimeout(() => {
      setLoading(true);
    }, 1500);
    setTimeout(() => {
      loadMoreMatterFiles();
      setLoading(false);
    }, 2500);
  });

  useBottomScrollListener(handleBottomScroll);

  const handleDuplicate = async () => {
    console.log(selectedCompleteDataRows);

    selectedCompleteDataRows.map(async function (items) {
      const request = await API.graphql({
        query: mCreateMatterFile,
        variables: {
          matterId: matter_id,
          s3ObjectKey: items.downloadURL,
          size: items.size,
          name: "Copy of " + items.fileName,
          type: items.type,
          order: items.order,
        },
      });

      console.log(request);
    });
    selectedCompleteDataRows = [];
  };

  const SortBydate = async () => {
    const isAllZero = matterFiles.every(
      (item) => item.order >= 0 && item.order !== 0
    );
    if (!ascDesc) {
      console.log("f");
      setAscDesc(true);
      setMatterFiles(
        matterFiles.slice().sort(
          (a, b) =>
            //isAllZero ? b.order - a.order :
            new Date(b.date) - new Date(a.date)
        )
      );
    } else {
      console.log("t");
      setAscDesc(false);
      setMatterFiles(
        matterFiles.slice().sort(
          (a, b) =>
            //isAllZero ? a.order - b.order :
            new Date(a.date) - new Date(b.date)
        )
      );
    }
  };

  const style = {
    paddingLeft: "0rem",
  };

  const showPageReference = async (
    fileId,
    backgroundId,
    clientMatter,
    description,
    rowOrder
  ) => {
    setShowPageReferenceModal(true);
    setPageReferenceFileId(fileId);
    setPageReferenceBackgroundId(backgroundId);
    setPageReferenceClientMatter(clientMatter);
    setPageReferenceDescription(description);
    setPageReferenceRowOrder(rowOrder);
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
              <Link to={AppRoutes.DASHBOARD}>
                <button className="bg-white hover:bg-gray-100 text-black font-semibold py-2.5 px-4 rounded inline-flex items-center border-0 shadow outline-none focus:outline-none focus:ring mb-3">
                  <MdArrowBackIos />
                  Back
                </button>
              </Link>

              <h1 className="font-bold text-3xl">
                File Bucket&nbsp;<span className="text-3xl">of</span>&nbsp;
                <span className="font-semibold text-3xl">
                  {clientMatterName}
                </span>
              </h1>
            </div>
          </div>
        </div>

        <div
          className="bg-white z-50 "
          style={{ position: "sticky", top: "0" }}
        >
          <nav aria-label="Breadcrumb" style={style} className="mt-4">
            <ol
              role="list"
              className="px-0 flex items-left space-x-2 lg:px-6 lg:max-w-7xl lg:px-8"
            >
              <li>
                <div className="flex items-center">
                  <Link
                    className="mr-2 text-sm font-medium text-gray-900"
                    to={`${AppRoutes.DASHBOARD}`}
                  >
                    Dashboard
                  </Link>
                  <svg
                    width="16"
                    height="20"
                    viewBox="0 0 16 20"
                    fill="currentColor"
                    xmlns="http://www.w3.org/2000/svg"
                    aria-hidden="true"
                    className="w-4 h-5 text-gray-300"
                  >
                    <path d="M5.697 4.34L8.98 16.532h1.327L7.025 4.341H5.697z" />
                  </svg>
                </div>
              </li>
              <li className="text-sm">
                <Link
                  aria-current="page"
                  className="font-medium text-gray-900"
                  to={`${AppRoutes.BACKGROUND}/${matter_id}`}
                >
                  Background
                </Link>
              </li>
              <svg
                width="16"
                height="20"
                viewBox="0 0 16 20"
                fill="currentColor"
                xmlns="http://www.w3.org/2000/svg"
                aria-hidden="true"
                className="w-4 h-5 text-gray-300"
              >
                <path d="M5.697 4.34L8.98 16.532h1.327L7.025 4.341H5.697z" />
              </svg>
              <li className="text-sm">
                <Link
                  aria-current="page"
                  className="font-medium text-gray-500"
                  to={`${AppRoutes.FILEBUCKET}/${matter_id}/000`}
                >
                  File Bucket
                </Link>
              </li>
            </ol>
          </nav>

          <div className="p-2 left-0"></div>
          {files !== null && files.length !== 0 && (
            <div className="w-full mb-3 pb-2">
              <span className="z-10 leading-snug font-normal text-center text-blueGray-300 absolute bg-transparent rounded text-base items-center justify-center w-8 py-3 px-3">
                <IoIcons.IoIosSearch />
              </span>
              <input
                type="search"
                placeholder="Type to search files in the File Bucket ..."
                onChange={handleSearchFileChange}
                className="px-3 py-3 placeholder-blueGray-300 text-blueGray-600 relative bg-white rounded text-sm border-0 shadow outline-none focus:outline-none focus:ring w-full pl-10"
              />
            </div>
          )}
          <div className="pl-2 py-1 grid grid-cols-1 gap-4">
            <div className="">
              {matterFiles !== null && matterFiles.length !== 0 && (
                <input
                  type="checkbox"
                  className="mt-1 mr-3 px-2"
                  onChange={() => checkAll(matterFiles)}
                  checked={isAllChecked}
                />
              )}
              <button
                className="bg-white hover:bg-gray-300 text-black font-semibold py-1 px-5 rounded inline-flex items-center border-0 shadow outline-none focus:outline-none focus:ring"
                onClick={() => setShowUploadModal(true)}
              >
                FILE UPLOAD &nbsp;
                <FiUpload />
              </button>

              {showRemoveFileButton && (
                <button
                  className="bg-white hover:bg-gray-300 text-black font-semibold py-1 px-5 rounded inline-flex items-center border-0 shadow outline-none focus:outline-none focus:ring mx-2"
                  onClick={() => addFileBucketToBackground()}
                >
                  COPY TO BACKGROUND PAGE &nbsp;
                  <FiCopy />
                </button>
              )}

              {showAttachBackgroundButton && (
                <button
                  className="bg-blue-400 hover:bg-blue-300 text-white font-semibold py-1 px-5 rounded inline-flex items-center border-0 shadow outline-none focus:outline-none focus:ring"
                  onClick={() => tagBackgroundFile()}
                >
                  Attach to Background &nbsp;|
                  <BsArrowLeft />
                </button>
              )}

              {matterFiles !== null &&
                matterFiles.length !== 0 &&
                showRemoveFileButton && (
                  <button
                    className="bg-blue-400 hover:bg-blue-500 text-white font-semibold py-1 px-5 ml-3 rounded inline-flex items-center border-0 shadow outline-none focus:outline-none focus:ring "
                    onClick={() => handleDuplicate()}
                  >
                    Duplicate &nbsp;
                    <FiCopy />
                  </button>
                )}

              <div className="flex inline-flex mr-0 float-right">
                {matterFiles !== null &&
                  matterFiles.length !== 0 &&
                  showRemoveFileButton && (
                    <button
                      className="float-right mr-5 bg-red-400 hover:bg-red-500 text-white font-semibold py-1 px-5 ml-3 rounded inline-flex items-center border-0 shadow outline-none focus:outline-none focus:ring "
                      onClick={() => setshowRemoveFileModal(true)}
                    >
                      DELETE &nbsp;
                      <BsFillTrashFill />
                    </button>
                  )}

                <button
                  className={
                    pageSelectedLabels
                      ? "bg-gray-800 hover:bg-blue-400 text-white font-semibold py-1 px-5 ml-3 rounded items-center border-0 shadow outline-none focus:outline-none focus:ring "
                      : "bg-gray-800 text-white font-semibold py-1 px-5 ml-3 rounded items-center border-0 shadow outline-none focus:outline-none focus:ring "
                  }
                  onClick={() => setFilterLabels(true)}
                  disabled={pageSelectedLabels ? false : true}
                >
                  <AiFillTags />
                </button>
              </div>
            </div>

            <div className=" grid justify-items-end mr-0"></div>
          </div>
        </div>

        <div className="px-2 py-0 left-0">
          <p className={"text-lg mt-3 font-medium"}>FILES</p>
        </div>

        {matterFiles === null ? (
          <span className="py-5 px-5">Please wait...</span>
        ) : (
          <>
            {matterFiles.length === 0 &&
            (searchFile === undefined || searchFile === "") ? (
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
                <ScrollToTop
                  smooth
                  color="rgb(117, 117, 114);"
                  style={{ padding: "0.4rem" }}
                />
                {matterFiles !== null && matterFiles.length !== 0 ? (
                  <div>
                    <div className="shadow border-b border-gray-200 sm:rounded-lg my-5">
                      <DragDropContext onDragEnd={handleDragEnd}>
                        <table className="table-fixed min-w-full divide-y divide-gray-200 text-xs">
                          <thead
                            className="bg-gray-100 z-50"
                            style={{ position: "sticky", top: "153px" }}
                          >
                            <tr>
                              <th className="px-2 py-4 text-center whitespace-nowrap">
                                Item No.
                              </th>
                              <th className="px-2 py-4 text-center inline-flex whitespace-nowrap">
                                <span className="ml-4">Date</span>
                                <img
                                  src={barsFilter}
                                  className="text-2xl w-4 mx-4"
                                  alt="filter"
                                  onClick={SortBydate}
                                  style={{ cursor: "pointer" }}
                                />
                              </th>
                              <th className="px-2 py-4 text-center whitespace-nowrap w-1/6">
                                Name
                              </th>
                              <th className="px-2 py-4 text-center whitespace-nowrap w-3/6">
                                Description
                              </th>
                              <th className="px-2 py-4 text-center whitespace-nowrap w-1/6">
                                Labels
                              </th>
                              <th className="px-2 py-4 text-center whitespace-nowrap w-2/6">
                                Page Reference
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
                                {matterFiles.map((data, index) => (
                                  <Draggable
                                    key={data.id}
                                    draggableId={data.id}
                                    index={index}
                                  >
                                    {(provider, snapshot) => (
                                      <tr
                                        key={data.id}
                                        index={index}
                                        className="h-full"
                                        {...provider.draggableProps}
                                        ref={provider.innerRef}
                                        style={{
                                          ...provider.draggableProps.style,
                                          backgroundColor:
                                            snapshot.isDragging ||
                                            (active && data.id === selected)
                                              ? "rgba(255, 255, 239, 0.767)"
                                              : "white",
                                        }}
                                      >
                                        <td
                                          {...provider.dragHandleProps}
                                          className="px-2 py-6 inline-flex"
                                        >
                                          <MdDragIndicator
                                            className="text-2xl"
                                            onClick={() =>
                                              handleChageBackground(data.id)
                                            }
                                          />

                                          <input
                                            type="checkbox"
                                            name={data.id}
                                            className="cursor-pointer w-10 mt-1"
                                            checked={checkedState[index]}
                                            onChange={() =>
                                              checked(
                                                data.id,
                                                data.name,
                                                data.details,
                                                data.size,
                                                data.downloadURL,
                                                data.type,
                                                data.date,
                                                index
                                              )
                                            }
                                            disabled={
                                              deletingState ? true : false
                                            }
                                          />
                                          <span className="text-xs">
                                            {index + 1}
                                          </span>
                                        </td>
                                        <td>
                                          <DatePicker
                                            className="border w-28 rounded text-xs py-2 px-1 border-gray-300 mb-5"
                                            dateFormat="dd MMM yyyy"
                                            selected={
                                              data.date !== null
                                                ? new Date(data.date)
                                                : null
                                            }
                                            placeholderText="No Date"
                                            onChange={(selected) =>
                                              handleChangeDate(
                                                selected,
                                                data.id
                                              )
                                            }
                                          />
                                        </td>
                                        <td
                                          {...provider.dragHandleProps}
                                          className="px-2 py-4 align-top place-items-center relative flex-wrap"
                                        >
                                          <div className="inline-flex">
                                            {data.type
                                              .split("/")
                                              .slice(0, -1)
                                              .join("/") === "image" ? (
                                              <GrDocumentImage className="text-2xl" />
                                            ) : data.type
                                                .split("/")
                                                .slice(0, -1)
                                                .join("/") === "audio" ? (
                                              <FaRegFileAudio className="text-2xl" />
                                            ) : data.type
                                                .split("/")
                                                .slice(0, -1)
                                                .join("/") === "video" ? (
                                              <FaRegFileVideo className="text-2xl" />
                                            ) : data.type
                                                .split("/")
                                                .slice(0, -1)
                                                .join("/") === "text" ? (
                                              <GrDocumentTxt className="text-2xl" />
                                            ) : data.type
                                                .split("/")
                                                .slice(0, -1)
                                                .join("/") === "application" &&
                                              data.type.split(".").pop() ===
                                                "sheet" ? (
                                              <GrDocumentExcel className="text-2xl" />
                                            ) : data.type
                                                .split("/")
                                                .slice(0, -1)
                                                .join("/") === "application" &&
                                              data.type.split(".").pop() ===
                                                "document" ? (
                                              <GrDocumentWord className="text-2xl" />
                                            ) : data.type
                                                .split("/")
                                                .slice(0, -1)
                                                .join("/") === "application" &&
                                              data.type.split(".").pop() ===
                                                "text" ? (
                                              <GrDocumentText className="text-2xl" />
                                            ) : data.type
                                                .split("/")
                                                .slice(0, -1)
                                                .join("/") === "application" ? (
                                              <GrDocumentPdf className="text-2xl" />
                                            ) : (
                                              <GrDocumentText className="text-2xl" />
                                            )}
                                            &nbsp;&nbsp;
                                            <span
                                              className="p-2 w-52 font-poppins"
                                              style={{
                                                cursor: "auto",
                                                outlineColor:
                                                  "rgb(204, 204, 204, 0.5)",
                                                outlineWidth: "thin",
                                              }}
                                              suppressContentEditableWarning={
                                                true
                                              }
                                              onClick={(event) =>
                                                handleNameContent(
                                                  event,
                                                  data.name,
                                                  data.id
                                                )
                                              }
                                              onInput={(event) =>
                                                handleOnChangeName(event)
                                              }
                                              onBlur={(e) =>
                                                handleSaveName(
                                                  e,
                                                  data.name,
                                                  data.id
                                                )
                                              }
                                              contentEditable={
                                                updateProgess ? false : true
                                              }
                                            >
                                              {data.name}
                                            </span>
                                            <span>
                                              <AiOutlineDownload
                                                className="text-blue-400 mx-1 text-2xl cursor-pointer right-0 absolute"
                                                onClick={() =>
                                                  previewAndDownloadFile(
                                                    data.id
                                                  )
                                                }
                                              />
                                            </span>
                                          </div>
                                          <p className="text-red-400 filename-validation">
                                            {data.id === fileId && fileAlert}
                                          </p>{" "}
                                          {/* do not change */}
                                        </td>

                                        <td
                                          {...provider.dragHandleProps}
                                          className="w-96 px-2 py-4 align-top place-items-center relative flex-wrap"
                                        >
                                          <div className="flex">
                                            <span
                                              className="w-full p-2 font-poppins h-full mx-2"
                                              style={{
                                                cursor: "auto",
                                                outlineColor:
                                                  "rgb(204, 204, 204, 0.5)",
                                                outlineWidth: "thin",
                                              }}
                                              suppressContentEditableWarning={
                                                true
                                              }
                                              onClick={(event) =>
                                                handleDetailsContent(
                                                  event,
                                                  data.details,
                                                  data.id
                                                )
                                              }
                                              onInput={(event) =>
                                                handleOnChangeDetails(event)
                                              }
                                              onBlur={(e) =>
                                                handleSaveDetails(
                                                  e,
                                                  data.details,
                                                  data.id
                                                )
                                              }
                                              contentEditable={
                                                updateProgess ? false : true
                                              }
                                              dangerouslySetInnerHTML={{
                                                __html: data.details,
                                              }}
                                            ></span>
                                          </div>
                                          <br />
                                          <span className="text-red-400 filename-validation">
                                            {data.id === detId && descAlert}
                                          </span>
                                        </td>

                                        <td
                                          {...provider.dragHandleProps}
                                          className="px-2 py-4 align-top place-items-center relative flex-wrap"
                                        >
                                          <CreatableSelect
                                            defaultValue={extractArray(
                                              data.labels.items
                                                ? data.labels.items
                                                : { value: 0, label: "" }
                                            )}
                                            options={newOptions(
                                              labels,
                                              data.labels.items
                                            )}
                                            isMulti
                                            isClearable
                                            isSearchable
                                            openMenuOnClick={true}
                                            onChange={(options) =>
                                              handleLabelChanged(
                                                options,
                                                data.id,
                                                data.name,
                                                data.details,
                                                index
                                              )
                                            }
                                            placeholder="Labels"
                                            className="w-60 placeholder-blueGray-300 text-blueGray-600 text-xs bg-white rounded text-sm border-0 shadow outline-none focus:outline-none focus:ring z-100"
                                          />
                                        </td>
                                        <td
                                          {...provider.dragHandleProps}
                                          className="w-96 px-2 py-4 align-top place-items-center relative flex-wrap"
                                        >
                                          {data.backgrounds.items
                                            .sort((a, b) =>
                                              a.order > b.order ? 1 : -1
                                            )
                                            .filter(
                                              (x) =>
                                                !Object.values(x).includes(null)
                                            )
                                            .map((background, index) => (
                                              <p
                                                className="p-2 mb-2 text-xs bg-gray-100  hover:bg-gray-900 hover:text-white rounded-lg cursor-pointer"
                                                key={background.id}
                                                index={index}
                                                onClick={() =>
                                                  showPageReference(
                                                    data.id,
                                                    background.id,
                                                    clientMatterName,
                                                    background.description,
                                                    background.order
                                                  )
                                                }
                                              >
                                                <b>{background.order + ". "}</b>
                                                {ellipsis(
                                                  clientMatterName +
                                                    " Background",
                                                  40
                                                )}
                                              </p>
                                            ))
                                            .sort()}
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
                    </div>
                    <div className="p-2"></div>
                    <div>
                      {maxLoading ? (
                        <div className="flex justify-center items-center mt-5">
                          <p>All data has been loaded.</p>
                        </div>
                      ) : matterFiles.length >= 20 &&
                        matter_id !== "c934548e-c12a-4faa-a102-d77f75e3da2b" ? (
                        <div className="flex justify-center items-center mt-5">
                          <img src={imgLoading} width={50} height={100} />
                        </div>
                      ) : (
                        <span></span>
                      )}

                      {!maxLoading && loading ? (
                        <span className="grid"></span>
                      ) : (
                        <span></span>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="p-5 px-5 py-1 left-0">
                    <div className="w-full h-42 mb-6 py-1 px-1 grid justify-items-center">
                      <NoResultState
                        searchKey={searchFile}
                        message={
                          "Check the spelling, try a more general term or look up a specific File."
                        }
                      />
                    </div>
                  </div>
                )}
              </>
            )}
          </>
        )}
      </div>
      {showRemoveFileModal && (
        <RemoveFileModal
          handleSave={handleDeleteFile}
          handleModalClose={handleModalClose}
        />
      )}

      {showUploadModal && (
        <UploadLinkModal
          title={""}
          handleSave={handleUploadLink}
          bucketName={matter_id}
          handleModalClose={handleModalClose}
        />
      )}
      {showPageReferenceModal && (
        <PageReferenceModal
          handleModalClose={handleModalClose}
          fileId={pageReferenceFileId}
          backgroundId={pageReferenceBackgroundId}
          clientMatter={pageReferenceClientMatter}
          description={pageReferenceDescription}
          order={pageReferenceRowOrder}
          getMatterFiles={getMatterFiles}
        />
      )}
      {filterLabels && (
        <FilterLabels
          handleSave={handleFilter}
          handleModalClose={handleModalClose}
        />
      )}
      {showToast && resultMessage && (
        <ToastNotification title={resultMessage} hideToast={hideToast} />
      )}
    </>
  );
}
