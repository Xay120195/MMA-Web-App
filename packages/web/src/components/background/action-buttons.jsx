import React, { useState, useEffect } from "react";
import ToastNotification from "../toast-notification";
import { API } from "aws-amplify";

const ActionButtons = ({
  idList,
  setWitness,
  witness,
  setShowSearch,
  checkAllState,
  setcheckAllState,
  setCheckedState,
  settotalChecked,
  setSearch,
  search,
  setId,
  matterId
}) => {
  const [newWitness, setList] = useState([]);
  const [showToast, setShowToast] = useState(false);
  const [alertMessage, setalertMessage] = useState();

  const hideToast = () => {
    setShowToast(false);
  };

  const handleCheckAllChange = (ischecked) => {
    setcheckAllState(!checkAllState);

    if (ischecked) {
      setCheckedState(new Array(witness.length).fill(true));
      settotalChecked(witness.length);
      setId(witness.map((s) => s.id));
    } else {
      setCheckedState(new Array(witness.length).fill(false));
      settotalChecked(0);
    }
  };

  useEffect(() => {
    setWitness(newWitness);
  }, [newWitness]);


  const qListBackground = `
    query listBackground($id: ID) {
      clientMatter(id: $id) {
        id
        backgrounds {
          items {
            id
            description
            date
          }
        }
      }
    }
  `;

  const getBackground = async () => {
    let result = [];

    const backgroundOpt = await API.graphql({
      query: qListBackground,
      variables: {
        id: matterId,
      },
    });

    if (backgroundOpt.data.clientMatter.backgrounds !== null) {
      result = backgroundOpt.data.clientMatter.backgrounds.items
        .map(({ id, description, date }) => ({
          id: id,
          description: description,
          date: date
        }));
        setList(result);
    }
  };


  const mDeleteBackground = `
    mutation deleteBackground($id: ID) {
      backgroundDelete(id: $id) {
        id
      }
    }
  `;

  const handleDelete = async (item) => {
    if (item.length <= 1) {
      window.alert("Please select row.");
    } else {
      item.map(async function (x) {
        const deleteBackgroundRow = await API.graphql({
          query: mDeleteBackground,
          variables: {
            id: x
          },
        });
        await getBackground();
      });
    }
  };


  const mCreateBackground = `
      mutation createBackground($clientMatterId: String, $date: String) {
        backgroundCreate(clientMatterId: $clientMatterId, date: $date) {
          id
        }
      }
  `;

  const handleAddRow = async () => {
    const dateToday = new Date().getFullYear()+"/"+(new Date().getMonth()+1)+"/"+new Date().getDate();
    const createBackgroundRow = await API.graphql({
      query: mCreateBackground,
      variables: {
        clientMatterId: matterId,
        date: dateToday
      },
    });

    await getBackground();
  };

  return (
    <>
      <div className="grid grid-rows grid-flow-col pt-5">
        <div className="col-span-6 ">
          <input
            name="check_all"
            id="check_all"
            aria-describedby="checkbox-1"
            type="checkbox"
            checked={checkAllState}
            onChange={(e) => handleCheckAllChange(e.target.checked)}
            className="w-4 h-4 text-blue-600 bg-gray-100 rounded border-gray-300 focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
          />

          <button
            onClick={handleAddRow}
            type="button"
            className="bg-green-400 hover:bg-green-500 text-white text-sm py-2 px-4 rounded inline-flex items-center border-0 shadow outline-none focus:outline-none focus:ring mx-2"
          >
            Add row
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-4 w-4 mx-1"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v3m0 0v3m0-3h3m-3 0H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </button>
          <button
            type="button"
            onClick={() => handleDelete(idList)}
            className="bg-red-400 hover:bg-red-500 text-white text-sm py-2 px-4 rounded inline-flex items-center border-0 shadow outline-none focus:outline-none focus:ring ml-2"
          >
            Delete
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z"
                clipRule="evenodd"
              />
            </svg>
          </button>
        </div>
        <div className="col-span-3">
          {/*Add Search*/}
        </div>
      </div>
      {showToast && (
        <ToastNotification title={alertMessage} hideToast={hideToast} />
      )}
    </>
  );
};

export default ActionButtons;
