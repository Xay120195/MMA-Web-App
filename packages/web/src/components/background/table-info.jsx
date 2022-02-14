import React, { useState, useEffect, useRef } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import ContentEditable from "react-contenteditable";
import ToastNotification from "../toast-notification";
import EmptyRow from "./empty-row";
import Modal from "./modal";

const TableInfo = ({
  witness,
  setIdList,
  setWitness,
  checkAllState,
  setcheckAllState,
  checkedState,
  setCheckedState,
  settotalChecked,
  totalChecked,
  search,
  getId,
  setId,
}) => {
  const [showToast, setShowToast] = useState(false);
  const [alertMessage, setalertMessage] = useState();
  const [showUpload, setShowUpload] = useState(false);
  const [loading, setLoading] = useState(true);

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
      if (!witness.includes({ id: event.target.value })) {
        setId((item) => [...item, event.target.value]);
      }
    } else {
      setId((item) => [...item.filter((x) => x !== event.target.value)]);
    }
  };
  console.log(witness);
  useEffect(() => {
    setTimeout(() => {
      setLoading(false);
    }, 1000);
    setWitness(witness);

    setIdList(getId);
  }, [witness, getId]);

  const text = useRef("");

  const handleChange = (evt, id) => {
    text.current = evt.target.value;
    const updatedComments = witness.map((x) =>
      x.id === id ? { ...x, comments: text.current } : x
    );
    setWitness(updatedComments);
  };
  const handleChangeDate = (date, id) => {
    const updatedDate = witness.map((x) =>
      x.id === id ? { ...x, date: date } : x
    );
    setWitness(updatedDate);
    if (updatedDate) {
      setalertMessage(`Successfully updated`);
      setShowToast(true);
      setTimeout(() => {
        setShowToast(false);
      }, 3000);
    }
  };
  const HandleChangeToTD = (evt) => {
    setalertMessage(`Successfully updated`);
    setShowToast(true);
    setTimeout(() => {
      setShowToast(false);
    }, 3000);
  };

  return (
    <>
      <div
        className="flex flex-col"
        style={{ padding: "2rem", marginLeft: "4rem" }}
      >
        <div className="-my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
          <div className="py-2 align-middle inline-block min-w-full sm:px-6 lg:px-8">
            <div className="shadow overflow-hidden border-b border-gray-200 sm:rounded-lg">
              {witness.length <= 0 ? (
                <EmptyRow search={search} />
              ) : (
                <>
                  {loading ? (
                    <p className="py-2 px-2">Loading data...</p>
                  ) : (
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
                            className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                          >
                            Date
                          </th>
                          <th
                            scope="col"
                            className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                          >
                            Description of Background
                          </th>
                          <th
                            scope="col"
                            className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                          >
                            Document
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {witness.map((item, index) => (
                          <tr key={index}>
                            <td className="px-6 py-4 whitespace-nowrap w-20">
                              <div className="flex items-center ">
                                <input
                                  type="checkbox"
                                  value={`${item.id}`}
                                  name={`${item.id}`}
                                  id={`${item.id}`}
                                  className="cursor-pointer"
                                  checked={checkedState[index]}
                                  onChange={(event) =>
                                    handleCheckboxChange(index, event)
                                  }
                                />
                                <label
                                  htmlFor="checkbox-1"
                                  className="ml-3 text-sm font-medium text-gray-900 dark:text-gray-300"
                                >
                                  {item.id}
                                </label>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap w-64">
                              <div>
                                <DatePicker
                                  className="border py-1 px-1 rounded border-gray-300"
                                  selected={new Date(item.date)}
                                  onChange={(date) =>
                                    handleChangeDate(date, item.id)
                                  }
                                />
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <ContentEditable
                                html={item.comments.substring(0, 40)}
                                onChange={(evt) => handleChange(evt, item.id)}
                                onBlur={HandleChangeToTD}
                              />
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 w-80">
                              <button
                                type="submit"
                                onClick={() => setShowUpload(true)}
                                className="mt-2 w-full bg-green-400 border border-transparent rounded-md py-2 px-4 flex items-center justify-center text-base font-medium text-white hover:bg-green-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                              >
                                Upload
                                <svg
                                  xmlns="http://www.w3.org/2000/svg"
                                  className="h-6 w-6 m"
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

                              <div className="mt-1 flex item-center mt-3">
                                <input
                                  type="text"
                                  id="email-adress-icon"
                                  className="relative bg-gray-50 border border-dashed border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full pl-10 p-2.5  dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                                  placeholder="name@flowbite.com"
                                />

                                <div className="pt-2 pl-2">
                                  <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    width="24"
                                    height="24"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="#000000"
                                    strokeWidth="2"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                  >
                                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                                    <circle cx="12" cy="12" r="3"></circle>
                                  </svg>
                                </div>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}
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
