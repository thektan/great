import "../css/UserIcon.css";

import {
  Button,
  DropdownItem,
  DropdownMenu,
  DropdownToggle,
  Input,
  Modal,
  ModalBody,
  ModalFooter,
  ModalHeader,
  UncontrolledDropdown
} from "reactstrap";
import { Link, withRouter } from "react-router-dom";
import React, { Component, Fragment } from "react";

import { AUTH, DATA, currentUser } from "../utils/wedeploy";
import { ROUTES } from "../utils/routes";

class UserIcon extends Component {
  constructor(props) {
    super(props);

    this.state = {
      createTrackModal: false,
      name: ""
    };

    this.handleSignOut = this.handleSignOut.bind(this);
    this.handleCreateTrackModal = this.handleCreateTrackModal.bind(this);
    this.handleNewTrack = this.handleNewTrack.bind(this);
    this.handleInputChange = this.handleInputChange.bind(this);
  }

  handleSignOut() {
    AUTH.signOut()
      .then(() => (window.location = ROUTES.LOGIN))
      .catch(err => console.log("error", err));
  }

  /**
   * Updates the input value state.
   * https://reactjs.org/docs/forms.html
   */
  handleInputChange(event) {
    const target = event.target;
    const value = target.type === "checkbox" ? target.checked : target.value;
    const name = target.name;

    this.setState({
      [name]: value
    });
  }

  handleCreateTrackModal() {
    this.setState({
      createTrackModal: !this.state.createTrackModal
    });
  }

  /**
   * Creates a new track.
   */
  handleNewTrack(event) {
    event.preventDefault();

    const { name } = this.state;

    DATA.create("tracks", { userId: currentUser.id, name: name })
      .then(response => {
        console.log("Successfully saved", response);

        this.setState({
          name: "",
          createTrackModal: false
        });
      })
      .catch(err => {
        console.log("Error", err);
      });
  }

  render() {
    return currentUser ? (
      <Fragment>
        <UncontrolledDropdown className="more-menu">
          <DropdownToggle color="link" caret={false} size="sm">
            <div
              className="avatar"
              style={{ backgroundImage: `url(${currentUser.photoUrl})` }}
            />
          </DropdownToggle>
          <DropdownMenu right>
            <DropdownItem onClick={this.handleCreateTrackModal}>
              {"Create new track"}
            </DropdownItem>
            <DropdownItem divider />
            <DropdownItem onClick={this.handleSignOut}>
              {"Sign Out"}
            </DropdownItem>
          </DropdownMenu>
        </UncontrolledDropdown>

        <Modal
          isOpen={this.state.createTrackModal}
          toggle={this.handleCreateTrackModal}
        >
          <ModalHeader toggle={this.handleCreateTrackModal}>
            {"Create new track"}
          </ModalHeader>
          <ModalBody>
            <Input
              className="mr-2"
              type="text"
              name="name"
              placeholder="Track name"
              value={this.state.name}
              onChange={this.handleInputChange}
              required
            />
          </ModalBody>
          <ModalFooter>
            <Button color="link" onClick={this.handleCreateTrackModal}>
              {"Cancel"}
            </Button>{" "}
            <Button color="primary" onClick={this.handleNewTrack}>
              {"Create track"}
            </Button>
          </ModalFooter>
        </Modal>
      </Fragment>
    ) : (
      <Link to={ROUTES.LOGIN}>Login</Link>
    );
  }
}

export default withRouter(UserIcon);
