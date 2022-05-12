import React, { useState, useEffect, useRef } from "react";
import { AppRoutes } from "../../constants/AppRoutes";
import { API } from "aws-amplify";
import ToastNotification from "../toast-notification";
import { FaTimes, FaFolder } from "react-icons/fa";
import { TiCancel } from "react-icons/ti";
import { RiFileInfoLine } from "react-icons/ri";
import CreatableSelect from "react-select/creatable";

export default function BriefModal(props) {
  const [showToast, setShowToast] = useState(false);
  const [resultMessage, setResultMessage] = useState("");
  const [selectedBrief, setSelectedBrief] = useState(null);
  const [Briefs, setBriefs] = useState(null);
  const [briefsOptions, setBriefOptions] = useState();

  useEffect(() => {
    if (Briefs === null) {
      getListBriefs();
    }
  });

  const hideToast = () => {
    setShowToast(false);
  };

  const handleModalClose = () => {
    props.handleModalClose();
  };

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

  const mUpdateBrief = `
  mutation tagBriefBackground($briefId: ID, $background: [BackgroundInput]) {
    briefBackgroundTag(briefId: $briefId, background: $background) {
      id
    }
  }
  `;

  const mBulkUpdateBackgroundOrder = `
  mutation bulkUpdateBackgroundOrders($arrangement: [ArrangementInput]) {
    backgroundBulkUpdateOrders(arrangement: $arrangement) {
      id
      order
    }
  }`;

  const qBriefBackgroundList = `
    query getBriefByID($id: ID, $sortOrder: OrderBy) {
      brief(id: $id) {
        id
        backgrounds(sortOrder: $sortOrder) {
          items {
            id
            description
            date
            createdAt
            order
            files {
              items {
                id
                name
              }
            }
          }
          nextToken
        }
      }
    }  
  `;

  const handleBriefChanged = (newValue) => {
    if (newValue?.__isNew__) {
      handleSaveBrief(newValue.label);
    } else {
      setSelectedBrief(newValue);
    }
  };

  const handleSaveBrief = async (briefname) => {
    const addBrief = await API.graphql({
      query: mCreateBrief,
      variables: {
        clientMatterId: props.matterId,
        name: briefname,
        date: null,
        order: 0,
      },
    });

    const getBriefId = addBrief.data.briefCreate.id;
    const getBriefName = addBrief.data.briefCreate.name;
    const briefArr = ({
      label: getBriefName,
      value: getBriefId,
    });
    setSelectedBrief(briefArr);
  };

  const getListBriefs = async () => {
    const params = {
      query: listBriefs,
      variables: {
        id: props.matterId,
        limit: 200,
        nextToken: null,
      },
    };

    await API.graphql(params).then((brief) => {
      const result = brief.data.clientMatter.briefs.items.map(({ id, name }) => ({
        value: id,
        label: name,
      }));
      var filteredArr = result.filter(function (sel) {
        return sel.value !== props.briefId;
      });

      setBriefOptions(filteredArr);
    });
  };

  const handleSaveBriefItems = async () => {
    const resultArray = props.selectedRowsBG.map(({ id }) => ({
      id: id,
      order: 0,
    }));

    const backgroundOpt = await API.graphql({
      query: qBriefBackgroundList,
      variables: { id: selectedBrief.value, sortOrder: "ORDER_ASC" },
    });

    if (backgroundOpt.data.brief.backgrounds.items !== null) {
      const resultExistingList = backgroundOpt.data.brief.backgrounds.items.map(
        ({ id, order }) => ({
          id: id,
          order: order,
        })
      );

      const mergedArrayResult = [...resultArray, ...resultExistingList];

      console.log("MErged Array: ", mergedArrayResult);

      const res = mergedArrayResult.map(({ id }, index) => ({
        id: id,
        order: index,
      }));
      
      await API.graphql({
        query: mBulkUpdateBackgroundOrder,
        variables: {
          arrangement: res,
        },
      });

    }

    const response = await API.graphql({
      query: mUpdateBrief,
      variables: {
        briefId: selectedBrief.value,
        background: resultArray
      },
    });
    
    setShowToast(true);
    setResultMessage("Successfully Saved!");
    setTimeout(() => {
      setShowToast(false);
      window.location = 
        `${
          AppRoutes.BACKGROUND
        }/${props.matterId}/${selectedBrief.value}/?matter_name=${utf8_to_b64(
          props.matter_name
        )}&client_name=${utf8_to_b64(props.client_name)}`;
    }, 2000);
  }

  function utf8_to_b64(str) {
    return window.btoa(unescape(encodeURIComponent(str)));
  }

  return (
    <>
      <div className="justify-center items-center flex overflow-x-hidden overflow-y-auto fixed inset-0 z-50 outline-none focus:outline-none">
        <div className="relative w-full my-6 mx-auto max-w-lg">
          <div className="border-0 rounded-lg shadow-lg relative w-full bg-white outline-none focus:outline-none">
            <div className="items-center">
              <div className="flex items-center justify-center p-6 rounded-b">
                <h3 className="text-2xl font-semibold">Create or Update Brief</h3>
              </div>
              <div className="relative p-6 flex-auto">
                <p className="font-semi-bold text-sm">Brief Title *</p>
                <CreatableSelect
                  options={briefsOptions}
                  isClearable
                  isSearchable
                  onChange={handleBriefChanged}
                  value={selectedBrief}
                  placeholder="Brief Name"
                  className="placeholder-blueGray-300 text-blueGray-600 relative bg-white rounded text-sm border-0 shadow outline-none focus:outline-none focus:ring w-full"
                />
              </div>
              <div className="flex items-center justify-center rounded-b mb-5">
                <div className="px-5 w-full flex items-center justify-center text-md">
                
                </div>
              </div>

              <div className="flex items-center justify-end p-6 rounded-b">
                <div className="px-5 w-full flex items-center justify-center text-md">
                  <button
                    className="mr-2 bg-white hover:bg-gray-300 text-black text-sm py-2 px-4 rounded inline-flex items-center border-0 shadow outline-none focus:outline-none focus:ring"
                    onClick={handleModalClose}
                  >
                    Cancel &nbsp; <TiCancel />
                  </button>

                  <button
                    className={
                      selectedBrief === null ? "ml-2 bg-green-200 text-white font-semibold py-2 px-4 rounded inline-flex items-center border-0 shadow outline-none focus:outline-none focus:ring disabled:opacity-25 cursor-not-allowed"
                      : 
                      "ml-2 bg-green-400 hover:bg-green-500 text-white font-semibold py-2 px-4 rounded inline-flex items-center border-0 shadow outline-none focus:outline-none focus:ring"
                      
                      }
                    onClick={() => handleSaveBriefItems()}
                    type="button"
                    disabled={selectedBrief === null ? true : false}
                  >
                    Create &nbsp; <FaFolder />
                  </button>
                </div>
              </div>
              {showToast && (
                <ToastNotification
                  title={resultMessage}
                  hideToast={hideToast}
                />
              )}
            </div>
          </div>
        </div>
      </div>
      <div className="opacity-25 fixed inset-0 z-40 bg-black"></div>
    </>
  );
}
