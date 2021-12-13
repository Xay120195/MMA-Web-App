import React from "react";
// import { useEffect, useState } from 'react';
import Select from "react-select";

export const PageList = (props) => {
  const handleDropdownChange = (v) => {
    console.log(v);
    props.onPageSelect(v !== null ? v.value : 1);
  };

  const clientNameOptions = props.pages
    .map(({ id, name }) => ({
      value: id,
      label: name,
    }))
    .sort((a, b) => a.label.localeCompare(b.label));

  return (
    <div key={props.index} className="inline-block relative w-64">
      <Select
        options={clientNameOptions}
        isClearable
        isSearchable
        onChange={handleDropdownChange}
        defaultValue={clientNameOptions[0]}
        placeholder="Please Select"
        className="placeholder-blueGray-300 text-blueGray-600 relative bg-white rounded text-sm border-0 shadow outline-none focus:outline-none focus:ring w-full"
      />
      {/* <select onChange={e => handleDropdownChange(e.target.value)} className="block appearance-none w-full bg-white border border-gray-400 hover:border-gray-500 px-4 py-2 pr-8 rounded shadow leading-tight focus:outline-none focus:shadow-outline">
          {props.pages.map((page, index) => (
            <option key={index} value={page.id}>{page.name}</option>
          ))}
        </select> */}
      <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
        <svg
          className="fill-current h-4 w-4"
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 20 20"
        >
          <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
        </svg>
      </div>
    </div>
  );
};
