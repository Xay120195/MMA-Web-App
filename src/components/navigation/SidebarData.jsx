import React from 'react';
import * as FaIcons from 'react-icons/fa';
import * as AiIcons from 'react-icons/ai';
import * as IoIcons from 'react-icons/io';
import { AppRoutes } from "../../constants/AppRoutes";

export const SidebarData = [
  {
    title: 'Dashboard',
    path: AppRoutes.DASHBOARD,
    icon: <AiIcons.AiFillHome />,
    cName: 'nav-text'
  },
  {
    title: 'Matters',
    path: AppRoutes.MATTERS,
    icon: <IoIcons.IoIosPaper />,
    cName: 'nav-text'
  },
  {
    title: 'Users Access',
    path: AppRoutes.USERACCESS,
    icon: <IoIcons.IoIosPeople />,
    cName: 'nav-text'
  },
  {
    title: 'Profile',
    path: AppRoutes.PROFILE,
    icon: <IoIcons.IoIosContacts />,
    cName: 'nav-text'
  }
];
