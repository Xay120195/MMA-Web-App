import React from "react";

import { API } from "aws-amplify";

export const ModalParagraph = ({
  setShowModalParagraph,
  getBackground,
  setParagraph,
  paragraph,
  setCheckedState,
  witness,
  setSelectedRowsBG,
  setShowDeleteButton,
  matterId,
  setcheckAllState,
}) => {
  let buttonBg = "bg-green-500";

  const handleNewParagraph = async (e) => {
    const arrParagraph = paragraph.split("\n\n");

    const dateToday =
      new Date().getFullYear() +
      "/" +
      (new Date().getMonth() + 1) +
      "/" +
      new Date().getDate();

    arrParagraph.map(async function (x) {
      const dateToday = new Date().toISOString();

      const mCreateBackground = `
        mutation createBackground($clientMatterId: String, $date: AWSDateTime, $description: String) {
          backgroundCreate(clientMatterId: $clientMatterId, date: $date, description: $description) {
            id
          }
        }
    `;

      const createBackgroundRow = await API.graphql({
        query: mCreateBackground,
        variables: {
          clientMatterId: matterId,
          date: dateToday,
          description: "",
        },
      });
      if (createBackgroundRow) {
        getBackground();
        setcheckAllState(false);

        // const newArr = Array(witness.length).fill(false);
        // setCheckedState = newArr;
        setCheckedState(new Array(witness.length).fill(false));
        setSelectedRowsBG([]);
        setShowDeleteButton(false);
      }
      setShowModalParagraph(false);
      setParagraph("");
    });
  };
  const countRow = paragraph.split("\n\n");

  return (
    <>
      <div className="justify-center items-center flex overflow-x-hidden overflow-y-auto fixed inset-0 z-50 outline-none focus:outline-none">
        <div className="relative w-auto my-6 mx-auto max-w-lg">
          <div className="border-0 rounded-lg shadow-lg relative flex flex-col w-full bg-white outline-none focus:outline-none">
            <div className="flex items-start justify-between p-5 border-b border-solid border-blueGray-200 rounded-t">
              <h3 className="text-3xl font-semibold">Add Paragaph</h3>

              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6 cursor-pointer"
                onClick={() => setShowModalParagraph(false)}
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>

            <div className="relative p-6 flex-auto">
              <span>Insert Paragraph will be pasted in the table as rows</span>
              <textarea
                value={paragraph}
                onChange={(e) => setParagraph(e.target.value)}
                className="form-control block w-96 px-3 py-1.5 text-base font-normal text-gray-700 bg-white bg-clip-padding border border-solid border-gray-300 rounded transition ease-in-out m-0 focus:text-gray-700 focus:bg-white focus:border-grey-600 focus:outline-none"
                rows="10"
                placeholder="Copy or paste Paragraphs here"
              ></textarea>
            </div>

            <div className="flex items-center justify-end p-6 border-t border-solid border-blueGray-200 rounded-b">
              <button
                className={`w-full ${
                  paragraph.length <= 0 ? "bg-green-300" : buttonBg
                } text-white active:bg-green-600 font-bold  text-sm px-6 py-3 rounded shadow hover:shadow-lg outline-none focus:outline-none mr-1 mb-1 ease-linear transition-all duration-150`}
                type="button"
                disabled={paragraph.length <= 0}
                onClick={handleNewParagraph}
              >
                <div className="inline-flex">
                  <span className="flex items-center">
                    {" "}
                    {paragraph.length >= 1
                      ? `Add ${countRow.length} rows`
                      : "Add row"}
                  </span>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-6 w-6 mx-1"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M12 9v3m0 0v3m0-3h3m-3 0H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                </div>
              </button>
            </div>
          </div>
        </div>
      </div>
      <div className="opacity-25 fixed inset-0 z-40 bg-black"></div>
    </>
  );
};
