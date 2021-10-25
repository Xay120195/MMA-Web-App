const SavedThreads = ({ threads = [], deleteThread }) => {
  return (
    <div className="flex flex-col w-full">
      {threads.length > 0 ? (
        <>
          {threads.map((thread) => (
            <div key={thread.id} className="border-b border-gray-400 p-4 flex">
              <p>{thread.snippet}</p>
              <button
                onClick={() => deleteThread(thread.id)}
                className="border-2 border-red-600 text-red-600 text-lg font-bold ml-auto px-3 py-1 rounded-md hover:opacity-80"
              >
                <i className="fas fa-trash mr-2" />
                Delete
              </button>
            </div>
          ))}
        </>
      ) : (
        <h1 className="self-center text-gray-400 text-xl m-4">
          No Saved Threads
        </h1>
      )}
    </div>
  );
};

export default SavedThreads;
