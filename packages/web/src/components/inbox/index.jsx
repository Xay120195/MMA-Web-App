import React, { useState, useEffect, useReducer } from "react";
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

const ACTIONS = {
  DELETE_DATA: "delete_data",
  SAVE_READ: "save_read",
  MARK_UNREAD: "mark_unread",
  SEARCH_MESSAGE: "search_message",
};

const reducer = (data, action) => {
  switch (action.type) {
    case ACTIONS.DELETE_DATA:
      return data.filter((item) => !action.payload.id.includes(item.id));
    case ACTIONS.SAVE_READ:
      return [...data, action.payload.data];
    case ACTIONS.MARK_UNREAD:
      return [...data, action.payload.data];
    case ACTIONS.SEARCH_MESSAGE:
      return inbox.filter(
        (x) =>
          x.title.includes(action.payload.data) ||
          x.firstname.includes(action.payload.data) ||
          x.lastname.includes(action.payload.data) ||
          x.email.includes(action.payload.data)
      );
    default:
      return data;
  }
};

const Inbox = () => {
  const [data, dispatch] = useReducer(reducer, inbox);
  const [totalChecked, setTotalChecked] = useState(0);
  const [totalReadChecked, setTotalReadChecked] = useState(0);
  const [totalUnReadChecked, setTotalUnReadChecked] = useState(0);
  const [getId, setId] = useState([]);
  const [getIdUnread, setIdUnread] = useState([]);
  const [getIdRead, setIdRead] = useState([]);
  const [checkAllState, setcheckAllState] = useState(false);
  const [unReadData, setUnreadData] = useState([]);
  const [readData, setReadData] = useState([]);
  const [search, setSearch] = useState("");
  const [searchRow, setSearchRow] = useState(false);

  const unreaddata = data.filter((datas) => datas.status === "unread");
  const readdata = data.filter((datas) => datas.status === "read");

  const [checkedStateRead, setCheckedStateRead] = useState(
    new Array(readdata.length).fill(false)
  );

  const [checkedStateUnRead, setCheckedStateUnreRead] = useState(
    new Array(unreaddata.length).fill(false)
  );

  useEffect(() => {
    if (data.length === totalChecked) {
      setcheckAllState(true);
    } else {
      setcheckAllState(false);
    }
    setTotalChecked(totalReadChecked + totalUnReadChecked);
    setUnreadData(unreaddata);
    setReadData(readdata);
  }, [checkedStateRead, checkedStateUnRead, data, totalChecked]);

  const handleSearch = (event) => {
    setSearch(event.target.value);
    var dm = event.target.value;
    var str = dm.toString();

    dispatch({
      type: ACTIONS.SEARCH_MESSAGE,
      payload: { data: str },
    });

    if (!dm) {
      setSearchRow(false);
    } else {
      setSearchRow(true);
    }
  };

  return (
    <>
      <div
        className="p-5 relative flex flex-col min-w-0 break-words mb-6 shadow-lg rounded bg-white"
        style={contentDiv}
      >
        <div style={mainGrid}>
          <div className="grid grid-rows grid-flow-col">
            <div className="col-span-11 ">
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
            </div>
            <div className="col-span-1">
              <input
                type="text"
                value={search}
                onChange={(event) => handleSearch(event)}
                placeholder="Search message......"
                className="mt-3 appearance-none rounded-none relative block w-96 px-3 py-2 border border-green-300 placeholder-green-500 text-green-900 rounded-t-md focus:outline-none focus:ring-green-500 focus:border-green-500 focus:z-10 sm:text-sm"
              />
            </div>
          </div>
          <ActionButtons
            data={data}
            ACTIONS={ACTIONS}
            dispatch={dispatch}
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
            checkAllState={checkAllState}
            setcheckAllState={setcheckAllState}
            setId={setId}
            getId={getId}
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
        searchRow={searchRow}
        setSearchRow={setSearchRow}
      />
    </>
  );
};

export default Inbox;
