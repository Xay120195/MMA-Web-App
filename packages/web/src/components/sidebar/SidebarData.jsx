import React from 'react';
// import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
// import { faTachometer, faBooks, faUsers, faUsersCog } from '@fortawesome/pro-light-svg-icons';
// import { CgProfile } from "react-icons/cg";
import { FaUsersCog, FaUserCog, FaTachometerAlt, FaGoogle } from "react-icons/fa";

import { AppRoutes } from "../../constants/AppRoutes";

export const SidebarData = [
  {
    order: 1,
    name: 'DASHBOARD',
    title: 'Dashboard',
    path: AppRoutes.DASHBOARD,
    icon: <FaTachometerAlt style={{ color: 'var(--mysteryGrey)' }} />,
    cName: 'nav-text'
  },{
    order: 2,
    name: 'USERTYPEACCESS',
    title: 'Users Access',
    path: AppRoutes.USERTYPEACCESS,
    icon: <FaUsersCog style={{ color: 'var(--mysteryGrey)' }} />,
    cName: 'nav-text'
  },
  {
    order: 3,
    name: 'ACCOUNTSETTINGS',
    title: 'Account Settings',
    path: AppRoutes.ACCOUNTSETTINGS,
    icon: <FaUserCog style={{ color: 'var(--mysteryGrey)' }} />,
    cName: 'nav-text'
  },
  {
    order: 4,
    name: 'INBOX',
    title: 'Inbox',
    path: AppRoutes.INBOX,
    icon: <FaGoogle style={{ color: 'var(--mysteryGrey)' }} />,
    cName: 'nav-text'
  }
  // {
  //   title: 'Profile',
  //   path: AppRoutes.PROFILE,
  //   icon: <CgProfile style={{ color: 'var(--mysteryGrey)' }} />,
  //   cName: 'nav-text'
  // }
];