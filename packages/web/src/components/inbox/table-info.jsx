import React, { useState } from "react";
import moment from "moment";
import EmptyRow from "./empty-row";

const greenDot = {
  height: "20px",
  width: "20px",
  backgroundColor: "rgb(0,255,127)",
  borderRadius: "50%",
  display: "inline-block",
  marginTop: "2.2em",
  marginLeft: "0.6rem",
};

const countArray = (array) => {
  var result = [];
  for (var prop in array) {
    if (array.hasOwnProperty(prop)) {
      result++;
    }
  }
  return result;
};

const redDot = {
  height: "20px",
  width: "20px",
  backgroundColor: "rgb(234, 83, 83)",
  borderRadius: "50%",
  display: "inline-block",
  marginTop: "2.2em",
  marginLeft: "0.6rem",
};
const getDay = (date) => {
  const d = new Date(date);
  let day = d.getDate();
  return day;
};

const TableInfo = ({
  setTotalReadChecked,
  setTotalUnReadChecked,
  unReadData,
  readData,
  checkedStateRead,
  setCheckedStateRead,
  checkedStateUnRead,
  setCheckedStateUnreRead,
  setIdUnread,
  data,
  setIdRead,
  searchRow,
}) => {
  const [active, setActive] = useState("");
  const [click, setClick] = useState(false);

  const showHiddenMessage = (id) => {
    const datas = data.find((bs) => bs.id === id);
    if (datas && click) {
      setClick(false);
      setActive(datas.id);
    } else {
      setClick(true);
      setActive(datas.id);
    }
  };

  const handleOnChangeRead = (position, event) => {
    const updatedCheckedState = checkedStateRead.map((item, index) =>
      index === position ? !item : item
    );

    setCheckedStateRead(updatedCheckedState);

    let tc = updatedCheckedState.filter((v) => v === true).length;
    setTotalReadChecked(tc);

    if (event.target.checked) {
      if (!readData.includes({ id: event.target.value })) {
        setIdRead((item) => [...item, event.target.value]);
      }
    } else {
      setIdRead((item) => [...item.filter((x) => x !== event.target.value)]);
    }
  };

  const handleOnChangeUnRead = (position, event) => {
    const updatedCheckedState = checkedStateUnRead.map((item, index) =>
      index === position ? !item : item
    );

    setCheckedStateUnreRead(updatedCheckedState);

    let tc = updatedCheckedState.filter((v) => v === true).length;
    setTotalUnReadChecked(tc);

    if (event.target.checked) {
      if (!unReadData.includes({ id: event.target.value })) {
        setIdUnread((item) => [...item, event.target.value]);
      }
    } else {
      setIdUnread((item) => [...item.filter((x) => x !== event.target.value)]);
    }
  };

  return (
    <div style={{ padding: "1.5rem", marginLeft: "4rem" }}>
      <div className="mb-3">
        <span className="py-4 px-4 font-bold">Unread</span>
      </div>
      {unReadData.length === 0 ? (
        <EmptyRow
          searchRow={searchRow}
          text="You havent unread message yet"
          text2="No unread emails in your inbox"
          text3="Unread Message"
        />
      ) : (
        <div className="flex flex-col ">
          <div className="mx-3">
            <div className="py-2 align-middle inline-block ">
              {unReadData.map((item, index) => (
                <div className="shadow overflow-hidden border-b border-gray-200 sm:rounded-lg mb-3 divide-y">
                  <div className="flex py-2 px-2" key={item.id}>
                    <div className="flex-none w-12 h-14 ">
                      <div className="py-6 px-6 mt-2">
                        <input
                          type="checkbox"
                          value={item.id}
                          name={item.id}
                          id={item.id}
                          onClick={() => setClick(false)}
                          className="cursor-pointer"
                          checked={checkedStateUnRead[index]}
                          onChange={(event) =>
                            handleOnChangeUnRead(index, event)
                          }
                        />
                      </div>
                    </div>
                    <div className="flex-none w-10">
                      <span
                        style={item.save === true ? greenDot : redDot}
                      ></span>
                    </div>
                    <div className="flex-none w-15">
                      <div className="mt-2 mb-2 bg-gray-200 py-2 px-2 mx-2 border-b sm:rounded-lg text-center">
                        <p className="text-lg ">{getDay(item.date)}</p>

                        <p style={{ fontSize: "12px" }}>
                          {moment(item.date).format("MMM")}
                        </p>
                      </div>
                    </div>
                    <div className="flex-none w-20 py-6 px-6">
                      <div className="avatar-grid">
                        <div className="avatar">
                          {String(item.firstname).charAt(0)}
                          {String(item.lastname).charAt(0)}
                        </div>
                      </div>
                    </div>
                    <div
                      className="flex-none py-5 px-5"
                      style={{ width: "45rem" }}
                    >
                      <span className="font-bold">
                        {item.fwd ? "FWD: " : "NEW: "}
                        {item.title}
                      </span>
                      <br />
                      <span className="inline-flex">
                        {item.firstname} {item.lastname} {`<${item.email}>`} |{" "}
                        {moment(item.date).format("MMMM Do YYYY, h:mm:ss a")}
                        {item.attachments && (
                          <>
                            {" "}
                            |
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              className="h-4 w-4"
                              style={{ color: "rgb(10, 181, 208)" }}
                              viewBox="0 0 20 20"
                              fill="currentColor"
                            >
                              <path
                                fillRule="evenodd"
                                d="M8 4a3 3 0 00-3 3v4a5 5 0 0010 0V7a1 1 0 112 0v4a7 7 0 11-14 0V7a5 5 0 0110 0v4a3 3 0 11-6 0V7a1 1 0 012 0v4a1 1 0 102 0V7a3 3 0 00-3-3z"
                                clipRule="evenodd"
                              />
                            </svg>
                            <span style={{ color: "rgb(10, 181, 208)" }}>
                              {countArray(item.attachments)}
                            </span>
                          </>
                        )}
                      </span>
                    </div>
                    <div
                      className="flex-none p-2 px-2 "
                      style={{ width: "19rem" }}
                    >
                      {item.tags.map((item) => (
                        <>
                          <span className="flex-inline">
                            <span className="bg-blue-50  mx-1 sm:rounded-lg px-1">
                              {item.name}
                            </span>
                          </span>
                        </>
                      ))}
                    </div>
                    <div className="flex-none w-10 px-2">
                      <button
                        onClick={() => showHiddenMessage(item.id)}
                        className=" cursor-pointer"
                      >
                        {item.id === active && click ? (
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-6 w-6"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M5 15l7-7 7 7"
                            />
                          </svg>
                        ) : (
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-6 w-6"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M19 9l-7 7-7-7"
                            />
                          </svg>
                        )}
                      </button>
                    </div>
                  </div>
                  <div>
                    {item.id === active && click && (
                      <>
                        <p className="font-bold mt-3 px-5">
                          {item.firstname} {item.lastname}
                        </p>
                        <p className="px-5">
                          {moment(item.date).format("MMMM Do YYYY, h:mm:ss a")}
                        </p>
                        <p className="py-5 px-5">{item.message}</p>
                        {item.fwd && (
                          <p className="py-5 px-5">
                            ---------Forwarded message---------
                            <p>
                              <span className="font-bold">From: </span>
                              {item.email}
                            </p>
                            <p>
                              <span className="font-bold">Date: </span>
                              {moment(item.date).format(
                                "MMMM Do YYYY, h:mm:ss a"
                              )}
                            </p>
                            <p>
                              <span className="font-bold">Subject: </span>
                              {item.title}
                            </p>
                            <p>
                              <span className="font-bold">To: </span>
                              {item.toEmail}
                            </p>
                          </p>
                        )}
                      </>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
      <div className="mb-3 mt-8">
        <span className="py-4 px-4 font-bold">Inbox</span>
      </div>
      {readData.length === 0 ? (
        <EmptyRow
          searchRow={searchRow}
          text="You havent inbox yet"
          text2="No emails in your inbox"
          text3="Inbox"
        />
      ) : (
        <div className="flex flex-col">
          <div className="mx-3">
            <div className="py-2 align-middle inline-block ">
              {readData.map((item, index) => (
                <div className="shadow overflow-hidden border-b border-gray-200 sm:rounded-lg mb-3 ">
                  <div className="flex py-2 px-2" key={item.id}>
                    <div className="flex-none w-12 h-14 ">
                      <div className="py-6 px-6 mt-2">
                        <input
                          type="checkbox"
                          value={item.id}
                          name={item.id}
                          id={item.id}
                          className="cursor-pointer"
                          checked={checkedStateRead[index]}
                          onChange={(event) => handleOnChangeRead(index, event)}
                        />
                      </div>
                    </div>
                    <div className="flex-none w-10">
                      <span
                        style={item.save === true ? greenDot : redDot}
                      ></span>
                    </div>
                    <div className="flex-none w-15">
                      <div className="mt-2 mb-2 bg-gray-200 py-2 px-2 mx-2 border-b sm:rounded-lg text-center">
                        <p className="text-lg ">{getDay(item.date)}</p>

                        <p style={{ fontSize: "12px" }}>
                          {moment(item.date).format("MMM")}
                        </p>
                      </div>
                    </div>
                    <div className="flex-none w-20 py-6 px-6">
                      <div className="avatar-grid">
                        <div className="avatar">
                          {String(item.firstname).charAt(0)}
                          {String(item.firstname).charAt(0)}
                        </div>
                      </div>
                    </div>
                    <div
                      className="flex-none py-5 px-5"
                      style={{ width: "45rem" }}
                    >
                      <span className="font-bold">
                        {item.fwd ? "FWD: " : "NEW: "}
                        {item.title}
                      </span>
                      <br />
                      <span className="inline-flex">
                        {item.firstname} {item.lastname} {`<${item.email}>`}{" "}
                        |&nbsp;
                        {moment(item.date).format("MMMM Do YYYY, h:mm:ss a")}
                        {item.attachments && (
                          <>
                            {" "}
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              className="h-4 w-4"
                              style={{ color: "rgb(10, 181, 208)" }}
                              viewBox="0 0 20 20"
                              fill="currentColor"
                            >
                              <path
                                fillRule="evenodd"
                                d="M8 4a3 3 0 00-3 3v4a5 5 0 0010 0V7a1 1 0 112 0v4a7 7 0 11-14 0V7a5 5 0 0110 0v4a3 3 0 11-6 0V7a1 1 0 012 0v4a1 1 0 102 0V7a3 3 0 00-3-3z"
                                clipRule="evenodd"
                              />
                            </svg>
                            <span style={{ color: "rgb(10, 181, 208)" }}>
                              {countArray(item.attachments)}
                            </span>
                          </>
                        )}
                      </span>
                    </div>
                    <div
                      className="flex-none  p-2 px-2 "
                      style={{ width: "19rem" }}
                    >
                      {item.tags.map((item) => (
                        <>
                          <span className="flex-inline">
                            <span className="bg-blue-50  mx-1 sm:rounded-lg px-1">
                              {item.name}
                            </span>
                          </span>
                        </>
                      ))}
                    </div>
                    <div className="flex-none w-10 px-2">
                      <button
                        onClick={() => showHiddenMessage(item.id)}
                        className="cursor-pointer"
                      >
                        {item.id === active && click ? (
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-6 w-6"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M5 15l7-7 7 7"
                            />
                          </svg>
                        ) : (
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-6 w-6"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M19 9l-7 7-7-7"
                            />
                          </svg>
                        )}
                      </button>
                    </div>
                  </div>

                  <div>
                    {item.id === active && click && (
                      <>
                        <p className="font-bold mt-3 px-5">
                          {item.firstname} {item.lastname}
                        </p>
                        <p className="px-5">
                          {moment(item.date).format("MMMM Do YYYY, h:mm:ss a")}
                        </p>
                        <p className="py-5 px-5">{item.message}</p>
                        {item.fwd && (
                          <p className="py-5 px-5">
                            ---------Forwarded message---------
                            <p>
                              <span className="font-bold">From: </span>
                              {item.email}
                            </p>
                            <p>
                              <span className="font-bold">Date: </span>
                              {moment(item.date).format(
                                "MMMM Do YYYY, h:mm:ss a"
                              )}
                            </p>
                            <p>
                              <span className="font-bold">Subject: </span>
                              {item.title}
                            </p>
                            <p>
                              <span className="font-bold">To: </span>
                              {item.toEmail}
                            </p>
                          </p>
                        )}
                      </>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TableInfo;
