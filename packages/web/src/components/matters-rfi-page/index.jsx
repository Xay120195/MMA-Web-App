import '../../assets/styles/Matters-rfi-page.css';

import { FaTachometerAlt, FaUserCircle, FaUsers } from 'react-icons/fa';
import React, { useEffect, useRef, useState } from 'react';

import { API } from 'aws-amplify';
import AccessControl from '../../shared/accessControl';
import { AiOutlineFolderOpen } from 'react-icons/ai';
import { AppRoutes } from '../../constants/AppRoutes';
import { Auth } from 'aws-amplify';
import { BiArrowToTop } from 'react-icons/bi';
import BlankList from '../../assets/images/RFI_Blank_List.svg';
import BlankState from '../dynamic-blankstate';
import { CgChevronLeft } from 'react-icons/cg';
import CreateRFIModal from './create-RFI-modal';
import { HiOutlinePlusCircle } from 'react-icons/hi';
import { Link } from 'react-router-dom';
import { MdArrowForwardIos } from 'react-icons/md';
import ScrollToTop from 'react-scroll-to-top';
import SessionTimeout from '../session-timeout/session-timeout-modal';
import ToastNotification from '../toast-notification';
import { useHistory } from 'react-router-dom';
import { useIdleTimer } from 'react-idle-timer';
import { useParams } from 'react-router-dom';

export default function MattersRFI() {
  const { matter_id } = useParams();

  const modalRFIAlertMsg = 'RFI Name successfully created.';

  const [showCreateRFIModal, setshowCreateRFIModal] = useState(false);

  const [searchTable, setSearchTable] = useState();

  const [showToast, setShowToast] = useState(false);
  const [showAddRow, setShowAddRow] = useState(false);
  const [allowUpdateQuestion, setAllowUpdateQuestion] = useState(false);
  const [allowUpdateResponse, setAllowUpdateResponse] = useState(false);
  const [alertMessage, setalertMessage] = useState();
  const [copyRFI, setcopyRFI] = useState([]);

  let history = useHistory();
  const bool = useRef(false);
  const [showSessionTimeout, setShowSessionTimeout] = useState(false);

  const handleBlankStateClick = () => {
    // console.log("Blank State Button was clicked!");
    setshowCreateRFIModal(true);
  };

  const hideToast = () => {
    setShowToast(false);
  };

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

  const mCreateRFI = `
    mutation createRFI($clientMatterId: String, $name: String) {
        rfiCreate(clientMatterId:$clientMatterId, name:$name) {
            id
            name
            createdAt
        }
    }
    `;

  const getRFI = async () => {
    console.log('matterid', matter_id);

    const params = {
      query: listRFI,
      variables: {
        clientMatterId: matter_id,
      },
    };

    await API.graphql(params).then((rfi) => {
      const RFIList = rfi.data.clientMatter.rfis.items;
      console.log('mfl', RFIList);
      setRFI(RFIList);
      setcopyRFI(RFIList);
    });
  };

  useEffect(() => {
    if (RFI === null) {
      getRFI();
    }
  });

  const handleSaveRFI = async (rfiname) => {
    console.log('matterid', matter_id);
    console.log('rfiname', rfiname);

    const addRFI = await API.graphql({
      query: mCreateRFI,
      variables: {
        clientMatterId: matter_id,
        name: rfiname,
      },
    });

    const getID = addRFI.data.rfiCreate.id;

    console.log('RFI name:', addRFI);
    setalertMessage(modalRFIAlertMsg);
    handleModalClose();
    setShowToast(true);
    setTimeout(() => {
      setShowToast(false);

      visitRFI(getID, addRFI);
    }, 3000);
  };

  const handleModalClose = () => {
    setshowCreateRFIModal(false);
  };

  // const handleDeleteRow = () => {
  //   var updatedRows = [...dataquestions];
  //   var _data = [];
  //   checkedState.map(function(item, index) {
  //       if(item){
  //         _data = updatedRows.filter((e, i) => i !== index);
  //       }
  //   });
  //   setQuestion(_data);
  // };

  const searchRFI = (val) => {
    if (val.length > 0) {
      setRFI(
        RFI.filter(
          (rfi) =>
            rfi.name
              .toLowerCase()
              .replace(' ', '')
              .includes(val.toLowerCase().replace(' ', '')) === true
        )
      );
    } else {
      setRFI(copyRFI);
    }
  };

  const handleSearchChange = (e) => {
    console.log('L114' + e.target.value);
    searchRFI(e.target.value);
    setSearchTable(e.target.value);
  };

  const style = {
    paddingLeft: '0rem',
  };

  function visitRFI(id, name) {
    const m_name = getQueryVariable('matter_name');
    const c_name = getQueryVariable('client_name');

    history.push(
      `${
        AppRoutes.RFIPAGE
      }/${id}/?matter_id=${matter_id}&matter_name=${m_name}&client_name=${c_name}&rfi_name=${utf8_to_b64(
        name
      )}`
    );
  }

  function getQueryVariable(variable) {
    var query = window.location.search.substring(1);
    var vars = query.split('&');
    for (var i = 0; i < vars.length; i++) {
      var pair = vars[i].split('=');
      if (pair[0] === variable) {
        return pair[1];
      }
    }
    return false;
  }

  function utf8_to_b64(str) {
    return window.btoa(unescape(encodeURIComponent(str)));
  }

  function b64_to_utf8(str) {
    return decodeURIComponent(escape(window.atob(str)));
  }

  const m_name = getQueryVariable('matter_name');
  const c_name = getQueryVariable('client_name');
  const matter_name = b64_to_utf8(m_name);
  const client_name = b64_to_utf8(c_name);

  const formatDisplayDate = (val) => {
    let date = new Date(val);
    const day = date.toLocaleString('default', { day: '2-digit' });
    const month = date.toLocaleString('default', { month: 'short' });
    const year = date.toLocaleString('default', { year: 'numeric' });
    return day + ' ' + month + ' ' + year;
  };

  var timeoutId;
  //SESSION TIMEOUT
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

  return (
    <>
      <ScrollToTop
        smooth
        component={
          <BiArrowToTop
            style={{ color: 'white', display: 'block', margin: 'auto' }}
          />
        }
        className="sm:hidden scrollButton"
        style={{ borderRadius: '50%' }}
      />
      <div
        className={
          'bg-gray-100 p-5 sm:p-4 min-h-screen flex flex-col min-w-0 break-words sm:min-h-0 sm: relative sm:mb-6 sm:shadow-lg sm:rounded sm:bg-white contentDiv'
        }
      >
        <div className="relative py-2 sm:p-0 sm:flex-grow sm:flex-1">
        <div className="sm:hidden flex flex-row">
            <div className="flex-grow">
              <h1 className="font-bold text-right text-base px-2 sm:px-0 sm:text-3xl sm:text-left">
                Request For Information
                <span className="hidden sm:inline text-base sm:text-3xl">
                  &nbsp;of&nbsp;
                </span>
                <br className="sm:hidden"></br>
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
                  <MdArrowForwardIos
                    style={{
                      margin: "auto",
                    }}
                  />
                </button>
              </Link>
            </div>
          </div>

          <div className="sticky pl-16 sm:pl-0 top-0 py-4 hidden sm:flex items-center gap-2 bg-white z-10">
            <div
              onClick={() => history.replace('/dashboard')}
              className="w-8 py-5 cursor-pointer"
            >
              <CgChevronLeft />
            </div>
            <div>
              <p className="flex flex-col">
                <span className="text-lg font-bold">
                  Request for Information
                </span>{' '}
                <span className=" text-grey-600">
                  {client_name} - {matter_name}
                </span>
              </p>
              <div className="flex items-center gap-3 text-gray-500 mt-2">
                <Link to="/dashboard">
                  <div className="flex gap-3">
                    <FaTachometerAlt />
                    <p className="font-semibold hidden sm:block">Dashboard</p>
                  </div>
                </Link>
                <span>/</span>
                <p className="font-semibold sm:hidden">RFI</p>
                <p className="font-semibold hidden sm:block">
                  Request for Information
                </p>
                <span>/</span>
                <p className="font-semibold">{matter_name}</p>
              </div>
            </div>
          </div>

          <div className="mt-4 sm:mt-7">
            <div>
              <button
                type="button"
                className="hidden sm:inline-flex bg-green-100 hover:bg-green-100 text-green-500 text-sm py-1 px-4 rounded items-center border border-green-500 shadow focus:ring mx-2"
                onClick={() => setshowCreateRFIModal(true)}
              >
                NEW RFI &nbsp; <HiOutlinePlusCircle />
              </button>

              <input
                type="search"
                placeholder="Search ..."
                onChange={handleSearchChange}
                className="px-3 py-3 placeholder-blueGray-300 text-blueGray-600 relative bg-white rounded text-sm border-0 shadow outline-none focus:outline-none focus:ring pl-5 float-right w-full sm:w-3/12 "
              />
            </div>
          </div>
        </div>
        {RFI === null ? (
          <div> </div>
        ) : RFI.length === 0 ? (
          <div className="sm:p-5 sm:px-5 sm:py-1 left-0 mt-5">
            <div className="w-full h-42 bg-white sm:bg-gray-100 rounded-lg border border-gray-200 mb-6 py-1 px-1">
              <BlankState
                displayText={'There are no items to show in this view'}
                txtLink={'add new RFI'}
                iconDisplay={BlankList}
                handleClick={() => setshowCreateRFIModal(true)}
              />
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-lg p-5 pb-0 my-5 sm:p-0 sm:ml-2">
            {RFI.map((item) => (
              <div
                className="w-full h-42 bg-gray-100 rounded-lg border border-gray-200 mb-6 py-5 px-4  cursor-pointer"
                key={item.id}
                onClick={() => visitRFI(item.id, item.name)}
              >
                <div>
                  <div className="grid grid-cols-4 gap-4">
                    <div className="col-span-2">
                      <h4
                        tabIndex="0"
                        className="focus:outline-none text-gray-800 dark:text-gray-100 font-bold mb-1"
                      >
                        {item.name}
                      </h4>

                      <p
                        tabIndex="0"
                        className="focus:outline-none text-gray-400 dark:text-gray-100 text-xs"
                      >
                        {item.createdAt
                          ? formatDisplayDate(item.createdAt)
                          : 'No date'}
                      </p>
                    </div>
                  </div>
                  <div className="float-right -mt-10">
                    <FaUserCircle className="h-10 w-10" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {showCreateRFIModal && (
        <CreateRFIModal
          handleSave={handleSaveRFI}
          handleModalClose={handleModalClose}
        />
      )}
      {showToast && (
        <ToastNotification title={alertMessage} hideToast={hideToast} />
      )}
      {showSessionTimeout && <SessionTimeout />}
    </>
  );
}
