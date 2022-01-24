import React from "react";
import { useEffect, useState } from "react";

export const Switch = ({
  default_access,
  user_access_id,
  user_access,
  row_index,
  user_type,
  switchChanged,
  switchIsClicked,
}) => {
  const pageIsFound = user_access
    .map((p) => p.id)
    .find((page) => page === default_access.id && page);

  const [isChecked, setisChecked] = useState(pageIsFound !== undefined);
  const [accessPages, setAccessPages] = useState(user_access);
  const [userType, setUserType] = useState(user_type);

  const handleChange = (s) => {
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
    handleClick(!isChecked, default_access.id);
  };

  const handleClick = (is_checked, page_id) => {
    switchIsClicked(is_checked, page_id, userType);
  };

  useEffect(() => {
    switchChanged(user_access_id, accessPages, userType);
  }, [accessPages, userType, isChecked]);

  return (
    <div className="relative inline-block w-8 mr-2 align-middle select-none transition duration-200 ease-in">
      <input
        type="checkbox"
        name={row_index}
        id={row_index}
        className="toggle-checkbox absolute block w-5 h-5 rounded-full bg-white border-4 appearance-none cursor-pointer"
        checked={isChecked}
        onChange={handleChange.bind(this)}
      />
      <label className="toggle-label block overflow-hidden h-5 rounded-full bg-gray-300 cursor-pointer"></label>
    </div>
  );
};
