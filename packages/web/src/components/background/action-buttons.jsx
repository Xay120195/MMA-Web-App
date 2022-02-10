import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";

const ActionButtons = ({ idList, setWitness, witness }) => {
  const [list, setList] = useState(witness);

  const handleDelete = (item) => {
    console.log(item);
    if (item.length <= 1) {
      window.alert("Please select one id");
    } else {
      var id = item.map(function (x) {
        return parseInt(x, 10);
      });

      let lists = witness.filter((item) => !id.includes(item.id));
      setList(lists);
    }
  };

  const handleAddRow = () => {
    const item = {
      id: witness.length + 1,
      name: "",
      date: "",
      comments: "",
      rfi: {},
    };

    const newlisted = list.concat(item);
    setList(newlisted);
  };

  useEffect(() => {
    setWitness(list);
  }, [list]);
  return (
    <div className="grid grid-rows grid-flow-col pt-5">
      <div className="col-span-12 ">
        <input
          id="checkbox-1"
          aria-describedby="checkbox-1"
          type="checkbox"
          className="w-4 h-4 text-blue-600 bg-gray-100 rounded border-gray-300 focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
        />

        <button
          onClick={handleAddRow}
          type="button"
          className="py-1 px-3 text-xs text-green-700 hover:text-white border border-green-700 hover:bg-green-800 focus:ring-4 focus:ring-green-300 font-medium rounded-lg mx-4 dark:border-green-500 dark:text-green-500 dark:hover:text-white dark:hover:bg-green-600 dark:focus:ring-green-800"
        >
          ADD ROW +
        </button>
        <button
          type="button"
          onClick={() => handleDelete(idList)}
          className="py-1 px-3 text-xs text-red-700 hover:text-white border border-red-700 hover:bg-red-800 focus:ring-4 focus:ring-red-300 font-medium rounded-lg dark:border-red-500 dark:text-red-500 dark:hover:text-white dark:hover:bg-red-600 dark:focus:ring-red-800"
        >
          DELETE
        </button>
      </div>

      <div className=" col-span-1">
        <span className="inline-flex items-center  text-sm font-medium text-gray-500 bg-white  hover:bg-gray-100 hover:text-gray-700 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white">
          <svg
            className="mr-2 w-4 h-5 pt-2"
            fill="currentColor"
            viewBox="0 0 20 20"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              fill-rule="evenodd"
              d="M7.707 14.707a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l2.293 2.293a1 1 0 010 1.414z"
              clip-rule="evenodd"
            ></path>
          </svg>
        </span>
        <span className="inline-flex items-center font-medium">1 of 1</span>
        <Link className="inline-flex items-center text-sm font-medium text-gray-500 bg-white  hover:bg-gray-100 hover:text-gray-700 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white">
          <svg
            className="ml-2 w-5 h-5 pt-2"
            fill="currentColor"
            viewBox="0 0 20 20"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              fill-rule="evenodd"
              d="M12.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-2.293-2.293a1 1 0 010-1.414z"
              clip-rule="evenodd"
            ></path>
          </svg>
        </Link>
      </div>
    </div>
  );
};

export default ActionButtons;
