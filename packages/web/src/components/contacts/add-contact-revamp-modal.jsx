import React, { useState, useEffect, useRef } from 'react';
import { CgAdd, CgClose, CgUserAdd } from 'react-icons/cg';
import anime from 'animejs';

import Select from 'react-select';

const options = [{ value: 'No Selected', label: 'No Selected' }];

export default function AddContactModal({ close }) {
  const modalContainer = useRef(null);
  const modalContent = useRef(null);

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
    console.log('INPUT', InputData);
  }, [InputData]);

  // modal animation on mount
  useEffect((e) => {
    anime({
      targets: modalContainer.current,
      opacity: [0, 1],
      duration: 200,
      easing: 'easeInOutQuad',
      complete: () => {
        anime({
          targets: modalContent.current,
          scale: [0.9, 1],
          opacity: [0, 1],
          duration: 200,
          easing: 'easeInOutQuad',
        });
      },
    });
  }, []);

  const Input = ({ label, i }) => {
    const flabel = label.replace(' ', '').toLowerCase();

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
          value={{ value: 'No Selected', label: 'No Selected' }}
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
        ref={modalContainer}
        onClick={() => close()}
        className="opacity-0 flex justify-center items-center overflow-x-hidden overflow-y-auto fixed inset-0 z-50 outline-none focus:outline-none bg-black bg-opacity-60"
      >
        <div
          ref={modalContent}
          className="p-10 flex flex-col bg-white rounded-lg opacity-0 scale-90"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex flex-row">
            <div className="font-semibold text-gray-900 text-lg pb-2">
              Add Contact
            </div>
            <button
              onClick={() => close()}
              className="ml-auto h-8 w-8 cursor-pointer rounded-full bg-gray-100 flex flex-row justify-center items-center hover:bg-gray-300"
            >
              <CgClose />
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
            className="p-3 py-2 font-medium w-max rounded transition flex gap-2 items-center text-md text-cyan-500 border-2 border-transparent hover:border-cyan-500 cursor-pointer"
          >
            Add More
            <CgAdd />
          </button>
          <button
            onClick={() => {
              console.log("Submitted", InputData);
              close();
            }}
            className="p-2 pl-5 pr-5 text-md rounded-md mr-auto ml-auto bg-green-500 text-white font-medium gap-1 flex flex-row justify-start items-start text-md hover:bg-green-400 cursor-pointer focus:ring"
          >
            Add Contact
            <CgUserAdd />
          </button>
        </div>
      </div>
    </>
  );
}
