import React, { useState, useEffect, createContext, useReducer, useRef } from "react";
import * as IoIcons from "react-icons/io";
import * as FaIcons from "react-icons/fa";
import { HiMenuAlt1 } from "react-icons/hi";
import imgDocs from "../../assets/images/docs.svg";
import { Welcome } from "./welcome";
import { ClientMatters } from "./matters-list";
import { useForm } from "react-hook-form";
import DeleteMatterModal from "./delete-matters-modal";
import ToastNotification from "../toast-notification";
import "../../assets/styles/Dashboard.css";
import AccessControl from "../../shared/accessControl";
import CreatableSelect from "react-select/creatable";
import { API } from "aws-amplify";
import { initialState } from "./initialState";
import { clientMatterReducers } from "./reducers";
import { useIdleTimer } from "react-idle-timer";
import SessionTimeout from "../session-timeout/session-timeout-modal";
import { Auth } from "aws-amplify";
import { useHistory } from "react-router-dom";
import { BiArrowToTop } from "react-icons/bi";

import {
  getMatterList,
  addClientMatter,
  deleteMatterClient,
  searchMatterClient,
} from "./actions";
import ScrollToTop from "react-scroll-to-top";


export const MatterContext = createContext();

export default function Dashboard() {
  const [matterlist, dispatch] = useReducer(clientMatterReducers, initialState);
  const [error, setError] = useState(false);
  const [userInfo, setuserInfo] = useState(null);
  const [mattersView, setmattersView] = useState("grid");
  const [searchMatter, setSearchMatter] = useState("");
  const [clientName, setclientName] = useState(null);
  const [matterName, setmatterName] = useState(null);

  const [showDeleteModal, setshowDeleteModal] = useState(false);

  const [showCreateMatter, setShowCreateMatter] = useState(false);
  const [showDeleteMatter, setShowDeleteMatter] = useState(false);
  const [allowOpenFileBucket, setAllowOpenFileBucket] = useState(false);
  const [allowOpenRFI, setAllowOpenRFI] = useState(false);
  const [allowOpenBackground, setAllowOpenBackground] = useState(false);
  const [allowOpenMatter, setAllowOpenMattersOverview] = useState(false);

  const [clientsOptions, setClientsOptions] = useState();
  const [mattersOptions, setMattersOptions] = useState();
  const [selectedClient, setSelectedClient] = useState();
  const [selectedMatter, setSelectedMatter] = useState();
  const [selectedClientMatter, setSelectedClientMatter] = useState();

  let history = useHistory();
  const bool = useRef(false);
  const [showSessionTimeout, setShowSessionTimeout] = useState(false);


  //restructure data from matterlist
  const { listmatters, loading, errorMatter, toastMessage, toast } = matterlist;
  const companyId = localStorage.getItem("companyId");

  const {
    register,
    formState: { errors },
    handleSubmit,
  } = useForm();

  useEffect(() => {
    if (userInfo === null) {
      let ls = {
        userId: localStorage.getItem("userId"),
        email: localStorage.getItem("email"),
        firstName: localStorage.getItem("firstName"),
        lastName: localStorage.getItem("lastName"),
        company: localStorage.getItem("company"),
        userType: localStorage.getItem("userType"),
        access: JSON.parse(localStorage.getItem("access")),
      };
      setuserInfo(ls);
      console.log("ls", ls);
    }

    if (userInfo) {
      featureAccessFilters();
    }

    getMatterList(dispatch, companyId);

    Clients();
    Matters();
  }, [userInfo, dispatch, companyId]);

  const featureAccessFilters = async () => {
    const dashboardAccess = await AccessControl("DASHBOARD");

    if (dashboardAccess.status !== "restrict") {
      setShowCreateMatter(
        dashboardAccess.data.features.includes("ADDCLIENTANDMATTER")
      );
      setShowDeleteMatter(
        dashboardAccess.data.features.includes("DELETECLIENTANDMATTER")
      );
    } else {
      console.log(dashboardAccess.message);
    }

    const mattersOverviewAccess = await AccessControl("MATTERSOVERVIEW");

    if (mattersOverviewAccess.status !== "restrict") {
      setAllowOpenMattersOverview(true);
    } else {
      console.log(mattersOverviewAccess.message);
    }

    const fileBucketAccess = await AccessControl("FILEBUCKET");

    if (fileBucketAccess.status !== "restrict") {
      setAllowOpenFileBucket(true);
    } else {
      console.log(fileBucketAccess.message);
    }

    const RFIAccess = await AccessControl("MATTERSRFI");

    if (RFIAccess.status !== "restrict") {
      setAllowOpenRFI(true);
    } else {
      console.log(RFIAccess.message);
    }

    const backgroundAccess = await AccessControl("BACKGROUND");

    if (backgroundAccess.status !== "restrict") {
      setAllowOpenBackground(true);
    } else {
      console.log(backgroundAccess.message);
    }
  };

  const handleClientChanged = (newValue) => {
    console.log(newValue);
    if (newValue?.__isNew__) {
      addClients(newValue.label);
    } else {
      setclientName(newValue);
    }
  };

  const handleMatterChanged = (newValue) => {
    if (newValue?.__isNew__) {
      addMatters(newValue.label);
    } else {
      setmatterName(newValue);
    }
  };

  const handleNewMatter = async () => {
    let client = {
        id: clientName.value,
        name: clientName.label,
      },
      matter = {
        id: matterName.value,
        name: matterName.label,
      };

    addClientMatter(client, matter, companyId, dispatch);
  };

  const handleModalClose = () => {
    setshowDeleteModal(false);
  };

  const handleShowDeleteModal = (displayStatus, id) => {
    setshowDeleteModal(displayStatus, id);
    setSelectedClientMatter(id);
  };

  const handleDeleteModal = () => {
    handleModalClose();
    deleteMatterClient(selectedClientMatter, dispatch, companyId);
  };

  const listClient = `
query listClient($companyId: String) {
  company(id: $companyId) {
    clients {
      items {
        id
        name
      }
    }
  }
}
`;

  const Clients = async () => {
    let result;

    const clientsOpt = await API.graphql({
      query: listClient,
      variables: {
        companyId: companyId,
      },
    });

    if (clientsOpt.data.company.clients.items !== null) {
      result = clientsOpt.data.company.clients.items.map(({ id, name }) => ({
        value: id,
        label: name,
      }));
    }

    var filtered = result.filter(function (el) {
      return el.label != null && el.value != null;
    });

    setClientsOptions(filtered.sort((a, b) => a.label - b.label));
  };

  const listMatter = `
query listMatter($companyId: String) {
  company(id: $companyId) {
    matters {
      items {
        id
        name
      }
    }
  }
}
`;

  const Matters = async () => {
    let result;

    const mattersOpt = await API.graphql({
      query: listMatter,
      variables: {
        companyId: companyId,
      },
    });

    if (mattersOpt.data.company.matters.items !== null) {
      result = mattersOpt.data.company.matters.items.map(({ id, name }) => ({
        value: id,
        label: name,
      }));
    }

    var filtered = result.filter(function (el) {
      return el.label != null && el.value != null;
    });

    setMattersOptions(filtered.sort((a, b) => a.label - b.label));
  };

  const addClient = `
mutation addClient($companyId: String, $name: String) {
    clientCreate(companyId:$companyId, name:$name) {
        id
        name
    }
}
`;

  const addClients = async (data) => {
    let result;

    const companyId = localStorage.getItem("companyId");

    const addedClientList = await API.graphql({
      query: addClient,
      variables: {
        companyId: companyId,
        name: data,
      },
    });

    result = [addedClientList.data.clientCreate].map(({ id, name }) => ({
      value: id,
      label: name,
    }));

    setclientName(result[0]);
  };

  const addMatter = `
mutation addMatter($companyId: String, $name: String) {
    matterCreate(companyId:$companyId, name:$name) {
        id
        name
    }
}
`;

  const addMatters = async (data) => {
    let result;

    const companyId = localStorage.getItem("companyId");

    const addedMatterList = await API.graphql({
      query: addMatter,
      variables: {
        companyId: companyId,
        name: data,
      },
    });

    result = [addedMatterList.data.matterCreate].map(({ id, name }) => ({
      value: id,
      label: name,
    }));
    setmatterName(result[0]);
  };

  const handleSearchMatterChange = (e) => {
    setSearchMatter(e.target.value);
    if (e.target.value.length >= 1) {
      searchMatterClient(companyId, e.target.value, dispatch);
    } else {
      getMatterList(dispatch, companyId);
    }
  };

  var timeoutId;
  //Session timeout
  const handleOnAction =  (event) => {
    //function for detecting if user moved/clicked.
    //if modal is active and user moved, automatic logout (session expired)
    bool.current = false;
    if(showSessionTimeout){
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

  return userInfo ? (
    <>
    <ScrollToTop
      smooth
      component={<BiArrowToTop style={{color:"white", display:"block", margin:"auto"}}/>}
      className="sm:hidden scrollButton"
      style={{borderRadius: "50%"}}
    />
    <div className="bg-gray-100 p-5 sm:flex-none sm:p-0 sm:bg-white sm:h-auto"> 
        <div className="text-right sm:hidden">
          <h1 className="text-base py-5 px-3 font-bold">AFFIDAVITS &amp; RFI </h1>
        </div>
      <div className="contentDiv bg-white p-5 font-sans rounded-lg">
        <div className="relative bg-gray-100 px-12 py-8 hidden sm:block sm:px-12 sm:py-8 rounded-sm mb-8">
          <div className="grid grid-cols-4 gap-4">
            <div className="col-span-3">
              <Welcome user={userInfo} clientmatters={listmatters} />
              {showCreateMatter && (
                <>
                  <p className="text-gray-400 text-sm">
                    To start adding, type in the name and click the add button
                    below.
                  </p>
                  <form onSubmit={handleSubmit(handleNewMatter)}>
                    <div className="grid grid-flow-col grid-cols-3">
                      <div className="pr-2">
                        <div className="relative flex w-full flex-wrap items-stretch mt-3 pt-5">
                          {/* <input type="text" placeholder="Client" className="px-3 py-3 placeholder-blueGray-300 text-blueGray-600 relative bg-white rounded text-sm border-0 shadow outline-none focus:outline-none focus:ring w-full pl-10"/> */}
                          <CreatableSelect
                            options={clientsOptions}
                            isClearable
                            isSearchable
                            onChange={handleClientChanged}
                            value={selectedClient}
                            placeholder="Client"
                            className="placeholder-blueGray-300 text-blueGray-600 relative bg-white rounded text-sm border-0 shadow outline-none focus:outline-none focus:ring w-full"
                          />
                        </div>
                      </div>
                      <div className="pr-2">
                        <div className="relative flex w-full flex-wrap items-stretch mt-3 pt-5">
                          <span className="z-10 h-full leading-snug font-normal text-center text-blueGray-300 absolute left-3 bg-transparent rounded text-base items-center justify-center w-8 py-3"></span>
                          <CreatableSelect
                            options={mattersOptions}
                            placeholder="Matter"
                            isClearable
                            isSearchable
                            onChange={handleMatterChanged}
                            value={selectedMatter}
                            className="placeholder-blueGray-300 text-blueGray-600 relative bg-white rounded text-sm border-0 shadow outline-none focus:outline-none focus:ring w-full"
                          />
                        </div>
                      </div>
                      <div className="pr-2">
                        <div className="relative flex w-full flex-wrap items-stretch mt-3 pt-5">
                          <button
                            disabled={
                              matterName === null || clientName === null
                            }
                            type="submit"
                            className={
                              matterName === null || clientName === null
                                ? "bg-gray-500 text-gray-50 font-bold py-2.5 px-4 rounded items-center"
                                : "bg-gray-600 hover:bg-gray-500 text-gray-50 font-bold py-2.5 px-4 rounded items-center"
                            }
                          >
                            +
                          </button>
                        </div>
                      </div>
                    </div>
                  </form>
                </>
              )}
            </div>

            <div className="w-3/5 place-self-end">
              <img src={imgDocs} alt="rightside-illustration" />
            </div>
          </div>
        </div>

        <div className="hidden sm:flex">
          <div className="w-full mb-3 py-5">
            <span className="z-10 h-full leading-snug font-normal text-center text-blueGray-300 absolute bg-transparent rounded text-base items-center justify-center w-8 py-3 px-3">
              <IoIcons.IoIosSearch />
            </span>
            <input
              type="search"
              value={searchMatter}
              placeholder="Search Matter or Client ..."
              onChange={handleSearchMatterChange}
              className="px-3 py-3 placeholder-blueGray-300 text-blueGray-600 relative bg-white rounded text-sm border-0 shadow outline-none focus:outline-none focus:ring w-full pl-10"
            />
          </div>
          <div className="mb-3 py-5 w-1/6 text-right">
            {mattersView === "grid" ? (
              <button
                className="bg-white hover:bg-gray-100 text-gray-800 font-semibold py-2.5 px-4 rounded inline-flex items-center border-0 shadow outline-none focus:outline-none focus:ring"
                onClick={() => {
                    setmattersView("list");
                }}
              >
                View as List &nbsp;
                <FaIcons.FaList />
              </button>
            ) : (
              <button
                className="bg-white hover:bg-gray-100 text-gray-800 font-semibold py-2.5 px-4 rounded inline-flex items-center border-0 shadow outline-none focus:outline-none focus:ring"
                onClick={() => setmattersView("grid")}
              >
                View as Grid &nbsp;
                <FaIcons.FaTh />
              </button>
            )}
          </div>
        </div>

        <div
          className={
            //Made every view to tile view in dashboard
            mattersView === "grid"
              ? "grid grid-flow-row auto-rows-max gap-y-5 sm:grid-cols-4 sm:gap-4"
              : "grid grid-flow-row auto-rows-max gap-y-6"
          }
        >
          <MatterContext.Provider
            value={{
              clientMatter: listmatters,
              loading: loading,
              error: errorMatter,
              view: mattersView,
              onShowDeleteModal: handleShowDeleteModal,
              showDeleteMatter: showDeleteMatter,
              allowOpenMatter: allowOpenMatter,
              allowOpenFileBucket: allowOpenFileBucket,
              allowOpenBackground: allowOpenBackground,
              allowOpenRFI: allowOpenRFI,
            }}
          >
            <ClientMatters />
          </MatterContext.Provider>

          {showDeleteModal && (
            <DeleteMatterModal
              handleSave={handleDeleteModal}
              handleModalClose={handleModalClose}
            />
          )}

          {toast && (
            <ToastNotification
              showToast={toast}
              errorMatter={errorMatter}
              error={error}
              title={toastMessage}
            />
          )}
          {showSessionTimeout && (
            <SessionTimeout/>
          )}

        </div>
      </div>
    </div>
      
    </>
  ) : null;
}
