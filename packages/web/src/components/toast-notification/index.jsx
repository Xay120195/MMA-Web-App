import React, { useEffect } from "react";
import "../../assets/styles/ToastNotification.css";
import * as FaIcons from "react-icons/fa";

const ToastNotification = ({ title, hideToast, error }) => {
  return (
    <>
      <div
        className={error ? "main-div-error hideMe" : "main-div-success hideMe"}
      >
        <div className="inline-flex content-grid">
          {error ? (
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
          ) : (
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          )}
          <span>{title || title}</span>
          <span>
            <FaIcons.FaTimes onClick={hideToast} />
          </span>
        </div>
      </div>
    </>
  );
};

export default ToastNotification;
