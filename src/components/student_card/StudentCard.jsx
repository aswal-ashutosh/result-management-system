import React from "react";
import { useHistory } from "react-router";
import { userExist } from "../../services/firebase";
import "../student_card/StudentCard.css";

export default function StudentCard(props) {
  const history = useHistory();

  function OnView() {
    if (userExist())
      history.push("/studentResult", {
        collegeID: props.collegeID,
        rollNumber: props.rollNumber,
      });
    else history.push("/");
  }

  return (
    <div className="StudentCard">
      <p className="RollNumber">{props.rollNumber}</p>
      <p className="StudentName">{props.studentName}</p>
      <div className="Buttons">
        {" "}
        <button onClick={OnView}>View</button>
        <button
          onClick={(e) => props.onUpdate(props.studentName, props.rollNumber)}
        >
          Update
        </button>
      </div>
    </div>
  );
}
