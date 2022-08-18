import React from "react";
import illustration from "../../../assets/images/illustrations.png";
import undraw from "../../../assets/images/undrawpeople.png";
export default function BlankStateTeams() {
  return (
    <div className="flex flex-col justify-center items-center w-full">
      <div className="mt-20">
        <img src={undraw} alt={``}></img>
      </div>
      <div className="text-black font-medium text-2xl p-4">You do not have any teams yet</div>
      <div className="text-gray-500 text-center" style={{ width: "648px" }}>
        Get everyone working in one place by adding them to a team. Stay connected, collaborate work
        together, and efficiently manage everything from the team profile page. Click the Add Team
        button to start adding one now.
      </div>

      <div className="" style={{ zIndex: "-1" }}>
        <img
          src={illustration}
          alt={`prof`}
          style={{
            width: "1790px",
            height: "330.04px",
            left: "120px",
            top: "600px",
            position: "fixed",
            objectFit: "cover",
            transform: "scale(1.1)"
          }}
        ></img>
      </div>
    </div>
  );
}
