import React from "react";
import ChangePassword from "../change-password";
import '../../assets/styles/AccountSettings.css';

function AccountSettings() {

    return (
        <>
            <div className="settings-grid">
                <ChangePassword />
            </div>
        </>
    );
}

export default AccountSettings;
