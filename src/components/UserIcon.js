import React, { Component } from "react";
import { Link, withRouter } from "react-router-dom";
import { AUTH, currentUser } from "../utils/wedeploy";
import { Button } from "reactstrap";
import { ROUTES } from "../utils/routes";

class UserIcon extends Component {
  constructor(props) {
    super(props);

    this.handleSignOut = this.handleSignOut.bind(this);
  }

  handleSignOut() {
    AUTH.signOut()
      .then(() => (window.location = ROUTES.LOGIN))
      .catch(err => console.log("error", err));
  }

  render() {
    return currentUser ? (
      <Button onClick={this.handleSignOut}>{"Sign Out"}</Button>
    ) : (
      <Link to={ROUTES.LOGIN}>Login</Link>
    );
  }
}

export default withRouter(UserIcon);
