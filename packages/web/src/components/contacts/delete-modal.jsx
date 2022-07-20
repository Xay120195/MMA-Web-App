import React, { useState } from "react";

export default function DeleteModal({
  close,
  toDeleteid,
  setContactList,
  ContactList,
}) {
  function StopPropagate(e) {
    e.stopPropagation();
  }

  const TrashIcon = () => {
    return (
      <div className="px-5 pb-7">
        <svg
          width="36"
          height="37"
          viewBox="0 0 36 37"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M0 18.5C0 8.58594 8.01562 0.5 18 0.5C27.9141 0.5 36 8.58594 36 18.5C36 28.4844 27.9141 36.5 18 36.5C8.01562 36.5 0 28.4844 0 18.5ZM11.25 9.5C10.6172 9.5 10.125 10.0625 10.125 10.625C10.125 11.2578 10.6172 11.75 11.25 11.75H24.75C25.3125 11.75 25.875 11.2578 25.875 10.625C25.875 10.0625 25.3125 9.5 24.75 9.5H21.7969L21.0234 8.72656C20.8125 8.51562 20.5312 8.375 20.25 8.375H15.75C15.3984 8.375 15.1172 8.51562 14.9062 8.72656L14.1328 9.5H11.25ZM11.25 14L12.1641 25.4609C12.2344 26.6562 13.2188 27.5 14.4141 27.5H21.5156C22.7109 27.5 23.6953 26.6562 23.7656 25.4609L24.75 14H11.25Z"
            fill="#454545"
          />
        </svg>
      </div>
    );
  };

  const Cancel = () => {
    const [isHover, setisHover] = useState(false);
    return (
      <button
        onClick={() => close()}
        onMouseEnter={() => setisHover(true)}
        onMouseLeave={() => setisHover(false)}
        className="px-16 py-1 flex flex-row font-medium text-md justify-center items-center bg-white rounded-md gap-2 border border-gray-300 hover:bg-gray-700 hover:text-white"
      >
        Cancel{" "}
        <svg
          width="16"
          height="16"
          viewBox="0 0 16 16"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M16 8C16 12.4375 12.4062 16 8 16C3.5625 16 0 12.4375 0 8C0 3.59375 3.5625 0 8 0C12.4062 0 16 3.59375 16 8ZM3.09375 4.53125C2.40625 5.53125 2 6.71875 2 8C2 11.3125 4.65625 14 8 14C9.28125 14 10.4688 13.5938 11.4688 12.9062L3.09375 4.53125ZM14 8C14 4.6875 11.3125 2 8 2C6.6875 2 5.5 2.4375 4.5 3.125L12.875 11.5C13.5625 10.5 14 9.3125 14 8Z"
            fill={isHover ? "white" : "#454545"}
          />
        </svg>
      </button>
    );
  };

  const handleDelete = () => {
    if (toDeleteid) {
      setContactList(ContactList.filter((o) => o.id !== toDeleteid));
    }
  };

  const Delete = () => {
    const [isHover, setisHover] = useState(false);

    return (
      <button
        onClick={() => handleDelete()}
        onMouseEnter={() => setisHover(true)}
        onMouseLeave={() => setisHover(false)}
        className="px-16 py-1 flex flex-row font-medium text-md justify-center
      items-center text-white bg-red-500 rounded-md gap-2 hover:bg-white
      hover:text-red-500 border border-red-500"
      >
        Delete
        <svg
          width="16"
          height="16"
          viewBox="0 0 16 16"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M0 8C0 3.59375 3.5625 0 8 0C12.4062 0 16 3.59375 16 8C16 12.4375 12.4062 16 8 16C3.5625 16 0 12.4375 0 8ZM5 4C4.71875 4 4.5 4.25 4.5 4.5C4.5 4.78125 4.71875 5 5 5H11C11.25 5 11.5 4.78125 11.5 4.5C11.5 4.25 11.25 4 11 4H9.6875L9.34375 3.65625C9.25 3.5625 9.125 3.5 9 3.5H7C6.84375 3.5 6.71875 3.5625 6.625 3.65625L6.28125 4H5ZM5 6L5.40625 11.0938C5.4375 11.625 5.875 12 6.40625 12H9.5625C10.0938 12 10.5312 11.625 10.5625 11.0938L11 6H5Z"
            fill={isHover ? "red" : "white"}
          />
        </svg>
      </button>
    );
  };

  return (
    <>
      <div
        onClick={() => close()}
        className="justify-center items-center flex overflow-x-hidden overflow-y-auto fixed inset-0 z-50 outline-none focus:outline-none"
      >
        <div
          className="px-8 pt-6 pb-8 flex flex-col bg-white rounded-2xl items-center justify-center"
          onClick={StopPropagate}
        >
          <TrashIcon />
          <div className="font-semibold text-lg pb-3">Delete</div>
          <div className="text-sm">
            Once confirmed, this action will never be undone.
          </div>
          <div className="text-sm pb-8">Do you want to continue?</div>
          <div className="flex flex-row gap-3">
            <Cancel />
            <Delete />
          </div>
        </div>
      </div>
      <div className="opacity-60 fixed inset-0 z-40 bg-black"></div>
    </>
  );
}
