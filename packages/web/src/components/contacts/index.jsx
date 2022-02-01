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

  const handleSave = async (formdata) => {
    const { email } = formdata;
    const password = '';

    setResultMessage(`Success!`);
    console.log(email);
    console.log(password);
    setShowToast(true);
    setTimeout(() => {
      setShowToast(false);
      reset({ email: "" });
    }, 3000);
  };

  return (
    <form className="grid gap-4" onSubmit={handleSubmit(handleSave)}>
      <div className="input-grid p-5" style={contentDiv}>
        <div className="relative flex-auto">
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
      </div>
      <div className="grid justify-end">
        <button className="save-btn" type="submit">
          <p>Save Changes</p>
        </button>
      </div>
      {showToast && resultMessage && (
        <ToastNotification title={resultMessage} hideToast={hideToast} />
      )}
    </form>
  );
}
