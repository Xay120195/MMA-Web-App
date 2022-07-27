import "../../assets/styles/BlankState.css";

const BlankStateMobile = (props) => {
  return (
    <>
      <div className="BlankState m-auto">
        <div className="main-content">
          <div className="img-content">
            <img src={props.svg} alt="" />
          </div>
          <div className="details-txt">
            <h1> {props.header} </h1>
            <h6 className="text-left">
              {props.content}
            </h6>
          </div>
        </div>
      </div>
    </>
  );
};

export default BlankStateMobile;
