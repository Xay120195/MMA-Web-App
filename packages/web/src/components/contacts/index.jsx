import React, { useEffect, useState } from "react";
import { Link, useHistory } from "react-router-dom";
import ToastNotification from "../toast-notification";
import { API } from "aws-amplify";
import "../../assets/styles/AccountSettings.css";
import { MdArrowForwardIos } from "react-icons/md";
import { FiFilter, FiSend } from "react-icons/fi";
import { AiOutlineDown } from "react-icons/ai";
import { FaUserCircle } from "react-icons/fa";
import { BiDotsVerticalRounded } from "react-icons/bi";
import {
  HiOutlineShare,
  HiOutlinePlusCircle,
  HiOutlineFilter,
  HiMinus,
  HiMinusCircle,
  HiTrash,
} from "react-icons/hi";
import AddContactModal from "./add-contact-modal";

export default function Contacts() {
  const [showAddContactModal, setshowAddContactModal] = useState(false);
  const handleModalClose = () => {
    setshowAddContactModal(false);
  };

  const [contacts, setContacts] = useState(null);
  const [showToast, setShowToast] = useState(false);
  const [resultMessage, setResultMessage] = useState("");
  const hideToast = () => {
    setShowToast(false);
  };

  const qGetContacts = `
  query companyUsers($companyId: String) {
    company(id: $companyId) {
      name
      users {
        items {
          id
          firstName
          lastName
          createdAt
          email
          userType
        }
      }
    }
  }
  `;

  useEffect(() => {
    if (contacts === null) {
      getContacts();
    }
  }, [contacts]);

  let getContacts = async () => {
    const params = {
      query: qGetContacts,
      variables: {
        companyId: localStorage.getItem("companyId"),
      },
    };

    await API.graphql(params).then((companyUsers) => {
      console.log(companyUsers);
      setContacts(companyUsers.data.company.users.items);
    });
  };

  const contentDiv = {
    margin: "0 0 0 65px",
  };

  const mainGrid = {
    display: "grid",
    gridtemplatecolumn: "1fr auto",
  };

  const handleAddContact = (returnedUser) => {
    console.log(returnedUser);
    getContacts();
    handleModalClose();
  };

  return (
    <>
      <div
        className={
          "p-5 relative flex flex-col min-w-0 break-words mb-6 shadow-lg rounded bg-white"
        }
        style={contentDiv}
      >
        <div className="relative flex-grow flex-1">
          <div style={mainGrid}>
            <div>
              <h1 className="font-bold text-3xl">&nbsp; Contacts</h1>
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
        </div>

        <div className="p-5 left-0">
          <div>
            <span className={"text-sm mt-3 font-medium"}>CONTACTS</span>
          </div>
        </div>

        <div className="p-5 left-0">
          <div>
            <input
              type="checkbox"
              name="check_all"
              id="check_all"
              className="cursor-pointer mr-2"
              // checked={checkAllState}
              // onChange={(e) => handleCheckAllChange(e.target.checked)}
            />
            {/* {showAddRow && ( */}
            <button
              className="bg-green-400 hover:bg-green-500 text-white text-sm py-1 px-4 rounded inline-flex items-center border-0 shadow outline-none focus:outline-none focus:ring"
              onClick={() => setshowAddContactModal(true)}
            >
              Add Contact &nbsp;
              <HiOutlinePlusCircle />
            </button>
            {/* )} */}
            {/* {showExport && ( */}
            <button className="bg-gray-50 hover:bg-gray-100 text-black text-sm py-1 px-4 rounded inline-flex items-center border-0 shadow outline-none focus:outline-none focus:ring ml-2">
              Manage Filters &nbsp;
              <FiFilter />
            </button>
            {/* )} */}
            {/* {showDeleteRow && ( */}
            <button
              className="bg-red-400 hover:bg-red-500 text-white text-sm py-1 px-2 rounded inline-flex items-center border-0 shadow outline-none focus:outline-none focus:ring ml-2"
              // onClick={() => handleDeleteRow(this)}
            >
              Delete &nbsp;
              <HiTrash />
            </button>
            {/* )} */}
          </div>
        </div>

        <div className="p-5 left-0">
          <div className="grid grid-cols-4 gap-4">
            {contacts !== null &&
              contacts.length !== 0 &&
              contacts.map((contact) => (
                <div
                  key={contact.id}
                  className="w-full h-42 bg-gray-100 rounded-lg border border-gray-200 mb-6 py-5 px-4"
                >
                  <div className=" py-1 text-right">
                    <div
                      className="bg-white hover:bg-gray-100 text-black font-semibold py-2 px-4 rounded inline-flex items-center border-0 shadow outline-none focus:outline-none focus:ring"
                      // onClick={() => handleAddRow()}
                    >
                      {contact.userType} &nbsp; <AiOutlineDown />
                    </div>{" "}
                    &nbsp;
                    <div
                      className="bg-blue-400 hover:bg-blue-500 text-white text-sm py-2 px-4 rounded inline-flex items-center border-0 shadow outline-none focus:outline-none focus:ring"
                      // onClick={() => handleAddRow()}
                    >
                      Send &nbsp; <FiSend />
                    </div>
                  </div>
                  <div className="flex items-start py-3">
                    <div className="py-4 px-1">
                      <input
                        type="checkbox"
                        name="check_all"
                        id="check_all"
                        className="cursor-pointer mr-2"
                      />
                    </div>
                    <div className="py-3">
                      <FaUserCircle className="text-2xl" />
                    </div>
                    <div className="details-txt px-3">
                      <div className="flex items-start">
                        <p className="font-semibold text-black">
                          {contact.firstName} {contact.lastName}
                        </p>{" "}
                        &nbsp;{" "}
                        {/* <p className="font-semibold">
                          {" "}
                          {contact.company.cname}
                        </p> */}
                      </div>
                      <p>{contact.email}</p>
                    </div>

                    <div className="right-0 py-3">
                      <BiDotsVerticalRounded />
                    </div>
                  </div>

                  {/* <div className="py-5 text-center">
                    <div>
                      <p className="font-semibold text-slate-700  ">
                        TAGGED MATTERS
                      </p>
                    </div>
                  </div> */}
                </div>
              ))}
          </div>
        </div>
      </div>

      {showAddContactModal && (
        <AddContactModal
          handleSave={handleAddContact}
          handleModalClose={handleModalClose}
        />
      )}
    </>
  );
}
