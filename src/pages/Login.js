import React, { Component } from "react";
import { AUTH } from "../utils/wedeploy";
import { ROUTES } from "../utils/routes";
import { Container, Button } from "reactstrap";
import "../css/Login.css";

class Login extends Component {
  constructor(props) {
    super(props);

    this.handleGoogleLogin = this.handleGoogleLogin.bind(this);
  }

  handleGoogleLogin() {
    const googleProvider = new AUTH.provider.Google();
    googleProvider.setProviderScope("email");

    AUTH.signInWithRedirect(googleProvider);

    AUTH.onSignIn(function(user) {
      this.props.history.push(ROUTES.HOME);
    });
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
