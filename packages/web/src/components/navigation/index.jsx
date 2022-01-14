import React, { useState, useEffect } from "react";
import { FaBars } from "react-icons/fa";
import { Link, useHistory, useLocation } from "react-router-dom";
import { Auth } from "aws-amplify";
// import '../../assets/styles/Navbar.css';
import { IconContext } from "react-icons";
import Sidebar from "../sidebar";
import { SidebarData } from "../sidebar/SidebarData";

import { CgLogOut } from "react-icons/cg";
import { FaReact } from "react-icons/fa";
import { HiChevronDoubleRight } from "react-icons/hi";

function Navbar() {
  const [sidebar, setSidebar] = useState(false);
  const showSidebar = () => setSidebar(!sidebar);
  //const [location, setlocation] = useState(window.location.pathname);
  const [userInfo, setuserInfo] = useState(null);
  const location = useLocation();

  let history = useHistory();
  const clickLogout = async (e) => {
    e.preventDefault();
    if (window.confirm("Are you sure you want to logout?")) {
      setSidebar(false);
      try {
        signOut();
      } catch (error) {
        console.log("Error signing out: ", error);
      }
    } else {
      return false;
    }
  };

  const signOut = async () => {
    await Auth.signOut().then(() => {
      clearLocalStorage();
      console.log("Sign out completed.");
      history.push("/");
    });
  };

  function clearLocalStorage() {
    localStorage.removeItem("userId");
    localStorage.removeItem("email");
    localStorage.removeItem("firstName");
    localStorage.removeItem("lastName");
    localStorage.removeItem("userType");
    localStorage.removeItem("company");
    localStorage.removeItem("companyId");
    localStorage.removeItem("access");
  }

  // history.listen((location) => {
  //   setlocation(location.pathname);
  // });

  useEffect(() => {
    if (localStorage.getItem("userId") === null) {
      signOut();
    } else {
      if (userInfo === null) {
        let ls = {
          userId: localStorage.getItem("userId"),
          email: localStorage.getItem("email"),
          firstName: localStorage.getItem("firstName"),
          lastName: localStorage.getItem("lastName"),
          company: localStorage.getItem("company"),
          userType: localStorage.getItem("userType"),
          access: JSON.parse(localStorage.getItem("access")),
        };
        setuserInfo(ls);
      }
    }
  });

  return (
    <IconContext.Provider value={{ color: "#fff" }}>
      <div className="sidebar-collapsed sidebar">
        <div className="main-grid">
          <div className="logo-grid-collapsed">
            <FaReact
              className="logo-icon"
              style={{ color: "var(--mysteryGrey)" }}
            />
            <button>
              <HiChevronDoubleRight
                onClick={showSidebar}
                style={{ color: "var(--mysteryGrey)" }}
              />
            </button>
          </div>
          <ul className="nav-menus">
            {userInfo &&
              SidebarData.map((item, index) => {
                return userInfo.access
                  .map((page) => page.name)
                  .includes(item.name) ||
                  item.name === "DASHBOARD" ||
                  item.name === "ACCOUNTSETTINGS" ? (
                  <li
                    className={
                      location.pathname === item.path ? "active-page" : ""
                    }
                    key={index}
                  >
                    <Link
                      className="nav-item-collapsed nav-item"
                      to={item.path}
                    >
                      {item.icon}
                    </Link>
                  </li>
                ) : null;
              })}
          </ul>
          <hr />
          <div
            className="logout-btn-collapsed logout-btn"
            onClick={clickLogout}
          >
            <CgLogOut style={{ color: "var(--mysteryGrey)" }} />
          </div>
        </div>
        <div>
          {userInfo && (
            <div className="avatar-grid-collapsed">
              <div className="avatar">
                {`${userInfo.firstName.charAt(0)}${userInfo.lastName.charAt(
                  0
                )}`}
              </div>
            </div>
          )}
        </div>
      </div>
      {sidebar && (
        <Sidebar
          showSidebar={showSidebar}
          userInfo={userInfo}
          clickLogout={clickLogout}
        />
      )}
    </IconContext.Provider>
  );
}

export default Navbar;
