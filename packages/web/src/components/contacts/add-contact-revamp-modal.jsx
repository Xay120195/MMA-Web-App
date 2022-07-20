import React, { useState, useEffect } from "react";

import Select from "react-select";

const options = [{ value: "No Selected", label: "No Selected" }];

export default function AddContactModal({ close }) {
  function StopPropagate(e) {
    e.stopPropagation();
  }

  const [InputData, setInputData] = useState([]);
  const [InputListLength, setInputListLength] = useState(1);
  const [DummyArray, setDummyArray] = useState([]);
  useEffect(() => {
    setDummyArray(new Array(InputListLength).fill(0));
  }, [InputListLength]);

  const handleOnChange = (i, property, value) => {
    const data = InputData[i] || {};
    data[property] = value;

    const old = InputData;
    old[i] = data;
    console.log(old);
    setInputData(old);
  };

  useEffect(() => {
    console.log("INPUT", InputData);
  }, [InputData]);

  const Input = ({ label, i }) => {
    const flabel = label.replace(" ", "").toLowerCase();

    return (
      <div className="flex flex-col p-1">
        <div className="text-sm font-medium text-gray-400">{label}</div>
        <input
          name={flabel}
          key={i}
          type="text"
          value={InputData[i] && InputData[i][flabel]}
          className="rounded-md p-2 w-56 border border-gray-300 outline-0"
          onChange={(e) => handleOnChange(i, flabel, e.target.value)}
        />
      </div>
    );
  };

  const InputSelect = ({ label, i }) => {
    return (
      <div className="flex flex-col p-1">
        <div className="text-sm font-medium text-gray-400">{label}</div>
        <Select
          value={{ value: "No Selected", label: "No Selected" }}
          options={options}
          type="text"
          className="rounded-md w-56 focus:border-gray-100 text-gray-400"
        />
      </div>
    );
  };

  const SetOfInput = ({ i }) => {
    return (
      <>
        <div className="py-4 flex flex-col">
          <div className="flex flex-row">
            <Input label={`First Name`} i={i} />
            <Input label={`Last Name`} i={i} />
            <Input label={`Email`} i={i} />
            <InputSelect label={`Team`} i={i} />
          </div>
          <div className="flex flex-row">
            <InputSelect label={`User Type`} i={i} />
            <Input label={`Company`} i={i} />
            <InputSelect label={`Client Name`} i={i} />
            <InputSelect label={`Matter Name`} i={i} />
          </div>
        </div>
      </>
    );
  };

  return (
    <>
      <div
        onClick={() => close()}
        className="justify-center items-center flex overflow-x-hidden overflow-y-auto fixed inset-0 z-50 outline-none focus:outline-none"
      >
        <div
          className="p-10 flex flex-col bg-white rounded-lg"
          onClick={StopPropagate}
        >
          <div className="flex flex-row">
            <div className="font-semibold text-gray-900 text-lg pb-2">
              Add Contact
            </div>
            <button
              onClick={() => close()}
              className="ml-auto h-8 w-8 cursor-pointer rounded-full bg-gray-100 flex flex-row justify-center items-center hover:bg-gray-300"
            >
              <svg
                width="12"
                height="11"
                viewBox="0 0 12 11"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M10.6875 9.3125C11.0938 9.6875 11.0938 10.3438 10.6875 10.7188C10.5 10.9062 10.25 11 10 11C9.71875 11 9.46875 10.9062 9.28125 10.7188L6 7.4375L2.6875 10.7188C2.5 10.9062 2.25 11 2 11C1.71875 11 1.46875 10.9062 1.28125 10.7188C0.875 10.3438 0.875 9.6875 1.28125 9.3125L4.5625 6L1.28125 2.71875C0.875 2.34375 0.875 1.6875 1.28125 1.3125C1.65625 0.90625 2.3125 0.90625 2.6875 1.3125L6 4.59375L9.28125 1.3125C9.65625 0.90625 10.3125 0.90625 10.6875 1.3125C11.0938 1.6875 11.0938 2.34375 10.6875 2.71875L7.40625 6.03125L10.6875 9.3125Z"
                  fill="#8A8A8A"
                />
              </svg>
            </button>
          </div>

          <div className="text-gray-900 pb-2">
            Contacts with access to the portal will automatically receive
            invitation via email.
          </div>
          {DummyArray.map((i, idx) => (
            <SetOfInput i={idx} key={i} />
          ))}
          <button
            onClick={() => setInputListLength(InputListLength + 1)}
            className="m-2 my-3 font-medium gap-1 mr-auto flex flex-row justify-start items-start text-md text-cyan-500 hover:text-cyan-300 cursor-pointer"
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
                fill="#1CC1E9"
              />
            </svg>
          </button>
          <button
            onClick={() => {
              console.log("Submitted", InputData);
              close();
            }}
            className="p-2 pl-5 pr-5 text-md rounded-md mr-auto ml-auto bg-green-500 text-white font-medium gap-1 flex flex-row justify-start items-start text-md hover:bg-green-400 cursor-pointer focus:ring"
          >
            Add Contact
            <svg
              width="13"
              height="14"
              viewBox="0 0 13 14"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M13 7C13 7.5625 12.5312 8.03125 12 8.03125H7.5V12.5312C7.5 13.0625 7.03125 13.5 6.5 13.5C5.9375 13.5 5.5 13.0625 5.5 12.5312V8.03125H1C0.4375 8.03125 0 7.5625 0 7C0 6.46875 0.4375 6.03125 1 6.03125H5.5V1.53125C5.5 0.96875 5.9375 0.5 6.5 0.5C7.03125 0.5 7.5 0.96875 7.5 1.53125V6.03125H12C12.5312 6 13 6.46875 13 7Z"
                fill="white"
              />
            </svg>
          </button>
        </div>
      </div>
      <div className="opacity-25 fixed inset-0 z-40 bg-black"></div>
    </>
  );
}
