import React, { useEffect, useState, useRef } from "react";
import { Link } from "react-router-dom";
import ToastNotification from "../toast-notification";
import { API, toast } from "aws-amplify";
import BlankState from "../blank-state";
import NoResultState from "../no-result-state";
import { AppRoutes } from "../../constants/AppRoutes";
import { useParams } from "react-router-dom";
import { MdArrowForwardIos, MdDragIndicator } from "react-icons/md";
import * as IoIcons from "react-icons/io";
import { AiOutlineDownload, AiFillTags, AiOutlineLeft, AiOutlineRight } from "react-icons/ai";
import { FiUpload, FiCopy } from "react-icons/fi";
import "../../assets/styles/BlankState.css";
import UploadLinkModal from "./file-upload-modal";
import FilterLabels from "./filter-labels-modal";
import AccessControl from "../../shared/accessControl";
import CreatableSelect from "react-select/creatable";
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";
import { FaRegFileAudio, FaRegFileVideo} from "react-icons/fa";

import {
  GrDocumentPdf,
  GrDocumentText,
  GrDocumentImage,
  GrDocument,
  GrDocumentExcel,
  GrDocumentWord,
  GrDocumentTxt,
} from "react-icons/gr";
import {
  BsArrowLeft,
  BsConeStriped,
  BsFillArrowDownLeftSquareFill,
  BsFillArrowLeftSquareFill,
  BsFillExclamationOctagonFill,
  BsFillPersonLinesFill,
  BsFillTrashFill,
} from "react-icons/bs";
import RemoveFileModal from "./remove-file-modal";

export var selectedRows = [];
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
  const [nextToken, setNextToken] = useState("");
  const [prevToken, setPrevToken] = useState("");
  const [filteredFiles, setFilteredFiles] = useState([]);

  let filterOptionsArray = [];

  const [showRemoveFileModal, setshowRemoveFileModal] = useState(false);
  const [showRemoveFileButton, setshowRemoveFileButton] = useState(false);
  const [showAttachBackgroundButton, setshowAttachBackgroundButton] =
    useState(false);
  var fileCount = 0;

  const [filterLabels, setFilterLabels] = useState(false);
  const [deletingState, setDeletingState] = useState(false);
  const [descHeight, setDescHeight] = useState("w-full p-2 font-poppins h-10");

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
    setshowRemoveFileModal(false);
    setFilterLabels(false);
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
      mutation updateMatterFile ($id: ID, $name: String, $details: String, $labels : [LabelInput]) {
        matterFileUpdate(id: $id, name: $name, details: $details, labels : $labels ) {
          id
          name
          details
          labels {
            id
            name
          }
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

  const mUpdateMatterFileOrder = `
    mutation updateMatterFile ($id: ID, $order: Int) {
      matterFileUpdate(id: $id, order: $order) {
        id
        order
      }
    }
`;

  const mUpdateBackgroundFile = `
    mutation addBackgroundFile($backgroundId: ID, $files: [FileInput]) {
      backgroundFileTag(backgroundId: $backgroundId, files: $files) {
        id
      }
    }
  `;

const mGetPaginateItems = `
  query getFilesByMatter($isDeleted: Boolean, $limit: Int, $matterId: ID, $nextToken: String) {
    matterFile(isDeleted: $isDeleted, matterId: $matterId, nextToken: $nextToken, limit: $limit) {
      id
      name,
      downloadURL,
      nextToken
    }
  }
`;

  async function tagBackgroundFile() {
    let arrFiles = [];
    arrFiles = selectedRows.map(({ id }) => ({
      id: id,
    }));
    if (background_id !== null) {
      return new Promise((resolve, reject) => {
        try {
          const request = API.graphql({
            query: mUpdateBackgroundFile,
            variables: {
              backgroundId: background_id,
              files: arrFiles,
            },
          });
          resolve(request);
        } catch (e) {
          reject(e.errors[0].message);
        }
      });
    }
  }

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

  const getLabels = async (data) => {
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

  const addLabel = async (data) => {
    let result;

    if (labels.some((x) => x.label === data.trim())) {
      return;
    } else {
      const createLabel = await API.graphql({
        query: mCreateLabel,
        variables: {
          clientMatterId: matter_id,
          name: data,
        },
      });
      result = createLabel.data.labelCreate;
      console.log(result.name);
    }

    getLabels(data);
    return result;
  };

  useEffect(() => {
    if (matterFiles === null) {
      console.log("matterFiles is null");
      getMatterFiles();
      getPaginateItems("", "");
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

  let getMatterFiles = async () => {
    const params = {
      query: qGetMatterFiles,
      variables: {
        matterId: matter_id,
        isDeleted: false,
      },
    };

    await API.graphql(params).then((files) => {
      const matterFilesList = files.data.matterFile;
      fileCount = matterFilesList.length;
      setFiles(matterFilesList);
      setMatterFiles(sortByOrder(matterFilesList));
      setClientMatterName(
        `${files.data.clientMatter.client.name}/${files.data.clientMatter.matter.name}`
      );
      setPageTotal(fileCount);
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

  const handleMatterChanged = async (options, id, name, details, index) => {
    setFileId(id);
    let newOptions = [];
    let createdLabel;
    var updated;

    options.map(async (o) => {
      if (o.__isNew__) {
        createdLabel = await addLabel(o.label);
      }
    });

    newOptions = options.map(({ value: id, label: name }) => ({
      id: id,
      name: name,
    }));

    updated = newOptions.map((d) => (d.name == d.id ? { ...d, id: id } : d));

    const data = {
      name: name,
      details: details,
      labels: updated,
    };

    updateArr(data.labels, index);
    await updateMatterFile(id, data);
    await tagFileLabel(id, data.labels);
    setUpdateProgress(true);
    setResultMessage(`Updating labels..`);
    setShowToast(true);
    setTimeout(() => {
      getMatterFiles();
      setTimeout(() => {
        setTimeout(() => {
          setShowToast(false);
          setUpdateProgress(false);
        }, 1000);
      }, 1000);
    }, 1000);
  };

  function updateArr(data, index) {
    tempArr[index] = data;
  }

  const handleDetailsContent = (e, details, id) => {
    
    if (!descAlert) {
      // setDescHeight("w-full p-2 font-poppins h-full");
      setTextDetails(!details ? "" : details);
      setDetId(id);
      setDesAlert("");
      
    } else {
      setTextDetails("");
      // setDescHeight("w-full p-2 font-poppins h-10");
      
    }
  };

  const handleOnChangeDetails = (event) => {
    setTextDetails(event.currentTarget.textContent);
  };

  const handleSaveDetails = async (e, name, details, id, labels, index) => {
    if (textDetails.length <= 0) {
      // setDescHeight("w-full p-2 font-poppins h-10");
      setDesAlert("Description can't be empty");
    } else if (textDetails === details) {
      setDesAlert("");
      setUpdateProgress(true);
      setResultMessage(`Saving in progress..`);
      setShowToast(true);

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
      const data = {
        name: updatedName[0],
        details: details,
        labels: updatedLabels[0],
      };
      await updateMatterFile(id, data);
      setTimeout(() => {
        getMatterFiles();
        setTimeout(() => {
          setTextName("");
          setResultMessage(`Successfully updated `);
          setShowToast(true);
          setTimeout(() => {
            setShowToast(false);
            setUpdateProgress(false);
          }, 1000);
        }, 1000);
      }, 1000);
    } else {
      setDesAlert("");
      setUpdateProgress(true);
      setResultMessage(`Saving in progress..`);
      setShowToast(true);

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

      const data = {
        name: updatedName[0],
        details: textDetails,
        labels: updatedLabels[0],
      };
      await updateMatterFile(id, data);
      setTimeout(() => {
        getMatterFiles();
        setTimeout(() => {
          setTextName("");

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

  const handleNameContent = (e, name, id) => {
    if (!fileAlert) {
      setTextName(name);
      setFileId(id);
      setFileAlert("");
    } else {
      setTextName("");
    }
  };

  const handleOnChangeName = (event) => {
    setTextName(event.currentTarget.textContent);
  };

  const handleSaveName = async (e, name, details, id, labels, index) => {
    if (textName.length <= 0) {
      setFileAlert("File name can't be empty");
    } else if (textName === name) {
      setFileAlert("");
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
      const data = {
        name: name,
        details: updatedDesc[0],
        labels: updatedLabels[0],
      };
      await updateMatterFile(id, data);
      setTimeout(() => {
        getMatterFiles();
        setTimeout(() => {
          setTextName("");
          setResultMessage(`Successfully updated `);
          setShowToast(true);
          setTimeout(() => {
            setShowToast(false);
            setUpdateProgress(false);
          }, 1000);
        }, 1000);
      }, 1000);
    } else {
      setFileAlert("");
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
      const data = {
        name: textName,
        details: updatedDesc[0],
        labels: updatedLabels[0],
      };
      await updateMatterFile(id, data);
      setTimeout(() => {
        getMatterFiles();
        setTimeout(() => {
          setTextName("");
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

      // setFilterOptions([...filterOptions, newOptions]);
      newOptions.map(
        (data) => (filterOptionsArray = [...filterOptionsArray, data])
      );

      //filter duplicates
      pageSelectedLabels = [
        ...new Map(
          filterOptionsArray.map((item) => [JSON.stringify(item.label), item])
        ).values(),
      ];
      // setFilterLabelsData(pageSelectedLabels);
      return newOptions;
    } else {
      return null;
    }
  };

  function sortByOrder(arr) {
    const isAllZero = arr.every((item) => item.order <= 0 && item.order === 0);
    let sort;
    if (isAllZero) {
      sort = arr.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    } else {
      sort = arr.sort(
        (a, b) =>
          a.order - b.order || new Date(b.createdAt) - new Date(a.createdAt)
      );
    }
    return sort;
  }

  //drag and drop functions
  const handleDragEnd = async (e) => {
    let tempMatter = [...matterFiles];

    let [selectedRow] = tempMatter.splice(e.source.index, 1);

    tempMatter.splice(e.destination.index, 0, selectedRow);
    setMatterFiles(tempMatter);

    const res = tempMatter.map(myFunction);

    function myFunction(item, index) {
      let data;
      return (data = {
        id: item.id,
        order: index + 1,
      });
    }

    res.map(async function (x) {
      const mUpdateMatterFileOrder = `
  mutation updateMatterFile ($id: ID, $order: Int) {
    matterFileUpdate(id: $id, order: $order) {
      id
      order
    }
  }
`;

      await API.graphql({
        query: mUpdateMatterFileOrder,
        variables: {
          id: x.id,
          order: x.order,
        },
      });
    });
  };

  var tempCount = 99;
  const [checkedState, setCheckedState] = useState(
    new Array(fileCount).fill(false)
  );
  const [isAllChecked, setIsAllChecked] = useState(false);

  //function for selecting rows
  function checked(id, fileName, details, idx) {
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
          { id: id, fileName: fileName, details: details },
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
            { id: data.id, fileName: data.name, details: data.details },
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

    tempArr = [];
    nameArr = [];
    descArr = [];
    selectedRows = [];
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
        getMatterFiles();
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
      //{value: 0, label: "test"}
      //data - oldOpt

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

    if (v === "") {
      getMatterFiles();
    } else {
      const filterRecord = files.filter((x) =>
        x.name.toLowerCase().includes(v.toLowerCase())
      );

      console.log("filterRecord:", filterRecord);
      setMatterFiles(filterRecord);
    }
  };

  const handleFilter = (fileFilter) => {
    setFilterLabels(false);
    var filterRecord = [];
    if (
      fileFilter == null ||
      fileFilter == undefined ||
      fileFilter.length == 0
    ) {
      setMatterFiles(sortByOrder(files));
    } else {
      for (var i = 0; i < fileFilter.length; i++) {
        files.map((x) =>
          x.labels !== null
            ? x.labels.map((y) =>
                y.name === fileFilter[i]
                  ? (filterRecord = [...filterRecord, x])
                  : (filterRecord = filterRecord)
              )
            : x.labels
        );
      }

      var listFilter = [
        ...new Map(filterRecord.map((x) => [JSON.stringify(x), x])).values(),
      ];
      console.log(listFilter);
      setMatterFiles(sortByOrder(listFilter));
    }
  };

  const mCreateBackground = `
      mutation createBackground($clientMatterId: String, $date: AWSDateTime, $description: String) {
        backgroundCreate(clientMatterId: $clientMatterId, date: $date, description: $description) {
          id
        }
      }
  `;

  async function addFileBucketToBackground() {
    let arrFiles = [];
    setShowToast(true);
    setResultMessage(`Copying details to background..`);

    arrFiles = selectedRows.map(({ id, details }) => ({
      id: id,
      details: details,
    }));

    console.log(selectedRows);

    const dateToday =new Date().toISOString();
    var counter=0;
    for (let i = 0; i < arrFiles.length; i++) {
      counter++;
      const createBackgroundRow = await API.graphql({
        query: mCreateBackground,
        variables: {
          clientMatterId: matter_id,
          date: dateToday,
          description: arrFiles[i].details,
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
    }, 1500);
  }

  const getPaginateItems = async (action, page) => {
    let pageList = 20;
    let pageResult = [];
    
    const request = await API.graphql({
      query: mGetPaginateItems,
      variables: {
        matterId: matter_id,
        isDeleted: false,
        nextToken: page,
        limit: pageList
      },
    });

    if (request.data.matterFile !== null) {
      pageResult = request.data.matterFile.map(
        ({ id }) => ({
          id: id
        })
      );
    }

    setFilteredFiles(pageResult);

    if(action === "next") {
      setPageIndex(pageIndex + pageList);
      setPageSize(pageSize + pageList);
      setPrevToken(prevToken);

      for (let i = 0; i < request.data.matterFile.length; i++) {
        if(request.data.matterFile[i].nextToken !== null) {
          setNextToken(request.data.matterFile[i].nextToken);
        }
      }

    } else if(action === "prev") {
      setPageIndex(pageIndex - pageList);
      setPageSize(pageSize - pageList);
      setPrevToken(prevToken);

      for (let i = 0; i < request.data.matterFile.length; i++) {
        if(request.data.matterFile[i].nextToken !== null) {
          setNextToken(request.data.matterFile[i].nextToken);
        }
      }

    } else {
      for (let i = 0; i < request.data.matterFile.length; i++) {
        if(request.data.matterFile[i].nextToken !== null) {
          setPrevToken(page);
          setNextToken(request.data.matterFile[i].nextToken);
        }
      }

    }
  }

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
              <br/>
                Prev: {prevToken} 
              <br/>  
                Next: {nextToken}
            </div>

            <div className="absolute right-0">
              {showAttachBackgroundButton && (
                <Link to={`${AppRoutes.BACKGROUND}/${matter_id}`}>
                  <button
                    className="bg-blue-400 hover:bg-blue-300 text-white font-semibold py-2.5 px-4 rounded inline-flex border-0 shadow outline-none focus:outline-none focus:ring mr-1.5"
                    onClick={() => tagBackgroundFile()}
                  >
                    Attach to Background &nbsp;|
                    <BsArrowLeft />
                  </button>
                </Link>
              )}
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
        <div className="pl-2 py-1 grid grid-cols-2 gap-4">
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
                className="bg-white hover:bg-gray-300 text-black font-semibold py-1 px-5 rounded inline-flex items-center border-0 shadow outline-none focus:outline-none focus:ring"
                onClick={() => addFileBucketToBackground()}
              >
                COPY TO BACKGROUND PAGE &nbsp;
                <FiCopy />
              </button>
            )}
          </div>
          <div className=" grid justify-items-end mr-0">
            <div className="flex inline-flex mr-0">
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
        </div>

        <div className="px-2 py-0 left-0">
          <p className={"text-lg mt-3 font-medium"}>FILES</p>
        </div>

        <div className="px-2 py-0">
          <p className={"text-sm mt-3 font-medium float-right inline-block"}>
            <AiOutlineLeft 
              className={pageIndex === 1 ? "text-gray-300 inline-block pointer-events-none" : "inline-block cursor-pointer"}
              onClick={() => getPaginateItems('prev', prevToken) } 
            />
            &nbsp;&nbsp;Showing {pageIndex} - {pageSize >= pageTotal ? pageTotal : pageSize} of {pageTotal}&nbsp;&nbsp; 
            <AiOutlineRight 
              className={pageSize >= pageTotal ? "text-gray-300 inline-block pointer-events-none" : "inline-block cursor-pointer"}
              onClick={() => getPaginateItems('next', nextToken) } 
            /></p>
        </div>

        {matterFiles !== null && (
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
                {matterFiles !== null && matterFiles.length !== 0 ? (
                  <div className="shadow border-b border-gray-200 sm:rounded-lg my-5">
                    <DragDropContext onDragEnd={handleDragEnd}>
                      <table className=" table-fixed min-w-full divide-y divide-gray-200">
                        <thead>
                          <tr>
                            <th className="px-2 py-4 text-center whitespace-nowrap">
                              Item No.
                            </th>
                            <th className="px-2 py-4 text-center whitespace-nowrap w-1/4">
                              Name
                            </th>
                            <th className="px-2 py-4 text-center whitespace-nowrap w-3/4">
                              Description
                            </th>
                            <th className="px-2 py-4 text-center whitespace-nowrap w-1/4">
                              Labels
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
                              {matterFiles
                              .filter(
                                (x) =>
                                filteredFiles.find( files => files.id === x.id )
                              ).map((data, index) => (
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
                                              index
                                            )
                                          }
                                          disabled={deletingState ? true : false}
                                        />
                                        <span>{index + 1}</span>
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
                                            className="p-2 w-60 font-poppins"
                                            style={{
                                              cursor: "auto",
                                              outlineColor:
                                                "rgb(204, 204, 204, 0.5)",
                                              outlineWidth: "thin",
                                            }}
                                            suppressContentEditableWarning
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
                                                data.details,
                                                data.id,
                                                data.labels,
                                                index
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
                                                previewAndDownloadFile(data.id)
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
                                        className="px-2 py-4 align-top place-items-center relative flex-wrap"
                                      >
                                        <div className="flex">
                                          <span
                                            // className={data.details!=null || data.details!=undefined ?
                                            //   "w-full p-2 font-poppins"
                                            // : "w-full p-2 font-poppins h-10 bg-blue-400 test"}
                                            className={
                                              data.details ?
                                                "w-full p-2 font-poppins h-full"
                                              : "w-full p-2 font-poppins h-9" 
                                            }
                                            style={{
                                              cursor: "auto",
                                              outlineColor:
                                                "rgb(204, 204, 204, 0.5)",
                                              outlineWidth: "thin"
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
                                                data.name,
                                                data.details,
                                                data.id,
                                                data.labels,
                                                index
                                              )
                                            }
                                            contentEditable={
                                              updateProgess ? false : true
                                            }
                                          >
                                            {data.details}
                                          </span>
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
                                            data.labels
                                              ? data.labels
                                              : { value: 0, label: "" }
                                          )}
                                          options={newOptions(
                                            labels,
                                            data.labels
                                          )}
                                          // options={labels}
                                          isMulti
                                          isClearable
                                          isSearchable
                                          onChange={(options) =>
                                            handleMatterChanged(
                                              options,
                                              data.id,
                                              data.name,
                                              data.details,
                                              index
                                            )
                                          }
                                          placeholder="Labels"
                                          className="w-60 placeholder-blueGray-300 text-blueGray-600 bg-white rounded text-sm border-0 shadow outline-none focus:outline-none focus:ring z-100"
                                        />
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
