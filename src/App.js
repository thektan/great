import React, { Component, Fragment } from "react";
import "./App.css";
import Home from "./pages/Home";
import Login from "./pages/Login";
import WeDeploy from "wedeploy";
import { ROUTES } from "./utils/routes";
import { BrowserRouter as Router, Route, Redirect } from "react-router-dom";

const PrivateRoute = ({ component: Component, ...otherProps }) => {
  const { currentUser } = WeDeploy.auth("https://auth-great.wedeploy.io");

  return (
    <Route
      {...otherProps}
      render={props =>
        currentUser ? (
          <Component {...props} />
        ) : (
          <Redirect
            to={{
              pathname: ROUTES.LOGIN,
              state: { from: props.location }
            }}
          />
        )
      }
    />
  );
};

class App extends Component {
  render() {
    return (
      <Router>
        <Fragment>
          <PrivateRoute exact path="/" component={Home} />

          <Route path={ROUTES.LOGIN} component={Login} />
        </Fragment>
      </Router>
    );
  }
}

export default App;
