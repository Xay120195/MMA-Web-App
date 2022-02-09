import '../../assets/styles/InfoMessage.css';
import { AiFillInfoCircle } from 'react-icons/ai';

const InfoMessage = (props) => {
  return (
    <>
      <div className="InfoMessage">
        <div className="info-message">
          <div className="info-svg"><AiFillInfoCircle/></div>
          <div className="info-txt">
            <h3>{props.title}</h3>
            <p>{props.desc}</p>
          </div>
        </div>
      </div>
    </>
  )
}

export default InfoMessage;