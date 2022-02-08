import React, { useEffect, useState } from "react";
import ToastNotification from "../toast-notification";
import { Auth, API } from "aws-amplify";
import { useForm } from "react-hook-form";
// import { AiFillInfoCircle } from 'react-icons/ai';
// import { MdSave } from 'react-icons/md';
import "../../assets/styles/AccountSettings.css";
import { MdArrowForwardIos } from "react-icons/md";
import { FiFilter, FiSend } from "react-icons/fi";
import { AiOutlineDown } from "react-icons/ai";
import { FaUserCircle } from "react-icons/fa";
import { BiDotsVerticalRounded } from "react-icons/bi";

import {
  HiOutlineShare,
  HiOutlinePlusCircle,
  HiOutlineFilter,
  HiMinus,
  HiMinusCircle,
  HiTrash,
} from "react-icons/hi";

export default function Contacts() {
  const [showToast, setShowToast] = useState(false);
  const [resultMessage, setResultMessage] = useState("");
  const hideToast = () => {
    setShowToast(false);
  };

  const {
    register,
    formState: { errors },
    reset,
    handleSubmit,
    getValues,
    setError,
    clearErrors,
  } = useForm();

  // const contentDiv = {
  //   margin: "0 0 0 65px",
  // };

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

  const handleSave = async (formdata) => {
    const { email, firstName, lastName, userType } = formdata;

    const companyId = localStorage.getItem("companyId"),
      companyName = localStorage.getItem("company");

    const user = {
      firstName: firstName,
      lastName: lastName,
      email: email,
      company: {
        id: companyId,
        name: companyName,
      },
      userType: userType,
    };

    console.log(user);
    await inviteUser(user).then((u) => {
      console.log(u);
      setResultMessage(
        `${firstName} was successfuly added as ${userType} of ${companyName}.`
      );
      setShowToast(true);
      setTimeout(() => {
        setShowToast(false);
        reset({ email: "", firstName: "", lastName: "", userType: "OWNER" });
      }, 5000);
    });
  };

  async function inviteUser(user) {
    return new Promise((resolve, reject) => {
      try {
        const request = API.graphql({
          query: mInviteUser,
          variables: user,
        });

        resolve(request);
      } catch (e) {
        setError(e.errors[0].message);
        reject(e.errors[0].message);
      }
    });
  }

  const contentDiv = {
    margin: "0 0 0 65px",
  };

  const mainGrid = {
    display: "grid",
    gridtemplatecolumn: "1fr auto",
  };

  const data = [
    {
      "id": 0,
      "firstName": "Krizia",
      "lastName": "Frias",
      "userType": "Employee",
      "email": "km.frias@gmail.com",
      "company": {"cid": "143", "cname": "Lophils"}
    },
    {
      "id": 1,
      "firstName": "jane",
      "lastName": "Frias",
      "userType": "Employee",
      "email": "km.frias@gmail.com",
      "company": {"cid": "143", "cname": "Lophils"}
    },
    {
      "id": 2,
      "firstName": "kriz",
      "lastName": "Frias",
      "userType": "Employee",
      "email": "km.frias@gmail.com",
      "company": {"cid": "143", "cname": "Lophils"}
    },
    {
      "id": 3,
      "firstName": "krizi",
      "lastName": "Frias",
      "userType": "Employee",
      "email": "km.frias@gmail.com",
      "company": {"cid": "143", "cname": "Lophils"}
    }
  ]; //dummy data

  const [contacts, setContacts] = useState(data);
  const [addFormData, setAddFormData] = useState({
    firstName: "",
    lastName: "",
    userType: "",
    email: "",
    company: {cid: "", cname: ""},
  });

  return (
    <>
    <div className={
          "p-5 relative flex flex-col min-w-0 break-words mb-6 shadow-lg rounded bg-white"
        } style={contentDiv}>

        <div className="relative flex-grow flex-1">
          <div style={mainGrid}>
            <div>
              <h1 className="font-bold text-3xl">&nbsp; Contacts</h1>
            </div>
            <div className="absolute right-0">
              {/* <Link to={AppRoutes.DASHBOARD}> */}
              <button className="bg-white hover:bg-gray-100 text-black font-semibold py-2.5 px-4 rounded inline-flex items-center border-0 shadow outline-none focus:outline-none focus:ring">
                Back &nbsp;
                <MdArrowForwardIos />
              </button>
              {/* </Link> */}
            </div>
          </div>
        </div>

        <div className="p-5 left-0">
          <div>
            <span className={"text-sm mt-3 font-medium"}>CONTACTS</span>
          </div>
        </div>

        <div className="p-5 left-0">
              <div>
                <input
                  type="checkbox"
                  name="check_all"
                  id="check_all"
                  className="cursor-pointer mr-2"
                  // checked={checkAllState}
                  // onChange={(e) => handleCheckAllChange(e.target.checked)}
                />
                {/* {showAddRow && ( */}
                  <button
                    className="bg-green-400 hover:bg-green-500 text-white text-sm py-1 px-4 rounded inline-flex items-center border-0 shadow outline-none focus:outline-none focus:ring"
                    // onClick={() => handleAddRow()}
                  >
                    Add Contact &nbsp;
                    <HiOutlinePlusCircle />
                  </button>
                {/* )} */}
                {/* {showExport && ( */}
                  <button className="bg-gray-50 hover:bg-gray-100 text-black text-sm py-1 px-4 rounded inline-flex items-center border-0 shadow outline-none focus:outline-none focus:ring ml-2">
                    Manage Filters &nbsp;
                    <FiFilter/>
                  </button>
                {/* )} */}
                {/* {showDeleteRow && ( */}
                  <button
                    className="bg-red-400 hover:bg-red-500 text-white text-sm py-1 px-2 rounded inline-flex items-center border-0 shadow outline-none focus:outline-none focus:ring ml-2"
                    // onClick={() => handleDeleteRow(this)}
                  >
                    Delete &nbsp;
                    <HiTrash />
                  </button>
                {/* )} */}
              </div>
          </div>

        <div className="p-5 left-0">
          <div className= "grid grid-cols-4 gap-4" >

          {contacts.length === 0 ? (
            <p className="text-red-500">No result found.</p>
          ) : (
            contacts.map((contact) => (
              <div className="w-full h-42 bg-gray-100 rounded-lg border border-gray-200 mb-6 py-5 px-4">
                <div className=" py-1 text-right">
                    <div
                    className="bg-white hover:bg-gray-100 text-black font-semibold py-2 px-4 rounded inline-flex items-center border-0 shadow outline-none focus:outline-none focus:ring"
                    // onClick={() => handleAddRow()}
                    >
                      {contact.userType} &nbsp; <AiOutlineDown/>
                    </div> &nbsp;

                    <div
                    className="bg-blue-400 hover:bg-blue-500 text-white text-sm py-2 px-4 rounded inline-flex items-center border-0 shadow outline-none focus:outline-none focus:ring"
                    // onClick={() => handleAddRow()}
                    >
                      Send &nbsp; <FiSend/>
                    </div>
                </div>
                <div className="flex items-start py-3">
                  <div className="py-4 px-1"><input
                    type="checkbox"
                    name="check_all"
                    id="check_all"
                    className="cursor-pointer mr-2"
                  /></div>
                  <div className="py-3">
                    <FaUserCircle className="text-2xl"/>
                  </div>
                  <div className="details-txt px-3">
                    <span className="flex items-start"><text className="text-base font-semibold text-black">{contact.firstName} {contact.lastName}</text> &nbsp; <p className="font-semibold"> {contact.company.cname}</p></span>
                    <p>{contact.email}</p>
                  </div>

                  <div className="right-0 py-3">
                     <BiDotsVerticalRounded/>
                  </div>
                </div>

                <div className="py-5 text-center"> 
                  
                  <div><p className="font-semibold text-slate-700  ">TAGGED MATTERS</p></div>
                  
                </div>


              </div>
          
            ))

          )}
      
      
        </div>
      </div>
    </div>
    <form className="grid gap-4" onSubmit={handleSubmit(handleSave)}>
      <div className="p-5 w-1/3" style={contentDiv}>
        <div className="relative flex-auto ro">
          <p className="input-name">Email Address</p>
          <div className="relative my-2">
            <input
              type="email"
              className="input-field"
              placeholder="Email Address"
              {...register("email", {
                required: "Email is required",
              })}
            />
          </div>
          {errors.email?.type === "required" && (
            <div className="error-msg">
              <p>Email Address is required</p>
            </div>
          )}
        </div>

        <div className="relative flex-auto">
          <p className="input-name">First Name</p>
          <div className="relative my-2">
            <input
              type="text"
              className="input-field"
              placeholder="First Name"
              {...register("firstName", {
                required: "First Name is required",
              })}
            />
          </div>
          {errors.firstName?.type === "required" && (
            <div className="error-msg">
              <p>First Name is required</p>
            </div>
          )}
        </div>

        <div className="relative flex-auto">
          <p className="input-name">Last Name</p>
          <div className="relative my-2">
            <input
              type="text"
              className="input-field"
              placeholder="Last Name"
              {...register("lastName", {
                required: "Last Name is required",
              })}
            />
          </div>
          {errors.lastName?.type === "required" && (
            <div className="error-msg">
              <p>Last Name is required</p>
            </div>
          )}
        </div>

        <div className="relative flex-auto">
          <p className="input-name">User Type</p>
          <div className="relative my-2">
            <input
              type="text"
              className="input-field"
              placeholder="User Type"
              {...register("userType", {
                required: "User Type is required",
              })}
            />
          </div>
          {errors.userType?.type === "required" && (
            <div className="error-msg">
              <p>User Type is required</p>
            </div>
          )}
        </div>
        <div className="grid justify-start pt-5">
          <button className="save-btn" type="submit">
            <p>Save Changes</p>
          </button>
        </div>
      </div>

      {showToast && resultMessage && (
        <ToastNotification title={resultMessage} hideToast={hideToast} />
      )}
    </form>

    </>
  );
}
