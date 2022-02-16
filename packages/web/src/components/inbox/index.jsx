import React, { useState, useEffect } from "react";
import { inbox } from "./data-source";
import ActionButtons from "./action-buttons";
import TableInfo from "./table-info";

const contentDiv = {
  margin: "0 0 0 65px",
};

const mainGrid = {
  display: "grid",
  gridtemplatecolumn: "1fr auto",
};

const Inbox = () => {
  const [data, setData] = useState(inbox);
  const [totalChecked, setTotalChecked] = useState(0);
  const [totalReadChecked, setTotalReadChecked] = useState(0);
  const [totalUnReadChecked, setTotalUnReadChecked] = useState(0);

  const [getIdUnread, setIdUnread] = useState([]);
  const [getIdRead, setIdRead] = useState([]);

  const [unReadData, setUnreadData] = useState([]);
  const [readData, setReadData] = useState([]);

  const unreaddata = data.filter((datas) => datas.status === "unread");
  const readdata = data.filter((datas) => datas.status === "read");

  const [checkedStateRead, setCheckedStateRead] = useState(
    new Array(readdata.length).fill(false)
  );

  const [checkedStateUnRead, setCheckedStateUnreRead] = useState(
    new Array(unreaddata.length).fill(false)
  );
  console.log(data);
  useEffect(() => {
    setTotalChecked(totalReadChecked + totalUnReadChecked);
    setUnreadData(unreaddata);
    setReadData(readdata);
  }, [checkedStateRead, checkedStateUnRead, data]);

  return (
    <>
      <div
        className="p-5 relative flex flex-col min-w-0 break-words mb-6 shadow-lg rounded bg-white"
        style={contentDiv}
      >
        <div style={mainGrid}>
          <div className="mt-2">
            <span className="text-lg font-medium">Inbox</span>
          </div>
          <div className="mt-2">
            <span className="inline-flex text-sm">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                />
              </svg>
              <span className="mx-1">EMAILS</span>
            </span>
          </div>
          <ActionButtons
            data={data}
            totalChecked={totalChecked}
            setCheckedStateRead={setCheckedStateRead}
            setCheckedStateUnreRead={setCheckedStateUnreRead}
            readdata={readdata}
            unreaddata={unreaddata}
            setTotalReadChecked={setTotalReadChecked}
            setTotalUnReadChecked={setTotalUnReadChecked}
            totalChecked={totalChecked}
            getIdUnread={getIdUnread}
            getIdRead={getIdRead}
            data={data}
            setData={setData}
          />
        </div>
      </div>
      <TableInfo
        data={data}
        setTotalChecked={setTotalChecked}
        totalReadChecked={totalReadChecked}
        setTotalReadChecked={setTotalReadChecked}
        totalUnReadChecked={totalUnReadChecked}
        setTotalUnReadChecked={setTotalUnReadChecked}
        checkedStateRead={checkedStateRead}
        setCheckedStateRead={setCheckedStateRead}
        checkedStateUnRead={checkedStateUnRead}
        setCheckedStateUnreRead={setCheckedStateUnreRead}
        unReadData={unReadData}
        readData={readData}
        readdata={readdata}
        unreaddata={unreaddata}
        setUnreadData={setUnreadData}
        setReadData={setReadData}
        getIdUnread={getIdUnread}
        setIdUnread={setIdUnread}
        setIdRead={setIdRead}
        getIdRead={getIdRead}
        data={data}
        setData={setData}
      />
    </>
  );
};

export default Inbox;
