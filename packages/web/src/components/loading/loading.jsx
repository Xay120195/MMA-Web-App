import React from "react";
import imgLoading from "../../assets/images/loading-circle.gif";
import imgLoadingMobile from "../../assets/images/mobile-loading-circle.gif";

const Loading = ({ content }) => {
  return (
    <div>
      <div className="bg-white flex flex-col justify-center h-screen w-screen absolute top-0 left-0 sm:m-8 sm:static sm:h-auto sm:w-auto sm:flex-none z-50 sm:z-auto">
        <p className="hidden sm:inline py-2 px-2 flex justify-center text-xl sm:text-base">{content}</p>
        <div className="py-2 px-2 justify-items-center flex justify-center">
          <img className="hidden sm:inline"src={imgLoading} alt={content} width={50} />
          <img className="sm:hidden"src={imgLoadingMobile} alt={content} width={100} />
        </div>
        <p className="sm:hidden py-2 px-2 flex justify-center text-base">{content}</p>
      </div>
    </div>
  );
};

export default Loading;
