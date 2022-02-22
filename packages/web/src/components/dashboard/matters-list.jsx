import React, { useState } from "react";
import { Link } from "react-router-dom";
import { AppRoutes } from "../../constants/AppRoutes";
import dateFormat from "dateformat";
import "../../assets/styles/Dashboard.css";
import * as FaIcons from "react-icons/fa";

export function ClientMatters({
  clientMatter,
  view,
  onShowDeleteModal,
  showDeleteMatter,
  allowOpenMatter,
  allowOpenFileBucket,
  allowOpenBackground,
}) {
  const setshowDeleteModal = (value) => {
    onShowDeleteModal(value);
  };

  console.log("clientMatter", clientMatter);

  return (
    <>
      {view === "grid" ? (
        <div className="w-full h-42 bg-gray-100 rounded-lg border border-gray-200 mb-6 py-5 px-4">
          <div>
            {(allowOpenFileBucket || allowOpenBackground || showDeleteMatter) ? (
            <div className="p-1 ml-auto bg-transparent border-0 text-black opacity-4 float-right text-3xl leading-none font-semibold outline-none focus:outline-none">
              <div className="dropdown">
                  <button className="bg-gray-100 text-gray-700 font-semibold rounded inline-flex">
                  <FaIcons.FaEllipsisV />
                  </button>
                  <ul className="dropdown-menu absolute hidden text-gray-700 pt-1 bg-white p-2 font-semibold rounded z-50">
                  {allowOpenFileBucket ? (<li className="p-2"><Link to={`${AppRoutes.FILEBUCKET}/${clientMatter.id}`}>File Bucket</Link></li>) : null}
                  {allowOpenBackground ? (<li className="p-2"><Link to={`${AppRoutes.BACKGROUND}/${clientMatter.id}`}>Background</Link></li>
                   ) : null}
                  {showDeleteMatter && (<li className="p-2" onClick={() => setshowDeleteModal(true)} ><a href="#">Delete</a></li>)}
                  </ul>
              </div>
            </div>
            ) : null}
            <div>
              <h4
                tabIndex="0"
                className="focus:outline-none text-gray-800 dark:text-gray-100 font-bold mb-3"
              >
                {clientMatter.matter.name}
              </h4>
              <p
                tabIndex="0"
                className="focus:outline-none text-gray-800 dark:text-gray-100 text-sm mb-3"
              >
                {clientMatter.client.name}
              </p>

              <br />
              <div className="grid grid-cols-4 gap-4">
                
                <div className="col-span-1">
                  <img
                    className="relative z-30 inline object-cover w-8 h-8 border-2 border-white rounded-full"
                    src={clientMatter.substantially_responsible.profile_picture}
                    alt={clientMatter.substantially_responsible.name}
                    title={clientMatter.substantially_responsible.name}
                  />
                </div>
               
                <div className="col-span-3 grid place-self-end">
                <p
                  tabIndex="0"
                  className="focus:outline-none text-gray-400 dark:text-gray-100 text-xs"
                >
                  {dateFormat(clientMatter.createdAt, "dd mmmm yyyy, h:MM:ss TT")}
                </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="w-full h-42 bg-gray-100 rounded-lg border border-gray-200 mb-6 py-5 px-4">
          <div>
            {showDeleteMatter && (
              <button
                className="p-1 ml-auto bg-transparent border-0 text-black opacity-4 float-right text-3xl leading-none font-semibold outline-none focus:outline-none"
                onClick={() => setshowDeleteModal(true)}
              >
                <svg
                  stroke="currentColor"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                  height="1em"
                  width="1em"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    fill="none"
                    stroke="#000"
                    d="M3,3 L21,21 M3,21 L21,3"
                  ></path>
                </svg>
              </button>
            )}
            {/* <Link to={redirectToBackground}> */}
              <div className="grid grid-cols-4 gap-4">
                <div className="col-span-2">
                  <h4
                    tabIndex="0"
                    className="focus:outline-none text-gray-800 dark:text-gray-100 font-bold mb-1"
                  >
                    {clientMatter.matter.name}
                  </h4>
                  <p
                    tabIndex="0"
                    className="focus:outline-none text-xs text-gray-400"
                  >
                    {clientMatter.client.name}
                  </p>
                  <p
                    tabIndex="0"
                    className="focus:outline-none text-gray-400 dark:text-gray-100 text-xs"
                  >
                    {dateFormat(clientMatter.createdAt, "dd mmmm yyyy, h:MM:ss TT")}
                  </p>
                </div>
                <div className="col-span-2 grid place-self-end mb-2">
                  <img
                    className="relative z-30 inline object-cover w-8 h-8 border-2 border-white rounded-full"
                    src={clientMatter.substantially_responsible.profile_picture}
                    alt={clientMatter.substantially_responsible.name}
                    title={clientMatter.substantially_responsible.name}
                  />
                </div>
              </div>
            {/* </Link> */}
          </div>
        </div>
      )}
    </>
  );
}
