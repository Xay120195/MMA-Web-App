import React, { useState, useEffect } from "react";

import Select, { components } from "react-select";
import { IoCaretDown } from "react-icons/io5";
import { MdSave } from "react-icons/md";
import { API } from "aws-amplify";
import ToastNotification from "../../toast-notification";

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
  const [Firstname, setFirstname] = useState(user.firstName);
  const [Lastname, setLastname] = useState(user.lastName);
  const [Address, setAddress] = useState(user.address ? user.address : "");
  const [Email, setEmail] = useState(user.email);
  const [UserType, setUserType] = useState({
    value: user.userType ? user.userType : "",
    label: user.userType,
  });
  const [Mobile, setMobile] = useState(user.contactNumber ? user.contactNumber : "");
  const [Company, setCompany] = useState("LOPHILS");
  const [isDisabled, setisDisabled] = useState(true);

  const [showToast, setShowToast] = useState(false);
  const [resultMessage, setResultMessage] = useState("");
  const hideToast = () => {
    setShowToast(false);
  };

  const options = [
    { value: "OWNER", label: "Owner" },
    { value: "LEGALADMIN", label: "Legal Admin" },
    { value: "BARRISTER", label: "Barrister" },
    { value: "EXPERT", label: "Expert" },
    { value: "CLIENT", label: "Client" },
    { value: "WITNESS", label: "Witness" },
  ];

  const ChangesHaveMade = (obj) => {
    if (
      obj.lastName !== Lastname ||
      obj.firstName !== Firstname ||
      obj.email !== Email ||
      Address ||
      Mobile
    ) {
      return false;
    } else return true;
  };

  useEffect(() => {
    console.log("USER", user);
  }, []);

  useEffect(() => {
    setisDisabled(ChangesHaveMade(user));
  }, [
    Firstname,
    Lastname,
    Company,
    Email,
    Lastname,
    UserType,
    Address,
    Mobile,
    user,
  ]);

  const mUpdateUser = `
  mutation updateUser($contactNumber: String, $email: AWSEmail!, $firstName: String, $id: ID!, $lastName: String, $profilePicture: String, $userType: UserType) {
    userUpdate(
      contactNumber: $contactNumber
      firstName: $firstName
      id: $id
      lastName: $lastName
      profilePicture: $profilePicture
      userType: $userType
      email: $email
    ) {
      id
    }
  }
  `;

  async function editUser(user) {
      const request = API.graphql({
        query: mUpdateUser,
        variables: user,
      });

      console.log("success", request);
  }

  const SaveButton = () => {
    return (
      <button
        onClick={() => {
          let foundIndex = ContactList.findIndex((x) => x.id == user.id);
          let item = {
            id: user.id,
            firstName: Firstname,
            lastName: Lastname,
            email: Email,
            // company: Company,
            // address: Address,
            contactNumber: Mobile,
            // team: ContactList[foundIndex].team,
            userType: UserType.value,
            createdAt: user.createdAt
          };


          editUser(item);

          
          ContactList[foundIndex] = item;
          setContactList(ContactList);
          close();

          setResultMessage(
            "Successfully edited the details"
          );
          setShowToast(true);

          setTimeout(() => {
            setShowToast(false);
          }, 2000);
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
      <div className="flex flex-col">
        <div className="flex flex-row">
          <div className="flex flex-col p-1">
            <div className="text-xs font-medium text-gray-400">
              {`First Name`}
            </div>
            <input
              // readOnly={isEditing ? "" : "0"}
              disabled={isEditing ? false : true}
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
              // readOnly={isEditing ? "" : "0"}
              disabled={isEditing ? false : true}
              name={`lastname`}
              type="text"
              value={Lastname}
              className="rounded-md p-2 border border-gray-300 outline-0 w-80"
              onChange={(e) => setLastname(e.target.value)}
            />
          </div>
        </div>
        {/* <div className="flex flex-col p-1">
          <div className="text-xs font-medium text-gray-400">{`Address`}</div>
          <input
            // readOnly={isEditing ? "" : "0"}
            disabled={isEditing ? false : true}
            name={`address`}
            type="text"
            value={Address}
            className="rounded-md p-2 border border-gray-300 outline-0 w-full"
            onChange={(e) => setAddress(e.target.value)}
          />
        </div> */}

        <div className="flex flex-row">
          <div className="flex flex-col p-1">
            <div className="text-xs font-medium text-gray-400">{`Email`}</div>
            <input
              // readOnly={isEditing ? "" : "0"}
              disabled={isEditing ? false : true}
              name={`email`}
              type="email"
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
              // readOnly={isEditing ? "" : "0"}
              disabled={isEditing ? false : true}
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
              // components={{
              //   IndicatorSeparator: () => null,
              //   DropdownIndicator: DropdownIndicator,
              // }}
              isDisabled={isEditing ? false : true}
              options={options}
              name={`usertype`}
              type="text"
              value={UserType}
              className="outline-0 w-80"
              onChange={(e, val) => {console.log("value", e);setUserType(e)}}
            />
          </div>
          <div className="flex flex-col p-1">
            <div className="text-xs font-medium text-gray-400">{`Company`}</div>
            <input
              // readOnly={isEditing ? "" : "0"}
              disabled={true}
              name={`company`}
              type="text"
              value={localStorage.getItem("company")}
              className="rounded-md p-2 border border-gray-300 outline-0 w-80"
              //onChange={(e) => setCompany(e.target.value)}
            />
          </div>
        </div>
      </div>
      {isEditing && <SaveButton />}
      {showToast && resultMessage && (
                <ToastNotification
                  title={resultMessage}
                  hideToast={hideToast}
                />
              )}
    </>
  );
}
