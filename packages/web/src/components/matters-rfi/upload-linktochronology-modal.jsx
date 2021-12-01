import React, { useState, useEfect } from 'react';
import { FiX, FiDownloadCloud, FiTrash, FiMinus } from "react-icons/fi";
import '../../assets/styles/UploadLink.css';
import Pie from "../matters-rfi/Pie";

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

  const [random, setRandom] = useState({
    percentage: 0,
    colour: "hsl(0, 0%, 0%)"
  });

  const generateRandomValues = () => {
    const rand = (n) => Math.random() * n;
    setRandom({
      percentage: rand(100),
      colour: `hsl(${rand(360)}, ${rand(50) + 50}%, ${rand(30) + 20}%)`
    });
  };

  const [isOpen, setIsOpen] = useState(true);
  
  return (
    <>
          <div className="main-upload">
            <div className="title-grid">
              <p className="title-txt">Upload link to Chronology</p>
              <FiMinus className="collapse-btn" onClick={() => setIsOpen(!isOpen)} style={{ color: 'var(--mysteryGrey)' }} />
              <FiX className="close-btn" onClick={handleModalClose} style={{ color: 'var(--mysteryGrey)' }} />
            </div>
            {isOpen && <div className="file-grid">
              <div className="upload-grid">
                <div className="upload-area">
                  <FiDownloadCloud className="arrow-btn" style={{ color: 'var(--darkGrey)' }} />
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
                        <div className="img-content">
                          <img src={selectedFile.url} />
                        </div>
                        <div className="details-content">
                          <span>{selectedFile.data.name}</span>
                          <span>{selectedFile.data.size}</span>
                        </div>
                        <FiTrash className="deleteBtn" onClick={() => deleteBtn(index)} />
                        <Pie percentage={random.percentage} colour={random.colour} />
                      </div>
                    )}
                  </div>
                </div> : null
              }
              <div className="btn-grid">
                {/* for testing only */}
                <button onClick={generateRandomValues}>Randomise</button>
                <div className="cancel-btn" onClick={handleModalClose}>
                  <span>Cancel</span>
                </div>
                <div className="upload-btn" onClick={() => handleSave()}>
                  <span>Upload</span>
                </div>
              </div>
            </div>}
          </div>
    </>
  );
}