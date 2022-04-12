import React, { useState, useEffect } from "react";
import { useHistory } from "react-router-dom";
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

  const getRFI = async () => {
    console.log("matterid", matter_id );
    // const RFIList = await API.graphql({
    //   query: listRFI,
    //   variables: {
    //     clientMatterId: matter_id,
    //   },
    // });
    // console.log("rfi", RFIList);
    // const matterRFIList = RFIList.data.clientMatter.rfis.items;
    // setRFI(matterRFIList);
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
    });

    // console.log("rffiii",RFI);


  }

  useEffect(() => {
    if (RFI === null) {
      getRFI();
    }
  });



  const handleSaveRFI = (rfiname) => {
    console.log("RFI name:", rfiname);
    setalertMessage(modalRFIAlertMsg);
    handleModalClose();
    setShowToast(true);

    setTimeout(() => {
      setShowToast(false);
      history.push(`${AppRoutes.RFIPAGE}/${matter_id}`);

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



  var dummyData = [
    // {id: 111, name: "RFI 1", datecreated: "Jan 01, 2022"},
    // {id: 112, name: "RFI 2", datecreated: "Jan 02, 2022"},
    // {id: 113, name: "RFI 3", datecreated: "Jan 03, 2022"},
    // {id: 114, name: "RFI 4", datecreated: "Jan 04, 2022"},
    // {id: 115, name: "RFI 5", datecreated: "Jan 05, 2022"},
  ];

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
                <h1 className="text-3xl">
                  <span className="font-bold text-3xl">Request For Information</span>{" "}
                  <span className="text-gray-500 text-3xl ml-2">
                    
                  </span>
                </h1>
                
              </div>
              <div className="py-3">
                <span className="text-sm mt-3 py-2">CLAIRE GREEN</span>{" "}
                / <span className="text-sm mt-3 py-2">MATTERNAME</span> /{" "}
                <span className="font-medium py-2 flex"><AiOutlineFolderOpen/> &nbsp; RFI</span>
              </div>

              <div className="absolute right-0">
                {/* <Link to={AppRoutes.DASHBOARD}> */}
                <button className="bg-white hover:bg-gray-100 text-black font-semibold py-2.5 px-4 rounded inline-flex items-center border-0 shadow outline-none focus:outline-none focus:ring">
                  Back &nbsp;
                  <MdArrowForwardIos />
                </button>
                {/* </Link> */}
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
                  className="px-3 py-3 placeholder-blueGray-300 text-blueGray-600 relative bg-white rounded text-sm border-0 shadow outline-none focus:outline-none focus:ring pl-5 float-right w-3/12"
                />
              </div>
            </div>
          </div>
          {RFI === null  ? (
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
                  className="w-full h-42 bg-gray-100 rounded-lg border border-gray-200 mb-6 py-5 px-4"
                  key={item.id}
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

