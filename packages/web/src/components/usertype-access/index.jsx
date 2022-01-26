import React, { useState, useEffect } from "react";
import ToastNotification from "../toast-notification";
import "../../assets/styles/ContactAccess.css";
import { Info } from "./info";
import { Switch } from "./switch";
import { LockAccess } from "./lock";
//import { PageList } from "./page-list";
import { API } from "aws-amplify";

const UserTypeAccess = (props) => {
  const title = "All changes has been saved!";

  const [showToast, setShowToast] = useState(false);
  const [tableHeaders, setTableHeaders] = useState(null);
  const [defaultPages, setDefaultPages] = useState(null);
  const [userAccessSwitch, setUserAccessSwitch] = useState(null);
  const [switchIsTriggered, setSwitchIsTriggered] = useState(null);
  const [lockIsTriggered, setLockIsTriggered] = useState(null);

  const hideToast = () => {
    setShowToast(false);
  };

  const switchChanged = (id, access, userType) => {
    updateTaggedPages(id, access, userType);
  };

  const lockIsClicked = (isChecked, feature_id) => {
    setLockIsTriggered({
      feature_id: feature_id,
      is_checked: isChecked,
    });
  };

  const switchIsClicked = (isChecked, page_id) => {
    setSwitchIsTriggered({
      page_id: page_id,
      is_checked: isChecked,
    });
  };

  const lockChanged = (id, access, userType) => {
    updateTaggedFeature(id, access, userType);
  };

  const updateTaggedFeature = (id, new_access, user_type) => {
    userAccessSwitch.map((page) => {
      if (page.userType === user_type) {
        return (
          new_access !== undefined &&
          page.access.map((p) => {
            if (p.id === new_access.id) {
              return new_access;
            }
            return p;
          })
        );
      }
      return page;
    });

    lockIsTriggered !== null &&
      switchIsTriggered === null &&
      updatePageAccess(id, userAccessSwitch);
  };

  const updateTaggedPages = (id, new_access, user_type) => {
    var removeSelectedTypeAccess = userAccessSwitch.filter(function (value) {
      return value.userType !== user_type;
    });

    var newAccessPageSet = [
      ...removeSelectedTypeAccess,
      {
        id: id,
        userType: user_type,
        access: new_access,
      },
    ];

    newAccessPageSet = newAccessPageSet.sort((a, b) =>
      a.userType.localeCompare(b.userType)
    );

    const firstItem = "OWNER";
    newAccessPageSet = newAccessPageSet.sort((x, y) => {
      return x.userType === firstItem ? -1 : y.userType === firstItem ? 1 : 0;
    });

    setUserAccessSwitch(newAccessPageSet);
    setTableHeaders(newAccessPageSet.map((h) => h.userType));

    switchIsTriggered !== null && updatePageAccess(id, newAccessPageSet);
  };

  const contentDiv = {
    margin: "0 0 0 65px",
  };

  useEffect(() => {
    if (defaultPages === null && userAccessSwitch === null) {
      getPageAccess();
    }
  }, [defaultPages, userAccessSwitch]);

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
      id
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
    const params = {
      query: getAllPages,
      variables: {
        companyId: localStorage.getItem("companyId"),
      },
    };

    await API.graphql(params).then((pages) => {
      const { page, companyAccessType } = pages.data;
      setDefaultPages(page);

      var userAccess = companyAccessType.sort((a, b) =>
        a.userType.localeCompare(b.userType)
      );

      const firstItem = "OWNER";
      userAccess = userAccess.sort((x, y) => {
        return x.userType === firstItem ? -1 : y.userType === firstItem ? 1 : 0;
      });

      setUserAccessSwitch(userAccess);
      setTableHeaders(userAccess.map((h) => h.userType));
    });
  };

  let updatePageAccess = async (id, userAccess) => {
    if (id !== undefined) {
      await updateCompanyAccessType(id, userAccess).then(() => {
        setShowToast(true);
        setTimeout(() => {
          setShowToast(false);
        }, 1000);
      });
    }
  };

  const mUpdateCompanyAccessType = `
    mutation updateCompanyAccessType($id: String, $access: [AccessInput]) {
      companyAccessTypeUpdate(
        id: $id
        access: $access
      ) {
        id
      }
    }`;

  async function updateCompanyAccessType(id, access) {
    return new Promise((resolve, reject) => {
      try {
        var userAccess = access.filter(function (value) {
          return value.id === id;
        });

        userAccess = userAccess.map((a) => a.access);

        const request = API.graphql({
          query: mUpdateCompanyAccessType,
          variables: {
            id: id,
            access: userAccess[0],
          },
        });

        resolve(request);
      } catch (e) {
        reject(e.errors[0].message);
      }
    });
  }

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
                                <br />
                                {page.id}
                              </td>
                              {userAccessSwitch !== null &&
                                userAccessSwitch.map(
                                  (user_access, access_index) => (
                                    <td
                                      key={access_index}
                                      className="px-6 py-4 whitespace-nowrap w-44 place-items-center text-center"
                                    >
                                      <Switch
                                        default_access={page}
                                        user_access_id={user_access.id}
                                        user_access={user_access.access}
                                        user_type={user_access.userType}
                                        switchChanged={switchChanged}
                                        switchIsClicked={switchIsClicked}
                                      />
                                    </td>
                                  )
                                )}
                            </tr>

                            {page.features.map((data, index) => (
                              <tr key={`${data.id}_${index}`}>
                                <td className="px-10 py-4 whitespace-nowrap text-sm text-gray-500 ">
                                  {data.label}
                                  <br />
                                  {data.id}
                                </td>
                                {userAccessSwitch !== null
                                  ? userAccessSwitch.map((access, index) => (
                                      <td
                                        key={`${access.id}_${index}`}
                                        className="px-6 py-2 whitespace-nowrap w-44 place-items-center text-center"
                                      >
                                        <LockAccess
                                          user_access_id={access.id}
                                          feature_id={data.id}
                                          default_features={page}
                                          feature_access={access.access}
                                          row_index={index}
                                          user_type={access.userType}
                                          lockChanged={lockChanged}
                                          lockIsClicked={lockIsClicked}
                                          switchIsTriggered={switchIsTriggered}
                                        />
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
