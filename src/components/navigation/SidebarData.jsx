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
  }
];
