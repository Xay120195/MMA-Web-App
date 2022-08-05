import React, { useEffect, useState } from "react";
import SavingGif from "../../assets/images/5.gif";

export default function SavingModal() {

  return (
    <div>
      <div
        className="justify-center items-center flex overflow-x-hidden overflow-y-auto fixed inset-0 outline-none focus:outline-none"
        style={{ zIndex: 70 }}
      >
        <div className="relative w-full my-6 mx-auto max-w-md">
          <div className=" items-center border-0 rounded-lg shadow-lg relative flex flex-col w-full bg-white outline-none focus:outline-none">
      
            <div className="relative p-6 flex-auto items-center">
                <img src={SavingGif} alt="Saving..." className="h-40 items-center"/>        
            </div>
          </div>
        </div>
      </div>
      <div
        className="opacity-25 fixed inset-0 bg-black"
        style={{ zIndex: 60 }}
      ></div>
    </div>
  );
}
