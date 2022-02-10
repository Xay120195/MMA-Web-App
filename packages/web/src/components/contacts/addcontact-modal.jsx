import React, { useState, useEffect, useRef } from 'react';
import { GrClose } from "react-icons/gr";
// import handleAddFormChange from "./index";
// import options from "./index";
// import handleAddFormSubmit from "./index";


export default function AddContactModal(props) {
  const handleModalClose = () => {
    props.handleModalClose();
  };

  const handleSave = () => {
    props.handleSave();
  };

  const options = [
    {
      label: "Select role",
      value: "n/a",
    },
    {
      label: "Owner",
      value: "Owner",
    },
    {
      label: "Admin",
      value: "Admin",
    },
    {
      label: "Employee",
      value: "Employee",
    }
  ];

  return (
    <>
      <div className="justify-center items-center flex overflow-x-hidden overflow-y-auto fixed inset-0 z-50 outline-none focus:outline-none">
        <div className="relative w-full my-6 mx-auto max-w-2xl">
          <div className="border-0 rounded-lg shadow-lg relative flex flex-col w-full bg-white outline-none focus:outline-none">
            <div className="flex items-start justify-between p-5 border-b border-solid border-blueGray-200 rounded-t">
              <h3 className="text-3xl font-semibold">
                Add Contact
              </h3>
              <button
                className="p-1 ml-auto bg-transparent border-0 text-black opacity-4 float-right text-3xl leading-none font-semibold outline-none focus:outline-none"
                onClick={handleModalClose}
              >
                <GrClose />
              </button>
            </div>
            <div className="relative p-6 flex-auto">
                <form 
                // onSubmit={handleAddFormSubmit}
                
                >
                    <div id="row">
                    <div>
                        <label>User Type:</label>
                        <select required="required" class="text-box" name="userType" 
                        // onChange={handleAddFormChange}
                        >
                            {options.map((option) => (
                                <option value={option.value}>{option.label}</option>
                            ))}
                        </select>
                        </div>
                        <div><label>First Name:</label>
                        <input
                            class="text-box"
                            type="text"
                            name="firstName"
                            required="required"
                            // onChange={handleAddFormChange}
                        /><br></br>
                        </div>
                        <div><label>First Name:</label>
                        <input
                        class="text-box"
                            type="text"
                            name="lastName"
                            required="required"
                            // onChange={handleAddFormChange}
                        />
                        </div>
                        
                        <div><label>Email Address:</label>
                            <input
                            class="text-box"
                            type="email"
                            name="email"
                            required="required"
                            // onChange={handleAddFormChange}
                            />
                        </div>
                        <div><label>Company ID#:</label>
                        <input
                        class="text-box"
                            name="cid"
                            required="required"
                            // onChange={handleAddFormChange}
                        />
                        </div>
                        <div><label>Company:</label>
                        <input
                        class="text-box"
                            name="cname"
                            required="required"
                            // onChange={handleAddFormChange}
                        />
                        </div>
                    </div>
                </form>
              
            </div>
            <div className="flex items-center justify-end p-6 border-t border-solid border-blueGray-200 rounded-b">
              <button
                className="text-red-500 background-transparent font-bold uppercase px-6 py-2 text-sm outline-none focus:outline-none mr-1 mb-1 ease-linear transition-all duration-150"
                type="button"
                onClick={handleModalClose}
              >
                Cancel
              </button>
              <button
                className="bg-green-500 text-white active:bg-emerald-600 font-bold uppercase text-sm px-6 py-3 rounded shadow hover:shadow-lg outline-none focus:outline-none mr-1 mb-1 ease-linear transition-all duration-150"
                type="button"
                
              >
                Add
              </button>
            </div>
          </div>
        </div>
      </div>
      <div className="opacity-25 fixed inset-0 z-40 bg-black"></div>
    </>
  );
}
