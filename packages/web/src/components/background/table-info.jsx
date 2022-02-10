import React, { useState, useEffect } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

const TableInfo = ({ witness, setIdList }) => {
  const [getId, setGetId] = useState([{}]);
  const [startDate, setStartDate] = useState(new Date());
  const [data, setData] = useState(witness);

  const handleCheckboxChange = (event) => {
    if (event.target.checked) {
      if (!data.includes({ id: event.target.value })) {
        setGetId((item) => [...item, event.target.value]);
      }
    } else {
      setGetId((item) => [...item.filter((x) => x !== event.target.value)]);
    }
  };

  useEffect(() => {
    setIdList(getId);
    setData(witness);
  }, [getId, data, witness]);

  return (
    <div
      className="flex flex-col"
      style={{ padding: "2rem", marginLeft: "4rem" }}
    >
      <div className="-my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
        <div className="py-2 align-middle inline-block min-w-full sm:px-6 lg:px-8">
          <div className="shadow overflow-hidden border-b border-gray-200 sm:rounded-lg">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    No
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Date
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Description of Background
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Document
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {data.map((item) => (
                  <tr>
                    <td className="px-6 py-4 whitespace-nowrap w-20">
                      <div className="flex items-center ">
                        <input
                          id={item.id}
                          aria-describedby="checkbox-1"
                          type="checkbox"
                          value={item.id}
                          onChange={handleCheckboxChange}
                          className="w-4 h-4 text-blue-600 bg-gray-100 rounded border-gray-300 focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
                        />
                        <label
                          for="checkbox-1"
                          className="ml-3 text-sm font-medium text-gray-900 dark:text-gray-300"
                        >
                          {item.id}
                        </label>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap w-64">
                      <div>
                        <DatePicker
                          className="border py-1 px-1 rounded border-gray-300"
                          selected={startDate}
                          onChange={(date) => setStartDate(date)}
                        />
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {item.comments.substring(0, 40)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 w-80">
                      <button
                        type="submit"
                        className="mt-2 w-full bg-green-600 border border-transparent rounded-md py-2 px-4 flex items-center justify-center text-base font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                      >
                        Upload +
                      </button>

                      <div className="mt-1 flex item-center mt-3">
                        <input
                          type="text"
                          id="email-adress-icon"
                          className="relative bg-gray-50 border border-dashed border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full pl-10 p-2.5  dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                          placeholder="name@flowbite.com"
                        />

                        <div className="pt-2 pl-2">
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="24"
                            height="24"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="#000000"
                            stroke-width="2"
                            stroke-linecap="round"
                            stroke-linejoin="round"
                          >
                            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                            <circle cx="12" cy="12" r="3"></circle>
                          </svg>
                        </div>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TableInfo;
