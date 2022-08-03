import React, { useState, useEffect } from "react";

import loading from "./loading-ani.gif";
import { MdSave } from "react-icons/md";
import Select, { components } from "react-select";

import { IoIosSearch } from "react-icons/io";
import { CgTrash } from "react-icons/cg";
import SingleSelect from "./customSelect";
import { IoCaretDown } from "react-icons/io5";
import User from "../user";
import { useFieldArray } from "react-hook-form";
export const options = [
  { value: "No Selected", label: "No Selected" },
  { value: "Test Random", label: "Test Random" },
  { value: "Testing lang e", label: "Testing lang e" },
  { value: "zxcasd", label: "zxcasd" },
  { value: "asdaszxc", label: "asdaszxc" },
  { value: "ryery", label: "ryery" },
];

const LOCAL_STORAGE_KEY = "clientApp.matter";

export default function ClientMatterTab({
  close,
  user,
  isEditing,
  ContactList,
  setContactList,
  clientmatter,
}) {
  const [isLoading, setisLoading] = useState(true);

  const [isDisabled, setisDisabled] = useState(true);

  const [InputData, setInputData] = useState(clientmatter);
  const [IsHovering, setIsHovering] = useState(false);

  const validate = (obj, client, index) => {
    if (index > clientmatter.length - 1) {
      if (obj.header && obj.subheader && obj.type) return true;
      else {
        return false;
      }
    } else {
      if (
        (obj.header &&
          obj.subheader &&
          obj.type &&
          obj.header !== client.header) ||
        obj.subheader !== client.subheader ||
        obj.type !== client.type
      ) {
        return true;
      } else {
        return false;
      }
    }
  };

  const SaveButton = () => {
    return (
      <button
        onClick={() => {
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
    setTimeout(() => {
      setisLoading(false);
    }, 1500);
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(clientmatter));
    const stored = JSON.parse(localStorage.getItem(LOCAL_STORAGE_KEY));
    if (stored?.length > 0) {
      setInputData(stored);
    }
  }, []);
  

  const handleSelectChange = (e, val, i, property) => {
    const list = [...InputData];
    list[i][property] = e.value;
    setInputData(list);
  };

  useEffect(() => {
    const validations = InputData.map((input, idx) => {
      return validate(input, clientmatter[idx], idx);
    });

    console.log("Validations", validations);
    setisDisabled(!validations.includes(true));
  }, [InputData]);

  const handleDelete = (index) => {
    setInputData(InputData.filter((_, idx) => idx !== index));
  };

  const Loading = () => {
    return (
      <div className="flex justify-center items-center h-60">
        <img src={loading} width="80" height="80"></img>
      </div>
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
              header: "",
              subheader: "",
              type: "",
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

  const DropdownIndicator = (props) => {
    return (
      components.DropdownIndicator && (
        <components.DropdownIndicator {...props}>
          <IoCaretDown className="text-sm" />
        </components.DropdownIndicator>
      )
    );
  };

  return (
    <>
      {isLoading ? (
        <Loading />
      ) : (
        <>
          {isEditing ? (
            <div>
              {InputData.map((x, i) => (
                <div className="flex flex-row py-1" key={i}>
                  <div className="flex flex-col p-1">
                    <div className="text-2xs font-medium text-gray-400">{`Client Name`}</div>

                    <Select
                      components={{
                        IndicatorSeparator: () => null,
                        DropdownIndicator: DropdownIndicator,
                      }}
                      placeholder={`Search`}
                      name={`header`}
                      options={options}
                      type="text"
                      value={{
                        value: x.header,
                        label: x.header,
                      }}
                      isDisabled={!isEditing}
                      onChange={(e, val) =>
                        handleSelectChange(e, val, i, `header`)
                      }
                      className="rounded-md w-56 focus:border-gray-100 text-gray-400"
                    />
                  </div>
                  <div className="flex flex-col p-1">
                    <div className="text-sm font-medium text-gray-400">{`Matter Name`}</div>
                    <SingleSelect
                      handleSelectChange={handleSelectChange}
                      isEditing={isEditing}
                      name={`subheader`}
                      options={options}
                      value={{
                        value: x.subheader,
                        label: x.subheader,
                      }}
                      i={i}
                    />
                  </div>
                  <div className="flex flex-col p-1">
                    <div className="text-sm font-medium text-gray-400">{`User Type`}</div>
                    <Select
                      components={{
                        IndicatorSeparator: () => null,
                        DropdownIndicator: DropdownIndicator,
                      }}
                      name={`type`}
                      options={options}
                      type="text"
                      value={{
                        value: x.type,
                        label: x.type,
                      }}
                      isDisabled={!isEditing}
                      onChange={(e, val) =>
                        handleSelectChange(e, val, i, `type`)
                      }
                      className="rounded-md w-56 focus:border-gray-100 text-gray-400"
                    />
                  </div>

                  <div className="flex flex-col p-1">
                    <div className="opacity-0">1</div>

                    {isEditing && InputData.length > 1  && (
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
            </div>
          ) : (
            <>
              {InputData.map((matter, idx) => (
                <div className="py-3 flex flex-col" key={idx}>
                  <div className="flex flex-row gap-32">
                    <div className="font-medium mr-auto">{matter.header}</div>
                    <div className="rounded-full bg-gray-200 font-semibold text-black p-1 text-xs">
                      {matter.type}
                    </div>
                  </div>
                  <div className="text-gray-400 text-md font-medium">
                    {matter.subheader}
                  </div>
                </div>
              ))}
            </>
          )}
        </>
      )}
    </>
  );
}
