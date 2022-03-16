import "../../assets/styles/NoResultState.css";
import Illustration from "../../assets/images/empty-search-result.svg";

const NoResultState = (props) => {
  return (
    <div className="main-content grid grid-cols-1">
      <div className="img-content">
        <img src={Illustration} alt="" />
      </div>
      <div className="details-txt top-0">
        <h1>No result for &ldquo;{props.searchKey}&rdquo;.</h1>
        <p>{props.message}</p>
      </div>
    </div>
  );
};

export default NoResultState;
