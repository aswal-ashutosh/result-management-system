import React from "react";
import Navbar from "../../components/navbar/Navbar";
import PopUp from "../../components/pop_up/PopUp";
import {
  getCollegeName,
  getCollegeID,
  firestore,
  signOutRms,
  userExist,
  currentUserEmail,
} from "../../services/firebase";
import "../admin_panel/AdminPanel.css";
import { collection, onSnapshot } from "@firebase/firestore";
import ClassForm from "../../components/class_form/ClassForm";
import { withRouter } from "react-router-dom";
import Alert from "@mui/material/Alert";
import ClassCard from "../../components/class_card/ClassCard";

class AdminPanel extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      collegeName: null,
      collegeID: null,
      popUp: false,
      classes: [],
    };
    this.unsubscribe = null;
    this.togglePopUp = this.togglePopUp.bind(this);
    this.signOut = this.signOut.bind(this);
  }

  togglePopUp() {
    if (userExist()) this.setState({ popUp: !this.state.popUp });
    else this.props.history.push("/");
  }

  async componentDidMount() {
    if(userExist() === false){
      alert('Sign In Required.')
      this.props.history.push("/");
      return;
    }
    const collegeID = await getCollegeID(currentUserEmail());
    const collegeName = await getCollegeName(collegeID);
    this.setState({ collegeName: collegeName, collegeID: collegeID });

    this.unsubscribe = await onSnapshot(
      collection(firestore, "college", collegeID.toString(), "classes"),
      (snapshot) => {
        const docs = snapshot.docs;

        if (docs.length === 0) return;

        const classes = [];
        docs.forEach((doc) => {
          classes.push(doc.data()["class-name"]);
        });
        this.setState({ classes: classes });
      },
      (error) => {
        alert("Error(AdminPanel): " + error.message);
      }
    );
  }

  componentWillUnmount() {
    if(this.unsubscribe !== null)
      this.unsubscribe();
  }

  async signOut() {
    if (userExist()) {
      await signOutRms();
    }
    this.props.history.push("/");
  }

  render() {
    return (
      <div id="AdminPanel">
        <Navbar
          heading={this.state.collegeName}
          subHeading={`College ID (${this.state.collegeID})`}
          button={{ text: "Sign Out", onClick: this.signOut }}
        />

        {this.state.popUp && (
          <PopUp closePopUp={this.togglePopUp}>
            <ClassForm
              collegeID={this.state.collegeID}
              closePopUp={this.togglePopUp}
            />
          </PopUp>
        )}
        {this.state.classes.length === 0 ? (
          <Alert severity="info" sx={{ margin: "2.5% 1.0%" }}>
            No classes created yet!
          </Alert>
        ) : (
          <h3>AVAILABLE CLASSES</h3>
        )}
        {this.state.classes.map((className, index) => (
          <ClassCard
            key={index}
            className={className}
            collegeID={this.state.collegeID}
            index={index}
          />
        ))}
        <button onClick={this.togglePopUp}>Create Class</button>
      </div>
    );
  }
}

export default withRouter(AdminPanel);
