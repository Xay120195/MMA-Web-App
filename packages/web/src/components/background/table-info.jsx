import React, { useState, useEffect, useRef } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { Link } from "react-router-dom";
import { AppRoutes } from "../../constants/AppRoutes";
import ContentEditable from "react-contenteditable";
import ToastNotification from "../toast-notification";
import EmptyRow from "./empty-row";
import Modal from "./modal";
import { API } from "aws-amplify";

const TableInfo = ({
  witness,
  setIdList,
  setWitness,
  checkAllState,
  setcheckAllState,
  checkedState,
  setCheckedState,
  settotalChecked,
  search,
  getId,
  setId,
  getBackground,
  matterId,
}) => {
  const [showToast, setShowToast] = useState(false);
  const [alertMessage, setalertMessage] = useState();
  const [showUpload, setShowUpload] = useState(false);
  const [loading, setLoading] = useState(true);
  const [sDate, setsDate] = useState(new Date());

  const hideToast = () => {
    setShowToast(false);
  };

  const handleCheckboxChange = (position, event) => {
    const updatedCheckedState = checkedState.map((item, index) =>
      index === position ? !item : item
    );

    setCheckedState(updatedCheckedState);

    let tc = updatedCheckedState.filter((v) => v === true).length;
    settotalChecked(tc);

    if (tc !== witness.length) {
      if (checkAllState) {
        setcheckAllState(false);
      }
    } else {
      if (!checkAllState) {
        setcheckAllState(true);
      }
    }
    if (event.target.checked) {
      if (!witness.includes({ id: event.target.name })) {
        setId((item) => [...item, event.target.name]);
      }
    } else {
      setId((item) => [...item.filter((x) => x !== event.target.name)]);
    }
  };

  useEffect(() => {
    setTimeout(() => {
      setLoading(false);
    }, 1000);

    setIdList(getId);
  }, [getId]);

  const textDescription = useRef("");

  const handleChangeDesc = (evt) => {
    textDescription.current = evt.target.value;
  };

  const handleChangeDate = async (selected, id, description) => {
    const data = {
      description: !description ? "" : description,
      date: String(selected),
    };
    await updateBackgroundDetails(id, data);
    getBackground();
  };

  const HandleChangeToTD = async (id, description, date) => {
    const filterDescription = !description ? "" : description;
    const outputDescription = textDescription.current;
    const finalDescription = outputDescription;
    const data = {
      description: !textDescription.current
        ? filterDescription
        : finalDescription,
      date: !date ? "" : date,
    };
    await updateBackgroundDetails(id, data);
    getBackground();
  };

  const mUpdateBackground = `
    mutation updateBackground($id: ID, $description: String, $date: String) {
      backgroundUpdate(id: $id, description: $description, date: $date) {
        id
        description
        date
      }
    }
  `;

  async function updateBackgroundDetails(id, data) {
    return new Promise((resolve, reject) => {
      try {
        const request = API.graphql({
          query: mUpdateBackground,
          variables: {
            id: id,
            date: data.date,
            description: data.description,
          },
        });

        if(stripedTags(data.description) !== ""){
          setalertMessage(`Successfully updated`);
          setCheckedState(new Array(witness.length).fill(false));
          setShowToast(true);
          setTimeout(() => {
            setShowToast(false);
          }, 2000);
        }

        console.log(request);
        resolve(request);
      } catch (e) {
        reject(e.errors[0].message);
      }
    });
  }

  function sortByDate(arr) {
    arr.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
    return arr;
  }

  function stripedTags(str) {
    const stripedStr = str.replace(/<[^>]+>/g, '');
    return stripedStr;
  }

  return (
    <>
      <div
        className="flex flex-col"
        style={{ padding: "2rem", marginLeft: "4rem" }}
      >
        <div className="-my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
          <div className="py-2 align-middle inline-block min-w-full sm:px-6 lg:px-8">
            <div className="shadow overflow-hidden border-b border-gray-200 sm:rounded-lg">
              {witness.length === 0 ? (
                <EmptyRow search={search} />
              ) : (
                <>
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th
                          scope="col"
                          className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                        >
                          No
                        </th>
                        <th
                          scope="col"
                          className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                        >
                          Date
                        </th>
                        <th
                          scope="col"
                          className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                        >
                          Description of Background
                        </th>
                        <th
                          scope="col"
                          className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                        >
                          Document
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {sortByDate(witness).map((item, index) => (
                        <tr key={item.id} className="h-full">
                          <td className="px-3 py-3 w-10">
                            <div className="flex items-center ">
                              <input
                                type="checkbox"
                                name={item.id}
                                className="cursor-pointer w-10"
                                checked={checkedState[index]}
                                onChange={(event) =>
                                  handleCheckboxChange(index, event)
                                }
                              />
                              <label
                                htmlFor="checkbox-1"
                                className="text-sm font-medium text-gray-900 dark:text-gray-300"
                              >
                                {index + 1}
                              </label>
                            </div>
                          </td>

                          <td className="px-3 py-3">
                            <div>
                              <DatePicker
                                className="border w-28 rounded border-gray-300"
                                selected={
                                  !item.date ? sDate : new Date(item.date)
                                }
                                onChange={(selected) =>
                                  handleChangeDate(
                                    selected,
                                    item.id,
                                    item.description
                                  )
                                }
                              />
                            </div>
                          </td>
                          <td className="w-full px-6 py-4">
                            <ContentEditable
                              html={
                                !item.description
                                  ? `<p></p>`
                                  : `<p>${item.description}</p>`
                              }
                              className="w-full p-2"
                              onChange={(evt) => handleChangeDesc(evt)}
                              onBlur={() =>
                                HandleChangeToTD(
                                  item.id,
                                  item.description,
                                  item.date
                                )
                              }
                            />
                          </td>
                          <td className="py-2 px-3 w-80 text-sm text-gray-500">
                            <Link
                              className=" w-60 bg-green-400 border border-transparent rounded-md py-2 px-4 mr-3 flex items-center justify-center text-base font-medium text-white hover:bg-green-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                              to={`${AppRoutes.FILEBUCKET}/${matterId}`}
                            >
                              File Bucket
                            </Link>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
      {showUpload && <Modal setShowUpload={setShowUpload} />}
      {showToast && (
        <ToastNotification title={alertMessage} hideToast={hideToast} />
      )}
    </>
  );
};

export default TableInfo;
