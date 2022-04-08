import "../../assets/styles/BlankState.css";
import Illustration from "../../assets/images/no-data.svg";

const BlankState = (props) => {
  const { handleClick } = props;
  return (
    <>
    {props.iconDisplay ?
      <div className="BlankState">
        <div className="dynamic-main-content">
          <div className="img-content  content-center">
            <img src={props.iconDisplay} alt="" className="text-center content-center"/>
          </div>
          <div className="details-txt text-center content-center">
            <h1> {props.displayText}</h1>
           
            {props.noLink ?
              <h6>{props.noLink}</h6>
            :
            <h6> 
              Click here to
              <span onClick={handleClick} className="mx-1">
                {props.txtLink}
              </span>{" "}
              now.
            </h6>
            }
            
          </div>
        </div>
      </div>
    :
      <div className="BlankState">
        <div className="main-content">
          <div className="img-content">
            <img src={Illustration} alt="" />
          </div>
          <div className="details-txt text-center">
           
            <h1> {props.displayText}</h1>
           
            {props.noLink ?
              <h6>{props.noLink}</h6>
            :
            <h6> 
              Click here to
              <span onClick={handleClick} className="mx-1">
                {props.txtLink}
              </span>{" "}
              now.
            </h6>
            }
            
          </div>
        </div>
      </div>
    }
    </>
  );
};

export default BlankState;
