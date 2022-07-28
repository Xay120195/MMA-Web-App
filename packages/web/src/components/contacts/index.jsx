import '../../assets/styles/AccountSettings.css';
import './contacts.css';

import { CgChevronLeft, CgSortAz, CgSortZa, CgTrash } from 'react-icons/cg';
import { FaEdit, FaTrash, FaUsers } from 'react-icons/fa';
import { Link, useHistory } from 'react-router-dom';
import React, { useEffect, useState, useRef } from "react";
import anime from "animejs";
import { API } from "aws-amplify";
import AddContactModal from "./add-contact-revamp-modal";
import DeleteModal from "./delete-modal";
import ToastNotification from "../toast-notification";
import User from "./user";
import { alphabetArray } from "./alphabet";
import ContactInformationModal from "./contact-information-modal";
import dummy from "./dummy.json";

export default function Contacts() {
  const [showAddContactModal, setshowAddContactModal] = useState(false);
  const handleModalClose = () => {
    setshowAddContactModal(false);
  };

  const rows = useRef(null);
  const refLetters = useRef([]); //added Refletters to fix scrolling
  const [shortcutSelected, setShortcutSelected] = useState("");

  const [ShowDeleteModal, setShowDeleteModal] = useState(false);
  const [contacts, setContacts] = useState(null);
  const [ActiveMenu, setActiveMenu] = useState("Contacts");
  const [showToast, setShowToast] = useState(false);
  const [resultMessage, setResultMessage] = useState("");
  const [ActiveLetter, setActiveLetter] = useState("a");
  const [IsSortedReverse, setIsSortedReverse] = useState(false);
  const [isToDelete, setisToDelete] = useState("");
  const [ContactList, setContactList] = useState(null);

  const [ShowEditModal, setShowEditModal] = useState(false); //added Edit Modal
  const [CurrentUser, setCurrentUser] = useState({}); //Added current User

  const [defaultCompany, setDefaultCompany] = useState("");
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

  //Added 3 seconds turning to light blue when adding an entry
  useEffect(
    (e) => {
      anime({
        targets: rows.current,
        opacity: [0.4, 1],
        duration: 1500,
        easing: "cubicBezier(.5, .05, .1, .3)",
      });

      refLetters.current = refLetters.current.slice(0, alphabetArray.length);
    },
    [ContactList]
  );

  let getContacts = async () => {
    const params = {
      query: qGetContacts,
      variables: {
        companyId: localStorage.getItem("companyId"),
      },
    };

    await API.graphql(params).then((companyUsers) => {
      console.log("usersssss", companyUsers);
      var temp = companyUsers.data.company.users.items;
      temp.sort((a, b) => a.firstName.localeCompare(b.firstName));
      temp.map(
        (x) =>
          (x.firstName =
            x.firstName.charAt(0).toUpperCase() +
            x.firstName.slice(1).toLowerCase())
      );
      setDefaultCompany(companyUsers.data.company.name);
      setContactList(dummy);
    });
  };

  const handleEditModal = (user) => {
    //Added edit modal open
    setCurrentUser(user);
    setShowEditModal(true);
  };

  const handleDeleteModal = (id) => {
    setisToDelete(id);
    setShowDeleteModal(true);
  };
  let history = useHistory();

  const handleSort = (sortedReverse, sortBy) => {
    if (sortedReverse) {
      if (sortBy === "firstName") {
        ContactList.sort((a, b) => a.firstName.localeCompare(b.firstName));
        alphabetArray.sort();
      } else if (sortBy === "userType") {
        ContactList.sort((a, b) => a.userType.localeCompare(b.userType));
        alphabetArray.sort();
      }
    } else {
      if (sortBy === "firstName") {
        ContactList.sort((a, b) =>
          a.firstName.localeCompare(b.firstName)
        ).reverse();
        alphabetArray.sort().reverse();
      } else if (sortBy === "userType") {
        ContactList.sort((a, b) =>
          a.userType.localeCompare(b.userType)
        ).reverse();
        alphabetArray.sort().reverse();
      }
    }
  };

  const RenderSort = ({ sortBy }) => {
    return (
      <>
        {IsSortedReverse ? (
          <CgSortAz
            onClick={() => {
              setIsSortedReverse(!IsSortedReverse);
              handleSort(IsSortedReverse, sortBy);
            }}
            className="text-xl cursor-pointer hover:text-gray-500"
          />
        ) : (
          <CgSortZa
            onClick={() => {
              setIsSortedReverse(!IsSortedReverse);
              handleSort(IsSortedReverse, sortBy);
            }}
            className="text-xl cursor-pointer hover:text-gray-500"
          />
        )}
      </>
    );
  };

  // const useOnIntersect = (ref) => {
  //   const [isIntersecting, setIsIntersecting] = useState(false);
  //   const observer = new IntersectionObserver(([entry]) => {
  //     setIsIntersecting(entry.isIntersecting);
  //   });
  //   useEffect(() => {
  //     observer.observe(ref.current);
  //     return () => observer.unobserve(ref.current);
  //   }, [ref]);

  //   return isIntersecting;
  // };

  const scrollToView = (target) => {
    const el = document.getElementById(target);
    el &&
      window.scroll({ left: 0, top: el.offsetTop + 100, behavior: "smooth" }); //added fixed scrolling
  };

  // const handleScroll = (event) => {
  //   console.log("scrollTop: ", event.currentTarget.scrollTop);
  //   console.log("offsetHeight: ", event.currentTarget.offsetHeight);
  // };

  useEffect(() => {
    if (ContactList === null) {
      getContacts();
    }
    /*

    anime({
      targets: rows.current,
      opacity: [0, 1],
      duration: 600,
      easing: "linear",
    });
    */

    // observe the scroll event and set the active letter
    window.addEventListener(
      "scroll",
      () => {
        /*
        const maxScrollHeight = document.body.scrollHeight;
        const currentScrollPos = window.pageYOffset;
        // get the current scroll position
        const currentScrollPosInPercent = currentScrollPos / maxScrollHeight;
        // get the letter based on the current scroll position in percent
        const currentLetter = Math.floor(
          alphabetArray.length * (currentScrollPosInPercent - 0.05)
        );

        // set the active letter
        setShortcutSelected(
          alphabetArray[
            Math.max(0, Math.min(currentLetter, alphabetArray.length - 1))
          ]
        );
        */
        //Fixed Issue Scrolling ang setting active letter
        const currentScrollPos = window.pageYOffset;
        // get the current scroll position
        console.log(refLetters);
        refLetters.current.forEach((ref, i) => {
          if (ref) {
            let top = ref.offsetTop + 100;
            let bottom =
              refLetters.current.length - 1 === i
                ? refLetters.current[0].offsetTop + 100
                : refLetters.current[i + 1].offsetTop + 100;

            //get height of list of contacts with specific letter

            //if it matches within the range get it

            if (currentScrollPos >= top && currentScrollPos <= bottom) {
              console.log("SELECTED,", ref.id);
              setShortcutSelected(String(ref.id));
              //set Active Letter if in range
            }
          }
        });
      },
      { passive: true }
    );
  }, []);

  return (
    <>
      <main className="pl-0 p-5 sm:pl-20 w-full ">
        {/* header */}
        <div className="sticky top-0 py-4 flex items-center gap-2 bg-white z-10">
          <div
            onClick={() => history.replace("/dashboard")}
            className="w-8 py-5 cursor-pointer"
          >
            <CgChevronLeft />
          </div>
          <div>
            <p>
              <span className="text-lg font-bold">Contacts</span>{" "}
              <span className="text-lg font-light">
                {" "}
                of {localStorage.getItem("firstName")}{" "}
                {localStorage.getItem("lastName")}
              </span>
            </p>
            <div className="flex items-center gap-3 text-gray-500">
              <FaUsers />
              <p className="font-semibold">Contacts</p>
            </div>
          </div>
        </div>

        {/* tabs and action buttons */}
        <div>
          <div className="flex justify-between items-center border-b-2 border-gray-200 ">
            {/* tabs */}
            <div className="flex items-center gap-x-8 w-max">
              <p
                className={`py-5 border-b-2 flex items-center gap-x-3 border-transparent cursor-pointer font-medium ${
                  true && "border-gray-700 "
                }`}
              >
                Contacts{" "}
                <span className="text-sm rounded-full flex items-center justify-center font-semibold">
                  {ContactList && ContactList.length}
                </span>
              </p>
              <p
                onClick={() => setActiveMenu("Team")} //setActiveMenu to Teams
                className={`py-5 border-b-2 flex items-center gap-x-3 border-transparent cursor-pointer font-medium ${
                  false && "border-gray-700 "
                }`}
              >
                Team{" "}
                <span className="text-sm rounded-full flex items-center justify-center font-semibold">
                  0
                </span>
              </p>
            </div>
            {/* action buttons */}
            <div className="flex items-center gap-x-5">
              <button
                onClick={() => setshowAddContactModal(true)}
                className="py-2 px-4 bg-green-400 rounded w-max font-semibold text-white"
              >
                Add Contact
              </button>
            </div>
          </div>
        </div>

        {/* main content */}
        <div className="relative w-full flex gap-x-5 py-5 max-w-[100vw]">
          {/* alphabet array */}
          <div className="px-3 py-2 ">
            <div className="sticky top-20 flex flex-col gap-y-1 pt-5">
              {alphabetArray.map((letter) => {
                // check if letter is in dummy array

                const isLetter =
                  ContactList &&
                  ContactList.some((user) => user.firstName.startsWith(letter));
                if (isLetter) {
                  return (
                    <p
                      key={letter}
                      onClick={(e) => {
                        //To prevent double setting shortcut selecting only set if user is in bottom of screen
                        if (
                          window.innerHeight + window.scrollY >=
                          document.body.offsetHeight
                        ) {
                          setShortcutSelected(letter);
                        }
                        scrollToView(letter);
                      }}
                      style={{
                        transform: `translateX(${
                          letter === shortcutSelected ? "10px" : "0px"
                        })`,
                      }}
                      className={`text-center text-gray-400 cursor-pointer transition-all font-bold  hover:scale-110 hover:text-blue-600 ${
                        shortcutSelected === letter && "text-cyan-500"
                      }`}
                    >
                      {letter}
                    </p>
                  );
                }
              })}
            </div>
          </div>
          {/* table */}
          <div className="w-full py-2">
            <table className="w-full text-left">
              {/* headers */}
              <thead className="sticky top-20 bg-white z-10">
                <tr>
                  <th className="p-2">
                    <div className="flex items-center gap-x-2">
                      Name {<RenderSort sortBy="name" />}
                    </div>
                  </th>
                  <th className="p-2">Email</th>
                  <th className="p-2">Team</th>
                  <th className="p-2">
                    <div className="flex items-center gap-x-2 ">
                      User Type {<RenderSort sortBy="type" />}
                    </div>
                  </th>
                  <th className="p-2">
                    <div className="flex items-center gap-x-2">
                      Company {<RenderSort type="company" />}
                    </div>
                  </th>
                  <th className="p-2 w-20 " />
                </tr>
              </thead>
              {/* content */}
              <tbody className="relative">
                {alphabetArray.map((letter, idx) => (
                  <>
                    {ContactList &&
                      ContactList.some((user) =>
                        user.firstName.startsWith(letter)
                      ) && (
                        <>
                          <tr
                            ref={(el) => (refLetters.current[idx] = el)} //added div useRef
                            id={letter}
                            key={letter}
                            className=""
                          >
                            <td className="pt-4 px-2">
                              <div className="flex items-center gap-x-2">
                                <p
                                  className={`${
                                    shortcutSelected == letter
                                      ? "text-cyan-500 font-bold"
                                      : "text-gray-700 font-semibold"
                                  }  text-lg `}
                                >
                                  {letter}
                                </p>
                              </div>
                            </td>
                          </tr>
                          {ContactList &&
                            ContactList.map(
                              (contact, index) =>
                                contact.firstName.charAt(0) == letter && (
                                  <tr
                                    ref={contact.isNewlyAdded ? rows : null}
                                    key={contact.id}
                                    className={
                                      contact.isNewlyAdded
                                        ? "opacity-100 bg-cyan-100"
                                        : "opacity-100"
                                    }
                                  >
                                    <td className="p-2">
                                      <div className="flex items-center gap-x-2 ">
                                        <span>
                                          <img
                                            className="rounded-full w-8 h-8"
                                            src={`https://i.pravatar.cc/70?img=${index}`}
                                          />
                                        </span>
                                        <p className="font-semibold">
                                          {contact.firstName} {contact.lastName}
                                        </p>
                                      </div>
                                    </td>
                                    <td className="p-2">{contact.email}</td>
                                    <td className="p-2"> </td>
                                    <td className="p-2 w-64 ">
                                      <div className="flex items-center gap-x-2 ">
                                        <p className="font-semibold text-xs rounded-full bg-blue-100 px-2 py-1">
                                          {contact.userType}
                                        </p>
                                      </div>
                                    </td>
                                    <td className="p-2">{defaultCompany}</td>

                                    <td className="p-2">
                                      <div className="flex items-center gap-x-2">
                                        <button className="p-3 rounded w-max font-semibold text-gray-500">
                                          <FaEdit
                                            onClick={() =>
                                              handleEditModal(contact)
                                            }
                                          />
                                        </button>
                                        <button className="p-3 text-red-400 rounded w-max font-semibold ">
                                          <CgTrash
                                            onClick={() =>
                                              handleDeleteModal(contact.id)
                                            }
                                          />
                                        </button>
                                      </div>
                                    </td>
                                  </tr>
                                )
                            )}
                        </>
                      )}
                  </>
                ))}
              </tbody>
            </table>
          </div>
        </div>
        {ShowDeleteModal && (
          <DeleteModal
            close={() => setShowDeleteModal(false)}
            toDeleteid={isToDelete}
            setContactList={setContactList}
            ContactList={ContactList}
          />
        )}
        {ShowEditModal && (
          <ContactInformationModal
            ContactList={ContactList}
            setContactList={setContactList}
            close={() => setShowEditModal(false)}
            user={CurrentUser}
          />
        )}
      </main>

      {/* 

      <div
        onScroll={handleScroll}
        className={
          "p-5 relative flex flex-col min-w-0 break-words mb-6 shadow-lg rounded bg-white"
        }
        style={contentDiv}
      >
        
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

        
        <div className="top-60 fixed">
          {alphabet.map((a, idx) =>
            ActiveLetter === a ? (
              <div key={idx} className="py-0.5 hoverActive cursor-pointer">
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
                alphabet.map((a, idx) => (
                  <>
                    <tr key={idx} onScroll={() => console.log("TEST")}>
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

      */}
      {showAddContactModal && (
        <AddContactModal
          close={() => setshowAddContactModal(false)}
          setContactList={setContactList}
          ContactList={ContactList}
          getContacts={getContacts}
        />
      )}
    </>
  );
}
