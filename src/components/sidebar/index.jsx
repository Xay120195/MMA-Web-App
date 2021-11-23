// import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
// import { faReact } from '@fortawesome/free-brands-svg-icons';
// import { faChevronDoubleRight, faSignOutAlt } from '@fortawesome/pro-duotone-svg-icons';

import { BiLogOut } from "react-icons/bi";
import { FaReact } from "react-icons/fa";
import { HiChevronDoubleLeft } from "react-icons/hi";

import { SidebarData } from './SidebarData';
import { Link } from 'react-router-dom';
import '../../assets/styles/SideNavigation.css';

const Sidebar = ({showSidebar, userInfo, clickLogout}) => {

    console.log(userInfo);
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
                            <li key={index} onClick={showSidebar}>
                            <Link className="nav-item" to={item.path}>
                                {item.icon}<span>{item.title}</span>
                            </Link>
                            </li>
                        );
                        })}
                    </ul>
                </div>
                <div className="bottom-grid">
                    <div className="logout-btn" onClick={clickLogout}>
                        <BiLogOut style={{ color: 'var(--white)' }} />
                        <span>Log out</span>
                    </div>
                    <div className="avatar-grid">
                        <div className="avatar">
                            { userInfo.attributes !== null &&
                            `${userInfo.attributes.given_name.charAt(0)}${userInfo.attributes.family_name.charAt(0)}`
                            }

                            
                        </div>
                        <div className="details-grid">
                            <span>{userInfo.attributes.email}</span>
                            <span>{userInfo.attributes['custom:company_name']}</span>
                        </div>
                    </div>
                </div>
            </div>
            <div className="spacer-div"> </div>
        </>
    )
}

export default Sidebar;