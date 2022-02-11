import React from "react";

const EmptyRow = () => {
  return (
    <div class="flex item-center">
      <div class="flex-none w-100 h-100 ">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-60 w-60"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z"
          />
        </svg>
      </div>

      <div class="flex-none w-full h-full">
        <p style={{ marginTop: "4rem", fontWeight: "bold", fontSize: "3rem" }}>
          You haven't added anything yet
        </p>
        <p>
          Click the <span style={{ color: "rgb(2 132 199)" }}>Add row</span>{" "}
          button above to start adding one now
        </p>
      </div>
    </div>
  );
};

export default EmptyRow;
