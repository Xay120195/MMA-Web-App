import React, { useEffect, useRef } from 'react';
import { CgClose, CgTrash } from 'react-icons/cg';
import anime from 'animejs';

export default function DeleteMatterModal(props) {
  const modalOverlay = useRef(null);
  const modalContainer = useRef(null);

  const handleModalClose = () => {
    props.handleModalClose();
  };

  const handleSave = () => {
    props.handleSave();
  };

  useEffect((e) => {
    anime({
      targets: modalOverlay.current,
      opacity: [0, 1],
      duration: 200,
      easing: 'easeInOutQuad',
      complete: () => {
        anime({
          targets: modalContainer.current,
          scale: [0.9, 1],
          opacity: [0, 1],
          duration: 200,
          easing: 'easeInOutQuad',
        });
      },
    });
  }, []);

  return (
    <>
      {/* new delete modal as per standard design pattern */}
      <div
        ref={modalOverlay}
        onClick={(e) => e.currentTarget === e.target && handleModalClose()}
        className="opacity-0 fixed top-0 left-0 z-50 w-full h-full bg-black bg-opacity-60 flex justify-center items-center"
      >
        {/* container */}
        <div
          ref={modalContainer}
          className="opacity-0 w-full max-w-xl bg-white rounded-lg p-8 mx-5 md:mx-0 flex flex-col"
        >
          <div className="w-full flex justify-center mb-8">
            <div className="w-10 h-10 bg-gray-800 rounded-full flex justify-center items-center">
              <CgTrash size={25} className="text-white" />
            </div>
          </div>
          <div className="w-full flex flex-col items-center text-center">
            <p className="font-bold text-xl mb-2">Delete</p>
            <p className="font-normal">
              Once confirmed, this action will never be undone.
            </p>
            <p className="font-normal">Do you want to continue?</p>
          </div>

          {/* actions */}
          <div className="grid grid-cols-1 md:grid-cols-2 mt-8 gap-2 md:gap-4">
            <button
              onClick={handleModalClose}
              className="border-2 border-gray-400 p-2 rounded-lg cursor-pointer font-semibold flex justify-center gap-3 items-center"
            >
              Cancel{' '}
              <span>
                <CgClose />
              </span>
            </button>
            <button
              onClick={() => handleSave()}
              className="border-2 border-red-500 bg-red-500 text-white p-2 rounded-lg cursor-pointer font-semibold flex justify-center gap-3 items-center"
            >
              Confirm Delete{' '}
              <span>
                <CgTrash />
              </span>
            </button>
          </div>
        </div>
      </div>

      {/* old design */}
      {/* <div className="justify-center items-center flex overflow-x-hidden overflow-y-auto fixed inset-0 z-50 outline-none focus:outline-none px-5 md:px-0">
        <div className="relative w-full mx-auto max-w-xl">
          <div className="border-0 rounded-lg shadow-lg relative flex flex-col w-full bg-white outline-none focus:outline-none p-5">
            <div className="flex flex-col-reverse gap-3 md:flex-row md:items-center md:justify-between border-b border-solid border-gray-300 mb-7 pb-7">
              <h3 className="text-xl font-semibold w-full">
                Are you sure do you want to delete this matter?
              </h3>
              <button
                className="w-10 h-10 rounded-full bg-gray-300 self-end flex justify-center items-center cursor-pointer"
                onClick={handleModalClose}
              >
                <CgClose />
              </button>
            </div>

            <div className="flex items-center justify-end gap-3 ">
              <button
                className="bg-gray-200 text-black active:bg-emerald-600 font-bold uppercase text-sm px-5 py-3 rounded shadow hover:shadow-lg outline-none focus:outline-none ease-linear transition-all duration-150"
                type="button"
                onClick={handleModalClose}
              >
                No
              </button>
              <button
                className="bg-red-500 text-white active:bg-emerald-600 font-bold uppercase text-sm px-5 py-3 rounded shadow hover:shadow-lg outline-none focus:outline-none ease-linear transition-all duration-150"
                type="button"
                onClick={() => handleSave()}
              >
                Yes
              </button>
            </div>
          </div>
        </div>
      </div>
      <div className="opacity-25 fixed inset-0 z-40 bg-black"></div> */}
    </>
  );
}
