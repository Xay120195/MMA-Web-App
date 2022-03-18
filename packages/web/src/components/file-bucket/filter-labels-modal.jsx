import React, { useState, useEffect, useRef } from "react";
import ToastNotification from "../toast-notification";
import { BsFillTrashFill } from "react-icons/bs";
import { GrClose } from "react-icons/gr";
import { AiOutlineTags } from  "react-icons/ai";
import CreatableSelect from "react-select/creatable";
import { pageSelectedLabels } from "./index"
let tempp = [];

export default function FilterLabels(props) {
  const handleModalClose = () => {
    props.handleModalClose();
  };

  var filesToDisplay = [];
  var filesToSend;
  const [filterTempOptions, setFilterTempOptions] = useState(filesToSend);
  console.log(pageSelectedLabels);

  const [showToast, setShowToast] = useState(false);
  const [resultMessage, setResultMessage] = useState("");
  const hideToast = () => {
    setShowToast(false);
  };

  const handleFilter= async () => {
      props.handleSave(filesToSend);
      // setFilterTempOptions(tempp);
  };

  const handleFilterChange = (options) => {
    console.log(options);
    options.map(x => filesToDisplay = [...filesToDisplay, x.label]);
    //filter duplicates
    filesToSend = [...new Map(filesToDisplay.map(x => [JSON.stringify(x), x])).values()];
  }



  return (
    <>
      <div className="justify-center items-center flex overflow-x-hidden overflow-y-auto fixed inset-0 z-50 outline-none focus:outline-none">
        <div className="relative w-full my-6 mx-auto max-w-lg">
          <div className="border-0 rounded-lg shadow-lg relative flex flex-col w-full bg-white outline-none focus:outline-none">
            <div className="flex items-start justify-between p-5 rounded-t">
              <h2 className="text-xl py-1 font-semibold">
                Manage Labels
              </h2>
              <button
                className="p-1 ml-auto bg-transparent border-0 text-black opacity-4 float-right text-3xl leading-none font-semibold outline-none focus:outline-none"
                onClick={handleModalClose}
              >
                <GrClose />
              </button>
            </div>

                <div className="px-5 py-1" >
                <div className="relative flex-auto">
                    <div className="flex items-start py-3"> 
                        <div className="relative flex-auto">
                            <p className="input-name">Contains Labels</p>
                            <div className="relative my-2">
                                <CreatableSelect
                                    options={pageSelectedLabels}
                                    isMulti
                                    isClearable
                                    isSearchable
                                    className="w-full placeholder-blueGray-300 text-blueGray-600 bg-white rounded text-sm border-0 shadow outline-none focus:outline-none focus:ring z-100"
                                    onChange={(options) => handleFilterChange(options)}
                                    // defaultValue={filterTempOptions}
                                />
                            </div>
                        </div>
                    </div>

                </div>
                </div>

                <div className="flex items-center justify-end p-6 rounded-b">
                        <button 
                          className="justify-center w-full bg-green-400 hover:bg-green-400 text-white text-sm py-3 px-4 rounded inline-flex items-center border-0 shadow outline-none focus:outline-none focus:ring" 
                          onClick={(options) => handleFilter(options)}
                        >
                            Apply Filter &nbsp; <AiOutlineTags/>
                        </button>
                </div>
                {showToast && resultMessage && (
                    <ToastNotification title={resultMessage} hideToast={hideToast} />
                )}
          
          </div>
          
        </div>
      </div>
      <div className="opacity-25 fixed inset-0 z-40 bg-black"></div>
    </>
  );
}
