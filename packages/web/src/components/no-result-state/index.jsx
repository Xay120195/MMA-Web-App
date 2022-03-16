import "../../assets/styles/NoResultState.css";
import Illustration from "../../assets/images/empty-search-result.svg";

const NoResultState = (props) => {
  return (
    <div className="main-content grid grid-cols-1">
      <div className="img-content">
        <img src={Illustration} alt="" />
      </div>
      <div className="details-txt top-0">
        <h1>No result for{props.key}.</h1>
        <p>
          Check the spelling, try a more general term or look up a specific
          File.
        </p>
      </div>
    </div>
  );
};

export default NoResultState;
