import React, { useState, useEffect } from 'react';
import { FaBars } from 'react-icons/fa';
import { Link, useHistory } from 'react-router-dom';
import { Auth } from "aws-amplify";
// import '../../assets/styles/Navbar.css';
import { IconContext } from 'react-icons';
import Sidebar from '../sidebar';
import { SidebarData } from './SidebarData';

import { BiLogOut } from "react-icons/bi";
import { FaReact } from "react-icons/fa";
import { HiChevronDoubleRight } from "react-icons/hi";

function Navbar() {
  const [sidebar, setSidebar] = useState(false);
  const showSidebar = () => setSidebar(!sidebar);
  const [location, setlocation] = useState(window.location.pathname);
  const [userInfo, setuserInfo] = useState(null);


  let history = useHistory();

  const clickLogout = async (e) => {
    e.preventDefault();
    if (window.confirm("Are you sure you want to logout?")) {
      setSidebar(false);
      try {
        await Auth.signOut();
        console.log('Sign out completed.');
        history.push("/");

      } catch (error) {
        console.log('Error signing out: ', error);
      }
    } else {
      return false;
    }
  }

  useEffect(() => {
    // setSidebar(false); -- identify if the user changed the location/path
  }, []);

  history.listen((location) => {
    setlocation(location.pathname);
  })

  useEffect(() => {
    let getUser = async () => {
      try {
        let user = await Auth.currentAuthenticatedUser();
        await setuserInfo(user);
      } catch (error) {
        console.log(error)
      }
    }
    getUser();
  }, []);


  return (
    <>
      {location !== '/' &&
        <IconContext.Provider value={{ color: '#fff' }}>
          {/* <div className='navbar'>
            <Link to='#' className='menu-bars bg-gray-400' >
              <FaBars onClick={showSidebar} />
            </Link>
          </div> */}
          <div className="sidebar-collapsed sidebar">
            <div className="main-grid">
              <div className="logo-grid-collapsed">
                <FaReact className="logo-icon" style={{ color: 'var(--mysteryGrey)' }} />
                <button><HiChevronDoubleRight onClick={showSidebar} style={{ color: 'var(--mysteryGrey)' }} /></button>
              </div>
              <ul className="nav-menus">
                {SidebarData.map((item, index) => {
                  return (
                    // <li key={index} onClick={showSidebar}>
                    <li key={index}>
                      <Link className="nav-item-collapsed nav-item" to={item.path}>
                        {item.icon}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </div>
            <div className="bottom-grid">
              <div className="logout-btn-collapsed logout-btn" onClick={clickLogout}>
                <BiLogOut style={{ color: 'var(--white)' }} />
              </div>
              <div className="avatar-grid-collapsed">
                <div className="avatar">
                  CE
                </div>
              </div>
            </div>
          </div>
          {sidebar && <Sidebar showSidebar={showSidebar} userInfo={userInfo} clickLogout={clickLogout} />}

        </IconContext.Provider>
      }
    </>
  );
}



export default Navbar;