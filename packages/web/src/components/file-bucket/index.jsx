import '../../assets/styles/BlankState.css';
import '../../assets/styles/custom-styles.css';
import '../../assets/styles/FileBucket.css';

import * as IoIcons from 'react-icons/io';

import { AiFillTags, AiOutlineDownload } from 'react-icons/ai';
import {
  BsArrowLeft,
  BsFillTrashFill,
  BsSortDown,
  BsSortUpAlt,
} from 'react-icons/bs';
import { DragDropContext, Draggable, Droppable } from 'react-beautiful-dnd';
import { FaRegFileAudio, FaRegFileVideo, FaSort } from 'react-icons/fa';
import {
  FiChevronDown,
  FiChevronUp,
  FiChevronsDown,
  FiChevronsUp,
  FiCopy,
  FiUpload,
} from 'react-icons/fi';
import {
  GrDocument,
  GrDocumentExcel,
  GrDocumentImage,
  GrDocumentPdf,
  GrDocumentText,
  GrDocumentTxt,
  GrDocumentWord,
} from 'react-icons/gr';
import { MdArrowBackIos, MdDragIndicator } from 'react-icons/md';
import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { Redirect, useHistory } from 'react-router-dom';

import { API } from 'aws-amplify';
import { AppRoutes } from '../../constants/AppRoutes';
import { Auth } from 'aws-amplify';
import { BiArrowToTop } from 'react-icons/bi';
import BlankState from '../blank-state';
import BlankStateMobile from '../blank-state-mobile';
import CreatableSelect from 'react-select/creatable';
import DatePicker from 'react-datepicker';
import FilterLabels from './filter-labels-modal';
import Illustration from '../../assets/images/no-data.svg';
import { Link } from 'react-router-dom';
import Loading from '../loading/loading';
import Multiselect from 'multiselect-react-dropdown';
import NoResultState from '../no-result-state';
import RemoveFileModal from './remove-file-modal';
import ScrollToTop from 'react-scroll-to-top';
import SessionTimeout from '../session-timeout/session-timeout-modal';
import ToastNotification from '../toast-notification';
import UploadLinkModal from './file-upload-modal';
import dateFormat from 'dateformat';
import ellipsis from '../../shared/ellipsis';
import imgLoading from '../../assets/images/loading-circle.gif';
import { useIdleTimer } from 'react-idle-timer';
import { useParams } from 'react-router-dom';
import useWindowDimensions from '../../shared/windowDimensions';
import { List, AutoSizer, CellMeasurer, CellMeasurerCache, WindowScroller } from "react-virtualized";
//import AccessControl from "../../shared/accessControl";

export var selectedRows = [];
export var selectedCompleteDataRows = [];
export var pageSelectedLabels;

export default function FileBucket() {
  let tempArr = [];
  let nameArr = [];
  let descArr = [];
  const [showToast, setShowToast] = useState(false);
  const [resultMessage, setResultMessage] = useState('');
  const [files, setFiles] = useState(null);
  const [matterFiles, setMatterFiles] = useState(files);
  const [labels, setLabels] = useState(null);
  const [clientMatterName, setClientMatterName] = useState('');
  const [updateProgess, setUpdateProgress] = useState(false);
  const [active, setActive] = useState(false);
  const [selected, setSelected] = useState('');
  const [fileAlert, setFileAlert] = useState('');
  const [descAlert, setDesAlert] = useState('');
  const [fileId, setFileId] = useState('');
  const [detId, setDetId] = useState('');
  const [textName, setTextName] = useState('');
  const [textDetails, setTextDetails] = useState('');
  const { matter_id, background_id } = useParams();
  const [searchFile, setSearchFile] = useState();
  const [filterLabelsData, setFilterLabelsData] = useState([]);
  const [pageTotal, setPageTotal] = useState(0);
  const [pageSize, setPageSize] = useState(20);
  const [pageIndex, setPageIndex] = useState(1);
  const [vNextToken, setVnextToken] = useState(null);
  const [loading, setLoading] = useState(false);
  const [maxLoading, setMaxLoading] = useState(false);
  const [ascDesc, setAscDesc] = useState(null);
  const [sortOrder, setSortOrder] = useState('ORDER_ASC');
  const [pageReferenceFileId, setPageReferenceFileId] = useState('');
  const [pageReferenceBackgroundId, setPageReferenceBackgroundId] =
    useState('');
  const [pageReferenceClientMatter, setPageReferenceClientMatter] =
    useState('');
  const [pageReferenceDescription, setPageReferenceDescription] = useState('');
  const [pageReferenceRowOrder, setPageReferenceRowOrder] = useState('');
  const [isShiftDown, setIsShiftDown] = useState(false);
  const [lastSelectedItem, setLastSelectedItem] = useState(null);
  const [selectedItems, setSelectedItems] = useState([]);
  const [descriptionClass, setDescriptionClass] = useState(true);
  const [descriptionClassId, setDescriptionClassId] = useState('');
  let filterOptionsArray = [];

  const [showRemoveFileModal, setshowRemoveFileModal] = useState(false);
  const [showRemoveFileButton, setshowRemoveFileButton] = useState(false);
  const [showAttachBackgroundButton, setshowAttachBackgroundButton] =
    useState(false);
  const [showCopyToBackgroundButton, setShowCopyToBackgroundButton] =
    useState(false);
  var fileCount = 0;

  const [filterLabels, setFilterLabels] = useState(false);
  const [deletingState, setDeletingState] = useState(false);

  const [filterModalState, setFilterModalState] = useState(true);

  const [filteredFiles, setFilteredFiles] = useState(null);
  const [filterState, setFilterState] = useState(false);

  const [copyOptions, showCopyOptions] = useState(false);
  const [textDesc, setTextDesc] = useState('');

  const [Briefs, setBriefs] = useState(null);
  const [copyBgOptions, setCopyBgOptions] = useState(null);
  const [copyBgIds, setCopyBgIds] = useState(null);

  const [showUploadModal, setShowUploadModal] = useState(false);
  const itemsRef = useRef([]);
  const bool = useRef(false);
  let history = useHistory();

  const [briefNames, setBriefNames] = useState(null);

  var moment = require('moment');

  const cache = useRef(new CellMeasurerCache({
    fixedWidth: true,
    defaultHeight: 100,
  }));

  const hideToast = () => {
    setShowToast(false);
  };

  const [showSessionTimeout, setShowSessionTimeout] = useState(false);

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

  const noStyle = {
    textDecoration: 'none',
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

  const mUpdateBulkMatterFileOrder = `
    mutation bulkUpdateMatterFileOrders($arrangement: [ArrangementInput]) {
      matterFileBulkUpdateOrders(arrangement: $arrangement) {
        id
        order
      }
    }
    `;

  const handleUploadLink = async (uf) => {
    var uploadedFiles = uf.files.map((f) => ({ ...f, matterId: matter_id }));
    window.scrollTo(0, 0);
    //adjust order of existing files
    let tempMatter = [...matterFiles];
    const result = tempMatter.map(({ id }, index) => ({
      id: id,
      order: index + uploadedFiles.length,
    }));

    await API.graphql({
      query: mUpdateBulkMatterFileOrder,
      variables: {
        arrangement: result,
      },
    });

    //add order to new files
    var sortedFiles = uploadedFiles.sort(
      (a, b) => b.oderSelected - a.oderSelected
    );

    console.log('Uploaded Files', sortedFiles);

    createMatterFile(sortedFiles);

    setResultMessage(`File successfully uploaded!`);
    setShowToast(true);
    handleModalClose();
    setTimeout(() => {
      setShowToast(false);
      getMatterFiles(1);
    }, 3000);

    //don't delete for single upload
    // sortedFiles.map((file) => {
    //   createMatterFile(file);
    // });
  };

  async function createMatterFile(param) {
    param.forEach(function (i) {
      delete i.oderSelected;
    });

    const request = await API.graphql({
      query: mBulkCreateMatterFile,
      variables: {
        files: param,
      },
    });

    console.log('result', request);

    //don't delete for single upload
    // const request = API.graphql({
    //   query: mCreateMatterFile,
    //   variables: param,
    // });

    return request;
  }

  const handleModalClose = () => {
    setShowUploadModal(false);
    setshowRemoveFileModal(false);
    setFilterLabels(false);
  };

  const mCreateMatterFile = `
      mutation createMatterFile ($matterId: ID, $s3ObjectKey: String, $size: Int, $type: String, $name: String, $order: Int) {
        matterFileCreate(matterId: $matterId, s3ObjectKey: $s3ObjectKey, size: $size, type: $type, name: $name, order: $order) {
          id
          name
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

  const qGetFilesByMatter = `
query getFilesByMatter($isDeleted: Boolean, $limit: Int, $matterId: ID, $nextToken: String, $sortOrder: OrderBy) {
  matterFiles(isDeleted: $isDeleted, matterId: $matterId, nextToken: $nextToken, limit: $limit, sortOrder: $sortOrder) {
    items {
      id
      name
      details
      date
      s3ObjectKey
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
          date
          briefs {
            items {
              id
              name
            }
          }
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

  //   const mNoPaginationbyItems = `
  // query getFilesByMatter($isDeleted: Boolean, $matterId: ID) {
  //   matterFiles(isDeleted: $isDeleted, matterId: $matterId, sortOrder:ORDER_ASC) {
  //     items {
  //       id
  //       name
  //       details
  //       date
  //       s3ObjectKey
  //       labels {
  //         items {
  //           id
  //           name
  //         }
  //       }
  //       backgrounds {
  //         items {
  //           id
  //           order
  //           description
  //         }
  //       }
  //       createdAt
  //       order
  //       type
  //       size
  //     }
  //     nextToken
  //   }
  // }
  // `;

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

  const mUpdateBackgroundDesc = `
  mutation updateBackground($id: ID, $description: String) {
    backgroundUpdate(id: $id, description: $description) {
      id
      description
    }
  }
`;

  const mUpdateBackgroundDate = `
    mutation updateBackground($id: ID, $date: AWSDateTime) {
      backgroundUpdate(id: $id, date: $date) {
        id
        date
      }
    }
  `;

  const qListBriefId = `
  query getBriefsByBackground($id: ID) {
    background(id: $id) {
      briefs {
        items {
          id
          name
        }
      }
    }
  }
  `;

  async function tagBackgroundFile() {
    let arrFiles = [];
    let arrFileResult = [];
    const seen = new Set();

    setShowToast(true);
    setResultMessage(`Copying attachment to background..`);

    const backgroundFilesOpt = await API.graphql({
      query: qlistBackgroundFiles,
      variables: {
        id: backgroundRowId,
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

    if (backgroundRowId !== null) {
      const request = API.graphql({
        query: mUpdateBackgroundFile,
        variables: {
          backgroundId: backgroundRowId,
          files: filteredArr,
        },
      });

      console.log(filteredArr);

      setTimeout(() => {
        setShowToast(false);
        window.location.href = `${
          AppRoutes.BACKGROUND
        }/${matter_id}/${background_id}/?matter_name=${utf8_to_b64(
          matter_name
        )}&client_name=${utf8_to_b64(client_name)}`;
      }, 2000);
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
    console.log('Labels', result);

    var labelNames = [];

    result.map((x) => (labelNames = [...labelNames, x.label]));

    if (labelNames.length === 0) {
      setFilterModalState(true);
    } else {
      setFilterModalState(false);
    }

    pageSelectedLabels = labelNames;

    setLabels(result);
  };

  useEffect(() => {
    if (matterFiles === null) {
      console.log('matterFiles is null');
      getMatterFiles();
    }

    if (labels === null) {
      getLabels();
    }

    if (searchFile !== undefined) {
      filterRecord(searchFile);
    }

    if (Briefs === null) {
      getBriefs();
    }

    // if (briefNames === null){
    //   loadBriefNames();
    // }

    console.log('searchFile', searchFile);
    console.log('matterFiles', matterFiles);
  }, [searchFile]);

  let getMatterFiles = async (next) => {
    // const mInitializeOrders = `
    //   mutation initializeOrder($clientMatterId: ID) {
    //     matterFileBulkInitializeOrders(clientMatterId: $clientMatterId) {
    //       id
    //     }
    //   }
    // `;

    // await API.graphql({
    //   query: mInitializeOrders,
    //   variables: { clientMatterId: matter_id },
    // }).then((res) => {
    //   console.log("File Bucket: Initial Sorting Successful!");
    //   console.log(res);
    // });

    const params = {
      query: qGetFilesByMatter,
      variables: {
        matterId: matter_id,
        isDeleted: false,
        //limit: 50,
        //nextToken: next === 1 ? null : vNextToken,
        sortOrder: sortOrder,
      },
    };
    await API.graphql(params).then((files) => {
      let matterFilesList = files.data.matterFiles.items;
      console.log('matterFilesList: ', matterFilesList);
      setVnextToken(files.data.matterFiles.nextToken);
      setFiles(sortByOrder(matterFilesList));
      setMatterFiles(sortByOrder(matterFilesList)); // no need to use sortByOrder
      setMaxLoading(false);
    });
  };

  let loadMoreMatterFiles = async () => {
    if (vNextToken !== null && !loading) {
      const params = {
        query: qGetFilesByMatter,
        variables: {
          matterId: matter_id,
          isDeleted: false,
          limit: 50,
          nextToken: vNextToken,
          sortOrder: sortOrder,
        },
      };

      await API.graphql(params).then((files) => {
        let matterFilesList = files.data.matterFiles.items;
        console.log('Files', matterFilesList);
        setVnextToken(files.data.matterFiles.nextToken);
        let arrConcat = matterFiles.concat(matterFilesList);
        if (ascDesc !== null) {
          console.log('sorting is ascending?', ascDesc);

          if (ascDesc === true) {
            console.log('set order by Date ASC, CreatedAt DESC');

            arrConcat = arrConcat
              .slice()
              .sort(
                (a, b) =>
                  new Date(a.date) - new Date(b.date) ||
                  new Date(b.createdAt) - new Date(a.createdAt)
              );
          } else if (!ascDesc) {
            console.log('set order by Date DESC, CreatedAt DESC');
            arrConcat = arrConcat
              .slice()
              .sort(
                (a, b) =>
                  new Date(b.date) - new Date(a.date) ||
                  new Date(b.createdAt) - new Date(a.createdAt)
              );
          }

          setMatterFiles([...new Set(arrConcat)]);
        } else {
          //setMatterFiles([...new Set(sortByOrder(arrConcat))]);
          setMatterFiles([...new Set(sortByOrder(arrConcat))]);
        }

        // if (files.data.matterFiles.items.length !== 0 && vNextToken !== null) {
        //   console.log("result count: ", files.data.matterFiles.items.length);
        //   console.log("next token: ", vNextToken);
        //   setMaxLoading(false);
        // } else {
        //   setMaxLoading(true);
        // }
      });
    } else {
      //console.log("Last Result!");
      setMaxLoading(true);
    }
  };

  async function updateMatterFile(id, data) {
    console.group('updateMatterFile()');
    console.log('id:', id);
    console.log('data:', data);
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
    console.log('tagFileLabel()');
    console.log('fileId', fileId, 'check', labels);
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
        console.log('reqq', request);
      } catch (e) {
        reject(e.errors[0].message);
      }
    });
  }

  const mainGrid = {
    display: 'grid',
    gridtemplatecolumn: '1fr auto',
    position: 'sticky',
    top: 0,
  };

  const handleLabelChanged = async (id, e, existingLabels) => {
    //console.log("event", e);

    var labelsList = [];

    for (var i = 0; i < e.length; i++) {
      if (e[i].__isNew__) {
        const createLabel = await API.graphql({
          query: mCreateLabel,
          variables: {
            clientMatterId: matter_id,
            name: e[i].label,
          },
        });

        //console.log(createLabel);
        let updateLabel = labels;
        updateLabel.push({
          value: createLabel.data.labelCreate.id,
          label: createLabel.data.labelCreate.name,
        });

        setLabels(updateLabel);

        labelsList = [
          ...labelsList,
          {
            id: createLabel.data.labelCreate.id,
            name: createLabel.data.labelCreate.name,
          },
        ];
      } else {
        labelsList = [...labelsList, { id: e[i].value, name: e[i].label }];
      }
    }

    //console.log("collectedlabels", labelsList);

    const request = await API.graphql({
      query: mTagFileLabel,
      variables: {
        fileId: id,
        labels: labelsList,
      },
    });

    if (request) {
      setResultMessage('Updating labels');
      setShowToast(true);
      setTimeout(() => {
        setShowToast(false);
        getMatterFiles(1);
      }, 2000);
    }
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

  //description saving
  const handleDetailsContent = (e, details, id) => {
    if (!descAlert) {
      setTextDetails(!details ? '' : details);
      setDetId(id);
      setDesAlert('');
    } else {
      setTextDetails('');
    }
    setDescriptionClassId(id);
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
    setDescriptionClassId('');
    if (textDetails.length <= 0) {
      setDesAlert("Description can't be empty");
    } else if (textDetails === details) {
      setDesAlert('');
      const data = {
        details: e.target.innerHTML,
      };
      await updateMatterFileDesc(id, data);
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

      setDesAlert('');
      const data = {
        details: e.target.innerHTML,
      };
      await updateMatterFileDesc(id, data);
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
    console.log('data:', data);
    const request = API.graphql({
      query: mUpdateMatterFileDesc,
      variables: {
        id: id,
        details: data.details,
      },
    });
    console.log(request);
  }

  //filename saving
  const handleNameContent = (e, name, id) => {
    if (!fileAlert) {
      setTextName(!name ? '' : name);
      setFileId(id);
      setFileAlert('');
    } else {
      setTextName('');
    }
  };

  const handleOnChangeName = (event) => {
    setTextName(event.currentTarget.textContent);
  };

  const handleSaveName = async (e, name, id) => {
    if (textName.length <= 0) {
      setFileAlert("File name can't be empty");
    } else if (textName === name) {
      setFileAlert('');
      const data = {
        name: name,
      };
      await updateMatterFileName(id, data);
      setTimeout(() => {
        setResultMessage(`Successfully updated `);
        setShowToast(true);
        setTimeout(() => {
          setShowToast(false);
        }, 1000);
      }, 1000);
    } else {
      setFileAlert('');
      const data = {
        name: textName,
      };
      await updateMatterFileName(id, data);
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
    console.log('data:', data);
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

    if (filterState) {
      const updatedArray = filteredFiles.map((p) =>
        p.id === id ? { ...p, date: data.date } : p
      );
      setFilteredFiles(updatedArray);
    } else {
      const updatedArray = matterFiles.map((p) =>
        p.id === id ? { ...p, date: data.date } : p
      );
      setMatterFiles(updatedArray);
    }
  };

  async function updateMatterFileDate(id, data) {
    return new Promise((resolve, reject) => {
      try {
        const request = API.graphql({
          query: mUpdateMatterFileDate,
          variables: {
            id: id,
            date:
              data.date !== null && data.date !== 'null' && data.date !== ''
                ? moment
                    .utc(moment(new Date(data.date), 'YYYY-MM-DD'))
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

  const defaultOptions = (items) => {
    if (items !== null) {
      const newOptions = items.map(({ id: value, name: label }) => ({
        value,
        label,
      }));
      console.log('optionscheck', newOptions);
      return newOptions;
    } else {
      return null;
    }
  };

  //sorting files function
  function sortByOrder(arr) {
    let sort;

    if (arr) {
      sort = arr.sort((a, b) =>
        a.order === null || b.order === null
          ? a
          : a.order - b.order === 0
          ? new Date(b.createdAt) - new Date(a.createdAt)
          : a.order - b.order
      );
    } else {
      sort = arr;
    }

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
  function checked(id, fileName, details, size, s3ObjectKey, type, date, idx) {
    if (isAllChecked) {
      selectedRows.splice(
        selectedRows.indexOf(selectedRows.find((temp) => temp.id === id)),
        1
      );

      selectedCompleteDataRows.splice(
        selectedCompleteDataRows.indexOf(
          selectedCompleteDataRows.find((temp) => temp.id === id)
        ),
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

        selectedCompleteDataRows.splice(
          selectedCompleteDataRows.indexOf(
            selectedCompleteDataRows.find((temp) => temp.id === id)
          ),
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
            s3ObjectKey: s3ObjectKey,
            order: 0,
          },
        ];

        console.log('THIS IS SELECTED', selectedCompleteDataRows);

        setIsAllChecked(false);
        const updatedCheckedState = checkedState.map((item, index) =>
          index === idx ? !item : item
        );
        setCheckedState(updatedCheckedState);
      }
    }

    if (selectedRows.length > 0) {
      setshowRemoveFileButton(true);
      setShowCopyToBackgroundButton(true);
      if (background_id !== '000') {
        setshowAttachBackgroundButton(true);
      }
    } else {
      setshowRemoveFileButton(false);
      setShowCopyToBackgroundButton(false);
      if (background_id !== '000') {
        setshowAttachBackgroundButton(false);
      }
    }
  }

  //checking all rows
  function checkAll(e) {
    if (e.target.checked) {
      setshowRemoveFileButton(true);
      setShowCopyToBackgroundButton(true);
      if (background_id !== '000') {
        setshowAttachBackgroundButton(true);
      }
      const xmatterFiles = matterFiles.map(
        ({
          id,
          backgrounds,
          createdAt,
          date,
          details,
          labels,
          name,
          order,
          s3ObjectKey,
          size,
          type,
        }) => ({
          id,
          fileName: name,
          backgrounds,
          createdAt,
          date,
          details,
          labels,
          name,
          order,
          s3ObjectKey,
          size,
          type,
        })
      );
      setIsAllChecked(true);
      setSelectedItems(matterFiles.map((x) => x.id));
      selectedRows = xmatterFiles;
      selectedCompleteDataRows = xmatterFiles;
    } else {
      selectedRows = [];
      selectedCompleteDataRows = [];
      setIsAllChecked(false);
      setshowRemoveFileButton(false);
      setShowCopyToBackgroundButton(false);
      if (background_id !== '000') {
        setshowAttachBackgroundButton(false);
      }
      setSelectedItems([]);
    }
  }

  //delete function
  const mBulkSoftDelete = `mutation bulkSoftDeleteMatterFiles($id: [ID]) {
    matterFileBulkSoftDelete(id: $id) {
        id
    }
  }`;

  const handleDeleteFile = async (fileID) => {
    setDeletingState(true);
    var idArray = [];

    fileID.map((x) => (idArray = [...idArray, x.id]));

    const request = await API.graphql({
      query: mBulkSoftDelete,
      variables: {
        id: idArray,
      },
    });

    selectedRows = [];
    selectedCompleteDataRows = [];
    setshowRemoveFileButton(false);
    setShowCopyToBackgroundButton(false);
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
        getMatterFiles(1);
        setShowToast(false);
        setDeletingState(false);
      }, 3000);
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
    console.log('handleSearchFileChange()', e.target.value);
    setSearchFile(e.target.value);
  };

  const filterRecord = (v) => {
    console.log('filter', v);
    var next = 1;

    if (v === '') {
      getMatterFiles(next);
    } else {
      const filterRecord = files.filter((x) =>
        x.name.toLowerCase().includes(v.toLowerCase())
      );

      console.log('filterRecord:', filterRecord);
      setMatterFiles(filterRecord);
    }
  };

  const mGetFilesByLabel = `
    query getFilesByLabel($id: [ID]) {
      multipleLabels(id: $id) {
        files {
        items {
          id
          name
          details
          date
          s3ObjectKey
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
              date
              briefs {
                items {
                  id
                  name
                }
              }
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
    }
    `;

  //filter function
  const handleFilter = async (fileFilter) => {
    console.log('ff', fileFilter);
    console.log('filesToFilter', matterFiles);
    setFilterLabels(false);

    var next = 1;

    //var filterRecord = [];
    if (
      fileFilter === null ||
      fileFilter === undefined ||
      fileFilter.length === 0
    ) {
      getMatterFiles(next);
      setMatterFiles(sortByOrder(matterFiles));
      setFilterState(false);
    } else {
      console.log('labels', labels);
      var labelsList = labels;
      var labelsIdList = [];

      for (var i = 0; i < fileFilter.length; i++) {
        labelsList.map((x) =>
          x.label === fileFilter[i]
            ? (labelsIdList = [...labelsIdList, x.value])
            : (labelsIdList = labelsIdList)
        );
      }

      var uniqueIds = [
        ...new Map(labelsIdList.map((x) => [JSON.stringify(x), x])).values(),
      ];

      console.log('labelIds', uniqueIds);

      const result = await API.graphql({
        query: mGetFilesByLabel,
        variables: {
          id: uniqueIds,
        },
      });

      setTimeout(() => {
        console.log('ssss', result);
        var newFiles = result.data.multipleLabels;

        var newFiles1 = [];
        var newFiles2 = [];

        if (result === null) {
          newFiles2 = [];
        } else {
          result.data.multipleLabels.map(
            (x) => (newFiles1 = [...newFiles1, x.files.items])
          );
          newFiles1.map((x) => x.map((y) => (newFiles2 = [...newFiles2, y])));
        }

        function removeDuplicateObjectFromArray(array, key) {
          var check = new Set();
          return array.filter(
            (obj) => !check.has(obj[key]) && check.add(obj[key])
          );
        }

        console.log(
          'putinmatterfiles',
          removeDuplicateObjectFromArray(newFiles2, 'id')
        );
        // setMatterFiles(sortByOrder(newFiles2));
        setFilteredFiles(
          sortByOrder(removeDuplicateObjectFromArray(newFiles2, 'id'))
        );
        setFilterState(true);

        console.log('res', result);
      }, 5000);
    }
  };

  const mCreateBackground = `
  mutation createBackground($briefId: ID, $description: String, $date: AWSDateTime) {
    backgroundCreate(briefId: $briefId, description: $description, date: $date) {
      id
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
          briefId: background_id,
          description: arrFiles[i].details,
          date:
            arrFiles[i].date !== null
              ? moment
                  .utc(moment(new Date(arrFiles[i].date), 'YYYY-MM-DD'))
                  .toISOString()
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
      window.location.href = `${
        AppRoutes.BACKGROUND
      }/${matter_id}/${background_id}/?matter_name=${utf8_to_b64(
        matter_name
      )}&client_name=${utf8_to_b64(client_name)}`;
    }, 1000);
  }

  var timeoutId;

  const handleOnAction = (event) => {
    loadMoreMatterFiles();
    //function for detecting if user moved/clicked.
    //if modal is active and user moved, automatic logout (session expired)
    // bool.current = false;
    if (showSessionTimeout) {
      setTimeout(() => {
        Auth.signOut().then(() => {
          clearLocalStorage();
          console.log('Sign out completed.');
          history.push('/');
        });

        function clearLocalStorage() {
          localStorage.removeItem('userId');
          localStorage.removeItem('email');
          localStorage.removeItem('firstName');
          localStorage.removeItem('lastName');
          localStorage.removeItem('userType');
          localStorage.removeItem('company');
          localStorage.removeItem('companyId');
          localStorage.removeItem('access');
        }
      }, 3000);
    }

    clearTimeout(timeoutId);
  };

  const handleOnIdle = (event) => {
    loadMoreMatterFiles();
    //function for detecting if user is on idle.
    //after 30 mins, session-timeout modal will show
    // bool.current = true;
    timeoutId = setTimeout(() => {
      setShowSessionTimeout(true);
    }, 60000 * 40);
  };

  useIdleTimer({
    timeout: 60 * 40,
    onAction: handleOnAction,
    onIdle: handleOnIdle,
    debounce: 1000,
  });

  const handleDuplicate = async () => {
    let next = 1;
    const lengthSelectedRows = selectedCompleteDataRows.length;
    selectedCompleteDataRows.map(async function (items, index) {
      const request = await API.graphql({
        query: mCreateMatterFile,
        variables: {
          matterId: matter_id,
          s3ObjectKey: items.s3ObjectKey,
          size: items.size,
          name: 'Copy of ' + items.fileName,
          type: items.type,
          order: items.order,
        },
      });
      setIsAllChecked(false);
      setSelectedItems([]);
      const newArr = Array(files.length).fill(false);
      setCheckedState(newArr);
      setshowAttachBackgroundButton(false);
      setShowCopyToBackgroundButton(false);
      setshowRemoveFileButton(false);
      getMatterFiles(next);

      if (index === lengthSelectedRows - 1) {
        selectedCompleteDataRows = [];
        selectedRows = [];
        console.log('END', selectedCompleteDataRows);
      }
    });
  };

  const SortBydate = async () => {
    console.group('SortBydate()');
    // const isAllZero = matterFiles.every(
    //   (item) => item.order >= 0 && item.order !== 0
    // );

    setMatterFiles(null); // trigger loading ...

    if (ascDesc === null) {
      console.log('set order by Date ASC, CreatedAt DESC');
      setAscDesc(true);

      const params = {
        query: qGetFilesByMatter,
        variables: {
          matterId: matter_id,
          isDeleted: false,
          nextToken: null,
          sortOrder: 'DATE_ASC',
        },
      };

      await API.graphql(params).then((files) => {
        let matterFilesList = files.data.matterFiles.items;
        console.log('matterFilesList: ', sortOrder, matterFilesList);
        setVnextToken(files.data.matterFiles.nextToken);
        setFiles(matterFilesList);
        setMatterFiles(matterFilesList); // no need to use sortByOrder
        setMaxLoading(false);
      });
    } else if (ascDesc === true) {
      console.log('set order by Date DESC, CreatedAt DESC');
      setAscDesc(false);
      const params = {
        query: qGetFilesByMatter,
        variables: {
          matterId: matter_id,
          isDeleted: false,
          nextToken: null,
          sortOrder: 'DATE_DESC',
        },
      };

      await API.graphql(params).then((files) => {
        let matterFilesList = files.data.matterFiles.items;
        console.log('matterFilesList: ', sortOrder, matterFilesList);
        setVnextToken(files.data.matterFiles.nextToken);
        setFiles(matterFilesList);
        setMatterFiles(matterFilesList); // no need to use sortByOrder
        setMaxLoading(false);
      });
    } else if (!ascDesc) {
      setAscDesc(null);
      console.log('set order by DEFAULT: Order ASC, CreatedAt DESC');
      getMatterFiles();
    }

    console.groupEnd();
  };

  const style = {
    paddingLeft: '0rem',
  };

  const showPageReference = async (
    fileId,
    backgroundId,
    clientMatter,
    description,
    rowOrder
  ) => {
    setPageReferenceFileId(fileId);
    setPageReferenceBackgroundId(backgroundId);
    setPageReferenceClientMatter(clientMatter);
    setPageReferenceDescription(description);
    setPageReferenceRowOrder(rowOrder);
  };

  function getQueryVariable(variable) {
    var query = window.location.search.substring(1);
    var vars = query.split('&');
    for (var i = 0; i < vars.length; i++) {
      var pair = vars[i].split('=');
      if (pair[0] == variable) {
        return pair[1];
      }
    }
    return false;
  }

  function b64_to_utf8(str) {
    return decodeURIComponent(escape(window.atob(str)));
  }

  function getParameterByName(name, url = window.location.href) {
    name = name.replace(/[\[\]]/g, '\\$&');
    var regex = new RegExp('[?&]' + name + '(=([^&#]*)|&|#|$)'),
      results = regex.exec(url);
    if (!results) return null;
    if (!results[2]) return '';
    return decodeURIComponent(results[2].replace(/\+/g, ' '));
  }

  const m_name = getParameterByName('matter_name');
  const c_name = getParameterByName('client_name');
  const backgroundRowId = getParameterByName('background_id');
  const matter_name = b64_to_utf8(m_name);
  const client_name = b64_to_utf8(c_name);

  function utf8_to_b64(str) {
    return window.btoa(unescape(encodeURIComponent(str)));
  }
  function showAlert() {
    alert('No selected Labels on page.');
  }

  const checkFormat = (str) => {
    var check = str;
    check = check.replace('%20', ' '); //returns my_name
    return check;
  };

  //new copy to BG
  const handleShowCopyOptions = () => {
    if (copyOptions) {
      showCopyOptions(false);
    } else {
      showCopyOptions(true);
    }
  };

  const listBriefs = `
  query getBriefsByClientMatter($id: ID, $limit: Int, $nextToken: String) {
    clientMatter(id: $id) {
      briefs(limit: $limit, nextToken: $nextToken) {
        items {
          id
          name
          date
          order
        }
      }
    }
  }
  `;

  const getBriefs = async () => {
    var opts = [];
    console.log('matterid', matter_id);
    const params = {
      query: listBriefs,
      variables: {
        id: matter_id,
        limit: 50,
        nextToken: null,
      },
    };

    await API.graphql(params).then((brief) => {
      let briefList = brief.data.clientMatter.briefs.items;
      console.log('mfl', briefList);
      var temp = briefList.map(
        (x) => (opts = [...opts, { label: x.name, value: x.id }])
      );
      setCopyBgOptions(opts);
      setBriefs(briefList);
    });
  };

  const handleFilterChange = (evt) => {
    setCopyBgIds(evt);
  };

  const handleFilterRemoveChange = (evt) => {
    if (evt.length === 0) {
      setCopyBgIds(null);
    }
  };

  const handleCopyToBg = async () => {
    console.log('cb', copyBgOptions);

    let temp = copyBgIds;
    var searchIds = [];

    for (var i = 0; i < temp.length; i++) {
      copyBgOptions.map((x) =>
        x.label === temp[i] ? (searchIds = [...searchIds, x.value]) : x
      );
    }

    console.log('searchthis', searchIds); //ids of backgrounds [id, id] correct

    //from old code, attach to bg
    let arrFiles = [];
    setShowToast(true);
    setResultMessage(`Copying files to background..`);

    showCopyOptions(false);
    setshowRemoveFileButton(false);
    setShowCopyToBackgroundButton(false);
    setshowAttachBackgroundButton(false);

    arrFiles = selectedRows.map(({ id, details, date }) => ({
      id: id,
      details: details,
      date: date,
    }));

    var counter = 0;
    for (let j = 0; j < searchIds.length; j++) {
      for (let i = 0; i < arrFiles.length; i++) {
        counter++;
        const createBackgroundRow = await API.graphql({
          query: mCreateBackground,
          variables: {
            briefId: searchIds[j],
            description: arrFiles[i].details,
            date:
              arrFiles[i].date !== null
                ? moment
                    .utc(moment(new Date(arrFiles[i].date), 'YYYY-MM-DD'))
                    .toISOString()
                : moment.utc(moment(new Date(), 'YYYY-MM-DD')).toISOString(),
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
    }
    setShowToast(false);
    setIsAllChecked(false);
    setSelectedItems([]);
    setResultMessage(`Files successfully copied in backgrounds!`);
    setShowToast(true);

    setTimeout(() => {
      setShowToast(false);
    }, 1000);

    selectedRows = [];
    selectedCompleteDataRows = [];
    getMatterFiles();
    setTimeout(() => {
      setShowToast(false);
      getBriefs();
      setIsAllChecked(false);
      const newArr = Array(files.length).fill(false);
      setCheckedState(newArr);
    }, 1000);
  };

  const handleDescContent = (e, description, id, index) => {
    if (!descAlert) {
      setTextDesc(description);
    }
    setDescriptionClassId(id);
    setDescriptionClass(false);

    /*const next = itemsRef.current[index];
    if (next) {
      next.scrollIntoView({
        behavior: 'smooth',
        block: 'center',
        inline: 'center',
      });
    }*/
  };

  const handleChangeDescription = (e, description, id, index) => {
    console.log('ITEMS', e);
    setDescriptionClassId(id);
    setDescriptionClass(false);

    /* const next = itemsRef.current[index];
    if (next) {
      next.scrollIntoView({
        behavior: 'smooth',
        block: 'center',
        inline: 'center',
      });
    } */
  };

  const handleChangeDesc = (event) => {
    setTextDesc(event.currentTarget.textContent);
  };

  const handleSaveDesc = async (e, description, date, id) => {
    matterFiles.map((obj) => {
      if (obj.id === id) {
        return { ...obj, description: e.target.innerHTML };
      }
      return obj;
    });

    // matterFiles.map((obj) => {
    //   if (obj.id === id) {

    //   }
    // });

    setDescriptionClass(true);
    setDescriptionClassId('');

    if (textDesc.length <= 0) {
      // notify error on description
    } else if (textDesc === description) {
      setShowToast(true);

      const data = {
        description: e.target.innerHTML,
      };

      const success = await updateBackgroundDesc(id, data);
      if (success) {
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
        setShowToast(true);
      }
      setTimeout(() => {
        setShowToast(false);
        getMatterFiles(1);
      }, 1000);
    }
  };

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

  const handleKeyUp = (e) => {
    if (e.key === 'Shift' && isShiftDown) {
      setIsShiftDown(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Shift' && !isShiftDown) {
      setIsShiftDown(true);
    }
  };

  const handleSelectItem = (e, index) => {
    const { value } = e.target;
    const nextValue = getNextValue(value);
    setSelectedItems(nextValue);
    setLastSelectedItem(value);

    if (nextValue.length > 0) {
      const isf1 = matterFiles.filter((item) => nextValue.includes(item.id));
      const xmatterFiles = isf1.map(
        ({
          id,
          backgrounds,
          createdAt,
          date,
          details,
          labels,
          name,
          order,
          s3ObjectKey,
          size,
          type,
        }) => ({
          id,
          fileName: name,
          backgrounds,
          createdAt,
          date,
          details,
          labels,
          name,
          order,
          s3ObjectKey,
          size,
          type,
        })
      );

      selectedRows = xmatterFiles;
      selectedCompleteDataRows = xmatterFiles;
      setshowRemoveFileButton(true);
      setShowCopyToBackgroundButton(true);
      if (background_id !== '000') {
        setshowAttachBackgroundButton(true);
      }
    } else {
      selectedRows = [];
      selectedCompleteDataRows = [];
      setshowRemoveFileButton(false);
      setShowCopyToBackgroundButton(false);
      if (background_id !== '000') {
        setshowAttachBackgroundButton(false);
      }
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
    const currentSelectedIndex = matterFiles.findIndex(
      (item) => item.id === value
    );
    const lastSelectedIndex = matterFiles.findIndex(
      (item) => item.id === lastSelectedItem
    );

    return matterFiles
      .slice(
        Math.min(lastSelectedIndex, currentSelectedIndex),
        Math.max(lastSelectedIndex, currentSelectedIndex) + 1
      )
      .map((item) => item.id);
  };

  useEffect(() => {
    document.addEventListener('keyup', handleKeyUp, false);
    document.addEventListener('keydown', handleKeyDown, false);

    return () => {
      document.removeEventListener('keyup', handleKeyUp);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [handleKeyUp, handleKeyDown]);

  const handleChangeDateBackground = async (selected, id, fileId) => {
    const data = {
      date: selected !== null ? String(selected) : null,
    };
    await updateBackgroundDate(id, data);

    const filteredFiles = matterFiles.filter((i) => i.id === fileId);

    const filteredBackground = filteredFiles.map(({ backgrounds }) => ({
      id: backgrounds,
    }));
    getMatterFiles(1);
  };

  async function updateBackgroundDate(id, data) {
    return new Promise((resolve, reject) => {
      try {
        const request = API.graphql({
          query: mUpdateBackgroundDate,
          variables: {
            id: id,
            date:
              data.date !== null
                ? moment
                    .utc(moment(new Date(data.date), 'YYYY-MM-DD'))
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

  const getBriefName = (backgroundId) => {
    return backgroundId;
  };

  const handleRedirectLink = async (e, backgroundId) => {
    var arrBackgroundResult = [];
    const backgroundRedirect = await API.graphql({
      query: qListBriefId,
      variables: {
        id: backgroundId,
      },
    });

    if (backgroundRedirect.data.background.briefs !== null) {
      arrBackgroundResult = backgroundRedirect.data.background.briefs.items.map(
        ({ id }) => ({
          id: id,
        })
      );
      setTimeout(() => {
        setShowToast(false);
        window.location.href = `${AppRoutes.BACKGROUND}/${matter_id}/${
          arrBackgroundResult[0].id
        }/?matter_name=${utf8_to_b64(matter_name)}&client_name=${utf8_to_b64(
          client_name
        )}`;
      }, 200);
    } else {
      alert('Error encountered!');
    }
  };

  //Mobile functions
  const [headerReadMore, setHeaderReadMore] = useState(false);
  const [headerLines, setHeaderLines] = useState();
  const [contentHeight, setContentHeight] = useState();
  const [readMoreStateOuter, setReadMoreStateOuter] = useState([]);
  const [readMoreStateInner, setReadMoreStateInner] = useState([]);
  const [readMoreStateDesc, setReadMoreStateDesc] = useState([]);
  const [showScrollButton, setShowScrollButton] = useState(false);
  const [isExpandAllActive, setIsExpandAllActive] = useState(false);
  const { height, width } = useWindowDimensions();

  function handleReadMoreStateDesc(fileId) {
    if (
      readMoreStateDesc.find((temp) => {
        return temp === fileId;
      }) === undefined
    ) {
      setReadMoreStateDesc([...readMoreStateDesc, fileId]);
    } else {
      setReadMoreStateDesc((current) =>
        current.filter((id) => {
          return id !== fileId;
        })
      );
    }
  }

  function handleReadMoreStateOuter(fileId) {
    if (
      readMoreStateOuter.find((temp) => {
        return temp === fileId;
      }) === undefined
    ) {
      setReadMoreStateOuter([...readMoreStateOuter, fileId]);
    } else {
      setReadMoreStateOuter((current) =>
        current.filter((id) => {
          return id !== fileId;
        })
      );
    }
  }

  function handleReadMoreStateInner(fileId, bgId) {
    if (
      readMoreStateInner.find((temp) => {
        return temp === fileId + '/' + bgId;
      }) === undefined
    ) {
      setReadMoreStateInner([...readMoreStateInner, fileId + '/' + bgId]);
    } else {
      setReadMoreStateInner((current) =>
        current.filter((id) => {
          return id !== fileId + '/' + bgId;
        })
      );
    }
  }

  function handleCollapseAll(fileId) {
    setReadMoreStateOuter((current) =>
      current.filter((id) => {
        return id !== fileId;
      })
    );
    setReadMoreStateDesc((current) =>
      current.filter((id) => {
        return id !== fileId;
      })
    );
    setReadMoreStateInner((current) =>
      current.filter((id) => {
        return id.split('/')[0] !== fileId;
      })
    );
  }

  useEffect(() => {
    console.log('TRIGGERED');
    if (isExpandAllActive) {
      let outerStateArray = [];
      let descStateArray = [];
      let innerStateArray = [];
      matterFiles.map((data) => {
        outerStateArray = [...outerStateArray, data.id];
        descStateArray = [...descStateArray, data.id];
        data.backgrounds.items.map((background) => {
          innerStateArray = [...innerStateArray, data.id + '/' + background.id];
        });
      });
      setReadMoreStateDesc(descStateArray);
      setReadMoreStateOuter(outerStateArray);
      setReadMoreStateInner(innerStateArray);
      console.log('EXPAND');
    } else {
      setReadMoreStateDesc([]);
      setReadMoreStateOuter([]);
      setReadMoreStateInner([]);
      console.log('COLLAPSE');
    }
  }, [isExpandAllActive]);

  function isReadMoreExpandedOuter(fileId) {
    return (
      readMoreStateOuter.find((temp) => {
        return temp === fileId;
      }) !== undefined
    );
  }
  function isReadMoreExpandedDesc(fileId) {
    return (
      readMoreStateDesc.find((temp) => {
        return temp === fileId;
      }) !== undefined
    );
  }

  function isReadMoreExpandedInner(fileId, bgId) {
    return (
      readMoreStateInner.find((temp) => {
        return temp === fileId + '/' + bgId;
      }) !== undefined
    );
  }

  function countLines(tag) {
    var divHeight = tag.offsetHeight;
    var lineHeight = parseInt(
      window.getComputedStyle(tag).getPropertyValue('line-height')
    );
    var lines = Math.round(divHeight / lineHeight);
    return lines;
  }
  function handleScrollEvent(e) {
    const top = e.target.scrollTop > 20;
    if (top) {
      setShowScrollButton(true);
    } else {
      setShowScrollButton(false);
    }
  }
  function handleScrollToTop() {
    let d = document.getElementById('mobileContent');
    d.scrollTo(0, 0);
  }

  useEffect(() => {
    if (matterFiles != null) {
      matterFiles.map((data) => {
        var descTag = document.getElementById(data.id + '.desc');
        if (descTag !== null) {
          var lines = countLines(descTag);
          var descButtonTag = document.getElementById(data.id + '.descButton');
          if (lines >= 5) {
            let bool =
              !isReadMoreExpandedDesc(data.id) &&
              (isReadMoreExpandedOuter(data.id) ||
                data.backgrounds.items === null ||
                data.backgrounds.items.length === 0);
            descButtonTag.style.display = bool ? 'inline-block' : 'none';
            descButtonTag.innerHTML = bool ? 'read more...' : 'read less...';
          } else {
            descButtonTag.style.display = 'none';
          }
        }
      });
    }
  }, [matterFiles, readMoreStateDesc, readMoreStateOuter, width]);

  useEffect(() => {
    var headerTag = document.getElementById('headerTag');
    setHeaderLines(countLines(headerTag));
    if (headerReadMore) {
      setContentHeight(height - 93 - headerTag.offsetHeight);
    } else {
      setContentHeight(
        height -
          93 -
          parseInt(
            window.getComputedStyle(headerTag).getPropertyValue('line-height')
          )
      );
    }
  }, [height, width, headerReadMore]);

  return (
    <>
      <div
        className={
          'p-5 static bg-gray-100 sm:bg-white sm:relative flex flex-col min-w-screen min-h-screen sm:min-h-0 sm:min-w-0 break-words sm:shadow-lg sm:rounded contentDiv'
        }
      >
        <div className="hidden sm:block flex-1">
          <div style={mainGrid}>
            <div>
              <Link to={AppRoutes.DASHBOARD}>
                <button className="bg-white hover:bg-gray-100 text-black font-semibold py-2.5 px-4 rounded inline-flex items-center border-0 shadow outline-none focus:outline-none focus:ring mb-3">
                  <MdArrowBackIos />
                  Back
                </button>
              </Link>
            </div>
          </div>
        </div>
        {/* DON'T DELETE THIS PART. THIS IS A CLONE FOR SCROLLING DOWN */}
        <div
          style={{ position: 'sticky', top: '0' }}
          className="hidden sm:block py-5 bg-white z-30"
        >
          <p className="font-bold text-xl bg-white w-full">
            File Bucket&nbsp;<span className="text-xl">of</span>&nbsp;
            <span className="font-semibold text-xl">
              {checkFormat(client_name)}
            </span>
            /
            <span className="font-semibold text-xl">
              {checkFormat(matter_name)}
            </span>
          </p>
        </div>
        {/* END */}
        <div className="flex sm:flex-none sm-block pt-3 sm:py-5 sm:bg-white sm:z-40 sm:absolute sm:mt-10 ">
          <p className="hidden sm:block font-bold text-3xl">
            File Bucket&nbsp;<span className="text-3xl">of</span>&nbsp;
            <span className="font-semibold text-3xl">
              {checkFormat(client_name)}
            </span>
            /
            <span className="font-semibold text-3xl">
              {checkFormat(matter_name)}
            </span>
          </p>
          {/* MOBILE VIEW OF HEADER */}
          <div
            className="flex flex-auto"
            style={{
              position: headerLines > 1 ? 'absolute' : 'static',
              zIndex: headerLines > 1 ? '-50' : 'auto',
            }}
          >
            <p
              id="headerTag"
              className="sm:hidden font-bold pl-14"
              style={{ lineHeight: '24px' }}
            >
              <span className="font-semibold text-base">
                {checkFormat(client_name)}
              </span>
              &nbsp;
              <span className="font-light text-base text-gray-500">
                {checkFormat(matter_name)}
              </span>
            </p>
            <button className="shrink-0 invisible font-semibold rounded inline-flex items-center border-0 w-5 h-5 rounded-full outline-none focus:outline-none active:bg-current">
              {!headerReadMore ? <FiChevronDown /> : <FiChevronUp />}
            </button>
          </div>
          {/* IF HEADER LINES IS LONG, THEN OVERLAY WITH READMORE */}
          {headerLines > 1 ? (
            <div className="sm:hidden flex justify-items-start items-start flex-row w-full">
              <p
                className={
                  'flex-auto pl-14 sm:hidden ' +
                  (headerReadMore ? '' : 'truncate')
                }
              >
                <span className="font-semibold text-base">
                  {checkFormat(client_name)}
                </span>
                &nbsp;
                <span className="font-light text-base text-gray-500">
                  {checkFormat(matter_name)}
                  {/*headerReadMore ? checkFormat(matter_name) : ellipsis(checkFormat(matter_name),30)*/}
                </span>
              </p>
              <button
                onClick={() => setHeaderReadMore(!headerReadMore)}
                className="shrink-0 hover:bg-gray-100 text-gray-500 font-semibold rounded inline-flex items-center border-0 w-5 h-5 rounded-full outline-none focus:outline-none active:bg-current"
              >
                {!headerReadMore ? <FiChevronDown /> : <FiChevronUp />}
              </button>
            </div>
          ) : (
            <></>
          )}
        </div>

        <div
          className="block sm:bg-white sm:z-40 static sm:sticky"
          style={{ top: '67px' }}
        >
          <nav
            aria-label="Breadcrumb"
            style={style}
            className="ml-14 mb-5 sm:mb-0 sm:ml-0 sm:mt-4"
          >
            <ol
              role="list"
              className="px-0 flex items-left sm:space-x-2 lg:px-6 lg:max-w-7xl lg:px-8"
            >
              <li>
                <div className="flex items-center">
                  <Link
                    className="sm:mr-2 text-xs uppercase sm:normal-case sm:text-sm font-medium text-gray-400 sm:text-gray-900"
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
                  className="text-xs uppercase sm:normal-case sm:text-sm font-medium text-gray-400 sm:text-gray-900"
                  to={`${
                    AppRoutes.BRIEFS
                  }/${matter_id}/?matter_name=${utf8_to_b64(
                    matter_name
                  )}&client_name=${utf8_to_b64(client_name)}`}
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
                  className="text-xs uppercase sm:normal-case sm:text-sm underline underline-offset-4 sm:no-underline font-medium text-gray-700 sm:text-gray-500"
                  to={`${
                    AppRoutes.FILEBUCKET
                  }/${matter_id}/000/?matter_name=${utf8_to_b64(
                    matter_name
                  )}&client_name=${utf8_to_b64(client_name)}`}
                >
                  File Bucket
                </Link>
              </li>
            </ol>
          </nav>

          <div className="hidden sm:block p-2 left-0 "></div>
          {files !== null && files.length !== 0 && (
            <div className="hidden sm:block w-full mb-3 pb-2">
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
          <div className="hidden sm:grid z-50 pl-2 py-1 grid-cols-1 gap-4">
            <div className="">
              {matterFiles !== null && matterFiles.length !== 0 && (
                <input
                  type="checkbox"
                  className="mt-1 mr-3 px-2"
                  onChange={(e) => checkAll(e)}
                  checked={isAllChecked ? true : false}
                />
              )}
              <button
                className="bg-white hover:bg-gray-300 text-black font-semibold py-1 px-5 rounded inline-flex items-center border-0 shadow outline-none focus:outline-none focus:ring"
                onClick={() => setShowUploadModal(true)}
              >
                FILE UPLOAD &nbsp;
                <FiUpload />
              </button>
              <div className="inline-flex">
                {showCopyToBackgroundButton && (
                  <button
                    className="bg-white hover:bg-gray-300 text-black font-semibold py-1 px-5 rounded inline-flex items-center border-0 shadow outline-none focus:outline-none focus:ring mx-2"
                    onClick={() => handleShowCopyOptions()}
                  >
                    COPY TO BACKGROUND PAGE &nbsp;
                    <FiCopy />
                  </button>
                )}
                {copyOptions && (
                  <div className="w-72 h-38 z-50 bg-white absolute mt-10 ml-2 rounded border-0 shadow outline-none">
                    <div className="flex">
                      <p className="px-2 py-2 text-gray-400 text-xs font-semibold">
                        Results
                      </p>
                      <button
                        className={
                          copyBgIds
                            ? 'px-2 py-2 text-blue-400 text-xs font-semibold ml-16 cursor-pointer'
                            : 'px-2 py-2 text-blue-200 text-xs font-semibold ml-16'
                        }
                        onClick={() => handleCopyToBg()}
                        disabled={copyBgIds ? false : true}
                      >
                        Copy To Background
                      </button>
                    </div>

                    <Multiselect
                      isObject={false}
                      onSelect={(event) => handleFilterChange(event)}
                      onRemove={(event) => handleFilterRemoveChange(event)}
                      options={copyBgOptions.map((x) => x.label)}
                      value={selected}
                      showCheckbox
                      className="z-50"
                      placeholder={'Search'}
                    />
                  </div>
                )}
              </div>

              {showAttachBackgroundButton && backgroundRowId !== '000' && (
                <button
                  className="bg-blue-400 hover:bg-blue-300 text-white font-semibold py-1 px-5 rounded inline-flex items-center border-0 shadow outline-none focus:outline-none focus:ring"
                  onClick={() => tagBackgroundFile()}
                >
                  Attach to Background &nbsp;|
                  <BsArrowLeft />
                </button>
              )}

              {/* {matterFiles !== null &&
                matterFiles.length !== 0 &&
                showRemoveFileButton && (
                  <button
                    className="bg-green-500 hover:bg-gray-300 text-black font-semibold py-1 px-5 rounded inline-flex items-center border-0 shadow outline-none focus:outline-none focus:ring mx-2"
                    onClick={() => addFileBucketToBackground()}
                  >
                    COPY TO BACKGROUND PAGE &nbsp;
                    <FiCopy />
                  </button>
                )} */}

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
                    filterModalState
                      ? 'bg-gray-400 text-white font-semibold py-1 px-5 ml-3 rounded items-center border-0 shadow outline-none focus:outline-none focus:ring '
                      : 'bg-gray-800 hover:bg-blue-400 text-white font-semibold py-1 px-5 ml-3 rounded items-center border-0 shadow outline-none focus:outline-none focus:ring '
                  }
                  onClick={
                    filterModalState
                      ? () => showAlert()
                      : () => setFilterLabels(true)
                  }
                  disabled={filterModalState}
                >
                  <AiFillTags />
                </button>
              </div>
            </div>

            <div className=" grid justify-items-end mr-0"></div>
          </div>
        </div>

        <div className="hidden sm:block px-2 py-0 left-0">
          <p className={'text-lg mt-3 font-medium'}>FILES</p>
        </div>

        {
          // filteredFiles !== null ?
          // (
          //   <span className="py-5 px-5">FILTERED FILES</span>
          // ) :
            matterFiles === null ? (
              <Loading content={'Please wait...'} />
            ) : (
              <>
              {matterFiles.length === 0 &&
              (searchFile === undefined || searchFile === '') ? (
                <div className="bg-white rounded-lg sm:rounded-none sm:p-5 sm:px-5 sm:py-1 left-0">
                  <div
                    className="w-full flex items-center sm:flex-none sm:h-42 sm:bg-gray-100 sm:rounded-lg sm:border sm:border-gray-200 sm:mb-6 sm:py-1 sm:px-1"
                    style={{ height: width > 640 ? 'auto' : contentHeight }}
                  >
                    {width > 640 ? (
                      <BlankState
                        title={'items'}
                        txtLink={'file upload button'}
                        handleClick={() => setShowUploadModal(true)}
                      />
                    ) : (
                      <BlankStateMobile
                        header={'There are no items to show in this view.'}
                        content={
                          'Any uploaded files in the desktop will appear here'
                        }
                        svg={Illustration}
                      />
                    )}
                  </div>
                </div>
              ) : (
                <>
                  {matterFiles !== null && matterFiles.length !== 0 ? (
                    <>
                      {/*DESKTOP VIEW */}
                      {width > 640 ? (
                        <>
                          <ScrollToTop
                            smooth
                            color="rgb(117, 117, 114);"
                            style={{ padding: '0.4rem' }}
                          />
                          <div className="hidden sm:block">
                            <div className="shadow border-b border-gray-200 sm:rounded-lg my-5">
                              <DragDropContext onDragEnd={handleDragEnd}>
                                <table className="table-fixed min-w-full divide-y divide-gray-200 text-xs">
                                  <thead
                                    className="bg-gray-100 z-20"
                                    style={{ position: 'sticky', top: '235px' }}
                                  >
                                    <tr>
                                      <th className="px-2 py-4 text-center whitespace-nowrap">
                                        Item No.
                                      </th>
                                      <th className="px-2 py-4 text-center inline-flex whitespace-nowrap">
                                        <span className="ml-4">
                                          Date &nbsp;
                                        </span>
                                        {/* <img
                                      src={barsFilter}
                                      className="text-2xl w-4 mx-4"
                                      alt="filter"
                                      onClick={SortBydate}
                                      style={{ cursor: "pointer" }}
                                    /> */}
                                        {(() => {
                                          if (ascDesc == null) {
                                            return (
                                              <FaSort
                                                className="mx-auto inline-block"
                                                alt="Sort"
                                                title="Sort"
                                                onClick={SortBydate}
                                                style={{ cursor: 'pointer' }}
                                              />
                                            );
                                          } else if (ascDesc === true) {
                                            return (
                                              <BsSortUpAlt
                                                className="mx-auto inline-block"
                                                alt="Sort"
                                                title="Sort"
                                                onClick={SortBydate}
                                                style={{ cursor: 'pointer' }}
                                              />
                                            );
                                          } else if (ascDesc === false) {
                                            return (
                                              <BsSortDown
                                                className="mx-auto inline-block"
                                                alt="Sort"
                                                title="Sort"
                                                onClick={SortBydate}
                                                style={{ cursor: 'pointer' }}
                                              />
                                            );
                                          }
                                        })()}
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
                                            rowCount={matterFiles.length}
                                            rowRenderer={({ key, index, style, parent }) => {
                                              const data = matterFiles[index];
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
                                                            ...provider.draggableProps
                                                              .style,
                                                            backgroundColor:
                                                              snapshot.isDragging ||
                                                              (active &&
                                                                data.id === selected)
                                                                ? 'rgba(255, 255, 239, 0.767)'
                                                                : 'white',
                                                          }}
                                                        >
                                                          <td
                                                            {...provider.dragHandleProps}
                                                            className="px-2 py-3 align-top w-1/12"
                                                          >
                                                            <div className="grid grid-cols-1 border-l-2">
                                                              <div className="inline-flex mb-16">
                                                                <MdDragIndicator
                                                                  className="text-2xl"
                                                                  onClick={() =>
                                                                    handleChageBackground(
                                                                      data.id
                                                                    )
                                                                  }
                                                                />
                                                                <input
                                                                  className="cursor-pointer mr-1"
                                                                  onChange={
                                                                    handleSelectItem
                                                                  }
                                                                  type="checkbox"
                                                                  checked={selectedItems.includes(
                                                                    data.id
                                                                  )}
                                                                  value={data.id}
                                                                  id={`data-${data.id}`}
                                                                  disabled={
                                                                    deletingState
                                                                      ? true
                                                                      : false
                                                                  }
                                                                />

                                                                <span className="text-xs mt-1">
                                                                  {index + 1}
                                                                </span>
                                                              </div>

                                                              {data.backgrounds.items
                                                                .sort((a, b) =>
                                                                  a.order > b.order
                                                                    ? 1
                                                                    : -1
                                                                )
                                                                .map(
                                                                  (
                                                                    background,
                                                                    counter
                                                                  ) => (
                                                                    <div className="text-xs flex ml-7 mt-7 border-l-2 pt-0.5 ">
                                                                      {index + 1}.
                                                                      {counter + 1}
                                                                    </div>
                                                                  )
                                                                )}
                                                            </div>
                                                          </td>
                                                          <td className="align-top py-2 w-1/12">
                                                            <div className="inline-flex mb-16">
                                                              <DatePicker
                                                                popperProps={{
                                                                  positionFixed: true,
                                                                }}
                                                                className="border w-28 rounded text-xs py-2 px-1 border-gray-300"
                                                                dateFormat="dd MMM yyyy"
                                                                selected={
                                                                  data.date === null
                                                                    ? null
                                                                    : data.date ===
                                                                      undefined
                                                                    ? null
                                                                    : new Date(data.date)
                                                                }
                                                                placeholderText="No Date"
                                                                onChange={(selected) =>
                                                                  handleChangeDate(
                                                                    selected,
                                                                    data.id
                                                                  )
                                                                }
                                                              />
                                                              {/* <p>{data.date === undefined? "null" : data.date}</p> */}
                                                            </div>

                                                            {data.backgrounds.items
                                                              .sort((a, b) =>
                                                                a.order > b.order ? 1 : -1
                                                              )
                                                              .map(
                                                                (background, index) => (
                                                                  <div className="text-xs block mt-2">
                                                                    <DatePicker
                                                                      popperProps={{
                                                                        positionFixed: true,
                                                                      }}
                                                                      className=" mt-1 border w-28 rounded text-xs py-2 px-1 border-gray-300"
                                                                      dateFormat="dd MMM yyyy"
                                                                      selected={
                                                                        background.date ===
                                                                        null
                                                                          ? null
                                                                          : background.date ===
                                                                            undefined
                                                                          ? null
                                                                          : new Date(
                                                                              background.date
                                                                            )
                                                                      }
                                                                      placeholderText="No Date"
                                                                      onChange={(
                                                                        selected
                                                                      ) =>
                                                                        handleChangeDateBackground(
                                                                          selected,
                                                                          background.id,
                                                                          data.id
                                                                        )
                                                                      }
                                                                    />
                                                                  </div>
                                                                )
                                                              )}
                                                          </td>
                                                          <td
                                                            {...provider.dragHandleProps}
                                                            className="px-2 py-3 align-top place-items-center relative flex-wrap w-1/6"
                                                          >
                                                            <div className="inline-flex">
                                                              {data.type
                                                                .split('/')
                                                                .slice(0, -1)
                                                                .join('/') === 'image' ? (
                                                                <GrDocumentImage className="text-2xl" />
                                                              ) : data.type
                                                                  .split('/')
                                                                  .slice(0, -1)
                                                                  .join('/') ===
                                                                'audio' ? (
                                                                <FaRegFileAudio className="text-2xl" />
                                                              ) : data.type
                                                                  .split('/')
                                                                  .slice(0, -1)
                                                                  .join('/') ===
                                                                'video' ? (
                                                                <FaRegFileVideo className="text-2xl" />
                                                              ) : data.type
                                                                  .split('/')
                                                                  .slice(0, -1)
                                                                  .join('/') ===
                                                                'text' ? (
                                                                <GrDocumentTxt className="text-2xl" />
                                                              ) : data.type
                                                                  .split('/')
                                                                  .slice(0, -1)
                                                                  .join('/') ===
                                                                  'application' &&
                                                                data.type
                                                                  .split('.')
                                                                  .pop() === 'sheet' ? (
                                                                <GrDocumentExcel className="text-2xl" />
                                                              ) : data.type
                                                                  .split('/')
                                                                  .slice(0, -1)
                                                                  .join('/') ===
                                                                  'application' &&
                                                                data.type
                                                                  .split('.')
                                                                  .pop() ===
                                                                  'document' ? (
                                                                <GrDocumentWord className="text-2xl" />
                                                              ) : data.type
                                                                  .split('/')
                                                                  .slice(0, -1)
                                                                  .join('/') ===
                                                                  'application' &&
                                                                data.type
                                                                  .split('.')
                                                                  .pop() === 'text' ? (
                                                                <GrDocumentText className="text-2xl" />
                                                              ) : data.type
                                                                  .split('/')
                                                                  .slice(0, -1)
                                                                  .join('/') ===
                                                                'application' ? (
                                                                <GrDocumentPdf className="text-2xl" />
                                                              ) : (
                                                                <GrDocumentText className="text-2xl" />
                                                              )}
                                                              &nbsp;&nbsp;
                                                              <span
                                                                className="p-2 w-52 font-poppins"
                                                                style={{
                                                                  cursor: 'auto',
                                                                  outlineColor:
                                                                    'rgb(204, 204, 204, 0.5)',
                                                                  outlineWidth: 'thin',
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
                                                                  handleOnChangeName(
                                                                    event
                                                                  )
                                                                }
                                                                onBlur={(e) =>
                                                                  handleSaveName(
                                                                    e,
                                                                    data.name,
                                                                    data.id
                                                                  )
                                                                }
                                                                contentEditable={
                                                                  updateProgess
                                                                    ? false
                                                                    : true
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
                                                              {data.id === fileId &&
                                                                fileAlert}
                                                            </p>{' '}
                                                            {/* do not change */}
                                                          </td>
                                                          <td
                                                            {...provider.dragHandleProps}
                                                            className="px-2 py-3 align-top place-items-center relative flex-wrap w-1/4"
                                                          >
                                                            <div className="flex mb-12">
                                                              <span
                                                                className={
                                                                  data.id ===
                                                                  descriptionClassId
                                                                    ? 'w-96 p-2 font-poppins h-full mx-2'
                                                                    : 'w-96 p-2 font-poppins h-full mx-2 single-line'
                                                                }
                                                                style={{
                                                                  cursor: 'auto',
                                                                  outlineColor:
                                                                    'rgb(204, 204, 204, 0.5)',
                                                                  outlineWidth: 'thin',
                                                                  maxHeight: "100px",
                                                                  overflowY: "auto"
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
                                                                  handleOnChangeDetails(
                                                                    event
                                                                  )
                                                                }
                                                                onBlur={(e) =>
                                                                  handleSaveDetails(
                                                                    e,
                                                                    data.details,
                                                                    data.id
                                                                  )
                                                                }
                                                                contentEditable={
                                                                  updateProgess
                                                                    ? false
                                                                    : true
                                                                }
                                                                dangerouslySetInnerHTML={{
                                                                  __html: data.details,
                                                                }}
                                                              ></span>
                                                              {data.details === null ||
                                                              data.details ===
                                                                undefined ||
                                                              data.details === '' ||
                                                              data.details.length < 47 ? (
                                                                <p></p>
                                                              ) : data.id ===
                                                                descriptionClassId ? (
                                                                <p></p>
                                                              ) : (
                                                                <p className="py-2 -ml-1">
                                                                  ...
                                                                </p>
                                                              )}
                                                            </div>
                                                            <br />
                                                            <span className="text-red-400 filename-validation">
                                                              {data.id === detId &&
                                                                descAlert}
                                                            </span>

                                                            {data.backgrounds.items
                                                              .sort((a, b) =>
                                                                a.order > b.order ? 1 : -1
                                                              )
                                                              .map((background, i) => (
                                                                <div className="flex mt-3.5">
                                                                  <span
                                                                    className={
                                                                      background.id ===
                                                                      descriptionClassId
                                                                        ? 'w-full p-2 font-poppins h-full mx-2'
                                                                        : 'w-96 p-2 font-poppins h-full mx-2 single-line'
                                                                    }
                                                                    style={{
                                                                      cursor: 'auto',
                                                                      outlineColor:
                                                                        'rgb(204, 204, 204, 0.5)',
                                                                      outlineWidth:
                                                                        'thin',
                                                                      maxHeight: "35px",
                                                                      overflowY: "auto"
                                                                    }}
                                                                    suppressContentEditableWarning
                                                                    onClick={(event) =>
                                                                      handleDescContent(
                                                                        event,
                                                                        background.description,
                                                                        background.id,
                                                                        index + '-' + i
                                                                      )
                                                                    }
                                                                    dangerouslySetInnerHTML={{
                                                                      __html:
                                                                        background.description,
                                                                    }}
                                                                    onInput={(event) =>
                                                                      handleChangeDesc(
                                                                        event
                                                                      )
                                                                    }
                                                                    onBlur={(e) =>
                                                                      handleSaveDesc(
                                                                        e,
                                                                        background.description,
                                                                        background.date,
                                                                        background.id
                                                                      )
                                                                    }
                                                                    contentEditable={true}
                                                                    ref={(el) =>
                                                                      (itemsRef.current[
                                                                        index + '-' + i
                                                                      ] = el)
                                                                    }
                                                                    onFocus={(e) =>
                                                                      handleChangeDescription(
                                                                        e,
                                                                        background.description,
                                                                        background.id,
                                                                        index + '-' + i
                                                                      )
                                                                    }
                                                                  ></span>
                                                                  {background.description ===
                                                                    null ||
                                                                  background.description ===
                                                                    undefined ||
                                                                  background.description ===
                                                                    '' ||
                                                                  background.description
                                                                    .length < 47 ? (
                                                                    <p></p>
                                                                  ) : background.id ===
                                                                    descriptionClassId ? (
                                                                    <p></p>
                                                                  ) : (
                                                                    <p className="py-2 -ml-1">
                                                                      ...
                                                                    </p>
                                                                  )}
                                                                </div>
                                                              ))}
                                                          </td>
                                                          <td
                                                            {...provider.dragHandleProps}
                                                            className="px-2 py-3 align-top place-items-center relative flex-wrap w-1/6"
                                                          >
                                                            <CreatableSelect
                                                              defaultValue={() =>
                                                                defaultOptions(
                                                                  data.labels.items
                                                                )
                                                              }
                                                              options={labels}
                                                              isMulti
                                                              isClearable
                                                              isSearchable
                                                              openMenuOnClick={true}
                                                              onChange={(e) =>
                                                                handleLabelChanged(
                                                                  data.id,
                                                                  e,
                                                                  data.labels.items
                                                                )
                                                              }
                                                              placeholder="Labels"
                                                              className="w-60 placeholder-blueGray-300 text-blueGray-600 text-xs bg-white rounded text-sm border-0 shadow outline-none focus:outline-none focus:ring z-100"
                                                            />
                                                          </td>
                                                          <td
                                                            {...provider.dragHandleProps}
                                                            className="px-2 py-3 align-top place-items-center relative flex-wrap w-2/6"
                                                          >
                                                            <div className="grid grid-cols-1">
                                                              <div className="flex mb-24"></div>

                                                              {data.backgrounds.items
                                                                .sort((a, b) =>
                                                                  a.order > b.order
                                                                    ? 1
                                                                    : -1
                                                                )
                                                                .map(
                                                                  (background, index) =>
                                                                    background.briefs
                                                                      .items[0] ===
                                                                      null ||
                                                                    background.briefs
                                                                      .items[0] ===
                                                                      undefined ? (
                                                                      <div
                                                                        className="h-10.5 py-3 p-1 mb-1.5"
                                                                        key={
                                                                          background.id
                                                                        }
                                                                        index={index}
                                                                      ></div>
                                                                    ) : (
                                                                      <div
                                                                        className="h-10.5 py-3 p-1 mb-1.5 text-xs bg-gray-100  hover:bg-gray-900 hover:text-white rounded-lg cursor-pointer flex"
                                                                        key={
                                                                          background.id
                                                                        }
                                                                        index={index}
                                                                        onClick={(
                                                                          event
                                                                        ) =>
                                                                          handleRedirectLink(
                                                                            event,
                                                                            background.id
                                                                          )
                                                                        }
                                                                      >
                                                                        <b>
                                                                          {background.order +
                                                                            '. ' +
                                                                            background
                                                                              .briefs
                                                                              .items[0]
                                                                              .name}
                                                                        </b>
                                                                      </div>
                                                                    )
                                                                )}
                                                            </div>
                                                          </td>
                                                        </tr>
                                                      )}
                                                    </Draggable>
                                                  
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
                            </div>
                            <div>
                            </div>
                            <div className="p-2"></div>
                          </div>
                        </>
                      ) : (
                        <>
                          {/* MOBILE VIEW */}
                          <div
                            className="flex flex-col py-5 bg-white rounded-lg sm:hidden"
                            style={{ height: contentHeight }}
                          >
                            <div className="px-5">
                              <p className="text-cyan-400 text-right">
                                <button
                                  onClick={() =>
                                    setIsExpandAllActive(!isExpandAllActive)
                                  }
                                >
                                  {isExpandAllActive ? (
                                    <>
                                      &nbsp;Collapse All{' '}
                                      <FiChevronsUp className="inline" />
                                    </>
                                  ) : (
                                    <>
                                      &nbsp;Expand All{' '}
                                      <FiChevronsDown className="inline" />
                                    </>
                                  )}
                                </button>
                              </p>
                            </div>
                            <div
                              id="mobileContent"
                              onScroll={(e) => handleScrollEvent(e)}
                              className="px-5 overflow-y-auto h-min"
                              style={{ scrollBehavior: 'smooth' }}
                            >
                              {showScrollButton ? (
                                <>
                                  <div
                                    className="scrollButtonsFileBucket flex"
                                    onClick={() => handleScrollToTop()}
                                  >
                                    <BiArrowToTop
                                      style={{
                                        color: 'white',
                                        display: 'block',
                                        margin: 'auto',
                                      }}
                                    />
                                  </div>
                                </>
                              ) : (
                                <></>
                              )}
                              {matterFiles.map((data, index, arr) => (
                                <div
                                  key={data.id}
                                  className="flex flex-col"
                                  style={{
                                    borderBottomWidth:
                                      index + 1 !== arr.length ? 2 : 0,
                                    borderBottomStyle: 'dashed',
                                    paddingTop: index === 0 ? 0 : 20,
                                    paddingBottom:
                                      index + 1 !== arr.length ? 20 : 0,
                                  }}
                                >
                                  <div className="flex flex-row">
                                    <div className="flex flex-col relative">
                                      <div
                                        className="absolute left-0 right-0 mx-auto bottom-2 rounded-full bg-gray-200"
                                        style={{
                                          height: '5.5px',
                                          width: '5.5px',
                                        }}
                                      ></div>
                                      <div className="font-semibold text-cyan-400">
                                        {index + 1}
                                      </div>
                                      <div
                                        className="relative flex-auto mb-2"
                                        style={{
                                          backgroundImage:
                                            'linear-gradient(#e5e7eb, #e5e7eb)',
                                          backgroundSize: '1px 100%',
                                          backgroundRepeat: 'no-repeat',
                                          backgroundPosition: 'center center',
                                        }}
                                      ></div>
                                    </div>
                                    <div className="ml-2 flex flex-col flex-auto">
                                      <div className="w-full">
                                        <p className="font-medium text-cyan-400">
                                          {(data.date !== null) |
                                          (data.date !== undefined)
                                            ? dateFormat(
                                                data.date,
                                                'dd mmmm yyyy'
                                              )
                                            : 'NO DATE'}
                                        </p>
                                        <div className="flex flex-row">
                                          <div className="flex-auto">
                                            <p
                                              className={
                                                !isReadMoreExpandedOuter(
                                                  data.id
                                                )
                                                  ? 'line-clamp-2'
                                                  : ''
                                              }
                                            >
                                              {' '}
                                              {data.name}{' '}
                                            </p>
                                          </div>
                                          <AiOutlineDownload
                                            className="ml-1 flex-none text-cyan-400 text-base cursor-pointer"
                                            onClick={() =>
                                              previewAndDownloadFile(data.id)
                                            }
                                          />
                                        </div>
                                        <p
                                          id={data.id + '.desc'}
                                          className={
                                            (isReadMoreExpandedOuter(data.id) &&
                                            data.details
                                              ? !isReadMoreExpandedDesc(data.id)
                                                ? ' line-clamp-5 '
                                                : ' '
                                              : ' hidden ') + ' mt-1'
                                          }
                                        >
                                          {data.details}&nbsp;
                                        </p>
                                        <button
                                          id={data.id + '.descButton'}
                                          className="text-cyan-400"
                                          onClick={() =>
                                            handleReadMoreStateDesc(data.id)
                                          }
                                        >
                                          read more...
                                        </button>
                                        <button
                                          className={
                                            (!isReadMoreExpandedOuter(
                                              data.id
                                            ) &&
                                            (data.backgrounds.items === null ||
                                              data.backgrounds.items.length ===
                                                0) &&
                                            data.details !== '' &&
                                            data.details !== null
                                              ? 'block'
                                              : 'hidden') +
                                            ' text-cyan-400 mt-1'
                                          }
                                          onClick={() =>
                                            handleReadMoreStateOuter(data.id)
                                          }
                                        >
                                          read more{' '}
                                          <FiChevronDown className="inline" />
                                        </button>
                                      </div>
                                      {data.backgrounds.items
                                        .sort((a, b) =>
                                          a.order > b.order ? 1 : -1
                                        )
                                        .map((background, counter, arr) => (
                                          <>
                                            <div
                                              className={
                                                (isReadMoreExpandedOuter(
                                                  data.id
                                                ) || counter == arr.length - 1
                                                  ? 'block'
                                                  : 'hidden') +
                                                ' flex flex-row mt-1'
                                              }
                                              key={background.id}
                                            >
                                              <div
                                                className={
                                                  (isReadMoreExpandedOuter(
                                                    data.id
                                                  )
                                                    ? 'text-cyan-400'
                                                    : 'text-gray-300') +
                                                  ' font-semibold'
                                                }
                                              >
                                                {index + 1}.{counter + 1}
                                              </div>
                                              <div className="ml-2">
                                                <p
                                                  className={
                                                    (!isReadMoreExpandedOuter(
                                                      data.id
                                                    )
                                                      ? 'block'
                                                      : 'hidden') +
                                                    ' text-cyan-400'
                                                  }
                                                >
                                                  <button
                                                    onClick={() =>
                                                      handleReadMoreStateOuter(
                                                        data.id
                                                      )
                                                    }
                                                  >
                                                    read more{' '}
                                                    <FiChevronDown className="inline" />
                                                  </button>
                                                </p>
                                                <p className="font-medium text-cyan-400">
                                                  <span
                                                    className={
                                                      (isReadMoreExpandedOuter(
                                                        data.id
                                                      )
                                                        ? 'inline-block'
                                                        : 'hidden') +
                                                      ' font-medium'
                                                    }
                                                  >
                                                    {(background.date !==
                                                      null) |
                                                    (background.date !==
                                                      undefined)
                                                      ? dateFormat(
                                                          background.date,
                                                          'dd mmmm yyyy'
                                                        )
                                                      : 'NO DATE'}
                                                    &nbsp;
                                                  </span>
                                                  <button
                                                    className={
                                                      isReadMoreExpandedOuter(
                                                        data.id
                                                      ) &&
                                                      background.description !==
                                                        null &&
                                                      background.description !==
                                                        ''
                                                        ? 'inline-block'
                                                        : 'hidden'
                                                    }
                                                    onClick={() =>
                                                      handleReadMoreStateInner(
                                                        data.id,
                                                        background.id
                                                      )
                                                    }
                                                  >
                                                    {!isReadMoreExpandedInner(
                                                      data.id,
                                                      background.id
                                                    ) ? (
                                                      <span>
                                                        &nbsp; read more{' '}
                                                        <FiChevronDown className="inline" />
                                                      </span>
                                                    ) : (
                                                      <span>
                                                        &nbsp; read less{' '}
                                                        <FiChevronUp className="inline" />
                                                      </span>
                                                    )}
                                                  </button>
                                                </p>
                                              </div>
                                            </div>
                                            <p
                                              className={
                                                isReadMoreExpandedInner(
                                                  data.id,
                                                  background.id
                                                )
                                                  ? 'block'
                                                  : 'hidden'
                                              }
                                            >
                                              {background.description}
                                            </p>
                                          </>
                                        ))}
                                      {isReadMoreExpandedDesc(data.id) |
                                        isReadMoreExpandedOuter(data.id) &&
                                      ((data.details !== '') &
                                        (data.details !== undefined) &
                                        (data.details !== null)) |
                                        ((data.backgrounds.items !== null) &
                                          (data.backgrounds.items.length >
                                            0)) ? (
                                        <button
                                          className="h-5 block relative mt-1 text-cyan-400 text-xs self-start"
                                          onClick={() =>
                                            handleCollapseAll(data.id)
                                          }
                                        >
                                          collapse all{' '}
                                          <FiChevronUp className="inline" />
                                        </button>
                                      ) : (
                                        <></>
                                      )}
                                    </div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        </>
                      )}
                    </>
                  ) : (
                    <div className="p-5 px-5 py-1 left-0">
                      <div className="w-full h-42 mb-6 py-1 px-1 grid justify-items-center">
                        <NoResultState
                          searchKey={searchFile}
                          message={
                            'Check the spelling, try a more general term or look up a specific File.'
                          }
                        />
                      </div>
                    </div>
                  )}
                </>
              )}
            </>
          )
        }
      </div>
      {showRemoveFileModal && (
        <RemoveFileModal
          handleSave={handleDeleteFile}
          handleModalClose={handleModalClose}
        />
      )}

      {showUploadModal && (
        <UploadLinkModal
          title={''}
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
      {showSessionTimeout && <SessionTimeout />}
    </>
  );
}
