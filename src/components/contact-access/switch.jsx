import React from "react";
// import { useEffect, useState } from 'react';
const handleChange = ()=> {
console.log('changeed');
}
export const Switch = ({access, row_index}) => {

  console.log(access);
  return(
    <div className="relative inline-block w-10 mr-2 align-middle select-none transition duration-200 ease-in">
      <input type="checkbox" 
        name={`${access.name}_${row_index}`} 
        id={`${access.name}_${row_index}`} 
        className="toggle-checkbox absolute block w-6 h-6 rounded-full bg-white border-4 appearance-none cursor-pointer" 
        checked={access.has_access === 1} 
        onChange={handleChange.bind(this)}
        />
      <label className="toggle-label block overflow-hidden h-6 rounded-full bg-gray-300 cursor-pointer"></label>
    </div>
  )

  // function setCheckboxValue(){
  //   console.log('changed');
  // }
}


