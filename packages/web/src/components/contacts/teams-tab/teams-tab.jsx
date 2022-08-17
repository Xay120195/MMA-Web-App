import React, { useState, useEffect, useRef } from "react";
import { alphabetArray } from "../../../constants/Alphabet";
import { CgTrash, CgSortAz, CgSortZa } from "react-icons/cg";
import { FaEdit } from "react-icons/fa";
import BlankStateTeams from "./blank-state";
import DeleteModal from "../delete-modal";
import dummy from "./teams.json";
import illustrations from "./images/illustrations.png";
import burst from "../teams-tab/images/celebratory_burst.gif";
import TeamsEditModal from "./teams-edit-modal";
import { API } from "aws-amplify";
export default function TeamsTab({
  teams,
  shortcutSelected,
  refLetters,
  ContactList,
  setContactList,
  ShowBurst,
  getTeams,
  setalertMessage,
  setShowToast,
  UserTypes,
  CompanyUsers,
}) {
  const [IsSortedReverse, setIsSortedReverse] = useState(false);
  const [TeamList, setTeamList] = useState(teams);
  const [Alphabets, setAlphabets] = useState([]);
  const [ShowDeleteModal, setShowDeleteModal] = useState(false);
  const [ShowEditModal, setShowEditModal] = useState(false);
  const [CurrentTeam, setCurrentTeam] = useState();
  const [ToDeleteID, setToDeleteID] = useState();

  function onlyUnique(value, index, self) {
    return self.indexOf(value) === index;
  }
  useEffect(() => {
    console.log("INSIDE TAB", teams);
    setTeamList(teams);
  }, [teams]);

  useEffect(() => {
    console.log("UserTypes", UserTypes);
  }, [UserTypes]);

  useEffect(() => {
    setAlphabets(
      TeamList.map((team) => team.name[0])
        .filter(onlyUnique)
        .sort((a, b) => a.localeCompare(b))
    );
  }, [TeamList]);


  const handleSort = (sortedReverse, sortBy) => {
    if (sortedReverse) {
      if (sortBy === "name") {
        setTeamList(teams.sort((a, b) => a.name.localeCompare(b.name)));
        Alphabets.sort();
        alphabetArray.sort();
      }
    } else {
      if (sortBy === "name") {
        setTeamList(
          teams.sort((a, b) => a.name.localeCompare(b.name)).reverse()
        );
        Alphabets.sort().reverse();
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

  return (
    <>
      {ShowBurst && (
        <div className="absolute z-10">
          <img src={burst} width="1720" height="980" />
        </div>
      )}
      {TeamList.length === 0 ? (
        <BlankStateTeams />
      ) : (
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
                <th className="p-2 text-right">Members</th>
                <th className="p-2 w-20 " />
              </tr>
            </thead>
            {/* content */}
            <tbody className="relative">
              {Alphabets.map((letter, idx) => (
                <>
                  <tr
                    ref={(el) => (refLetters.current[idx] = el)}
                    id={letter}
                    key={letter}
                    className=""
                  >
                    <td className="pt-4 px-2">
                      <div className="flex items-center gap-x-2">
                        <p
                          className={`${
                            shortcutSelected === letter
                              ? "text-cyan-500 font-bold"
                              : "text-gray-700 font-semibold"
                          }  text-lg `}
                        >
                          {letter}
                        </p>
                      </div>
                    </td>
                  </tr>

                  {TeamList &&
                    TeamList.map(
                      (team, index) =>
                        team.name.charAt(0) === letter && (
                          <tr key={team.id} className={"stripe opacity-100"}>
                            <td className="p-2">
                              <div className="flex items-center gap-x-2 ">
                                <span>{team.name}'s Team</span>
                                <span className="text-xs rounded-full bg-gray-200 font-medium p-1">
                                  {team.members.items.length} members
                                </span>
                              </div>
                            </td>
                            <td className="p-2 text-right">
                              <div className="relative text-right left-0">
                                <span>
                                  {/* We have no members in backend teams yet replace with dummy

                                  {new Array(5).fill(0).map((x, i) => (
                                    <img
                                      alt={``}
                                      className="absolute rounded-full w-8 h-8 border-2 border-white"
                                      style={{
                                        zIndex: i,
                                        right: `${i * 25}px`,
                                        top: "-15px",
                                      }}
                                      src={`https://i.pravatar.cc/70?img=${i}`}
                                    />
                                  ))}
                                  */}

                                  {team.members.items.length === 0 ||
                                  team.members.items === [] ? (
                                    <div>No member found</div>
                                  ) : (
                                    team.members.items.map((x, i) => (
                                      <img
                                        alt={``}
                                        className="absolute rounded-full w-8 h-8 border-2 border-white"
                                        style={{
                                          zIndex: i,
                                          right: `${i * 25}px`,
                                          top: "-15px",
                                        }}
                                        src={`https://i.pravatar.cc/70?img=${i}`}
                                      />
                                    ))
                                  )}
                                </span>
                              </div>
                            </td>
                            <td className="p-2">
                              <div className="flex items-center gap-x-2">
                                <button className="p-3 w-max font-semibold text-gray-500 rounded-full hover:bg-gray-200">
                                  <FaEdit
                                    onClick={() => {
                                      console.log("SETTING TEAM", team);
                                      setShowEditModal(true);
                                      setCurrentTeam(team);
                                    }}
                                  />
                                </button>
                                <button className="p-3 text-red-400 w-max font-semibold rounded-full hover:bg-gray-200">
                                  <CgTrash
                                    onClick={() => {
                                      setShowDeleteModal(true);
                                      setToDeleteID(team.id);
                                    }}
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
      )}
      {ShowDeleteModal && (
        <DeleteModal
          close={() => setShowDeleteModal(false)}
          toDeleteid={ToDeleteID}
          setContactList={setTeamList}
          ContactList={TeamList}
          isTeam={true}
          getTeams={getTeams}
          setalertMessage={setalertMessage}
          setShowToast={setShowToast}
        />
      )}
      {ShowEditModal && (
        <TeamsEditModal
          close={() => setShowEditModal(false)}
          toDeleteid={`test`}
          setTeamList={setTeamList}
          TeamList={TeamList}
          CurrentTeam={CurrentTeam}
          CompanyUsers={CompanyUsers}
          UserTypes={UserTypes}
        />
      )}
    </>
  );
}
