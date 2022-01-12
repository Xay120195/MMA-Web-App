import React from "react";
// import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
// import { faTachometer, faBooks, faUsers, faUsersCog } from '@fortawesome/pro-light-svg-icons';
import { FaUsersCog, FaUserCog, FaTachometerAlt } from "react-icons/fa";
import { CgProfile } from "react-icons/cg";

import { AppRoutes } from "../../constants/AppRoutes";

const access = JSON.parse(localStorage.getItem("access"));

const staticPages = [
  {
    order: 3,
    title: "Account Settings",
    path: AppRoutes.ACCOUNTSETTINGS,
    icon: <FaUserCog style={{ color: "var(--mysteryGrey)" }} />,
    cName: "nav-text",
  },
];

const taggedPages = access.filter(
  (page) => page.name === "DASHBOARD" || page.name === "USERTYPEACCESS"
);

// for (var i = 0; i < taggedPages.length; i++) {
//   if (taggedPages[i].name === "DASHBOARD") {
//     arrayAccess.push({
//       order: 1,
//       title: "Dashboard",
//       path: AppRoutes.DASHBOARD,
//       icon: <FaTachometerAlt style={{ color: "var(--mysteryGrey)" }} />,
//       cName: "nav-text",
//     });
//   }

//   if (taggedPages[i].name === "USERTYPEACCESS") {
//     arrayAccess.push({
//       order: 2,
//       title: "Users Access",
//       path: AppRoutes.USERTYPEACCESS,
//       icon: <FaUsersCog style={{ color: "var(--mysteryGrey)" }} />,
//       cName: "nav-text",
//     });
//   }
// }

let arrayAccess = taggedPages.map((pages) => {
  let acs = {};

  if (pages.name === "DASHBOARD") {
    acs = {
      order: 1,
      title: "Dashboard",
      path: AppRoutes.DASHBOARD,
      icon: <FaTachometerAlt style={{ color: "var(--mysteryGrey)" }} />,
      cName: "nav-text",
    };
  }

  if (pages.name === "USERTYPEACCESS") {
    acs = {
      order: 2,
      title: "Users Access",
      path: AppRoutes.USERTYPEACCESS,
      icon: <FaUsersCog style={{ color: "var(--mysteryGrey)" }} />,
      cName: "nav-text",
    };
  }

  return acs;
});

arrayAccess = arrayAccess
  .concat(staticPages)
  .sort((a, b) => (a.order > b.order ? 1 : -1));
console.log(arrayAccess);
export const SidebarData = arrayAccess;
