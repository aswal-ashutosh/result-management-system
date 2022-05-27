import React from "react";
import "./UpdateForm.css";
import Alert from "@mui/material/Alert";
import { Box } from "@mui/system";
import { CircularProgress, LinearProgress } from "@mui/material";
import {
  updateStudentDetails,
  getResult,
} from "../../services/firebase";

class UpdateForm extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      studentName: this.props.studentName,
      studentRollNumber: this.props.studentRollNumber,
      subjects: [],
      studentRelatedError: false,
      marksRelatedError: false,
      studentRelatedErrorMessage: null,
      marksRelatedErrorMessage: null,
      processing: false,
      loading: true,
    };
    this.handleSubjectMarksInput = this.handleSubjectMarksInput.bind(this);
    this.handleStudentNameInput = this.handleStudentNameInput.bind(this);
    this.handleOnSubmit = this.handleOnSubmit.bind(this);
  }

  handleStudentNameInput(e) {
    this.setState({ studentName: e.target.value });
  }

  handleSubjectMarksInput(e) {
    const index = e.target.name;
    const subjects = this.state.subjects;
    const marks = parseInt(e.target.value);
    subjects[index].marksScored = isNaN(marks) ? "" : marks;
    this.setState({ subjects: subjects });
  }

  async componentDidMount() {
    const result = await getResult(
      this.props.collegeID,
      this.props.studentRollNumber
    );

    this.setState({ subjects: result.studentMarks, loading: false });
  }

  renderSubjects() {
    return this.state.subjects.map((subject, index) => (
      <tr>
        <td>
          <input
            type="text"
            name={index}
            value={this.state.subjects[index].subjectName}
            readOnly
          />
        </td>
        <td>
          <input
            type="number"
            max={this.state.subjects[index].totalMarks}
            min="0"
            name={index}
            value={subject.marksScored}
            onChange={this.handleSubjectMarksInput}
          ></input>
        </td>
        <td>
          <b>/{this.state.subjects[index].totalMarks}</b>
        </td>
      </tr>
    ));
  }

  removePrevError() {
    this.setState({ studentRelatedError: false, marksRelatedError: false });
  }

  async validateForm() {
    this.removePrevError();
    if (
      this.state.studentName.length === 0 ||
      this.state.studentRollNumber.length === 0
    ) {
      this.setState({
        studentRelatedError: true,
        studentRelatedErrorMessage:
          this.state.studentName.length === 0
            ? "Student name can't be left empty!"
            : "Roll Number can't be left empty!",
      });
      return false;
    }

    const subjects = this.state.subjects;
    for (let i = 0; i < subjects.length; ++i) {
      if (subjects[i].marksScored.toString().length === 0) {
        this.setState({
          marksRelatedError: true,
          marksRelatedErrorMessage: `${subjects[i].subjectName} marks are left blank!`,
        });
        return false;
      }
      const totalMarks = parseInt(subjects[i].totalMarks);
      const studentMarks = parseInt(subjects[i].marksScored);
      if (studentMarks < 0 || studentMarks > totalMarks) {
        this.setState({
          marksRelatedError: true,
          marksRelatedErrorMessage:
            studentMarks < 0
              ? `Marks can't be negative in ${subjects[i].subjectName}!`
              : `In ${subjects[i].subjectName}, marks can't exceed ${totalMarks}`,
        });
        return false;
      }
    }
    return true;
  }

  async handleOnSubmit() {
    this.setState({ processing: true });

    if (await this.validateForm()) {
      await updateStudentDetails(
        this.props.className,
        this.props.collegeID,
        this.state.studentName,
        this.state.studentRollNumber,
        this.state.subjects
      );
      this.props.closePopUp();
    }
    this.setState({ processing: false });
  }

  render() {
    return this.state.loading ? (
      <CircularProgress />
    ) : (
      <div className="StudentUpdateFromContainer">
        <h2>UPDATE STUDENT DETAILS</h2>
        <div className="UpdateForm">
          <input
            type="text"
            value={this.state.studentName}
            onChange={this.handleStudentNameInput}
            placeholder="Student Name"
          />

          <input
            type="number"
            min={0}
            value={this.state.studentRollNumber}
            placeholder="Student Roll Number"
            readOnly
          />
          {this.state.studentRelatedError && (
            <Alert severity="error" sx={{ marginBottom: "1.0%" }}>
              {this.state.studentRelatedErrorMessage}
            </Alert>
          )}

          <hr />
          <h3>Student Marks</h3>
          {this.state.subjects.length !== 0 && (
            <table>
              <tr>
                <th>Subject Name</th>
                <th>Marks</th>
              </tr>
              {this.renderSubjects()}
            </table>
          )}
          {this.state.marksRelatedError && (
            <Alert severity="error" sx={{ marginBottom: "1.0%" }}>
              {this.state.marksRelatedErrorMessage}
            </Alert>
          )}
          {this.state.processing && (
            <Box sx={{ marginBottom: "1.0%" }}>
              <LinearProgress />
            </Box>
          )}
          <button onClick={this.handleOnSubmit}>Update Details</button>
        </div>
      </div>
    );
  }
}

export default UpdateForm;
