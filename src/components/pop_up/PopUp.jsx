import React from "react";
import "../pop_up/PopUp.css";

function PopUp(props) {
  return (
    <div className="PopUp">
      <div className="PopUp-content">
        <span className="Close-btn" onClick={props.closePopUp}>
          x
        </span>
        {props.children}
      </div>
    </div>
  );
}

export default PopUp;
