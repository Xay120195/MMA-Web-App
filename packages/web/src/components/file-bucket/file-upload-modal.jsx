import React, { useState, useEffect, useRef } from "react";
import { FiX, FiDownloadCloud, FiTrash, FiMinus } from "react-icons/fi";
import { API, Storage } from "aws-amplify";
import "../../assets/styles/FileUpload.css";
import Pie from "../link-to-chronology/Pie";
import config from "../../aws-exports";

const useRefEventListener = (fn) => {
  const fnRef = useRef(fn);
  fnRef.current = fn;
  return fnRef;
};

export default function UploadLinkModal(props) {
  Storage.configure({
    region: config.aws_user_files_s3_bucket_region,
    bucket: config.aws_user_files_s3_bucket,
    identityPoolId: config.aws_user_pools_id,
  });

  const [selectedFiles, _setSelectedFiles] = useState([]);
  const [uploadedFiles, setUploadedFiles] = useState({ files: [] });

  const rejectFiles = [".config", ".exe", ".7z", ".dll", ".exe1", ".zvz"]; //list of rejected files

  const [uploadStart, setUploadStart] = useState(false);

  var showAlert = 0;

  const [flags, setFlags] = useState([]);
  // const flagTemp = [];
  const [flagTemp, setArr] = useState([]);

  const handleDrop = (e) => {
    e.preventDefault();
    if (!e.dataTransfer.files || e.dataTransfer.files.length === 0) {
      return;
    }
    const tempArr = [];

    [...e.dataTransfer.files].forEach((file) => {
      var re = /(?:\.([^.]+))?$/;
      var ext = re.exec(file.name)[0];

      const result = rejectFiles.find((item) => item.includes(ext));
      const fileSize = file.size;

      if (result) {
        if (showAlert == 1) {
          return false;
        } else {
          alert("Your file type is invalid.");
          showAlert = 1; //set flag to don't show
          return false;
        }
      } else if (fileSize > 3145728) {
        if (showAlert == 1) {
          return false;
        } else {
          alert("Your file size exceeds the 3MB limit.");
          showAlert = 1; //set flag to don't show
          return false;
        }
      } else {
        tempArr.push({
          data: file,
          url: URL.createObjectURL(file),
        });
      }
    });

    setSelectedFiles([...selectedFiles, ...tempArr]);
  };

  const handleDropRef = useRefEventListener(handleDrop);

  const handleDrag = (e) => {
    e.preventDefault();
  };

  const dropRef = useRef();

  const myCurrentRef = useRef(selectedFiles);
  const setSelectedFiles = (data) => {
    myCurrentRef.current = data;
    _setSelectedFiles(data);
  };

  useEffect(() => {
    let div = dropRef.current;
    div.addEventListener("dragover", handleDrag);
    div.addEventListener("drop", (e) => handleDropRef.current(e));

    return () => {
      div.removeEventListener("dragover", handleDrag);
      div.removeEventListener("drop", handleDropRef);
    };
  }, []);

  useEffect(() => {
    if (
      uploadedFiles.files.length === selectedFiles.length &&
      selectedFiles.length !== 0
    ) {
      props.handleSave(uploadedFiles);
    }
  }, [selectedFiles, uploadedFiles]);

  const onDragEnter = () => dropRef.current.classList.add("dragover");
  const onDragLeave = () => dropRef.current.classList.remove("dragover");
  const onDrop = () => dropRef.current.classList.remove("dragover");

  const onSelectFile = (e) => {
    console.log(e.target.files.length);
    if (!e.target.files || e.target.files.length === 0) {
      return;
    }
    const tempArr = [];
    console.log(e.target.files);

    [...e.target.files].forEach((file) => {
      var re = /(?:\.([^.]+))?$/;
      var ext = re.exec(file.name)[0];

      const result = rejectFiles.find((item) => item.includes(ext));
      const fileSize = file.size;

      if (result) {
        if (showAlert == 1) {
          return false;
        } else {
          alert("Your file type is invalid.");
          showAlert = 1; //set flag to don't show
          return false;
        }
      } else if (fileSize > 3145728) {
        if (showAlert == 1) {
          return false;
        } else {
          alert("Your file size exceeds the 3MB limit.");
          showAlert = 1; //set flag to don't show
          return false;
        }
      } else {
        tempArr.push({
          data: file,
          url: URL.createObjectURL(file),
        });
      }
    });

    setSelectedFiles([...myCurrentRef.current, ...tempArr]);
  };

  const deleteBtn = (index) => {
    let tempArray = selectedFiles;
    tempArray = tempArray.filter((item, i) => i !== index);

    setSelectedFiles(tempArray);
    setStart({ perc: 1 });
  };

  const handleModalClose = () => {
    props.handleModalClose();
  };

  const [start, setStart] = useState({
    perc: 1,
  });

  const handleUpload = async () => {
    setUploadStart(true);
    selectedFiles.map(async (uf, index) => {
      if (uf.data.name.split(".").pop() == "docx") {
        // console.log(uf.data.type);
        var name = uf.data.name,
          size = uf.data.size,
          type =
            "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
          key = `${props.bucketName}/${Number(new Date())}${name
            .replaceAll(/\s/g, "")
            .replaceAll(/[^a-zA-Z.0-9]+|\.(?=.*\.)/g, "")}`;
      } else {
        var name = uf.data.name,
          size = uf.data.size,
          type = uf.data.type,
          key = `${props.bucketName}/${Number(new Date())}${name
            .replaceAll(/\s/g, "")
            .replaceAll(/[^a-zA-Z.0-9]+|\.(?=.*\.)/g, "")}`;
      }

      try {
        await Storage.put(key, uf.data, {
          contentType: type,
          progressCallback(progress) {
            const progressInPercentage = Math.round(
              (progress.loaded / progress.total) * 100
            );
            console.log(`Progress: ${progressInPercentage}%`);

            generateRandomValues(progressInPercentage, index);
          },
          errorCallback: (err) => {
            console.error("204: Unexpected error while uploading", err);
          },
        })
          .then(async (fd) => {
            var fileData = {
              s3ObjectKey: fd.key,
              size: parseInt(size),
              type: type,
              name: name.split(".").slice(0, -1).join("."),
            };

            setUploadedFiles((prevState) => ({
              files: [...prevState.files, fileData],
            }));
          })
          .catch((err) => {
            console.error("220: Unexpected error while uploading", err);
          });
      } catch (e) {
        const response = {
          error: e.message,
          errorStack: e.stack,
          statusCode: 500,
        };
        console.error("228: Unexpected error while uploading", response);
      }
    });
  };

  const [isOpen, setIsOpen] = useState(true);

  const [random, setRandom] = useState({
    percentage: 0,
    colour: "hsl(0, 0%, 0%)",
    index: 0,
  });

  const ref = useRef(null);

  const startrun = (perc) => {
    setTimeout(() => {
      ref.current.click();
      generateRandomValues(perc);
    }, 2000);
  };

  const saveUploadProgress = (perc) => {
    setArr((flagTemp) => [...flagTemp, perc]);
  };

  // var index= 0;
  const generateRandomValues = (perc, idx) => {
    const rand = (n) => Math.random() * n;
    setRandom({
      percentage: perc,
      colour: `hsl(121, 96%, 24%)`,
      index: idx,
    });
  };

  return (
    <>
      <div className="main-upload">
        <div className="title-grid">
          <p className="title-txt">{props.title}</p>
          <FiMinus
            className="collapse-btn"
            onClick={() => setIsOpen(!isOpen)}
            style={{ color: "var(--mysteryGrey)" }}
          />
          <FiX
            className="close-btn"
            onClick={handleModalClose}
            style={{ color: "var(--mysteryGrey)" }}
          />
        </div>
        {isOpen && (
          <div className="file-grid">
            <div
              className="upload-grid"
              ref={dropRef}
              onDragEnter={onDragEnter}
              onDragLeave={onDragLeave}
              onDrop={onDrop}
            >
              <div className="upload-area">
                <FiDownloadCloud
                  className="arrow-btn"
                  style={{ color: "var(--primaryDefault)" }}
                />
                <input
                  type="file"
                  multiple="multiple"
                  id="file"
                  onChange={onSelectFile}
                  hidden
                />
                <p className="title-txt drop-txt">
                  Drop files here or <label htmlFor="file">browse</label>
                </p>
              </div>
            </div>
            {selectedFiles.length ? (
              <div className="upload-details">
                <div className="line-separator">
                  <span>Items Uploaded</span>
                </div>
                <div className="items-grid">
                  {selectedFiles?.map((selectedFile, index) => (
                    <div id="uploadDivContent" key={index}>
                      <span className="upload-name">
                        {selectedFile.data.name}
                      </span>
                      <FiTrash
                        className={`deleteBtn ${
                          uploadStart ? "disabled-ico" : ""
                        }`}
                        onClick={() => deleteBtn(index)}
                      />
                      {random.percentage === 100 && random.index === index ? (
                        <Pie percentage={100} colour={random.colour} />
                      ) : (
                        <Pie
                          percentage={random.percentage}
                          colour={random.colour}
                        />

                        //counter(); //error
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ) : null}
            <div className="btn-grid">
              <div
                className={`cancel-btn ${
                  uploadStart ? "disabled-cancel-btn" : ""
                }`}
                onClick={handleModalClose}
              >
                <span>Cancel</span>
              </div>
              <div
                className={`upload-btn ${
                  uploadStart || selectedFiles.length === 0
                    ? "disabled-btn"
                    : ""
                }`}
                onClick={() => handleUpload()}
              >
                <span>Upload</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
