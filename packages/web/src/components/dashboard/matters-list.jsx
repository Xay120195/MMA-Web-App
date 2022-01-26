import React, { useState } from "react";
import { Link } from "react-router-dom";
import { AppRoutes } from "../../constants/AppRoutes";
import dateFormat from "dateformat";

export function MattersList({
  matter,
  view,
  onShowDeleteModal,
  showDeleteMatter,
  allowOpenMatter,
}) {
  const setshowDeleteModal = (value) => {
    onShowDeleteModal(value);
  };

  const redirectToMattersOverview = allowOpenMatter
    ? `${AppRoutes.MATTERSOVERVIEW}/${matter.id}`
    : `#`;
    
  return (
    <>
      {view === "grid" ? (
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
            <Link to={redirectToMattersOverview}>
              <h4
                tabIndex="0"
                className="focus:outline-none text-gray-800 dark:text-gray-100 font-bold mb-3"
              >
                {matter.name}
              </h4>
              <p
                tabIndex="0"
                className="focus:outline-none text-gray-800 dark:text-gray-100 text-sm mb-3"
              >
                {matter.client.name}
              </p>
              <p
                tabIndex="0"
                className="focus:outline-none text-gray-400 dark:text-gray-100 text-xs"
              >
                {dateFormat(matter.timestamp, "dd mmmm yyyy h:MM:ss TT")}
              </p>

              <br />
              <div className="grid grid-cols-4 gap-4">
                <div className="col-span-2">
                  <img
                    className="relative z-30 inline object-cover w-8 h-8 border-2 border-white rounded-full"
                    src={matter.substantially_responsible.profile_picture}
                    alt={matter.substantially_responsible.name}
                    title={matter.substantially_responsible.name}
                  />
                </div>

                <div className="col-span-2 grid place-self-end">
                  <p
                    tabIndex="0"
                    className="focus:outline-none text-xs text-gray-400"
                  >
                    {matter.matter_number} <b className="text-lg">&#62;</b>
                  </p>
                </div>
              </div>
            </Link>
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
            <Link to={redirectToMattersOverview}>
              <div className="grid grid-cols-4 gap-4">
                <div className="col-span-2">
                  <h4
                    tabIndex="0"
                    className="focus:outline-none text-gray-800 dark:text-gray-100 font-bold mb-1"
                  >
                    {matter.name}
                  </h4>
                  <p
                    tabIndex="0"
                    className="focus:outline-none text-xs text-gray-400"
                  >
                    {matter.client.name} | {matter.matter_number}
                  </p>
                  <p
                    tabIndex="0"
                    className="focus:outline-none text-gray-400 dark:text-gray-100 text-xs"
                  >
                    {dateFormat(matter.timestamp, "dd mmmm yyyy h:MM:ss TT")}
                  </p>
                </div>
                <div className="col-span-2 grid place-self-end mb-2">
                  <img
                    className="relative z-30 inline object-cover w-8 h-8 border-2 border-white rounded-full"
                    src={matter.substantially_responsible.profile_picture}
                    alt={matter.substantially_responsible.name}
                    title={matter.substantially_responsible.name}
                  />
                </div>
              </div>
            </Link>
          </div>
        </div>
      )}
    </>
  );
}
