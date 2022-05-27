import React from "react";
import Navbar from "../../components/navbar/Navbar";
import PopUp from "../../components/pop_up/PopUp";
import { firestore, userExist } from "../../services/firebase";
import { collection, onSnapshot } from "@firebase/firestore";
import { withRouter } from "react-router-dom";
import Alert from "@mui/material/Alert";
import "../class_panel/ClassPanel.css";
import StudentForm from "../../components/student_form/StudentFrom";
import StudentCard from "../../components/student_card/StudentCard";
import UpdateForm from "../../components/update_form/UpdateForm";

class ClassPanel extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      addStudentPopUp: false,
      updateStudentPopUp: false,
      studentName: null,
      studentRollNumber: null,
      students: [],
    };
    this.className = this.props.location.state.className;
    this.collegeID = this.props.location.state.collegeID;
    this.unsubscribe = null;
    this.toggleAddStudentPopUp = this.toggleAddStudentPopUp.bind(this);
    this.toggleUpdateStudentPopUp = this.toggleUpdateStudentPopUp.bind(this);
  }

  toggleAddStudentPopUp() {
    if (userExist()) this.setState({ addStudentPopUp: !this.state.addStudentPopUp });
    else this.props.history.push("/");
  }

  toggleUpdateStudentPopUp(name, rollNumber){
    if (userExist()) this.setState({ updateStudentPopUp: !this.state.updateStudentPopUp, studentName: name, studentRollNumber: rollNumber });
    else this.props.history.push("/");
  }

  async componentDidMount() {
    if (userExist() === false) {
      alert("Sign In Required.");
      this.props.history.push("/");
      return;
    }
    this.unsubscribe = await onSnapshot(
      collection(
        firestore,
        "college",
        this.collegeID.toString(),
        "classes",
        this.className,
        "enrolled-students"
      ),
      (snapshot) => {
        const docs = snapshot.docs;

        if (docs.length === 0) return;

        const students = [];
        docs.forEach((doc) => {
          const student = doc.data();
          students.push({
            studentRollNumber: student["student-roll-no"],
            studentName: student["student-name"],
          });
        });
        this.setState({ students: students });
      },
      (error) => {
        alert("Error(AdminPanel): ");
      }
    );
  }

  componentWillUnmount() {
    if(this.unsubscribe !== null)
      this.unsubscribe();
  }

  render() {
    return (
      <div id="ClassPanel">
        <Navbar heading={this.className} />

        {this.state.addStudentPopUp && (
          <PopUp closePopUp={this.toggleAddStudentPopUp}>
            <StudentForm
              collegeID={this.collegeID}
              className={this.className}
              closePopUp={this.toggleAddStudentPopUp}
            />
          </PopUp>
        )}
        
        {this.state.updateStudentPopUp && (
          <PopUp closePopUp={this.toggleUpdateStudentPopUp}>
            <UpdateForm
              studentName={this.state.studentName}
              studentRollNumber={this.state.studentRollNumber}
              collegeID={this.collegeID}
              className={this.className}
              closePopUp={this.toggleUpdateStudentPopUp}
            />
          </PopUp>
        )}

        {this.state.students.length === 0 ? (
          <Alert severity="info" sx={{ margin: "1.0% 40%" }}>
            No student is enrolled in{" "}
            <span>
              <b>{this.className}</b>
            </span>
            !
          </Alert>
        ) : (
          <h3>Students Enrolled</h3>
        )}
        {this.state.students.map((student, index) => (
          <StudentCard
            key={index}
            studentName={student.studentName}
            rollNumber={student.studentRollNumber}
            collegeID={this.collegeID}
            onUpdate={this.toggleUpdateStudentPopUp}
          />
        ))}
        <button onClick={this.toggleAddStudentPopUp}>Add Student</button>
      </div>
    );
  }
}

export default withRouter(ClassPanel);
