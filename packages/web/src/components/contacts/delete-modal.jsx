import React from "react";


const TrashIcon = () => {
    return (
      <div className="rounded-full ">
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
}

export default function DeleteModal({ close }) {
  function StopPropagate(e) {
    e.stopPropagation();
  }

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
          test
        </div>
      </div>
      <div className="opacity-25 fixed inset-0 z-40 bg-black"></div>
    </>
  );
}
