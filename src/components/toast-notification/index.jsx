import '../../assets/styles/ToastNotification.css';
import * as FaIcons from 'react-icons/fa';

const ToastNotification = ({title, hideToast}) => {
    
    return (
      <>
        <div className="main-div">
            <div class="content-grid">
                <p>{title || 'Link copied to clipboard!'}</p>
                <span><FaIcons.FaTimes onClick={hideToast} /></span>
            </div>
        </div>
      </>
    )
  }
  
  export default ToastNotification;