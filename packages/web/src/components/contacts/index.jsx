import "../../assets/styles/AccountSettings.css";
import "./contacts.css";

import { CgChevronLeft, CgSortAz, CgSortZa, CgTrash } from "react-icons/cg";
import { FaEdit, FaTrash, FaUsers } from "react-icons/fa";
import { Link, useHistory } from "react-router-dom";
import React, { useEffect, useState, useRef } from "react";
import anime from "animejs";
import { API } from "aws-amplify";
import AddContactModal from "./add-contact-revamp-modal";
import DeleteModal from "./delete-modal";
import User from "./user";
import { alphabetArray } from "../../constants/Alphabet";
import ContactInformationModal from "./contact-information-modal";

import TeamsTab from "./teams-tab/teams-tab";

import AddTeamModal from "./add-team-revamp-modal";
import ToastNotification from "../toast-notification";

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
  const [alertMessage, setalertMessage] = useState();
  const [ActiveLetter, setActiveLetter] = useState("a");
  const [IsSortedReverse, setIsSortedReverse] = useState(false);
  //Delete Function variables
  const [isToDelete, setisToDelete] = useState("");
  const [userEmail, setUserEmail] = useState("");
  const [userCompanyId, setUserCompanyId] = useState("");

  const [ContactList, setContactList] = useState(null);

  const [ShowEditModal, setShowEditModal] = useState(false); //added Edit Modal
  const [CurrentUser, setCurrentUser] = useState({}); //Added current User

  const [defaultCompany, setDefaultCompany] = useState("");
  const [Alphabets, setAlphabets] = useState([]);
  const [ShowAddTeamModal, setShowAddTeamModal] = useState(false);
  const [TeamList, setTeamList] = useState([]);
  const [ShowBurst, setShowBurst] = useState(false);
  const [CompanyUsers, setCompanyUsers] = useState([]);
  const [UserTypes, setUserTypes] = useState([]);
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
          contactNumber
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
    }
  }
  `;

  const qGetTeams = `
  query getTeamsByCompany($id: String) {
  company(id: $id) {
    teams {
      items {
        id
        name
      }
    }
  }
}
  `;

  const qGetTeamsWithMembers = `
  query getTeamMembers($id: ID) {
  team(id: $id) {
    id
    name
    members {
      items {
        id
        userType
        user {
          id
          firstName
          lastName
        }
      }
    }
  }
}`;

  const qGetCompanyUsers = `
  query getCompanyUsers($id: String) {
  company(id: $id) {
    id
    users {
      items {
        id
        firstName
        lastName
        email
      }
    }
  }
}`;

  const qListUserTypes = `
  query getDefaultUserTypes {
  defaultUserType
}
`;

  const mTagTeamMember = `mutation tagTeamMember($teamId: ID, $members: [MemberInput]) {
  teamMemberTag(teamId: $teamId, members: $members) {
    id
  }
}`;

  let tagTeamMember = async (teamId, members) => {
    console.log("teamId", teamId);
    console.log("members", members);
    const params = {
      query: mTagTeamMember,
      variables: {
        teamId: teamId,
        members: members
      }
    };

    const request = await API.graphql(params);
    console.log("TagTeamMember", request);
  };

  let getCompanyUsers = async () => {
    const params = {
      query: qGetCompanyUsers,
      variables: {
        id: localStorage.getItem("companyId")
      }
    };

    await API.graphql(params).then((users) => {
      console.log("users", users);
      if (users.data.company == null) {
        setCompanyUsers([]);
      } else {
        users.data.company.users.items.map((user, idx) => {
          console.log("USER", user, " ", idx);
          let name = user.firstName + " " + user.lastName;
          let temp = {
            value: name,
            label: name,
            id: user.id
          };
          setCompanyUsers((prev) => [...prev, temp]);
        });
      }
    });
  };

  let getUserTypes = async () => {
    const params = {
      query: qListUserTypes
    };

    await API.graphql(params).then((userTypes) => {
      if (userTypes.data.defaultUserType) {
        console.log("userTypes", userTypes.data.defaultUserType);
        userTypes.data.defaultUserType.map((userType) => {
          let oUserType = {
            value: userType,
            label: userType
          };
          setUserTypes((prev) => [...prev, oUserType]);
        });
      }
    });
  };
  function onlyUnique(value, index, self) {
    return self.indexOf(value) === index;
  }
  //Added 3 seconds turning to light blue when adding an entry
  //Added fix for scrolling issue
  useEffect(
    (e) => {
      anime({
        targets: rows.current,
        opacity: [0.4, 1],
        duration: 1500,
        easing: "cubicBezier(.5, .05, .1, .3)"
      });

      refLetters.current = refLetters.current.slice(0, alphabetArray.length);
    },
    [ContactList]
  );

  let getContacts = async () => {
    const params = {
      query: qGetContacts,
      variables: {
        companyId: localStorage.getItem("companyId")
      }
    };

    await API.graphql(params).then((companyUsers) => {
      console.log("usersssss", companyUsers);
      var temp = companyUsers.data.company.users.items;
      temp.sort((a, b) => a.firstName.localeCompare(b.firstName));
      temp.map(
        (x) =>
          (x.firstName = x.firstName.charAt(0).toUpperCase() + x.firstName.slice(1).toLowerCase())
      );
      setDefaultCompany(companyUsers.data.company.name);
      setContactList(temp);
      //Sync the displayed letters only with the existing contacts
      setAlphabets(
        temp
          .map((user) => user.firstName[0]) //get the first letter
          .filter(onlyUnique)
          .sort((a, b) => a.localeCompare(b))
      );
    });
  };

  useEffect(() => {
    console.log("teamlist", TeamList);
  }, [TeamList]);

  let getTeams = async () => {
    console.log("Company ID", localStorage.getItem("companyId"));
    setTeamList([]); //clear first when called
    let params = {
      query: qGetTeams,
      variables: {
        id: localStorage.getItem("companyId")
      }
    };

    await API.graphql(params).then((teams) => {
      console.log("teams", teams);
      if (teams.data.company == null) {
        setTeamList([]);
        console.log("teamlist is null", teams);
      } else {
        console.log("Successfully set team", teams.data.company.teams.items);
        //setTeamList(teams.data.company.teams.items);

        //get the actual team
        teams.data.company.teams.items.map(async (team) => {
          params = {
            query: qGetTeamsWithMembers,
            variables: {
              id: team.id
            }
          };

          await API.graphql(params).then((team) => {
            console.log(team.data.team);
            if (team.data.team) {
              let temp = {
                id: team.data.team.id,
                name: team.data.team.name,
                members: team.data.team.members
              };
              setTeamList((prev) => [...prev, temp]);
            }
          });
        });
      }
    });
  };

  const handleEditModal = (user) => {
    //Added edit modal open
    setCurrentUser(user);
    setShowEditModal(true);
  };

  const handleDeleteModal = (id, email) => {
    setisToDelete(id);
    setUserEmail(email);
    setUserCompanyId(localStorage.getItem("companyId"));
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
        ContactList.sort((a, b) => a.firstName.localeCompare(b.firstName)).reverse();
        alphabetArray.sort().reverse();
      } else if (sortBy === "userType") {
        ContactList.sort((a, b) => a.userType.localeCompare(b.userType)).reverse();
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
    el && window.scroll({ left: 0, top: el.offsetTop + 100, behavior: "smooth" }); //added fixed scrolling
  };

  useEffect(() => {
    if (ContactList === null) {
      getContacts();
    }

    getTeams();
    getCompanyUsers();
    getUserTypes();

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

        refLetters.current.map((ref, i) => {
          if (ref === null) {
            refLetters.current.splice(refLetters.current.indexOf(ref), 1);
          }
        });

        refLetters.current.forEach((ref, i) => {
          if (ref !== null) {
            let top = ref.offsetTop + 100;
            let bottom =
              refLetters.current.length - 1 === i
                ? refLetters.current[0].offsetTop + 100
                : refLetters.current[i + 1].offsetTop + 100;

            if (currentScrollPos >= top && currentScrollPos <= bottom) {
              setShortcutSelected(String(ref.id));
            }
          } else {
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
          <div onClick={() => history.replace("/dashboard")} className="w-8 py-5 cursor-pointer">
            <CgChevronLeft />
          </div>
          <div>
            <p>
              <span className="text-lg font-bold">Contacts</span>{" "}
              <span className="text-lg font-light">
                {" "}
                of {localStorage.getItem("firstName")} {localStorage.getItem("lastName")}
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
                onClick={() => {
                  setActiveMenu("Contacts");
                }}
                className={`py-5 border-b-2 flex items-center gap-x-3 border-transparent cursor-pointer font-medium ${
                  ActiveMenu === "Contacts" && "border-gray-700 "
                }`}
              >
                Contacts{" "}
                <span className="text-sm rounded-full flex items-center justify-center font-semibold">
                  {ContactList && ContactList.length}
                </span>
              </p>
              <p
                onClick={() => {
                  setActiveMenu("Teams");
                }} //setActiveMenu to Teams
                className={`py-5 border-b-2 flex items-center gap-x-3 border-transparent cursor-pointer font-medium ${
                  ActiveMenu === "Teams" && "border-gray-700"
                }`}
              >
                Teams{" "}
                <span
                  className={`text-sm rounded-full flex items-center justify-center font-semibold `}
                >
                  {TeamList && TeamList.length}
                </span>
              </p>
            </div>
            {/* action buttons */}
            <div className="flex items-center gap-x-5">
              <button
                onClick={() => {
                  ActiveMenu === "Contacts"
                    ? setshowAddContactModal(true)
                    : setShowAddTeamModal(true);
                }}
                className="py-2 px-4 bg-green-400 rounded w-max font-semibold text-white"
              >
                {` ${ActiveMenu === "Contacts" ? "Add Contact" : "Add Team"} `}
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

                /*
                const isLetter =
                  ContactList &&
                  ContactList.some((user) => user.firstName.startsWith(letter));
                */

                return (
                  <p
                    key={letter}
                    onClick={(e) => {
                      //To prevent double setting shortcut selecting only set if user is in bottom of screen
                      if (window.innerHeight + window.scrollY >= document.body.offsetHeight) {
                        setShortcutSelected(letter);
                      }
                      scrollToView(letter);
                    }}
                    style={{
                      transform: `translateX(${letter === shortcutSelected ? "10px" : "0px"})`
                    }}
                    className={`text-center text-gray-400 cursor-pointer transition-all font-bold  hover:scale-110 hover:text-blue-600 ${
                      shortcutSelected === letter && "text-cyan-500"
                    }`}
                  >
                    {letter}
                  </p>
                );
              })}
            </div>
          </div>
          {/* table */}
          {ActiveMenu === "Contacts" ? (
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
                {/* content Changes here*/}
                <tbody className="relative">
                  {Alphabets.map((letter, idx) => (
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
                            contact.firstName.charAt(0) === letter && (
                              <tr
                                ref={contact.isNewlyAdded ? rows : null}
                                key={contact.id}
                                className={
                                  contact.isNewlyAdded
                                    ? "opacity-100 bg-cyan-100"
                                    : "stripe opacity-100"
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
                                    <button className="p-3 w-max font-semibold text-gray-500 rounded-full hover:bg-gray-200">
                                      <FaEdit onClick={() => handleEditModal(contact)} />
                                    </button>
                                    <button
                                      className={
                                        contact.id === localStorage.getItem("userId")
                                          ? "hidden"
                                          : "p-3 text-red-400 w-max font-semibold rounded-full hover:bg-gray-200"
                                      }
                                    >
                                      <CgTrash
                                        onClick={() =>
                                          handleDeleteModal(
                                            contact.id,
                                            contact.email,
                                            contact.company
                                          )
                                        }
                                      />
                                    </button>
                                  </div>
                                </td>
                              </tr>
                            )
                        )}
                    </>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <TeamsTab
              teams={TeamList}
              shortcutSelected={shortcutSelected}
              refLetters={refLetters}
              ContactList={ContactList}
              setContactList={setContactList}
              ShowBurst={ShowBurst}
              getTeams={getTeams}
              setalertMessage={setalertMessage}
              setShowToast={setShowToast}
              UserTypes={UserTypes}
              CompanyUsers={CompanyUsers}
            />
          )}
        </div>
        {ShowDeleteModal && (
          <DeleteModal
            close={() => setShowDeleteModal(false)}
            toDeleteid={isToDelete}
            userEmail={userEmail}
            userCompanyId={userCompanyId}
            setContactList={setContactList}
            ContactList={ContactList}
            getContacts={getContacts}
            setalertMessage={setalertMessage}
            setShowToast={setShowToast}
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

      {showAddContactModal && (
        <AddContactModal
          close={() => setshowAddContactModal(false)}
          setContactList={setContactList}
          ContactList={ContactList}
          getContacts={getContacts}
          setalertMessage={setalertMessage}
          setShowToast={setShowToast}
        />
      )}
      {ShowAddTeamModal && (
        <AddTeamModal
          close={() => setShowAddTeamModal(false)}
          setTeamList={setTeamList}
          TeamList={TeamList}
          getContacts={getContacts}
          setShowBurst={setShowBurst}
          getTeams={getTeams}
          UserTypes={UserTypes}
          CompanyUsers={CompanyUsers}
          tagTeamMember={tagTeamMember}
        />
      )}
      {showToast && <ToastNotification title={alertMessage} hideToast={hideToast} />}
    </>
  );
}
