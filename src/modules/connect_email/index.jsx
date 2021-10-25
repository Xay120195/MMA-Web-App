import { useLocation, Redirect } from "react-router-dom";
import queryString from "query-string";

import { API } from "aws-amplify";
import { useEffect } from "react";
import * as mutations from "../../graphql/mutations";
import { useState } from "react";

const ConnectEmail = () => {
  const [isOk, setIsOk] = useState(false);

  const data = useLocation();
  const query = queryString.parse(data.search);

  useEffect(() => {
    addOAuth();
  });

  async function addOAuth() {
    try {
      const res = await API.graphql({
        query: mutations.addOAuthFromCode,
        variables: {
          code: query.code,
        },
      });
      console.log(res);
      setIsOk(true);
    } catch {
      setIsOk(false);
    }
  }

  if (isOk) {
    return <Redirect to="/" />;
  }

  return <div className="text-lg p-2 text-red-400">Connecting Email...</div>;
};

export default ConnectEmail;
