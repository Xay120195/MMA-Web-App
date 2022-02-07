import React, { useEffect, useState } from "react";
import ToastNotification from "../toast-notification";
import { API, Storage } from "aws-amplify";
import BlankState from "../blank-state";

import { useParams } from "react-router-dom";
import { MdArrowForwardIos } from "react-icons/md";
import { AiOutlineDownload } from "react-icons/ai";
import { FiUpload } from "react-icons/fi";

import "../../assets/styles/BlankState.css";

import UploadLinkModal from "../link-to-chronology/upload-linktochronology-modal"; // shared functions/modal from link-to-chronology
import AccessControl from "../../shared/accessControl";

export default function FileBucket() {
  const [showToast, setShowToast] = useState(false);
  const [resultMessage, setResultMessage] = useState("");
  const [matterFiles, setMatterFiles] = useState(null);
  //610f886a-9c3a-4a0e-a998-b26b19f2c95b
  const { matter_id } = useParams();

  const hideToast = () => {
    setShowToast(false);
  };

  const [showUploadLinkModal, setshowUploadLinkModal] = useState(false);

  const handleUploadLink = (uploadFiles) => {
    console.log("handleFiles", uploadFiles);

    uploadFiles.map(async (uf) => {
      var name = uf.data.name,
        size = uf.data.size,
        type = uf.data.type;

      await Storage.put(name, uf, { contentType: type }).then(async (fd) => {
        const file = {
          matterId: matter_id,
          s3ObjectKey: fd,
          size: parseInt(size),
          type: type,
        };

        console.log("params", file);
        await createMatterFile(file).then((u) => {
          console.log(u);
          setResultMessage(`Success!`);
          setShowToast(true);
          setTimeout(() => {
            setShowToast(false);
            handleModalClose();
          }, 5000);
        });
      });
    });

    setShowToast(true);
    setTimeout(() => {
      setShowToast(false);
    }, 3000);
  };

  const handleModalClose = () => {
    setshowUploadLinkModal(false);
  };

  const contentDiv = {
    margin: "0 0 0 65px",
  };

  const mCreateMatterFile = `
      mutation createMatterFile ($matterId: ID, $s3ObjectKey: String, $size: Int, $type: String) {
        matterFileCreate(matterId: $matterId, s3ObjectKey: $s3ObjectKey, size: $size, type: $type) {
          createdAt
          downloadURL
          id
          size
        }
      }
  `;

  const qGetMatterFiles = `
  query getMatterFile($id: ID = "610f886a-9c3a-4a0e-a998-b26b19f2c95b") {
    matterFile(id: $id) {
      id
      downloadURL
      createdAt
      size
    }
  }`;

  useEffect(() => {
    console.log(Storage);
    if (matterFiles === null) {
      getMatterFiles();
    }
  }, [matterFiles]);

  let getMatterFiles = async () => {
    const params = {
      query: qGetMatterFiles,
      variables: {
        id: matter_id,
      },
    };

    await API.graphql(params).then((files) => {
      console.log(files);

      var dummyData = [
        {
          fileName: "Adios, Patria adorada, region del sol querida.pdf",
          fileType: "pdf",
          fileSize: "10122",
        },
        {
          fileName: "Perla del mar de oriente, nuestro perdido Eden.pdf",
          fileType: "pdf",
          fileSize: "11011",
        },
        {
          fileName: "A darte voy alegre la triste mustia vida.pdf",
          fileType: "pdf",
          fileSize: "5110",
        },
      ];

      setMatterFiles(dummyData);
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
        reject(e.errors[0].message);
      }
    });
  }
  const mainGrid = {
    display: "grid",
    gridtemplatecolumn: "1fr auto",
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
              <h1 className="font-bold text-3xl">&nbsp; File Bucket</h1>
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

        <div className="p-5 left-0">
          <div>
            <span className={"text-sm mt-3 font-medium"}>FILE BUCKET</span>
          </div>
        </div>
        <div className="p-5 py-1 left-0">
          <div>
            <button
              className="bg-white hover:bg-gray-100 text-black font-semibold py-1 px-5 rounded inline-flex items-center border-0 shadow outline-none focus:outline-none focus:ring"
              onClick={() => setshowUploadLinkModal(true)}
            >
              FILE UPLOAD &nbsp;
              <FiUpload />
            </button>
          </div>
        </div>

        <div className="p-5 px-5 py-0 left-0">
          <p className={"text-lg mt-3 font-medium"}>FILES</p>
        </div>

        {matterFiles === undefined ? (
          <>
            <div className="p-5 px-5 py-1 left-0">
              <div className="w-full h-42 bg-gray-100 rounded-lg border border-gray-200 mb-6 py-1 px-1">
                <BlankState
                  title={"items"}
                  txtLink={"file upload button"}
                  handleClick={"insertfunctionhere"}
                />
              </div>
            </div>
          </>
        ) : (
          <>
            {matterFiles !== null && (
              <div className="shadow overflow-hidden border-b border-gray-200 sm:rounded-lg my-5">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead>
                    <tr>
                      <th className="px-6 py-4 whitespace-nowrap w-4 text-left">
                        Name{" "}
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {matterFiles.map((ddata, index) => (
                      <tr key={index} index={index}>
                        <td className="px-6 py-4 w-10 align-top place-items-center">
                          <div>
                            <span>{ddata.fileName} </span>
                            <span className="absolute right-20">
                              <AiOutlineDownload className="text-blue-400" />
                            </span>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </>
        )}
      </div>
      {showUploadLinkModal && (
        <UploadLinkModal
          handleSave={handleUploadLink}
          handleModalClose={handleModalClose}
        />
      )}
    </>
  );
}
