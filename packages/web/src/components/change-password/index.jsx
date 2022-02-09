import React, { useEffect, useState } from "react";
import ToastNotification from "../toast-notification";
import { Auth, API } from "aws-amplify";
import { useForm } from "react-hook-form";
import InfoMessage from "../info-message";

import { AiFillInfoCircle } from 'react-icons/ai';
import { MdSave } from 'react-icons/md';
import '../../assets/styles/AccountSettings.css';

export default function ChangePassword() {
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

  const handleSave = async (formdata) => {
    const { oldPassword, newPassword } = formdata;

    if (oldPassword.trim() === "") {
      setResultMessage("Old password is required.");
      setShowToast(true);
      return false;
    }

    if (newPassword.trim() === "") {
      setResultMessage("New password is required.");
      setShowToast(true);
      return false;
    }

    await Auth.currentAuthenticatedUser()
      .then((user) => {
        return Auth.changePassword(user, oldPassword, newPassword);
      })
      .then((data) => {
        console.log("result", data);
        if (data === "SUCCESS") {
          setResultMessage("Your password has been changed.");
          setShowToast(true);
          setTimeout(() => {
            setShowToast(false);
            reset({ oldPassword: "", newPassword: "" });
          }, 3000);
        }
      })
      .catch((err) => {
        console.log("error", err);
        var msg = err.toString();
        if (msg.indexOf("Incorrect username or password") > -1) {
          msg = "Incorrect old password";
        } else if (msg.indexOf("New Password is required") > -1) {
          msg = "Invalid new password";
        }
        setResultMessage(msg);
        setShowToast(true);
      });
  };

  // useEffect(() => {
  //   getCompany();
  //   getUser();
  // });

  // async function getCompany() {
  //   const res = await API.graphql({
  //     query: getCompanyById,
  //     variables: {
  //       id: "5d21d259-9288-46de-b66f-fee37241bab0",
  //     },
  //   });
  //   console.log(res);
  // }

  // async function getUser() {
  //   const res = await API.graphql({
  //     query: getUserById,
  //     variables: {
  //       id: "0c3f9e9e-98e0-492b-a2f3-8b635560c786",
  //     },
  //   });
  //   console.log(res);
  // }

  //   const getUserById = `
  //       query user($id: String) {
  //         user(id: $id) {
  //           company {
  //             id
  //             name
  //           }
  //           email
  //           firstName
  //           lastName
  //           userType
  //         }
  //       }
  //     `;

  //   const getCompanyById = `
  //   query getCompanyById($id: String) {
  //     company(id: $id) {
  //       createdAt
  //       email
  //       id
  //       logo
  //       name
  //       phone
  //       updatedAt
  //     }
  //   }
  // `;

  return (
    <form className="grid gap-4" onSubmit={handleSubmit(handleSave)}>
      <InfoMessage title={'Change Password'} desc={'Your new password must be different from previous used passwords.'} />
      <div className="input-grid">
        <div className="relative flex-auto">
          <p className="input-name">Old Password</p>
          <div className="relative my-2">
            <input type="password" className="input-field" placeholder="Old Password"
              {...register("oldPassword", { required: true })} onChange={(elm) => {
                if (elm.target.value) {
                  clearErrors("oldPassword")
                }
              }}
            />
          </div>
          {errors.oldPassword?.type === "required" && (
            <div className="error-msg">
              <AiFillInfoCircle />
              <p>Old Password is required</p>
            </div>
          )}
        </div>
        <div className="relative flex-auto">
          <p className="input-name">New Password</p>
          <div className="relative my-2">
            <input type="password" className="input-field" placeholder="New Password"
              {...register("newPassword", { required: true })} onChange={(elm) => {
                const values = getValues();
                if (values.oldPassword) {
                  clearErrors("newPassword")
                }
                if (values.oldPassword && elm.target.value) {
                  if (values.oldPassword === elm.target.value) {
                    setError("comparePassword", {
                      type: "manual",
                      message:
                        "The new password you entered is the same as your old password. Enter a different password.",
                    });
                  } else {
                    clearErrors("comparePassword")
                  }
                } else {
                  clearErrors("comparePassword")
                }
                console.log(errors);
              }}
            />
          </div>
          {errors.newPassword?.type === "required" && (
            <div className="error-msg">
              <AiFillInfoCircle />
              <p>New Password is required</p>
            </div>
          )}
          {errors.comparePassword && (
            <div className="error-msg">
              <AiFillInfoCircle />
              {errors.comparePassword.message}
            </div>
          )}
        </div>
      </div>
      <div className="grid justify-end">
        <button className="save-btn" type="submit">
          <p>Save Changes</p>
          <MdSave />
        </button>
      </div>
      {showToast && resultMessage && (
          <ToastNotification title={resultMessage} hideToast={hideToast} />
        )}
    </form>
  );
}
