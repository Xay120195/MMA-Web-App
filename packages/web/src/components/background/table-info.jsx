import React, { useState, useEffect, useCallback, useRef } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
// import { Link } from "react-router-dom";
import { AppRoutes } from "../../constants/AppRoutes";
import ToastNotification from "../toast-notification";
import { AiOutlineDownload } from "react-icons/ai";
import { FaPaste, FaSync, FaSort, FaPlus, FaChevronDown } from "react-icons/fa";
import Loading from "../loading/loading";
import { List, AutoSizer, CellMeasurer, CellMeasurerCache, WindowScroller } from "react-virtualized";

import {
  BsFillTrashFill,
  BsFillBucketFill,
  BsSortUpAlt,
  BsSortDown,
} from "react-icons/bs";
import EmptyRow from "./empty-row";
import { ModalParagraph } from "./modal";
import { API } from "aws-amplify";
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";
import { MdDragIndicator } from "react-icons/md";

import RemoveModal from "../delete-prompt-modal";
import { useHistory, useLocation } from "react-router-dom";
import { useBottomScrollListener } from "react-bottom-scroll-listener";
import imgLoading from "../../assets/images/loading-circle.gif";
import "../../assets/styles/background.css";
import ScrollToTop from "react-scroll-to-top";
import UploadLinkModal from "../file-bucket/file-upload-modal";
import NoResultState from "../no-result-state";
import ReactTooltip from "react-tooltip";
import { check } from "prettier";
import RFIEditor from './rfi-editor';
import { ThemeProvider } from '@remirror/react';

export let selectedRowsBGPass = [],
  selectedRowsBGFilesPass = [];

const TableInfo = ({
  background,
  files,
  wait,
  setIdList,
  setBackground,
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
  selectRow,
  setSelectRow,
  checkDate,
  checkDesc,
  checkDocu,
  pasteButton,
  setSrcIndex,
  client_name,
  matter_name,
  pageIndex,
  pageSize,
  pageSizeConst,
  loadMoreBackground,
  newRow,
  setPasteButton,
  setNewRow,
  loading,
  setLoading,
  maxLoading,
  sortByOrder,
  SortBydate,
  briefId,
  searchDescription,
  selectedItems,
  setSelectedItems,
  holdDelete,
  setHoldDelete,
  setTargetRow,
  targetRow,
  highlightRow,
  setHighlightRow,
  pastedRows,
  setPastedRows,
  checkedRows,
  setCheckedRows
}) => {
  let temp = selectedRowsBG;
  let tempFiles = selectedRowsBGFiles;
  const [showToast, setShowToast] = useState(false);
  const [alertMessage, setalertMessage] = useState();

  const [selected, setSelected] = useState("");
  const [descId, setDescId] = useState("");
  const [textDesc, setTextDesc] = useState("");
  const [descAlert, setDescAlert] = useState("");

  const [showRemoveFileModal, setshowRemoveFileModal] = useState(false);
  const [selectedFileBG, setselectedFileBG] = useState([]);
  const [highlightRows, setHighlightRows] = useState("bg-green-200");
  //const [sortByDate, setSortByDate] = useState([]);
  const [isShiftDown, setIsShiftDown] = useState(false);

  const [lastSelectedItem, setLastSelectedItem] = useState(null);

  const [selectedRowId, setSelectedRowID] = useState(null);
  const [goToFileBucket, setGoToFileBucket] = useState(false);
  const [showUploadModal, setShowUploadModal] = useState(false);

  const [holdPaste, setHoldPaste] = useState(false);
  const [bgInput, setBgInput] = useState([]);

  const [holdDeleteFile, setHoldDeleteFile] = useState(false);
  const bool = useRef(true);
  const [selectedFileId, setSelectedFileId] = useState(null);
  

  const location = useLocation();
  const history = useHistory();

  const cache = useRef(new CellMeasurerCache({
    fixedWidth: true,
    defaultHeight: 100,
  }));

  var moment = require("moment");

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
    setSelectedFileId(id);
  };

  const handleModalClose = () => {
    setshowRemoveFileModal(false);
    setShowUploadModal(false);
  };

  const handleCheckboxChange = (position, event, id, date, details) => {
    const checkedId = selectRow.some((x) => x.id === id);
    if (!checkedId && event.target.checked) {
      const x = selectRow;
      x.push({ id: id, date: date, details: details });
      setSelectRow(x);
      setSrcIndex(position);
      setShowDeleteButton(true);
    }
    if (checkedId) {
      var x = selectRow.filter(function (sel) {
        return sel.id !== id;
      });
      setSelectRow(x);
      setSrcIndex("");
    }

    const updatedCheckedState = checkedState.map((item, index) =>
      index === position ? !item : item
    );
    setCheckedState(updatedCheckedState);

    let tc = updatedCheckedState.filter((v) => v === true).length;
    settotalChecked(tc);

    if (tc !== background.length) {
      if (checkAllState) {
        setcheckAllState(false);
      }
    } else {
      if (!checkAllState) {
        setcheckAllState(true);
      }
    }
    if (event.target.checked) {
      if (!background.includes({ id: event.target.name })) {
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
  };

  useEffect(() => {
    setTimeout(() => {
      setLoading(false);
    }, 1000);

    setIdList(getId);

    // if (matterFiles === null) {
    //   console.log("matterFiles is null");
    //   getMatterFiles();
    // }
  }, [getId]);

  const handleDescContent = (e, description, id, index) => {
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

  const handleSaveDesc = async (e, description, date, id, index) => {
    const updateArr = background.map((obj) => {
      if (obj.id === id) {
        return { ...obj, description: e.target.innerHTML };
      }
      return obj;
    });
    setBackground(updateArr);
    //background.recomputeRowHeights(index);

    if (textDesc.length <= 0) {
      setDescAlert("Description can't be empty.");
    } else if (textDesc === description) {
      setDescAlert("");

      setalertMessage("Saving in progress...");
      setShowToast(true);

      const data = {
        description: e.target.innerHTML,
      };

      const success = await updateBackgroundDesc(id, data);
      if (success) {
        setalertMessage("Successfully updated.");
        setShowToast(true);
      }

      setTimeout(() => {
        setShowToast(false);
      }, 1000);
    } else {
      const data = {
        description: e.target.innerHTML,
      };
      const success = await updateBackgroundDesc(id, data);
      if (success) {
        setalertMessage("Successfully updated.");
        setShowToast(true);
      }
      setTimeout(() => {
        setShowToast(false);
      }, 1000);
    }
  };

  const handleChangeDate = async (selected, id, description) => {
    const data = {
      date: selected !== null ? String(selected) : null,
    };
    await updateBackgroundDate(id, data);

    const updatedOSArray = background.map((p) =>
      p.id === id ? { ...p, date: data.date } : p
    );

    setBackground(updatedOSArray);
  };

  const mUpdateBackgroundDate = `
    mutation updateBackground($id: ID, $date: AWSDateTime) {
      backgroundUpdate(id: $id, date: $date) {
        id
        date
      }
    }
  `;

  const mUpdateBackgroundDesc = `
  mutation updateBackground($id: ID, $description: String) {
    backgroundUpdate(id: $id, description: $description) {
      id
      description
    }
  }
`;

  async function updateBackgroundDate(id, data) {
    console.log("updateBackgroundDate:", data);

    return new Promise((resolve, reject) => {
      try {
        const request = API.graphql({
          query: mUpdateBackgroundDate,
          variables: {
            id: id,
            date:
              data.date !== null
                ? moment
                    .utc(moment(new Date(data.date), "YYYY-MM-DD"))
                    .toISOString()
                : null,
          },
        });
        resolve(request);
      } catch (e) {
        reject(e.errors[0].message);
      }
    });
  }
  async function updateBackgroundDesc(id, data) {
    return new Promise((resolve, reject) => {
      try {
        const request = API.graphql({
          query: mUpdateBackgroundDesc,
          variables: {
            id: id,
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
    let tempBackground = [...background];

    let [selectedRow] = tempBackground.splice(e.source.index, 1);

    tempBackground.splice(e.destination.index, 0, selectedRow);
    setBackground(tempBackground);

    const res = tempBackground.map(({ id }, index) => ({
      id: id,
      order: index+1,
    }));
    console.log(res);
    const mBulkUpdateBackgroundOrder = `
      mutation bulkUpdateBackgroundOrders($arrangement: [ArrangementInput]) {
        backgroundBulkUpdateOrders(arrangement: $arrangement) {
          id
          order
        }
      }`;
    const response = await API.graphql({
      query: mBulkUpdateBackgroundOrder,
      variables: {
        arrangement: res,
      },
    });
    console.log(response);
  };

  const handleChageBackground = (id) => {
    setSelected(id);
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

  const mUpdateBackgroundFile = `
    mutation addBackgroundFile($backgroundId: ID, $files: [FileInput]) {
      backgroundFileTag(backgroundId: $backgroundId, files: $files) {
        id
      }
    }
  `;

  const handleDelete = async (item) => {
    setHoldDeleteFile(true);
    setalertMessage(`Deleting File. Click HERE to undo action`);
    setShowToast(true);
    setshowRemoveFileModal(false);

    setTimeout(() => {
      setShowToast(false);
    }, 9000);

    setTimeout(() => {
      if (bool.current) {
        deleteFileProper(item);
      } else {
        cancelDeleteFile();
      }
    }, 10000);
  };

  const deleteFileProper = async (item) => {
    const backgroundFilesOpt = await API.graphql({
      query: qlistBackgroundFiles,
      variables: {
        id: item[0].backgroundId,
      },
    });

    if (backgroundFilesOpt.data.background.files !== null) {
      const arrFileResult = backgroundFilesOpt.data.background.files.items.map(
        ({ id }) => ({
          id: id,
        })
      );

      const filteredArrFiles = arrFileResult.filter((i) => i.id !== item[0].id);

      const request = API.graphql({
        query: mUpdateBackgroundFile,
        variables: {
          backgroundId: item[0].backgroundId,
          files: filteredArrFiles,
        },
      });

      setTimeout(async () => {
        // list updated result files
        const backgroundFilesOptReq = await API.graphql({
          query: qlistBackgroundFiles,
          variables: {
            id: item[0].backgroundId,
          },
        });

        if (backgroundFilesOptReq.data.background.files !== null) {
          const newFilesResult =
            backgroundFilesOptReq.data.background.files.items.map(
              ({ id, name, description }) => ({
                id: id,
                name: name,
                description: description,
              })
            );

          const updateArrFiles = background.map((obj) => {
            if (obj.id === item[0].backgroundId) {
              return { ...obj, files: { items: newFilesResult } };
            }
            return obj;
          });

          console.log(newFilesResult);
          setBackground(updateArrFiles);
        }
      }, 1000);
    }
    getBackground();
    setalertMessage(`Successfully Deleted File.`);
    setShowToast(true);

    setTimeout(() => {
      setShowToast(false);
      setHoldDeleteFile(false);
    }, 2000);
  };

  const cancelDeleteFile = () => {
    bool.current = false;
    setHoldDeleteFile(false);
  };

  function undoDeleteFile() {
    bool.current = false;
    setalertMessage(`Restored File.`);
    setShowToast(true);
    setHoldDeleteFile(false);

    setTimeout(() => {
      setShowToast(false);
    }, 3000);
  }

  //end

  setTimeout(() => {
    setHighlightRows("bg-white");

    if (queryParams.has("count")) {
      // queryParams.delete("count");
      // history.replace({
      //   search: queryParams.toString(),
      // });
      history.push(
        `${AppRoutes.BACKGROUND}/${matterId}/?matter_name=${utf8_to_b64(
          matter_name
        )}&client_name=${utf8_to_b64(client_name)}`
      );
    }
  }, 10000);

  function compareValues(key, order = "asc") {
    return function innerSort(a, b) {
      if (!a.hasOwnProperty(key) || !b.hasOwnProperty(key)) {
        return 0;
      }

      const varA = new Date(a[key]);
      const varB = new Date(b[key]);
      let comparison = 0;
      if (varA > varB) {
        comparison = 1;
      } else if (varA < varB) {
        comparison = -1;
      }
      return order === "desc" ? comparison * -1 : comparison;
    };
  }

  const handleFilesCheckboxChange = (event, id, files_id, background_id) => {
    var temp = pastedRows;
    var temp2 = checkedRows;
    

    if (event.target.checked) {
      if (!files.includes({ uniqueId: event.target.name })) {
        if (
          tempFiles.indexOf(
            tempFiles.find((temppFiles) => temppFiles.id === id)
          ) > -1
        ) {
          // temp.map((x)=> x === background_id ? temp.splice(temp.indexOf(x), 1) : x)
          // setPastedRows(temp);
        } else {
          tempFiles = [
            ...tempFiles,
            { id: id, files: files_id, backgroundId: background_id },
          ];
          selectedRowsBGFilesPass = tempFiles;

          // temp = [...temp, background_id+"/"+files_id];
          // console.log("selected", temp);

          temp2 = [...temp2, background_id+"/"+files_id];
          console.log("selected row+file id", temp2);
          setCheckedRows(temp2);
          // setPastedRows(temp);
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
        console.log("bgid", background_id);
        console.log("temp", temp);
      
        var pass = []
        var pass2 = []

        // for(var i = 0; i<temp.length; i++){
        //   var splitId = temp[i].split("/");
        //   console.log("firstsecond", splitId);
        //   if(splitId[0] === background_id && splitId[1] === files_id){
        //     pass = pass;
        //   }else{
        //     pass = [...pass, temp[i]];
        //   }
        // }

        for(var i = 0; i<temp2.length; i++){
          var splitId = temp2[i].split("/");
          if(splitId[0] === background_id && splitId[1] === files_id){
            pass2 = pass2;
          }else{
            pass2 = [...pass2, temp2[i]];
          }
        }
        console.log("selected row+file id", temp2);
        setCheckedRows(pass2);
        // setPastedRows(pass);
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
          details
          name
        }
      }
    }
  }`;

  const qGetFileDownloadLink = `
  query getFileDownloadLink($id: ID) {
    file(id: $id) {
      downloadURL
    }
  }`;

  const pasteFilestoBackground = async (background_id) => {
    var temp = pastedRows;
    temp = [...temp, background_id];
    setPastedRows(temp);
    console.log("rows", temp);
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

    const filteredArr = arrCopyFiles.filter((el) => {
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

      const backgroundFilesOptReq = await API.graphql({
        query: qlistBackgroundFiles,
        variables: {
          id: background_id,
        },
      });

      if (backgroundFilesOptReq.data.background.files !== null) {
        const newFilesResult =
          backgroundFilesOptReq.data.background.files.items.map(
            ({ id, name, description }) => ({
              id: id,
              name: name,
              description: description,
            })
          );

        const updateArrFiles = background.map((obj) => {
          if (obj.id === background_id) {
            return { ...obj, files: { items: newFilesResult } };
          }
          return obj;
        });
        setBackground(updateArrFiles);
      }
    }

    setSelectedId(background_id);
    setTimeout(() => {
      setSelectedId(0);
    }, 2000);
  };

  const mCreateBackground = `
      mutation createBackground($briefId: ID, $description: String, $date: AWSDateTime, $order: Int) {
        backgroundCreate(briefId: $briefId, description: $description, date: $date, order: $order) {
          id
          createdAt
          date
          description
          order
        }
      }
      `;

  const mBulkUpdateBackgroundOrder = `
      mutation bulkUpdateBackgroundOrders($arrangement: [ArrangementInput]) {
        backgroundBulkUpdateOrders(arrangement: $arrangement) {
          id
          order
        }
      }`;

  const handlePasteRow = (targetIndex) => {
    let tempBackground = [...background];
    let arrFileResultBG = [];

    setCheckedState(new Array(background.length).fill(false));

    const storedItemRows = JSON.parse(localStorage.getItem("selectedRows"));
    var counter = 1;
    storedItemRows.map(async function (x) {
      const createBackgroundRow = await API.graphql({
        query: mCreateBackground,
        variables: {
          briefId: briefId,
          description: x.details,
          date: x.date,
          files: { items: [] },
          order: counter++,
        },
      });

      var arrResult = {
        createdAt: createBackgroundRow.data.backgroundCreate.createdAt,
        id: createBackgroundRow.data.backgroundCreate.id,
        files: { items: x.files.items },
        date: createBackgroundRow.data.backgroundCreate.date,
        description: createBackgroundRow.data.backgroundCreate.description,
        order: createBackgroundRow.data.backgroundCreate.order,
      };

      const arrId = [{ id: createBackgroundRow.data.backgroundCreate.id }];
      bgInput.push({ id: createBackgroundRow.data.backgroundCreate.id });
      arrFileResultBG.push(...[arrResult]);

      //const arrId = [{ id: createBackgroundRow.data.backgroundCreate.id }];

      const request = await API.graphql({
        query: mUpdateBackgroundFile,
        variables: {
          backgroundId: createBackgroundRow.data.backgroundCreate.id,
          files: x.files.items,
        },
      });
    });

    setTimeout(async function () {
      console.log("Updated Arr", sortByOrder(arrFileResultBG));

      sortByOrder(arrFileResultBG)
        .splice(0)
        .reverse()
        .map(async function (x) {
          var resultBG = {
            createdAt: x.createdAt,
            id: x.id,
            files: { items: x.files.items },
            date: x.date,
            description: x.description,
            order: x.order,
          };

          tempBackground.splice(targetIndex + 1, 0, resultBG);

          setBackground(tempBackground);
          setSelectRow([]);
          //setSelectedItems(arrId.map((x) => x.id));

          const result = tempBackground.map(({ id }, index) => ({
            id: id,
            order: index,
          }));

          console.log("Item", result);

          await API.graphql({
            query: mBulkUpdateBackgroundOrder,
            variables: {
              arrangement: result,
            },
          });
        });

      /*const arrayUpdated = arrFileResultBG.map(({ id }, index) => ({
        id: id,
        order: index,
      }));*/

      /*tempBackground.splice(targetIndex + 1, 0, arrFileResultBG);

      setBackground(tempBackground);
      setSelectRow([]);
      //setSelectedItems(arrId.map((x) => x.id));

      const result = tempBackground.map(({ id }, index) => ({
        id: id,
        order: index,
      }));

      await API.graphql({
        query: mBulkUpdateBackgroundOrder,
        variables: {
          arrangement: result,
        },
      });*/
    }, 1500);

    /*setTimeout(async function() {
      const result = tempBackground.map(({ id }, index) => ({
        id: id,
        order: index,
      }));

      await API.graphql({
        query: mBulkUpdateBackgroundOrder,
        variables: {
          arrangement: result,
        },
      });
    }, 1000);*/

    setShowDeleteButton(false);
    setPasteButton(false);
    setSelectRow([]);
    setSelectedItems([]);
    setSelectedRowsBG([]);
    localStorage.removeItem("selectedRows");

    setHoldPaste(true);
    setalertMessage("Successfully copied rows. Click HERE to undo action");
    setShowToast(true);

    setTimeout(() => {
      setShowToast(false);
    }, 9000);
  };

  function undoAction() {
    const newArr = Array(background.length).fill(false);
    setCheckedState(newArr);
    console.log("BI", bgInput);
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
        background: bgInput,
      },
    });

    setSelectedRowsBG([]);
    setSelectedItems([]);
    setcheckAllState(false);
    setHoldPaste(false);
    setSelectRow([]);

    setTimeout(() => {
      setShowToast(false);

      getBackground();
    }, 3000);
  }

  // const reOrderFiles = (array, tempBackground, targetIndex) => {
  //   const df = convertArrayToObject(array);

  //   tempBackground.splice(targetIndex + 1, 0, df.item);
  //   return setBackground(tempBackground);
  // };

  /*const handleBottomScroll = useCallback(() => {
    console.log("Reached bottom page " + Math.round(performance.now()));
    setTimeout(() => {
      setLoading(true);
    }, 200);
    setTimeout(() => {
      loadMoreBackground();
      setLoading(false);
    }, 400);
  });

  useBottomScrollListener(handleBottomScroll);*/

  const createObject = (array, key) => {
    const initialValue = {};
    return array.reduce((obj, item) => {
      return {
        ...obj,
        [item[key]]: item,
      };
    }, initialValue);
  };

  const mUpdateMatterFileDesc = `
      mutation updateMatterFile ($id: ID, $details: String) {
        matterFileUpdate(id: $id, details: $details) {
          id
          details
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

  const handleSyncData = async (backgroundId, fileId) => {
    var filteredBackground = background.filter(function (item) {
      return item.id === backgroundId;
    });

    const dateRequest = API.graphql({
      query: mUpdateMatterFileDate,
      variables: {
        id: fileId,
        date:
          filteredBackground[0].date !== null &&
          filteredBackground[0].date !== "null" &&
          filteredBackground[0].date !== ""
            ? moment
                .utc(moment(new Date(filteredBackground[0].date), "YYYY-MM-DD"))
                .toISOString()
            : null,
      },
    });

    if (!dateRequest) {
      console.log("Error", dateRequest);
    }

    const descRequest = API.graphql({
      query: mUpdateMatterFileDesc,
      variables: {
        id: fileId,
        details: filteredBackground[0].description,
      },
    });

    if (!descRequest) {
      console.log("Error", descRequest);
    }

    setalertMessage(`Successfully synced to File Bucket `);
    setShowToast(true);
    setTimeout(() => {
      setShowToast(false);
    }, 2000);
  };

  function utf8_to_b64(str) {
    return window.btoa(unescape(encodeURIComponent(str)));
  }

  //UPLOADING FILE THROUGH BG
  function attachFiles(itemid) {
    setShowUploadModal(true);
    setSelectedRowID(itemid);
  }

  //single matter upload
  const mCreateMatterFile = `
  mutation createMatterFile ($matterId: ID, $s3ObjectKey: String, $size: Int, $type: String, $name: String, $order: Int) {
      matterFileCreate(matterId: $matterId, s3ObjectKey: $s3ObjectKey, size: $size, type: $type, name: $name, order: $order) {
        id
        name
        order
      }
    }
  `;

  var idTag = [];
  //UPLOAD FILES IN FILEBUCKET FROM BACKGROUND
  const handleUploadLink = (uf) => {
    var uploadedFiles = uf.files.map((f) => ({ ...f, matterId: matterId }));

    //Add order to new files
    var sortedFiles = uploadedFiles.sort(
      (a, b) => b.oderSelected - a.oderSelected
    );

    var addOrder = sortedFiles.map((x) => ({ ...x, order: 0 }));
    // console.log("SF",sortedFiles);
    console.log("AO",addOrder);

    //insert in matter file list
    bulkCreateMatterFile(addOrder);

      //set background content
      setTimeout(() => {
        const backgroundFilesOptReq = API.graphql({
          query: qlistBackgroundFiles,
          variables: {
            id: selectedRowId,
          },
        }).then((result) => {
          console.log("THIS", result);
  
          var newFilesResult =
          result.data.background.files.items.map(
              ({ id, name, description }) => ({
                id: id,
                name: name,
                description: description,
              })
            );
    
          var updateArrFiles = background.map((obj) => {
            if (obj.id === selectedRowId) {
              return { ...obj, files: { items: newFilesResult } };
            }
            return obj;
          });
    
          console.log("new filess", newFilesResult);
          setBackground(updateArrFiles);
        });
      }, 3000);

    setalertMessage(`File has been added! Go to File bucket`);
    setShowToast(true);
    setGoToFileBucket(true);
    //getBackground();

    handleModalClose();
    setTimeout(() => {
      setShowToast(false);
      setGoToFileBucket(false);
    }, 5000);
  };


  function createMatterFile(param) {
  //don't delete for single upload trial
    const request = API.graphql({
      query: mCreateMatterFile,
      variables: param,
    });

    console.log("result", request);
  }

  const mBulkCreateMatterFile = `
    mutation bulkCreateMatterFile ($files: [MatterFileInput]) {
      matterFileBulkCreate(files: $files) {
        id
        name
        order
      }
    }
  `;
  
  async function bulkCreateMatterFile(param) {
    console.log("bulkCreateMatterFile");

    param.forEach(function (i) {
      delete i.oderSelected; // remove orderSelected
    });
    
    setTimeout(async () => {
      const request = await API.graphql({
        query: mBulkCreateMatterFile,
        variables: {
          files: param,
        },
      });
    

    console.log("result", request);

    if (request.data.matterFileBulkCreate !== null) {
      request.data.matterFileBulkCreate.map((i) => {
        return (idTag = [...idTag, { id: i.id }]);
      });
    }

    console.log("iDTag", idTag);

    const mUpdateBackgroundFile = `
    mutation addBackgroundFile($backgroundId: ID, $files: [FileInput]) {
      backgroundFileTag(backgroundId: $backgroundId, files: $files) {
        id
      }
    }
  `;

    //append in existing
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

    let arrFiles = [];
    let arrFileResult = [];
    const seen = new Set();

    // console.log("MID/BID", background_id);

    const backgroundFilesOpt = await API.graphql({
      query: qlistBackgroundFiles,
      variables: {
        id: selectedRowId,
      },
    });

    if (backgroundFilesOpt.data.background.files !== null) {
      arrFileResult = backgroundFilesOpt.data.background.files.items.map(
        ({ id }) => ({
          id: id,
        })
      );

      idTag.push(...arrFileResult);
      console.log("updatedidtag", idTag);

      const filteredArr = idTag.filter((el) => {
        const duplicate = seen.has(el.id);
        seen.add(el.id);
        return !duplicate;
      });

      console.log("rowid", selectedRowId);

      API.graphql({
        query: mUpdateBackgroundFile,
        variables: {
          backgroundId: selectedRowId,
          files: filteredArr,
        },
      });
    } else {
      API.graphql({
        query: mUpdateBackgroundFile,
        variables: {
          backgroundId: selectedRowId,
          files: idTag,
        },
      });
    }
  }, 1000);
    //return request;
  }

  const handleKeyUp = (e) => {
    if (e.key === "Shift" && isShiftDown) {
      setIsShiftDown(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Shift" && !isShiftDown) {
      setIsShiftDown(true);
    }
  };

  const handleSelectItem = (e, index) => {
    const { value } = e.target;
    const nextValue = getNextValue(value);
    setSelectedItems(nextValue);
    setLastSelectedItem(value);

    if (nextValue.length > 0) {
      const isf1 = background.filter((item) => nextValue.includes(item.id));
      const xBackground = isf1.map(({ id, date, description, files }) => ({
        id,
        date,
        details: description,
        files,
      }));
      setSelectRow(xBackground);
      setShowDeleteButton(true);
      setSrcIndex(index);

      const ids = xBackground.map(({ id }) => ({
        id,
        fileName: "",
      }));
      setSelectedRowsBG(ids);
      selectedRowsBGPass = ids;
    } else {
      setShowDeleteButton(false);
      setSelectRow([]);
      setSrcIndex("");
      setSelectedRowsBG([]);
      selectedRowsBGPass = [];
    }
  };

  const getNextValue = (value) => {
    const hasBeenSelected = !selectedItems.includes(value);

    if (isShiftDown) {
      const newSelectedItems = getNewSelectedItems(value);

      const selections = [...new Set([...selectedItems, ...newSelectedItems])];

      if (!hasBeenSelected) {
        return selections.filter((item) => !newSelectedItems.includes(item));
      }

      return selections;
    }

    // if it's already in there, remove it, otherwise append it
    return selectedItems.includes(value)
      ? selectedItems.filter((item) => item !== value)
      : [...selectedItems, value];
  };

  const getNewSelectedItems = (value) => {
    const currentSelectedIndex = background.findIndex(
      (item) => item.id === value
    );
    const lastSelectedIndex = background.findIndex(
      (item) => item.id === lastSelectedItem
    );

    return background
      .slice(
        Math.min(lastSelectedIndex, currentSelectedIndex),
        Math.max(lastSelectedIndex, currentSelectedIndex) + 1
      )
      .map((item) => item.id);
  };

  useEffect(() => {
    document.addEventListener("keyup", handleKeyUp, false);
    document.addEventListener("keydown", handleKeyDown, false);

    return () => {
      document.removeEventListener("keyup", handleKeyUp);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [handleKeyUp, handleKeyDown]);

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

      let concatResult = background.concat(result);

      setBackground((background) => concatResult);


      const rowArrangement = concatResult.map(({ id }, index) => ({
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
      setCheckedState(new Array(concatResult.length).fill(false));
      setSelectedRowsBG([]);
      setShowDeleteButton(false);

      setBackground(concatResult);
    }
  };

  function rowClicked(itemid) {
    const found = pastedRows.find(element => element.split("/")[0] === itemid);
    return found;
  }

  function rowOriginal(rowid) {
    const currRow = checkedRows.find(element => element.split("/")[0] === rowid);
    
    return currRow;
  }

  return (
    <ThemeProvider>
      <div className="px-7">
        <div className="-my-2 sm:-mx-6 lg:-mx-8">
          <div className="py-2 align-middle inline-block min-w-full sm:px-6 lg:px-8">
            <div className="shadow border-b align-center border-gray-200 sm:rounded-lg">
              {wait === false ? (
                // <span className="py-5 px-5">Please wait...</span>
                <Loading />
              ) : background.length === 0 &&
                (searchDescription === undefined ||
                  searchDescription === "") ? (
                <EmptyRow search={search} />
              ) : (
                <>
                  <ScrollToTop
                    smooth
                    color="rgb(117, 117, 114);"
                    style={{ padding: "0.4rem" }}
                  />
                  {background !== null && background.length !== 0 ? (
                    <DragDropContext onDragEnd={handleDragEnd}>
                      <table className="table-fixed min-w-full divide-y divide-gray-200 text-xs">
                        <thead
                          className="bg-gray-100 z-10"
                          style={{ position: "sticky", top: "190px" }}
                        >
                          <tr>
                            <th className="px-2 py-4 text-center whitespace-nowrap w-8">
                            Item No.
                            </th>
                            {checkDate && (
                              <th className="px-2 py-4 text-center whitespace-nowrap w-8">
                                Date &nbsp;
                                {(() => {
                                  if (ascDesc == null) {
                                    return (
                                      <FaSort
                                        className="mx-auto inline-block"
                                        alt="Sort"
                                        title="Sort"
                                        onClick={SortBydate}
                                        style={{ cursor: "pointer" }}
                                      />
                                    );
                                  } else if (ascDesc === true) {
                                    return (
                                      <BsSortUpAlt
                                        className="mx-auto inline-block"
                                        alt="Sort"
                                        title="Sort"
                                        onClick={SortBydate}
                                        style={{ cursor: "pointer" }}
                                      />
                                    );
                                  } else if (ascDesc === false) {
                                    return (
                                      <BsSortDown
                                        className="mx-auto inline-block"
                                        alt="Sort"
                                        title="Sort"
                                        onClick={SortBydate}
                                        style={{ cursor: "pointer" }}
                                      />
                                    );
                                  }
                                })()}
                              </th>
                            )}
                            {checkDesc && (
                              <th className="px-2 py-4 text-center whitespace-nowrap w-4/6">
                                Description of Background
                              </th>
                            )}
                            {checkDocu && (
                              <th className="px-2 py-4 text-center whitespace-nowrap w-1/6">
                                Document
                              </th>
                            )}
                          </tr>
                        </thead>
                        <Droppable droppableId="tbl-backgrounds">
                          {(provider) => (
                            <tbody
                              ref={provider.innerRef}
                              {...provider.droppableProps}
                              className="bg-white divide-y divide-gray-200"
                              style={{width:"100%", height:"100vh"}}
                            >
                              <WindowScroller>
                              {({ height, scrollTop }) => (
                                <AutoSizer disableHeight>
                                {({ width }) => (
                                  <List
                                  autoHeight
                                  scrollTop={scrollTop}
                                  width={width}
                                  height={height}
                                  rowHeight={cache.current.rowHeight}
                                  deferredMeasurementCache={cache.current}
                                  rowCount={background.length}
                                  rowRenderer={({ key, index, style, parent }) => {
                                    const item = background[index];
                                    return (
                                      <CellMeasurer 
                                      key={key} 
                                      cache={cache.current} 
                                      parent={parent} 
                                      rowIndex={index} 
                                      columnIndex={0}
                                      >
                                        <div 
                                        style={{
                                          ...style,
                                          width: "100%",
                                          height: "100%",
                                          border: '1px solid #f0f0f0', 
                                        }}
                                        >
                                          <Draggable
                                            key={item.id + "-" + index}
                                            draggableId={item.id + "-" + index}
                                            index={index}
                                          >
                                            {(provider, snapshot) => (
                                              <tr
                                                className={
                                                  selectRow.find(
                                                    (x) => x.id === item.id
                                                  ) && holdDelete
                                                    ? "hidden"
                                                    : selectRow.find(
                                                        (x) => x.id === item.id
                                                      )
                                                    ? "bg-green-300"
                                                    : (index === highlightRow - 1
                                                    )
                                                    ? "bg-green-300"
                                                    : ""
                                                }
                                                index={index}
                                                key={item.id}
                                                {...provider.draggableProps}
                                                ref={provider.innerRef}
                                                style={{
                                                  ...provider.draggableProps.style,
                                                  backgroundColor:
                                                    snapshot.isDragging ||
                                                    item.id === selected
                                                      ? "rgba(255, 255, 239, 0.767)"
                                                      : "",
                                                }}
                                              >
                                                <td
                                                  {...provider.dragHandleProps}
                                                  className="px-1 py-3 align-top w-8"
                                                >
                                                  <div className="flex items-center ">
                                                    <MdDragIndicator
                                                      className="text-2xl"
                                                      onClick={() =>
                                                        handleChageBackground(item.id)
                                                      }
                                                    />
                                                    <input
                                                      className="cursor-pointer mr-1"
                                                      onChange={handleSelectItem}
                                                      type="checkbox"
                                                      checked={selectedItems.includes(
                                                        item.id
                                                      )}
                                                      value={item.id}
                                                      id={`item-${item.id}`}
                                                    />
                                                    <label
                                                      htmlFor="checkbox-1"
                                                      className="text-sm font-medium text-gray-900 dark:text-gray-300 ml-1"
                                                    >
                                                      {index + 1}
                                                      {/* &nbsp;&mdash;&nbsp; {item.order} */}
                                                    </label>
                                                  </div>
                                                </td>
    
                                                {checkDate && (
                                                  <td
                                                    className="align-top py-3 w-8"
                                                    {...provider.dragHandleProps}
                                                  >
                                                    <div>
                                                      <DatePicker
                                                        className="border w-28 rounded text-xs py-2 px-1 border-gray-300 mb-5 z-50"
                                                        selected={
                                                          item.date !== null &&
                                                          item.date !== "null" &&
                                                          item.date !== ""
                                                            ? new Date(item.date)
                                                            : null
                                                        }
                                                        dateFormat="dd MMM yyyy"
                                                        placeholderText="No Date"
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
                                                    className="px-2 py-3 align-top place-items-center relative w-4/6 max-w-xs"
                                                  >
                                                    {/* <RFIEditor item={item} /> */}
                                                    <div
                                                      className="p-2 w-full h-full font-poppins"
                                                      style={{
                                                        cursor: "auto",
                                                        outlineColor:
                                                          "rgb(204, 204, 204, 0.5)",
                                                        outlineWidth: "thin",
                                                        minHeight: "150px",
                                                        maxHeight: "150px",
                                                        overflow: "auto",
                                                      }}
                                                      suppressContentEditableWarning
                                                      onClick={(event) =>
                                                        handleDescContent(
                                                          event,
                                                          item.description,
                                                          item.id
                                                        )
                                                      }
                                                      dangerouslySetInnerHTML={{
                                                        __html: item.description,
                                                      }}
                                                      onInput={(event) =>
                                                        handleChangeDesc(event)
                                                      }
                                                      onBlur={(e) =>
                                                        handleSaveDesc(
                                                          e,
                                                          item.description,
                                                          item.date,
                                                          item.id,
                                                          index
                                                        )
                                                      }
                                                      contentEditable={true}
                                                    ></div>
                                                    <span className="text-red-400 filename-validation">
                                                      {item.id === descId && descAlert}
                                                    </span>
                                                  </td>
                                                )}
                                                {checkDocu && (
                                                  <td
                                                    {...provider.dragHandleProps}
                                                    className="py-3 px-3 text-sm text-gray-500 align-top w-1/6 whitespace-nowrap"
                                                  >
                                                    {selectRow.find(
                                                      (x) => x.id === item.id
                                                    ) && (
                                                      <div className="separator">
                                                        ROW SELECTED
                                                      </div>
                                                    )}
                                                    {!activateButton ? (
                                                      !activateButton &&
                                                      selectRow.find(
                                                        (x) => x.id === item.id
                                                      ) ? (
                                                        <button></button>
                                                      ) : (
                                                        <span className="flex">
                                                          <button
                                                            className=" w-60 bg-green-400 border border-transparent rounded-md py-2 px-4 mr-3 flex items-center justify-center text-base font-medium text-white hover:bg-white hover:text-green-500 hover:border-green-500 focus:outline-none "
                                                            onClick={() =>
                                                              attachFiles(item.id)
                                                            }
                                                          >
                                                            Upload File +
                                                          </button>
    
                                                          <button
                                                            className=" w-15 bg-white border border-green-400 rounded-md py-2 px-4 mr-3 flex items-center justify-center text-green-400 font-medium text-white  focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                                                            onClick={() =>
                                                              (window.location = `${
                                                                AppRoutes.FILEBUCKET
                                                              }/${matterId}/${briefId}/?matter_name=${utf8_to_b64(
                                                                matter_name
                                                              )}&client_name=${utf8_to_b64(
                                                                client_name
                                                              )}&background_id=${
                                                                item.id
                                                              }`)
                                                            }
                                                          >
                                                            <BsFillBucketFill />
                                                          </button>
                                                        </span>
                                                      )
                                                    ) : (
                                                      <span>
                                                      <button
                                                        className={
                                                          checkedRows.length === 0 || rowOriginal(item.id) || rowClicked(item.id)
                                                          ? "w-60 bg-gray-300 border border-gray-500 text-gray-500 rounded-md py-2 px-4 mr-3 flex items-center justify-center text-base font-medium "
                                                          : "w-60 bg-green-400 border border-transparent rounded-md py-2 px-4 mr-3 flex items-center justify-center text-base font-medium text-white hover:bg-green-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                                                        }
                                                        onClick={
                                                          rowClicked(item.id) || rowClicked(item.id) || checkedRows.length === 0 
                                                          ? null 
                                                          : () => {
                                                          pasteFilestoBackground(
                                                            item.id
                                                          );
                                                          }
                                      
                                                        }
                                                        // disabled={rowClicked(item.id) ? true : false}
                                                        data-tip data-for={item.id}
                                                      >
                                                        {" "}
                                                        {
                                                        checkedRows.length === 0 
                                                        ? "Select a file"
                                                        : rowOriginal(item.id) 
                                                        ? "Copied"
                                                        : rowClicked(item.id)
                                                        ? "Pasted"
                                                        : "Paste"}
                                                        &nbsp;
                                                        <FaPaste />
                                                      </button>
                                                      {
                                                      (rowClicked(item.id) || rowOriginal(item.id))
                                                      &&
                                                      <ReactTooltip id={item.id} place="bottom" effect="solid">
                                                        Cannot paste files in this row
                                                      </ReactTooltip>
                                                      }
                                                      </span>
                                
                                                    )}
                                                    {item.files.items === null ||
                                                    item.files.items.length === 0 ? (
                                                      <>
                                                        <br />
                                                        <p className="text-xs">
                                                          <b>No items yet</b>
                                                        </p>
                                                        <p className="text-xs">
                                                          Select from the files bucket
                                                          to start adding one row
                                                        </p>
                                                      </>
                                                    ) : (
                                                      <>
                                                        <div>
                                                          <br />
                                                          <span className="font-bold">
                                                            Files Selected
                                                          </span>
                                                          <br />
                                                          <br />
                                                          
                                                          <div
                                                            style={{
                                                              minHeight: "130px",
                                                              maxHeight: "130px",
                                                              overflow: "auto"
                                                            }}
                                                          >
                                                          {item.files.items.map(
                                                            (items, index) =>
                                                              items &&
                                                              items.length !== 0 && (
                                                                <span key={items.id}>
                                                                  <ReactTooltip
                                                                    type="dark"
                                                                    place="bottom"
                                                                    effect="float"
                                                                    key={
                                                                      "rt" +
                                                                      items.id +
                                                                      "-" +
                                                                      index
                                                                    }
                                                                  />
                                                                  <p
                                                                    className={
                                                                      selectedFileId ===
                                                                        items.id &&
                                                                      holdDeleteFile
                                                                        ? "hidden"
                                                                        : "break-normal border-dotted border-2 border-gray-500 p-1 rounded-lg mb-2 bg-gray-100"
                                                                    }
                                                                  >
                                                                    {activateButton ? (
                                                                      <input
                                                                        type="checkbox"
                                                                        name={
                                                                          items.uniqueId
                                                                        }
                                                                        className="cursor-pointer w-10 inline-block align-middle"
                                                                        onChange={(
                                                                          event
                                                                        ) =>
                                                                          handleFilesCheckboxChange(
                                                                            event,
                                                                            items.id +
                                                                              item.id,
                                                                            items.id,
                                                                            item.id
                                                                          )
                                                                        }
                                                                      />
                                                                    ) : (
                                                                      ""
                                                                    )}
                                                                    {items.name !==
                                                                      null &&
                                                                      items.name !==
                                                                        "" && (
                                                                        <span
                                                                          className="align-middle cursor-pointer"
                                                                          data-tip={
                                                                            items.name
                                                                          }
                                                                        >
                                                                          {items.name.substring(
                                                                            0,
                                                                            15
                                                                          )}
                                                                        </span>
                                                                      )}
                                                                    &nbsp;
                                                                    <AiOutlineDownload
                                                                      className="text-blue-400 mx-1 text-2xl cursor-pointer inline-block"
                                                                      onClick={() =>
                                                                        previewAndDownloadFile(
                                                                          items.id
                                                                        )
                                                                      }
                                                                    />
                                                                    {activateButton ? (
                                                                      <BsFillTrashFill
                                                                        className="text-red-400 hover:text-red-500 my-1 text-1xl cursor-pointer inline-block float-right"
                                                                        onClick={() =>
                                                                          "align-middle cursor-pointer"(
                                                                            items.id,
                                                                            item.id
                                                                          )
                                                                        }
                                                                      />
                                                                    ) : (
                                                                      <BsFillTrashFill
                                                                        className="text-gray-400 hover:text-red-500 my-1 text-1xl cursor-pointer inline-block float-right"
                                                                        onClick={() =>
                                                                          showModal(
                                                                            items.id,
                                                                            item.id
                                                                          )
                                                                        }
                                                                      />
                                                                    )}
                                                                    <FaSync
                                                                      className="text-gray-400 hover:text-blue-400 mx-1 mt-1.5 text-sm cursor-pointer inline-block float-right"
                                                                      title="Sync Date and Description to File Bucket"
                                                                      onClick={() =>
                                                                        handleSyncData(
                                                                          item.id,
                                                                          items.id
                                                                        )
                                                                      }
                                                                    >
                                                                      {" "}
                                                                    </FaSync>
                                                                  </p>
                                                                </span>
                                                              )
                                                          )}
                                                          </div>
                                                        </div>
                                                      </>
                                                    )}
                                                  </td>
                                                )}
                                              </tr>
                                            )}
                                          </Draggable>
                                          {pasteButton && selectRow.length >= 0 && (
                                            <tr
                                              style={{
                                                border: "rgb(0, 204, 0) 2px dashed",
                                                cursor: "pointer",
                                              }}
                                              onClick={() => handlePasteRow(index)}
                                              className="hover:bg-green-500 hover:text-white"
                                            >
                                              <td></td>
                                              <td></td>
                                              <td className="text-center">
                                                <h1>PASTE HERE</h1>
                                              </td>
                                              <td></td>
                                            </tr>
                                          )}
                                        </div>
                                      </CellMeasurer>
                                    );
                                  }}
                                />
                                )}
                              </AutoSizer>
                              )}
                              </WindowScroller>
                              {provider.placeholder}
                            </tbody>
                          )}
                        </Droppable>
                      </table>
                    </DragDropContext>
                  ) : (
                    <div className="p-5 px-5 py-1 left-0">
                      <div className="w-full h-42 mb-6 py-1 px-1 grid justify-items-center">
                        <NoResultState
                          searchKey={searchDescription}
                          message={
                            "Check the spelling, try a more general term or look up a specific File."
                          }
                        />
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      <div>
          {/* {maxLoading && wait ? (
            <>
            <div className="mt-1">
              <button className="bg-green-400 hover:bg-green-500 text-white text-sm p-3 rounded-full inline-flex items-center border-0 shadow outline-none focus:outline-none focus:ring mx-2"
              onClick={handleAddRow}
              >
                <FaPlus />
              </button>
            </div>
            <div className="flex justify-center items-center mt-5">
              <p>All data has been loaded.</p>
            </div>
            </>
          ) : background.length >= 50 && wait ? (
            <div className="flex justify-center items-center mt-5">
              <img src={imgLoading} alt="" width={50} height={100} />
            </div>
          ) : (
            <span></span>
          )} */}

          {/* {!maxLoading && loading ? (
            <span className="grid"></span>
          ) : (
            <span></span>
          )} */}
        </div>
        <div className="p-2"></div>
        </div>
      {showUploadModal && (
        <UploadLinkModal
          title={""}
          handleSave={handleUploadLink}
          bucketName={matterId}
          handleModalClose={handleModalClose}
        />
      )}
      {ShowModalParagraph && (
        <ModalParagraph
          setShowModalParagraph={setShowModalParagraph}
          getBackground={getBackground}
          paragraph={paragraph}
          setParagraph={setParagraph}
          setCheckedState={setCheckedState}
          background={background}
          setSelectedRowsBG={setSelectedRowsBG}
          setShowDeleteButton={setShowDeleteButton}
          API={API}
          matterId={matterId}
          setcheckAllState={setcheckAllState}
          briefId={briefId}
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
        <div
          onClick={
            goToFileBucket
              ? () =>
                  (window.location = `${
                    AppRoutes.FILEBUCKET
                  }/${matterId}/000/?matter_name=${utf8_to_b64(
                    matter_name
                  )}&client_name=${utf8_to_b64(client_name)}`)
              : holdPaste
              ? () => undoAction()
              : holdDeleteFile
              ? () => undoDeleteFile()
              : null
          }
        >
          <ToastNotification title={alertMessage} hideToast={hideToast} />
        </div>
      )}
    </ThemeProvider>
  );
};

export default TableInfo;