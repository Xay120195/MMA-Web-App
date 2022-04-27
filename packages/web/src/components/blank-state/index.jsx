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
            {props.title === "RFI" ?
              <h1> There are no items to show in this view.</h1>
            :
              <h1>You have not added any {props.title || "affidavits"} yet.</h1>
            }
            
            <h6 className="text-left">
              Click on the
              <span onClick={handleClick} className="mx-1">
                {props.txtLink || "add row"}
              </span>{" "}
              button above to start adding one now.
            </h6>
          </div>
        </div>
      </div>
    </>
  );
};

export default BlankState;
