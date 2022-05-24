import React from "react";
import imgLoading from "../../assets/images/loading-circle.gif";

const Loading = ({ content }) => {
  return (
    <div>
      <div className="m-8">
        <p className="py-2 px-2 flex justify-center">{content}</p>
        <div className="py-2 px-2 justify-items-center flex justify-center">
          <img src={imgLoading} alt={content} width={50} />
        </div>
      </div>
    </div>
  );
};

export default Loading;
