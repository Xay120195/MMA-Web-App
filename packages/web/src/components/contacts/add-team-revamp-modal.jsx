import React, { useState, useEffect, useRef } from "react";
import { CgTrash } from "react-icons/cg";
import Select from "react-select";
import { API, input } from "aws-amplify";

import anime from "animejs";
import { format } from "prettier";

const options = [
  { value: "Thomas Edison", label: "Thomas Edison" },
  { value: "John Doe", label: "John Doe" },
];

function uuidv4() {
  return ([1e7] + -1e3 + -4e3 + -8e3 + -1e11).replace(/[018]/g, (c) =>
    (
      c ^
      (crypto.getRandomValues(new Uint8Array(1))[0] & (15 >> (c / 4)))
    ).toString(16)
  );
}

function toTitleCase(str) {
  return str.replace(/\w\S*/g, function (txt) {
    return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
  });
}

export default function AddTeamModal({
  close,
  setTeamList,
  TeamList,
  getContacts,
  setShowBurst,
  getTeams,
  UserTypes,
  CompanyUsers,
  tagTeamMember,
  setisLoading,
}) {
  const modalContainer = useRef(null);
  const modalContent = useRef(null);
  const [isDisabled, setisDisabled] = useState(false);
  const [IsHovering, setIsHovering] = useState(false);
  const [TeamName, setTeamName] = useState("");
  const [FinalData, setFinalData] = useState([]);

  const mCreateTeam = `
 mutation createTeam($companyId: ID, $name: String) {
  teamCreate(companyId: $companyId, name: $name){
    id
  }
}
  `;

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
  }, []);

  const handleDelete = (index) => {
    setInputData(InputData.filter((_, idx) => idx !== index));
  };

  const [InputData, setInputData] = useState([
    {
      id: uuidv4(),
      firstName: "",
      lastName: "",
      userType: "",
      userId: "",
    },
  ]);

  const validate = (obj) => {
    if (obj.firstName && obj.lastName && obj.userType && TeamName) {
      return true;
    } else return false;
  };

  useEffect(() => {
    const validations = InputData.map((input) => validate(input));
    let oFinal = InputData.map((input) => {
      let final = {
        userId: input.userId,
        userType: input.userType,
      };

      return final;
    });

    setFinalData(oFinal);
    setisDisabled(validations.includes(false));
  }, [InputData, TeamName]);

  useEffect(() => {
    console.log("FinalData", FinalData);
  }, [FinalData]);

  const handleOnChange = (e, i, property) => {
    const { value } = e.target;
    const list = [...InputData];
    list[i][property] = typeof value === "object" ? value.value : value;
    setInputData(list);
  };

  const buildName = (value) => {
    console.log(value.split(" "));
    let arr = value.split(" ");
    if (arr.length > 2) {
      return {
        firstName: arr[0] + " " + arr[1],
        lastName: arr[2],
      };
    } else {
      return {
        firstName: arr[0],
        lastName: arr[1],
      };
    }
  };

  const handleSelectChange = (e, val, i, property) => {
    const list = [...InputData];
    if (property === "name") {
      let name = buildName(e.value);
      list[i]["firstName"] = name.firstName;
      list[i]["lastName"] = name.lastName;
      list[i]["userId"] = e.id;
      console.log("ID", e.id);
    } else {
      list[i][property] = e.value;
    }
    setInputData(list);
  };

  const generateFinalObj = (state) => {
    return {
      id: uuidv4(),
      teamName: toTitleCase(TeamName),
      members: InputData,
      isNewlyAdded: state,
    };
  };

  const handleAddTeam = async () => {
    console.group("Handle add team");
    console.log("Company ID", localStorage.getItem("companyId"));
    setisLoading(true);
    const request = await API.graphql({
      query: mCreateTeam,
      variables: {
        //$companyId: ID, $name: String
        companyId: localStorage.getItem("companyId"),
        name: toTitleCase(TeamName),
      },
    });

    console.log("mCreateTeam", request);

    if (request) {
      await tagTeamMember(request.data.teamCreate.id, FinalData);
      await getTeams();
      setTimeout(() => {
        setisLoading(false);
        setShowBurst(true);
        setTimeout(() => {
          setShowBurst(false);
        }, 2000);
      }, 3000);
    } else {
      alert("Failed to add teams");
    }
    console.groupEnd();
  };

  const generateFinal = async () => {
    setTeamList(TeamList.concat(generateFinalObj(true)));
    setShowBurst(true);
    setTimeout(() => {
      setTeamList(TeamList.concat(generateFinalObj(false)));
      setShowBurst(false);
    }, 3000);
  };
  const mInviteUser = `
      mutation inviteUser ($email: AWSEmail, $firstName: String, $lastName: String, $userType: UserType, $company: CompanyInput) {
        userInvite(
          email: $email
          firstName: $firstName
          lastName: $lastName
          userType: $userType
          company: $company
        ) {
          id
          firstName
          lastName
          email
          userType
        }
      }
  `;

  const handleSubmit = () => {
    generateFinal();
  };

  return (
    <>
      <div
        ref={modalContainer}
        onClick={() => close()}
        className="opacity-0 flex justify-center items-center overflow-x-hidden overflow-y-auto fixed inset-0 z-50 outline-none focus:outline-none bg-black bg-opacity-60"
      >
        <div
          ref={modalContent}
          className="p-10 flex flex-col bg-white rounded-lg opacity-0 scale-90 max-h-screen overflow-y-scroll"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex flex-row">
            <div className="font-semibold text-gray-900 text-lg pb-2">
              Add Team
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
          <div className="text-gray-900 pb-2">
            Get everyone working in one place by adding them to a team.
          </div>
          <div>
            <div className="flex flex-col p-1 w-full">
              <div className="text-sm font-medium text-gray-400">
                {`Team Name`}
              </div>
              <input
                name={`teamName`}
                type="text"
                value={TeamName}
                placeholder={`What's your team called?`}
                className="rounded-md p-2 w-full border border-gray-300 outline-0"
                onChange={(e) => setTeamName(e.target.value)}
                required
              />
            </div>
          </div>
          {InputData.map((x, i) => (
            <div className="flex flex-col">
              <div className="flex flex-row">
                <div className="flex flex-col p-1">
                  <div className="text-sm font-medium text-gray-400">
                    {`Member`} {i + 1}
                  </div>
                  <Select
                    menuPortalTarget={document.body}
                    styles={{
                      container: (base) => ({
                        ...base,
                        zIndex: "99999",
                      }),
                      menuPortal: (base) => ({ ...base, zIndex: 9999 }),
                    }}
                    name={`name`}
                    options={CompanyUsers}
                    type="text"
                    value={{
                      value: x.firstName + " " + x.lastName,
                      label: x.firstName + " " + x.lastName,
                    }}
                    onChange={(e, val) => handleSelectChange(e, val, i, `name`)}
                    className="rounded-md  w-80 focus:border-gray-100 text-gray-400"
                  />
                </div>
                <div className="flex flex-col p-1">
                  <div className="text-sm font-medium text-gray-400">
                    {`User Type`}
                  </div>
                  <Select
                    menuPortalTarget={document.body}
                    styles={{
                      container: (base) => ({
                        ...base,
                        zIndex: "99999",
                      }),
                      menuPortal: (base) => ({ ...base, zIndex: 9999 }),
                    }}
                    name={`userType`}
                    options={UserTypes}
                    type="text"
                    value={{
                      value: x.userType,
                      label: x.userType,
                    }}
                    onChange={(e, val) =>
                      handleSelectChange(e, val, i, `userType`)
                    }
                    className="rounded-md w-80 focus:border-gray-100 text-gray-400"
                  />
                </div>

                <div className="flex flex-col p-1">
                  <div className="opacity-0">a</div>
                  {InputData.length > 1 && (
                    <CgTrash
                      className="border border-gray-200 text-4xl p-2 cursor-pointer hover:bg-gray-100"
                      color={`lightcoral`}
                      onClick={() => handleDelete(i)}
                    />
                  )}
                </div>
              </div>
            </div>
          ))}

          <button
            onMouseEnter={() => setIsHovering(true)}
            onMouseLeave={() => setIsHovering(false)}
            onClick={() => {
              setisDisabled(true);
              setInputData([
                ...InputData,
                {
                  id: uuidv4(),
                  firstName: "",
                  lastName: "",
                  userType: "",
                  userId: "",
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
          <button
            disabled={isDisabled}
            onClick={() => {
              //generateFinal();
              //handleSubmit();
              handleAddTeam();
              close();
            }}
            className={
              isDisabled
                ? "p-2 pl-5 pr-5 text-md rounded-md ml-auto bg-green-200 text-white font-medium gap-1 flex flex-row justify-center items-center text-md hover:bg-green-200 cursor-default focus:ring"
                : "p-2 pl-5 pr-5 text-md rounded-md ml-auto bg-green-500 text-white font-medium gap-1 flex flex-row justify-center items-center text-md hover:bg-green-400 cursor-pointer focus:ring"
            }
          >
            Create Team
            <svg
              width="13"
              height="14"
              viewBox="0 0 13 14"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M13 7C13 7.5625 12.5312 8.03125 12 8.03125H7.5V12.5312C7.5 13.0625 7.03125 13.5 6.5 13.5C5.9375 13.5 5.5 13.0625 5.5 12.5312V8.03125H1C0.4375 8.03125 0 7.5625 0 7C0 6.46875 0.4375 6.03125 1 6.03125H5.5V1.53125C5.5 0.96875 5.9375 0.5 6.5 0.5C7.03125 0.5 7.5 0.96875 7.5 1.53125V6.03125H12C12.5312 6 13 6.46875 13 7Z"
                fill="white"
              />
            </svg>
          </button>
        </div>
      </div>
      <div className="opacity-25 fixed inset-0 z-40 bg-black"></div>
    </>
  );
}
