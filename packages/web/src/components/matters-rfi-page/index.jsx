import React, { useState, useEffect, useRef } from 'react';
import { useHistory } from 'react-router-dom';
import BlankState from '../dynamic-blankstate';
import { HiOutlinePlusCircle } from 'react-icons/hi';
import { MdArrowForwardIos, MdArrowBack } from 'react-icons/md';
import { AppRoutes } from '../../constants/AppRoutes';
import CreateRFIModal from './create-RFI-modal';
import ToastNotification from '../toast-notification';
import AccessControl from '../../shared/accessControl';
import { FaUserCircle } from 'react-icons/fa';
import { AiOutlineFolderOpen } from 'react-icons/ai';
import BlankList from '../../assets/images/RFI_Blank_List.svg';
import { useParams } from 'react-router-dom';
import { API } from 'aws-amplify';
import { Link } from 'react-router-dom';
import { useIdleTimer } from 'react-idle-timer';
import SessionTimeout from '../session-timeout/session-timeout-modal';
import { Auth } from 'aws-amplify';

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

  const contentDiv = {
    margin: '0 0 0 65px',
  };

  const mainGrid = {
    display: 'grid',
    gridtemplatecolumn: '1fr auto',
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

  const handleSearchChange = (e) => {
    console.log('L114' + e.target.value);
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
    }, 60000 * 40);
  };

  useIdleTimer({
    timeout: 60 * 40,
    onAction: handleOnAction,
    onIdle: handleOnIdle,
    debounce: 1000,
  });

  return (
    <>
      <div
        className={
          'p-5 relative flex flex-col min-w-0 break-words mb-6 shadow-lg rounded bg-white'
        }
        style={contentDiv}
      >
        <div className="relative flex-grow flex-1">
          <div style={mainGrid}>
            <div>
              <Link to={AppRoutes.DASHBOARD}>
                <button className="bg-white hover:bg-gray-100 text-black font-semibold py-2.5 px-4 rounded flex gap-2 items-center border-0 shadow outline-none focus:outline-none focus:ring">
                  <MdArrowBack />
                  <span className="font-semibold">Back to Dashboard</span>
                </button>
              </Link>
            </div>

            <h1 className="flex flex-col my-8">
              <span className="text-3xl font-bold">
                Request For Information
              </span>
              <span className="font-semibold text-xl">
                {client_name}/{matter_name}
              </span>
            </h1>
            <div>
              <nav aria-label="Breadcrumb" style={style} className="mt-4">
                <ol
                  role="list"
                  className="px-0 flex items-left space-x-2 lg:max-w-7xl lg:px-8"
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
                      <AiOutlineFolderOpen /> &nbsp; RFI List{' '}
                    </span>
                  </li>
                </ol>
              </nav>
            </div>
          </div>

          <div className="mt-10 mb-4">
            <div className="flex justify-between items-center gap-2">
              <input
                type="search"
                placeholder="Search ..."
                onChange={handleSearchChange}
                className="p-2 px-5 border-2 placeholder-blueGray-300 text-blueGray-600 relative bg-white rounded text-sm border-0 shadow outline-none focus:outline-none focus:ring pl-5 w-full md:w-5/12 "
              />

              <button
                type="button"
                className="p-2 px-5 bg-green-100 hover:bg-green-100 text-green-500 text-sm rounded flex items-center self-end gap-2 border border-green-500 shadow focus:ring w-max"
                onClick={() => setshowCreateRFIModal(true)}
              >
                <span className="w-max hidden md:block">Add New RFI</span>
                <HiOutlinePlusCircle size={20} />
              </button>
            </div>
          </div>
        </div>
        {RFI === null ? (
          <div> </div>
        ) : RFI.length === 0 ? (
          <div className="p-5 px-5 py-1 left-0 mt-5">
            <div className="w-full h-42 bg-gray-100 rounded-lg border border-gray-200 mb-6 py-1 px-1">
              <BlankState
                displayText={'There are no items to show in this view'}
                txtLink={'add new RFI'}
                iconDisplay={BlankList}
                handleClick={() => setshowCreateRFIModal(true)}
              />
            </div>
          </div>
        ) : (
          <div className="my-5 ml-2">
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
