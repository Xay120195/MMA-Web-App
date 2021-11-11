import React, { Component } from "react";
import { Link } from 'react-router-dom';
import Navbar from '../navigation';
import PropTypes from "prop-types";
import BlankState from "../blank-state";
import {HiOutlineShare, HiOutlinePlusCircle, HiOutlineFilter} from 'react-icons/hi';
import {MdArrowForwardIos} from 'react-icons/md'
import { matter, witness_affidavits } from './data-source'
import { AppRoutes } from "../../constants/AppRoutes";

export default function Matters({ color }) {
  
  const title = "affidavits";
  const txtLink = "add row";

  const tableHeaders = ["No.", "Witness Name", "RFIs", "Comments", "Affidavits"];

  const handleClick = () => {
      console.log('Button was clicked!');
  }
    return (
      <>
      <Navbar />
      {witness_affidavits.length === 0 ? (
        <BlankState title={title} txtLink={txtLink} handleClick={handleClick} />
      ) : (
        
        <div className={"p-5 relative flex flex-col min-w-0 break-words w-full mb-6 shadow-lg rounded " + (color === "light" ? "bg-white" : "bg-lightBlue-900 text-white") }>

          <div className="relative w-full max-w-full flex-grow flex-1">
            <div className={"grid grid-cols-2"}>
                <div>
                  <h1 className="font-bold text-3xl">
                    {matter.name}
                  </h1>
                  <p className={"text-sm mt-3 font-medium"}>MATTER AFFIDAVITS OVERVIEW</p>
                </div>
                
                <div className="absolute right-0">
                  <button className="bg-white hover:bg-gray-100 text-black font-semibold py-2.5 px-4 rounded inline-flex items-center border-0 shadow outline-none focus:outline-none focus:ring">
                    Back &nbsp;<MdArrowForwardIos/></button>
                  <button className="bg-blue-400 hover:bg-blue-500 text-white font-semibold py-2.5 px-4 rounded inline-flex items-center border-0 shadow outline-none focus:outline-none focus:ring ml-2">
                    Share &nbsp;<HiOutlineShare/>
                  </button>
                </div>

                
            </div>

            <div className="mt-7">
                  <div>
                    <button className="bg-green-400 hover:bg-green-500 text-white text-sm py-2 px-4 rounded inline-flex items-center border-0 shadow outline-none focus:outline-none focus:ring">
                    Add Page &nbsp;<HiOutlinePlusCircle/>
                    </button>

                    <button className="bg-gray-50 hover:bg-gray-100 text-black text-sm py-2 px-4 rounded inline-flex items-center border-0 shadow outline-none focus:outline-none focus:ring ml-2">
                      Filter by Client &nbsp;<HiOutlineFilter/>
                    </button>
                  </div>
                  
              </div>
            
            
          </div>


          <div className="shadow overflow-hidden border-b border-gray-200 sm:rounded-lg my-5">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead>
                    <tr>
                      {tableHeaders.map((header, index) => (
                        <th key={index} scope="col" className='px-6 py-3 font-medium text-gray-500 tracking-wider'>
                          {header}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {
                      witness_affidavits.map((wa, index)=> (
                        <tr key={index} index={index}>
                          <td className="px-6 py-4 whitespace-nowrap w-4 text-center">
                            <p>{wa.id}</p>
                          </td>
                          <td className="px-6 py-4 w-10 align-top place-items-center">
                            <p>{wa.name}</p>
                          </td>
                          <td className="px-6 py-4 w-10 align-top place-items-center">
                            <p>{wa.rfi.name}</p>
                          </td>
                          <td className="px-6 py-4 w-1/2 align-top place-items-center">
                            <p>{wa.comments}</p>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap w-5 align-top place-items-center text-center">
                            <Link to={`${AppRoutes.MATTERSAFFIDAVIT}/${wa.id}`}>
                              <button className="bg-green-100 hover:bg-gray-100 text-green-700 text-sm py-1.5 px-2.5 rounded-full inline-flex items-center border-0 shadow outline-none focus:outline-none focus:ring ml-2">View</button>
                            </Link>
                          </td>
                        </tr>
                      ))
                    }
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