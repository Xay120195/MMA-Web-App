import React, { useEffect, useState, useRef } from "react";
import { Link } from "react-router-dom";
import { AppRoutes } from "../../constants/AppRoutes";
import { useParams } from "react-router-dom";
import { MdArrowBackIos } from "react-icons/md";
import { useIdleTimer } from "react-idle-timer";
import BreadCrumb from "../breadcrumb/breadcrumb";
import { AiOutlineFolderOpen, AiOutlineDownload} from "react-icons/ai";
import TableInfo from "./table-info";
import ActionButtons from "./action-buttons";
import ToastNotification from "../toast-notification";
import * as IoIcons from "react-icons/io";
import { BiArrowToTop } from "react-icons/bi";
import { BitlyClient } from "bitly-react";
import "../../assets/styles/BackgroundPage.css";
import "../../assets/styles/Mobile.css";
import { API } from "aws-amplify";
import SessionTimeout from "../session-timeout/session-timeout-modal";
import { Auth } from "aws-amplify";
import { Redirect, useHistory } from "react-router-dom";
import useWindowDimensions from "../../shared/windowDimensions";
import {FiChevronDown, FiChevronUp} from "react-icons/fi";
import dateFormat from "dateformat";
import "../../assets/styles/BlankState.css";
import BlankStateMobile from "../mobile-blank-state";
import MobileHeader from "../mobile-header";
import Illustration from "../../assets/images/no-data.svg";

// const contentDiv = {
//   margin: "0 0 0 65px",
// };

// const mainGrid = {
//   display: "grid",
//   gridtemplatecolumn: "1fr auto",
// };
  
const Background = () => {
  //const [matterList, setClientMattersList] = useState([]);
  const [background, setBackground] = useState([]);
  const [files, setFiles] = useState([]);
  const [idList, setIdList] = useState([]);
  const [getId, setId] = useState([{}]);
  const [fileMatter, setFileMatter] = useState([]);
  const params = useParams();
  const { matter_id, background_id } = params;
  const [checkAllState, setcheckAllState] = useState(false);
  const [search, setSearch] = useState("");
  const [ShowModalParagraph, setShowModalParagraph] = useState(false);
  const [selectRow, setSelectRow] = useState([]);
  const [newRow, setNewRow] = useState([{}]);
  const [selectedItems, setSelectedItems] = useState([]);

  const [srcIndex, setSrcIndex] = useState("");
  const [checkedState, setCheckedState] = useState(
    new Array(background.length).fill(false)
  );
  const [selectedId, setSelectedId] = useState(0);
  const [totalChecked, settotalChecked] = useState(0);
  const [selectedRowsBG, setSelectedRowsBG] = useState([]);
  const [paragraph, setParagraph] = useState("");
  const [showDeleteButton, setShowDeleteButton] = useState(false);
  const [ascDesc, setAscDesc] = useState(null);
  const [activateButton, setActivateButton] = useState(false);
  const [pasteButton, setPasteButton] = useState(false);
  const [selectedRowsBGFiles, setSelectedRowsBGFiles] = useState([]);
  const [wait, setWait] = useState(false);
  // let selectedRowsBG = [];

  const [checkNo, setCheckNo] = useState(true);
  const [checkDate, setCheckDate] = useState(true);
  const [checkDesc, setCheckDesc] = useState(true);
  const [checkDocu, setCheckDocu] = useState(true);
  const [pageTotal, setPageTotal] = useState(0);
  const [pageSize, setPageSize] = useState(20);
  const [pageIndex, setPageIndex] = useState(1);
  const [vNextToken, setVnextToken] = useState(null);
  const [vPrevToken, setVprevToken] = useState([]);
  const [loading, setLoading] = useState(false);
  const [maxLoading, setMaxLoading] = useState(false);
  const [briefName, setBriefName] = useState("");
  const [briefId, setBriefId] = useState("");
  const [validationAlert, setValidationAlert] = useState("");
  const [alertMessage, setalertMessage] = useState();
  const [showToast, setShowToast] = useState(false);
  const [checkedStateShowHide, setCheckedStateShowHide] = useState([]);
  const [searchDescription, setSearchDescription] = useState("");
  const [shareLink, setShareLink] = useState("");
  const [holdDelete, setHoldDelete] = useState(false);
  const [targetRow, setTargetRow] = useState("");
  const [highlightRow, setHighlightRow] = useState(null);

  const [pastedRows, setPastedRows] = useState([]);
  const [checkedRows, setCheckedRows] = useState([]);

  let history = useHistory();
  const check = useRef(false);
  const [showSessionTimeout, setShowSessionTimeout] = useState(false);

  useEffect(() => {
    getBackground();

    if (bgName === null) {
      getBriefs();
    }
    //convertUrl();
  }, []);

  const hideToast = () => {
    setShowToast(false);
  };

  const getName = `
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

  const [bgName, setBGName] = useState(null);

  const qListBackground = `
    query listBackground($id: ID, $limit: Int, $nextToken: String, $sortOrder: OrderBy) {
      clientMatter(id: $id) {
        id
        backgrounds (limit: $limit, nextToken: $nextToken, sortOrder:$sortOrder) {
          items {
            id
            description
            date
            createdAt
            order
            files {
              items {
                id
                details
                name
                type
              }
            }
          }
          nextToken
        }
      }
    }
  `;

  const qBriefBackgroundList = `
    query getBriefByID($limit: Int, $nextToken: String, $id: ID, $sortOrder: OrderBy) {
      brief(id: $id) {
        id
        backgrounds(limit: $limit, nextToken: $nextToken, sortOrder: $sortOrder) {
          items {
            id
            description
            date
            createdAt
            order
            files {
              items {
                id
                name
              }
            }
          }
          nextToken
        }
      }
    }  
  `;

  const getBackground = async () => {
    console.log("getBackground()");
    let result = [];
    setWait(false);

    // if (background_id === "000") {
    // Remove this condition after migration
    //   const backgroundOpt = await API.graphql({
    //     query: qListBackground,
    //     variables: { id: matter_id, limit: 25, nextToken: vNextToken },
    //   });

    //   setVnextToken(backgroundOpt.data.clientMatter.backgrounds.nextToken);

    //   if (backgroundOpt.data.clientMatter.backgrounds.items !== null) {
    //     result = backgroundOpt.data.clientMatter.backgrounds.items.map(
    //       ({ id, description, date, createdAt, order, files }) => ({
    //         createdAt: createdAt,
    //         id: id,
    //         description: description,
    //         date: date,
    //         order: order,
    //         files: files,
    //       })
    //     );

    //     setPageTotal(result.length);
    //     setPageSize(20);
    //     setPageIndex(1);

    //     if (background !== null) {
    //       setBackground(sortByOrder(result));
    //       setWait(true);
    //       setMaxLoading(false);
    //     }
    //   }
    // } else {
    var backgroundOpt;
    if(width < 640){
      backgroundOpt = await API.graphql({
        query: qBriefBackgroundList,
        variables: {
          id: background_id,
          nextToken: null,
          sortOrder: "ORDER_ASC",
          limit: 50
        },
      });
    }else{
      backgroundOpt = await API.graphql({
        query: qBriefBackgroundList,
        variables: {
          id: background_id,
          nextToken: null,
          sortOrder: "ORDER_ASC",
        },
      });
    }
    

    var arrConcatPrevToken = vPrevToken.concat(vNextToken);
    setVprevToken([...new Set(arrConcatPrevToken)]);
    console.log("PREV TOKEN: ", arrConcatPrevToken);

    setVnextToken(backgroundOpt.data.brief.backgrounds.nextToken);
    console.log("InitialLoad If NextToken: ", backgroundOpt.data.brief.backgrounds.nextToken);

    if (backgroundOpt.data.brief.backgrounds.items !== null) {
      result = backgroundOpt.data.brief.backgrounds.items.map(
        ({ id, description, date, createdAt, order, files }) => ({
          createdAt: createdAt,
          id: id,
          description: description,
          date: date,
          order: order,
          files: files,
        })
      );

      setPageTotal(result.length);
      setPageSize(20);
      setPageIndex(1);

      if (background !== null) {
        console.log("I AM IN HERE", result);
        // setBackground(sortByOrder(result)); // no sorting needed
        setBackground(sortByOrder(result));
        setWait(true);
        setMaxLoading(false);
      }
    }
    //}
  };

  const getBriefs = async () => {
    console.log("matterid", matter_id);
    const params = {
      query: getName,
      variables: {
        id: matter_id,
        limit: 50,
        nextToken: null,
      },
    };

    await API.graphql(params).then((brief) => {
      const matterFilesList = brief.data.clientMatter.briefs.items;
      console.log("mfl", matterFilesList);
      matterFilesList.map((x) =>
        x.id === background_id ? setBGName(x.name) : x
      );
    });
  };

  const loadMoreBackground = async () => {
    if (background_id === "000") {
      // Remove this condition after migration
      if (vNextToken !== null && !loading) {
        setLoading(true);
        let result = [];

        const backgroundOpt = await API.graphql({
          query: qListBackground,
          variables: {
            id: matter_id,
            limit: 50,
            nextToken: vNextToken,
            sortOrder: "ORDER_ASC",
          },
        });

        setVnextToken(backgroundOpt.data.clientMatter.backgrounds.nextToken);

        console.log("Loadmore If NextToken: ", backgroundOpt.data.clientMatter.backgrounds.nextToken);

        if (backgroundOpt.data.clientMatter.backgrounds.items !== null) {
          result = backgroundOpt.data.clientMatter.backgrounds.items.map(
            ({ id, description, date, createdAt, order, files }) => ({
              createdAt: createdAt,
              id: id,
              description: description,
              date: date,
              order: order,
              files: files,
            })
          );

          if (background !== "") {
            setTimeout(() => {
              setLoading(false);
              setMaxLoading(false);

              let arrConcat = background.concat(result);
              setBackground([...new Set(sortByOrder(arrConcat))]);
             
              // setBackground(result);
            }, 1000);
          }
        }
      } else {
        console.log("Last Result!- Migration");
        setMaxLoading(true);
      }
    } else {
      if (vNextToken !== null && !loading) {
        setLoading(true);
        let result = [];

        const backgroundOpt = await API.graphql({
          query: qBriefBackgroundList,
          variables: {
            id: background_id,
            limit: 50,
            nextToken: vNextToken,
            sortOrder: "ORDER_ASC",
          },
        });

        var arrConcatPrevToken = vPrevToken.concat(vNextToken);
        setVprevToken([...new Set(arrConcatPrevToken)]);
        console.log("PREV TOKEN: ", arrConcatPrevToken);

        setVnextToken(backgroundOpt.data.brief.backgrounds.nextToken);

        //console.log("Loadmore If NextToken: ", backgroundOpt.data.brief.backgrounds.nextToken);

        if (backgroundOpt.data.brief.backgrounds.items !== null) {
          result = backgroundOpt.data.brief.backgrounds.items.map(
            ({ id, description, date, createdAt, order, files }) => ({
              createdAt: createdAt,
              id: id,
              description: description,
              date: date,
              order: order,
              files: files,
            })
          );

          if (background !== "") {
              setLoading(false);
              setMaxLoading(false);

              var arrConcat = background.concat(result);

              if (searchDescription !== "") {
                arrConcat = background
                  .concat(result)
                  .filter((x) =>
                    x.description
                      .toLowerCase()
                      .includes(searchDescription.toLowerCase())
                  );
              }
             
              setBackground([...new Set(sortByOrder(arrConcat))]);
             
              //setBackground(result);
          }
        }
      } else {
        console.log("Last Result!- NEW");
        setMaxLoading(true);
      }
    }
  };

  const loadPrevBackground = async () => {
    if (vPrevToken.length > 1 && !loading) {
      setLoading(true);
      let result = [];

      const lastTokenFrom = vPrevToken.slice(-1);

      const updatedToken = vPrevToken.filter(x => !new Set(lastTokenFrom).has(x));

      const lastTokenQuery = updatedToken.slice(-1);

      const backgroundOpt = await API.graphql({
        query: qBriefBackgroundList,
        variables: {
          id: background_id,
          limit: 50,
          nextToken: lastTokenQuery[0],
          sortOrder: "ORDER_ASC",
        },
      });

      setVprevToken(updatedToken);
      setVnextToken(backgroundOpt.data.brief.backgrounds.nextToken);

      if (backgroundOpt.data.brief.backgrounds.items !== null) {
        result = backgroundOpt.data.brief.backgrounds.items.map(
          ({ id, description, date, createdAt, order, files }) => ({
            createdAt: createdAt,
            id: id,
            description: description,
            date: date,
            order: order,
            files: files,
          })
        );

        if (background !== "") {
            setLoading(false);
            setMaxLoading(false);

            var arrConcat = background.concat(result);

            if (searchDescription !== "") {
              arrConcat = background
                .concat(result)
                .filter((x) =>
                  x.description
                    .toLowerCase()
                    .includes(searchDescription.toLowerCase())
                );
            }

            setBackground(result);
        }
      }
    } else {
      console.log("Last Result!- NEW");
      setMaxLoading(true);
    }
  }

  var timeoutId;

  const handleOnAction = (event) => {
    if(width < 640){
      loadMoreBackground();
    }

    //function for detecting if user moved/clicked.
    //if modal is active and user moved, automatic logout (session expired)
    //check.current = false;
    if (showSessionTimeout) {
      setTimeout(() => {
        Auth.signOut().then(() => {
          clearLocalStorage();
          console.log("Sign out completed.");
          history.push("/");
        });

        function clearLocalStorage() {
          localStorage.removeItem("userId");
          localStorage.removeItem("email");
          localStorage.removeItem("firstName");
          localStorage.removeItem("lastName");
          localStorage.removeItem("userType");
          localStorage.removeItem("company");
          localStorage.removeItem("companyId");
          localStorage.removeItem("access");
        }
      }, 3000);
    }

    clearTimeout(timeoutId);
  };

  const handleOnIdle = (event) => {
    if(width < 640){
      loadMoreBackground();
    }
    

    //function for detecting if user is on idle.
    //after 30 mins, session-timeout modal will show
    // check.current = true;
    timeoutId = setTimeout(() => {
      setShowSessionTimeout(true);
    }, 60000 * 60);

  };

  useIdleTimer({
    timeout: 60 * 40,
    onAction: handleOnAction,
    onIdle: handleOnIdle,
    debounce: 1000,
  });

  const SortBydate = async () => {
    let result = [];
    setWait(false); // trigger loading ...
    setLoading(false);
    setMaxLoading(false);
    setVnextToken(null);

    if (ascDesc == null) {
      setAscDesc(true);
      //setBackground(background.sort(compareValues("date")));

      const backgroundOpt = await API.graphql({
        query: qBriefBackgroundList,
        variables: {
          id: background_id,
          nextToken: null,
          sortOrder: "DATE_ASC",
        },
      });

      if (backgroundOpt.data.brief.backgrounds.items !== null) {
        // result = backgroundOpt.data.brief.backgrounds.items.map(
        //   ({ id, description, date, createdAt, order, files }) => ({
        //     createdAt: createdAt,
        //     id: id,
        //     description: description,
        //     date: date,
        //     order: order,
        //     files: files,
        //   })
        // );

        result = backgroundOpt.data.brief.backgrounds.items;

        if (background !== null) {
          console.log(result);
          setBackground(result);
          setWait(true);
          setMaxLoading(false);
          setVnextToken(null);
        }
      }
    } else if (ascDesc === true) {
      console.log("set order by Date DESC");
      setAscDesc(false);
      //setBackground(background.sort(compareValues("date", "desc")));

      const backgroundOpt = await API.graphql({
        query: qBriefBackgroundList,
        variables: {
          id: background_id,
          nextToken: null,
          sortOrder: "DATE_DESC",
        },
      });

      if (backgroundOpt.data.brief.backgrounds.items !== null) {
        // result = backgroundOpt.data.brief.backgrounds.items.map(
        //   ({ id, description, date, createdAt, order, files }) => ({
        //     createdAt: createdAt,
        //     id: id,
        //     description: description,
        //     date: date,
        //     order: order,
        //     files: files,
        //   })
        // );

        result = backgroundOpt.data.brief.backgrounds.items;

        if (background !== null) {
          console.log(result);
          setBackground(result);
          setWait(true);
          setMaxLoading(false);
          setVnextToken(null);
        }
      }
    } else if (!ascDesc) {
      console.log("set order by DEFAULT: Order ASC");
      setAscDesc(null); // default to sort by order
      getBackground();
      //setBackground(background.sort(compareValues("order")));
    }

    console.groupEnd();
  };

  function sortByOrder(arr) {
    // const isAllZero = arr.every((item) => item.order >= 0 && item.order !== 0);
    // if (isAllZero) {
    //   sort = arr.sort(
    //     (a, b) =>
    //       a.order - b.order || new Date(b.createdAt) - new Date(a.createdAt)
    //   );
    // } else {
    //   sort = arr;
    // }
    let sort;

    if (arr) {
      sort = arr.sort((a, b) =>
        a.order - b.order === 0
          ? new Date(b.createdAt) - new Date(a.createdAt)
          : a.order - b.order
      );
    } else {
      sort = arr;
    }

    return sort;
  }

  const handleManageFiles = () => {
      setPastedRows([]);
      setCheckedRows([]);
      setSelectedRowsBGFiles([]);
      setActivateButton(!activateButton);
  };

  let pageSizeConst = pageSize >= pageTotal ? pageTotal : pageSize;

  const getPaginateItems = async (action) => {
    let pageList = 20;

    if (action === "next") {
      setPageIndex(pageIndex + pageList);
      setPageSize(pageSize + pageList);
    } else if (action === "prev") {
      setPageIndex(pageIndex - pageList);
      setPageSize(pageSize - pageList);
    }
  };

  function getParameterByName(name, url = window.location.href) {
    name = name.replace(/[\[\]]/g, "\\$&");
    var regex = new RegExp("[?&]" + name + "(=([^&#]*)|&|#|$)"),
      results = regex.exec(url);
    if (!results) return null;
    if (!results[2]) return "";
    return decodeURIComponent(results[2].replace(/\+/g, " "));
  }

  function b64_to_utf8(str) {
    return decodeURIComponent(escape(window.atob(str)));
  }

  const m_name = getParameterByName("matter_name");
  const c_name = getParameterByName("client_name");
  const backgroundRowId = getParameterByName("background_id");
  const matter_name = b64_to_utf8(m_name);
  const client_name = b64_to_utf8(c_name);

  function b64EncodeUnicode(str) {
    return btoa(encodeURIComponent(str));
  }

  const handleNameContent = (e, name, id) => {
    if (!validationAlert) {
      setBriefName(!name ? "" : name);
      setBriefId(id);
      setValidationAlert("");
    } else {
      setBriefName("");
    }
  };

  //Updating brief name
  const mUpdateBriefName = `mutation updateBriefName($id: ID, $name: String) {
    briefUpdate(id: $id, name: $name) {
      id
    }
  }`;

  const handleOnChangeBiefName = (e) => {
    setBriefName(e.currentTarget.textContent);
  };

  const handleSaveBriefName = (e, name, id) => {
    const originalString = briefName.replace(/(<([^>]+)>)/gi, "");
    const final = originalString.replace(/\&nbsp;/g, " ");

    if (briefName.length <= 0) {
      setValidationAlert("Brief Name is required");
      setBGName(bgName);
    } else if (briefName === name) {
      setValidationAlert("");
      const data = {
        id,
        name: e.target.innerHTML,
      };
      updateBriefName(data);
      setBGName(final);

      setalertMessage(`Successfully updated Background title`);
      setShowToast(true);

      setTimeout(() => {
        setShowToast(false);
        setalertMessage("");
      }, 1000);
    } else {
      setValidationAlert("");
      const data = {
        id,
        name: e.target.innerHTML,
      };
      updateBriefName(data);
      setBGName(final);

      setalertMessage(`Successfully updated Background title`);
      setShowToast(true);

      setTimeout(() => {
        setShowToast(false);
        setalertMessage("");
      }, 1000);
    }
  };

  async function updateBriefName(data) {
    return new Promise((resolve, reject) => {
      try {
        const request = API.graphql({
          query: mUpdateBriefName,
          variables: {
            id: data.id,
            name: data.name,
          },
        });
        resolve(request);
      } catch (e) {
        reject(e.errors[0].message);
      }
    });
  }

  useEffect(() => {
    if (searchDescription !== undefined) {
      filterRecord(searchDescription);
    }
  }, [searchDescription]);

  const handleSearchDescriptionChange = (e) => {
    setSearchDescription(e.target.value);
  };

  const filterRecord = (v) => {
    if (v === "") {
      // Refresh page if necessary
      setVnextToken(null);
      getBackground();
    } else {
      const filterRecord = background.filter((x) =>
        x.description.toLowerCase().includes(v.toLowerCase())
      );
      console.log("filterRecord:", filterRecord);
      // setBackground(sortByOrder(filterRecord));
      setBackground(filterRecord);
    }
  };

  const bitly = new BitlyClient("e1540f03fd3f2318262342ac1a0d144e5407f7be", {});
  /* To be used when tinyurl is required
  const convertUrl = async () => {
    let result;
    try {
      result = await bitly.shorten('https://develop.d3bhf42tem9b8e.amplifyapp.com/background/407e3619-cb0d-4bee-9f63-1258c0e00686/4dd99da7-f8c3-4fdd-8af5-3d2237180e9e/?matter_name=TWF0dGVyIDE=&client_name=Q2xpZW50IDE=');
    } catch (e) {
      throw e;
    }
    setShareLink(result.url);
  }
  */
  const qGetFileDownloadLink = `
  query getFileDownloadLink($id: ID) {
    file(id: $id) {
      downloadURL
    }
  }`;

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

  const checkFormat = (str) => {
    var check = str;
    check = check.replace("%20", " "); //returns my_name
    return check;
  };

  const style = {
    paddingLeft: "0rem",
  };

  function utf8_to_b64(str) {
    return window.btoa(unescape(encodeURIComponent(str)));
  }
  {/* MOBILE CONST */}
  const [contentHeight, setContentHeight] = useState();
  const [showScrollButton, setShowScrollButton] = useState(false);
  const [isAllFilesSelectedButton, setIsAllFilesSelectedButton] = useState(true);
  const {height, width} = useWindowDimensions();
  const [readMoreState, setReadMoreState] = useState([]);

  function countLines(tag) {
    var divHeight = tag.offsetHeight
    var lineHeight = parseInt(window.getComputedStyle(tag).getPropertyValue("line-height"));
    var lines = Math.round(divHeight / lineHeight);
    return lines;
  }

  useEffect(()=> {
    if(background!=null) {
      background.map((data)=>{
        var descTag = document.getElementById(data.id+".desc");
        var fileTag = document.getElementById(data.id+".files");
        if(descTag!== null) {
          var descLines = countLines(descTag);
          var fileLines = countLines(fileTag);
          var descButtonTag = document.getElementById(data.id+".descButton");
          if(descLines > 6 || fileLines > 1) {
            descButtonTag.style.display = "inline-block";
          } else {
            descButtonTag.style.display = 'none';
          }
        }
      })
    }
    
  }, [background, readMoreState, width])

  function handleScrollEvent(e) {
    const top = e.target.scrollTop > 20;
    if (top) {
      setShowScrollButton(true);
    } else {
      setShowScrollButton(false);
    }
  }
  function handleScrollToTop () {
    let d = document.getElementById("mobileContent");
    d.scrollTo(0, 0);
  }

  function handleReadMoreState(fileId) {
    if(readMoreState.find((temp)=>{
      return temp === fileId;
    }) === undefined) {
      setReadMoreState([...readMoreState, fileId]);
    } else {
      setReadMoreState(current => current.filter((id)=> {
        return id !== fileId;
      }));
    }
  }

  function isReadMoreExpanded(fileId) {
    return readMoreState.find((temp)=>{
      return temp === fileId;
    }) !== undefined;
  }


  return (
    <>
      <div
        className={"sm: shadow-lg sm:rounded bg-gray-100 sm:bg-white z-30 p-5 sm:p-0 contentDiv"}
      >
        <div className="hidden sm:block px-6 mt-5 -ml-1">
          <Link
            to={`${
              AppRoutes.BRIEFS
            }/${matter_id}/?matter_name=${b64EncodeUnicode(
              matter_name
            )}&client_name=${b64EncodeUnicode(client_name)}`}
          >
            <button className="bg-white hover:bg-gray-100 text-black font-semibold py-2.5 px-4 rounded inline-flex items-center border-0 shadow outline-none focus:outline-none focus:ring mb-3">
              <MdArrowBackIos />
              Back
            </button>
          </Link>
        </div>
        <div
          style={{ position: "sticky", top: "0" }}
          className="py-5 z-30 ml-4 sbg-gray-100 sm:bg-white hidden sm:block"
        >
          <div className="flex font-bold text-xl">

              <p
                className="px-1 text-xl focus:outline-none text-gray-800 dark:text-gray-100 font-bold mb-1 min-w-min"
                dangerouslySetInnerHTML={{
                  __html: bgName,
                }}
              />
              &nbsp;<span className="text-xl">of</span>&nbsp;
              <span className="font-semibold text-xl">
                {client_name}/{matter_name}
              </span>
            
          </div>
        </div>
        <div className="hidden sm:block py-5 bg-gray-100 sm:bg-white z-40 absolute -mt-20 ml-5">
          <div className="flex font-bold text-3xl">
              <p
                suppressContentEditableWarning={true}
                style={{
                  cursor: "auto",
                  outlineColor: "rgb(204, 204, 204, 0.5)",
                  outlineWidth: "thin",
                }}
                onClick={(e) => handleNameContent(e, bgName, background_id)}
                contentEditable={true}
                tabIndex="0"
                onInput={(e) => handleOnChangeBiefName(e)}
                onBlur={(e) => handleSaveBriefName(e, bgName, background_id)}
                className="px-1 text-3xl focus:outline-none text-gray-800 dark:text-gray-100 font-bold mb-1 min-w-min"
                dangerouslySetInnerHTML={{
                  __html: bgName,
                }}
              />
              &nbsp;<span className="text-3xl">of</span>&nbsp;
              <span className="font-semibold text-3xl">
                {client_name}/{matter_name}
              </span>
            
          </div>
        </div>
        <div
          className="bg-gray-100 sm:bg-white z-30 sm:ml-4 static sm:sticky"
          style={{top: "72px" }}
        > 
          <div className="hidden sm:block">
            <BreadCrumb
              matterId={matter_id}
              client_name={client_name}
              matter_name={matter_name}
              briefId={background_id}
            />
          </div>
          <div className="pt-3 sm:hidden">
            {/* MOBILE VIEW OF HEADER */}
            <MobileHeader
              height = {height}
              width = {width}
              matter_name = {matter_name}
              client_name = {client_name}
              setContentHeight = {setContentHeight}
            />
            <div className="sm:px-0">
              <nav aria-label="Breadcrumb" style={style} className="ml-14 mb-5 sm:mb-0 sm:ml-0 sm:mt-4">
                <ol
                  role="list"
                  className="px-0 flex items-left sm:space-x-2 lg:px-6 lg:max-w-7xl lg:px-8"
                >
                  <li>
                    <Link
                      className="text-xs uppercase sm:normal-case sm:text-sm sm:mr-2 sm:text-sm font-medium text-gray-400 sm:text-gray-900"
                      to={`${AppRoutes.DASHBOARD}`}
                    >
                      Dashboard
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
                    <span className="text-xs sm:px-1 sm:flex uppercase sm:normal-case sm:text-sm underline underline-offset-4 sm:no-underline font-medium text-gray-700 sm:text-gray-500">
                      <AiOutlineFolderOpen className="hidden sm:inline-block"/> 
                      <span className="sm:inline hidden">&nbsp;&nbsp;</span>
                      Background
                      <span className="sm:inline hidden font-medium">&nbsp;Page</span>{" "}
                    </span>
                  </li>
                  <svg
                    width="16"
                    height="20"
                    viewBox="0 0 16 20"
                    fill="currentColor"
                    xmlns="http://www.w3.org/2000/svg"
                    aria-hidden="true"
                    className="sm:hidden w-4 h-5 text-gray-300"
                  >
                    <path d="M5.697 4.34L8.98 16.532h1.327L7.025 4.341H5.697z" />
                  </svg>
                  <li className="text-sm sm:hidden">
                    <Link
                      aria-current="page"
                      className="text-xs uppercase sm:normal-case sm:text-sm sm:mr-2 sm:text-sm font-medium text-gray-400 sm:text-gray-900"
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
            </div>
          </div>
          <div className="hidden sm:block">
            <ActionButtons
              setSelectedItems={setSelectedItems}
              selectedItems={selectedItems}
              background={background}
              setBackground={setBackground}
              idList={idList}
              checkAllState={checkAllState}
              setcheckAllState={setcheckAllState}
              checkedState={checkedState}
              setCheckedState={setCheckedState}
              totalChecked={totalChecked}
              settotalChecked={settotalChecked}
              setId={setId}
              search={search}
              setSearch={setSearch}
              getId={getId}
              matterId={matter_id}
              getBackground={getBackground}
              selectedRowsBG={selectedRowsBG}
              setSelectedRowsBG={setSelectedRowsBG}
              setShowModalParagraph={setShowModalParagraph}
              paragraph={paragraph}
              showDeleteButton={showDeleteButton}
              setShowDeleteButton={setShowDeleteButton}
              activateButton={activateButton}
              setactivateButton={setActivateButton}
              handleManageFiles={handleManageFiles}
              checkNo={checkNo}
              setCheckNo={setCheckNo}
              checkDate={checkDate}
              setCheckDate={setCheckDate}
              checkDesc={checkDesc}
              setCheckDesc={setCheckDesc}
              checkDocu={checkDocu}
              setCheckDocu={setCheckDocu}
              checkedStateShowHide={checkedStateShowHide}
              setCheckedStateShowHide={setCheckedStateShowHide}
              pageTotal={pageTotal}
              pageIndex={pageIndex}
              pageSize={pageSize}
              pageSizeConst={pageSizeConst}
              getPaginateItems={getPaginateItems}
              selectRow={selectRow}
              setSelectRow={setSelectRow}
              setPasteButton={setPasteButton}
              pasteButton={pasteButton}
              setSrcIndex={setSrcIndex}
              srcIndex={srcIndex}
              setNewRow={setNewRow}
              newRow={newRow}
              setMaxLoading={setMaxLoading}
              sortByOrder={sortByOrder}
              briefId={background_id}
              client_name={client_name}
              matter_name={matter_name}
              holdDelete={holdDelete}
              setHoldDelete={setHoldDelete}
              setTargetRow={setTargetRow}
              targetRow={targetRow}
              highlightRow={highlightRow}
              setHighlightRow={setHighlightRow}
              pastedRows={pastedRows}
              setPastedRows={setPastedRows}
            />
          </div>
          {/* {background !== null && background.length !== 0 && ( */}
          <div className="hidden sm:block pl-2 py-1 grid grid-cols-10 mb-3 pr-8">
            <div className="col-span-12">
              <span className="z-10 leading-snug font-normal text-center text-blueGray-300 absolute bg-transparent rounded text-base items-center justify-center w-8 py-3 px-3">
                <IoIcons.IoIosSearch />
              </span>
              <input
                type="search"
                placeholder="Type to search description in the Background ..."
                onChange={handleSearchDescriptionChange}
                className="px-3 py-3 placeholder-blueGray-300 text-blueGray-600 relative bg-white rounded text-sm border-0 shadow outline-none focus:outline-none focus:ring w-full pl-10"
              />
            </div>
            {/*<div className="hidden ml-2 inline-flex float-right">
              <button 
                className={vPrevToken.length > 1 ? "bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded-l" : "font-bold py-2 px-4 text-white bg-gray-300 rounded opacity-50 cursor-not-allowed"} 
                onClick={loadPrevBackground}
              >
                Prev
              </button>
              <button 
                className={vNextToken !== null ? "bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded-r" : "font-bold py-2 px-4 text-white bg-gray-300 rounded opacity-50 cursor-not-allowed"} 
                onClick={loadMoreBackground}
              >
                Next
              </button>
              </div>*/}
          </div>
          {/* )} */}
        </div>
        {/* DESKTOP VIEW OF CONTENTS */}
        {width > 640 ? (
          <TableInfo
          selectedItems={selectedItems}
          setSelectedItems={setSelectedItems}
          client_name={client_name}
          matter_name={matter_name}
          wait={wait}
          setPasteButton={setPasteButton}
          setIdList={setIdList}
          background={background}
          ShowModalParagraph={ShowModalParagraph}
          setShowModalParagraph={setShowModalParagraph}
          fileMatter={fileMatter}
          setFileMatter={setFileMatter}
          files={files}
          setFiles={setFiles}
          setBackground={setBackground}
          checkAllState={checkAllState}
          setcheckAllState={setcheckAllState}
          checkedState={checkedState}
          setCheckedState={setCheckedState}
          totalChecked={totalChecked}
          settotalChecked={settotalChecked}
          setId={setId}
          getId={getId}
          search={search}
          matterId={matter_id}
          getBackground={getBackground}
          selectedRowsBG={selectedRowsBG}
          setSelectedRowsBG={setSelectedRowsBG}
          paragraph={paragraph}
          setParagraph={setParagraph}
          showDeleteButton={showDeleteButton}
          setShowDeleteButton={setShowDeleteButton}
          handleManageFiles={handleManageFiles}
          setActivateButton={setActivateButton}
          activateButton={activateButton}
          setAscDesc={setAscDesc}
          ascDesc={ascDesc}
          setSelectedRowsBGFiles={setSelectedRowsBGFiles}
          selectedRowsBGFiles={selectedRowsBGFiles}
          setSelectedId={setSelectedId}
          selectedId={selectedId}
          pasteButton={pasteButton}
          checkNo={checkNo}
          checkDate={checkDate}
          checkDesc={checkDesc}
          checkDocu={checkDocu}
          checkedStateShowHide={checkedStateShowHide}
          setCheckedStateShowHide={setCheckedStateShowHide}
          pageTotal={pageTotal}
          pageIndex={pageIndex}
          pageSize={pageSize}
          pageSizeConst={pageSizeConst}
          loadMoreBackground={loadMoreBackground}
          selectRow={selectRow}
          setSelectRow={setSelectRow}
          setSrcIndex={setSrcIndex}
          srcIndex={srcIndex}
          newRow={newRow}
          setNewRow={setNewRow}
          loading={loading}
          setLoading={setLoading}
          setMaxLoading={setMaxLoading}
          maxLoading={maxLoading}
          sortByOrder={sortByOrder}
          SortBydate={SortBydate}
          briefId={background_id}
          searchDescription={searchDescription}
          holdDelete={holdDelete}
          setHoldDelete={setHoldDelete}
          setTargetRow={setTargetRow}
          targetRow={targetRow}
          highlightRow={highlightRow}
          setHighlightRow={setHighlightRow}
          pastedRows={pastedRows}
          setPastedRows={setPastedRows}
          checkedRows={checkedRows}
          setCheckedRows={setCheckedRows}
        />
        ) : (
        <>
        {/* MOBILE VIEW OF CONTENTS */}
        {background=== null || background.length === 0 ? (
        <div className="bg-white rounded-lg sm:rounded-none sm:p-5 sm:px-5 sm:py-1 left-0">
          <div className="w-full flex items-center sm:flex-none sm:h-42 sm:bg-gray-100 sm:rounded-lg sm:border sm:border-gray-200 sm:mb-6 sm:py-1 sm:px-1"
          style={{height:width > 640 ?"auto": contentHeight}}>
            <BlankStateMobile
              header={"There are no items to show in this view."}
              content={"Any added files in the desktop will appear here"}
              svg={Illustration}
            />
          </div>
        </div>
        ): (
          <div className="bg-white rounded-lg py-5 flex" style={{height:contentHeight}}>
                <div
                  id="mobileContent"
                  onScroll={(e) => handleScrollEvent(e)}
                  className="relative flex flex-col overflow-y-auto h-min w-full"
                  style={{ scrollBehavior: "smooth" }}
                >
                  {showScrollButton ? (<>
                <div className="scrollButtonInner flex" onClick={() => handleScrollToTop()}>
                  <BiArrowToTop style={{color:"white", display:"block", margin:"auto"}}/>
                </div>
                </>) : (<></>)}
              {background.map((item, index,arr)=>(
                <div className="w-full px-5" key={item.id}>
                  <div className="flex flex-row" style={{
                    borderBottomWidth: index+1 !== arr.length ? 2 : 0, 
                    borderBottomStyle:"dashed",
                    paddingTop:index===0 ? 0 : 20,
                    paddingBottom:  20 }}>
                    <p className="font-semibold text-cyan-400">{index +1}</p>
                    <div className="ml-2">
                      <p className="font-medium text-cyan-400">
                        {item.date !== null && item.date !== "" ? dateFormat(item.date,"dd mmmm yyyy") : "No date"}
                      </p>
                      {/* INVISIBLE DIV TO GET INITIAL DIV HEIGHT */}
                      <p 
                        id={item.id+".desc"}
                        className="absolute text-red-200 invisible pointer-events-none opacity-0" 
                        style={{top:-10000, zIndex:-1000, marginRight:'20px',wordBreak:"break-word"}}
                        dangerouslySetInnerHTML={{__html:item.description}}
                        >
                      </p>
                      <p 
                        className={(isReadMoreExpanded(item.id)? "" : "line-clamp-6")}
                        dangerouslySetInnerHTML={{__html:item.description}}
                        style={{wordBreak:"break-word"}}
                        >
                      </p>
                      <button id={item.id+".descButton"} className="text-cyan-400 mb-2" onClick={()=>handleReadMoreState(item.id)}>
                      {(isReadMoreExpanded(item.id) ? "read less...": "read more...")}
                      </button>
                        {/* INVISIBLE DIV TO GET INITIAL DIV HEIGHT */}
                        <p 
                          id={item.id+".files"} 
                          className="absolute text-red-200 invisible pointer-events-none opacity-0 break-words" 
                          style={{top:-10000, zIndex:-1000, marginRight:'20px',lineHeight:"30px", wordBreak:"break-word"}}>
                          {item.files.items.map((file) => (
                            <button 
                              key={file.id} 
                              className="font-extralight text-sm text-red-400 border rounded-lg px-2 mr-2 my-1"
                              onClick={() =>previewAndDownloadFile(file.id)}>
                              {file.name}&nbsp;
                              <AiOutlineDownload
                                className="text-gray-400 text-sm cursor-pointer inline-block"
                              />
                            </button>
                          ))}
                        </p>
                        <p 
                          className={(isReadMoreExpanded(item.id)? "" : "line-clamp-1") + " break-words"} 
                          style={{lineHeight:"30px", wordBreak:"break-word"}}>
                          {item.files.items.map((file) => (
                            <button 
                              key={file.id} 
                              className="font-extralight text-sm focus:text-cyan-400 focus:border-cyan-400 text-gray-400 border rounded-lg px-2 mr-2 my-1" 
                              onClick={() => previewAndDownloadFile(file.id)}>
                              {file.name}&nbsp;
                              <AiOutlineDownload
                                className="text-sm cursor-pointer inline-block"
                              />
                            </button>
                          ))}
                        </p>

                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
        </>
        )}
        {showToast && (
          <ToastNotification title={alertMessage} hideToast={hideToast} />
        )}
        {showSessionTimeout && <SessionTimeout />}
      </div>
    </>
  );
};

export default Background;
