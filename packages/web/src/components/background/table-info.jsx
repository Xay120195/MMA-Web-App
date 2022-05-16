import React, { useState, useEffect, useCallback, useRef } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { Link } from "react-router-dom";
import { AppRoutes } from "../../constants/AppRoutes";
import ToastNotification from "../toast-notification";
import { AiOutlineDownload } from "react-icons/ai";
import { FaPaste, FaSync } from "react-icons/fa";
import { BsFillTrashFill, BsFillBucketFill } from "react-icons/bs";
import EmptyRow from "./empty-row";
import { ModalParagraph } from "./modal";
import { API } from "aws-amplify";
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";
import { MdDragIndicator } from "react-icons/md";
import RemoveModal from "../delete-prompt-modal";
import { useHistory, useLocation } from "react-router-dom";
import barsFilter from "../../assets/images/bars-filter.svg";
import { useBottomScrollListener } from "react-bottom-scroll-listener";
import imgLoading from "../../assets/images/loading-circle.gif";
import "../../assets/styles/background.css";
import ScrollToTop from "react-scroll-to-top";
import UploadLinkModal from "../file-bucket/file-upload-modal";

export let selectedRowsBGPass = [],
  selectedRowsBGFilesPass = [];

const TableInfo = ({
  witness,
  files,
  wait,
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
  newWitness,
  setPasteButton,
  setNewRow,
  loading,
  setLoading,
  maxLoading,
  sortByOrder,
  briefId,
}) => {
  let temp = selectedRowsBG;
  let tempFiles = selectedRowsBGFiles;
  const [showToast, setShowToast] = useState(false);
  const [alertMessage, setalertMessage] = useState();

  const [selected, setSelected] = useState("");
  const [descId, setDescId] = useState("");
  const [textDesc, setTextDesc] = useState("");
  const [descAlert, setDescAlert] = useState("");
  const [updateProgess, setUpdateProgress] = useState(false);
  const [showRemoveFileModal, setshowRemoveFileModal] = useState(false);
  const [selectedFileBG, setselectedFileBG] = useState([]);
  const [highlightRows, setHighlightRows] = useState("bg-green-200");
  const [sortByDate, setSortByDate] = useState([]);

  const [selectedRowId, setSelectedRowID] = useState(null);
  const [goToFileBucket, setGoToFileBucket] = useState(false);
  const [showUploadModal, setShowUploadModal] = useState(false);

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
    const updateArr = witness.map((obj) => {
      if (obj.id === id) {
        return { ...obj, description: e.target.innerHTML };
      }
      return obj;
    });
    setWitness(updateArr);

    if (textDesc.length <= 0) {
      setDescAlert("description can't be empty");
    } else if (textDesc === description) {
      setDescAlert("");

      setalertMessage(`Saving in progress..`);
      setShowToast(true);

      const data = {
        description: e.target.innerHTML,
      };

      const success = await updateBackgroundDesc(id, data);
      if (success) {
        setalertMessage(`Successfully updated `);
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
        setalertMessage(`Successfully updated`);
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

    const updatedOSArray = witness.map((p) =>
      p.id === id ? { ...p, date: data.date } : p
    );

    setWitness(updatedOSArray);
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
    return new Promise((resolve, reject) => {
      try {
        const request = API.graphql({
          query: mUpdateBackgroundDate,
          variables: {
            id: id,
            date: data.date !== null ? new Date(data.date).toISOString() : null,
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
    let tempWitness = [...witness];

    let [selectedRow] = tempWitness.splice(e.source.index, 1);

    tempWitness.splice(e.destination.index, 0, selectedRow);
    setWitness(tempWitness);

    const res = tempWitness.map(({ id }, index) => ({
      id: id,
      order: index,
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

          const updateArrFiles = witness.map((obj) => {
            if (obj.id === item[0].backgroundId) {
              return { ...obj, files: { items: newFilesResult } };
            }
            return obj;
          });

          console.log(newFilesResult);
          setWitness(updateArrFiles);
        }
      }, 1000);
    }

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

  const SortBydate = async () => {
    if (!ascDesc) {
      console.log("f");
      setAscDesc(true);
      setWitness(
        witness.slice().sort((a, b) => new Date(a.date) - new Date(b.date))
      );
      console.log(
        witness.slice().sort((a, b) => new Date(a.date) - new Date(b.date))
      );
    } else {
      console.log("t");
      setAscDesc(false);
      setWitness(
        witness.slice().sort((a, b) => new Date(b.date) - new Date(a.date))
      );
      console.log(
        witness.slice().sort((a, b) => new Date(b.date) - new Date(a.date))
      );
    }
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

        const updateArrFiles = witness.map((obj) => {
          if (obj.id === background_id) {
            return { ...obj, files: { items: newFilesResult } };
          }
          return obj;
        });
        setWitness(updateArrFiles);
      }
    }

    setSelectedId(background_id);
    setTimeout(() => {
      setSelectedId(0);
    }, 2000);
  };

  const handleSelected = (date) => {
    return new Date(date);
  };

  const convertArrayToObject = (array) => {
    const initialValue = {};
    return array.reduce((obj, item) => {
      return {
        ...obj,
        item: item,
      };
    }, initialValue);
  };

  const handlePasteRow = (targetIndex) => {
    let tempWitness = [...witness];
    let arrCopyFiles = [];
    let arrFileResult = [];

    setCheckedState(new Array(witness.length).fill(false));
    const storedItemRows = JSON.parse(localStorage.getItem("selectedRows"));

    storedItemRows.map(async function (x) {
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

      const createBackgroundRow = await API.graphql({
        query: mCreateBackground,
        variables: {
          clientMatterId: matterId,
          description: x.details,
          date: null,
          files: { items: [] },
        },
      });

      arrFileResult = [
        {
          createdAt: createBackgroundRow.data.backgroundCreate.createdAt,
          id: createBackgroundRow.data.backgroundCreate.id,
          files: { items: [] },
          date: createBackgroundRow.data.backgroundCreate.date,
          description: createBackgroundRow.data.backgroundCreate.description,
          order: createBackgroundRow.data.backgroundCreate.order,
        },
      ];

      arrCopyFiles = newWitness.map(({ id }) => ({
        id: id,
      }));

      if (arrCopyFiles.length <= 0) {
        const acdc = convertArrayToObject(arrFileResult);
        tempWitness.splice(targetIndex + 1, 0, acdc.item);
        setWitness(tempWitness);

        setSelectRow(arrFileResult);

        const result = tempWitness.map(({ id }, index) => ({
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
      } else {
        const request = await API.graphql({
          query: mUpdateBackgroundFile,
          variables: {
            backgroundId: createBackgroundRow.data.backgroundCreate.id,
            files: arrCopyFiles,
          },
        });
        const backgroundFilesOptReq = await API.graphql({
          query: qlistBackgroundFiles,
          variables: {
            id: createBackgroundRow.data.backgroundCreate.id,
          },
        });
        const updateArrFiles = arrFileResult.map((obj) => {
          if (obj.id === request.data.backgroundFileTag.id) {
            return {
              ...obj,
              files: backgroundFilesOptReq.data.background.files,
            };
          }
          return obj;
        });
        const newFiles = convertArrayToObject(updateArrFiles);
        tempWitness.splice(targetIndex + 1, 0, newFiles.item);
        setWitness(tempWitness);
        setSelectRow(updateArrFiles);
        const result = tempWitness.map(({ id }, index) => ({
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
      }
    });

    setShowDeleteButton(false);
    setPasteButton(false);
    setTimeout(() => {
      setSelectRow([]);
      setNewRow([]);
      setSrcIndex("");
      localStorage.removeItem("selectedRows");
    }, 10000);
  };

  // const reOrderFiles = (array, tempWitness, targetIndex) => {
  //   const df = convertArrayToObject(array);

  //   tempWitness.splice(targetIndex + 1, 0, df.item);
  //   return setWitness(tempWitness);
  // };
  const handleBottomScroll = useCallback(() => {
    console.log("Reached bottom page " + Math.round(performance.now()));
    setTimeout(() => {
      setLoading(true);
    }, 300);
    setTimeout(() => {
      loadMoreBackground();
      setLoading(false);
    }, 1000);
  });

  useBottomScrollListener(handleBottomScroll);

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
    var filteredWitness = witness.filter(function (item) {
      return item.id === backgroundId;
    });

    const dateRequest = API.graphql({
      query: mUpdateMatterFileDate,
      variables: {
        id: fileId,
        date:
          filteredWitness[0].date !== null &&
          filteredWitness[0].date !== "null" &&
          filteredWitness[0].date !== ""
            ? new Date(filteredWitness[0].date).toISOString()
            : null,
      },
    });

    const descRequest = API.graphql({
      query: mUpdateMatterFileDesc,
      variables: {
        id: fileId,
        details: filteredWitness[0].description,
      },
    });

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
  function attachFiles(id) {
    setShowUploadModal(true);
    setSelectedRowID(id);
  }

  var idTag = [];
  //UPLOAD FILES IN FILEBUCKET FROM BACKGROUND
  const handleUploadLink = async (uf) => {
    var uploadedFiles = uf.files.map((f) => ({ ...f, matterId: matterId }));

    //Add order to new files
    var sortedFiles = uploadedFiles.sort(
      (a, b) => b.oderSelected - a.oderSelected
    );

    var addOrder = sortedFiles.map((x) => ({ ...x, order: 0 }));
    // console.log("SF",sortedFiles);
    // console.log("AO",addOrder);

    //insert in matter file list
    await bulkCreateMatterFile(addOrder);

    console.log("idtag", idTag);

    //set witness content
    setTimeout(async () => {
      const backgroundFilesOptReq = await API.graphql({
        query: qlistBackgroundFiles,
        variables: {
          id: selectedRowId,
        },
      });

      // if (backgroundFilesOptReq.data.background.files !== null) {
      const newFilesResult =
        backgroundFilesOptReq.data.background.files.items.map(
          ({ id, name, description }) => ({
            id: id,
            name: name,
            description: description,
          })
        );

      const updateArrFiles = witness.map((obj) => {
        if (obj.id === selectedRowId) {
          return { ...obj, files: { items: newFilesResult } };
        }
        return obj;
      });

      console.log("new filess", newFilesResult);
      setWitness(updateArrFiles);
      // }
    }, 3000);

    setalertMessage(`File has been added! Go to File bucket`);
    setShowToast(true);
    setGoToFileBucket(true);

    handleModalClose();
    setTimeout(() => {
      setShowToast(false);
      setGoToFileBucket(false);
    }, 5000);
  };

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

      console.log("no duplicate file", filteredArr);

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

    //return request;
  }

  return (
    <>
      <div style={{ padding: "2rem", marginLeft: "4rem" }}>
        <div className="-my-2 sm:-mx-6 lg:-mx-8">
          <div className="py-2 align-middle inline-block min-w-full sm:px-6 lg:px-8">
            <div className="shadow border-b border-gray-200 sm:rounded-lg">
              {wait === false ? (
                <span className="py-5 px-5">Please wait...</span>
              ) : witness.length === 0 ? (
                <EmptyRow search={search} />
              ) : (
                <>
                  <ScrollToTop
                    smooth
                    color="rgb(117, 117, 114);"
                    style={{ padding: "0.4rem" }}
                  />
                  <DragDropContext onDragEnd={handleDragEnd}>
                    <table className="table-fixed min-w-full divide-y divide-gray-200 text-xs">
                      <thead
                        className="bg-gray-100 z-10"
                        style={{ position: "sticky", top: "68px" }}
                      >
                        <tr>
                          <th className="px-2 py-4 text-center whitespace-nowrap">
                            No
                          </th>
                          {checkDate && (
                            <th className="px-2 py-4 text-center whitespace-nowrap">
                              Date &nbsp;
                              <img
                                src={barsFilter}
                                className="mx-auto inline-block"
                                alt="filter"
                                onClick={SortBydate}
                                style={{ cursor: "pointer" }}
                              />
                            </th>
                          )}
                          {checkDesc && (
                            <th className="px-2 py-4 text-center whitespace-nowrap">
                              Description of Background
                            </th>
                          )}
                          {checkDocu && (
                            <th className="px-2 py-4 text-center whitespace-nowrap">
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
                          >
                            {/* {witness.slice(pageIndex-1, pageSizeConst).map((item, index) => ( */}
                            {witness.map((item, index) => (
                              <>
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
                                        ) && "bg-green-300"
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
                                        className="px-1 py-3"
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
                                            className="cursor-pointer mr-1"
                                            checked={checkedState[index]}
                                            onChange={(event) =>
                                              handleCheckboxChange(
                                                index,
                                                event,
                                                item.id,
                                                item.date,
                                                item.description
                                              )
                                            }
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
                                        <td {...provider.dragHandleProps}>
                                          <div>
                                            <DatePicker
                                              className="border w-28 rounded text-xs py-2 px-1 border-gray-300 mb-5 z-20"
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
                                          className="w-10/12 px-2 py-4 align-top place-items-center relative flex-wrap"
                                        >
                                          <div
                                            className="p-2 w-full h-full font-poppins"
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
                                                item.id
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
                                          className="py-2 px-3 w-80 text-sm text-gray-500"
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
                                                : "Paste"}
                                              &nbsp;
                                              <FaPaste />
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
                                              {/* {files
                                                .filter(
                                                  (x) =>
                                                    x.backgroundId === item.id
                                                )
                                                .map((items, index) => ( */}
                                              {item.files.items.map(
                                                (items, index) => (
                                                  <span key={items.id}>
                                                    <p className="break-normal border-dotted border-2 border-gray-500 p-1 rounded-lg mb-2 bg-gray-100">
                                                      {activateButton ? (
                                                        <input
                                                          type="checkbox"
                                                          name={items.uniqueId}
                                                          className="cursor-pointer w-10 inline-block align-middle"
                                                          onChange={(event) =>
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
                                                      <span className="align-middle cursor-auto" title={items.name}>
                                                        {items.name !== null && items.name !== "" &&
                                                          items.name.substring(
                                                            0,
                                                            15
                                                          )}
                                                      </span>
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
                                                            showModal(
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
                              </>
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
        <div>
          {maxLoading ? (
            <div className="flex justify-center items-center mt-5">
              <p>All data has been loaded.</p>
            </div>
          ) : witness.length >= 20 ? (
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
          witness={witness}
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
              : null
          }
        >
          <ToastNotification title={alertMessage} hideToast={hideToast} />
        </div>
      )}
    </>
  );
};

export default TableInfo;
