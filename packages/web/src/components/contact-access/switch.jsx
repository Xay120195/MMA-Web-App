import React from "react";
import { useEffect, useState } from "react";

export const Switch = ({ access, row_index, switchChanged }) => {
  const [isChecked, setisChecked] = useState(access.has_access === 1);
  const [checkedValue, setcheckedValue] = useState(access.has_access);

  const handleChange = () => {
    setisChecked(!isChecked);
    switchChanged();
  };

  useEffect(() => {
    if (access.has_access !== checkedValue) {
      setisChecked(access.has_access === 1 ? true : false);
      setcheckedValue(access.has_access);
    }
  }, [isChecked, checkedValue, access.has_access]);

  return (
    <div className="relative inline-block w-10 mr-2 align-middle select-none transition duration-200 ease-in">
      <input
        type="checkbox"
        name={`${access.name}_${row_index}`}
        id={`${access.name}_${row_index}`}
        className="toggle-checkbox absolute block w-6 h-6 rounded-full bg-white border-4 appearance-none cursor-pointer"
        checked={isChecked}
        onChange={handleChange.bind(this)}
      />
      <label className="toggle-label block overflow-hidden h-6 rounded-full bg-gray-300 cursor-pointer"></label>
    </div>
  );

  // function setCheckboxValue(){
  //   console.log('changed');
  // }
};
