import React from "react";
import "./ClassForm.css";
import Alert from "@mui/material/Alert";
import { Box } from "@mui/system";
import { LinearProgress } from "@mui/material";
import { createClass, isClassNameUnique } from "../../services/firebase";

class ClassForm extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      subjects: [{ subjectName: "", totalMarks: "" }],
      className: "",
      classRelatedError: false,
      classErrorMessage: null,
      subjectRelatedError: false,
      subjectErrorMessage: null,
      processing: false,
    };
    this.addSubject = this.addSubject.bind(this);
    this.deleteSubject = this.deleteSubject.bind(this);
    this.handleSubjectNameInput = this.handleSubjectNameInput.bind(this);
    this.handleSubjectMarksInput = this.handleSubjectMarksInput.bind(this);
    this.handleClassNameInput = this.handleClassNameInput.bind(this);
    this.handleOnSubmit = this.handleOnSubmit.bind(this);
  }

  handleClassNameInput(e) {
    this.setState({ className: e.target.value });
  }

  addSubject() {
    this.setState((prevState) => ({
      subjects: [...prevState.subjects, { subjectName: "", totalMarks: "" }],
    }));
  }

  deleteSubject(e) {
    const index = e.target.name;
    const subjects = this.state.subjects;
    subjects.splice(index, 1);
    this.setState({ subjects: subjects });
  }

  handleSubjectNameInput(e) {
    const index = e.target.name;
    const subjects = this.state.subjects;
    subjects[index].subjectName = e.target.value;
    this.setState({ subjects: subjects });
  }

  handleSubjectMarksInput(e) {
    const index = e.target.name;
    const subjects = this.state.subjects;
    const marks = parseInt(e.target.value);
    subjects[index].totalMarks = isNaN(marks) ? "" : marks;
    this.setState({ subjects: subjects });
  }

  renderSubjects() {
    return this.state.subjects.map((subject, index) => (
      <tr>
        <td>
          <input
            type="text"
            name={index}
            value={subject.subjectName}
            onChange={this.handleSubjectNameInput}
          />
        </td>
        <td>
          <input
            type="number"
            max="100"
            min="0"
            name={index}
            value={subject.totalMarks}
            onChange={this.handleSubjectMarksInput}
          ></input>
        </td>
        {this.state.subjects.length !== 1 && (
          <td>
            <button name={index} onClick={this.deleteSubject}>
              Remove
            </button>
          </td>
        )}
      </tr>
    ));
  }

  removePrevError() {
    this.setState({ classRelatedError: false, subjectRelatedError: false });
  }

  async validateForm() {
    this.removePrevError();
    if (this.state.className.length === 0) {
      this.setState({
        classRelatedError: true,
        classErrorMessage: "Class name can't be left empty!",
      });
      return false;
    }
    if (!(await isClassNameUnique(this.state.className, this.props.collegeID))) {
      this.setState({ classRelatedError: true, classErrorMessage: 'This class name is already taken!' });
      return false;
    }
    const subjects = this.state.subjects;
    for (let i = 0; i < subjects.length; ++i) {
      if (
        subjects[i].subjectName.length === 0 ||
        subjects[i].totalMarks.length === 0
      ) {
        this.setState({
          subjectRelatedError: true,
          subjectErrorMessage: "Some subject's fields are left blank!",
        });
        return false;
      }
      const marks = parseInt(subjects[i].totalMarks);
      if (marks <= 0) {
        this.setState({
          subjectRelatedError: true,
          subjectErrorMessage: "Total marks can't be negative!",
        });
        return false;
      }
    }

    return true;
  }

  async handleOnSubmit() {
    this.setState({ processing: true });
    if (await this.validateForm()) {
      await createClass(
        this.props.collegeID,
        this.state.className,
        this.state.subjects
      );
      this.props.closePopUp();
    }
    this.setState({ processing: false });
  }

  render() {
    return (
      <div className="ClassFormContainer">
        <h2>ADD NEW CLASS</h2>
        <div className="ClassForm">
          <input
            type="text"
            value={this.state.className}
            onChange={this.handleClassNameInput}
            placeholder="Class Name"
            required
          />
          {this.state.classRelatedError && (
            <Alert severity="error" sx={{ marginBottom: "1.0%" }}>
              {this.state.classErrorMessage}
            </Alert>
          )}

          <hr />
          <h3>Subjects</h3>
          {this.state.subjects.length !== 0 && (
            <table>
              <tr>
                <th>Subject Name</th>
                <th>Total Marks</th>
              </tr>
              {this.renderSubjects()}
            </table>
          )}
          {this.state.subjectRelatedError && (
            <Alert severity="error" sx={{ marginBottom: "1.0%" }}>
              {this.state.subjectErrorMessage}
            </Alert>
          )}
          {this.state.processing && (
            <Box sx={{ marginBottom: "1.0%" }}>
              <LinearProgress />
            </Box>
          )}
          <button onClick={this.addSubject}>Add Subject</button>
          <button onClick={this.handleOnSubmit}>Submit</button>
        </div>
      </div>
    );
  }
}

export default ClassForm;
