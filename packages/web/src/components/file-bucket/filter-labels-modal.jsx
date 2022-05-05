import React from "react";
import { GrClose } from "react-icons/gr";
import { AiOutlineTags } from "react-icons/ai";
import { pageSelectedLabels } from "./index";
import Multiselect from "multiselect-react-dropdown";
import "../../assets/styles/multiselect-custom.css";

let selectedFilters = [];
let filesToSend = [];
let filterOptions = [];

export default function FilterLabels(props) {
  filterOptions = pageSelectedLabels;

  const handleModalClose = () => {
    props.handleModalClose();
  };

  const handleFilter = async () => {
    if (filesToSend.length > 0) {
      console.log("FTS",filesToSend);
      props.handleSave(filesToSend);
    } else {
      props.handleSave([]);
    }
  };
  
  const handleFilterChange = (evt) => {
    filesToSend = evt; //filter Labels, send data to index
    selectedFilters = evt; //save for UI display of selected labels
  };

  const handleRemoveChange = (evt) => {
    filesToSend = evt; //filter Labels, send data to index
    selectedFilters = evt; //save for UI display of selected labels
  };

  function setDefault(data) {
    selectedFilters = [...selectedFilters, data[0]];
    filesToSend = [...selectedFilters, data[0]];
    return data;
  }

  return (
    <>
      <div className="justify-center items-center flex overflow-x-hidden overflow-y-auto fixed inset-0 z-50 outline-none focus:outline-none">
        <div className="relative w-full my-6 mx-auto max-w-lg">
          <div className="border-0 rounded-lg shadow-lg relative flex flex-col w-full bg-white outline-none focus:outline-none">
            <div className="flex items-start justify-between p-5 rounded-t">
              <h2 className="text-xl py-1 font-semibold">Manage Labels</h2>
              <button
                className="p-1 ml-auto bg-transparent border-0 text-black opacity-4 float-right text-3xl leading-none font-semibold outline-none focus:outline-none"
                onClick={handleModalClose}
              >
                <GrClose />
              </button>
            </div>

            <div className="px-5 py-1">
              <div className="relative flex-auto">
                <div className="flex items-start py-3">
                  <div className="relative flex-auto">
                    <p className="input-name">Contains Labels</p>
                    <div className="relative my-2">
                      <Multiselect
                        isObject={false}
                        onRemove={(event) => handleRemoveChange(event)}
                        onSelect={(event) => handleFilterChange(event)}
                        options={filterOptions}
                        selectedValues={
                          selectedFilters.length > 0
                            ? selectedFilters
                            : setDefault([filterOptions[0]])
                        }
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
                Apply Filter &nbsp; <AiOutlineTags />
              </button>
            </div>
          </div>
        </div>
      </div>
      <div className="opacity-25 fixed inset-0 z-40 bg-black"></div>
    </>
  );
}
