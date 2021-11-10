import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faReact } from '@fortawesome/free-brands-svg-icons';
import { faChevronDoubleRight, faSignOutAlt } from '@fortawesome/pro-duotone-svg-icons';
import { faCaretRight } from '@fortawesome/pro-solid-svg-icons';
import { faTachometer, faBooks, faUsers, faUsersCog } from '@fortawesome/pro-light-svg-icons';

import '../../assets/styles/SideNavigation.css';

const Navigation = () => {

    return (
        <>
            <div className="sidebar">
                <div className="main-grid">
                    <div className="logo-grid">
                        <FontAwesomeIcon icon={faReact} className="logo-icon" />
                        <button><FontAwesomeIcon icon={faChevronDoubleRight} style={{ color: 'var(--mysteryGrey)' }} /></button>
                    </div>
                    <ul className="nav-menus">
                        <li className="nav-item">
                            <FontAwesomeIcon icon={faTachometer} style={{ color: 'var(--mysteryGrey)' }} />
                            <span>Dashboard</span>
                        </li>
                        <li className="nav-item">
                            <FontAwesomeIcon icon={faBooks} style={{ color: 'var(--mysteryGrey)' }} />
                            <span>Libraries</span>
                            <FontAwesomeIcon icon={faCaretRight} style={{ color: 'var(--mysteryGrey)' }} />
                        </li>
                        <li className="nav-item">
                            <FontAwesomeIcon icon={faUsers} style={{ color: 'var(--mysteryGrey)' }} />
                            <span>Contacts</span>
                        </li>
                        <li className="nav-item">
                            <FontAwesomeIcon icon={faUsersCog} style={{ color: 'var(--mysteryGrey)' }} />
                            <span>User Type Access</span>
                        </li>
                    </ul>
                </div>
                <div className="bottom-grid">
                    <div className="logout-btn" >
                        <FontAwesomeIcon icon={faSignOutAlt} style={{ color: 'var(--white)' }} />
                        <span>Log out</span>
                    </div>
                    <div className="avatar-grid">
                        <div className="avatar">
                            TA
                        </div>
                        <div className="details-grid">
                            <span>thomasa@mail.com</span>
                            <span>Google Mail</span>
                        </div>
                    </div>
                </div>
            </div>
        </>
    )
}

export default Navigation;