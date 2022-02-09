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
      
    </div>
  );
};
