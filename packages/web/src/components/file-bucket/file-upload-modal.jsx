import React, { useState, useEffect, useRef } from "react";
import { FiX, FiDownloadCloud, FiTrash, FiMinus } from "react-icons/fi";
import { API, Storage } from "aws-amplify";
import "../../assets/styles/FileUpload.css";
import Pie from "../link-to-chronology/Pie";
import config from "../../aws-exports";
import {RiErrorWarningLine, RiErrorWarningFill} from "react-icons/ri";

import { CircularProgressbar } from 'react-circular-progressbar';
import 'react-circular-progressbar/dist/styles.css';
import "../../assets/styles/custom-styles.css";

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
  const [percent, setPercent] = useState([]);
  const [itr, setItr] = useState(0);
  

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

        tempArr.push({
          data: file,
          url: URL.createObjectURL(file),
        });
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
  var setFlag = 0; //0 = no valid files

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

        tempArr.push({
          data: file,
          url: URL.createObjectURL(file),
        });
    });
    setSelectedFiles([...myCurrentRef.current, ...tempArr]);

    let tempArray = selectedFiles;

    var re = /(?:\.([^.]+))?$/;
    // selectedFiles.map(x=> rejectFiles.find((item) => item.includes(x.data.name)) ? setFlag = 0 : setFlag = 1);

   
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


  var count = 0;
  var temp=[];

  const handleUpload = async () => {
    setUploadStart(true);
    console.log("selFiles",selectedFiles);

    var tempArr= [];
    
    selectedFiles.map((uf) => {
      console.log(uf);
      var re = /(?:\.([^.]+))?$/;
      var ext = re.exec(uf.data.name)[0];
      const result = rejectFiles.find((item) => item.includes(ext));
      console.log("ress", result);

      if(result){
        tempArr = tempArr;
      }else if(uf.data.size > 2147483648){
        tempArr = tempArr;
      }else{
        tempArr = [...tempArr, uf];
      }
    });

    console.log(tempArr);
    console.log("sff", tempArr);
    setSelectedFiles(tempArr);
    _setSelectedFiles(tempArr);
    
    console.log("sff1", selectedFiles);
 
  
    if(tempArr.length < 1){
        setUploadedFiles({ files: [] });
    }else{

        tempArr.map(async (uf, index) => {
      // var temp = [];
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
            console.log(`Progress: ${progressInPercentage}%, ${uf.data.name}`);

            if(temp.length > selectedFiles.length){
              
              for(var i=0; i<selectedFiles.length; i++){
                console.log(uf.data.name === temp[i].name);
                if(temp[i].name === uf.data.name){
                  temp[i].prog = progressInPercentage;
                }
              }
            }else{
              temp = [...temp, {prog: progressInPercentage, name: uf.data.name}];
            }

            
            console.log(temp);
            setPercent(temp);
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

            // setUploadStart(false);
            // setSelectedFiles([]);
            
   
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
    }

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

  const generateRandomValues = (perc, idx) => {
    const rand = (n) => Math.random() * n;
    setRandom({
      percentage: perc,
      colour: `hsl(121, 96%, 24%)`,
      index: idx,
    });
  };

  const checkExtension = (fileName) => {
      var re = /(?:\.([^.]+))?$/;
      var ext = re.exec(fileName)[0];
      console.log("ext",ext);

      const result1 = rejectFiles.find((item) => item.includes(ext));
      console.log("ress", result1);

      if(result1){
        return true;
      }else{
        return false;
      }
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
                    <div id="uploadDivContent" key={index} 
                    className={selectedFile.data.size > 2147483648 || checkExtension(selectedFile.data.name) ? "invalid px-2 py-1" : "px-2 py-1"}
                    >
                      <span className="upload-name bg-orange-400">
                        {selectedFile.data.name}
                      </span>
                      <FiTrash
                        className={`deleteBtn ${
                          uploadStart ? "disabled-ico" : ""
                        }`}
                        onClick={() => deleteBtn(index)}
                      />
                      {/* {selectedFile.data.size} */}
                      {selectedFile.data.size > 2147483648 || checkExtension(selectedFile.data.name) ?
                      <RiErrorWarningLine className="w-11 h-11" color="orange"/>
                      : <CircularProgressbar value={percent[index] ? parseInt(percent[index].prog) : 0} text={percent[index] ? `${parseInt(percent[index].prog)}%` : "0%"} className="w-10 h-10"/>
                      }
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
