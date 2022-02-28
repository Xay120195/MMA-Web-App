import React, { useEffect, useState, useRef } from "react";
import { Link } from "react-router-dom";
import ToastNotification from "../toast-notification";
import { API, toast } from "aws-amplify";
import BlankState from "../blank-state";
import { AppRoutes } from "../../constants/AppRoutes";
import { useParams } from "react-router-dom";
import { MdArrowForwardIos } from "react-icons/md";
import { AiOutlineDownload } from "react-icons/ai";
import { FiUpload } from "react-icons/fi";
import "../../assets/styles/BlankState.css";
import UploadLinkModal from "./file-upload-modal";
import AccessControl from "../../shared/accessControl";
import ContentEditable from "react-contenteditable";
import CreatableSelect from "react-select/creatable";

export default function FileBucket() {
  const [showToast, setShowToast] = useState(false);
  const [resultMessage, setResultMessage] = useState("");
  const [matterFiles, setMatterFiles] = useState(null);
  const [labels, setLabels] = useState(null);
  const [clientMatterName, setClientMatterName] = useState("");

  const { matter_id } = useParams();
  const [getReload, setReload] = useState(false);

  const [selectedLabel, setSelectedLabel] = useState();

  const hideToast = () => {
    setShowToast(false);
  };

  const openNewTab = (url) => {
    window.open(url);
  };

  const [showUploadModal, setShowUploadModal] = useState(false);

  const handleUploadLink = (uf) => {
    var uploadedFiles = uf.files.map((f) => ({ ...f, matterId: matter_id }));

    uploadedFiles.map(async (file) => {
      await createMatterFile(file).then(() => {
        setResultMessage(`File successfully uploaded!`);
        setShowToast(true);
        handleModalClose();
        setTimeout(() => {
          setShowToast(false);
          getMatterFiles();
        }, 3000);
      });
    });
  };

  const handleModalClose = () => {
    setShowUploadModal(false);
  };

  const contentDiv = {
    margin: "0 0 0 65px",
  };

  const mCreateMatterFile = `
      mutation createMatterFile ($matterId: ID, $s3ObjectKey: String, $size: Int, $type: String, $name: String) {
        matterFileCreate(matterId: $matterId, s3ObjectKey: $s3ObjectKey, size: $size, type: $type, name: $name) {
          id
          name
          downloadURL
        }
      }
  `;

  const mUpdateMatterFile = `
      mutation updateMatterFile ($id: ID, $name: String, $details: String, $labels : [LabelInput]) {
        matterFileUpdate(id: $id, name: $name, details: $details, labels : $labels) {
          id
          name
          details
          labels {
            id
            name
          }
        }
      }
  `;

  const qGetMatterFiles = `
  query getMatterFile($matterId: ID) {
    clientMatter(id: $matterId) {
      matter {
        name
      }
      client {
        name
      }
    }
    matterFile(matterId: $matterId) {
      id
      name
      downloadURL
      size
      type
      details
      labels {
        id
        name
      }
    }
  }`;

  const listLabels = `
query listLabels($clientMatterId: ID) {
  clientMatter(id: $clientMatterId) {
    labels {
      items {
        id
        name
      }
    }
  }
}
`;

  const mCreateLabel = `
mutation createLabel($clientMatterId: String, $name: String) {
    labelCreate(clientMatterId:$clientMatterId, name:$name) {
        id
        name
    }
}
`;

  const getLabels = async () => {
    let result = [];

    const labelsOpt = await API.graphql({
      query: listLabels,
      variables: {
        clientMatterId: matter_id,
      },
    });

    if (labelsOpt.data.clientMatter.labels !== null) {
      result = labelsOpt.data.clientMatter.labels.items
        .map(({ id, name }) => ({
          value: id,
          label: name,
        }))
        .sort((a, b) => a.label.localeCompare(b.label));
    }

    setLabels(result);
  };

  const addLabel = async (data) => {
    let result;

    const createLabel = await API.graphql({
      query: mCreateLabel,
      variables: {
        clientMatterId: matter_id,
        name: data,
      },
    });

    result = createLabel.data.labelCreate;
    return result;
  };

  useEffect(() => {
    if (matterFiles === null) {
      getMatterFiles();
    }

    if (labels === null) {
      getLabels();
    }
  }, [matterFiles]);

  let getMatterFiles = async () => {
    const params = {
      query: qGetMatterFiles,
      variables: {
        matterId: matter_id,
      },
    };

    await API.graphql(params).then((files) => {
      setMatterFiles(files.data.matterFile);

      setClientMatterName(
        `${files.data.clientMatter.client.name}/${files.data.clientMatter.matter.name}`
      );
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

  async function updateMatterFile(id, data) {
    return new Promise((resolve, reject) => {
      try {
        const request = API.graphql({
          query: mUpdateMatterFile,
          variables: {
            id: id,
            name: data.name,
            details: data.details,
            labels: data.labels,
          },
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

  const textName = useRef("");
  const textDetails = useRef("");

  const handleChangeDesc = (evt) => {
    textDetails.current = evt.target.value;
  };

  const handleMatterChanged = async (options, id, name, details) => {
    let newOptions = [];

    options.map(async (o) => {
      if (o.__isNew__) {
        newOptions = await addLabel(o.label);
      }
    });

    newOptions = options.map(({ value: id, label: name }) => ({
      id,
      name,
    }));

    const data = {
      name: name,
      details: details,
      labels: newOptions,
    };

    await updateMatterFile(id, data);
  };

  const HandleChangeToTD = (id, name, details, labels) => {
    const filterDetails = !details ? "" : details.replace(/(<([^>]+)>)/gi, "");
    const ouputDetails = textDetails.current;
    const finaloutput = ouputDetails.replace(/(<([^>]+)>)/gi, "");
    let lbls = [];
    const data = {
      details: !textDetails.current ? filterDetails : finaloutput,
      name: !name ? "" : name,
      labels: labels,
    };

    updateMatterFile(id, data);

    setTimeout(() => {
      getMatterFiles();
      setTimeout(() => {
        setResultMessage(`Successfully updated `);
        setShowToast(true);
        setTimeout(() => {
          setShowToast(false);
        }, 1000);
      }, 500);
    }, 1000);
  };

  const handleChangeName = (evt) => {
    textName.current = evt.target.value;
  };

  const HandleChangeToTDName = (id, details, name, labels) => {
    const filterName = name.replace(/(<([^>]+)>)/gi, "");
    const ouputName = textName.current;
    const finaloutput = ouputName.replace(/(<([^>]+)>)/gi, "");
    let lbls = [];
    const data = {
      name: !textName.current ? filterName : finaloutput,
      details: !details ? "" : details,
      labels: labels,
    };
    // alert(labels);
    updateMatterFile(id, data);

    setTimeout(() => {
      getMatterFiles();
      setTimeout(() => {
        setResultMessage(`Successfully updated `);
        setShowToast(true);
        setTimeout(() => {
          setShowToast(false);
        }, 1000);
      }, 500);
    }, 1000);
  };

  const extractArray = (ar) => {
    if (Array.isArray(ar) && ar.length) {
      const newOptions = ar.map(({ id: value, name: label }) => ({
        value,
        label,
      }));
      return newOptions;
    } else {
      return null;
    }
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
              <h1 className="font-bold text-3xl">
                File Bucket&nbsp;<span className="text-3xl">of</span>&nbsp;
                <span className="font-semibold text-3xl">
                  {clientMatterName}
                </span>
              </h1>
            </div>
            <div className="absolute right-0">
              <Link to={AppRoutes.DASHBOARD}>
                <button className="bg-white hover:bg-gray-100 text-black font-semibold py-2.5 px-4 rounded inline-flex items-center border-0 shadow outline-none focus:outline-none focus:ring">
                  Back &nbsp;
                  <MdArrowForwardIos />
                </button>
              </Link>
            </div>
          </div>
        </div>

        <div className="p-5 left-0">
          {/* <div>
            <span className={"text-sm mt-3 font-medium"}>FILE BUCKET</span>
          </div> */}
        </div>
        <div className="p-5 py-1 left-0">
          <div>
            <button
              className="bg-white hover:bg-gray-100 text-black font-semibold py-1 px-5 rounded inline-flex items-center border-0 shadow outline-none focus:outline-none focus:ring"
              onClick={() => setShowUploadModal(true)}
            >
              FILE UPLOAD &nbsp;
              <FiUpload />
            </button>
          </div>
        </div>

        <div className="p-5 px-5 py-0 left-0">
          <p className={"text-lg mt-3 font-medium"}>FILES</p>
        </div>

        {matterFiles !== null && (
          <>
            {matterFiles.length === 0 ? (
              <div className="p-5 px-5 py-1 left-0">
                <div className="w-full h-42 bg-gray-100 rounded-lg border border-gray-200 mb-6 py-1 px-1">
                  <BlankState
                    title={"items"}
                    txtLink={"file upload button"}
                    handleClick={() => setShowUploadModal(true)}
                  />
                </div>
              </div>
            ) : (
              <>
                {matterFiles !== null && matterFiles.length !== 0 && (
                  <div className="shadow border-b border-gray-200 sm:rounded-lg my-5">
                    <table className=" table-fixed min-w-full divide-y divide-gray-200">
                      <thead>
                        <tr>
                          <th className="px-6 py-4 whitespace-nowrap text-left w-1/3">
                            Name
                          </th>
                          <th className="px-6 py-4 whitespace-nowrap text-left w-1/3">
                            Description
                          </th>
                          <th className="px-6 py-4 whitespace-nowrap text-left w-1/3">
                            Labels
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {matterFiles.map((data, index) => (
                          <tr key={data.id} index={index}>
                            <td className="px-6 py-4 place-items-center relative">
                              <div className="inline-flex">
                                <ContentEditable
                                  html={
                                    !data.name
                                      ? "<p>no_filename</p>"
                                      : `<p>${data.name}</p>`
                                  }
                                  onChange={(evt) => handleChangeName(evt)}
                                  onBlur={() =>
                                    HandleChangeToTDName(
                                      data.id,
                                      data.details,
                                      data.name,
                                      data.labels
                                    )
                                  }
                                  className="w-full h-5"
                                />
                                <span>
                                  <AiOutlineDownload
                                    className="text-blue-400 mx-1"
                                    onClick={() =>
                                      //openNewTab(data.downloadURL.substr(0,data.downloadURL.indexOf("?")))
                                      openNewTab(data.downloadURL)
                                    }
                                  />
                                </span>
                              </div>
                            </td>

                            <td className="px-6 py-4 align-top place-items-center relative">
                              <ContentEditable
                                html={
                                  !data.details
                                    ? `<p> </p>`
                                    : `<p>${data.details}</p>`
                                }
                                onChange={(evt) => handleChangeDesc(evt)}
                                onBlur={() =>
                                  HandleChangeToTD(
                                    data.id,
                                    data.name,
                                    data.details,
                                    data.labels
                                  )
                                }
                                className="w-full h-5"
                              />
                            </td>

                            <td className="px-6 py-4 w-10 align-top place-items-center relative">
                              <CreatableSelect
                                defaultValue={extractArray(
                                  data.labels
                                    ? data.labels
                                    : { value: 0, label: "" }
                                )}
                                options={labels}
                                isMulti
                                isClearable
                                isSearchable
                                onChange={(options) =>
                                  handleMatterChanged(
                                    options,
                                    data.id,
                                    data.name,
                                    data.details
                                  )
                                }
                                placeholder="Labels"
                                className=" placeholder-blueGray-300 text-blueGray-600 bg-white rounded text-sm border-0 shadow outline-none focus:outline-none focus:ring z-100"
                              />
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </>
            )}
          </>
        )}
      </div>

      {showUploadModal && (
        <UploadLinkModal
          title={""}
          handleSave={handleUploadLink}
          bucketName={matter_id}
          handleModalClose={handleModalClose}
        />
      )}

      {showToast && resultMessage && (
        <ToastNotification title={resultMessage} hideToast={hideToast} />
      )}
    </>
  );
}
