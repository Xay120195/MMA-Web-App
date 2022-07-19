import React from "react";

const InputList = () => {
  return (
    <>
      <div className="flex flex-col">
        <div className="text-sm font-medium text-gray-400">First Name</div>
        <input
          type="text"
          className="rounded-sm padding-0.5 border border-gray-300"
        />
      </div>
      <div>Last Name</div>
      <div>Email</div>
    </>
  );
};
export default function AddContactModal({ close }) {
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
          className="p-10 flex flex-col bg-white rounded-lg "
          onClick={StopPropagate}
        >
          <div className="font-semibold text-gray-900 text-lg">Add Contact</div>
          <div className="text-gray-900">
            Contacts with access to the portal will automatically receive
            invitation via email.
          </div>
          <InputList />
        </div>
      </div>
      <div className="opacity-25 fixed inset-0 z-40 bg-black"></div>
    </>
  );
}
