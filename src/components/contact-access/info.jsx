import React from "react";
import { BsFillInfoCircleFill } from "react-icons/bs";

export const Info = (props) => {
  return (
    <>
      <div
        className="bg-yellow-50 border-yellow-500 rounded-b text-yellow-400 px-4 py-3 shadow-md mb-4"
        role="alert"
      >
        <div className="flex">
          <div className="py-1">
            <BsFillInfoCircleFill className="fill-current h-4 w-4 text-yellow-500 mr-3" />
          </div>
          <div>
            <p className="font-bold">{props.title}</p>
            <p className="text-sm">{props.message}</p>
          </div>
        </div>
      </div>
    </>
  );
};
