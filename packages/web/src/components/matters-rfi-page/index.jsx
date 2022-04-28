import React, { useState, useEffect } from "react";
import { Redirect, useHistory } from "react-router-dom";
import BlankState from "../dynamic-blankstate";
import { HiOutlinePlusCircle } from "react-icons/hi";
import { MdArrowForwardIos, MdDownload } from "react-icons/md";
import { matter_rfi, questions } from "./data-source";
import { AppRoutes } from "../../constants/AppRoutes";
import CreateRFIModal from "./create-RFI-modal";
import ToastNotification from "../toast-notification";
import AccessControl from "../../shared/accessControl";
import { FaUserCircle } from "react-icons/fa";
import {AiOutlineFolderOpen} from "react-icons/ai";
import BlankList from "../../assets/images/RFI_Blank_List.svg";
import { useParams } from "react-router-dom";
import { API } from "aws-amplify";
import { Link } from "react-router-dom";

export default function MattersRFI() {
  let history = useHistory();
  const { matter_id } = useParams();

  const modalRFIAlertMsg = "RFI Name successfully created.";

  const [showCreateRFIModal, setshowCreateRFIModal] = useState(false);

  const [dataquestions, setQuestion] = useState(questions);
  const [searchTable, setSearchTable] = useState();

  const [showToast, setShowToast] = useState(false);
  const [showAddRow, setShowAddRow] = useState(false);
  const [allowUpdateQuestion, setAllowUpdateQuestion] = useState(false);
  const [allowUpdateResponse, setAllowUpdateResponse] = useState(false);
  const [alertMessage, setalertMessage] = useState();

  const [clientMatterName, setClientMatterName] = useState("");

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
    console.log("matterid", matter_id );
   
    const params = {
      query: listRFI,
      variables: {
        clientMatterId: matter_id,
      },
    };

    await API.graphql(params).then((rfi) => {
      const matterFilesList = rfi.data.clientMatter.rfis.items;
      console.log("mfl", matterFilesList);
      setRFI(matterFilesList);
      getMatterDetails();
    });
  }

  useEffect(() => {
    if (RFI === null) {
      getRFI();
    }
  });

  const handleSaveRFI = async (rfiname) => {
    console.log("matterid", matter_id );
    console.log("rfiname", rfiname );

    const addRFI = await API.graphql({
      query: mCreateRFI,
      variables: {
        clientMatterId: matter_id,
        name: rfiname
      },
    });

    const getID = addRFI.data.rfiCreate.id;

    console.log("RFI name:", addRFI);
    setalertMessage(modalRFIAlertMsg);
    handleModalClose();
    setShowToast(true);
    setTimeout(() => {
      setShowToast(false);
      history.push(`${AppRoutes.RFIPAGE}/${getID}`);
    }, 3000);
  };

  const handleModalClose = () => {
    setshowCreateRFIModal(false);
  };

  const contentDiv = {
    margin: "0 0 0 65px"
  };

  const mainGrid = {
    display: "grid",
    gridtemplatecolumn: "1fr auto"
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
    console.log("L114" + e.target.value);
    setSearchTable(e.target.value);
  };

  const style = {
    paddingLeft: "0rem",
  };

  function visitRFI(id){
    history.push(`${AppRoutes.RFIPAGE}/${id}`);
  }

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



  return (
    <>
     
        <div
          className={
            "p-5 relative flex flex-col min-w-0 break-words mb-6 shadow-lg rounded bg-white"
          } style={contentDiv}
        >
          <div className="relative flex-grow flex-1">
            <div style={mainGrid}>
              <div>
                <h1 className="font-bold text-3xl">
                  Request For Information&nbsp;<span className="text-3xl">of</span>&nbsp;
                  <span className="font-semibold text-3xl">
                    {clientMatterName}
                  </span>
                </h1>
                
              </div>
              <div>
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
                      <Link
                        aria-current="page"
                        className="font-medium text-gray-500"
                        to={`${AppRoutes.RFIPAGE}/${matter_id}`}
                      >
                        RFI
                      </Link>
                    </li>
                  </ol>
                </nav>  
              </div>

              <div className="absolute right-0">
                <Link to={AppRoutes.DASHBOARD}>
                <button className="bg-white hover:bg-gray-100 text-black font-semibold py-2.5 px-4 rounded inline-flex items-center border-0 shadow outline-none focus:outline-none focus:ring">
                  Back &nbsp;
                  <MdArrowForwardIos />
                </button>
                </Link>
              </div>
            </div>

            <div className="mt-7">
            
              <div>
                    <button
                        type="button"
                        className="bg-green-100 hover:bg-green-100 text-green-500 text-sm py-1 px-4 rounded inline-flex items-center border border-green-500 shadow focus:ring mx-2"
                        onClick={() => setshowCreateRFIModal(true)}
                    >
                     NEW RFI &nbsp; <HiOutlinePlusCircle/>
                    </button>

                <input
                  type="search"
                  placeholder="Search ..."
                  onChange={handleSearchChange}
                  className="px-3 py-3 placeholder-blueGray-300 text-blueGray-600 relative bg-white rounded text-sm border-0 shadow outline-none focus:outline-none focus:ring pl-5 float-right w-3/12 "
                />
              </div>
            </div>
          </div>
          {RFI === null || RFI.length === 0 ? (
            <div className="p-5 px-5 py-1 left-0">
              <div className="w-full h-42 bg-gray-100 rounded-lg border border-gray-200 mb-6 py-1 px-1">
                {/* <BlankState
                  title={"RFI"}
                  txtLink={"add RFI"}
                  handleClick={handleBlankStateClick}
                /> */}
                <BlankState
                    displayText={"There are no items to show in this view"}
                    txtLink={"add new RFI"}
                    iconDisplay={BlankList}
                />
              </div>
            </div>
          ) : (
          <div className="shadow overflow-hidden border-b border-gray-200 sm:rounded-lg my-5">
          {RFI.map((item) => (
                <div
                  className="w-full h-42 bg-gray-100 rounded-lg border border-gray-200 mb-6 py-5 px-4  cursor-pointer"
                  key={item.id}
                  onClick={() => visitRFI(item.id)}
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
                            {item.createdAt}
                          </p>
                        </div>
                    </div>
                    <div className="float-right -mt-10">
                      <FaUserCircle className="h-10 w-10"/>
                    </div>
                  </div>
                  
                </div>
          ))}
          </div>
        )}
        </div>
      

      {showCreateRFIModal && 
        <CreateRFIModal
          handleSave={handleSaveRFI}
          handleModalClose={handleModalClose}
        />
      }
      {showToast && 
        <ToastNotification title={alertMessage} hideToast={hideToast} />
      }  
    </>
  );
}

