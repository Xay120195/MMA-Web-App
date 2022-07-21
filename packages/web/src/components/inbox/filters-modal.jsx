import React, { useEffect, useState } from "react";
import { GrClose } from "react-icons/gr";
import { RiFileInfoLine, RiFilterFill, RiFilterOffLine } from "react-icons/ri";
import { useForm } from "react-hook-form";
import DatePicker from "react-datepicker";

export default function FiltersModal(props) {
  const [startDate, setStartDate] = useState(
    props.currentFilter.startDate || null
  );
  const [endDate, setEndDate] = useState(props.currentFilter.endDate || null);
  const [invalidState, setInvalidState] = useState(true);
  const [invalidDateRange, setInvalidDateRange] = useState(false);

  const { handleSubmit } = useForm();

  const handleModalClose = () => {
    props.closeFiltersModal();
  };

  const handleClearFilter = () => {
    props.executeFilter(null);
  };

  const handleSave = () => {
    let filters = {
      startDate: startDate,
      endDate: endDate,
    };

    props.executeFilter(filters);
  };

  useEffect(() => {
    if (
      startDate !== null &&
      startDate !== "" &&
      endDate !== null &&
      endDate !== ""
    ) {
      if (Date.parse(startDate) > Date.parse(endDate)) {
        setInvalidDateRange(true);
        setInvalidState(true);
      } else {
        setInvalidDateRange(false);
        setInvalidState(false);
      }
    } else {
      setInvalidState(true);
    }
  });

  return (
    <form>
      <div
        className="justify-center items-center flex overflow-x-hidden overflow-y-auto fixed inset-0 outline-none focus:outline-none"
        style={{ zIndex: 70 }}
      >
        <div className="relative w-full my-6 mx-auto max-w-md">
          <div className="border-0 rounded-lg shadow-lg relative flex flex-col w-full bg-white outline-none focus:outline-none">
            <div className="flex items-start justify-between p-5 border-b border-solid border-blueGray-200 rounded-t">
              <h3 className="text-xl font-semibold">Manage Filters</h3>
              <button
                className="p-1 ml-auto bg-transparent border-0 text-black opacity-4 float-right text-3xl leading-none font-semibold outline-none focus:outline-none"
                onClick={handleModalClose}
              >
                <GrClose />
              </button>
            </div>
            <div className="relative p-6 flex-auto">
              <p className="font-bold text-sm">DATE RANGE</p>
              <div className="grid grid-cols-2 gap-4 pt-2">
                <div>
                  <p className="text-sm">From</p>
                  <div className="relative mt-2">
                    <div className="absolute pin-r pin-t mt-4 mr-5 ml-2 text-purple-lighter">
                      <RiFileInfoLine />
                    </div>
                    <DatePicker
                      popperProps={{
                        positionFixed: true,
                      }}
                      className="border w-full rounded text-xs py-2 px-1 border-gray-300"
                      dateFormat="dd MMM yyyy"
                      selected={startDate === null ? null : new Date(startDate)}
                      placeholderText="Start Date"
                      onChange={(selected) => setStartDate(selected)}
                    />
                  </div>
                </div>

                <div>
                  <p className="text-sm">To</p>
                  <div className="relative mt-2">
                    <div className="absolute pin-r pin-t mt-4 mr-5 ml-2 text-purple-lighter">
                      <RiFileInfoLine />
                    </div>
                    <DatePicker
                      popperProps={{
                        positionFixed: true,
                      }}
                      className="border w-full rounded text-xs py-2 px-1 border-gray-300"
                      dateFormat="dd MMM yyyy"
                      selected={endDate === null ? null : new Date(endDate)}
                      placeholderText="End Date"
                      onChange={(selected) => setEndDate(selected)}
                    />
                  </div>
                </div>
              </div>
              {invalidDateRange && (
                <div className="pt-1">
                  <small className="text-red-400">
                    End date should not be earlier than start date.
                  </small>
                </div>
              )}
            </div>
            <div className="flex items-center justify-end p-6 border-t border-solid border-blueGray-200 rounded-b">
              {props.currentFilter.startDate && props.currentFilter.endDate && (
                <button
                  className="text-red-500 background-transparent font-bold uppercase px-6 py-2 text-xs outline-none focus:outline-none mr-1 mb-1 ease-linear transition-all duration-150 flex"
                  type="button"
                  onClick={handleClearFilter}
                >
                  Clear Filters <RiFilterOffLine />
                </button>
              )}
              <button
                className={`text-white active:bg-emerald-600 font-bold uppercase text-xs px-6 py-3 rounded shadow hover:shadow-lg outline-none focus:outline-none mr-1 mb-1 ease-linear transition-all duration-150 flex ${
                  invalidState ? "bg-green-300" : "bg-green-500"
                }`}
                type="submit"
                disabled={invalidState}
                onClick={handleSave}
              >
                Apply Filters <RiFilterFill />
              </button>
            </div>
          </div>
        </div>
      </div>
      <div
        className="opacity-25 fixed inset-0 bg-black"
        style={{ zIndex: 60 }}
      ></div>
    </form>
  );
}
