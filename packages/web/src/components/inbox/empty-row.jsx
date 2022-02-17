import React from "react";
import NoData from "../../assets/images/no-data.svg";

const EmptyRow = ({ searchRow, text, text2, text3 }) => {
  return (
    <div className="flex item-center">
      <div className="flex-none w-100 h-100 ">
        <img src={NoData} alt="empty" className="w-36 m-10" />
      </div>

      <div className="flex-none w-full h-full">
        <p style={{ marginTop: "4rem", fontWeight: "bold", fontSize: "3rem" }}>
          {!searchRow ? text : `Cannot found in your ${text3}`}
        </p>
        <p>{!searchRow ? text2 : "Search not found for this query"}</p>
      </div>
    </div>
  );
};

export default EmptyRow;
