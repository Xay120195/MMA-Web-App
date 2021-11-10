import React, { useState } from 'react';
import * as FaIcons from 'react-icons/fa';
import * as AiIcons from 'react-icons/ai';
import { Link, useHistory } from 'react-router-dom';
import { Auth } from "aws-amplify";
import { SidebarData } from './SidebarData';
import '../../assets/styles/Navbar.css';
import { IconContext } from 'react-icons';
import Navigation from '../side-navigation';

function Navbar() {
  const [sidebar, setSidebar] = useState(false);
  const showSidebar = () => setSidebar(!sidebar);
  
  let history = useHistory();

  const clickLogout = async (e) => {
    e.preventDefault();
    if(window.confirm("Are you sure you want to logout?")){
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

  return (
    <>
      <IconContext.Provider value={{ color: '#fff' }}>
        <div className='navbar'>
          <Link to='#' className='menu-bars bg-gray-400' >
            <FaIcons.FaBars onClick={showSidebar} />
          </Link>
        </div>
        {sidebar && <Navigation showSidebar={showSidebar} clickLogout={clickLogout}/>}
        {/* <nav className={sidebar ? 'nav-menu active' : 'nav-menu'}>
          <ul className='nav-menu-items' onClick={showSidebar}>
            <li className='navbar-toggle'>
              <Link to='#' className='menu-bars'>
                <AiIcons.AiOutlineClose />
              </Link>
            </li>
            {SidebarData.map((item, index) => {
              return (
                <li key={index} className={item.cName}>
                  <Link to={item.path}>
                    {item.icon}<span>{item.title}</span>
                  </Link>
                </li>
              );
            })}
            <li className='logoutButton' onClick={clickLogout} >
            <button className="bg-transparent ml-8 mt-2 hover:bg-black-500 text-white font-semibold py-2 px-4 border" >LOG OUT</button>
            </li>
          </ul>
        </nav> */}
      </IconContext.Provider>
    </>
  );
}



export default Navbar;
