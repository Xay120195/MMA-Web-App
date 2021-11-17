import React, { useState } from "react";
import { Link, useHistory } from "react-router-dom";
import { chronology } from "./data-source";

export default function LinkToChronology() {
    
    const tableHeaders = [
        "Item",
        "Date",
        "Description of Background",
        "File Name",
        "Category",
      ];
      
      const handleCheckboxChange = (event) => {
        console.log(event);
      };

  return (
    <div className="shadow overflow-auto border-b border-gray-200 sm:rounded-lg">
      <table className="min-w-full divide-y divide-gray-200 border-separate">
        <thead>
          <tr>
            {tableHeaders.map((header, index) => (
              <th
                key={index}
                scope="col"
                className="px-3 py-3 font-medium text-gray-500 tracking-wider"
              >
                {header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {chronology.map((link, index) => (
            <tr key={index} index={index}>
              <td className="px-6 py-4 whitespace-nowrap w-1 text-center align-top ">
                <input
                  type="checkbox"
                  name={`${link.id}_${index}`}
                  id={`${link.id}_${index}`}
                  className="cursor-pointer"
                  onChange={handleCheckboxChange.bind(this)}
                />{" "}
                <span className="text-sm">{link.item}</span>
              </td>
              <td className="px-6 py-4 w-4 place-items-center align-top">
                <p className="text-sm">{link.date}</p>
              </td>
              <td className="px-6 py-4 w-44 place-items-center align-top">
                <p className="text-sm">{link.description_of_background}</p>
              </td>
              <td className="px-6 py-4 w-44 place-items-center align-top">
                <Link to={"#"} className="text-blue-500 text-sm">
                  {link.filename}
                </Link>
              </td>
              <td className="px-6 py-4 w-12 place-items-center align-top">
                <p className="text-sm">{link.category.name}</p>
              </td>
            </tr>
          ))}

          {/* {
    feature.data.map((data, index)=> (
    <tr key={`${data.id}_${index}`}>
        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{data.name}</td>
        {
        data.access.map((access, index)=> (
            <td key={`${access.id}_${index}`} className="px-6 py-4 whitespace-nowrap w-44  place-items-center">
            <Switch access={access} row_index={index} switchChanged={switchChanged}/>
            </td>
        ))
        }
    </tr>
    ))
    } */}
        </tbody>
      </table>
    </div>
  );
}
