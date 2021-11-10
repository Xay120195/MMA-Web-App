import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faTachometer, faBooks, faUsers, faUsersCog } from '@fortawesome/pro-light-svg-icons';
import { AppRoutes } from "../../constants/AppRoutes";

export const SidebarData = [
  {
    title: 'Dashboard',
    path: AppRoutes.DASHBOARD,
    icon: <FontAwesomeIcon icon={faTachometer} style={{ color: 'var(--mysteryGrey)' }} />,
    cName: 'nav-text'
  },
  // {
  //   title: 'Matters',
  //   path: AppRoutes.MATTERS,
  //   icon: <IoIcons.IoIosPaper />,
  //   cName: 'nav-text'
  // },
  {
    title: 'Users Access',
    path: AppRoutes.USERACCESS,
    icon: <FontAwesomeIcon icon={faUsers} style={{ color: 'var(--mysteryGrey)' }} />,
    cName: 'nav-text'
  },
  {
    title: 'Profile',
    path: AppRoutes.PROFILE,
    icon: <FontAwesomeIcon icon={faUsersCog} style={{ color: 'var(--mysteryGrey)' }} />,
    cName: 'nav-text'
  }
];
