import React, { useState, useEffect } from "react";
import { Redirect, useHistory } from "react-router-dom";
import BlankState from "../dynamic-blankstate";
import { HiOutlinePlusCircle } from "react-icons/hi";
import { MdArrowForwardIos, MdDownload } from "react-icons/md";
// import { matter_rfi, questions } from "./data-source";
import { AppRoutes } from "../../constants/AppRoutes";
// import CreateRFIModal from "./create-RFI-modal";
import ToastNotification from "../toast-notification";
import AccessControl from "../../shared/accessControl";
import { FaUserCircle } from "react-icons/fa";
import { AiOutlineFolderOpen } from "react-icons/ai";
import BlankList from "../../assets/images/RFI_Blank_List.svg";
import { useParams } from "react-router-dom";
import { API } from "aws-amplify";
import { Link } from "react-router-dom";
import CreateBriefsModal from "./create-brief-modal";

export default function Briefs() {
  let history = useHistory();
  const { matter_id } = useParams();

  const modalRFIAlertMsg = "Background successfully created.";

  const [showCreateRFIModal, setshowCreateRFIModal] = useState(false);

  // const [dataquestions, setQuestion] = useState(questions);
  const [searchTable, setSearchTable] = useState();

  const [showToast, setShowToast] = useState(false);
  const [showAddRow, setShowAddRow] = useState(false);
  const [allowUpdateQuestion, setAllowUpdateQuestion] = useState(false);
  const [allowUpdateResponse, setAllowUpdateResponse] = useState(false);
  const [alertMessage, setalertMessage] = useState();
  const [briefName, setBriefName] = useState("");
  const [briefId, setBriefId] = useState("");
  const [validationAlert, setValidationAlert] = useState("");

  const [Briefs, setBriefs] = useState(null);
  const [showCreateBriefsModal, setshowCreateBriefsModal] = useState(false);

  const handleBlankStateClick = () => {
    // console.log("Blank State Button was clicked!");
    setshowCreateRFIModal(true);
  };

  const hideToast = () => {
    setShowToast(false);
  };

  const [RFI, setRFI] = useState(null);

  const listRFI = `
    query listRFI($clientMatterId: ID) {
      clientMatter(id: $clientMatterId) {
        rfis {
          items {
            id
            name
            createdAt
          }
        }
      }
    }
    `;

  const listBriefs = `
    query getBriefsByClientMatter($id: ID, $limit: Int, $nextToken: String) {
      clientMatter(id: $id) {
        briefs(limit: $limit, nextToken: $nextToken) {
          items {
            id
            name
            date
            order
          }
        }
      }
    }
    `;

  const mCreateRFI = `
    mutation createRFI($clientMatterId: String, $name: String) {
        rfiCreate(clientMatterId:$clientMatterId, name:$name) {
            id
            name
            createdAt
        }
    }
    `;

  const mCreateBrief = `
  mutation MyMutation($clientMatterId: String, $date: AWSDateTime, $name: String, $order: Int) {
    briefCreate(clientMatterId: $clientMatterId, date: $date, name: $name, order: $order) {
      id
      name
      date
      createdAt
    }
  }
  `;

  const mUpdateBriefName = `mutation updateBriefName($id: ID, $name: String) {
    briefUpdate(id: $id, name: $name) {
      id
    }
  }`;

  const getBriefs = async () => {
    console.log("matterid", matter_id);
    const params = {
      query: listBriefs,
      variables: {
        id: matter_id,
        limit: 100,
        nextToken: null,
      },
    };

    await API.graphql(params).then((brief) => {
      const matterFilesList = brief.data.clientMatter.briefs.items;
      console.log("mfl", matterFilesList);
      setBriefs(matterFilesList);
    });
  };

  function b64EncodeUnicode(str) {
    return btoa(encodeURIComponent(str));
  }

  useEffect(() => {
    if (Briefs === null) {
      getBriefs();
    }
  });

  const handleSaveBrief = async (briefname) => {
    console.log("matterid", matter_id);
    console.log("briefname", briefname);

    // alert(briefname);

    const addBrief = await API.graphql({
      query: mCreateBrief,
      variables: {
        clientMatterId: matter_id,
        name: briefname,
        date: null,
        order: 0,
      },
    });

    console.log("brief", addBrief);
    const getID = addBrief.data.briefCreate.id;

    handleModalClose();
    setShowToast(true);
    setTimeout(() => {
      setShowToast(false);
      getBriefs();
      history.push(`${AppRoutes.BACKGROUND}/${matter_id}/${getID}/?matter_name=${b64EncodeUnicode(matter_name)}&client_name=${b64EncodeUnicode(client_name)}`);
    }, 3000);
  };

  const handleModalClose = () => {
    setshowCreateBriefsModal(false);
  };

  const contentDiv = {
    margin: "0 0 0 65px",
  };

  const mainGrid = {
    display: "grid",
    gridtemplatecolumn: "1fr auto",
  };

  const handleSearchChange = (e) => {
    console.log("L114" + e.target.value);
    setSearchTable(e.target.value);
  };

  const style = {
    paddingLeft: "0rem",
  };

  function visitBrief(id) {
    // history.push(`${AppRoutes.BACKGROUND}/${id}`);
    history.push(`${AppRoutes.BACKGROUND}/${matter_id}/${id}/?matter_name=${b64EncodeUnicode(matter_name)}&client_name=${b64EncodeUnicode(client_name)}`);
  }

  function getQueryVariable(variable) {
    var query = window.location.search.substring(1);
    var vars = query.split("&");
    for (var i = 0; i < vars.length; i++) {
      var pair = vars[i].split("=");
      if (pair[0] == variable) {
        return pair[1];
      }
    }
    return false;
  }

  function UnicodeDecodeB64(str) {
    return decodeURIComponent(atob(str));
  }

  const m_name = getQueryVariable("matter_name");
  const c_name = getQueryVariable("client_name");
  const matter_name = UnicodeDecodeB64(m_name);
  const client_name = UnicodeDecodeB64(c_name);

  const briefDummy = [
    { id: "test-1", name: "test-1", date: "May 6, 2022", order: 0 },
    { id: "test-2", name: "test-2", date: "May 6, 2022", order: 1 },
    { id: "test-3", name: "test-3", date: "May 6, 2022", order: 2 },
    { id: "test-4", name: "test-4", date: "May 6, 2022", order: 3 },
    { id: "test-5", name: "test-5", date: "May 6, 2022", order: 4 },
  ];

  const handleNameContent = (e, name, id) => {
    if (!validationAlert) {
      setBriefName(!name ? "" : name);
      setBriefId(id);
      setValidationAlert("");
    } else {
      setBriefName("");
    }
  };

  const handleOnChangeBiefName = (e) => {
    setBriefName(e.currentTarget.textContent);
  };

  const handleSaveBriefName = (e, name, id) => {
    const updateName = Briefs.map((x) => {
      if (x.id === id) {
        return {
          ...x,
          name: e.target.innerHTML,
        };
      }
      return x;
    });
    setBriefs(updateName);

    if (briefName.length <= 0) {
      setValidationAlert("Brief Name is required");
    } else if (briefName === name) {
      setValidationAlert("");
      const data = {
        id,
        name: e.target.innerHTML,
      };
      const success = updateBriefName(data);
      if (success) {
        setalertMessage(`Successfully updated ${briefName} `);
        setShowToast(true);

        setTimeout(() => {
          setShowToast(false);
        }, 1000);
      }
    } else {
      setValidationAlert("");
      const data = {
        id,
        name: e.target.innerHTML,
      };

      const success = updateBriefName(data);
      if (success) {
        setalertMessage(`Successfully updated ${briefName} `);
        setShowToast(true);
        setTimeout(() => {
          setShowToast(false);
        }, 1000);
      }
    }
  };

  async function updateBriefName(data) {
    return new Promise((resolve, reject) => {
      try {
        const request = API.graphql({
          query: mUpdateBriefName,
          variables: {
            id: data.id,
            name: data.name,
          },
        });
        resolve(request);
      } catch (e) {
        reject(e.errors[0].message);
      }
    });
  }

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
                Backgroud Page&nbsp;
                <span className="text-3xl">of</span>&nbsp;
                <span className="font-semibold text-3xl">
                  {client_name}/{matter_name}
                </span>
              </h1>
            </div>
            <div>
              <nav aria-label="Breadcrumb" style={style} className="mt-4">
                <ol
                  role="list"
                  className="px-0 flex items-left space-x-2 lg:px-6 lg:max-w-7xl lg:px-8"
                >
                  <li>
                    <Link
                      className="mr-2 text-sm font-medium text-gray-900"
                      to={`${AppRoutes.DASHBOARD}`}
                    >
                      Dashboard
                    </Link>
                  </li>
                  <svg
                    width="16"
                    height="20"
                    viewBox="0 0 16 20"
                    fill="currentColor"
                    xmlns="http://www.w3.org/2000/svg"
                    aria-hidden="true"
                    className="w-4 h-5 text-gray-300"
                  >
                    <path d="M5.697 4.34L8.98 16.532h1.327L7.025 4.341H5.697z" />
                  </svg>
                  <li className="text-sm">
                    <span className="font-medium text-gray-500 px-1 flex">
                      <AiOutlineFolderOpen /> &nbsp; Background Page{" "}
                    </span>
                  </li>
                </ol>
              </nav>
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

          <div className="mt-7">
            <div>
              <button
                type="button"
                className="bg-green-100 hover:bg-green-100 text-green-500 text-sm py-1 px-4 rounded inline-flex items-center border border-green-500 shadow focus:ring mx-2"
                onClick={() => setshowCreateBriefsModal(true)}
              >
                NEW BACKGROUND &nbsp; <HiOutlinePlusCircle />
              </button>
              <input
                type="search"
                placeholder="Search ..."
                onChange={handleSearchChange}
                className="px-3 py-3 placeholder-blueGray-300 text-blueGray-600 relative bg-white rounded text-sm border-0 shadow outline-none focus:outline-none focus:ring pl-5 float-right w-3/12 "
              />
            </div>
          </div>
        </div>
      </div>
      {Briefs === null || Briefs.length === 0 ? (
        <div className="p-5 px-5 py-1 left-0">
          <div className="w-full h-42 bg-gray-100 rounded-lg border border-gray-200 mb-6">
            <BlankState
              displayText={"There are no items to show in this view"}
              txtLink={"add new Background"}
              iconDisplay={BlankList}
            />
          </div>
        </div>
      ) : (
        <div
          className="shadow overflow-hidden border-b border-gray-200 sm:rounded-lg"
          style={{
            marginLeft: "5.2rem",
            marginTop: "2rem",
            marginRight: "1rem",
          }}
        >
          {Briefs.map((item) => (
            <div
              className="w-90  bg-gray-100 rounded-lg border border-gray-200  py-4 px-4 m-2 
                hover:border-black"
              key={item.id}
            >
            <div>
              <div className="grid grid-cols-4 gap-4">
                <div className="col-span-2">
                  <p
                    suppressContentEditableWarning={true}
                    style={{
                      cursor: "auto",
                      outlineColor: "rgb(204, 204, 204, 0.5)",
                      outlineWidth: "thin",
                    }}
                    onClick={(e) => handleNameContent(e, item.name, item.id)}
                    contentEditable={true}
                    tabIndex="0"
                    onInput={(e) => handleOnChangeBiefName(e)}
                    onBlur={(e) => handleSaveBriefName(e, item.name, item.id)}
                    className="focus:outline-none text-gray-800 dark:text-gray-100 font-bold mb-1 w-8/12"
                    dangerouslySetInnerHTML={{
                      __html: item.name,
                    }}
                  />

                  <p
                    tabIndex="0"
                    className="focus:outline-none text-gray-400 dark:text-gray-100 text-xs"
                  >
                    {item.createdAt ? item.createdAt : "No date"}
                  </p>
                </div>
              </div>
              <div className="float-right inline-flex -mt-10">
                  <FaUserCircle className="h-10 w-10" />{" "}
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-7 w-7 my-1 mx-1 cursor-pointer"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                    onClick={() => visitBrief(item.id)}
                  >
                    <path
                      fillRule="evenodd"
                      d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
                      clipRule="evenodd"
                    />
                  </svg>
              </div>
            </div>
            </div>
          ))}
        </div>
      )}
      {/* {showCreateRFIModal && (
        <CreateRFIModal
          handleSave={handleSaveRFI}
          handleModalClose={handleModalClose}
        />
      )} */}
      {showCreateBriefsModal && (
        <CreateBriefsModal
          handleSave={handleSaveBrief}
          handleModalClose={handleModalClose}
        />
      )}
      {showToast && (
        <ToastNotification title={alertMessage} hideToast={hideToast} />
      )}
    </>
  );
}
