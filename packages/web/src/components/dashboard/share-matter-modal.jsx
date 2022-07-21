import anime from 'animejs';
import { useEffect, useRef, useState } from 'react';
import { CgClose, CgSearch, CgChevronUp, CgPen } from 'react-icons/cg';

const ShareMatterModal = ({ closeHandler }) => {
  const autoSuggestionInput = useRef(null);
  const modalOverlay = useRef(null);
  const modalContainer = useRef(null);

  const [autoSuggestionShown, setAutoSuggestionShown] = useState(false);
  const [thisUser, setThisUser] = useState({
    lastName: '',
    firstName: '',
    email: '',
  });

  const closeModal = (e) => {
    closeHandler();
  };

  useEffect((e) => {
    // get data from local storage
    const user = {
      lastName: localStorage.getItem('lastName'),
      firstName: localStorage.getItem('firstName'),
      email: localStorage.getItem('email'),
    };

    setThisUser(user);

    anime({
      targets: modalOverlay.current,
      opacity: [0, 1],
      duration: 200,
      easing: 'easeInOutQuad',
      complete: () => {
        anime({
          targets: modalContainer.current,
          scale: [0.9, 1],
          opacity: [0, 1],
          duration: 200,
          easing: 'easeInOutQuad',
        });
      },
    });
  }, []);

  return (
    <>
      <main
        ref={modalOverlay}
        onClick={(e) => e.currentTarget === e.target && closeModal()}
        className="opacity-0 fixed top-0 left-0 w-screen h-screen min-h-[600px] max-h-[800px] bg-black bg-opacity-60 flex justify-center items-center"
      >
        <div
          ref={modalContainer}
          className="w-full mx-5 max-w-3xl p-5 bg-white rounded-lg opacity-0"
        >
          {/* header */}
          <div className="w-full flex justify-between">
            <div className="flex flex-col gap-2">
              <p className="text-lg md:text-xl">
                Invite people to collaborate with file
              </p>
              <p>
                <span className="font-semibold">Company Name</span> - Company
                Owner
              </p>
            </div>
            <div className="ml-5">
              <div
                onClick={(e) => closeHandler()}
                className="w-10 h-10 rounded-full bg-gray-300 flex justify-center items-center cursor-pointer"
              >
                <CgClose />
              </div>
            </div>
          </div>

          {/* search bar */}
          <div className="w-full mt-10 relative">
            <div className="flex items-center px-3 gap-2 bg-gray-100 border-2 border-gray-200 focus:outline-2 focus:outline-offset-4">
              <CgSearch />
              <input
                onChange={(e) =>
                  setAutoSuggestionShown(e.currentTarget.value.length > 0)
                }
                ref={autoSuggestionInput}
                className="px-3 py-2  w-full bg-transparent border-none text-gray-800 focus:outline-2 focus:outline-offset-4"
                placeholder="Search for someone or a team"
              />
              {/* close autosuggestion */}
              <div
                className="flex items-center w-max gap-3 cursor-pointer"
                onClick={(e) => setAutoSuggestionShown(false)}
              >
                <CgChevronUp />
              </div>
            </div>
            {/* auto suggestion */}
            {autoSuggestionShown && (
              <div className="absolute w-full p-5 bg-gray-200 top-12 rounded-b-lg shadow-lg">
                <p>Auto suggestions goes here</p>
              </div>
            )}
          </div>

          {/* people */}
          <div className="w-full mt-10">
            <div className="flex justify-between items-center mb-5">
              <p className="text-lg font-semibold">In this File</p>

              <div className="flex items-center gap-3 text-cyan-500 cursor-pointer border-cyan-500 px-5 py-3">
                <p className="text-cyan-500">Edit Access</p>
                <CgPen color="#00BCD4" />
              </div>
            </div>

            {/* list */}
            <div className="flex flex-col gap-3">
              {/* user card */}
              <div className="p-0 md:p-2 flex gap-2 items-center">
                {/* avatar */}
                <div className="hidden md:flex w-9 h-9 rounded-full overflow-hidden justify-center items-center bg-gray-400 text-white font-semibold text-sm">
                  <p>GC</p>
                </div>
                {/* owner detail */}
                <div className="flex flex-col justify-center">
                  <p className="font-semibold ">
                    {thisUser.firstName} {thisUser.lastName}{' '}
                    <span className="px-2 text-sm rounded-full font-semibold text-blue-600 bg-blue-200">
                      YOU
                    </span>
                  </p>
                  <p>{thisUser.email}</p>
                </div>
              </div>
              {/* added users go here as cards same as above */}
              {/* 
                .
                .
                .
               */}
            </div>
          </div>
        </div>
      </main>
    </>
  );
};

export default ShareMatterModal;
