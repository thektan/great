import React, { Component } from "react";
import UserIcon from "./UserIcon";
import { ROUTES } from "../utils/routes";
import { Navbar as RsNavbar, Nav, NavItem, NavbarBrand } from "reactstrap";

class Navbar extends Component {
  render() {
    return (
      <RsNavbar color="faded" light>
        <NavbarBrand href={ROUTES.HOME}>
          <strong>{"👍 GREAT!"}</strong>
        </NavbarBrand>

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
