import React from "react";
import "../admin_login_form/AdminLoginForm.css";
import {
  signIn,
  signUp,
  registerCollege,
  isValidCollegeID,
  isValidRollNumber,
} from "../../services/firebase.js";
import Box from "@mui/material/Box";
import LinearProgress from "@mui/material/LinearProgress";
import ToggleButton from "@mui/material/ToggleButton";
import ToggleButtonGroup from "@mui/material/ToggleButtonGroup";
import { Alert } from "@mui/material";

class AdminLoginForm extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      emailInput: "",
      passwordInput: "",
      collegeInput: "",
      collegeIDInput: "",
      rollNumberInput: "",
      toggleButtonId: "sign_in",
      alertMessage: "",
      alert: false,
      error: false,
      loading: false,
    };

    this.handleEmailInput = this.handleEmailInput.bind(this);
    this.handlePasswordInput = this.handlePasswordInput.bind(this);
    this.handleCollegeInput = this.handleCollegeInput.bind(this);
    this.handleCollegeIDInput = this.handleCollegeIDInput.bind(this);
    this.handleRollNumberInput = this.handleRollNumberInput.bind(this);
    this.handleSingIn = this.handleSingIn.bind(this);
    this.handleSingUp = this.handleSingUp.bind(this);
    this.handleGetResult = this.handleGetResult.bind(this);
    this.handleToggleButtonChange = this.handleToggleButtonChange.bind(this);
  }

  handleEmailInput(event) {
    this.setState({ emailInput: event.target.value });
  }

  handlePasswordInput(event) {
    this.setState({ passwordInput: event.target.value });
  }

  handleCollegeIDInput(event) {
    this.setState({ collegeIDInput: event.target.value });
  }

  handleRollNumberInput(event) {
    this.setState({ rollNumberInput: event.target.value });
  }

  handleToggleButtonChange(event) {
    this.setState({ toggleButtonId: event.target.value });
    this.clearAlert();
  }

  handleCollegeInput(event) {
    this.setState({ collegeInput: event.target.value });
  }

  clearAlert() {
    this.setState({ alert: false });
  }

  showAlert(message, error = true) {
    this.setState({ alert: true, error: error, alertMessage: message });
  }

  validateEmailAndPassword() {
    if (
      this.state.emailInput.length !== 0 &&
      this.state.passwordInput.length !== 0
    )
      return true;

    if (this.state.emailInput.length === 0)
      this.showAlert("Email can't be empty!");
    else if (this.state.passwordInput.length === 0)
      this.showAlert("Password can't be empty!");
    return false;
  }

  validateCollege() {
    if (this.state.collegeInput.length !== 0) return true;
    this.showAlert("College name can't be empty!");
    return false;
  }

  async handleSingIn() {
    this.clearAlert();
    this.setState({ loading: true });

    if (this.validateEmailAndPassword()) {
      await signIn(this.state.emailInput, this.state.passwordInput)
        .then(() => {
          this.setState({ loading: false, emailInput: "", passwordInput: "" });
          this.showAlert("Signed In.", false);
          this.props.history.push("/adminPanel");
        })
        .catch((error) => {
          this.setState({ loading: false });
          switch (error.code) {
            case "auth/invalid-email":
              this.showAlert("Invalid email!");
              break;
            case "auth/wrong-password":
              this.showAlert("Wrong password!");
              break;
            case "auth/user-not-found":
              this.showAlert("User not found!");
              break;
            default:
              alert(error.message);
              this.showAlert("Something went wrong!");
          }
        });
    } else {
      this.setState({ loading: false });
    }
  }

  async handleSingUp() {
    this.clearAlert();
    this.setState({ loading: true });

    if (this.validateEmailAndPassword() && this.validateCollege()) {
      await signUp(this.state.emailInput, this.state.passwordInput)
        .then(async () => {
          await registerCollege(this.state.emailInput, this.state.collegeInput);
          this.setState({
            emailInput: "",
            passwordInput: "",
            collegeInput: "",
            loading: false,
          });
          this.showAlert("Account created successfully.", false);
        })
        .catch((error) => {
          this.setState({ loading: false });
          switch (error.code) {
            case "auth/invalid-email":
              this.showAlert("Invalid email!");
              break;
            case "auth/email-already-in-use":
              this.showAlert("Email already in use!");
              break;
            case "auth/weak-password":
              this.showAlert("Password must be 6 characters long!");
              break;
            default:
              alert(error.message);
              this.showAlert("Something went wrong!");
          }
        });
    } else {
      this.setState({ loading: false });
    }
  }

  async validateStudentDetails() {
    if (this.state.collegeIDInput.length === 0) {
      this.showAlert("College ID can't be empty!");
      return false;
    }

    if (this.state.rollNumberInput.length === 0) {
      this.showAlert("Roll Number can't be empty!");
      return false;
    }

    if (!(await isValidCollegeID(this.state.collegeIDInput))) {
      this.showAlert("Provided college ID doesn't exist!");
      return false;
    }

    if (
      !(await isValidRollNumber(
        this.state.collegeIDInput,
        this.state.rollNumberInput
      ))
    ) {
      this.showAlert("Wrong Roll Number!");
      return false;
    }
    return true;
  }

  async handleGetResult() {
    this.setState({ loading: true });
    if (await this.validateStudentDetails()) {
      this.setState({ loading: false, alert: false });
      this.props.history.push("/studentResult", {
        collegeID: this.state.collegeIDInput,
        rollNumber: this.state.rollNumberInput,
      });
    }
    this.setState({ loading: false });
  }

  renderButton(id) {
    switch (id) {
      case "sign_in":
        return (
          <button className="formBtn" onClick={this.handleSingIn}>
            Sign In
          </button>
        );
      case "sign_up":
        return (
          <button className="formBtn" onClick={this.handleSingUp}>
            Sign Up
          </button>
        );
      default:
        return (
          <button className="formBtn" onClick={this.handleGetResult}>
            Get Result
          </button>
        );
    }
  }

  render() {
    return (
      <div id="AdminFormContainer">
        <h1>Welcome</h1>
        <ToggleButtonGroup
          color="primary"
          value={this.state.toggleButtonId}
          exclusive
          onChange={this.handleToggleButtonChange}
        >
          <ToggleButton value="sign_in">Sign In</ToggleButton>
          <ToggleButton value="sign_up">Sign Up</ToggleButton>
          <ToggleButton value="students">Students</ToggleButton>
        </ToggleButtonGroup>
        <div className="LoginForm">
          {this.state.toggleButtonId !== "students" ? (
            <div>
              {this.state.toggleButtonId === "sign_up" ? (
                <input
                  id="collegeInput"
                  type="text"
                  value={this.state.collegeInput}
                  onChange={this.handleCollegeInput}
                  placeholder="College Name"
                />
              ) : null}
              <input
                type="text"
                value={this.state.emailInput}
                onChange={this.handleEmailInput}
                placeholder="Enter your email"
              />
              <input
                type="password"
                value={this.state.passwordInput}
                onChange={this.handlePasswordInput}
                placeholder="Password"
              />
            </div>
          ) : (
            <div>
              <input
                type="text"
                value={this.state.collegeIDInput}
                onChange={this.handleCollegeIDInput}
                placeholder="College ID"
              />
              <input
                type="text"
                value={this.state.rollNumberInput}
                onChange={this.handleRollNumberInput}
                placeholder="Roll Number"
              />
            </div>
          )}

          {this.renderButton(this.state.toggleButtonId)}
        </div>
        {this.state.loading ? (
          <Box sx={{ marginTop: "2.5%" }}>
            <LinearProgress />
          </Box>
        ) : null}

        {this.state.alert && (
          <Alert
            severity={this.state.error ? "error" : "success"}
            sx={{ margin: "1.5% 0" }}
          >
            {this.state.alertMessage}
          </Alert>
        )}
      </div>
    );
  }
}

export default AdminLoginForm;
