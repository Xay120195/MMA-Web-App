import React, { useState, useEffect } from "react";
import ChangePassword from "../change-password";
import { AccountSettingsHeader } from "./account-settings-header";
import { AccountSettingsCategory } from './account-settings-category';

import Illustration2 from '../../assets/images/personal-info.svg';
import WaveIllustration from '../../assets/images/wave-illustration.svg';
import { BiUser } from 'react-icons/bi';
import { FaUserCog } from "react-icons/fa";
import '../../assets/styles/AccountSettings.css';

function AccountSettings() {

    const [userInfo, setuserInfo] = useState(null);

    useEffect(() => {
        if (userInfo === null) {
            let ls = {
                email: localStorage.getItem("email"),
                firstName: localStorage.getItem("firstName"),
                lastName: localStorage.getItem("lastName"),
                company: localStorage.getItem("company")
            };
            setuserInfo(ls);
        }
    }
    );

    return (
        <>
            <div className="page-grid">
                <h1>Account Settings</h1>
                <div className="page-crumbs">
                    <FaUserCog />
                    <p>Account Settings</p>
                </div>
            </div>
            <div className="settings-grid">
                <div className="category-content">
                    <AccountSettingsCategory title={'Public Profile'} desc={'Update your Profile Settings'} svg={<BiUser />} />
                </div>
                <div className="settings-input">
                    <AccountSettingsHeader title={'Personal info'} desc={'Info about you and your preferences across MMA.'} graphics={Illustration2} />
                    <div className="profile-img">
                        {userInfo !== null &&
                            <div className="profile-img-content">
                                {
                                    `${userInfo['firstName'].charAt(0)}${userInfo['lastName'].charAt(0)}`
                                }
                            </div>
                        }
                        {userInfo !== null &&
                            <h1>{`${userInfo['firstName']} ${userInfo['lastName']}`}</h1>
                        }
                    </div>
                    <div className="input-grid">
                        <div className="relative flex-auto">
                            <p className="input-name">First Name</p>
                            <div className="relative my-2">
                                <input type="text" className="input-field" defaultValue={userInfo?.firstName}/>
                            </div>
                        </div>
                        <div className="relative flex-auto">
                            <p className="input-name">Last Name</p>
                            <div className="relative my-2">
                                <input type="text" className="input-field" defaultValue={userInfo?.lastName}/>
                            </div>
                        </div>
                    </div>
                    <div className="relative flex-auto">
                        <p className="input-name">Company Name</p>
                        <div className="relative my-2">
                            <input type="text" className="input-field" defaultValue={userInfo?.company}/>
                        </div>
                    </div>
                    <div className="input-grid">
                        <div className="relative flex-auto">
                            <p className="input-name">Email Address</p>
                            <div className="relative my-2">
                                <input type="text" className="input-field" defaultValue={userInfo?.email}/>
                            </div>
                        </div>
                        <div className="relative flex-auto">
                            <p className="input-name">Password
                            </p>
                            <div className="relative my-2">
                                <input type="password" className="input-field" defaultValue="Test"/>
                            </div>
                        </div>
                    </div>
                    <ChangePassword />
                </div>
            </div>
            <div className="wave-illustration">
                <img src={WaveIllustration} className="w-full"></img>
            </div>
        </>
    );
}

export default AccountSettings;
