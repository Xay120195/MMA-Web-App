import React, { useState, useEffect } from "react";
import { Auth } from "aws-amplify";
import { useForm } from "react-hook-form";

export default function ChangePassword() {
  const {
    register,
    formState: { errors },
    handleSubmit,
  } = useForm();

  const handleSave = async (formdata) => {
    const { oldPassword, newPassword } = formdata;

    console.log("oldPassword", oldPassword);
    console.log("newPassword", newPassword);

    await Auth.currentAuthenticatedUser()
      .then((user) => {
        console.log(user);
        return Auth.changePassword(user, oldPassword, newPassword);
      })
      .then((data) => {
        alert(data);
      })
      .catch((err) => {
        alert(err);
      });
  };

  return (
    <form onSubmit={handleSubmit(handleSave)}>
      <div className="container pl-20">
        <div className="relative p-6 flex-auto">
          <p className="font-semi-bold text-sm">Old Password</p>
          <div className="relative my-2">
            <input
              type="password"
              className="bg-purple-white shadow rounded border-0 py-3 pl-8 w-full"
              placeholder="Old Password"
              {...register("oldPassword", { required: true })}
            />
          </div>
          {errors.oldPassword?.type === "required" && (
            <small className="text-red-400">Old Password is required</small>
          )}
        </div>
        <div className="relative p-6 flex-auto">
          <p className="font-semi-bold text-sm">New Password</p>
          <div className="relative my-2">
            <input
              type="password"
              className="bg-purple-white shadow rounded border-0 py-3 pl-8 w-full"
              placeholder="New Password"
              {...register("newPassword", { required: true })}
            />
          </div>
          {errors.newPassword?.type === "required" && (
            <small className="text-red-400">New Password is required</small>
          )}
        </div>

        <div className="flex items-center justify-end p-6 border-t border-solid border-blueGray-200 rounded-b">
          <button
            className="bg-green-500 text-white active:bg-emerald-600 font-bold uppercase text-sm px-6 py-3 rounded shadow hover:shadow-lg outline-none focus:outline-none mr-1 mb-1 ease-linear transition-all duration-150"
            type="submit"
          >
            Change Password
          </button>
        </div>
      </div>
    </form>
  );
}
