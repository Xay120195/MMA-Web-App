import '../../assets/styles/AccountSettings.css';
import { FiChevronRight } from 'react-icons/fi';

export const AccountSettingsCategory = (props) => {
  const { handleClick } = props;
  return (
    <>
      <div className="AccountSettingsCategory" onClick={handleClick}>
        <div className="account-settings-category">
          <div className="account-svg-content">
            {props.svg}
          </div>
          <div className="account-details-txt">
            <h3>{props.title}</h3>
            <p>{props.desc}</p>
          </div>
          <FiChevronRight />
        </div>
      </div>
    </>
  );
};