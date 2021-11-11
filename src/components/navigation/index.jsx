import React, { useState, useEffect } from 'react';
import {FaBars} from 'react-icons/fa';
import { Link, useHistory } from 'react-router-dom';
import { Auth } from "aws-amplify";
import '../../assets/styles/Navbar.css';
import { IconContext } from 'react-icons';
import Sidebar from '../sidebar';

function Navbar() {
  const [sidebar, setSidebar] = useState(false);
  const showSidebar = () => setSidebar(!sidebar);
  const [location, setlocation] = useState(window.location.pathname);
  const [userInfo, setuserInfo] = useState(null);
  
  
  let history = useHistory();

  const clickLogout = async (e) => {
    e.preventDefault();
    if(window.confirm("Are you sure you want to logout?")){
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
    let getUser = async() => {
      try {
        let user = await Auth.currentAuthenticatedUser();
        await setuserInfo(user);
      } catch (error) {
        console.log(error)
      }
    }
    getUser();
  },[]);


  return(
    <>
    {location !== '/' && 
      <IconContext.Provider value={{ color: '#fff' }}>
        <div className='navbar'>
          <Link to='#' className='menu-bars bg-gray-400' >
            <FaBars onClick={showSidebar} />
          </Link>
        </div>
        { sidebar && <Sidebar showSidebar={showSidebar} userInfo={userInfo} clickLogout={clickLogout}/> }
        
      </IconContext.Provider>
      }
    </>
  );
}



export default Navbar;
