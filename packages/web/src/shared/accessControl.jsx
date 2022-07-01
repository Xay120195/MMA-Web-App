import { API } from "aws-amplify";

const getAllPages = `
    query getAllPages($companyId: String, $userType: UserType) {
      pages {
        id
        name
        features {
          id
          name
        }
      }
      companyAccessType(companyId: $companyId, userType: $userType) {
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

const AccessControl = async (pagename) => {
  let result;

  const user_type = localStorage.getItem("userType"),
    company_id = localStorage.getItem("companyId");

  const page_access = await API.graphql({
    query: getAllPages,
    variables: {
      companyId: company_id,
      userType: user_type,
    },
  });

  // console.log(page_access);

  const page = page_access.data.pages.filter((f) => f.name === pagename);

  if (page.length !== 0) {
    var userAccess = page_access.data.companyAccessType[0].access;

    // console.log("userAccess",userAccess);

    userAccess = userAccess.find((p) => p.id === page[0].id);

    if (userAccess !== undefined) {
      const userAccessIDs = userAccess.features.map((f) => f.id);

      var retainedPageNames = page[0].features.filter(
        (f) => userAccessIDs.includes(f.id) && f
      );

      retainedPageNames = retainedPageNames.map((f) => f.name);

      console.log("pagename", pagename);
      result = {
        status: "allow",
        data: {
          name: page[0].name,
          features: retainedPageNames,
        },
      };
    } else {
      result = {
        status: "restrict",
        message: `${user_type} has no access to ${pagename} page`,
      };
    }
  } else {
    result = {
      status: "restrict",
      message: `${user_type} has no access to ${pagename} page`,
    };
  }
  return result;
};

export default AccessControl;
