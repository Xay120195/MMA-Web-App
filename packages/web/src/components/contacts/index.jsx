import '../../assets/styles/AccountSettings.css';
import './contacts.css';

import { CgChevronLeft, CgSortAz, CgSortZa, CgTrash } from 'react-icons/cg';
import { FaEdit, FaTrash, FaUsers } from 'react-icons/fa';
import { Link, useHistory } from 'react-router-dom';
import React, { useEffect, useState } from 'react';

import { API } from 'aws-amplify';
import AddContactModal from './add-contact-revamp-modal';
import DeleteModal from './delete-modal';
import ToastNotification from '../toast-notification';
import User from './user';
import { alphabetArray } from './alphabet';
import dummy from './dummy.json';

export default function Contacts() {
  const [showAddContactModal, setshowAddContactModal] = useState(false);
  const handleModalClose = () => {
    setshowAddContactModal(false);
  };

  const [shortcutSelected, setShortcutSelected] = useState('');

  const [contacts, setContacts] = useState(null);
  const [ActiveMenu, setActiveMenu] = useState('Contacts');
  const [showToast, setShowToast] = useState(false);
  const [resultMessage, setResultMessage] = useState('');
  const [ActiveLetter, setActiveLetter] = useState('a');
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
        companyId: localStorage.getItem('companyId'),
      },
    };

    await API.graphql(params).then((companyUsers) => {
      console.log(companyUsers);
      setContacts(companyUsers.data.company.users.items);
    });
  };

  const contentDiv = {
    margin: '0 0 0 65px',
  };

  const mainGrid = {
    display: 'grid',
    gridtemplatecolumn: '1fr auto',
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
          <tr className="stripe text-left" key={user.id}>
            <User user={user} />
          </tr>
        ))}
      </>
    );
  };

  let history = useHistory();

  const handleSort = (sortedReverse, sortBy) => {
    if (sortedReverse) {
      if (sortBy === 'name') {
        dummy.sort((a, b) => a.name.localeCompare(b.name));
        alphabetArray.sort();
      } else if (sortBy === 'type') {
        dummy.sort((a, b) => a.type.localeCompare(b.type));
        alphabetArray.sort();
      } else if (sortBy === 'company') {
        dummy.sort((a, b) => a.company.localeCompare(b.company));
        alphabetArray.sort();
      }
    } else {
      if (sortBy === 'name') {
        dummy.sort((a, b) => a.name.localeCompare(b.name)).reverse();
        alphabetArray.sort().reverse();
      } else if (sortBy === 'type') {
        dummy.sort((a, b) => a.type.localeCompare(b.type)).reverse();
        alphabetArray.sort().reverse();
      } else if (sortBy === 'company') {
        dummy.sort((a, b) => a.company.localeCompare(b.company)).reverse();
        alphabetArray.sort().reverse();
      } else {
        dummy.sort().reverse();
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

  const useOnIntersect = (ref) => {
    const [isIntersecting, setIsIntersecting] = useState(false);
    const observer = new IntersectionObserver(([entry]) => {
      setIsIntersecting(entry.isIntersecting);
    });
    useEffect(() => {
      observer.observe(ref.current);
      return () => observer.unobserve(ref.current);
    }, [ref]);

    return isIntersecting;
  };

  const scrollToView = (target) => {
    const el = document.getElementById(target);
    el && el.scrollIntoView({ behavior: 'smooth', block: 'center' });
  };

  const handleScroll = (event) => {
    console.log('scrollTop: ', event.currentTarget.scrollTop);
    console.log('offsetHeight: ', event.currentTarget.offsetHeight);
  };

  useEffect(() => {
    //Filter Name Alphabetically
    dummy.sort((a, b) => a.name.localeCompare(b.name));
    setContactList(dummy);

    // observe the scroll event and set the active letter
    window.addEventListener(
      'scroll',
      () => {
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
            onClick={() => history.replace('/dashboard')}
            className="w-8 py-5 cursor-pointer"
          >
            <CgChevronLeft />
          </div>
          <div>
            <p>
              <span className="text-lg font-bold">Contacts</span>{' '}
              <span className="text-lg font-light">
                {' '}
                of {`Matthew Douglas`}
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
                  true && 'border-gray-700 '
                }`}
              >
                Contacts{' '}
                <span className="text-sm rounded-full flex items-center justify-center font-semibold">
                  15
                </span>
              </p>
              <p
                className={`py-5 border-b-2 flex items-center gap-x-3 border-transparent cursor-pointer font-medium ${
                  false && 'border-gray-700 '
                }`}
              >
                Team{' '}
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
                const isLetter = dummy.some((user) =>
                  user.name.startsWith(letter)
                );
                if (isLetter) {
                  return (
                    <p
                      key={letter}
                      onClick={(e) => {
                        setShortcutSelected(letter);
                        scrollToView(letter);
                      }}
                      style={{
                        transform: `translateX(${
                          letter === shortcutSelected ? '10px' : '0px'
                        })`,
                      }}
                      className={`text-center text-gray-400 cursor-pointer transition-all font-bold  hover:scale-110 hover:text-blue-600 ${
                        shortcutSelected === letter && 'text-blue-600'
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
                {alphabetArray.map((letter) => (
                  <>
                    {dummy.some((user) => user.name.startsWith(letter)) && (
                      <>
                        <tr id={letter} key={letter} className="">
                          <td className="pt-4 px-2">
                            <div className="flex items-center gap-x-2">
                              <p
                                className={`${
                                  shortcutSelected == letter
                                    ? 'text-blue-600 font-bold'
                                    : 'text-gray-700 font-semibold'
                                }  text-lg `}
                              >
                                {letter}
                              </p>
                            </div>
                          </td>
                        </tr>
                        {dummy.map(
                          (contact, index) =>
                            contact.name.charAt(0) == letter && (
                              <tr key={contact.name} className=" ">
                                <td className="p-2">
                                  <div className="flex items-center gap-x-2 ">
                                    <span>
                                      <img
                                        className="rounded-full w-8 h-8"
                                        src={`https://i.pravatar.cc/70?img=${index}`}
                                      />
                                    </span>
                                    <p className="font-semibold">
                                      {contact.name}
                                    </p>
                                  </div>
                                </td>
                                <td className="p-2">{contact.email}</td>
                                <td className="p-2">{contact.team}</td>
                                <td className="p-2 w-64 ">
                                  <div className="flex items-center gap-x-2 ">
                                    <p className="font-semibold text-xs rounded-full bg-blue-100 px-2 py-1">
                                      {contact.type}
                                    </p>
                                  </div>
                                </td>
                                <td className="p-2">{contact.company}</td>

                                <td className="p-2">
                                  <div className="flex items-center gap-x-2">
                                    <button className="p-3 rounded w-max font-semibold text-gray-500">
                                      <FaEdit />
                                    </button>
                                    <button className="p-3 text-red-400 rounded w-max font-semibold ">
                                      <CgTrash />
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
          handleModalClose={handleModalClose}
        />
      )}
    </>
  );
}
