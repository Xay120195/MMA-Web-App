import "../../assets/styles/BlankState.css";
import Illustration from "../../assets/images/no-data.svg";

const BlankState = (props) => {
  const { handleClick } = props;
  return (
    <>
      <div className="BlankState">
        <div className="main-content">
          <div className="img-content">
            <img src={Illustration} alt="" />
          </div>
          <div className="details-txt">
            <h1>You have not added any {props.title || "affidavits"} yet.</h1>

            <p>
              Click on the
              <span onClick={handleClick}>
                {props.txtLink || "add row"}
              </span>{" "}
              button above to start adding one now.
            </p>
          </div>
        </div>
      </div>
    </>
  );
};

export default BlankState;
