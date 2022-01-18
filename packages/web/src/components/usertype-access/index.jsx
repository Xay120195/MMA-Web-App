import React, { useState, useEffect } from "react";
import ToastNotification from "../toast-notification";
import "../../assets/styles/ContactAccess.css";
import { pages, features } from "./data-source";
import { Info } from "./info";
import { Switch } from "./switch";
import { PageList } from "./page-list";
import { API } from "aws-amplify";

const UserTypeAccess = (props) => {
  const title = "All changes has been saved!";

  const [showToast, setShowToast] = useState(false);
  const [tableHeaders, setTableHeaders] = useState(null);
  const [defaultPages, setDefaultPages] = useState(null);
  const [userAccessSwitch, setUserAccessSwitch] = useState(null);
  const hideToast = () => {
    setShowToast(false);
  };

  const switchChanged = (access, userType, isChecked) => {
    console.group("switchChanged()");
    console.log(userType, isChecked);
    console.log(access);
    updateTaggedPages(access, userType);

    setShowToast(true);
    setTimeout(() => {
      setShowToast(false);
    }, 1000);
  };

  const updateTaggedPages = (new_access, user_type) => {
    var removeSelectedTypeAccess = userAccessSwitch.filter(function (value) {
      return value.userType !== user_type;
    });

    var newAccessPageSet = [
      ...removeSelectedTypeAccess,
      {
        userType: user_type,
        access: new_access,
      },
    ];

    setUserAccessSwitch(newAccessPageSet);
  };

  const contentDiv = {
    margin: "0 0 0 65px",
  };

  useEffect(() => {
    const getAllPages = `
  query getPagesAndAccess($companyId: String) {
    page {
      id
      name
      label
      route
      features {
        id
        label
      }
    }
    companyAccessType(companyId: $companyId) {
      userType
      access {
        id
        features {
          id
        }
      }
    }
  }
`;

    let getPageAccess = async () => {
      console.group("getPageAccess()");
      const params = {
        query: getAllPages,
        variables: {
          companyId: localStorage.getItem("companyId"),
        },
      };

      await API.graphql(params).then((pages) => {
        const { page, companyAccessType } = pages.data;

        if (defaultPages === null) {
          setDefaultPages(page);
        }

        if (userAccessSwitch === null) {
          var userAccess = companyAccessType.sort((a, b) =>
            a.userType.localeCompare(b.userType)
          );

          const firstItem = "OWNER";
          userAccess = userAccess.sort((x, y) => {
            return x.userType === firstItem
              ? -1
              : y.userType === firstItem
              ? 1
              : 0;
          });

          setUserAccessSwitch(userAccess);
          setTableHeaders(userAccess.map((h) => h.userType));
        }

        console.log(defaultPages);
        console.log(userAccessSwitch);
        console.groupEnd();
      });
    };

    // console.log(defaultPages);
    console.log("userAccessSwitch", userAccessSwitch);

    getPageAccess();
  }, [defaultPages, userAccessSwitch]);

  return (
    <>
      {showToast && <ToastNotification title={title} hideToast={hideToast} />}
      <div className="p-5" style={contentDiv}>
        <div className="flex flex-col">
          <div className="-my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
            <div className="py-2 align-middle inline-block min-w-full sm:px-6 lg:px-8">
              <Info
                title="Page Restriction"
                message="Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nulla maximus fringilla tellus eget dapibus. Maecenas id leo sit amet lacus eleifend eleifend et in diam. Vivamus sed pellentesque nunc, sit amet ultricies arcu. Suspendisse a vestibulum libero. Curabitur sed convallis lorem, nec volutpat massa."
              />
              <div className="shadow overflow-hidden border-b border-gray-200 sm:rounded-lg">
                <table className="min-w-full divide-y divide-gray-200 border-separate">
                  <thead>
                    <tr>
                      <th
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        <span className="sr-only">Page/Feature Name</span>
                      </th>
                      {tableHeaders !== null
                        ? tableHeaders.map((header, index) => (
                            <th
                              key={index}
                              scope="col"
                              className="px-6 py-3 text-center text-sm font-semibold text-gray-500 uppercase tracking-wider"
                            >
                              {header}
                            </th>
                          ))
                        : null}
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {defaultPages !== null
                      ? defaultPages.map((page, page_index) => (
                          <React.Fragment key={page_index}>
                            <tr key={`${page.id}_${page_index}`}>
                              <td className="px-6 py-4 whitespace-nowrap font-medium">
                                {page.label}
                              </td>
                              {userAccessSwitch !== null
                                ? userAccessSwitch.map(
                                    (user_access, access_index) => (
                                      <td
                                        key={`${user_access.id}_${access_index}`}
                                        className="px-6 py-4 whitespace-nowrap w-44 place-items-center text-center"
                                      >
                                        <Switch
                                          default_access={page}
                                          user_access={user_access.access}
                                          row_index={access_index}
                                          user_type={user_access.userType}
                                          switchChanged={switchChanged}
                                        />
                                      </td>
                                    )
                                  )
                                : null}
                            </tr>

                            {page.features.map((data, index) => (
                              <tr key={`${data.id}_${index}`}>
                                <td className="px-10 py-4 whitespace-nowrap text-sm text-gray-500 ">
                                  {data.label}
                                </td>
                                {userAccessSwitch !== null
                                  ? userAccessSwitch.map((access, index) => (
                                      <td
                                        key={`${access.id}_${index}`}
                                        className="px-6 py-4 whitespace-nowrap w-44  place-items-center"
                                      >
                                        {/* <Switch
                                          access={access}
                                          row_index={index}
                                          switchChanged={switchChanged}
                                        /> */}
                                      </td>
                                    ))
                                  : null}
                              </tr>
                            ))}
                          </React.Fragment>
                        ))
                      : null}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default UserTypeAccess;
