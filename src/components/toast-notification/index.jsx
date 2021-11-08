import '../../assets/styles/ToastNotification.css';
import * as FaIcons from 'react-icons/fa';

const ToastNotification = (props) => {
    const { handleClick } = props;
    return (
      <>
        <div className="main-div">
            <div class="content-grid">
                <p>{props.title || 'Link copied to clipboard!'}</p>
                <span><FaIcons.FaTimes onClick={handleClick} /></span>
            </div>
        </div>
      </>
    )
  }
  
  export default ToastNotification;