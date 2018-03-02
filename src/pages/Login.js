import React, { Component } from "react";
import { Container, Button } from "reactstrap";
import "../css/Login.css";

class Login extends Component {
  render() {
    return (
      <Container className="login-container">
        <Button
          block
          color="primary"
          onClick={this.handleGoogleLogin}
          size="lg"
        >
          {"Login with Google"}
        </Button>
      </Container>
    );
  }
}

export default Login;
