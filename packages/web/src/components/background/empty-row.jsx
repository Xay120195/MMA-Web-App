import React from "react";
import NoData from "../../assets/images/no-data.svg";

const EmptyRow = ({ search }) => {
  return (
    <div className="flex item-center">
      <div className="flex-none w-100 h-100 ">
        <img src={NoData} alt="empty" className="w-36 m-10" />
      </div>

      <div className="flex-none w-full h-full">
        <p style={{ marginTop: "4rem", fontWeight: "bold", fontSize: "3rem" }}>
          {!search ? "You haven't added anything yet" : "Not found"}
        </p>
        <p>
          {!search ? (
            <>
              Click the <span style={{ color: "rgb(2 132 199)" }}>Add row</span>{" "}
              button above to start adding one now
            </>
          ) : (
            "Search not found for this query"
          )}
        </p>
      </div>
    </div>
  );
};

export default EmptyRow;
