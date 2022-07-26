import React, {
  useState,
  useContext,
  useEffect,
  useCallback,
  useMemo,
} from "react";
import { IoCaretDown } from "react-icons/io5";

import { MdSave } from "react-icons/md";

import { CgTrash } from "react-icons/cg";
import Select, { components } from "react-select";
const options = [
  { value: "No Selected", label: "No Selected" },
  { value: "Test Random", label: "Test Random" },
];


export default function TeamTab({ close, user, isEditing, ContactList, setContactList }) {
  const [isDisabled, setisDisabled] = useState(true);
  const [IsHovering, setIsHovering] = useState(false);
  const [InputData, setInputData] = useState([
    {
      team: user.team,
      usertype: user.type,
    },
  ]);

  const validate = (obj, index) => {
    if (index > 0) {
      if (obj.team && obj.usertype) {
        return true;
      } else return false;
    } else {
      if (
        obj.team &&
        obj.usertype &&
        (obj.team !== user.team || obj.usertype !== user.type)
      ) {
        return true;
      } else return false;
    }
  };

  const SaveButton = () => {
    return (
      <button
        onClick={() => {
          let foundIndex = ContactList.findIndex((x) => x.id == user.id);
          let item = {
            id: ContactList[foundIndex].id,
            name: ContactList[foundIndex].name,
            email: ContactList[foundIndex].email,
            company: ContactList[foundIndex].company,
            address: ContactList[foundIndex].address,
            mobile: ContactList[foundIndex].mobile,
            team: InputData[0].team
              ? InputData[0].team
              : ContactList[foundIndex].type,
            type: InputData[0].type
              ? InputData[0].type
              : ContactList[foundIndex].type,
          };

          ContactList[foundIndex] = item;
          setContactList(ContactList);
          close();
        }}
        className={
          isDisabled
            ? "border border-gray-200 ml-auto rounded-md bg-green-200 text-white flex flex-row justify-center items-center gap-2font-normal px-6 py-1.5 mt-2 hover:bg-green-200 gap-2 cursor-default"
            : "border border-gray-200 ml-auto rounded-md bg-green-400 text-white flex flex-row justify-center items-center gap-2font-normal px-6 py-1.5 mt-2 hover:bg-green-200 gap-2"
        }
        disabled={isDisabled}
      >
        Save <MdSave color={`white`} />
      </button>
    );
  };

  useEffect(() => {
    const validations = InputData.map((input, idx) => validate(input, idx));
    setisDisabled(!validations.includes(true));
  }, [InputData, user]);

  const handleSelectChange = (e, val, i, property) => {
    const list = [...InputData];
    list[i][property] = e.value;
    setInputData(list);
  };

  useEffect(() => {
    console.log(InputData);
  }, [InputData]);

  const handleDelete = (index) => {
    setInputData(InputData.filter((_, idx) => idx !== index));
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
          setInputData([
            ...InputData,
            {
              team: "",
              usertype: "",
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
  return (
    <>
      {InputData.map((x, i) => (
        <div className="flex flex-row" key={i}>
          <div className="flex flex-col p-1">
            <div className="text-sm font-medium text-gray-400">{`Team Name`}</div>
            <Select
              components={{
                IndicatorSeparator: () => null,
                DropdownIndicator: DropdownIndicator,
              }}
              name={`team`}
              options={options}
              type="text"
              value={{
                value: x.team,
                label: x.team,
              }}
              styles={customStyles}
              isDisabled={!isEditing}
              onChange={(e, val) => handleSelectChange(e, val, i, `team`)}
              className="rounded-md w-56 focus:border-gray-100 text-gray-400"
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
              name={`usertype`}
              options={options}
              type="text"
              isDisabled={!isEditing}
              value={{
                value: x.usertype,
                label: x.usertype,
              }}
              onChange={(e, val) => handleSelectChange(e, val, i, `usertype`)}
              className="rounded-md w-56 focus:border-gray-100 text-gray-400 bg-white"
            />
          </div>
          <div className="flex flex-col p-1">
            <div className="opacity-0">1</div>

            {isEditing && (
              <CgTrash
                className="border border-gray-200 text-4xl p-2 cursor-pointer hover:bg-gray-100"
                color={`lightcoral`}
                onClick={() => handleDelete(i)}
              />
            )}
          </div>
        </div>
      ))}
      {isEditing && <AddMore />}
      {isEditing && <SaveButton />}
    </>
  );
}
