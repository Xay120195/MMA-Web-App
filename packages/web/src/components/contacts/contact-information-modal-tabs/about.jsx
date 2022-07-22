import React, { useState } from "react";

import Select from "react-select";
import { MdSave } from "react-icons/md";

function uuidv4() {
  return ([1e7] + -1e3 + -4e3 + -8e3 + -1e11).replace(/[018]/g, (c) =>
    (
      c ^
      (crypto.getRandomValues(new Uint8Array(1))[0] & (15 >> (c / 4)))
    ).toString(16)
  );
}
export default function About({
  close,
  user,
  isEditing,
  toEditid,
  ContactList,
  setContactList,
}) {
  const [Firstname, setFirstname] = useState(user.name.split(" ")[0]);
  const [Lastname, setLastname] = useState(user.name.split(" ")[1]);
  const [Address, setAddress] = useState(user.address);
  const [Email, setEmail] = useState(user.email);
  const [UserType, setUserType] = useState({
    value: user.type,
    label: user.type,
  });
  const [Mobile, setMobile] = useState(user.mobile);
  const [Company, setCompany] = useState(user.company);
  const [isDisabled, setisDisabled] = useState(false);

  const validate = (obj) => {
    if (
      obj.firstname &&
      obj.clientname &&
      obj.company &&
      obj.email &&
      obj.firstname &&
      obj.lastname &&
      obj.mattername &&
      obj.team &&
      obj.usertype
    ) {
      return true;
    } else return false;
  };

  const SaveButton = () => {
    return (
      <button
        onClick={() => {
          let item = {
            id: user.id,
            name: Firstname + " " + Lastname,
            email: Email,
            company: Company,
            address: Address,
            mobile: Mobile,
            type: UserType.value,
          };

          let foundIndex = ContactList.findIndex((x) => x.id == item.id);
          ContactList[foundIndex] = item;
          setContactList(ContactList);
          close();
        }}
        className={
          isDisabled
            ? "border border-gray-200 ml-auto rounded-md bg-green-200 text-white flex flex-row justify-center items-center gap-2font-normal px-6 py-1.5 mt-2 hover:bg-green-200 gap-2"
            : "border border-gray-200 ml-auto rounded-md bg-green-400 text-white flex flex-row justify-center items-center gap-2font-normal px-6 py-1.5 mt-2 hover:bg-green-200 gap-2"
        }
        disabled={isDisabled}
      >
        Save <MdSave color={`white`} />
      </button>
    );
  };

  return (
    <>
      <div className="flex flex-col">
        <div className="flex flex-row">
          <div className="flex flex-col p-1">
            <div className="text-xs font-medium text-gray-400">
              {`First Name`}
            </div>
            <input
              readOnly={isEditing ? "" : "0"}
              name={`firstname`}
              type="text"
              value={Firstname}
              className="rounded-md p-2 border border-gray-300 outline-0 w-80"
              onChange={(e) => setFirstname(e.target.value)}
            />
          </div>
          <div className="flex flex-col p-1">
            <div className="text-xs font-medium text-gray-400">{`Last Name`}</div>
            <input
              readOnly={isEditing ? "" : "0"}
              name={`lastname`}
              type="text"
              value={Lastname}
              className="rounded-md p-2 border border-gray-300 outline-0 w-80"
              onChange={(e) => setLastname(e.target.value)}
            />
          </div>
        </div>
        <div className="flex flex-col p-1">
          <div className="text-xs font-medium text-gray-400">{`Address`}</div>
          <input
            readOnly={isEditing ? "" : "0"}
            name={`address`}
            type="text"
            value={Address}
            className="rounded-md p-2 border border-gray-300 outline-0 w-full"
            onChange={(e) => setAddress(e.target.value)}
          />
        </div>

        <div className="flex flex-row">
          <div className="flex flex-col p-1">
            <div className="text-xs font-medium text-gray-400">{`Email`}</div>
            <input
              readOnly={isEditing ? "" : "0"}
              name={`email`}
              type="text"
              value={Email}
              className="rounded-md p-2 border border-gray-300 outline-0 w-80"
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div className="flex flex-col p-1">
            <div className="text-xs font-medium text-gray-400">
              {`Mobile Number`}
            </div>
            <input
              readOnly={isEditing ? "" : "0"}
              name={`mobile`}
              type="text"
              value={Mobile}
              className="rounded-md p-2 border border-gray-300 outline-0 w-80"
              onChange={(e) => setMobile(e.target.value)}
            />
          </div>
        </div>

        <div className="flex flex-row">
          <div className="flex flex-col p-1">
            <div className="text-xs font-medium text-gray-400">{`User Type`}</div>
            <Select
              name={`usertype`}
              type="text"
              value={UserType}
              className="outline-0 w-80"
              onChange={(e) => setUserType(e.target.value)}
            />
          </div>
          <div className="flex flex-col p-1">
            <div className="text-xs font-medium text-gray-400">{`Company`}</div>
            <input
              readOnly={isEditing ? "" : "0"}
              name={`company`}
              type="text"
              value={Company}
              className="rounded-md p-2 border border-gray-300 outline-0 w-80"
              onChange={(e) => setCompany(e.target.value)}
            />
          </div>
        </div>
      </div>
      {isEditing && <SaveButton />}
    </>
  );
}
