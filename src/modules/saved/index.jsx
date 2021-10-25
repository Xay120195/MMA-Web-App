import { API } from "aws-amplify";
import { useEffect, useState } from "react";
import * as queries from "../../graphql/queries";
import * as mutations from "../../graphql/mutations";

import SavedThreads from "./SavedThreads";
import { toast } from 'react-toastify';

const Saved = () => {
  const [threads, setThreads] = useState();
  const [isLoading, setIsLoading] = useState(true);

  async function deleteThread(id) {
    try{
    await API.graphql({
      query: mutations.deleteThread,
      variables: { input: { id } },
    });
    fetchThreads();
  }
  catch(err){
    console.log(err.errors[0].message)
    toast.error(err.errors[0].message)
  }
  
  }

  async function fetchThreads() {
    try{
    const res = await API.graphql({
      query: queries.threadsFromDb,
    });
    setThreads(res.data.threadsFromDB);
    setIsLoading(false);
  }
  catch(err){
    console.log(err.errors[0].message)
    toast.error(err.errors[0].message)
  }
  }

  useEffect(() => {
    setIsLoading(true);
    fetchThreads();
  }, []);

  if (isLoading) {
    return Array(4)
      .fill()
      .map((_, i) => (
        <div key={i} className="mt-2 w-full h-14 bg-gray-300 animate-pulse" />
      ));
  }
  return (
    <div className="flex flex-col">
      <h1 className="text-3xl font-bold text-red-400 self-center p-4">
        Saved Email Threads (@model - DynamoDB)
      </h1>
      <div className="flex flex-col">
        <SavedThreads threads={threads} deleteThread={deleteThread} />
      </div>
    </div>
  );
};

export default Saved;
