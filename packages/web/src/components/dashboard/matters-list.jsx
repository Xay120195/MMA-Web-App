import React, { useContext } from 'react';
import { Link } from 'react-router-dom';
import { AppRoutes } from '../../constants/AppRoutes';
import dateFormat from 'dateformat';
import '../../assets/styles/Dashboard.css';
import * as FaIcons from 'react-icons/fa';
import * as IoIcons from 'react-icons/io5';
import { MatterContext } from './index';
import Loading from '../loading/loading';
import useWindowDimensions from './windowDimensions';

export function ClientMatters() {
  const setshowDeleteModal = (displayStatus, id) => {
    onShowDeleteModal(displayStatus, id);
  };

  const {
    clientMatter,
    view,
    onShowDeleteModal,
    showDeleteMatter,
    allowOpenMatter,
    allowOpenFileBucket,
    allowOpenBackground,
    allowOpenRFI,
    loading,
    error,
  } = useContext(MatterContext);

  const { height, width } = useWindowDimensions();

  //console.log("List of Client/Matters", clientMatter);

  const currentUserEmail = localStorage.getItem('email');

  function userAccessibleMatter(clientMatterId) {
    var arrEmails = [
        'mmatest.khr+uat@gmail.com',
        'mmatest.khr+access@gmail.com',
        'meredith.ziegler@contractsspecialist.com.au',
      ],
      arrClientMatters = [
        'd9f93246-e0dd-49d1-9dd8-f148df2f30bb',
        '95813381-661c-4512-89dc-e1f2fe4181bb',
      ]; // Deanna Spicer/Dwyer Building

    if (
      arrClientMatters.includes(clientMatterId) &&
      arrEmails.includes(currentUserEmail)
    ) {
      return false;
    } else {
      return true;
    }
  }

  function utf8_to_b64(str) {
    return window.btoa(unescape(encodeURIComponent(str)));
  }

  return (
    <>
      {view === 'grid' || width < 640 ? (
        <>
          {loading ? (
            <Loading content={'Please wait...'} />
          ) : clientMatter.length <= 0 ? (
            <div className="col-span-full text-center font-semibold">
              <p>No result found.</p>
            </div>
          ) : (
            <>
              {clientMatter.map(
                (item) =>
                  userAccessibleMatter(item.id) && (
                    <div
                      className="w-full h-auto minh bg-gray-100 rounded-lg border border-gray-200 py-5 px-4 hover:shadow-md shadow-sm transition-shadow duration-200"
                      key={item.id}
                    >
                      <div>
                        {allowOpenFileBucket ||
                        allowOpenBackground ||
                        allowOpenRFI ||
                        showDeleteMatter ? (
                          <div className="p-1 ml-auto bg-transparent border-0 text-black opacity-4 float-right text-3xl leading-none font-semibold outline-none focus:outline-none">
                            <div className="dropdown">
                              <button className="bg-gray-100 text-gray-900 font-semibold rounded inline-flex dropDownButton">
                                <IoIcons.IoEllipsisVertical className="hovered" />
                              </button>
                              <ul className="sm:absolute hidden text-gray-900 p-4 font-bold shadow-md z-50 dropDownCSS">
                                {allowOpenRFI ? (
                                  <li className="my-2 p-2 sm:my-0 rounded-lg">
                                    <Link
                                      to={`${AppRoutes.MATTERSRFI}/${
                                        item.id
                                      }/?matter_name=${utf8_to_b64(
                                        item.matter.name
                                      )}&client_name=${utf8_to_b64(
                                        item.client.name
                                      )}`}
                                    >
                                      RFI List
                                    </Link>
                                  </li>
                                ) : null}
                                {allowOpenFileBucket ? (
                                  <li className="my-2 p-2 sm:my-0 rounded-lg">
                                    <Link
                                      to={`${AppRoutes.FILEBUCKET}/${
                                        item.id
                                      }/000/?matter_name=${utf8_to_b64(
                                        item.matter.name
                                      )}&client_name=${utf8_to_b64(
                                        item.client.name
                                      )}`}
                                    >
                                      File Bucket
                                    </Link>
                                  </li>
                                ) : null}
                                {allowOpenBackground ? (
                                  <li className="my-2 p-2 sm:my-0 rounded-lg">
                                    <Link
                                      to={`${AppRoutes.BRIEFS}/${
                                        item.id
                                      }/?matter_name=${utf8_to_b64(
                                        item.matter.name
                                      )}&client_name=${utf8_to_b64(
                                        item.client.name
                                      )}`}
                                    >
                                      Background Page
                                    </Link>
                                  </li>
                                ) : null}
                                {showDeleteMatter && (
                                  <li
                                    className="my-2 p-2 sm:my-0 rounded-lg cursor-pointer text-red-500"
                                    onClick={() =>
                                      setshowDeleteModal(true, item.id)
                                    }
                                  >
                                    Delete
                                  </li>
                                )}
                              </ul>
                            </div>
                          </div>
                        ) : null}

                        <div>
                          <div>
                            <h4
                              tabIndex="0"
                              className="focus:outline-none text-gray-800 dark:text-gray-100 font-bold"
                            >
                              {item.matter.name}
                            </h4>
                            <p
                              tabIndex="0"
                              className="focus:outline-none text-gray-800 dark:text-gray-100 text-sm"
                            >
                              {item.client.name}
                            </p>
                          </div>
                          <div className="flex justify-between items-end mt-7">
                            <div>
                              <img
                                className="relative z-30 inline object-cover w-8 h-8 border-2 border-white rounded-full"
                                src={
                                  item.substantially_responsible.profile_picture
                                }
                                alt={item.substantially_responsible.name}
                                title={item.substantially_responsible.name}
                              />
                            </div>
                            <div>
                              <p
                                tabIndex="0"
                                className="focus:outline-none text-gray-400 dark:text-gray-100 text-xs"
                              >
                                {dateFormat(
                                  clientMatter.createdAt,
                                  'dd mmmm yyyy'
                                )}
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )
              )}
            </>
          )}
        </>
      ) : (
        <>
          {loading ? (
            <Loading content={'Please wait...'} />
          ) : clientMatter.length <= 0 ? (
            <div className="col-span-full text-center font-semibold">
              <p>No result found.</p>
            </div>
          ) : (
            <>
              {clientMatter.map((item) => (
                <div
                  className="w-full h-42 bg-gray-100 rounded-lg border border-gray-200 py-5 px-4"
                  key={item.id}
                >
                  <div>
                    {allowOpenFileBucket ||
                    allowOpenRFI ||
                    allowOpenBackground ||
                    showDeleteMatter ? (
                      <div className="p-1 ml-auto bg-transparent border-0 text-black opacity-4 float-right text-3xl leading-none font-semibold outline-none focus:outline-none">
                        <div className="dropdown">
                          <button className="bg-gray-100 text-gray-700 font-semibold rounded inline-flex">
                            <IoIcons.IoEllipsisVertical />
                          </button>
                          <ul className="dropdown-menu right-8 absolute hidden text-gray-700 pt-1 bg-white p-2 font-semibold rounded">
                            {allowOpenRFI ? (
                              <li className="p-2">
                                <Link
                                  to={`${AppRoutes.MATTERSRFI}/${
                                    item.id
                                  }/?matter_name=${utf8_to_b64(
                                    item.matter.name
                                  )}&client_name=${utf8_to_b64(
                                    item.client.name
                                  )}`}
                                >
                                  RFI List
                                </Link>
                              </li>
                            ) : null}
                            {allowOpenFileBucket ? (
                              <li className="p-2">
                                <Link
                                  to={`${AppRoutes.FILEBUCKET}/${
                                    item.id
                                  }/000/?matter_name=${utf8_to_b64(
                                    item.matter.name
                                  )}&client_name=${utf8_to_b64(
                                    item.client.name
                                  )}`}
                                >
                                  File Bucket
                                </Link>
                              </li>
                            ) : null}
                            {allowOpenBackground ? (
                              <li className="p-2">
                                <Link
                                  to={`${AppRoutes.BACKGROUND}/${
                                    item.id
                                  }/?matter_name=${utf8_to_b64(
                                    item.matter.name
                                  )}&client_name=${utf8_to_b64(
                                    item.client.name
                                  )}`}
                                >
                                  Background
                                </Link>
                              </li>
                            ) : null}
                            {showDeleteMatter && (
                              <li
                                className="p-2 cursor-pointer mt-5"
                                onClick={() =>
                                  setshowDeleteModal(true, item.id)
                                }
                              >
                                Delete
                              </li>
                            )}
                          </ul>
                        </div>
                      </div>
                    ) : null}
                    {/* <Link to={redirectToBackground}> */}
                    <div className="grid grid-cols-4 gap-4">
                      <div className="col-span-2">
                        <h4
                          tabIndex="0"
                          className="focus:outline-none text-gray-800 dark:text-gray-100 font-bold"
                        >
                          {item.matter.name}
                        </h4>
                        <p
                          tabIndex="0"
                          className="focus:outline-none text-gray-500"
                        >
                          {item.client.name}
                        </p>
                        <p
                          tabIndex="0"
                          className="focus:outline-none text-gray-400 dark:text-gray-100 text-xs mt-5"
                        >
                          {dateFormat(
                            item.createdAt,
                            'dd mmmm yyyy, h:MM:ss TT'
                          )}
                        </p>
                      </div>
                      {/* <div className="col-span-2 grid place-self-end mb-2">
              <img
                className="relative z-30 inline object-cover w-8 h-8 border-2 border-white rounded-full"
                src={clientMatter.substantially_responsible.profile_picture}
                alt={clientMatter.substantially_responsible.name}
                title={clientMatter.substantially_responsible.name}
              />
            </div> */}
                    </div>
                    {/* </Link> */}
                  </div>
                </div>
              ))}
            </>
          )}
        </>
      )}
    </>
  );
}
