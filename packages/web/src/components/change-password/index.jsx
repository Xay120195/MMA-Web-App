import React, { useEffect } from "react";
import { Auth, API } from "aws-amplify";
import { useForm } from "react-hook-form";

export default function ChangePassword() {
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

    await Auth.currentAuthenticatedUser()
      .then((user) => {
        console.log(user);
        return Auth.changePassword(user, oldPassword, newPassword);
      })
      .then((data) => {
        if (data === "SUCCESS") {
          alert("Your password has been changed.");
          reset({ oldPassword: "", newPassword: "" });
        }
      })
      .catch((err) => {
        alert(err);
      });
  };

  useEffect(() => {
    getCompany();
    getUser();
  });

  async function getCompany() {
    const res = await API.graphql({
      query: getCompanyById,
      variables: {
        id: "5d21d259-9288-46de-b66f-fee37241bab0",
      },
    });

    console.log(res);
  }

  async function getUser() {
    const res = await API.graphql({
      query: getUserById,
      variables: {
        id: "0c3f9e9e-98e0-492b-a2f3-8b635560c786",
      },
    });

    console.log(res);
  }

  const getUserById = `
      query user($id: String) {
        user(id: $id) {
          company {
            id
            name
          }
          email
          firstName
          lastName
          userType
        }
      }
    `;

  const getCompanyById = `
  query getCompanyById($id: String) {
    company(id: $id) {
      createdAt
      email
      id
      logo
      name
      phone
      updatedAt
    }
  }
`;

  return (
    <form onSubmit={handleSubmit(handleSave)}>
      <div className="container p-10 w-1/2 items-center">
        <div>
          <p className="text-lg font-bold">Change Password</p>
        </div>
        <div className="relative p-6 flex-auto">
          <p className="font-semi-bold text-sm">Old Password</p>
          <div className="relative my-2">
            <input
              type="password"
              className="bg-purple-white shadow rounded border-0 py-3 pl-8 w-full"
              placeholder="Old Password"
              {...register("oldPassword", { required: true })}
              onChange={(elm)=>{
                if(elm.target.value){
                  clearErrors("oldPassword")  
                }
              }}
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
              onChange={(elm) => {
                
                const values = getValues();

                if(values.oldPassword){
                  clearErrors("newPassword")  
                }
                
                if(values.oldPassword && elm.target.value){
                  if (values.oldPassword === elm.target.value) {
                    setError("comparePassword", {
                      type: "manual",
                      message: "The new password you entered is the same as your old password. Enter a different password.",
                    });
                  }  
                } else {
                  clearErrors("comparePassword") 
                }
                
                console.log(errors);
              }}
            />
          </div>
          {errors.newPassword?.type === "required" && (
            <small className="text-red-400">New Password is required</small>
          )}

          {errors.comparePassword && (
            <small className="text-red-400">
              {errors.comparePassword.message}
            </small>
          )}
        </div>

        <div className="flex items-center justify-end p-6 ">
          <button
            className="bg-green-500 text-white active:bg-emerald-600 font-bold uppercase text-sm px-6 py-3 rounded shadow hover:shadow-lg outline-none focus:outline-none mb-1 ease-linear transition-all duration-150"
            type="submit"
          >
            Change Password
          </button>
        </div>
      </div>
    </form>
  );
}
