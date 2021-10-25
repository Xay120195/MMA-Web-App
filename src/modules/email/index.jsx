import { API } from "aws-amplify";
import { useEffect, useState } from "react";
import * as queries from "../../graphql/queries";
import { Auth } from "aws-amplify";

import Threads from "./Threads";

const Email = () => {
  const [emails, setEmails] = useState();
  const [selectedEmail, setSelectedEmail] = useState();

  async function fetchEmails() {
    let user = await Auth.currentUserPoolUser();
    console.log("user", user);
    const res = await API.graphql({
      query: queries.listUserOAuths,
      variables: {
        username: user.username,
      },
    });

    console.log(res.data?.listUserOAuths.items, "emails");
    if (res.data?.listUserOAuths.items.length > 0) {
      setSelectedEmail(res.data?.listUserOAuths.items[0].email);
    }
    setEmails(res.data?.listUserOAuths.items);
  }

  useEffect(() => {
    fetchEmails();
  }, []);

  return (
    <div className="flex flex-col">
      <h1 className="text-3xl font-bold text-red-400 self-center p-4">
        Email Threads (@function - GMAIL API)
      </h1>
      <div className="flex flex-col p-4">
        <label className="font-bold text-lg">Select Email Account</label>
        <select
          name="emails"
          id="emails"
          onChange={(e) => setSelectedEmail(e.target.value)}
          className="border border-red-400 p-2 text-red-400"
        >
          {emails
            ? emails.map(({ email }) => (
                <option key={email} value={email}>
                  {email}
                </option>
              ))
            : null}
        </select>
        {selectedEmail ? <Threads email={selectedEmail} /> : null}
      </div>
    </div>
  );
};

export default Email;
