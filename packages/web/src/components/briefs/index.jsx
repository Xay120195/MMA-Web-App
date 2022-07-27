import '../../assets/styles/Briefs.css';

import {
  FaBook,
  FaEllipsisH,
  FaTachometerAlt,
  FaUserCircle,
  FaUsers,
} from 'react-icons/fa';
import { FiChevronDown, FiChevronRight, FiChevronUp } from 'react-icons/fi';
import {
  MdArrowForwardIos,
  MdDelete,
  MdDownload,
  MdEdit,
} from 'react-icons/md';
import React, { useEffect, useRef, useState } from 'react';
import { Redirect, useHistory } from 'react-router-dom';

import { API } from 'aws-amplify';
import AccessControl from '../../shared/accessControl';
import { AiFillEye } from 'react-icons/ai';
import { AiOutlineFolderOpen } from 'react-icons/ai';
import { AppRoutes } from '../../constants/AppRoutes';
import { Auth } from 'aws-amplify';
import { BiArrowToTop } from 'react-icons/bi';
import BlankList from '../../assets/images/RFI_Blank_List.svg';
import BlankState from '../dynamic-blankstate';
import BlankStateMobile from '../blank-state-mobile';
import { BsFillTrashFill } from 'react-icons/bs';
import { CgChevronLeft } from 'react-icons/cg';
import CreateBriefsModal from './create-brief-modal';
import { HiOutlinePlusCircle } from 'react-icons/hi';
import Illustration from '../../assets/images/no-data.svg';
import { Link } from 'react-router-dom';
import RemoveBriefModal from '../briefs/remove-brief-modal';
import ScrollToTop from 'react-scroll-to-top';
import SessionTimeout from '../session-timeout/session-timeout-modal';
import ToastNotification from '../toast-notification';
import { useIdleTimer } from 'react-idle-timer';
import { useParams } from 'react-router-dom';
import useWindowDimensions from '../../shared/windowDimensions';

// import { matter_rfi, questions } from "./data-source";

// import CreateRFIModal from "./create-RFI-modal";

export default function Briefs() {
  const { matter_id } = useParams();

  const modalRFIAlertMsg = 'Background successfully created.';

  const [showCreateRFIModal, setshowCreateRFIModal] = useState(false);

  // const [dataquestions, setQuestion] = useState(questions);
  const [searchTable, setSearchTable] = useState();

  const [showToast, setShowToast] = useState(false);
  const [showAddRow, setShowAddRow] = useState(false);
  const [allowUpdateQuestion, setAllowUpdateQuestion] = useState(false);
  const [allowUpdateResponse, setAllowUpdateResponse] = useState(false);
  const [alertMessage, setalertMessage] = useState();
  const [briefName, setBriefName] = useState('');
  const [briefId, setBriefId] = useState('');
  const [validationAlert, setValidationAlert] = useState('');
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

  const [BriefsCopy, setBriefsCopy] = useState();

  const handleBlankStateClick = () => {
    // console.log("Blank State Button was clicked!");
    setshowCreateRFIModal(true);
  };

  const hideToast = () => {
    setShowToast(false);
  };

  var moment = require('moment');

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
    console.log('matterid', matter_id);
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
      console.log('mfl', matterFilesList);
      setBriefs(matterFilesList);
      setBriefsCopy(matterFilesList);
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
    console.log('matterid', matter_id);
    console.log('briefname', briefname);

    // alert(briefname);

    const addBrief = await API.graphql({
      query: mCreateBrief,
      variables: {
        clientMatterId: matter_id,
        name: briefname,
        date: moment.utc(moment(new Date(), 'YYYY-MM-DD')).toISOString(),
        order: 0,
      },
    });

    console.log('brief', addBrief);
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
    display: 'grid',
    gridtemplatecolumn: '1fr auto',
  };

  const searchText = (val) => {
    if (val.length > 0) {
      setBriefs(
        Briefs.filter((item) => {
          return (
            item.name
              .toLowerCase()
              .replace(' ', '')
              .includes(val.toLowerCase().replace(' ', '')) === true
          );
        })
      );
    } else {
      setBriefs(BriefsCopy);
    }
  };

  const handleSearchChange = (e) => {
    //console.log("L114" + e.target.value);
    searchText(e.target.value);
    //setSearchTable(e.target.value);
  };

  const style = {
    paddingLeft: '0rem',
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
    name = name.replace(/[\[\]]/g, '\\$&');
    var regex = new RegExp('[?&]' + name + '(=([^&#]*)|&|#|$)'),
      results = regex.exec(url);
    if (!results) return null;
    if (!results[2]) return '';
    return decodeURIComponent(results[2].replace(/\+/g, ' '));
  }

  function b64_to_utf8(str) {
    return decodeURIComponent(atob(str));
  }

  const m_name = getParameterByName('matter_name');
  const c_name = getParameterByName('client_name');
  const matter_name = b64_to_utf8(m_name);
  const client_name = b64_to_utf8(c_name);

  const handleNameContent = (e, name, id) => {
    if (!validationAlert) {
      setBriefName(!name ? '' : name);
      setBriefId(id);
      setValidationAlert('');
    } else {
      setBriefName('');
    }
  };

  const handleOnChangeBiefName = (e) => {
    setBriefName(e.currentTarget.textContent);
  };

  const handleSaveBriefName = (e, name, id) => {
    const originalString = briefName.replace(/(<([^>]+)>)/gi, '');
    const final = originalString.replace(/\&nbsp;/g, ' ');

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
      setValidationAlert('Brief Name is required');
    } else if (briefName === name) {
      setValidationAlert('');
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
          setalertMessage('');
        }, 1000);
      }
    } else {
      setValidationAlert('');
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
          setalertMessage('');
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
    const day = date.toLocaleString('default', { day: '2-digit' });
    const month = date.toLocaleString('default', { month: 'short' });
    const year = date.toLocaleString('default', { year: 'numeric' });
    return day + ' ' + month + ' ' + year;
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
    console.log('user is clicking');

    //function for detecting if user moved/clicked.
    //if modal is active and user moved, automatic logout (session expired)
    bool.current = false;
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
    console.log('user is idle');
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

  const checkFormat = (str) => {
    var check = str;
    check = check.replace('%20', ' '); //returns my_name
    return check;
  };

  {
    /* MOBILE CONST */
  }
  const [headerReadMore, setHeaderReadMore] = useState(false);
  const [headerLines, setHeaderLines] = useState();
  const [contentHeight, setContentHeight] = useState();
  const [showScrollButton, setShowScrollButton] = useState(false);
  const [isAllFilesSelectedButton, setIsAllFilesSelectedButton] =
    useState(true);
  const { height, width } = useWindowDimensions();

  function countLines(tag) {
    var divHeight = tag.offsetHeight;
    var lineHeight = parseInt(
      window.getComputedStyle(tag).getPropertyValue('line-height')
    );
    var lines = Math.round(divHeight / lineHeight);
    return lines;
  }

  useEffect(() => {
    // var headerTag = document.getElementById('headerTag');
    // setHeaderLines(countLines(headerTag));
    // if (headerReadMore) {
    //   setContentHeight(height - 94 - headerTag.offsetHeight);
    // } else {
    //   setContentHeight(
    //     height -
    //       94 -
    //       parseInt(
    //         window.getComputedStyle(headerTag).getPropertyValue('line-height')
    //       )
    //   );
    // }
  }, [height, width, headerReadMore]);

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

  return (
    <>
      <div
        className={
          'bg-gray-100 p-5 min-h-screen relative flex flex-col min-w-0 break-words sm:min-h-0 sm:mb-6 sm:shadow-lg sm:rounded sm:bg-white contentDiv'
        }
      >
        <div className="relative pt-3 sm:p-0 sm:flex-grow sm:flex-1">
          <div className="flex flex-col">
            <div className="sticky pl-12 sm:pl-0 top-0 py-4 flex items-center gap-2 bg-white z-10">
              <div
                onClick={() => history.replace('/dashboard')}
                className="w-8 py-5 cursor-pointer"
              >
                <CgChevronLeft />
              </div>
              <div>
                <p className="flex flex-col">
                  <span className="text-lg font-bold">Background Page</span>
                  <span className=" text-grey-600">
                    {client_name} - {matter_name}
                  </span>
                </p>
                <div className="flex items-center gap-3 text-gray-500 mt-2">
                  <Link to="/dashboard">
                    <div className="flex items-center gap-3">
                      <FaTachometerAlt />
                      <p className="hidden sm:block font-semibold">Dashboard</p>
                    </div>
                  </Link>
                  <span>/</span>
                  <p className="font-semibold hidden sm:block">Background</p>
                  <FaBook className="sm:hidden" />
                  <span>/</span>
                  <p className="font-semibold">{matter_name}</p>
                </div>
              </div>
            </div>
            {/* <div className="flex-grow hidden sm:block">
              <h1 className="font-bold text-right text-base px-2 sm:px-0 sm:text-3xl sm:text-left">
                Background Page
                <span className="hidden sm:inline text-base sm:text-3xl">
                  &nbsp;of&nbsp;
                </span>
                <br className="sm:hidden" />
                <span className="text-base font-semibold sm:text-3xl">
                  {client_name}/{matter_name}
                </span>
              </h1>
            </div> */}
            {/* <div className="hidden sm:flex shrink-0 items-center sm:absolute sm:right-0">
              <Link to={AppRoutes.DASHBOARD}>
                <button className="hidden align-middle sm:inline-flex shrink-0 bg-white hover:bg-gray-100 text-black font-semibold py-2.5 px-4 rounded items-center border-0 shadow outline-none focus:outline-none focus:ring">
                  Back &nbsp;
                  <MdArrowForwardIos />
                </button>
                <button className="sm:hidden shrink-0 bg-white hover:bg-gray-100 text-black font-semibold rounded inline-flex items-center border-0 w-9 h-9 rounded-full shadow-md outline-none focus:outline-none focus:ring">
                  <MdArrowForwardIos
                    style={{
                      margin: 'auto',
                    }}
                  />
                </button>
              </Link>
            </div> */}
          </div>

          {/* <div className="sm:px-0">
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
                    <AiOutlineFolderOpen className="hidden sm:inline-block" />
                    <span className="sm:inline hidden">&nbsp;&nbsp;</span>
                    Background
                    <span className="sm:inline hidden font-medium">
                      &nbsp;Page
                    </span>{' '}
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
          </div> */}

          <div className="hidden sm:block mt-4 sm:mt-7">
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
                  'hidden hover:bg-gray-200 text-black text-sm py-2 px-4 rounded sm:inline-flex items-center border-0 shadow outline-none focus:outline-none focus:ring mx-2'
                }
                onClick={handleColumn}
              >
                SHOW/HIDE COLUMNS &nbsp; <AiFillEye />
              </button>
              {showColumn && (
                <div className="h-40 z-50 bg-white absolute sm:mt-2 rounded border-0 shadow outline-none showColumn">
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
                className="hidden sm:block px-3 py-3 placeholder-blueGray-300 text-blueGray-600 relative bg-white rounded text-sm border-0 shadow outline-none focus:outline-none focus:ring pl-5 float-right w-full sm:w-3/12 "
              />
            </div>
          </div>
        </div>

        {Briefs === null ? (
          <div> </div>
        ) : Briefs.length === 0 ? (
          <div className="sm:p-5 sm:px-5 sm:py-1 left-0 sm:mt-5">
            <div
              className="w-full flex items-center sm:flex-none h-42 bg-white sm:bg-gray-100 rounded-lg sm:border border-gray-200 sm:mb-6 sm:py-1 sm:px-1"
              style={{ height: width > 640 ? 'auto' : contentHeight }}
            >
              {width > 640 ? (
                <BlankState
                  displayText={'There are no items to show in this view'}
                  txtLink={'add new Background'}
                  iconDisplay={BlankList}
                  handleClick={() => setshowCreateBriefsModal(true)}
                />
              ) : (
                <BlankStateMobile
                  header={'There are no items to show in this view.'}
                  content={'Any added files in the desktop will appear here'}
                  svg={Illustration}
                />
              )}
            </div>
          </div>
        ) : (
          <div
            className="flex flex-col sm:block sm:shadow sm:overflow-hidden border-b bg-white sm:border-gray-200 rounded-lg sm:my-5 py-5 sm:p-0"
            style={{ height: width > 640 ? 'auto' : contentHeight }}
          >
            <div className="mx-5 sm:hidden items-stretch flex border-b border-gray-200">
              <button
                className={
                  (isAllFilesSelectedButton ? 'border-black' : 'border-white') +
                  ' border-b-2 py-2 font-semibold'
                }
              >
                All Files
              </button>
              <button
                className={
                  (!isAllFilesSelectedButton
                    ? 'border-black'
                    : 'border-white') + ' ml-5 border-b-2 py-2 font-semibold'
                }
              >
                Brief
              </button>
            </div>
            <div
              id="mobileContent"
              onScroll={(e) => handleScrollEvent(e)}
              className="px-5 sm:px-0 overflow-y-auto h-min"
              style={{ scrollBehavior: 'smooth' }}
            >
              {showScrollButton ? (
                <>
                  <div
                    className="scrollButtonBrief flex"
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
              {Briefs.map((item) => (
                <div
                  className="w-90 bg-gray-100 rounded-lg border border-gray-200 mt-5 py-3 px-5 sm:py-4 sm:px-4 sm:m-2
                hover:border-black cursor-pointer"
                  key={item.id}
                  data-info={item.id}
                  onMouseOver={handleMouseOver}
                  onMouseOut={handleMouseOut}
                >
                  <div className="flex sm:block">
                    <div
                      className="flex-auto grid grid-cols-4 gap-4"
                      onClick={() => visitBrief(item.id)}
                    >
                      <div
                        className={`col-span-4 sm:col-span-2 ${
                          !showBName && `py-2 px-2 mb-2`
                        } ${!showDate && `py-1 px-1 mb-2`}`}
                      >
                        {showBName && (
                          <>
                            <div
                              className="inline-flex w-full"
                              data-info={item.id}
                              onMouseOver={handleMouseOver}
                              onMouseOut={handleMouseOut}
                            >
                              <p
                                suppressContentEditableWarning={true}
                                style={{
                                  cursor: 'auto',
                                  outlineColor: 'rgb(204, 204, 204, 0.5)',
                                  outlineWidth: 'thin',
                                }}
                                data-info={item.id}
                                onMouseOver={handleMouseOver}
                                onMouseOut={handleMouseOut}
                                onClick={(e) =>
                                  handleNameContent(e, item.name, item.id)
                                }
                                onClickCapture={(e) => e.stopPropagation()}
                                contentEditable={true}
                                tabIndex="0"
                                onInput={(e) => handleOnChangeBiefName(e)}
                                onBlur={(e) =>
                                  handleSaveBriefName(e, item.name, item.id)
                                }
                                className="hidden sm:inline-flex items-center focus:outline-none text-gray-800 dark:text-gray-100 font-bold mb-1"
                                dangerouslySetInnerHTML={{
                                  __html: item.name,
                                }}
                              />
                              <p className="sm:hidden line-clamp-1 items-center focus:outline-none text-gray-800 dark:text-gray-100 font-semibold mb-1">
                                {item.name}
                              </p>
                              {isHovering && isHoveringId === item.id && (
                                <div className="hidden sm:block">
                                  <MdEdit
                                    className="text-blue-500 hover:text-blue-300 inline-flex items-center ml-2 mr-1"
                                    onClickCapture={(e) => e.stopPropagation()}
                                  />
                                </div>
                              )}
                            </div>
                          </>
                        )}
                        <div className="flex col-span-4 items-center">
                          <div
                            className="mr-2 sm:hidden inline-flex"
                            onClick={() => visitBrief(item.id)}
                          >
                            {/* Added for mobile version */}
                            {showTag && <FaUserCircle className={`h-5 w-5 `} />}
                          </div>
                          {showDate && (
                            <p
                              data-info={item.id}
                              onMouseOver={handleMouseOver}
                              onMouseOut={handleMouseOut}
                              tabIndex="0"
                              className="sm:inline focus:outline-none text-gray-400 dark:text-gray-100 text-xs"
                            >
                              {item.date
                                ? formatDisplayDate(item.date)
                                : 'No date'}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex ml-5 items-center sm:hidden font-bold text">
                      {/* Added for mobile version */}
                      <FiChevronRight />
                    </div>
                    <div
                      className="hidden sm:inline-flex float-right inline-flex -mt-10 mr-8"
                      onClick={() => visitBrief(item.id)}
                    >
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
                    <div className="hidden sm:inline-flex float-right -mt-8 ml-4">
                      {/* <BsFillTrashFill className="float-right text-md mb-10 text-red-500 hover:text-red-300 inline-flex items-center " 
                      onClick={(e) => handleShowRemoveModal(item.id) }
                      /> */}

                      <div className="p-1 ml-auto bg-transparent border-0 text-black opacity-4 float-right text-3xl leading-none font-semibold outline-none focus:outline-none">
                        <div className="dropdown">
                          <button className="bg-gray-100 text-gray-700 font-semibold rounded inline-flex">
                            <FaEllipsisH />
                          </button>
                          <ul className="dropdown-menu absolute hidden text-gray-700 pt-1 bg-white p-2 font-semibold rounded z-50 -ml-8">
                            <li
                              className="p-2 cursor-pointer"
                              onClick={() => handleShowRemoveModal(item.id)}
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
