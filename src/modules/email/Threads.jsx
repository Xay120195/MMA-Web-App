import { API } from "aws-amplify";
import { useEffect, useState } from "react";
import * as queries from "../../graphql/queries";
import * as mutations from "../../graphql/mutations";

import { toast } from 'react-toastify'

const SaveButton = ({ onClick }) => {
  const [isSaved, setIsSaved] = useState(false);
  return (
    <button
      onClick={() => {
        onClick();
        setIsSaved(true);
      }}
      className="border-2 border-red-400 text-red-400 text-lg font-bold ml-auto px-3 py-1 rounded-md hover:opacity-80"
    >
      <i className="fas fa-save mr-2" />
      {isSaved ? "Saved" : "Save"}
    </button>
  );
};

const Threads = ({ email }) => {
  console.log("email props", email);
  const [threads, setThreads] = useState();
  const [isLoading, setIsLoading] = useState(true);

  async function saveThread({ id, snippet, historyId }) {
    try {
      const newThread = { id: id, snippet: snippet, historyId: historyId };
      await API.graphql({
        query: mutations.threadCreate,
        variables: { input: newThread },
      });
    } catch {
      alert("Thread already on the DB");
    }
  }

  async function fetchThreads() {
    try{
    setIsLoading(true);
    const res = await API.graphql({
      query: queries.threadsFromApi,
      variables: {
        email: email,
      },
    });
    setThreads(res.data?.threadsFromApi);
    setIsLoading(false);
  }
  catch(err){
    console.log(err.errors[0].message)
    toast.error(err.errors[0].message)
  }
  }
  
  useEffect(() => {
    fetchThreads();
  }, 
  // eslint-disable-next-line
  [email]);

  if (isLoading) {
    return Array(4)
      .fill()
      .map((_, i) => (
        <div key={i} className="mt-2 w-full h-14 bg-gray-300 animate-pulse" />
      ));
  }

  return (
    <div className="w-full">
      {threads.map((thread) => (
        <div key={thread.id} className="border-b border-gray-400 p-4 flex">
          <p>{thread.snippet}</p>
          <SaveButton
            onClick={() =>
              saveThread({
                id: thread.id,
                snippet: thread.snippet,
                historyId: thread.historyId,
              })
            }
          />
        </div>
      ))}
    </div>
  );
};

export default Threads;
