import React, { useState, useEffect, useRef } from "react";
import { Redirect, useHistory } from "react-router-dom";
import BlankState from "../dynamic-blankstate";
import { HiOutlinePlusCircle } from "react-icons/hi";
import { MdArrowForwardIos, MdDownload, MdEdit, MdDelete } from "react-icons/md";
// import { matter_rfi, questions } from "./data-source";
import { AppRoutes } from "../../constants/AppRoutes";
// import CreateRFIModal from "./create-RFI-modal";
import ToastNotification from "../toast-notification";
import AccessControl from "../../shared/accessControl";
import { FaUserCircle } from "react-icons/fa";
import { AiOutlineFolderOpen } from "react-icons/ai";
import { BsFillTrashFill } from "react-icons/bs";
import * as FaIcons from "react-icons/fa";
import BlankList from "../../assets/images/RFI_Blank_List.svg";
import { useParams } from "react-router-dom";
import { API } from "aws-amplify";
import { Link } from "react-router-dom";
import CreateBriefsModal from "./create-brief-modal";
import { AiFillEye } from "react-icons/ai";
import { useIdleTimer } from "react-idle-timer";
import SessionTimeout from "../session-timeout/session-timeout-modal";
import { Auth } from "aws-amplify";
import RemoveBriefModal from "../briefs/remove-brief-modal";
import "../../assets/styles/Briefs.css";
import ScrollToTop from "react-scroll-to-top";
import { BiArrowToTop } from "react-icons/bi";


export default function Briefs() {
  const { matter_id } = useParams();

  const modalRFIAlertMsg = "Background successfully created.";

  const [showCreateRFIModal, setshowCreateRFIModal] = useState(false);

  // const [dataquestions, setQuestion] = useState(questions);
  const [searchTable, setSearchTable] = useState();

  const [showToast, setShowToast] = useState(false);
  const [showAddRow, setShowAddRow] = useState(false);
  const [allowUpdateQuestion, setAllowUpdateQuestion] = useState(false);
  const [allowUpdateResponse, setAllowUpdateResponse] = useState(false);
  const [alertMessage, setalertMessage] = useState();
  const [briefName, setBriefName] = useState("");
  const [briefId, setBriefId] = useState("");
  const [validationAlert, setValidationAlert] = useState("");
  const [showColumn, setShowColumn] = useState(false);
  const [showBName, setShowBame] = useState(true);
  const [showDate, setShowDate] = useState(true);
  const [showTag, setShowTag] = useState(true);

  const [Briefs, setBriefs] = useState(null);
  const [showCreateBriefsModal, setshowCreateBriefsModal] = useState(false);

  let history = useHistory();
  const bool = useRef(false);
  const [showSessionTimeout, setShowSessionTimeout] = useState(false);
  const [isHovering, setIsHovering] = useState(false);
  const [isHoveringId, setIsHoveringId] = useState(null);
  const [showRemoveBrief, setshowRemoveBrief] = useState(false);
  const [removeBriefId, setRemoveBriefId] = useState(null);
  

  const handleBlankStateClick = () => {
    // console.log("Blank State Button was clicked!");
    setshowCreateRFIModal(true);
  };

  const hideToast = () => {
    setShowToast(false);
  };

  var moment = require("moment");

  const [RFI, setRFI] = useState(null);

  const listRFI = `
    query listRFI($clientMatterId: ID) {
      clientMatter(id: $clientMatterId) {
        rfis {
          items {
            id
            name
            createdAt
          }
        }
      }
    }
    `;

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

  const mCreateRFI = `
    mutation createRFI($clientMatterId: String, $name: String) {
        rfiCreate(clientMatterId:$clientMatterId, name:$name) {
            id
            name
            createdAt
        }
    }
    `;

  const mCreateBrief = `
  mutation MyMutation($clientMatterId: String, $date: AWSDateTime, $name: String, $order: Int) {
    briefCreate(clientMatterId: $clientMatterId, date: $date, name: $name, order: $order) {
      id
      name
      date
      createdAt
    }
  }
  `;

  const mUpdateBriefName = `mutation updateBriefName($id: ID, $name: String) {
    briefUpdate(id: $id, name: $name) {
      id
    }
  }`;

  const getBriefs = async () => {
    console.log("matterid", matter_id);
    const params = {
      query: listBriefs,
      variables: {
        id: matter_id,
        limit: 100,
        nextToken: null,
      },
    };

    await API.graphql(params).then((brief) => {
      const matterFilesList = brief.data.clientMatter.briefs.items;
      console.log("mfl", matterFilesList);
      setBriefs(matterFilesList);
    });
  };

  function utf8_to_b64(str) {
    return window.btoa(unescape(encodeURIComponent(str)));
  }

  useEffect(() => {
    if (Briefs === null) {
      getBriefs();
    }
  });

  const handleSaveBrief = async (briefname) => {
    console.log("matterid", matter_id);
    console.log("briefname", briefname);

    // alert(briefname);

    const addBrief = await API.graphql({
      query: mCreateBrief,
      variables: {
        clientMatterId: matter_id,
        name: briefname,
        date: moment.utc(moment(new Date(), "YYYY-MM-DD")).toISOString(),
        order: 0,
      },
    });

    console.log("brief", addBrief);
    const getID = addBrief.data.briefCreate.id;

    handleModalClose();
    setShowToast(true);
    setTimeout(() => {
      setShowToast(false);
      getBriefs();
      history.push(
        `${
          AppRoutes.BACKGROUND
        }/${matter_id}/${getID}/?matter_name=${utf8_to_b64(
          matter_name
        )}&client_name=${utf8_to_b64(client_name)}`
      );
    }, 3000);
  };

  const handleModalClose = () => {
    setshowCreateBriefsModal(false);
    setshowRemoveBrief(false);
    setRemoveBriefId(null);
  };

  const mainGrid = {
    display: "grid",
    gridtemplatecolumn: "1fr auto",
  };

  const handleSearchChange = (e) => {
    console.log("L114" + e.target.value);
    setSearchTable(e.target.value);
  };

  const style = {
    paddingLeft: "0rem",
  };

  function visitBrief(id) {
    // history.push(`${AppRoutes.BACKGROUND}/${id}`);
    history.push(
      `${AppRoutes.BACKGROUND}/${matter_id}/${id}/?matter_name=${utf8_to_b64(
        matter_name
      )}&client_name=${utf8_to_b64(client_name)}`
    );
  }

  function getParameterByName(name, url = window.location.href) {
    name = name.replace(/[\[\]]/g, "\\$&");
    var regex = new RegExp("[?&]" + name + "(=([^&#]*)|&|#|$)"),
      results = regex.exec(url);
    if (!results) return null;
    if (!results[2]) return "";
    return decodeURIComponent(results[2].replace(/\+/g, " "));
  }

  function b64_to_utf8(str) {
    return decodeURIComponent(atob(str));
  }

  const m_name = getParameterByName("matter_name");
  const c_name = getParameterByName("client_name");
  const matter_name = b64_to_utf8(m_name);
  const client_name = b64_to_utf8(c_name);

  const handleNameContent = (e, name, id) => {
    if (!validationAlert) {
      setBriefName(!name ? "" : name);
      setBriefId(id);
      setValidationAlert("");
    } else {
      setBriefName("");
    }
  };

  const handleOnChangeBiefName = (e) => {
    setBriefName(e.currentTarget.textContent);
  };

  const handleSaveBriefName = (e, name, id) => {
    const originalString = briefName.replace(/(<([^>]+)>)/gi, "");
    const final = originalString.replace(/\&nbsp;/g, " ");

    const updateName = Briefs.map((x) => {
      if (x.id === id) {
        return {
          ...x,
          name: e.target.innerHTML,
        };
      }
      return x;
    });
    setBriefs(updateName);

    if (briefName.length <= 0) {
      setValidationAlert("Brief Name is required");
    } else if (briefName === name) {
      setValidationAlert("");
      const data = {
        id,
        name: e.target.innerHTML,
      };
      const success = updateBriefName(data);
      if (success) {
        setalertMessage(`Successfully updated ${final} `);
        setShowToast(true);

        setTimeout(() => {
          setShowToast(false);
          setalertMessage("");
        }, 1000);
      }
    } else {
      setValidationAlert("");
      const data = {
        id,
        name: e.target.innerHTML,
      };

      const success = updateBriefName(data);
      if (success) {
        setalertMessage(`Successfully updated ${final} `);
        setShowToast(true);
        setTimeout(() => {
          setShowToast(false);
          setalertMessage("");
        }, 1000);
      }
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

  const formatDisplayDate = (val) => {
    let date = new Date(val);
    const day = date.toLocaleString("default", { day: "2-digit" });
    const month = date.toLocaleString("default", { month: "short" });
    const year = date.toLocaleString("default", { year: "numeric" });
    return day + " " + month + " " + year;
  };

  const handleColumn = () => {
    if (!showColumn) {
      setShowColumn(true);
    } else {
      setShowColumn(false);
    }
  };

  const handleChecBName = () => {
    if (showBName) {
      setShowBame(false);
    } else {
      setShowBame(true);
    }
  };

  const handleCheckDate = () => {
    if (showDate) {
      setShowDate(false);
    } else {
      setShowDate(true);
    }
  };

  const handleCheckTag = () => {
    if (showTag) {
      setShowTag(false);
    } else {
      setShowTag(true);
    }
  };

  var timeoutId;
  
  //session timeout
  const handleOnAction = (event) => {
    console.log("user is clicking");

    //function for detecting if user moved/clicked.
    //if modal is active and user moved, automatic logout (session expired)
    bool.current = false;
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
    console.log("user is idle");
    //function for detecting if user is on idle.
    //after 30 mins, session-timeout modal will show
    //bool.current = true;
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

  const hoverRef = React.useRef(null);

  const handleMouseOver = (event) => {
    setIsHovering(true);
    setIsHoveringId(event.target.dataset.info);
  };

  

  const handleMouseOut = () => {
    setIsHovering(false);
    setIsHoveringId(null);
  };

  const handleShowRemoveModal = (briefId) => {
    setshowRemoveBrief(true);
    setRemoveBriefId(briefId);
  };

  const handleDelete = (id) => {
    const mSoftDeleteBrief = `
      mutation softDeleteBriefById($id: ID) {
        briefSoftDelete(id: $id) {
          id
        }
      }
      
      `;

    const deletedId = API.graphql({
      query: mSoftDeleteBrief,
      variables: {
        id: id,
      },
    });

    
    setalertMessage(`Successfully Deleted.`);
    setShowToast(true);
    setshowRemoveBrief(false);

    setTimeout(() => {
      setShowToast(false);
      setRemoveBriefId(null);
      getBriefs();
    }, 2000);
    
  };

  return (
    <>
      <ScrollToTop
        smooth
        component={<BiArrowToTop style={{color:"white", display:"block", margin:"auto"}}/>}
        className="sm:hidden scrollButton"
        style={{borderRadius: "50%"}}
      />
      <div
        className={
          "bg-gray-100 p-5 min-h-screen relative flex flex-col min-w-0 break-words sm:min-h-0 sm:mb-6 sm:shadow-lg sm:rounded sm:bg-white contentDiv"
        }
      >
        <div className="relative py-2 sm:p-0 sm:flex-grow sm:flex-1">
          <div className="flex flex-row">
            <div className="flex-grow">
              <h1 className="font-bold text-right text-base px-2 sm:px-0 sm:text-3xl sm:text-left">
                Background Page
                <span className="hidden sm:inline text-base sm:text-3xl">&nbsp;of&nbsp;</span>
                <br className="sm:hidden"/>
                <span className="text-base font-semibold sm:text-3xl">
                  {client_name}/{matter_name}
                </span>
              </h1>
            </div>
            <div className="flex shrink-0 items-center sm:absolute sm:right-0">
              <Link to={AppRoutes.DASHBOARD}>
                <button className="hidden align-middle sm:inline-flex shrink-0 bg-white hover:bg-gray-100 text-black font-semibold py-2.5 px-4 rounded items-center border-0 shadow outline-none focus:outline-none focus:ring">
                  Back &nbsp;
                  <MdArrowForwardIos />
                </button>
                <button className="sm:hidden shrink-0 bg-white hover:bg-gray-100 text-black font-semibold rounded inline-flex items-center border-0 w-9 h-9 rounded-full shadow-md outline-none focus:outline-none focus:ring">
                  <MdArrowForwardIos style={{
                    margin:"auto"
                  }}/>
                </button>
              </Link>
            </div>
          </div>
          <div className="hidden sm:block px-3 sm:px-0">
            <nav aria-label="Breadcrumb" style={style} className="mt-4">
              <ol
                role="list"
                className="px-0 flex items-left space-x-2 lg:px-6 lg:max-w-7xl lg:px-8"
              >
                <li>
                  <Link
                    className="mr-2 text-sm font-medium text-gray-900"
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
                  <span className="font-medium text-gray-500 px-1 flex">
                    <AiOutlineFolderOpen /> &nbsp; Background Page{" "}
                  </span>
                </li>
              </ol>
            </nav>
          </div>

          <div className="mt-4 sm:mt-7">
            <div className="flex sm:block">
              <button
                type="button"
                className="hidden bg-green-100 hover:bg-green-100 text-green-500 text-sm py-1 px-4 rounded sm:inline-flex items-center border border-green-500 shadow focus:ring mx-2"
                onClick={() => setshowCreateBriefsModal(true)}
              >
                NEW BACKGROUND &nbsp; <HiOutlinePlusCircle />
              </button>
              <button
                type="button"
                className={
                  "hidden hover:bg-gray-200 text-black text-sm py-2 px-4 rounded sm:inline-flex items-center border-0 shadow outline-none focus:outline-none focus:ring mx-2"
                }
                onClick={handleColumn}
              >
                SHOW/HIDE COLUMNS &nbsp; <AiFillEye />
              </button>
              <button
                type="button"
                className={
                  "order-last bg-white hover:bg-gray-200 text-black text-sm py-2 px-4 rounded inline-flex sm:hidden items-center border-0 shadow outline-none focus:outline-none focus:ring ml-2"
                }
                onClick={handleColumn}
              >
                 <AiFillEye />
              </button>
              {showColumn && (
                <div
                  className="h-40 z-50 bg-white absolute sm:mt-2 rounded border-0 shadow outline-none showColumn"
                >
                  <p className="px-2 py-2 mx-2 mt-2 sm:mx-5 text-gray-400 text-xs font-semibold">
                    COLUMN OPTIONS
                  </p>

                  <div className="mx-2 sm:mx-5">
                    <div className="inline-flex">
                      <input
                        type="checkbox"
                        className="cursor-pointer mx-2 mt-1"
                        // checked={data.isVisible}
                        checked={showBName ? true : false}
                        onChange={handleChecBName}
                      />
                      <label className="mb-2">Brief Name</label>
                    </div>
                    <br />
                    <div className="inline-flex">
                      <input
                        checked={showDate ? true : false}
                        type="checkbox"
                        className="cursor-pointer mx-2 mt-1"
                        onChange={handleCheckDate}
                      />
                      <label className="mb-2">Date</label>
                    </div>
                    <br />
                    <div className="inline-flex">
                      <input
                        type="checkbox"
                        className="cursor-pointer mx-2 mt-1"
                        checked={showTag ? true : false}
                        onChange={handleCheckTag}
                        // checked={data.isVisible}
                      />
                      <label className="mb-2">Tags</label>
                    </div>
                  </div>
                </div>
              )}

              <input
                type="search"
                placeholder="Search ..."
                onChange={handleSearchChange}
                className="px-3 py-3 placeholder-blueGray-300 text-blueGray-600 relative bg-white rounded text-sm border-0 shadow outline-none focus:outline-none focus:ring pl-5 float-right w-full sm:w-3/12 "
              />
            </div>
          </div>
        </div>

        {Briefs === null ? (
          <div> </div>
        ) : Briefs.length === 0 ? (
          <div className="sm:p-5 sm:px-5 sm:py-1 left-0 mt-5">
            <div className="w-full h-42 bg-white sm:bg-gray-100 rounded-lg border border-gray-200 mb-6 py-1 px-1">
              <BlankState
                displayText={"There are no items to show in this view"}
                txtLink={"add new Background"}
                iconDisplay={BlankList}
                handleClick={() => setshowCreateBriefsModal(true)}
              />
            </div>
          </div>
        ) : (
          <div className="shadow overflow-hidden border-b bg-white sm:border-gray-200 rounded-lg my-5 p-5 pb-0 sm:p-0">
            {Briefs.map((item) => (
              <div
                className="w-90 bg-gray-100 rounded-lg border border-gray-200 mb-6 p-5 sm:py-4 sm:px-4 sm:m-2
                hover:border-black cursor-pointer"
                key={item.id}
                data-info={item.id}
                onMouseOver={handleMouseOver} 
                onMouseOut={handleMouseOut}
              >
                <div >
                  <div className="grid grid-cols-4 gap-4" onClick={() => visitBrief(item.id)} >
                    <div
                      className={`col-span-2 ${
                        !showBName && `py-2 px-2 mb-2`
                      } ${!showDate && `py-1 px-1 mb-2`}`}
                    >
                      {showBName && (
                        <>
                          <div className="inline-flex w-full" 
                          data-info={item.id}
                          onMouseOver={handleMouseOver} 
                          onMouseOut={handleMouseOut}
                          >
                            <p
                              suppressContentEditableWarning={true}
                              style={{
                                cursor: "auto",
                                outlineColor: "rgb(204, 204, 204, 0.5)",
                                outlineWidth: "thin",
                              }}
                              data-info={item.id}
                              onMouseOver={handleMouseOver} 
                              onMouseOut={handleMouseOut}
                              onClick={(e) =>
                                handleNameContent(e, item.name, item.id)
                              }
                              onClickCapture={e => e.stopPropagation()} 
                              contentEditable={true}
                              tabIndex="0"
                              onInput={(e) => handleOnChangeBiefName(e)}
                              onBlur={(e) =>
                                handleSaveBriefName(e, item.name, item.id)
                              }
                              className="inline-flex items-center focus:outline-none text-gray-800 dark:text-gray-100 font-bold mb-1"
                              dangerouslySetInnerHTML={{
                                __html: item.name,
                              }}
                            />
                            {isHovering && isHoveringId === item.id && (
                              <div
                              >
                                <MdEdit className="text-blue-500 hover:text-blue-300 inline-flex items-center ml-2 mr-1" 
                                onClickCapture={e => e.stopPropagation()}
                                />
                              </div>
                            )}
                          </div>
                        </>
                      )}

                      {showDate && (
                        <p
                          data-info={item.id}
                          onMouseOver={handleMouseOver} 
                          onMouseOut={handleMouseOut}
                          tabIndex="0"
                          className="focus:outline-none text-gray-400 dark:text-gray-100 text-xs"
                        >
                          {item.date ? formatDisplayDate(item.date) : "No date"}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="float-right inline-flex -mt-10 mr-8" onClick={() => visitBrief(item.id)} >
                    {showTag && <FaUserCircle className={`h-10 w-10 `} />}
                    {/* <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className={`h-7 w-7 my-1 mx-1 cursor-pointer ${
                        !showBName && !showDate && !showTag && `mt-3`
                      }`}
                      viewBox="0 0 20 20"
                      fill="currentColor"
                      onClick={() => visitBrief(item.id)}
                    >
                      <path
                        fillRule="evenodd"
                        d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
                        clipRule="evenodd"
                      />
                    </svg> */}
                  </div>
                  <div className="float-right inline-flex -mt-8 ml-4" >
                      {/* <BsFillTrashFill className="float-right text-md mb-10 text-red-500 hover:text-red-300 inline-flex items-center " 
                      onClick={(e) => handleShowRemoveModal(item.id) }
                      /> */}

                      <div className="p-1 ml-auto bg-transparent border-0 text-black opacity-4 float-right text-3xl leading-none font-semibold outline-none focus:outline-none">
                        <div className="dropdown">
                          <button className="bg-gray-100 text-gray-700 font-semibold rounded inline-flex">
                            <FaIcons.FaEllipsisH />
                          </button>
                          <ul className="dropdown-menu absolute hidden text-gray-700 pt-1 bg-white p-2 font-semibold rounded z-50 -ml-8">
                              <li
                                className="p-2 cursor-pointer"
                                onClick={() =>
                                  handleShowRemoveModal(item.id)
                                }
                              >
                                Delete
                              </li>
                          </ul>
                        </div>
                      </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {showCreateBriefsModal && (
        <CreateBriefsModal
          handleSave={handleSaveBrief}
          handleModalClose={handleModalClose}
        />
      )}
      {showToast && (
        <ToastNotification title={alertMessage} hideToast={hideToast} />
      )}
      {showSessionTimeout && <SessionTimeout />}

      {showRemoveBrief && (
        <RemoveBriefModal
          handleSave={handleDelete}
          handleModalClose={handleModalClose}
          removeBriefId={removeBriefId}
        />
      )}
    </>
  );
}
