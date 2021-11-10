import React, { Component } from "react";
import Navbar from '../navigation';
import PropTypes from "prop-types";
import BlankState from "../blank-state";
import * as IoIcons from 'react-icons/io';

export default function Matters({ color }) {
    const matters_list = [1];
    const title = "affidavits";
    const txtLink = "add row";

    const handleClick = () => {
        console.log('Button was clicked!');
    }
    return (
      <>
      <Navbar />
      {matters_list.length === 0 ? (
        <BlankState title={title} txtLink={txtLink} handleClick={handleClick} />
      ) : (
        <div
          className={
            "p-5 relative flex flex-col min-w-0 break-words w-full mb-6 shadow-lg rounded " +
            (color === "light" ? "bg-white" : "bg-lightBlue-900 text-white")
          }
        >

          <div className="relative w-full max-w-full flex-grow flex-1">
            <div className={"grid grid-cols-6"}>
                <div>
                  <h1
                    className={
                      "font-bold text-3xl "
                    }
                  >
                    Matters 1
                  </h1>
                </div>
                <div></div>
                <div></div>
                <div></div>
                <div></div>
                <div>
                  <button class="bg-transparent hover:bg-blue-500 text-blue-700 text-sm font-semibold hover:text-white px-4 py-1 border bg-gray-100 hover:border-transparent rounded">Back</button>&nbsp;&nbsp;&nbsp;&nbsp;
                  <button class="bg-blue-500 hover:bg-blue-700 text-sm text-white font-bold px-4 py-1 border bg-gray-100 rounded">Share</button>
                </div>
            </div>
            
            <div className={"grid grid-cols-6"}>
              <div><p className={"text-sm"}>MATTER AFFIDAVITS OVERVIEW</p></div>
              <div></div>
              <div></div>
              <div></div>
              <div></div>
              <div></div>
            </div>
            <br/>
            <div className={"grid grid-cols-3"}>
                <div>
                  <button class="bg-green-400 hover:bg-green-700 text-white text-sm px-4 py-1 border bg-gray-100 rounded">+ Add Page</button>&nbsp;&nbsp;&nbsp;
                  <button class="bg-transparent hover:bg-gray-400 text-black text-sm px-4 py-1 border bg-gray-100 rounded">Filter by Client</button>
                </div>
                <div></div>
                <div></div>
            </div>
          </div>
          <div className="rounded-t mb-0 px-4 py-3 border-0">
            <div className="flex flex-wrap items-center">
            </div>
          </div>
          <div className="block w-full overflow-x-auto">
            {/* Projects table */}
            <table className="items-center w-full bg-transparent border-collapse">
              <thead>
                <tr>
                  <th
                    className={
                      "px-6 align-middle border border-solid py-3 text-xs uppercase border-l-0 border-r-0 whitespace-nowrap font-semibold text-left "
                    }
                  >
                    No.
                  </th>
                  <th
                    className={
                      "px-6 align-middle border border-solid py-3 text-xs uppercase border-l-0 border-r-0 whitespace-nowrap font-semibold text-left "
                    }
                  >
                    Witness Name
                  </th>
                  <th
                    className={
                      "px-6 align-middle border border-solid py-3 text-xs uppercase border-l-0 border-r-0 whitespace-nowrap font-semibold text-left "
                    }
                  >
                    RFIs
                  </th>
                  <th
                    className={
                      "px-6 align-middle border border-solid py-3 text-xs uppercase border-l-0 border-r-0 whitespace-nowrap font-semibold text-left "
                    }
                  >
                    Comment
                  </th>
                  <th
                    className={
                      "px-6 align-middle border border-solid py-3 text-xs uppercase border-l-0 border-r-0 whitespace-nowrap font-semibold text-left "
                    }
                  >
                    Affidavit
                  </th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="border-t-0 px-6 align-middle border-l-0 border-r-0 text-xs whitespace-nowrap p-4">
                    1
                  </td>
                  <td className="border-t-0 px-6 align-middle border-l-0 border-r-0 text-xs whitespace-nowrap p-4">
                    Lorem Ipsum Quero
                  </td>
                  <td className="border-t-0 px-6 align-middle border-l-0 border-r-0 text-xs whitespace-nowrap p-4">
                    Neque 
                  </td>
                  <td className="border-t-0 px-6 align-middle border-l-0 border-r-0 text-xs whitespace-nowrap p-4">
                    Porro  
                  </td>
                  <td className="border-t-0 px-6 align-middle border-l-0 border-r-0 text-xs whitespace-nowrap p-4">
                    <button class="bg-transparent hover:bg-gray-400 text-black text-sm px-3 py-1 border bg-gray-100 rounded">View</button>  
                  </td>
                </tr>
                <tr>
                  <td className="border-t-0 px-6 align-middle border-l-0 border-r-0 text-xs whitespace-nowrap p-4">
                    2
                  </td>
                  <td className="border-t-0 px-6 align-middle border-l-0 border-r-0 text-xs whitespace-nowrap p-4">
                    Lorem Ipsum Quero
                  </td>
                  <td className="border-t-0 px-6 align-middle border-l-0 border-r-0 text-xs whitespace-nowrap p-4">
                    Neque 
                  </td>
                  <td className="border-t-0 px-6 align-middle border-l-0 border-r-0 text-xs whitespace-nowrap p-4">
                    Porro  
                  </td>
                  <td className="border-t-0 px-6 align-middle border-l-0 border-r-0 text-xs whitespace-nowrap p-4">
                    <button class="bg-transparent hover:bg-gray-400 text-black text-sm px-3 py-1 border bg-gray-100 rounded">View</button>  
                  </td>
                </tr>
                <tr>
                  <td className="border-t-0 px-6 align-middle border-l-0 border-r-0 text-xs whitespace-nowrap p-4">
                    3
                  </td>
                  <td className="border-t-0 px-6 align-middle border-l-0 border-r-0 text-xs whitespace-nowrap p-4">
                    Lorem Ipsum Quero
                  </td>
                  <td className="border-t-0 px-6 align-middle border-l-0 border-r-0 text-xs whitespace-nowrap p-4">
                    Neque 
                  </td>
                  <td className="border-t-0 px-6 align-middle border-l-0 border-r-0 text-xs whitespace-nowrap p-4">
                    Porro  
                  </td>
                  <td className="border-t-0 px-6 align-middle border-l-0 border-r-0 text-xs whitespace-nowrap p-4">
                    <button class="bg-transparent hover:bg-gray-400 text-black text-sm px-3 py-1 border bg-gray-100 rounded">View</button>  
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      )}
      </>
    );
  }
  
  Matters.defaultProps = {
    color: "light",
  };
  
  Matters.propTypes = {
    color: PropTypes.oneOf(["light", "dark"]),
  };


