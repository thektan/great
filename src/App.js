import React, { Component, Fragment } from "react";
import "./App.css";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Unknown from "./pages/Unknown";
import UserIcon from "./components/UserIcon";
import { currentUser } from "./utils/wedeploy";
import { ROUTES } from "./utils/routes";
import {
  BrowserRouter as Router,
  Route,
  Redirect,
  Switch
} from "react-router-dom";

const PrivateRoute = ({ component: Component, ...otherProps }) => {
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
          <UserIcon />

          <Switch>
            <PrivateRoute exact path={ROUTES.HOME} component={Home} />

            <Route path={ROUTES.LOGIN} component={Login} />

            <Route component={Unknown} />
          </Switch>
        </Fragment>
      </Router>
    );
  }
}

export default App;
