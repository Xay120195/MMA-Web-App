import React, { useState, useEffect, useRef } from "react";
import ToastNotification from "../toast-notification";
import { GrClose } from "react-icons/gr";
import { AiOutlineTags } from  "react-icons/ai";
import { pageSelectedLabels } from "./index";
import Multiselect from "multiselect-react-dropdown";
import "../../assets/styles/multiselect-custom.css";

let selectedFilters = [];
let filesToSend = [];
let filterOptions = [];

export default function FilterLabels (props) {
  const handleModalClose = () => {
    props.handleModalClose();
  };

  const [showToast, setShowToast] = useState(false);
  const [resultMessage, setResultMessage] = useState("");
  const hideToast = () => {
    setShowToast(false);
  };

  const handleFilter= async () => {
    if(filesToSend.length > 0){
      props.handleSave(filesToSend);
    }else{
      props.handleSave([]);
    }
  };

  pageSelectedLabels.map(x=> filterOptions = [...filterOptions, x.label]);
  filterOptions = [...new Map(filterOptions.map(x => [JSON.stringify(x), x])).values()];

  const handleFilterChange = (evt) => {
    filesToSend = evt; //filter Labels, send data to index
    selectedFilters = evt; //save for UI display of selected labels
  }

  const handleRemoveChange = (evt) => {
    // filesToSend = filesToSend.filter(e => e === evt[0]);
    filesToSend = evt; //filter Labels, send data to index
    selectedFilters = evt; //save for UI display of selected labels
    console.log(filesToSend);
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
                                {/* <CreatableSelect
                                    options={pageSelectedLabels}
                                    isMulti
                                    isClearable
                                    isSearchable
                                    allowSelectAll={true}
                                    className="w-full placeholder-blueGray-300 text-blueGray-600 bg-white rounded text-sm border-0 shadow outline-none focus:outline-none focus:ring z-100"
                                    onChange={(options) => handleFilterChange(options)}
                                    defaultValue={filterTempOptions ? filterTempOptions : {value: 0, label: ""}}
                                /> */}

                                    <Multiselect
                                      isObject={false}
                                      onRemove={(event) => handleRemoveChange(event)}
                                      onSelect={(event) => handleFilterChange(event)}
                                      options={filterOptions}
                                      selectedValues={selectedFilters ? selectedFilters : []}
                                      showCheckbox
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
