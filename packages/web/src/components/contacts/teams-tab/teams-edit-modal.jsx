import React, { useState, useEffect, useRef } from "react";
import anime from "animejs";
import { FiEdit } from "react-icons/fi";
import { BsCloudSlash } from "react-icons/bs";

import { IoCaretDown } from "react-icons/io5";

import { MdSave } from "react-icons/md";

import { CgTrash } from "react-icons/cg";
import Select, { components } from "react-select";
import { FaObjectUngroup } from "react-icons/fa";
const options = [
  { value: "No Selected", label: "No Selected" },
  { value: "Thomas Anderson", label: "Thomas Anderson" },
  { value: "Erin Drinkwater", label: "Erin Drinkwater" },
  { value: "Freddy", label: "Newandyke" },
];

const options2 = [
  { value: "No Selected", label: "No Selected" },
  { value: "Lawyer", label: "Lawyer" },
  { value: "Owner", label: "Owner" },
];

function uuidv4() {
  return ([1e7] + -1e3 + -4e3 + -8e3 + -1e11).replace(/[018]/g, (c) =>
    (
      c ^
      (crypto.getRandomValues(new Uint8Array(1))[0] & (15 >> (c / 4)))
    ).toString(16)
  );
}

const LOCAL_STORAGE_KEY = "clientApp.teams";



export default function TeamsEditModal({
  close,
  setTeamList,
  TeamList,
  CurrentTeam,
  getCompanyUsers,
  CompanyUsers,
  UserTypes,
}) {
  const modalContainer = useRef(null);
  const modalContent = useRef(null);
  const [isEditing, setisEditing] = useState(false);
  const [isDisabled, setisDisabled] = useState(true);
  const [TeamName, setTeamName] = useState("");
  const [IsHovering, setIsHovering] = useState(false);
  const [InputData, setInputData] = useState([]);
  const [Image, setImage] = useState();

  const inputFile = useRef(null);

  const mUpdateTeam = `mutation updateTeam($id: ID, $name: String) {
  teamUpdate(name: $name, id: $id) {
    id
  }
} `;

  const mTagTeamMember = `
  mutation tagTeamMember($teamId: ID, $members: [MemberInput] = [{userId: ID, userType: UserType}, {userId: ID, userType: UserType}, {userId: ID, userType: UserType}]) {
  teamMemberTag(teamId: $teamId, members: $members)
}`;

  useEffect((e) => {
    anime({
      targets: modalContainer.current,
      opacity: [0, 1],
      duration: 100,
      easing: "easeInOutQuad",
      complete: () => {
        anime({
          targets: modalContent.current,
          scale: [0.9, 1],
          opacity: [0, 1],
          duration: 100,
          easing: "easeInOutQuad",
        });
      },
    });

    localStorage.setItem(
      LOCAL_STORAGE_KEY,
      JSON.stringify(CurrentTeam.members.items)
    );
    const stored = JSON.parse(localStorage.getItem(LOCAL_STORAGE_KEY));

    if (stored?.length > 0) {
      setInputData(stored);
    }

    setTeamName(CurrentTeam.name);
    setImage(CurrentTeam.image);
    console.log("Company Users", CompanyUsers);
    console.log("INSIDE User Types", UserTypes);
  }, []);

  const RowCard = ({ image, member }) => {
    return (
      <>
        <div className="flex flex-row text-sm text-gray-500 items-center gap-4 py-2">
          <img
            alt={`avatar`}
            src={image}
            width={34}
            height={34}
            className={"rounded-full "}
          ></img>
          <div>{member.name}</div>
          <div className="ml-auto uppercase rounded-2xl bg-gray-200 font-semibold p-1 text-xs text-black">
            {member.userType}
          </div>
        </div>
      </>
    );
  };

  const ChangesHaveMade = (obj, i) => {
    console.log("HIT");
    if (CurrentTeam.members.items[i]) {
      if (
        obj.name !== CurrentTeam.members.items[i].name ||
        obj.userType !== CurrentTeam.members.items[i].userType ||
        TeamName !== CurrentTeam.name ||
        Image !== CurrentTeam.image
      ) {
        return true;
      } else {
        return false;
      }
    } else {
      return true;
    }
  };

  const validate = (obj, i) => {
    //Detect if null && changes have been made
    if (obj.name && obj.userType && TeamName && ChangesHaveMade(obj, i)) {
      return true;
    } else {
      return false;
    }
  };

  useEffect(() => {
    const validations =
      InputData && InputData.map((input, i) => validate(input, i));
    setisDisabled(!validations.includes(true));
    console.log(validations);
  }, [InputData, TeamName, Image]);

  const handleSelectChange = (e, val, i, property) => {
    const list = [...InputData];
    list[i][property] = e.value;
    setInputData(list);
  };

  const handleDelete = (index) => {
    setInputData(InputData.filter((_, idx) => idx !== index));
  };

  const DropdownIndicator = (props) => {
    return (
      components.DropdownIndicator && (
        <components.DropdownIndicator {...props}>
          <IoCaretDown className="text-sm" />
        </components.DropdownIndicator>
      )
    );
  };

  const AddMore = (id) => {
    return (
      <button
        onMouseEnter={() => setIsHovering(true)}
        onMouseLeave={() => setIsHovering(false)}
        onClick={() => {
          setisDisabled(true);
          setIsHovering(false);
          setInputData([
            ...InputData,
            {
              id: uuidv4(),
              name: "",
              userType: "",
            },
          ]);
        }}
        className={
          "m-2 my-3 font-medium gap-1 mr-auto flex flex-row justify-center items-center text-md text-cyan-500 hover:text-cyan-300 cursor-pointer"
        }
      >
        Add More
        <svg
          width="16"
          height="16"
          viewBox="0 0 16 16"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M8 0C3.5625 0 0 3.59375 0 8C0 12.4375 3.5625 16 8 16C12.4062 16 16 12.4375 16 8C16 3.59375 12.4062 0 8 0ZM11 8.75H8.75V11C8.75 11.4375 8.40625 11.75 8 11.75C7.5625 11.75 7.25 11.4375 7.25 11V8.75H5C4.5625 8.75 4.25 8.4375 4.25 8C4.25 7.59375 4.5625 7.25 5 7.25H7.25V5C7.25 4.59375 7.5625 4.25 8 4.25C8.40625 4.25 8.75 4.59375 8.75 5V7.25H11C11.4062 7.25 11.75 7.59375 11.75 8C11.75 8.4375 11.4062 8.75 11 8.75Z"
            fill={IsHovering ? "rgb(152,241,255)" : "#1CC1E9"}
          />
        </svg>
      </button>
    );
  };

  const SaveButton = () => {
    return (
      <button
        onClick={() => {
          let foundIndex = TeamList.findIndex((x) => x.id === CurrentTeam.id);

          let team = {
            id: TeamList[foundIndex].id,
            image: Image,
            teamName: TeamName.replace("'s team", ""),
            members: InputData,
          };

          TeamList[foundIndex] = team;
          setTeamList(TeamList);
          close();
        }}
        className={
          isDisabled
            ? "border border-gray-200 ml-auto rounded-md bg-green-200 text-white flex flex-row justify-center items-center gap-2font-normal px-6 py-1.5 mt-2 hover:bg-green-200 gap-2 cursor-default"
            : "border border-gray-200 ml-auto rounded-md bg-green-400 text-white flex flex-row justify-center items-center gap-2font-normal px-6 py-1.5 mt-2 hover:bg-green-200 gap-2"
        }
        disabled={isDisabled}
      >
        Save Changes
        <MdSave color={`white`} />
      </button>
    );
  };

  const EditTeamButton = () => {
    return (
      <button
        onClick={() => setisEditing(true)}
        className="ml-auto rounded-md flex flex-row justify-center items-center gap-2 bg-cyan-500 text-white font-normal px-4 py-1.5 hover:bg-cyan-300"
      >
        Edit Team <FiEdit />
      </button>
    );
  };

  const CancelButton = () => {
    return (
      <button
        onClick={() => setisEditing(false)}
        className="border border-gray-200 ml-auto rounded-md bg-white flex flex-row justify-center items-center gap-2 text-black font-normal px-4 py-1.5 hover:bg-gray-200"
      >
        Cancel Editing <FiEdit />
      </button>
    );
  };
  const customStyles = {
    control: (styles, { isDisabled }) => {
      return {
        ...styles,
        cursor: isDisabled ? "not-allowed" : "default",
        backgroundColor: "white",
        color: "black",
      };
    },
  };

  useEffect(() => {
    console.log(InputData);
  }, [InputData]);

  return (
    <>
      <div
        ref={modalContainer}
        onClick={() => close()}
        className="opacity-0 flex justify-center items-center overflow-x-hidden overflow-y-auto fixed inset-0 z-50 outline-none focus:outline-none bg-black bg-opacity-60 "
      >
        <div
          ref={modalContent}
          className="p-10 flex flex-col bg-white rounded-lg opacity-0 scale-90 max-h-screen overflow-y-scroll"
          style={{ minWidth: "750px" }}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex flex-row">
            <div className="font-medium text-gray-600 text-md pb-2">
              Edit Team
            </div>
            <button
              onClick={() => {
                close();
              }}
              className="ml-auto h-8 w-8 cursor-pointer rounded-full bg-gray-100 flex flex-row justify-center items-center hover:bg-gray-300"
            >
              <svg
                width="12"
                height="11"
                viewBox="0 0 12 11"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M10.6875 9.3125C11.0938 9.6875 11.0938 10.3438 10.6875 10.7188C10.5 10.9062 10.25 11 10 11C9.71875 11 9.46875 10.9062 9.28125 10.7188L6 7.4375L2.6875 10.7188C2.5 10.9062 2.25 11 2 11C1.71875 11 1.46875 10.9062 1.28125 10.7188C0.875 10.3438 0.875 9.6875 1.28125 9.3125L4.5625 6L1.28125 2.71875C0.875 2.34375 0.875 1.6875 1.28125 1.3125C1.65625 0.90625 2.3125 0.90625 2.6875 1.3125L6 4.59375L9.28125 1.3125C9.65625 0.90625 10.3125 0.90625 10.6875 1.3125C11.0938 1.6875 11.0938 2.34375 10.6875 2.71875L7.40625 6.03125L10.6875 9.3125Z"
                  fill="#8A8A8A"
                />
              </svg>
            </button>
          </div>

          {/*Profile*/}
          <div className="flex flex-row items-start py-8 gap-4">
            <input
              type="file"
              id="file"
              ref={inputFile}
              style={{ display: "none" }}
              onChange={(event) => {
                if (event.target.files && event.target.files[0]) {
                  setImage(URL.createObjectURL(event.target.files[0]));
                }
              }}
            />
            <div
              onClick={() => {
                if (isEditing) {
                  inputFile.current.click();
                }
              }}
              className={`${
                isEditing && "opacity-70 cursor-pointer hover:opacity-40"
              }`}
            >
              {isEditing && (
                <FiEdit
                  className="absolute opacity-100"
                  style={{ left: "70px", top: "135px", zIndex: "100" }}
                />
              )}
              <img
                className={`rounded-full`}
                src={Image}
                width={70}
                height={70}
                alt={`prop`}
                style={{ objectFit: "cover" }}
              ></img>
            </div>

            <div className={`flex flex-col justify-start gap-1 items-start`}>
              <div className="text-base font-semibold flex flex-row gap-2">
                {`${CurrentTeam.name}'s Team`} {isEditing && <FiEdit />}
              </div>
              <div className="pl-2 uppercase rounded-full bg-gray-200 font-semibold p-0.5 text-xs">{`${CurrentTeam.members.items.length} members`}</div>
            </div>
            {isEditing ? <CancelButton /> : <EditTeamButton />}
          </div>

          <div
            className={
              isEditing ? "flex flex-col pt-4 px-0" : "flex flex-col pt-4 px-3"
            }
          >
            {!isEditing ? (
              InputData &&
              InputData.map((member, i) => (
                <RowCard
                  image={`https://i.pravatar.cc/70?img=${i}`}
                  member={member}
                  key={i}
                />
              ))
            ) : (
              <>
                <div className="flex flex-col p-1 w-full">
                  <div className="text-sm font-medium text-gray-400">
                    {`Rename your team`}
                  </div>
                  <input
                    name={`teamName`}
                    type="text"
                    value={TeamName}
                    className="rounded-md p-2 w-full border border-gray-300 outline-0"
                    onChange={(e) => {
                      setTeamName(e.target.value);
                    }}
                    required
                  />
                </div>
                {InputData &&
                  InputData.map((x, i) => (
                    <div className="flex flex-row" key={x.id}>
                      <div className="flex flex-col p-1">
                        <div className="text-sm font-medium text-gray-400">{`Member ${
                          i + 1
                        }`}</div>
                        <Select
                          components={{
                            IndicatorSeparator: () => null,
                            DropdownIndicator: DropdownIndicator,
                          }}
                          name={`name`}
                          options={CompanyUsers}
                          type="text"
                          value={{
                            value: x.name,
                            label: x.name,
                          }}
                          styles={customStyles}
                          isDisabled={!isEditing}
                          onChange={(e, val) =>
                            handleSelectChange(e, val, i, `name`)
                          }
                          className="rounded-md w-80 focus:border-gray-100 text-gray-400"
                        />
                      </div>
                      <div className="flex flex-col p-1">
                        <div className="text-sm font-medium text-gray-400">{`User Type`}</div>
                        <Select
                          styles={customStyles}
                          components={{
                            IndicatorSeparator: () => null,
                            DropdownIndicator: DropdownIndicator,
                          }}
                          name={`userType`}
                          options={UserTypes}
                          type="text"
                          isDisabled={!isEditing}
                          value={{
                            value: x.userType,
                            label: x.userType,
                          }}
                          onChange={(e, val) =>
                            handleSelectChange(e, val, i, `userType`)
                          }
                          className="rounded-md w-80 focus:border-gray-100 text-gray-400 bg-white"
                        />
                      </div>
                      <div className="flex flex-col p-1">
                        <div className="opacity-0">1</div>

                        {InputData.length > 1 && (
                          <CgTrash
                            className="border border-gray-200 text-4xl p-2 cursor-pointer hover:bg-gray-100"
                            color={`lightcoral`}
                            onClick={() => handleDelete(i)}
                          />
                        )}
                      </div>
                    </div>
                  ))}
              </>
            )}
            {isEditing && <AddMore />}
            {isEditing && <SaveButton />}
          </div>
        </div>
      </div>
      <div className="opacity-25 fixed inset-0 z-40 bg-black"></div>
    </>
  );
}
