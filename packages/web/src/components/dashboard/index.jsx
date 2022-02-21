import React, { useState, useEffect } from "react";
import * as IoIcons from "react-icons/io";
import * as FaIcons from "react-icons/fa";
import imgDocs from "../../assets/images/docs.svg";
import { Welcome } from "./welcome";
import { ClientMatters } from "./matters-list";
import { useForm } from "react-hook-form";
import DeleteMatterModal from "./delete-matters-modal";
import ToastNotification from "../toast-notification";
import dateFormat from "dateformat";
import "../../assets/styles/Dashboard.css";
import AccessControl from "../../shared/accessControl";
import CreatableSelect from "react-select/creatable";
import { API } from "aws-amplify";

export default function Dashboard() {
  const [userInfo, setuserInfo] = useState(null);
  const [mattersView, setmattersView] = useState("grid");
  const [searchMatter, setsearchMatter] = useState();
  const [clientName, setclientName] = useState(null);
  const [matterName, setmatterName] = useState();
  const modalDeleteAlertMsg = "Successfully deleted!";
  const createMatterAlertMsg = "Matter successfully added!";

  const [showDeleteModal, setshowDeleteModal] = useState(false);
  const [showToast, setShowToast] = useState(false);

  const [showCreateMatter, setShowCreateMatter] = useState(false);
  const [showDeleteMatter, setShowDeleteMatter] = useState(false);
  const [allowOpenFileBucket, setAllowOpenFileBucket] = useState(false);
  const [allowOpenBackground, setAllowOpenBackground] = useState(false);
  const [allowOpenMatter, setAllowOpenMattersOverview] = useState(false);
  const [alertMessage, setalertMessage] = useState();
  const [clientsOptions, setClientsOptions] = useState();
  const [mattersOptions, setMattersOptions] = useState();
  const [selectedClient, setSelectedClient] = useState();
  const [selectedMatter, setSelectedMatter] = useState();
  const [clientMattersList, setClientMattersList] = useState([]);
  const [isLoaded, setLoaded] = useState(false)

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
    }

    if (searchMatter !== undefined) {
      filter(searchMatter);
    }

    if (userInfo) {
      featureAccessFilters();
    }

    if(!isLoaded) {
      if (clientMattersList !== undefined) {
        ClientMatterList();
      }

      Clients();
      Matters();

      setLoaded(true);
    }
  }, [searchMatter, userInfo]);

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

    const backgroundAccess = await AccessControl("BACKGROUND");

    if (backgroundAccess.status !== "restrict") {
      setAllowOpenBackground(true);
    } else {
      console.log(backgroundAccess.message);
    }
  };

  const filter = (v) => {
    setClientMattersList(
      clientMattersList
        .filter(
          (x) =>
            x.matter.name.toLowerCase().includes(v.toLowerCase()) ||
            x.client.name.toLowerCase().includes(v.toLowerCase())
        )
        .sort((a, b) => a.matter.name.localeCompare(b.matter.name))
    );
  };

  const handleClientChanged = (newValue) => {
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

  const handleSearchMatterChange = (e) => {
    setsearchMatter(e.target.value);
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

    await addClientMatter(client, matter);
  };

  const contentDiv = {
    margin: "0 0 0 65px",
  };

  const handleModalClose = () => {
    setshowDeleteModal(false);
  };

  const hideToast = () => {
    setShowToast(false);
  };

  const handleShowDeleteModal = (value) => {
    setshowDeleteModal(value);
  };

  const handleDeleteModal = () => {
    setalertMessage(modalDeleteAlertMsg);
    handleModalClose();
    setShowToast(true);
    setTimeout(() => {
      setShowToast(false);
    }, 3000);
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

    const companyId = localStorage.getItem("companyId");
    const clientsOpt = await API.graphql({
      query: listClient,
      variables: {
        companyId: companyId,
      },
    });

    if (clientsOpt.data.company.clients.items !== null) {
      result = clientsOpt.data.company.clients.items
        .map(({ id, name }) => ({
          value: id,
          label: name,
        }))
        .sort((a, b) => a.label.localeCompare(b.label));
    }

    setClientsOptions(result);
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

    const companyId = localStorage.getItem("companyId");

    const mattersOpt = await API.graphql({
      query: listMatter,
      variables: {
        companyId: companyId,
      },
    });

    if (mattersOpt.data.company.matters.items !== null) {
      result = mattersOpt.data.company.matters.items
        .map(({ id, name }) => ({
          value: id,
          label: name,
        }))
        .sort((a, b) => a.label.localeCompare(b.label));
    }

    setMattersOptions(result);
  };

  const listClientMatters = `
  query listClientMatters($companyId: String) {
    company(id: $companyId) {
      clientMatters {
        items {
          id
          createdAt
          client {
            id
            name
          }
          matter {
            id
            name
          }
        }
      }
    }
  }
  `;

  const ClientMatterList = async () => {
    let result = [];

    const companyId = localStorage.getItem("companyId");
    const clientMattersOpt = await API.graphql({
      query: listClientMatters,
      variables: {
        companyId: companyId,
      },
    });

    if (clientMattersOpt.data.company.clientMatters.items !== null) {
      result = clientMattersOpt.data.company.clientMatters.items;

      const dummyPersonResponsible = {
        id: 2,
        name: "Adrian Silva",
        email: "adrian.silva@lophils.com",
        profile_picture:
          "https://as1.ftcdn.net/v2/jpg/03/64/62/36/1000_F_364623643_58jOINqUIeYmkrH7go1smPaiYujiyqit.jpg?auto=compress&cs=tinysrgb&h=650&w=940",
      };

      var apdPr = result.map((v) => ({
        ...v,
        substantially_responsible: dummyPersonResponsible,
      }));
      var apdMn = apdPr.map((v) => ({
        ...v,
        matter_number: `{${v.matter.name.charAt(2)}-${v.matter.id.slice(
          -4
        )}/${v.client.id.slice(-4)}}`,
      }));

      setClientMattersList(apdMn);
    }
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

  const createClientMatter = `
  mutation createClientMatter($companyId: String, $client: ClientInput, $matter:MatterInput) {
    clientMatterCreate(companyId: $companyId, client: $client, matter:$matter) {
      id
    }
}
`;

  const addClientMatter = async (client, matter) => {
    const companyId = localStorage.getItem("companyId");
    const addedClientMatter = await API.graphql({
      query: createClientMatter,
      variables: {
        companyId: companyId,
        client: client,
        matter: matter,
      },
    });

    setalertMessage(createMatterAlertMsg);
    handleModalClose();
    setShowToast(true);
    setSelectedClient([]);
    setSelectedMatter([]);
    ClientMatterList();
    setTimeout(() => {
      setShowToast(false);
      setmatterName("");
    }, 3000);
  };

  return userInfo ? (
    <>
      <div className="p-5 font-sans" style={contentDiv}>
        <div className="relative bg-gray-100 px-12 py-8 sm:px-12 sm:py-8 rounded-sm mb-8">
          <div className="grid grid-cols-4 gap-4">
            <div className="col-span-3">
              <Welcome user={userInfo} clientmatters={clientMattersList} />

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
                          {/* {errors.clientName?.type === 'required' && <small className="text-red-400">Client is required</small>} */}
                        </div>
                      </div>
                      <div className="pr-2">
                        <div className="relative flex w-full flex-wrap items-stretch mt-3 pt-5">
                          <span className="z-10 h-full leading-snug font-normal text-center text-blueGray-300 absolute left-3 bg-transparent rounded text-base items-center justify-center w-8 py-3"></span>
                          <CreatableSelect
                            options={mattersOptions}
                            isClearable
                            isSearchable
                            onChange={handleMatterChanged}
                            value={selectedMatter}
                            placeholder="Matters"
                            className="placeholder-blueGray-300 text-blueGray-600 relative bg-white rounded text-sm border-0 shadow outline-none focus:outline-none focus:ring w-full"
                          />
                          {errors.matterName?.type === "required" && (
                            <small className="text-red-400">
                              Matter is required
                            </small>
                          )}
                        </div>
                      </div>
                      <div className="pr-2">
                        <div className="relative flex w-full flex-wrap items-stretch mt-3 pt-5">
                          <button
                            type="submit"
                            className="bg-gray-600 hover:bg-gray-500 text-gray-50 font-bold py-2.5 px-4 rounded items-center"
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

        <div className="flex">
          <div className="w-full mb-3 py-5">
            <span className="z-10 h-full leading-snug font-normal text-center text-blueGray-300 absolute bg-transparent rounded text-base items-center justify-center w-8 py-3 px-3">
              <IoIcons.IoIosSearch />
            </span>
            <input
              type="search"
              placeholder="Search Matter or Client ..."
              onChange={handleSearchMatterChange}
              className="px-3 py-3 placeholder-blueGray-300 text-blueGray-600 relative bg-white rounded text-sm border-0 shadow outline-none focus:outline-none focus:ring w-full pl-10"
            />
          </div>
          <div className="mb-3 py-5 w-1/6 text-right">
            {mattersView === "grid" ? (
              <button
                className="bg-white hover:bg-gray-100 text-gray-800 font-semibold py-2.5 px-4 rounded inline-flex items-center border-0 shadow outline-none focus:outline-none focus:ring"
                onClick={() => setmattersView("list")}
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
            mattersView === "grid"
              ? "grid grid-cols-4 gap-4"
              : "grid-flow-row auto-rows-max"
          }
        >
          {clientMattersList.length === 0 ? (
            <p className="text-red-500">No result found.</p>
          ) : (
            clientMattersList.map((matter, index) => (
              <ClientMatters
                key={index}
                index={index}
                clientMatter={matter}
                view={mattersView}
                onShowDeleteModal={handleShowDeleteModal}
                showDeleteMatter={showDeleteMatter}
                allowOpenMatter={allowOpenMatter}
                allowOpenFileBucket={allowOpenFileBucket}
                allowOpenBackground={allowOpenBackground}
              />
            ))
          )}

          {showDeleteModal && (
            <DeleteMatterModal
              handleSave={handleDeleteModal}
              handleModalClose={handleModalClose}
            />
          )}

          {showToast && (
            <ToastNotification title={alertMessage} hideToast={hideToast} />
          )}
        </div>
      </div>
    </>
  ) : null;
}
