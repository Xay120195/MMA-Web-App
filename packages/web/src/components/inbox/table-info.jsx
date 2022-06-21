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

const alertmessage = {
  border: "2px solid #1FC2E4",
  marginLeft: "0.6rem",
  width: "81.5rem",
  marginBottom: "1rem",
  color: "#1FC2E4",
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
  totalChecked,
  selectedMessage,
  setSelectMessage,
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
      setSelectMessage(true);
    } else {
      setIdRead((item) => [...item.filter((x) => x !== event.target.value)]);
      setSelectMessage(false);
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
      setSelectMessage(true);
      if (!unReadData.includes({ id: event.target.value })) {
        setIdUnread((item) => [...item, event.target.value]);
      }
    } else {
      setIdUnread((item) => [...item.filter((x) => x !== event.target.value)]);
      setSelectMessage(false);
    }
  };

  return (
    <>
    </>
  );
};

export default TableInfo;
