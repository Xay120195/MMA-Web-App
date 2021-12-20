import React from 'react';
// import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
// import { faTachometer, faBooks, faUsers, faUsersCog } from '@fortawesome/pro-light-svg-icons';
import { FaUsersCog, FaUserCog, FaTachometerAlt } from "react-icons/fa";
import { CgProfile } from "react-icons/cg";

import { AppRoutes } from "../../constants/AppRoutes";

export const SidebarData = [
  {
    title: 'Dashboard',
    path: AppRoutes.DASHBOARD,
    icon: <FaTachometerAlt style={{ color: 'var(--mysteryGrey)' }} />,
    cName: 'nav-text'
  },{
    title: 'Users Access',
    path: AppRoutes.USERTYPEACCESS,
    icon: <FaUsersCog style={{ color: 'var(--mysteryGrey)' }} />,
    cName: 'nav-text'
  },
  {
    title: 'Account Settings',
    path: AppRoutes.ACCOUNTSETTINGS,
    icon: <FaUserCog style={{ color: 'var(--mysteryGrey)' }} />,
    cName: 'nav-text'
  }
  // {
  //   title: 'Profile',
  //   path: AppRoutes.PROFILE,
  //   icon: <CgProfile style={{ color: 'var(--mysteryGrey)' }} />,
  //   cName: 'nav-text'
  // }
];
