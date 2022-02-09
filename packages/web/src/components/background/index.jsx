import React, { useState, useEffect } from "react";
import { API } from "aws-amplify";

const contentDiv = {
  margin: "0 0 0 65px",
};

const mainGrid = {
  display: "grid",
  gridtemplatecolumn: "1fr auto",
};

const listBackground = `
query background($companyId: ID) {
  background(companyId: $companyId) {
    id
    description
  }
}
`;

const BackgroundList = async () => {
  let result;

  const clientId = localStorage.getItem("companyId");
  const backgroundList = await API.graphql({
      query: listBackground,
      variables: {
          companyId: clientId
      },
  });

  /*result = backgroundList.data.client.map(({ id, name }) => ({
    value: id,
    label: name,
  })).sort((a, b) => a.label.localeCompare(b.label));*/

  console.log(backgroundList);
};

const handleNewAddRow = () => {
  
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
            <button onClick={() => handleNewAddRow()} >Add Background</button>
          </div>
        </div>
      </div>
    </div>
  </>
  )
}
