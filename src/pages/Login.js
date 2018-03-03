import React, { Component } from "react";
import WeDeploy from "wedeploy";
import { Container, Button } from "reactstrap";
import "../css/Login.css";

class Login extends Component {
  constructor(props) {
    super(props);

    this.handleGoogleLogin = this.handleGoogleLogin.bind(this);
  }

  handleGoogleLogin() {
    console.log("hi");
  }

  render() {
    return (
      <Container className="login-container">
        <div>
          <h1 className="login-message">{"Great to see you! 👋"}</h1>

          <Button
            block
            color="primary"
            onClick={this.handleGoogleLogin}
            size="lg"
          >
            {"Login with Google"}
          </Button>
        </div>
      </Container>
    );
  }
}

export default Login;
