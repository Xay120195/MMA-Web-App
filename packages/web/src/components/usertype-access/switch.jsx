import React from "react";
import { useEffect, useState } from "react";

export const Switch = ({
  default_access,
  user_access,
  row_index,
  user_type,
  switchChanged,
}) => {
  // console.group(user_type, row_index);
  // // console.log(page_id);
  // console.log("user_access", user_access);
  // console.log("default_access", default_access);

  const pageIsFound = user_access
    .map((p) => p.id)
    .find((page) => page === default_access.id && page);

  if (pageIsFound === undefined) {
    //console.log("Not Found", default_access.id);
  }

  console.groupEnd();
  const [isChecked, setisChecked] = useState(pageIsFound !== undefined);
  const [accessPages, setAccessPages] = useState(user_access);
  const [userType, setUserType] = useState(user_type);

  

  const handleChange = (s) => {
    console.group("Handle Change");
    var newAccessPageSet;
    if (isChecked) {
      newAccessPageSet = accessPages.filter(function (value) {
        return value.id !== default_access.id;
      });
    } else {
      newAccessPageSet = [
        ...accessPages,
        {
          id: default_access.id,
          features: default_access.features.map((f) => f.id),
        },
      ];
    }

    setAccessPages(newAccessPageSet);
    setisChecked(!isChecked);

    //setisChecked(!isChecked);
    
    // console.log("isChecked", isChecked);
    // console.log("accessPages", accessPages);

    console.groupEnd();
  };

  useEffect(() => {
    switchChanged(accessPages, userType, isChecked);
  }, [accessPages, userType, isChecked]);

  return (
    <div className="relative inline-block w-10 mr-2 align-middle select-none transition duration-200 ease-in">
      <input
        type="checkbox"
        name={`${user_access.name}_${row_index}`}
        id={`${user_access.name}_${row_index}`}
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
