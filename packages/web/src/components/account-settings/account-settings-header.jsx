import '../../assets/styles/BlankState.css';

export const AccountSettingsHeader = (props) => {
  return (
    <>
      <div className="AccountSettingsHeader">
        <div className="account-settings-content">
          <div className="details-txt">
            <h1>{props.title}</h1>
            <p>{props.desc}</p>
          </div>
          <div className="account-img-content">
            <img src={props.graphics} alt="" />
          </div>
        </div>
      </div>
    </>
  );
};