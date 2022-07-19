import React, { useEffect, useState } from "react";
import { Link, useHistory } from "react-router-dom";
import ToastNotification from "../toast-notification";
import { API } from "aws-amplify";
import "../../assets/styles/AccountSettings.css";
import { MdArrowForwardIos, MdKeyboardArrowLeft } from "react-icons/md";
import { FiFilter, FiSend } from "react-icons/fi";
import { AiOutlineDown } from "react-icons/ai";
import { FaUserCircle } from "react-icons/fa";
import { BiDotsVerticalRounded, BiSort } from "react-icons/bi";
import {
  HiOutlineShare,
  HiOutlinePlusCircle,
  HiOutlineFilter,
  HiMinus,
  HiMinusCircle,
  HiTrash,
} from "react-icons/hi";
import { FaUsers } from "react-icons/fa";
import "./contacts.css";
import AddContactModal from "./add-contact-revamp-modal";
import dummy from "./dummy.json";
import User from "./user";
import { alphabet } from "./alphabet";
import { BiSortAZ, BiSortZA } from "react-icons/bi";

export default function Contacts() {
  const [showAddContactModal, setshowAddContactModal] = useState(false);
  const handleModalClose = () => {
    setshowAddContactModal(false);
  };

  const [contacts, setContacts] = useState(null);
  const [ActiveMenu, setActiveMenu] = useState("Contacts");
  const [showToast, setShowToast] = useState(false);
  const [resultMessage, setResultMessage] = useState("");
  const [ActiveLetter, setActiveLetter] = useState("a");
  const [IsSortedReverse, setIsSortedReverse] = useState(false);

  const [ContactList, setContactList] = useState();
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

  const RenderGroup = ({ cl, letterNow }) => {
    return (
      <>
        {cl.map((user) => (
          <tr className="text-left" key={user.id}>
            <User user={user} />
          </tr>
        ))}
      </>
    );
  };

  //Filter Name Alphabetically
  useEffect(() => {
    dummy.sort((a, b) => a.name.localeCompare(b.name));
    setContactList(dummy);
  }, []);

  let history = useHistory();

  const handleSort = (sortedReverse, sortBy) => {
    if (sortedReverse) {
      if (sortBy === "name") {
        dummy.sort((a, b) => a.name.localeCompare(b.name));
      } else if (sortBy === "type") {
        dummy.sort((a, b) => a.type.localeCompare(b.type));
      } else if (sortBy === "company") {
        dummy.sort((a, b) => a.company.localeCompare(b.company));
      }
    } else {
      if (sortBy === "name") {
        dummy.sort((a, b) => a.name.localeCompare(b.name)).reverse();
      } else if (sortBy === "type") {
        dummy.sort((a, b) => a.type.localeCompare(b.type)).reverse();
      } else if (sortBy === "company") {
        dummy.sort((a, b) => a.company.localeCompare(b.company)).reverse();
      } else {
        dummy.sort().reverse();
      }
    }
  };

  const RenderSort = ({ sortBy }) => {
    return (
      <>
        {IsSortedReverse ? (
          <BiSortAZ
            onClick={() => {
              setIsSortedReverse(!IsSortedReverse);
              handleSort(IsSortedReverse, sortBy);
            }}
            className="text-sm cursor-pointer hover:text-gray-500"
          />
        ) : (
          <BiSortZA
            onClick={() => {
              setIsSortedReverse(!IsSortedReverse);
              handleSort(IsSortedReverse, sortBy);
            }}
            className="text-sm cursor-pointer hover:text-gray-500"
          />
        )}
      </>
    );
  };

  const handleScroll = (event) => {
    console.log("scrollTop: ", event.currentTarget.scrollTop);
    console.log("offsetHeight: ", event.currentTarget.offsetHeight);
  };

  return (
    <>
      <div
        onScroll={handleScroll}
        className={
          "p-5 relative flex flex-col min-w-0 break-words mb-6 shadow-lg rounded bg-white"
        }
        style={contentDiv}
      >
        {/*TopView*/}
        <div className="py-5 flex flex-row items-center">
          <MdKeyboardArrowLeft
            className="cursor-pointer hover:text-gray-500"
            onClick={() => history.goBack()}
          />

          <div className="flex flex-col justify-center">
            <div>
              <h1 className="font-semibold text-lg">
                &nbsp; Contacts
                <span className=""> of {`Matthew Douglas`}</span>
              </h1>
            </div>
            <div>
              <span className="ml-3 flex flex-row text-xs font-bold">
                <FaUsers className="text-sm" color={`gray`} /> &nbsp; CONTACTS
              </span>
            </div>
          </div>
        </div>

        <div className="flex flex-col ">
          <div className="py-3 flex flex-row gap-4">
            <div
              className={
                ActiveMenu === "Contacts"
                  ? `mr-right font-semibold hover:text-gray-500 cursor-pointer`
                  : `mr-right hover:text-gray-500 cursor-pointer`
              }
            >
              Contacts &nbsp; {dummy.length}
            </div>
            <div
              className={
                ActiveMenu === "Teams"
                  ? `mr-right font-semibold hover:text-gray-500 cursor-pointer`
                  : `mr-right hover:text-gray-500 cursor-pointer`
              }
            >
              Teams &nbsp; {"0"}
            </div>
            <div className="ml-auto">
              <div>
                {/* {showAddRow && ( */}
                <button
                  className="bg-green-400 hover:bg-green-500 text-white text-sm py-1 px-4 rounded inline-flex items-center border-0 shadow outline-none focus:outline-none focus:ring"
                  onClick={() => setshowAddContactModal(true)}
                >
                  Add Contact &nbsp;
                </button>
              </div>
            </div>
          </div>
          <div className="flex flex-row">
            <div
              className={
                ActiveMenu === "Contacts"
                  ? `rounded-full bg-gray-500 w-28 h-0.5`
                  : `rounded-full  bg-gray-100 w-28 h-0.5`
              }
            ></div>
            <div
              className={
                ActiveMenu === "Teams"
                  ? `bg-black w-28 h-0.5`
                  : `rounded-full  bg-gray-100 w-52 h-0.5`
              }
            ></div>
            <div className="rounded-full bg-gray-100 w-full h-0.5"></div>
          </div>
        </div>

        {/*FILTER A-Z*/}
        <div className="top-60 fixed">
          {alphabet.map((a) =>
            ActiveLetter === a ? (
              <div className="py-0.5 hoverActive cursor-pointer">
                {a.toUpperCase()}
              </div>
            ) : (
              <div className="py-0.5 hover cursor-pointer">
                {a.toUpperCase()}
              </div>
            )
          )}
        </div>

        <div className="pl-6 flex flex-row w-full h-full items-center">
          <table className="table-auto w-full">
            <thead className="text-left">
              <th>
                <div className="p-5 flex flex-row gap-1 items-center">
                  Name <RenderSort sortBy={"name"} />
                </div>
              </th>
              <th>Email</th>
              <th>Team</th>
              <th>
                <div className="flex flex-row gap-1 items-center">
                  User Type <RenderSort sortBy={"type"} />
                </div>
              </th>
              <th>
                <div className="flex flex-row gap-1 items-center">
                  Company <RenderSort sortBy={"company"} />
                </div>
              </th>
              <th></th>
            </thead>
            <tbody className="w-full">
              {ContactList &&
                alphabet.map((a) => (
                  <>
                    <tr onScroll={() => console.log("TEST")}>
                      <div className="px-5 py-1">
                        <span className="scale-125 hover:text-cyan-500 font-semibold text-gray-400">
                          {a.toUpperCase()}
                        </span>
                      </div>
                    </tr>

                    <RenderGroup
                      cl={ContactList.filter((u) =>
                        u.name.toLowerCase().startsWith(a)
                      )}
                    />
                  </>
                ))}
            </tbody>
          </table>
        </div>
      </div>

      {showAddContactModal && (
        <AddContactModal
          close={() => setshowAddContactModal(false)}
          handleModalClose={handleModalClose}
        />
      )}
    </>
  );
}
