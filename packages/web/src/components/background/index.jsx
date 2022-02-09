import React, { } from "react";

const contentDiv = {
  margin: "0 0 0 65px",
};

const mainGrid = {
  display: "grid",
  gridtemplatecolumn: "1fr auto",
};

export default function Background() {
  return (
  <>
    <div className={
            "p-5 relative flex flex-col min-w-0 break-words mb-6 shadow-lg rounded bg-white"
          }
          style={contentDiv}
    >
      <div className="relative flex-grow flex-1">
        <div style={mainGrid} >
          <div>
            <span className={"text-sm mt-3 font-medium"}>
              Background
            </span>
          </div>
        </div>
      </div>
    </div>
  </>
  )
}
