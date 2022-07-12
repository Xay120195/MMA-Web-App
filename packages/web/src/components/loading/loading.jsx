import React from "react";
import imgLoading from "../../assets/images/loading-circle.gif";

const Loading = ({ content }) => {
  return (
    <div>
      <div className="bg-white flex flex-col justify-center h-screen w-screen absolute top-0 left-0 sm:m-8 sm:static sm:h-auto sm:w-auto sm:flex-none z-50 sm:z-auto">
        <p className="py-2 px-2 flex justify-center text-xl sm:text-base">{content}</p>
        <div className="py-2 px-2 justify-items-center flex justify-center">
          <img src={imgLoading} alt={content} width={100} />
        </div>
      </div>
    </div>
  );
};

export default Loading;
