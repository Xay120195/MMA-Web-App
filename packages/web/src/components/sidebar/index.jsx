// import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
// import { faReact } from '@fortawesome/free-brands-svg-icons';
// import { faChevronDoubleRight, faSignOutAlt } from '@fortawesome/pro-duotone-svg-icons';
import React, { useState } from 'react';
import { CgLogOut } from "react-icons/cg";
import { FaReact } from "react-icons/fa";
import { HiChevronDoubleLeft } from "react-icons/hi";

import { SidebarData } from './SidebarData';
import { Link, useLocation } from 'react-router-dom';
import '../../assets/styles/SideNavigation.css';

const Sidebar = ({ showSidebar, userInfo, clickLogout }) => {

    const location = useLocation();

    return (
        <>
            <div className="sidebar">
                <div className="main-grid">
                    <div className="logo-grid">
                        <FaReact className="logo-icon" style={{ color: 'var(--mysteryGrey)' }} />
                        <button><HiChevronDoubleLeft onClick={showSidebar} style={{ color: 'var(--mysteryGrey)' }} /></button>
                    </div>
                    <ul className="nav-menus">
                        {SidebarData.map((item, index) => {
                            return (
                                <li key={index} className={location.pathname === item.path ? "active-page" : ""}>
                                    <Link className="nav-item" to={item.path}>
                                        {item.icon}<span>{item.title}</span>
                                    </Link>
                                </li>
                            );
                        })}
                    </ul>
                    <hr/>
                    <div className="logout-btn" onClick={clickLogout}>
                        <CgLogOut style={{ color: 'var(--mysteryGrey)' }} />
                        <span>Log out</span>
                    </div>
                </div>
                <div>
                    {userInfo !== null &&
                        <div className="avatar-grid">
                            <div className="avatar">
                                {
                                    `${userInfo['firstName'].charAt(0)}${userInfo['lastName'].charAt(0)}`
                                }
                            </div>
                            <div className="details-grid">
                                <span className="name-txt">{userInfo['firstName']} {userInfo['lastName']}</span>
                                <span>{userInfo['company']}</span>
                            </div>
                        </div>
                    }
                </div>
            </div>
            <div className="spacer-div"> </div>
        </>
    )
}

export default Sidebar;