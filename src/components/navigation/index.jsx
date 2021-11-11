import React, { useState } from 'react';
import {FaBars} from 'react-icons/fa';
import { Link, useHistory } from 'react-router-dom';
import { Auth } from "aws-amplify";
import '../../assets/styles/Navbar.css';
import { IconContext } from 'react-icons';
import Sidebar from '../sidebar';

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
            <FaBars onClick={showSidebar} />
          </Link>
        </div>
        { sidebar && <Sidebar showSidebar={showSidebar} clickLogout={clickLogout}/> }
        
      </IconContext.Provider>
    </>
  );
}



export default Navbar;
