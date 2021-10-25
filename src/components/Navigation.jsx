import { Link } from "react-router-dom";

const Navigation = () => {
  return (
    <div className="flex gap-3 px-2 py-6  text-xl">
      <Link to="/">Email Threads</Link>
      <Link to="/saved">Saved Emails</Link>
      <Link to="/settings">Connect GMAIL</Link>
      <Link to="/access_control">Access Control</Link>
    </div>
  );
};

export default Navigation;
