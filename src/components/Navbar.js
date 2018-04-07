import { Link } from "react-router-dom";
import { Navbar as RsNavbar, Nav, NavItem } from "reactstrap";
import React, { Component } from "react";

import { ROUTES } from "../utils/routes";
import UserIcon from "./UserIcon";

class Navbar extends Component {
  render() {
    return (
      <RsNavbar className="navbar-root" color="faded" light>
        <Link className="navbar-brand" to={ROUTES.HOME}>
          <strong>{"👍 GREAT!"}</strong>
        </Link>

        <Nav navbar>
          <NavItem>
            <UserIcon />
          </NavItem>
        </Nav>
      </RsNavbar>
    );
  }
}

export default Navbar;
