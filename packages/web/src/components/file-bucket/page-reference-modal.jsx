import React, { useState, useRef, useEffect } from "react";
import { API } from "aws-amplify";
import { FiX } from "react-icons/fi";
import { FaEdit, FaSave } from "react-icons/fa";
import "../../assets/styles/pageReferenceModal.css";

export default function PageReferenceModal(props) {
  const [updateProgess, setUpdateProgress] = useState(true);
  let valRef = useRef();

  const handleModalClose = () => {
    props.handleModalClose();
  };

  const setUpdateDescription = () => {
    setUpdateProgress(false);
  }

  const mUpdateBackgroundDescription = `
    mutation updateBackground($id: ID, $description: String) {
      backgroundUpdate(id: $id, description: $description) {
        id
        description
        date
      }
    }
  `;

  const saveDescription = async () => {
    API.graphql({
      query: mUpdateBackgroundDescription,
      variables: {
        id: props.backgroundId,
        description: valRef.current.innerHTML
      },
    });
    props.getMatterFiles(1);
    setUpdateProgress(true);
  }

  return (
    <>
      <div className="reference-modal">
        <div className="title-grid">
          <p className="title-txt"><b>Row Number: {props.order}</b></p>
          <FiX
            className="close-btn"
            style={{ color: "var(--mysteryGrey)" }}
            onClick={handleModalClose}
          /><br/>
          <p className="title-txt"><b>Background file of {props.clientMatter}</b></p>
        </div><br/>
        <div
         contentEditable={updateProgess ? false : true } 
         className="p-2 font-poppins overflow-auto h-4/6"
          style={{
            cursor: "auto",
            outlineColor:
              "rgb(204, 204, 204, 0.5)",
            outlineWidth: "thin",
          }}
          dangerouslySetInnerHTML={{
            __html: props.description,
          }}
          ref={valRef}
        >
        </div><br/>
        
        {updateProgess && (
        <div className="inline-block float-right"><button className="h-10 px-5 m-2 text-white transition-colors duration-150 bg-gray-600 rounded-lg focus:shadow-outline hover:bg-gray-700"
        onClick={() => setUpdateDescription()}
        >Edit <FaEdit className="inline-block" /></button>
        </div>
        )}

        {!updateProgess && (
        <button className="h-10 px-5 m-2 text-green-100 transition-colors duration-150 bg-green-600 rounded-lg focus:shadow-outline hover:bg-green-700 float-right inline-block w-24"
        onClick={() => saveDescription()}
        >Save <FaSave className="inline-block" /></button>
        )}
        
      </div>
    </>
  );
}
