import React, { useState, useEffect } from "react";
import * as IoIcons from "react-icons/io";
import * as FaIcons from "react-icons/fa";
import imgDocs from "../../assets/images/docs.svg";
import { Welcome } from "./welcome";
import { matters, clients } from "./data-source";
import { MattersList } from "./matters-list";
import { Auth } from "aws-amplify";
import Select from "react-select";
import { useForm } from "react-hook-form";
import DeleteMatterModal from "./delete-matters-modal";
import ToastNotification from "../toast-notification";
import "../../assets/styles/Dashboard.css";

export default function Dashboard() {
  const [userInfo, setuserInfo] = useState(null);
  const [mattersView, setmattersView] = useState("grid");
  const [searchMatter, setsearchMatter] = useState();
  const [matterList, setmatterList] = useState(matters);
  const [clientName, setclientName] = useState([]);
  const [matterName, setmatterName] = useState();
  const modalDeleteAlertMsg = "Successfully deleted!";
  const createMatterAlertMsg = "Matter successfully added!";

  const [showDeleteModal, setshowDeleteModal] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [alertMessage, setalertMessage] = useState();

  const {
    register,
    formState: { errors },
    handleSubmit,
  } = useForm();

  const clientNameOptions = clients
    .map(({ id, name }) => ({
      value: id,
      label: name,
    }))
    .sort((a, b) => a.label.localeCompare(b.label));

  useEffect(() => {
    let getUser = async () => {
      try {
        let user = await Auth.currentAuthenticatedUser({
          bypassCache: true,
        });
        await setuserInfo(user);
      } catch (error) {
        console.log(error);
      }
    };
    getUser();

    console.log(searchMatter);
    if (searchMatter !== undefined) {
      filter(searchMatter);
    }
  }, [searchMatter]);

  const filter = (v) => {
    setmatterList(
      matters
        .filter(
          (x) =>
            x.name.toLowerCase().indexOf(v.toLowerCase()) !== -1 ||
            x.client.name.toLowerCase().indexOf(v.toLowerCase()) !== -1
        )
        .sort((a, b) => a.name.localeCompare(b.name))
    );
  };

  const handleClientChanged = (newValue) => {
    console.group("Client Changed");
    console.log(newValue);
    console.groupEnd();

    setclientName(newValue);
  };

  const handleMatterChanged = (newValue) => {
    console.group("Matter Changed");
    console.log(newValue);
    console.groupEnd();

    setmatterName(newValue);
  };

  const handleSearchMatterChange = (e) => {
    console.log(e.target.value);
    setsearchMatter(e.target.value);
  };

  const handleNewMatter = (data) => {
    let client_name = clientName.label,
      client_id = clientName.value,
      matter_name = data.matterName,
      matter_id = 123,
      matter_number = `${matter_name.charAt(0)}-${matter_id}/${client_id}`;

    console.log(data);
    console.log(clientName.value);

    setmatterList((previousState) => [
      {
        id: 198,
        name: matter_name,
        matter_number: matter_number,
        client: {
          id: client_id,
          name: client_name,
        },
        substantially_responsible: {
          id: 2,
          name: "Adrian Silva",
          email: "adrian.silva@lophils.com",
          profile_picture:
            "https://as1.ftcdn.net/v2/jpg/03/64/62/36/1000_F_364623643_58jOINqUIeYmkrH7go1smPaiYujiyqit.jpg?auto=compress&cs=tinysrgb&h=650&w=940",
        },
      },
      ...previousState,
    ]);

    console.log(matterList);
    setalertMessage(createMatterAlertMsg);
    handleModalClose();
    setShowToast(true);
    setTimeout(() => {
      setShowToast(false);
      setclientName([]);
      setmatterName("");
    }, 3000);
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

  return userInfo ? (
    <>
      <div className="p-5 font-sans" style={contentDiv}>
        <div className="relative bg-gray-100 px-12 py-8 sm:px-12 sm:py-8 rounded-sm mb-8">
          <div className="grid grid-cols-4 gap-4">
            <div className="col-span-3">
              <Welcome user={userInfo} matters={matters} />
              <p className="text-gray-400 text-sm">
                To start adding, type in the name and click the add button
                below.
              </p>
              <form onSubmit={handleSubmit(handleNewMatter)}>
                <div className="grid grid-flow-col grid-cols-3">
                  <div className="pr-2">
                    <div className="relative flex w-full flex-wrap items-stretch mt-3 pt-5">
                      <span className="z-10 h-full leading-snug font-normal text-center text-blueGray-300 absolute left-3 bg-transparent rounded text-base items-center justify-center w-8 py-3">
                        <IoIcons.IoIosFolder />
                      </span>
                      <input
                        type="text"
                        placeholder="Matter"
                        onChange={handleMatterChanged}
                        className="px-3 py-3 placeholder-blueGray-300 text-blueGray-600 relative bg-white rounded text-sm border-0 shadow outline-none focus:outline-none focus:ring w-full pl-10"
                        {...register("matterName", { required: true })}
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
                      {/* <input type="text" placeholder="Client" className="px-3 py-3 placeholder-blueGray-300 text-blueGray-600 relative bg-white rounded text-sm border-0 shadow outline-none focus:outline-none focus:ring w-full pl-10"/> */}
                      <Select
                        options={clientNameOptions}
                        isClearable
                        isSearchable
                        onChange={handleClientChanged}
                        placeholder="Client"
                        className="placeholder-blueGray-300 text-blueGray-600 relative bg-white rounded text-sm border-0 shadow outline-none focus:outline-none focus:ring w-full"
                      />
                      {/* {errors.clientName?.type === 'required' && <small className="text-red-400">Client is required</small>} */}
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
          {matterList.length === 0 ? (
            <p className="text-red-500">No result found.</p>
          ) : (
            matterList.map((matter, index) => (
              <MattersList
                key={index}
                index={index}
                matter={matter}
                view={mattersView}
                onShowDeleteModal={handleShowDeleteModal}
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
  ) : (
    <p>Please wait ...</p>
  );
}
