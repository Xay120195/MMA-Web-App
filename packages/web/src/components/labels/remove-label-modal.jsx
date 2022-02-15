import React, { useState, useEffect, useRef } from 'react';
import { GrClose } from "react-icons/gr";
import { useForm } from "react-hook-form";
import ToastNotification from "../toast-notification";
import { Auth, API } from "aws-amplify";
import { FaTimes } from "react-icons/fa";
import { AiOutlineUser, AiOutlineTags } from "react-icons/ai";
import { TiCancel } from "react-icons/ti";
import { HiOutlinePlusCircle } from "react-icons/hi";


export default function RemoveLabelModal(props) {
  const handleModalClose = () => {
    props.handleModalClose();
  };

  const [showToast, setShowToast] = useState(false);
  const [resultMessage, setResultMessage] = useState("");
  const hideToast = () => {
    setShowToast(false);
  };


  return (
    <>
      <div className="justify-center items-center flex overflow-x-hidden overflow-y-auto fixed inset-0 z-50 outline-none focus:outline-none">
        <div className="relative w-full my-6 mx-auto max-w-lg">
          <div className="border-0 rounded-lg shadow-lg relative w-full bg-white outline-none focus:outline-none">
            <div className="items-center">
                <div className="flex items-center justify-center p-6 rounded-b">
                    <FaTimes className="text-3xl items-center"/>
                </div>
                <div className="flex items-center justify-center py-1 rounded-b">
                    <p className="text-lg font-semibold">Remove Labels</p>
                </div>
                <div className="flex items-center justify-center rounded-b">
                    <p className="text-md">The following labels will be removed from your</p>
                </div>
                <div className="flex items-center justify-center rounded-b">
                    <p className="text-md">messages and then deleted. No messages will be deleted.</p>
                </div>
            
                <div className="flex items-center justify-end p-6 rounded-b">
                    <button className="mr-2 bg-blue-400 hover:bg-blue-400 text-white text-sm py-2 px-4 rounded inline-flex items-center border-0 shadow outline-none focus:outline-none focus:ring" 
                      onClick={handleModalClose}>
                         Cancel &nbsp; <TiCancel/>
                    </button>
                    
                    <button className="bg-white hover:bg-gray-100 text-black font-semibold py-2 px-4 rounded inline-flex items-center border-0 shadow outline-none focus:outline-none focus:ring" 
                      type="button">
                         Remove &nbsp; <FaTimes/>
                    </button>
                </div>
                {showToast && resultMessage && (
                    <ToastNotification title={resultMessage} hideToast={hideToast} />
                )}
            </div>
          </div>
        </div>
      </div>
      <div className="opacity-25 fixed inset-0 z-40 bg-black"></div>
    </>
  );
}
