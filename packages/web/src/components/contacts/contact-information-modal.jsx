import React, {
  useState,
  useContext,
  useEffect,
  useCallback,
  useMemo,
  useRef,
} from "react";
import About from "./contact-information-modal-tabs/about";
import { MdSave } from "react-icons/md";
import Select from "react-select";
import { FiEdit } from "react-icons/fi";

import anime from "animejs";
import TeamTab from "./contact-information-modal-tabs/team";
import ClientMatterTab from "./contact-information-modal-tabs/clientmatter";
const ExitButton = ({ close }) => {
  return (
    <button
      onClick={() => {
        close();
      }}
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
  );
};
const Tabs = ["About", "Teams", "Client/Matter involved"];

export default function ContactInformationModal({
  close,
  user,
  image,
  ContactList,
  setContactList,
}) {
  const modalContainer = useRef(null);
  const modalContent = useRef(null);

  const [isEditing, setisEditing] = useState(false);

  const [SelectedTab, setSelectedTab] = useState("About");

  useEffect((e) => {
    anime({
      targets: modalContainer.current,
      opacity: [0, 1],
      duration: 100,
      easing: "easeInOutQuad",
      complete: () => {
        anime({
          targets: modalContent.current,
          scale: [0.9, 1],
          opacity: [0, 1],
          duration: 100,
          easing: "easeInOutQuad",
        });
      },
    });
  }, []);
  useEffect(() => {
    console.log(SelectedTab);
  }, [SelectedTab]);
  const MiniNav = () => {
    return Tabs.map((tab, idx) => (
      <button
        key={idx}
        onClick={() => setSelectedTab(tab)}
        className={
          SelectedTab === tab
            ? "font-medium text-gray-900 border-b-2 border-cyan-500 cursor-pointer"
            : "font-medium text-gray-400 border-b-2 border-gray-200 hover:text-black hover:border-cyan-500  cursor-pointer"
        }
      >
        {tab}
      </button>
    ));
  };

  const EditContactButton = () => {
    return (
      <button
        onClick={() => setisEditing(true)}
        className="ml-auto rounded-md flex flex-row justify-center items-center gap-2 bg-cyan-500 text-white font-normal px-4 py-1.5 hover:bg-cyan-300"
      >
        Edit Contact <FiEdit />
      </button>
    );
  };

  const CancelButton = () => {
    return (
      <button
        onClick={() => setisEditing(false)}
        className="border border-gray-200 ml-auto rounded-md bg-white flex flex-row justify-center items-center gap-2 text-black font-normal px-4 py-1.5 hover:bg-gray-200"
      >
        Cancel Editing <FiEdit />
      </button>
    );
  };

  const SaveButton = () => {
    return (
      <button
        onClick={() => console.log("SAVED!")}
        className="border border-gray-200 ml-auto rounded-md bg-green-400 text-white flex flex-row justify-center items-center gap-2font-normal px-6 py-1.5 mt-2 hover:bg-green-200 gap-2"
      >
        Save <MdSave color={`white`} />
      </button>
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
          className="p-10 flex flex-col bg-white rounded-lg opacity-0 scale-90 max-h-screen"
          onClick={(e) => e.stopPropagation()}
        >
          {/*Header*/}
          <div className={`flex flex-row justify-center items-center semi`}>
            <div className="font-medium text-base">Contact Information</div>
            <ExitButton close={close} />
          </div>
          <div className="">
            Contacts with access to the portal will automatically receive
            invitation via email.
          </div>

          {/*Profile*/}
          <div className="flex flex-row items-start py-8 gap-4">
            <img
              className="rounded-full"
              src={`https://i.pravatar.cc/70?img=${1}`}
              alt={`prop`}
            ></img>

            <div className={`flex flex-col justify-start gap-1 items-start`}>
              <div className="text-base font-semibold">{user.name}</div>
              <div className="font-medium">{user.email}</div>
              <div className="pl-2 uppercase rounded-full bg-gray-200 font-semibold p-0.5 text-xs">
                {user.type}
              </div>
            </div>
            {isEditing ? <CancelButton /> : <EditContactButton />}
          </div>

          {/*MiniNav */}
          <div className="flex flex-row gap-5 py-3">
            <MiniNav />
          </div>

          {/*Input FIelds About */}
          {SelectedTab === "About" ? (
            <About
              close={close}
              user={user}
              isEditing={isEditing}
              ContactList={ContactList}
              setContactList={setContactList}
            />
          ) : SelectedTab === "Teams" ? (
            <TeamTab user={user} isEditing={isEditing} />
          ) : (
            <ClientMatterTab isEditing={isEditing} />
          )}
        </div>
      </div>
      <div className="opacity-25 fixed inset-0 z-40 bg-black"></div>
    </>
  );
}
