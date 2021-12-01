import React from 'react';
import { FiX } from "react-icons/fi";
import '../../assets/styles/PreviewLink.css';

export default function UploadLinkModal(props) {

  const handleModalClose = () => {
    props.handleModalClose();
  };

  return (
    <>
      <div className="justify-center items-center flex overflow-x-hidden overflow-y-auto fixed inset-0 z-50 outline-none focus:outline-none">
        <div className="relative w-full my-6 mx-auto max-w-lg">
          <div className="main-preview">
            <div className="preview-grid">
              <p className="preview-txt">File Preview</p>
              <FiX className="close-btn" onClick={handleModalClose} style={{ color: 'var(--mysteryGrey)' }} />
            </div>
            <div>
              <h1>Shows preview of the file</h1>
            </div>
          </div>
        </div>
      </div>
      <div className="opacity-25 fixed inset-0 z-40 bg-black"></div>
    </>
  );
}