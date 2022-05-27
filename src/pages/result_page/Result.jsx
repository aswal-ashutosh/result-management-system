import { CircularProgress } from "@mui/material";
import React, { useState, useEffect } from "react";
import { getResult } from "../../services/firebase";
import { useLocation } from "react-router-dom";
import "./Result.css";

export default function Result(props) {
  const [result, setResult] = useState(null);
  const location = useLocation();
  const collegeID = location.state.collegeID;
  const rollNumber = location.state.rollNumber;

  let totalObtainedMarks = 0;
  let totalMarks = 0;

  useEffect(() => {
    if (result === null) {
      getStudentDetails();
    }
  });

  const getStudentDetails = async () => {
    const result = await getResult(collegeID, rollNumber);
    setResult(result);
  };

  function renderMarks() {
    return result.studentMarks.map((subject) => {
      totalMarks += subject.totalMarks;
      totalObtainedMarks += subject.marksScored;
      return (
        <tr>
          <td>{subject.subjectName}</td>
          <td>{subject.marksScored}</td>
          <td>{subject.totalMarks}</td>
        </tr>
      );
    });
  }

  function generateResult() {
    return (
      <div className="Result">
        <h1>{result.collegeName}</h1>
        <h4>{`College ID(${collegeID})`}</h4>
        <hr />
        <h4>{result.className}</h4>
        <div className="NameRollNo">
          <p>
            <b>Student Roll.No: </b>
            {rollNumber}
          </p>
          <p>
            <b>Student Name: </b>
            {result.studentName}
          </p>
        </div>
        <table>
          <thead>
            <tr>
              <th>Subject</th>
              <th>Marks Obtained</th>
              <th>Max Available Marks</th>
            </tr>
          </thead>
          <tbody>{renderMarks()}</tbody>
        </table>
        <p>
          <b>Total Marks: </b>
          {totalObtainedMarks}/{totalMarks}
        </p>
        <p>
          <b>C.G.P.A: </b>
          {((totalObtainedMarks / totalMarks) * 10).toFixed(1)}
        </p>
      </div>
    );
  }

  return (
    <div className="ResultContainer">
      {result === null ? <CircularProgress /> : generateResult()}
    </div>
  );
}
