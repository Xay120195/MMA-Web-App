// import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
// import { faReact } from '@fortawesome/free-brands-svg-icons';
// import { faChevronDoubleRight, faSignOutAlt } from '@fortawesome/pro-duotone-svg-icons';

import '../../assets/styles/SideNavigation.css';

import { Link, useLocation } from 'react-router-dom';
import React, { useEffect, useState } from 'react';

import AccessControl from '../../shared/accessControl';
import { CgLogOut } from 'react-icons/cg';
import { FaReact } from 'react-icons/fa';
import { HiChevronDoubleLeft } from 'react-icons/hi';
import { SidebarData } from './SidebarData';

const Sidebar = ({ showSidebar, userInfo, clickLogout }) => {
  const location = useLocation();
  const [showDashboard, setShowDashboard] = useState(false);
  const [showInbox, setShowInbox] = useState(false);
  const [showUserTypeAccess, setShowUserTypeAccess] = useState(false);
  useEffect(() => {
    featureAccessFilters();
  });

  const featureAccessFilters = async () => {
    const dashboardAccess = await AccessControl('DASHBOARD');
    const userTypeAccess = await AccessControl('USERTYPEACCESS');
    const inboxAccess = await AccessControl('INBOX');

    if (inboxAccess.status !== 'restrict') {
      setShowInbox(true);
    } else {
      console.log(inboxAccess.message);
    }

    if (dashboardAccess.status !== 'restrict') {
      setShowDashboard(true);
    } else {
      console.log(dashboardAccess.message);
    }

    if (userTypeAccess.status !== 'restrict') {
      setShowUserTypeAccess(true);
    } else {
      console.log(userTypeAccess.message);
    }
  };
  return (
    <>
      <div className="sidebar">
        <div className="main-grid">
          <div className="logo-grid">
            <FaReact
              className="logo-icon"
              style={{ color: 'var(--mysteryGrey)' }}
            />
            <button>
              <HiChevronDoubleLeft
                onClick={showSidebar}
                style={{ color: 'var(--mysteryGrey)' }}
              />
            </button>
          </div>
          <ul className="nav-menus">
            {userInfo &&
              SidebarData.map((item, index) => {
                return (item.name === 'DASHBOARD' && showDashboard) ||
                  (item.name === 'USERTYPEACCESS' && showUserTypeAccess) ||
                  item.name === 'CONTACTS' ||
                  (item.name === 'INBOX' && showInbox) ||
                  item.name === 'ACCOUNTSETTINGS' ? (
                  <li
                    className={
                      location.pathname === item.path ? 'active-page' : ''
                    }
                    key={index}
                  >
                    <Link className="nav-item" to={item.path}>
                      {item.icon}
                      <span>{item.title}</span>
                    </Link>
                  </li>
                ) : null;
              })}
          </ul>
          <hr />
          <div className="logout-btn" onClick={clickLogout}>
            <CgLogOut style={{ color: 'var(--mysteryGrey)' }} />
            <span>Log out</span>
          </div>
        </div>
        <div>
          {userInfo && (
            <div className="avatar-grid">
              <div className="avatar">
                {`${userInfo['firstName'].charAt(0)}${userInfo[
                  'lastName'
                ].charAt(0)}`}
              </div>
              <div className="details-grid">
                <span className="name-txt">
                  {userInfo['firstName']} {userInfo['lastName']}
                </span>
                <span>{userInfo['company']}</span>
              </div>
            </div>
          )}
        </div>
      </div>
      <div className="spacer-div"> </div>
    </>
  );
};

export default Sidebar;
