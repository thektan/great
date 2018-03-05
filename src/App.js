import React, { Component } from "react";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Unknown from "./pages/Unknown";
import Navbar from "./components/Navbar";
import { currentUser } from "./utils/wedeploy";
import { Container } from "reactstrap";
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
        <Container className="app-container w-50">
          <Navbar />

          <Switch>
            <PrivateRoute exact path={ROUTES.HOME} component={Home} />

            <Route path={ROUTES.LOGIN} component={Login} />

            <Route component={Unknown} />
          </Switch>
        </Container>
      </Router>
    );
  }
}

export default App;
