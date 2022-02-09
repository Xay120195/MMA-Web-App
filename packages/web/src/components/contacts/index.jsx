import React, { useEffect, useState } from "react";
import ToastNotification from "../toast-notification";
import { Auth, API } from "aws-amplify";
import { useForm } from "react-hook-form";
// import { AiFillInfoCircle } from 'react-icons/ai';
// import { MdSave } from 'react-icons/md';
import "../../assets/styles/AccountSettings.css";

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

  const contentDiv = {
    margin: "0 0 0 65px",
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

  return (
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
  );
}
