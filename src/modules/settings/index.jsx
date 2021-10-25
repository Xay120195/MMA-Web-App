// const GOOGLE_OAUTH_CLIENT_ID =
//   "534606995820-n5n3hli26m5uh7t2eck2jijhpsf15vgb.apps.googleusercontent.com";

const Settings = () => {
  return (
    <div className="flex flex-col">
      <h1 className="text-3xl font-bold text-red-400 self-center p-4">
        Settings
      </h1>
      <div className="flex flex-col">
        <a
          className="text-lg self-center"
          href="https://accounts.google.com/o/oauth2/v2/auth?access_type=offline&scope=https%3A%2F%2Fwww.googleapis.com%2Fauth%2Fgmail.readonly%20https%3A%2F%2Fwww.googleapis.com%2Fauth%2Fuserinfo.email&response_type=code&client_id=534606995820-n5n3hli26m5uh7t2eck2jijhpsf15vgb.apps.googleusercontent.com&redirect_uri=http%3A%2F%2Flocalhost%3A3000%2Fconnect_email"
        >
          <button className="bg-red-400 mt-20 p-3 text-white font-bold rounded">
            Connect a GMAIL account
          </button>
        </a>
      </div>
    </div>
  );
};

export default Settings;
