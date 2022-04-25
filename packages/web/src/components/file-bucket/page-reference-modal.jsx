import React, { useState, useRef, useEffect } from "react";
import { API } from "aws-amplify";
import { FiX } from "react-icons/fi";
import { FaEdit, FaSave, FaBan } from "react-icons/fa";
import "../../assets/styles/pageReferenceModal.css";

export default function PageReferenceModal(props) {
  const [updateProgess, setUpdateProgress] = useState(true);
  const [changeDescription, setChangeDescription] = useState(false);
  let valRef = useRef();

  const handleModalClose = () => {
    props.handleModalClose();
  };

  const setUpdateDescription = () => {
    setUpdateProgress(false);
  }

  const setCancelDescription = () => {
    setUpdateProgress(true);
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

  const handleDescChange = () => {
    props.description === valRef.current.innerHTML ? setChangeDescription(false) : setChangeDescription(true);
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
         className="p-2 font-poppins overflow-auto h-3/6"
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
          onInput={() => handleDescChange()}
        >
        </div><br/>
        
        {updateProgess && (
        <div className="inline-block float-right"><button className="h-10 px-5 m-2 text-white transition-colors duration-150 bg-gray-600 rounded-lg focus:shadow-outline hover:bg-gray-700"
        onClick={() => setUpdateDescription()}
        >Edit <FaEdit className="inline-block" /></button>
        </div>
        )}

        {!updateProgess && !changeDescription &&  (
        <div className="inline-block float-right"><button className="h-10 px-5 m-2 text-black transition-colors duration-150 bg-gray-200 rounded-lg focus:shadow-outline hover:bg-gray-300"
        onClick={() => setCancelDescription()}
        >Cancel <FaBan className="inline-block" /></button>
        </div>
        )}

        {!updateProgess && changeDescription && (
        <div className="inline-block float-right"><button className="h-10 px-5 m-2 text-green-100 transition-colors duration-150 bg-green-600 rounded-lg focus:shadow-outline hover:bg-green-700"
        onClick={() => saveDescription()}
        >Save <FaSave className="inline-block" /></button>
        </div>
        )}
        
      </div>
    </>
  );
}
