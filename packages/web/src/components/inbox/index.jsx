import React, { useState, useEffect, useReducer } from "react";
import { inbox } from "./data-source";
import ActionButtons from "./action-buttons";
import TableInfo from "./table-info";
import GoogleBtn from './google-btn';
import { gapi } from 'gapi-script';
import googleLogin from "../../assets/images/google-login.png";

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
  const [selectedMessage, setSelectMessage] = useState(false);

  const unreaddata = data.filter((datas) => datas.status === true);
  const readdata = data.filter((datas) => datas.status === false);

  const [checkedStateRead, setCheckedStateRead] = useState(
    new Array(readdata.length).fill(false)
  );

  const [checkedStateUnRead, setCheckedStateUnreRead] = useState(
    new Array(unreaddata.length).fill(false)
  );
  console.log(getId);

  useEffect(() => {
    setTotalChecked(totalReadChecked + totalUnReadChecked);
    setUnreadData(unreaddata);
    setReadData(readdata);
  }, [checkedStateRead, checkedStateUnRead, data]);

  useEffect(() => {
    gapi.load('client:auth2', start);
  });

  function start() {
    gapi.client.init({
      client_id: process.env.REACT_APP_GOOGLE_CLIENT_ID,
      scope: ""
    })
  }

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
  
  const [loginData, setLoginData] = useState(
    localStorage.getItem('signInData')
      ? JSON.parse(localStorage.getItem('signInData'))
      : null
  );

  console.log("Google login: ", loginData);

  return (
    <>
      { !loginData ?
      <div
        className="pl-5 relative flex flex-col min-w-0 break-words rounded bg-white"
        style={contentDiv}
      >
        <div className="h-screen flex-1">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-10 relative">
            <div className="col-span-3 pl-8 pt-20">
              <h5 className="text-black text-2xl font-bold">AFFIDAVITS & RFI</h5>
              <div className="text-black text-xl font-normal my-5 leading-10">
                Looks like you're not yet connected with your Google Account
              </div>
              <div className="text-gray-400 text-lg font-medium">
                Lets make your trip fun and simple
              </div><br/>
              <GoogleBtn />
            </div>
            <div className="col-span-7">
              <div className="h-screen float-right">
                <img src={googleLogin} alt="" className="h-full" />
              </div>
            </div>
          </div>
        </div>
      </div>

        : 

      <div
        className="p-5 relative flex flex-col min-w-0 break-words mb-6 shadow-lg rounded bg-white"
        style={contentDiv}
      >

        <div class="bg-white shadow-sm  px-5 py-5 grid grid-cols-1  md:grid-cols-8 justify-between items-center">
          <div class="col-span-3 xl:col-span-4">
            <div class=" text-gray-700 text-2xl font-medium">Inbox</div>
            <div class=" flex  gap-x-2 mt-3">
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
            </div>
          </div>
          
          <div class="col-span-5 xl:col-span-4 flex ">
            <div class="flex flex-wrap  flex-grow relative h-13 bg-white border items-center rounded-md">
              <div class="flex -mr-px justify-center w-10 pl-2">
                <span class="flex items-center leading-normal bg-white px-3 border-0 rounded rounded-r-none text-2xl text-gray-600"><svg width="12" height="20" viewBox="0 0 13 13" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M11.8828 11.8672L8.55469 8.5625C9.30469 7.69531 9.72656 6.59375 9.72656 5.375C9.72656 2.70312 7.52344 0.5 4.85156 0.5C2.15625 0.5 0 2.70312 0 5.375C0 8.07031 2.17969 10.25 4.85156 10.25C6.04688 10.25 7.14844 9.82812 8.01562 9.07812L11.3203 12.4062C11.4141 12.4766 11.5078 12.5 11.625 12.5C11.7188 12.5 11.8125 12.4766 11.8828 12.4062C12.0234 12.2656 12.0234 12.0078 11.8828 11.8672ZM4.875 9.5C2.57812 9.5 0.75 7.64844 0.75 5.375C0.75 3.10156 2.57812 1.25 4.875 1.25C7.14844 1.25 9 3.10156 9 5.375C9 7.67188 7.14844 9.5 4.875 9.5Z" fill="#8A8A8A"></path></svg>
                </span>
              </div>
                <input type="text" class="flex-shrink flex-grow leading-normal w-px flex-1 border-0 h-10 border-grey-light rounded rounded-l-none px-3 self-center relative text-sm outline-none" placeholder="Type to search all emails ..." />
                  <button class="transition duration-500 ease-in-out bg-gray-600 p-2 px-3 h-full active:bg-gray-400  rounded-md"><svg xmlns="http://www.w3.org/2000/svg" width="16" height="auto" viewBox="0 0 12 10.875" class="text-gray-500"><path id="Path_1" data-name="Path 1" d="M.375,2.125H3.211A1.71,1.71,0,0,0,4.875,3.438,1.679,1.679,0,0,0,6.516,2.125h5.109A.385.385,0,0,0,12,1.75a.4.4,0,0,0-.375-.375H6.516a1.7,1.7,0,0,0-3.3,0H.375A.385.385,0,0,0,0,1.75.37.37,0,0,0,.375,2.125ZM4.875.813a.94.94,0,0,1,.938.938.925.925,0,0,1-.937.938.912.912,0,0,1-.937-.937A.925.925,0,0,1,4.875.813Zm6.75,4.313H9.516a1.7,1.7,0,0,0-3.3,0H.375A.385.385,0,0,0,0,5.5a.37.37,0,0,0,.375.375H6.211A1.71,1.71,0,0,0,7.875,7.188,1.679,1.679,0,0,0,9.516,5.875h2.109A.385.385,0,0,0,12,5.5.4.4,0,0,0,11.625,5.125ZM7.875,6.438A.912.912,0,0,1,6.938,5.5a.925.925,0,0,1,.938-.937.94.94,0,0,1,.938.938A.925.925,0,0,1,7.875,6.438Zm3.75,2.438H5.766a1.7,1.7,0,0,0-3.3,0H.375A.385.385,0,0,0,0,9.25a.37.37,0,0,0,.375.375H2.461a1.71,1.71,0,0,0,1.664,1.313A1.679,1.679,0,0,0,5.766,9.625h5.859A.385.385,0,0,0,12,9.25.4.4,0,0,0,11.625,8.875Zm-7.5,1.313a.912.912,0,0,1-.937-.937.925.925,0,0,1,.938-.937.94.94,0,0,1,.938.938A.925.925,0,0,1,4.125,10.188Z" transform="translate(0 -0.063)" fill="#fff"></path></svg>
                  </button>
                </div>
                  <div class="ml-5">
                    <GoogleBtn />
                  </div>
                  </div>
                  </div>

        <div style={mainGrid}>
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
            getIdUnread={getIdUnread}
            getIdRead={getIdRead}
            checkAllState={checkAllState}
            setcheckAllState={setcheckAllState}
            setId={setId}
            getId={getId}
            setTotalChecked={setTotalChecked}
            setSelectMessage={setSelectMessage}
          />
        </div>

        <div className="h-screen flex-1 bg-gray-50">
        <div className="p-3">
          <div className="flex justify-between">
            <ul className="flex gap-x-3">
              <li
                className={`flex gap-x-2  items-center py-2 px-5 cursor-pointer `}
              >
                <span className="">Unsaved</span>
                <span className="rounded-2xl border-2 px-3 py-0 bg-gray-50 mr-3">
                  21
                </span>
              </li>
              <li
                className={`flex gap-x-2 items-center py-2 px-5 cursor-pointer `}
              >
                <span className="">Saved</span>
                <span className="rounded-2xl border-2 px-3 py-0 bg-gray-50  mr-3">
                  33
                </span>
              </li>
            </ul>
            
              <button
                className="text-white bg-[#4EB474] rounded  px-[10px] py-[8px] mb-[7px]"
              >
                Save Email
              </button>
            
              <button
                className="text-white bg-[#4EB474] rounded  px-[10px] py-[8px] mb-[7px]"
              >
                Unsave Email
              </button>
          </div>
          <div
            className={`bg-white rounded-xl`}
          >
            {/*** Content Table here */}
          </div>
        </div>
      </div>

      <TableInfo
          data={data}
          totalChecked={totalChecked}
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
          searchRow={searchRow}
          setSearchRow={setSearchRow}
          selectedMessage={selectedMessage}
          setSelectMessage={setSelectMessage}
        />

      </div>
      }
    </>
  );
};

export default Inbox;
