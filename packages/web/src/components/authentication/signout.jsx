import { useEffect } from "react";
import { useHistory } from "react-router-dom";
import { Auth } from "aws-amplify";

function Signout() {
  let history = useHistory();

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

  useEffect(() => {
    signOut();
  });

  return null;
}

export default Signout;
