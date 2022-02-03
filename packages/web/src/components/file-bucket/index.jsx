import React, { useEffect, useState } from "react";
import ToastNotification from "../toast-notification";
import { API } from "aws-amplify";
import { useForm } from "react-hook-form";
import BlankState from "../blank-state";

import { Link } from "react-router-dom";
import { MdArrowForwardIos } from "react-icons/md";
import { AiOutlineDownload } from "react-icons/ai";
import { FiUpload } from "react-icons/fi";

import '../../assets/styles/BlankState.css';
import Illustration from '../../assets/images/no-data.svg';

import {
  HiOutlineShare,
  HiOutlinePlusCircle,
  HiOutlineFilter,
  HiMinus,
  HiMinusCircle,
  HiTrash,
} from "react-icons/hi";

export default function FileBucket() {
  const [showToast, setShowToast] = useState(false);
  const [resultMessage, setResultMessage] = useState("");
  const hideToast = () => {
    setShowToast(false);
  };

  const {
    register,
    formState: { errors },
    reset,
    handleSubmit,
    setError,
  } = useForm();

  const contentDiv = {
    margin: "0 0 0 65px",
  };

  const mCreateMatterFile = `
      mutation createMatterFile ($matterId: ID, $s3ObjectKey: String, $size: Int) {
        matterFileCreate(matterId: $matterId, s3ObjectKey: $s3ObjectKey, size: $size) {
          createdAt
          downloadURL
          id
          size
        }
      }
  `;

  const handleSave = async (formdata) => {
    const { matterId, s3ObjectKey, size } = formdata;

    const file = {
      matterId: matterId,
      s3ObjectKey: s3ObjectKey,
      size: parseInt(size),
    };

    console.log(file);
    await createMatterFile(file).then((u) => {
      console.log(u);
      setResultMessage(`Success!`);
      setShowToast(true);
      setTimeout(() => {
        setShowToast(false);
        reset({ size: "", matterId: "", s3ObjectKey: "" });
      }, 5000);
    });
  };

  async function createMatterFile(file) {
    return new Promise((resolve, reject) => {
      try {
        const request = API.graphql({
          query: mCreateMatterFile,
          variables: file,
        });

        resolve(request);
      } catch (e) {
        setError(e.errors[0].message);
        reject(e.errors[0].message);
      }
    });
  }
  const mainGrid = {
    display: "grid",
    gridtemplatecolumn: "1fr auto",
  };

  const dummyData = [
    {
      "fileName": "Urgent Follow-up Email.pdf",
      "fileType": "pdf",
      "fileSize": "10kb"
    },
    {
      "fileName": "Urgent Follow-up Email.pdf",
      "fileType": "pdf",
      "fileSize": "10kb"
    },
    {
      "fileName": "Urgent Follow-up Email.pdf",
      "fileType": "pdf",
      "fileSize": "10kb"
    }
  ];

  const tableHeaders = [
    "No.",
    "File Name",
    "File Size",
    "File Type",
    "Action",
  ];



  return (
  <>
  <div className={"p-5 relative flex flex-col min-w-0 break-words mb-6 shadow-lg rounded bg-white"} 
    style={contentDiv}>
          <div className="relative flex-grow flex-1">
            <div style={mainGrid}>
              <div>
                <h1 className="font-bold text-3xl">&nbsp;  File Bucket</h1>
                
              </div>
              <div className="absolute right-0">
                {/* <Link to={AppRoutes.DASHBOARD}> */}
                  <button className="bg-white hover:bg-gray-100 text-black font-semibold py-2.5 px-4 rounded inline-flex items-center border-0 shadow outline-none focus:outline-none focus:ring">
                    Back &nbsp;
                    <MdArrowForwardIos />
                  </button>
                {/* </Link> */}
              </div>
            </div>
          </div>

    <div className="p-5 left-0" >
      <div>
        <span className={"text-sm mt-3 font-medium"}>
          FILE BUCKET
        </span>
      </div>    
    </div>
    <div className="p-5 py-1 left-0" >
      <div>
        <button className="bg-white hover:bg-gray-100 text-black font-semibold py-1 px-5 rounded inline-flex items-center border-0 shadow outline-none focus:outline-none focus:ring">
            FILE UPLOAD &nbsp;
                      <FiUpload />
        </button>
      </div>    
    </div>
  
    {dummyData != undefined ? ( 
      <>
        <div className="p-5 px-5 py-1 left-0">
            <p className={"text-lg mt-3 font-medium"}>FILES</p>
        </div>
        <div className="p-5 px-5 py-1 left-0">
            <div className="w-full h-42 bg-gray-100 rounded-lg border border-gray-200 mb-6 py-1 px-1">
            <BlankState
              title={"items"}
              txtLink={"file upload button"}
              handleClick={"insertfunctionhere"}/>
            </div>
        </div>
      </>
    ) : (
      <>
      <div className="mt-7">
      <div className="p-5 px-5 py-0 left-0">
        <p className={"text-lg mt-3 font-medium"}>FILES</p>
      </div>
      <div className="shadow overflow-hidden border-b border-gray-200 sm:rounded-lg my-5">
            <table className="min-w-full divide-y divide-gray-200">
              <thead>
                <tr>
                  <th className="px-6 py-4 whitespace-nowrap w-4 text-left">Name </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
               {dummyData
                  .map((ddata, index) => (
                    <tr key={index} index={index}>
                      <td className="px-6 py-4 w-10 align-top place-items-center"> 
                      <div>
                        <span>{ddata.fileName} </span>
                        <span className="absolute right-20"><AiOutlineDownload className="text-blue-400" /></span>
                      </div>
                      </td> 
                    </tr>
                  ))}
              </tbody>
            </table>
      </div>
      </div>
      </>
    )}
  </div>
 

  
    <form className="grid gap-4" onSubmit={handleSubmit(handleSave)}>
      <div className="p-5 w-1/3" style={contentDiv}>
        <div className="relative flex-auto">
          <p className="input-name">Matter ID</p>
          <div className="relative my-2">
            <input
              type="text"
              className="input-field"
              placeholder="Matter ID"
              {...register("matterId")}
            />
          </div>
        </div>

        <div className="relative flex-auto">
          <p className="input-name">S3 Object Key</p>
          <div className="relative my-2">
            <input
              type="text"
              className="input-field"
              placeholder="S3 Object Key"
              {...register("s3ObjectKey")}
            />
          </div>
        </div>

        <div className="relative flex-auto">
          <p className="input-name">File Size</p>
          <div className="relative my-2">
            <input
              type="text"
              className="input-field"
              placeholder="File Size"
              {...register("size")}
            />
          </div>
        </div>

        <div className="grid justify-start pt-5">
          <button className="save-btn" type="submit">
            <p>Save Changes</p>
          </button>
        </div>
      </div>

      {showToast && resultMessage && (
        <ToastNotification title={resultMessage} hideToast={hideToast} />
      )}
    </form>
  </>
  );
}
