import {FiChevronDown, FiChevronUp} from "react-icons/fi";
import React, { useState, useEffect } from "react";

const MobileHeader = ({client_name, matter_name, height, width, setContentHeight }) => {
  const [headerReadMore, setHeaderReadMore] = useState(false);
  const [headerLines, setHeaderLines] = useState();

  function countLines(tag) {
    var divHeight = tag.offsetHeight
    var lineHeight = parseInt(window.getComputedStyle(tag).getPropertyValue("line-height"));
    var lines = Math.round(divHeight / lineHeight);
    return lines;
  }

  const checkFormat = (str) => {
    var check = str;
    check = check.replace("%20", " "); //returns my_name
    return check;
  };

  useEffect(() => {
    var headerTag = document.getElementById('headerTag');
    setHeaderLines(countLines(headerTag));
    if(headerReadMore) {
      setContentHeight(height-94-headerTag.offsetHeight);
    } else {
      setContentHeight(height-94-parseInt(window.getComputedStyle(headerTag).getPropertyValue("line-height")));
    }
  }, [height, width, headerReadMore]);

  return (
    <>
      <div className="flex flex-auto" style={{position:headerLines > 1 ? "absolute" : "static", zIndex:headerLines > 1 ? "-50" : "auto"}}>
        <p id="headerTag" className="sm:hidden font-bold pl-14" 
          style={{lineHeight:"24px"}}>
          <span className="font-semibold text-base">
            {checkFormat(client_name)}
          </span>
          &nbsp;
          <span className="font-light text-base text-gray-500">
            {checkFormat(matter_name)}
          </span>
        </p>
        <button 
            className="shrink-0 invisible font-semibold rounded inline-flex items-center border-0 w-5 h-5 rounded-full outline-none focus:outline-none active:bg-current">
            {!headerReadMore ? <FiChevronDown/> : <FiChevronUp/>}
        </button>
      </div>
      {/* IF HEADER LINES IS LONG, THEN OVERLAY WITH READMORE */}
      {headerLines > 1 ? (
        <div className="sm:hidden flex justify-items-start items-start flex-row w-full">
          <p className={'flex-auto pl-14 sm:hidden ' + (headerReadMore?'':'truncate')}>
            <span className="font-semibold text-base">
                {checkFormat(client_name)}
              </span>
              &nbsp;
              <span className="font-light text-base text-gray-500">
                {checkFormat(matter_name)}
                {/*headerReadMore ? checkFormat(matter_name) : ellipsis(checkFormat(matter_name),30)*/}
            </span>
          </p>
          <button 
            onClick={()=>setHeaderReadMore(!headerReadMore)}
            className="shrink-0 hover:bg-gray-100 text-gray-500 font-semibold rounded inline-flex items-center border-0 w-5 h-5 rounded-full outline-none focus:outline-none active:bg-current">
            {!headerReadMore ? <FiChevronDown/> : <FiChevronUp/>}
          </button>
        </div>
      ) : (<></>)}
    </>
  );
};

export default MobileHeader;
