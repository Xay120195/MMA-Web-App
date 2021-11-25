import React, { useState, useEfect } from 'react';
import { GrClose, GrLinkDown, GrTrash } from "react-icons/gr";
import '../../assets/styles/UploadLink.css';

export default function UploadLinkModal(props) {

  const [selectedFiles, setSelectedFiles] = useState([])

  const deleteBtn = (index) => {
    let tempArray = selectedFiles;
    tempArray = tempArray.filter((item, i) => i !== index);

    setSelectedFiles(tempArray);
  }

  const onSelectFile = e => {
    if (!e.target.files || e.target.files.length === 0) {
      setSelectedFiles([])
      return
    }
    const tempArr = [];

    [...e.target.files].forEach(file => {
      console.log("file >>> ", file);
      tempArr.push({
        data: file,
        url: URL.createObjectURL(file)
      });
    });

    setSelectedFiles(tempArr);
  }

  const handleModalClose = () => {
    props.handleModalClose();
  };

  const handleSave = () => {
    props.handleSave(selectedFiles);
  };

  console.log(selectedFiles, "selectedFiles");
  return (
    <>
      <div className="justify-center items-center flex overflow-x-hidden overflow-y-auto fixed inset-0 z-50 outline-none focus:outline-none">
        <div className="relative w-full my-6 mx-auto max-w-lg">
          <div className="main-upload">
            <div className="title-grid">
              <p className="title-txt">Upload link to Chronology</p>
              <GrClose className="close-btn" onClick={handleModalClose} style={{ color: 'var(--mysteryGrey)' }} />
            </div>
            <div className="file-grid">
              <div className="upload-grid">
                <div className="upload-area">
                  <GrLinkDown className="arrow-btn" style={{ color: 'var(--darkGrey)' }} />
                  <input type="file" multiple="multiple" id="file" onChange={onSelectFile} hidden />
                  <p className="title-txt drop-txt">Drop files here or <label for="file">browse</label></p>
                </div>
              </div>
              {selectedFiles.length ?
                <div className="upload-details">
                  <div className="line-separator">
                    <span>Items Uploaded</span>
                  </div>
                  <div className="items-grid">
                    {selectedFiles?.map((selectedFile, index) =>
                      <div id="uploadDivContent" key={index}>
                        <img className="img-content" src={selectedFile.url} />
                        <div className="details-content">
                          <span>{selectedFile.data.name}</span>
                          <span>{selectedFile.data.size}</span>
                        </div>
                        <GrTrash className="deleteBtn" onClick={() => deleteBtn(index)} />
                      </div>
                    )}
                  </div>
                </div> : null
              }
              <div className="btn-grid">
                <div className="cancel-btn" onClick={handleModalClose}>
                  <span>Cancel</span>
                </div>
                <div className="upload-btn" onClick={() => handleSave()}>
                  <span>Upload</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="opacity-25 fixed inset-0 z-40 bg-black"></div>
    </>
  );
}