import React, { useState } from "react";
import { GoTrashcan } from "react-icons/go";
import { BsPencilSquare } from "react-icons/bs";
import DeleteModal from "./delete-modal";

export default function User({ user, setContactList, ContactList }) {
  const [showDeleteModal, setshowDeleteModal] = useState(false);

  return (
    <>
      <td>
        <div className="px-5 py-2 flex flex-row items-center gap-2">
          <div className="p-2 border border-gray-200 rounded-full bg-green-300 ">
            TG
          </div>
          {user.name}
        </div>
      </td>
      <td>{user.email}</td>
      <td>
        <span className="p-1 rounded-full font-medium uppercase text-xs bg-gray-200">
          {user.team}
        </span>
      </td>
      <td>
        <span className="p-1 rounded-full font-medium uppercase text-xs bg-gray-200">
          {" "}
          {user.type}
        </span>
      </td>
      <td>{user.company}</td>
      <td>
        <div className="flex flex-row items-center justify-center gap-4">
          {" "}
          <BsPencilSquare className="text-gray-500 hover:text-gray-700 cursor-pointer" />
          <GoTrashcan
            className="text-gray-500 hover:text-red-500 cursor-pointer"
            onClick={() => setshowDeleteModal(true)}
          />
        </div>
      </td>
      {showDeleteModal && (
        <DeleteModal
          close={() => setshowDeleteModal(false)}
          toDeleteid={user.id}
          setContactList={setContactList}
          ContactList={ContactList}
        />
      )}
    </>
  );
}
