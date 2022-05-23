import React, { useEffect, useState } from "react";
import { AiOutlineGoogle } from "react-icons/ai";
//import GoogleLogin from "react-google-login";
//import { useDispatch } from "react-redux";
// import { userLogin } from "../../redux/reducer/profileUpdateSlice";
import { useHistory } from "react-router-dom";
//import { ApiGetNoAuth, ApiPostNoAuth } from "../../helpers/API/API_data";
import ToastNotification from "../toast-notification";

const EmailIntegrationAuth = () => {
  console.log("asfafsafafafaf");
  //const dispatch = useDispatch();
  let history = useHistory();

  const GoogleAuth = async (accessToken, idToken) => {
    console.log("in");
    let body = {
      idToken,
      accessToken,
    };
    // await ApiPostNoAuth("user/google", body).then((res) => {
    //   let data = { ...res.data?.data, accessToken };
    //   console.log(res?.data?.message);
    //   dispatch(userLogin(data));
    //   localStorage.setItem("logindata", JSON.stringify(data));
    // });
  };

  const googleClick = async (response) => {
    // await ApiGetNoAuth("user/google/token")
    //   .then((res) => {
    //     console.log(
    //       "res lohginn",
    //       response
    //     )((window.location.href = res.data.url));
    //   })
    //   .catch((err) => console.log("err", err));
  };

  useEffect(() => {
    console.log("TESTTSTT");
    handleTokenFromQueryParams();
  }, []);

  const handleTokenFromQueryParams = async () => {
    const query = new URLSearchParams(window.location.search);
    const accessToken = query.get("accessToken");
    const refreshToken = query.get("refreshToken");
    const idToken = query.get("idToken");
    const expirationDate = newExpirationDate();
    if (accessToken && refreshToken && idToken) {
      await storeTokenData(accessToken, refreshToken, idToken, expirationDate);
      console.log("out");
      await GoogleAuth(accessToken, idToken);

      history.push("/inbox");
    }
  };

  const newExpirationDate = () => {
    var expiration = new Date();
    expiration.setHours(expiration.getHours() + 1);
    return expiration;
  };

  const storeTokenData = async (
    token,
    refreshToken,
    idToken,
    expirationDate
  ) => {
    sessionStorage.setItem("accessToken", token);
    sessionStorage.setItem("refreshToken", refreshToken);
    sessionStorage.setItem("idToken", idToken);
    sessionStorage.setItem("expirationDate", expirationDate);
  };

  return (
    <>
      <div className="h-screen flex-1 p-7">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-10 relative">
          <div className="col-span-3 px-3 pt-20 z-50">
            <h5 className="text-black text-2xl font-bold">AFFIDAVITS & RFI</h5>
            <div className="text-black text-xl font-normal my-5 leading-10">
              Looks like you're not yet connected with your Google Account
            </div>
            <div className="text-gray-400 text-lg font-medium">
              Lets make your trip fun and simple
            </div>

            {/* <GoogleLogin
              clientId={process.env.REACT_APP_GOOGLE_ID}
              render={(renderProps) => (
                <button
                  type="button"
                  className="flex gap-x-4 pl-3 my-4 rounded-lg text-sm  border-2 border-blue-600 items-center"
                  onClick={renderProps.onClick}
                >
                  <AiOutlineGoogle fontSize={30} className="text-blue-600" />
                  <span className="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 px-5 py-2.5 focus:ring-blue-300 font-medium dark:bg-blue-600 dark:hover:bg-blue-700 focus:outline-none dark:focus:ring-blue-800">
                    {" "}
                    Sign in with Google
                  </span>
                </button>
              )}
              // responseType="code"
              buttonText=""
              // accessType="offline"
              // responseType="code"
              // prompt="consent"
              autoLoad={false}
              // uxMode="redirect"
              // redirectUri="http://localhost:3001"
              onSuccess={handleGoogleLogin}
              scope="[https://mail.google.com/, https://www.googleapis.com/auth/gmail.modify, https://www.googleapis.com/auth/gmail.readonly]"
              onFailure={(err) => console.log("fail", err)},
            /> */}
            <button
              type="button"
              className="flex gap-x-4 pl-3 my-4 rounded-lg text-sm  border-2 border-blue-600 items-center"
              onClick={googleClick}
            >
              <AiOutlineGoogle fontSize={30} className="text-blue-600" />
              <span className="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 px-5 py-2.5 focus:ring-blue-300 font-medium dark:bg-blue-600 dark:hover:bg-blue-700 focus:outline-none dark:focus:ring-blue-800">
                {" "}
                Sign in with Google
              </span>
            </button>
          </div>
          <div className="col-span-7">
            <div className="h-screen absolute top-[-28px] right-[-28px]">
              <img src="assets/Group 1.png" alt="" className="h-full" />
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default EmailIntegrationAuth;
