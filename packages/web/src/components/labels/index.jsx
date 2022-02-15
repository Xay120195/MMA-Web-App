import React, { useEffect, useState } from "react";
import { Link, useHistory } from "react-router-dom";
import ToastNotification from "../toast-notification";
import { Auth, API } from "aws-amplify";
import { useForm } from "react-hook-form";
import "../../assets/styles/AccountSettings.css";
import { MdArrowForwardIos } from "react-icons/md";
import { AiOutlineMail, AiOutlineTags, AiOutlineRight, AiOutlineLeft } from "react-icons/ai";
import { FaUserCircle } from "react-icons/fa";
import { BiDotsVerticalRounded } from "react-icons/bi";
import {
  HiOutlineShare,
  HiOutlinePlusCircle,
  HiOutlineFilter,
  HiMinus,
  HiMinusCircle,
  HiTrash,
} from "react-icons/hi";

import AddLabelModal from "./add-label-modal";
import EditLabelModal from "./edit-label-modal";
import RemoveLabelModal from "./remove-label-modal";

export default function Labels() {
 
    const contentDiv = {
        margin: "0 0 0 65px",
    };
    
    const mainGrid = {
        display: "grid",
        gridtemplatecolumn: "1fr auto",
    };

    const dummyData = [
      {
        id: 0,
        labelName: "Test1",
      },
      {
        id: 1,
        labelName: "Test2",
      },
      {
        id: 2,
        labelName: "Test3",
      }
    ];

    const [showAddLabelModal, setshowAddLabelModal] = useState(false);
    const [showEditLabelModal, setshowEditLabelModal] = useState(false);
    const [showRemoveLabelModal, setshowRemoveLabelModal] = useState(false);

    const handleModalClose = () => {
      setshowAddLabelModal(false);
      setshowEditLabelModal(false);
      setshowRemoveLabelModal(false);
    };

    const handleAddLabel = () => {
      handleModalClose();
    };

    const handleEditLabel = () => {
      handleModalClose();
    };

    const handleRemoveLabel = () => {
      handleModalClose();
    };


  return (
    <>
      <div
        className={
          "p-5 relative flex flex-col min-w-0 break-words mb-6 shadow-lg rounded bg-white"
        }
        style={contentDiv}
      >
        <div className="relative flex-grow flex-1">
          <div style={mainGrid}>
            <div>
              <h1 className="font-bold text-3xl ml-1">&nbsp;  Inbox - Manage Labels</h1>
            </div>
            <div className="absolute right-0">
              {/* <Link to={AppRoutes.DASHBOARD}> */}
              <button className="bg-white hover:bg-gray-100 text-black font-semibold py-2.5 px-4 rounded inline-flex items-center border-0 shadow outline-none focus:outline-none focus:ring">
                Back to Inbox  &nbsp;
                <AiOutlineMail />
              </button>
              {/* </Link> */}
            </div>
          </div>
        </div>

        <div className="p-2 left-0">
          <div>
            <span className="text-sm mt-3 font-medium inline-flex ml-1"><AiOutlineTags/> &nbsp; MANAGE LABELS</span>
          </div>
        </div>

        <div className="p-1 left-0 py-4">
            <div className="grid grid-rows grid-flow-col">
                <div className="col-span-7 ml-1">
                    <button
                        // onClick={handleAddRow}
                        type="button"
                        className="bg-green-100 hover:bg-green-100 text-green-500 text-sm py-1 px-4 rounded inline-flex items-center border border-green-500 shadow focus:ring mx-2"
                        onClick={() => setshowAddLabelModal(true)}
                    >
                        ADD NEW LABEL &nbsp; <HiOutlinePlusCircle/>
                    </button>
                </div>

                <div className="col-span-2">
                    <input
                        // value={search}
                        // onChange={handleSearchChange}
                        type="search"
                        placeholder="Search ..."
                        className="px-3 py-3 mr-4 placeholder-blueGray-300 text-blueGray-600 relative bg-white rounded text-sm border-0 shadow outline-none focus:outline-none focus:ring pl-5 float-right w-full"
                    />
                </div>

                <div className=" col-span-1 pt-2 inline-flex -mr-20 text-left">
                    <div className="p-4"><AiOutlineLeft/></div>
                    <span className="inline-flex items-center font-medium">1 of 1</span>
                    <div className="p-4"> <AiOutlineRight/></div>
                </div>
            </div>
        </div>

        <div className="p-5 left-0">
          
              <table className="min-w-full divide-y divide-gray-200 border flex-1">
                  <thead className="bg-gray-50">
                        <tr>
                          <th
                            scope="col"
                            className="px-6 py-5 text-left text-xs font-medium text-gray-500 tracking-wider"
                          >
                            Labels
                          </th>
                          <th
                            scope="col"
                            className="px-6 py-5 text-left text-xs font-medium text-gray-500 tracking-wider"
                          >
                            Show in label list
                          </th>
                          <th
                            scope="col"
                            className="px-6 py-5 text-left text-xs font-medium text-gray-500 tracking-wider"
                          >
                            Show in message list
                          </th>
                          <th
                            scope="col"
                            className="px-6 py-5 text-left text-xs font-medium text-gray-500 tracking-wider"
                          >
                            Actions
                          </th>
                        </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                      {dummyData.map((data) => ( 
                          <tr key={data.id}>
                            <td className="px-6 py-4 whitespace-nowrap w-60">
                              <p className="font-semibold">{data.labelName}</p>
                              <p>Desc</p>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap w-10">
                              <button
                                  type="button"
                                  className="bg-green-100 hover:bg-green-100 text-green-500 text-sm py-1 px-4 rounded-3xl inline-flex items-center border-0 shadow focus:ring mx-2"
                              >
                                  SHOW
                              </button>
                              <button
                                  type="button"
                                  className="bg-green-100 hover:bg-green-100 text-green-500 text-sm py-1 px-4 rounded-3xl inline-flex items-center border-0 shadow focus:ring mx-2"
                              >
                                  HIDE
                              </button>
                              <button
                                  type="button"
                                  className="bg-green-100 hover:bg-green-100 text-green-500 text-sm py-1 px-4 rounded-3xl inline-flex items-center border-0 shadow focus:ring mx-2"
                              >
                                  SHOW IF UNREAD
                              </button>

                            </td>
                            <td className="px-6 py-4 whitespace-nowrap w-20">
                              <button
                                  type="button"
                                  className="bg-green-100 hover:bg-green-100 text-green-500 text-sm py-1 px-4 rounded-3xl inline-flex items-center border-0 shadow focus:ring mx-2"
                              >
                                  SHOW
                              </button>
                              <button
                                  type="button"
                                  className="bg-green-100 hover:bg-green-100 text-green-500 text-sm py-1 px-4 rounded-3xl inline-flex items-center border-0 shadow focus:ring mx-2"
                              >
                                  HIDE
                              </button>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap w-20">
                              <button
                                  type="button"
                                  className="bg-green-100 hover:bg-green-100 text-green-500 text-sm py-1 px-4 rounded-3xl inline-flex items-center border-0 shadow focus:ring mx-2"
                                  onClick={() => setshowEditLabelModal(true)}
                              >
                                  EDIT
                              </button>
                              <button
                                  type="button"
                                  className="bg-red-100 hover:bg-red-100 text-red-500 text-sm py-1 px-4 rounded-3xl inline-flex items-center border-0 shadow focus:ring mx-2"
                                  onClick={() => setshowRemoveLabelModal(true)}
                              >
                                  REMOVE
                              </button>
                            </td>
                          </tr>
                      ))}
                  </tbody>
              </table>
          
        </div>
      </div>
      {showAddLabelModal && (
        <AddLabelModal
          handleSave={handleAddLabel}
          handleModalClose={handleModalClose}
        />
      )}

      {showEditLabelModal && (
        <EditLabelModal
          handleSave={handleEditLabel}
          handleModalClose={handleModalClose}
        />
      )}

      {showRemoveLabelModal && (
        <RemoveLabelModal
          handleSave={handleRemoveLabel}
          handleModalClose={handleModalClose}
        />
      )}

    </>
  );
}
