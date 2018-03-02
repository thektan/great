import React, { Component, Fragment } from "react";
import logo from "./logo.svg";
import "./App.css";
import Home from "./pages/Home";
import Login from "./pages/Login";
import { BrowserRouter as Router, Route, Link } from "react-router-dom";

class App extends Component {
  render() {
    return (
      <Router>
        <Fragment>
          <Link to="/">Home</Link>

          <Link to="/login">Log In</Link>

          <Route exact path="/" component={Home} />

          <Route path="/login" component={Login} />
        </Fragment>
      </Router>
    );
  }
}

export default App;
